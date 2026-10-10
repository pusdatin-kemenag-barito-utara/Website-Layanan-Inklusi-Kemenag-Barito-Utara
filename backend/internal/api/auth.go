package api

import (
	"regexp"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/limiter"
	"github.com/kemenag/inklusi-backend/internal/auth"
	"github.com/kemenag/inklusi-backend/internal/middleware"
	"github.com/kemenag/inklusi-backend/internal/security"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

// loginRequest is the payload for POST /api/auth/login.
type loginRequest struct {
	Email          string `json:"email"`
	Password       string `json:"password"`
	TurnstileToken string `json:"turnstileToken"`
}

func registerAuthRoutes(g fiber.Router, deps *Dependencies) {
	loginLimiter := limiter.New(limiter.Config{
		Max:        5,
		Expiration: 1 * time.Minute,
		LimitReached: func(c fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "Terlalu banyak percobaan masuk. Mohon tunggu 1 menit demi keamanan sistem.",
			})
		},
	})

	g.Post("/auth/login", loginLimiter, deps.login)
	g.Post("/auth/logout", deps.logout)
	g.Get("/auth/me", requireAuth(deps), deps.me)
}

// me returns the profile of the authenticated user.
func (d *Dependencies) me(c fiber.Ctx) error {
	claims := middleware.CurrentUser(c)
	if claims == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthenticated"})
	}
	return c.JSON(fiber.Map{
		"id":    claims.UserID,
		"email": claims.Email,
		"role":  claims.Role,
	})
}

// login authenticates the user against PocketBase Auth, validates role, and issues a session cookie.
func (d *Dependencies) login(c fiber.Ctx) error {
	var req loginRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	// 1. Sanitize and validate input against injection & XSS
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	if len(req.Email) < 5 || len(req.Email) > 100 || !emailRegex.MatchString(req.Email) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Format email tidak valid atau tidak diizinkan"})
	}
	if len(req.Password) == 0 || len(req.Password) > 128 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Kata sandi tidak valid"})
	}

	// 2. Verify Turnstile server-side if configured in environment
	if d.Config.TurnstileSecret != "" {
		if req.TurnstileToken == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Verifikasi keamanan diperlukan"})
		}
		ok, err := security.VerifyTurnstile(d.Config.TurnstileSecret, req.TurnstileToken, c.IP())
		if err != nil {
			return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{"error": "Terjadi kesalahan sistem saat memverifikasi keamanan"})
		}
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Verifikasi keamanan gagal. Silakan coba lagi."})
		}
	}

	// 2. PocketBase Auth sign-in
	pbAuth, err := d.PB.AuthWithPassword(c.Context(), "users", req.Email, req.Password)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Email atau password salah"})
	}

	role := pbAuth.Record.Role
	if role == "" {
		role = "user"
	}

	// 3. Issue session JWT + cookie
	token, err := auth.GenerateToken(pbAuth.Record.ID, pbAuth.Record.Email, role, 24*time.Hour)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create session"})
	}

	c.Cookie(&fiber.Cookie{
		Name:     d.Config.SessionCookieName,
		Value:    token,
		Path:     "/",
		HTTPOnly: true,
		Secure:   d.Config.SessionCookieSecure,
		SameSite: fiber.CookieSameSiteLaxMode,
		MaxAge:   int(24 * time.Hour / time.Second),
	})

	return c.JSON(fiber.Map{"success": true, "role": role})
}

// logout clears the session cookie permanently from the browser.
func (d *Dependencies) logout(c fiber.Ctx) error {
	c.Cookie(&fiber.Cookie{
		Name:     d.Config.SessionCookieName,
		Value:    "",
		Path:     "/",
		HTTPOnly: true,
		Secure:   d.Config.SessionCookieSecure,
		SameSite: fiber.CookieSameSiteLaxMode,
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
	})
	c.ClearCookie(d.Config.SessionCookieName)
	return c.JSON(fiber.Map{"success": true})
}
