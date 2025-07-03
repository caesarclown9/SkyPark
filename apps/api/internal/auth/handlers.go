package auth

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	
	"skypark/internal/models"
)

type AuthHandlers struct {
	db           *gorm.DB
	tokenManager *TokenManager
	smsService   *SMSService
}

func NewAuthHandlers(db *gorm.DB, tokenManager *TokenManager, smsService *SMSService) *AuthHandlers {
	return &AuthHandlers{
		db:           db,
		tokenManager: tokenManager,
		smsService:   smsService,
	}
}

// SendSMSCode отправляет SMS код на номер
func (h *AuthHandlers) SendSMSCode(c *gin.Context) {
	var req struct {
		Phone string `json:"phone" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": map[string]interface{}{
				"code":    "INVALID_REQUEST",
				"message": "Invalid request format",
				"details": err.Error(),
			},
		})
		return
	}

	smsCode, err := h.smsService.SendVerificationCode(req.Phone)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": map[string]interface{}{
				"code":    "SMS_SEND_FAILED",
				"message": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": map[string]interface{}{
			"phone":            smsCode.Phone,
			"expires_at":       smsCode.ExpiresAt,
			"remaining_attempts": h.smsService.GetRemainingAttempts(req.Phone),
		},
		"message": "SMS verification code sent successfully",
	})
}

// VerifyAndLogin проверяет SMS код и выполняет вход/регистрацию
func (h *AuthHandlers) VerifyAndLogin(c *gin.Context) {
	var req struct {
		Phone        string `json:"phone" binding:"required"`
		Code         string `json:"code" binding:"required"`
		FirstName    string `json:"first_name,omitempty"`
		LastName     string `json:"last_name,omitempty"`
		Email        string `json:"email,omitempty"`
		DateOfBirth  string `json:"date_of_birth,omitempty"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": map[string]interface{}{
				"code":    "INVALID_REQUEST",
				"message": "Invalid request format",
				"details": err.Error(),
			},
		})
		return
	}

	// Проверяем SMS код
	valid, err := h.smsService.VerifyCode(req.Phone, req.Code)
	if err != nil || !valid {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": map[string]interface{}{
				"code":    "INVALID_SMS_CODE",
				"message": "Invalid or expired SMS code",
				"remaining_attempts": h.smsService.GetRemainingAttempts(req.Phone),
			},
		})
		return
	}

	// Ищем существующего пользователя
	var user models.User
	result := h.db.Where("phone_number = ? AND deleted_at IS NULL", req.Phone).First(&user)
	
	if result.Error == gorm.ErrRecordNotFound {
		// Регистрируем нового пользователя
		var email *string
		if req.Email != "" {
			email = &req.Email
		}
		
		user = models.User{
			PhoneNumber:      req.Phone,
			FirstName:        req.FirstName,
			LastName:         req.LastName,
			Email:            email,
			Role:             models.UserRoleCustomer,
			Status:           models.UserStatusActive,
			IsPhoneVerified:  true,
			LoyaltyTier:      models.LoyaltyTierBeginner,
		}

		// Парсим дату рождения если указана
		if req.DateOfBirth != "" {
			if dob, err := time.Parse("2006-01-02", req.DateOfBirth); err == nil {
				user.DateOfBirth = &dob
			}
		}

		if err := h.db.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error": map[string]interface{}{
					"code":    "USER_CREATION_FAILED",
					"message": "Failed to create user account",
				},
			})
			return
		}
	} else if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": map[string]interface{}{
				"code":    "DATABASE_ERROR",
				"message": "Database error occurred",
			},
		})
		return
	}

	// Проверяем статус пользователя
	if user.Status != models.UserStatusActive {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"error": map[string]interface{}{
				"code":    "ACCOUNT_SUSPENDED",
				"message": "Your account has been suspended",
			},
		})
		return
	}

	// Генерируем токены
	accessToken, err := h.tokenManager.GenerateAccessToken(user.ID, user.PhoneNumber, string(user.Role))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": map[string]interface{}{
				"code":    "TOKEN_GENERATION_FAILED",
				"message": "Failed to generate access token",
			},
		})
		return
	}

	refreshToken, err := h.tokenManager.GenerateRefreshToken(user.ID, user.PhoneNumber, string(user.Role))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": map[string]interface{}{
				"code":    "TOKEN_GENERATION_FAILED",
				"message": "Failed to generate refresh token",
			},
		})
		return
	}

	// Обновляем последний вход
	h.db.Model(&user).Update("last_login_at", time.Now())

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": map[string]interface{}{
			"user": map[string]interface{}{
				"id":             user.ID,
				"phone":          user.PhoneNumber,
				"first_name":     user.FirstName,
				"last_name":      user.LastName,
				"email":          user.Email,
				"role":           user.Role,
				"loyalty_tier":   user.LoyaltyTier,
				"is_verified":    user.IsPhoneVerified,
				"created_at":     user.CreatedAt,
			},
			"tokens": map[string]interface{}{
				"access_token":  accessToken,
				"refresh_token": refreshToken,
				"token_type":    "Bearer",
			},
		},
		"message": "Authentication successful",
	})
}

// RefreshToken обновляет access token
func (h *AuthHandlers) RefreshToken(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": map[string]interface{}{
				"code":    "INVALID_REQUEST",
				"message": "Invalid request format",
			},
		})
		return
	}

	accessToken, refreshToken, err := h.tokenManager.RefreshTokens(req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error": map[string]interface{}{
				"code":    "TOKEN_REFRESH_FAILED",
				"message": "Failed to refresh token",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": map[string]interface{}{
			"access_token":  accessToken,
			"refresh_token": refreshToken,
			"token_type":    "Bearer",
		},
		"message": "Token refreshed successfully",
	})
}

// GetProfile возвращает профиль текущего пользователя
func (h *AuthHandlers) GetProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error": map[string]interface{}{
				"code":    "UNAUTHORIZED",
				"message": "User not authenticated",
			},
		})
		return
	}

	var user models.User
	if err := h.db.Where("id = ? AND deleted_at IS NULL", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error": map[string]interface{}{
				"code":    "USER_NOT_FOUND",
				"message": "User not found",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": map[string]interface{}{
			"id":            user.ID,
			"phone":         user.PhoneNumber,
			"first_name":    user.FirstName,
			"last_name":     user.LastName,
			"email":         user.Email,
			"date_of_birth": user.DateOfBirth,
			"role":          user.Role,
			"loyalty_tier":  user.LoyaltyTier,
			"loyalty_points": user.LoyaltyPoints,
			"is_verified":   user.IsPhoneVerified,
			"created_at":    user.CreatedAt,
			"last_login_at": user.LastLoginAt,
		},
	})
}

// UpdateProfile обновляет профиль пользователя
func (h *AuthHandlers) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error": map[string]interface{}{
				"code":    "UNAUTHORIZED",
				"message": "User not authenticated",
			},
		})
		return
	}

	var req struct {
		FirstName   string `json:"first_name,omitempty"`
		LastName    string `json:"last_name,omitempty"`
		Email       string `json:"email,omitempty"`
		DateOfBirth string `json:"date_of_birth,omitempty"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": map[string]interface{}{
				"code":    "INVALID_REQUEST",
				"message": "Invalid request format",
			},
		})
		return
	}

	var user models.User
	if err := h.db.Where("id = ? AND deleted_at IS NULL", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error": map[string]interface{}{
				"code":    "USER_NOT_FOUND",
				"message": "User not found",
			},
		})
		return
	}

	// Обновляем поля
	updates := map[string]interface{}{
		"updated_at": time.Now(),
	}

	if req.FirstName != "" {
		updates["first_name"] = req.FirstName
	}
	if req.LastName != "" {
		updates["last_name"] = req.LastName
	}
	if req.Email != "" {
		updates["email"] = req.Email
	}
	if req.DateOfBirth != "" {
		if dob, err := time.Parse("2006-01-02", req.DateOfBirth); err == nil {
			updates["date_of_birth"] = dob
		}
	}

	if err := h.db.Model(&user).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": map[string]interface{}{
				"code":    "UPDATE_FAILED",
				"message": "Failed to update profile",
			},
		})
		return
	}

	// Получаем обновленного пользователя
	h.db.First(&user, userID)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": map[string]interface{}{
			"id":            user.ID,
			"phone":         user.PhoneNumber,
			"first_name":    user.FirstName,
			"last_name":     user.LastName,
			"email":         user.Email,
			"date_of_birth": user.DateOfBirth,
			"role":          user.Role,
			"loyalty_tier":  user.LoyaltyTier,
			"loyalty_points": user.LoyaltyPoints,
			"updated_at":    user.UpdatedAt,
		},
		"message": "Profile updated successfully",
	})
} 
