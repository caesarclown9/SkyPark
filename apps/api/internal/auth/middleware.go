package auth

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type AuthMiddleware struct {
	tokenManager *TokenManager
}

func NewAuthMiddleware(tokenManager *TokenManager) *AuthMiddleware {
	return &AuthMiddleware{
		tokenManager: tokenManager,
	}
}

// AuthRequired middleware для проверки JWT токена
func (am *AuthMiddleware) AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": map[string]interface{}{
					"code":    "AUTH_REQUIRED",
					"message": "Authorization header is required",
				},
			})
			c.Abort()
			return
		}

		// Bearer token format: "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": map[string]interface{}{
					"code":    "INVALID_TOKEN_FORMAT",
					"message": "Invalid authorization header format",
				},
			})
			c.Abort()
			return
		}

		token := parts[1]
		claims, err := am.tokenManager.ValidateToken(token)
		if err != nil {
			var errorCode string
			var message string
			
			switch err {
			case ErrExpiredToken:
				errorCode = "TOKEN_EXPIRED"
				message = "Token has expired"
			case ErrInvalidToken:
				errorCode = "INVALID_TOKEN"
				message = "Invalid token"
			default:
				errorCode = "AUTH_ERROR"
				message = "Authentication error"
			}

			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": map[string]interface{}{
					"code":    errorCode,
					"message": message,
				},
			})
			c.Abort()
			return
		}

		// Проверяем что это access токен
		if claims.Type != "access" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": map[string]interface{}{
					"code":    "INVALID_TOKEN_TYPE",
					"message": "Access token required",
				},
			})
			c.Abort()
			return
		}

		// Сохраняем информацию о пользователе в контексте
		c.Set("user_id", claims.UserID)
		c.Set("user_phone", claims.Phone)
		c.Set("user_role", claims.Role)
		c.Set("token_claims", claims)

		c.Next()
	}
}

// RequireRole middleware для проверки роли пользователя
func (am *AuthMiddleware) RequireRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"error": map[string]interface{}{
					"code":    "NO_ROLE_INFO",
					"message": "User role information not found",
				},
			})
			c.Abort()
			return
		}

		role := userRole.(string)
		for _, allowedRole := range allowedRoles {
			if role == allowedRole {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"error": map[string]interface{}{
				"code":    "INSUFFICIENT_PERMISSIONS",
				"message": "Insufficient permissions for this action",
				"required_roles": allowedRoles,
				"user_role": role,
			},
		})
		c.Abort()
	}
}

// AdminOnly middleware для действий только для администраторов
func (am *AuthMiddleware) AdminOnly() gin.HandlerFunc {
	return am.RequireRole("admin", "super_admin")
}

// ManagerOrAdmin middleware для менеджеров и администраторов
func (am *AuthMiddleware) ManagerOrAdmin() gin.HandlerFunc {
	return am.RequireRole("manager", "admin", "super_admin")
}

// OptionalAuth middleware для опциональной аутентификации
func (am *AuthMiddleware) OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.Next()
			return
		}

		token := parts[1]
		claims, err := am.tokenManager.ValidateToken(token)
		if err == nil && claims.Type == "access" {
			c.Set("user_id", claims.UserID)
			c.Set("user_phone", claims.Phone)
			c.Set("user_role", claims.Role)
			c.Set("token_claims", claims)
		}

		c.Next()
	}
} 
 