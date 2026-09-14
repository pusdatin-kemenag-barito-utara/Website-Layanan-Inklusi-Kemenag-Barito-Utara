package middleware

import (
	"context"
	"errors"

	"github.com/gofiber/fiber/v3"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kemenag/inklusi-backend/internal/auth"
	"github.com/kemenag/inklusi-backend/internal/config"
)

var errNoRows = errors.New("no rows in result set")

// CtxUserKey is the Fiber context key holding the authenticated Claims.
const CtxUserKey = "sessionUser"

// RequireSession validates the session (cookie or Authorization Bearer) and injects user claims into context.
func RequireSession(cfg *config.Config, _ *pgxpool.Pool) fiber.Handler {
	return func(c fiber.Ctx) error {
		token := c.Cookies(cfg.SessionCookieName)

		// Support Authorization: Bearer <jwt> as an alternative to cookies.
		if token == "" {
			token = bearerToken(c)
		}
		if token == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "unauthenticated",
			})
		}

		claims, err := auth.ParseToken(token)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "invalid session",
			})
		}

		c.Locals(CtxUserKey, claims)
		return c.Next()
	}
}

func bearerToken(c fiber.Ctx) string {
	h := c.Get("Authorization")
	const prefix = "Bearer "
	if len(h) > len(prefix) && h[:len(prefix)] == prefix {
		return h[len(prefix):]
	}
	return ""
}

// CurrentUser returns the authenticated Claims from the context, or nil.
func CurrentUser(c fiber.Ctx) *auth.Claims {
	v, ok := c.Locals(CtxUserKey).(*auth.Claims)
	if !ok {
		return nil
	}
	return v
}

// RequireAdmin ensures the authenticated user is allowed to access this app
// (super_admin or a user with a valid app_permissions role).
func RequireAdmin(cfg *config.Config, db *pgxpool.Pool) fiber.Handler {
	return func(c fiber.Ctx) error {
		user := CurrentUser(c)
		if user == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthenticated"})
		}

		// super_admin bypasses app-specific permission.
		if user.Role == "super_admin" {
			return c.Next()
		}

		ok, err := HasAppPermission(c.Context(), db, user.UserID, cfg.AppID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "rbac check failed"})
		}
		if !ok {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "unauthorized"})
		}

		return c.Next()
	}
}

// HasAppPermission checks the central pusdatin schema for a user's role in the app.
func HasAppPermission(ctx context.Context, db *pgxpool.Pool, userID, appID string) (bool, error) {
	const query = `
		SELECT role FROM kemenag_pusdatin.app_permissions
		WHERE user_id = $1 AND app_id = $2
		LIMIT 1
	`
	var role string
	err := db.QueryRow(ctx, query, userID, appID).Scan(&role)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return false, nil
		}
		return false, err
	}
	return role != "none", nil
}
