package rbac

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

// User represents a central Pusdatin user record.
type User struct {
	ID   string `json:"id"`
	Role string `json:"role"`
}

// Service provides RBAC queries against the central kemenag_pusdatin schema.
type Service struct {
	db    *pgxpool.Pool
	appID string
}

// New creates a new RBAC service.
func New(db *pgxpool.Pool, appID string) *Service {
	return &Service{db: db, appID: appID}
}

// LookupUser fetches the user's ID and role from kemenag_pusdatin.users by email.
func (s *Service) LookupUser(ctx context.Context, email string) (*User, error) {
	const query = `
		SELECT id, role FROM kemenag_pusdatin.users
		WHERE email = $1
		LIMIT 1
	`
	var u User
	if err := s.db.QueryRow(ctx, query, email).Scan(&u.ID, &u.Role); err != nil {
		return nil, err
	}
	return &u, nil
}

// LookupAppPermission fetches the user's role specifically for this application from kemenag_pusdatin.app_permissions.
func (s *Service) LookupAppPermission(ctx context.Context, userID string) (string, error) {
	const query = `
		SELECT role FROM kemenag_pusdatin.app_permissions
		WHERE user_id = $1 AND app_id = $2
		LIMIT 1
	`
	var role string
	if err := s.db.QueryRow(ctx, query, userID, s.appID).Scan(&role); err != nil {
		return "", err
	}
	return role, nil
}
