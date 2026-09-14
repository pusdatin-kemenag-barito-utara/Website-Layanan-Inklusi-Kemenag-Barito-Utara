package config

import "os"

// Config holds all runtime configuration for the backend service.
type Config struct {
	Port               string
	DatabaseURL        string
	SupabaseURL        string
	SupabaseAnonKey    string
	SupabaseServiceKey string
	TurnstileSecret    string
	PusdatinURL        string
	AppID              string
	SessionCookieName  string
	SessionCookieSecure bool
	CORSOrigins        string
}

// Load reads configuration from environment variables with sensible defaults.
func Load() *Config {
	port := os.Getenv("BACKEND_PORT")
	if port == "" {
		port = os.Getenv("API_PORT")
	}
	if port == "" {
		port = os.Getenv("PORT")
	}
	// Di monorepo ini, Infisical menyuntikkan PORT=3030 (atau 3000) untuk frontend/gateway.
	// Backend harus selalu berjalan di port 8080 kecuali ditentukan secara eksplisit.
	if port == "" || port == "3030" || port == "3000" {
		port = "8080"
	}

	return &Config{
		Port:                port,
		DatabaseURL:         os.Getenv("DATABASE_URL"),
		SupabaseURL:         getEnv("SUPABASE_URL", os.Getenv("NEXT_PUBLIC_SUPABASE_URL")),
		SupabaseAnonKey:     getEnv("SUPABASE_ANON_KEY", os.Getenv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")),
		SupabaseServiceKey:  os.Getenv("SUPABASE_SERVICE_ROLE_KEY"),
		TurnstileSecret:     getEnv("TURNSTILE_SECRET_KEY", os.Getenv("TURNSTILE_SECRET")),
		PusdatinURL:         getEnv("PUSDATIN_URL", getEnv("NEXT_PUBLIC_PUSDATIN_URL", "https://pusdatin.kemenag-baritoutara.com")),
		AppID:               getEnv("APP_ID", "inklusi_kemenag"),
		SessionCookieName:   getEnv("SESSION_COOKIE_NAME", "inklusi-auth"),
		SessionCookieSecure: getEnv("SESSION_COOKIE_SECURE", "true") == "true",
		CORSOrigins:         getEnv("CORS_ORIGINS", "http://localhost:3030,http://127.0.0.1:3030"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
