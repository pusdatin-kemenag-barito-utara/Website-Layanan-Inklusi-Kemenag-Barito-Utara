package auth

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const sessionSecretVar = "SESSION_SECRET"

// Claims represents the JWT session payload for authenticated users.
type Claims struct {
	UserID   string `json:"user_id"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

func secret() ([]byte, error) {
	s := os.Getenv(sessionSecretVar)
	if s == "" {
		return nil, errors.New("SESSION_SECRET wajib disetel pada environment (Infisical)")
	}
	return []byte(s), nil
}

// GenerateToken signs a session JWT with the provided identity.
func GenerateToken(userID, email, role string, ttl time.Duration) (string, error) {
	sec, err := secret()
	if err != nil {
		return "", err
	}
	now := time.Now()
	claims := Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(ttl)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(sec)
}

// ParseToken validates and decodes a session JWT.
func ParseToken(tokenString string) (*Claims, error) {
	sec, err := secret()
	if err != nil {
		return nil, err
	}
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return sec, nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}

