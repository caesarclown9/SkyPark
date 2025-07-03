package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

var (
	ErrInvalidToken = errors.New("invalid token")
	ErrExpiredToken = errors.New("token has expired")
)

type TokenClaims struct {
	UserID   uuid.UUID `json:"user_id"`
	Phone    string    `json:"phone"`
	Role     string    `json:"role"`
	Type     string    `json:"type"` // "access" or "refresh"
	jwt.RegisteredClaims
}

type TokenManager struct {
	secretKey       string
	accessTokenTTL  time.Duration
	refreshTokenTTL time.Duration
}

func NewTokenManager(secretKey string, accessTTL, refreshTTL time.Duration) *TokenManager {
	return &TokenManager{
		secretKey:       secretKey,
		accessTokenTTL:  accessTTL,
		refreshTokenTTL: refreshTTL,
	}
}

func (tm *TokenManager) GenerateAccessToken(userID uuid.UUID, phone, role string) (string, error) {
	return tm.generateToken(userID, phone, role, "access", tm.accessTokenTTL)
}

func (tm *TokenManager) GenerateRefreshToken(userID uuid.UUID, phone, role string) (string, error) {
	return tm.generateToken(userID, phone, role, "refresh", tm.refreshTokenTTL)
}

func (tm *TokenManager) generateToken(userID uuid.UUID, phone, role, tokenType string, ttl time.Duration) (string, error) {
	now := time.Now()
	claims := TokenClaims{
		UserID: userID,
		Phone:  phone,
		Role:   role,
		Type:   tokenType,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(ttl)),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			Subject:   userID.String(),
			Issuer:    "skypark-api",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(tm.secretKey))
}

func (tm *TokenManager) ValidateToken(tokenString string) (*TokenClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &TokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(tm.secretKey), nil
	})

	if err != nil {
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(*TokenClaims)
	if !ok || !token.Valid {
		return nil, ErrInvalidToken
	}

	if claims.ExpiresAt.Time.Before(time.Now()) {
		return nil, ErrExpiredToken
	}

	return claims, nil
}

func (tm *TokenManager) RefreshTokens(refreshToken string) (string, string, error) {
	claims, err := tm.ValidateToken(refreshToken)
	if err != nil {
		return "", "", err
	}

	if claims.Type != "refresh" {
		return "", "", ErrInvalidToken
	}

	// Generate new tokens
	accessToken, err := tm.GenerateAccessToken(claims.UserID, claims.Phone, claims.Role)
	if err != nil {
		return "", "", err
	}

	newRefreshToken, err := tm.GenerateRefreshToken(claims.UserID, claims.Phone, claims.Role)
	if err != nil {
		return "", "", err
	}

	return accessToken, newRefreshToken, nil
} 
 