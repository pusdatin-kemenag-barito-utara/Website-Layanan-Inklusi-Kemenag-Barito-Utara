package api

import (
	"errors"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/jackc/pgx/v5"
	"github.com/kemenag/inklusi-backend/internal/auth"
	"github.com/kemenag/inklusi-backend/internal/middleware"
	"github.com/kemenag/inklusi-backend/internal/rbac"
	"github.com/kemenag/inklusi-backend/internal/security"
)

// loginRequest is the payload for POST /api/auth/login.
type loginRequest struct {
	Email          string `json:"email"`
	Password       string `json:"password"`
	TurnstileToken string `json:"turnstileToken"`
}

func registerAuthRoutes(g fiber.Router, deps *Dependencies) {
	g.Post("/auth/login", deps.login)
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

// login authenticates the user against Supabase Auth, validates RBAC, and issues a session cookie.
func (d *Dependencies) login(c fiber.Ctx) error {
	var req loginRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	if req.TurnstileToken == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Verifikasi keamanan diperlukan"})
	}

	// 1. Verify Turnstile server-side
	if d.Config.TurnstileSecret != "" {
		ok, err := security.VerifyTurnstile(d.Config.TurnstileSecret, req.TurnstileToken, c.IP())
		if err != nil {
			return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{"error": "Terjadi kesalahan sistem saat memverifikasi keamanan"})
		}
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Verifikasi keamanan gagal. Silakan coba lagi."})
		}
	}

	// 2. Supabase Auth sign-in
	supaUser, err := auth.SignInWithPassword(d.Config.SupabaseURL, d.Config.SupabaseAnonKey, req.Email, req.Password)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Email atau password salah"})
	}

	// 3. RBAC check against central pusdatin schema
	rbacSvc := rbac.New(d.DB, d.Config.AppID)
	pu, err := rbacSvc.LookupUser(c.Context(), supaUser.Email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Akun tidak ditemukan di sistem pusat."})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Terjadi kesalahan sistem saat mengecek akses."})
	}

	role := pu.Role
	if role != "super_admin" {
		perm, err := rbacSvc.LookupAppPermission(c.Context(), pu.ID)
		if err != nil || perm == "none" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Akun Anda tidak memiliki akses ke aplikasi Pusat Layanan Inklusi."})
		}
		role = perm
	}

	// 4. Issue session JWT + cookie
	token, err := auth.GenerateToken(pu.ID, supaUser.Email, role, 24*time.Hour)
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

// logout clears the session cookie.
func (d *Dependencies) logout(c fiber.Ctx) error {
	c.ClearCookie(d.Config.SessionCookieName)
	return c.JSON(fiber.Map{"success": true})
}
