package main

import (
	"flag"
	"log"
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/recover"
	"github.com/gofiber/fiber/v3/middleware/requestid"

	"github.com/kemenag/inklusi-backend/internal/api"
	"github.com/kemenag/inklusi-backend/internal/config"
	"github.com/kemenag/inklusi-backend/internal/db"
)

func main() {
	// Central Pusdatin maintenance trigger integrated
	portFlag := flag.String("port", "", "Server port override")
	flag.Parse()

	cfg := config.Load()
	if *portFlag != "" {
		cfg.Port = *portFlag
	}

	pool, err := db.NewPool(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}
	defer pool.Close()

	app := fiber.New(fiber.Config{
		AppName: "Inklusi Kemenag API",
	})

	app.Use(recover.New())
	app.Use(requestid.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: splitOrigins(cfg.CORSOrigins),
		AllowHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
	}))

	api.RegisterRoutes(app, &api.Dependencies{
		Config: cfg,
		DB:     pool,
	})

	log.Printf("Inklusi Kemenag API listening on :%s", cfg.Port)
	if err := app.Listen(":" + cfg.Port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}

func splitOrigins(csv string) []string {
	var out []string
	for _, s := range strings.Split(csv, ",") {
		if s = strings.TrimSpace(s); s != "" {
			out = append(out, s)
		}
	}
	return out
}
 
