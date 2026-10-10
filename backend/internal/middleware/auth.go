package middleware

import (
	"github.com/gofiber/fiber/v3"
	"github.com/kemenag/inklusi-backend/internal/auth"
	"github.com/kemenag/inklusi-backend/internal/config"
)

// CtxUserKey is the Fiber context key holding the authenticated Claims.
const CtxUserKey = "sessionUser"

// RequireSession validates the session (cookie or Authorization Bearer) and injects user claims into context.
func RequireSession(cfg *config.Config) fiber.Handler {
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

// RequireAdmin ensures the authenticated user is allowed to access the admin area
// (super_admin, admin, or editor).
func RequireAdmin(cfg *config.Config) fiber.Handler {
	return func(c fiber.Ctx) error {
		user := CurrentUser(c)
		if user == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthenticated"})
		}

		// super_admin, admin, or editor allows admin CMS access.
		if user.Role == "super_admin" || user.Role == "admin" || user.Role == "editor" {
			return c.Next()
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "unauthorized"})
	}
}
