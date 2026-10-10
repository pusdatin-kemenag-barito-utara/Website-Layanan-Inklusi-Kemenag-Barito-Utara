package rbac

import (
	"context"
	"fmt"
	"strings"

	"github.com/kemenag/inklusi-backend/internal/pocketbase"
)

// User represents a user record.
type User struct {
	ID   string `json:"id"`
	Role string `json:"role"`
}

// Service provides RBAC queries against PocketBase users collection.
type Service struct {
	pb    *pocketbase.Client
	appID string
}

// New creates a new RBAC service.
func New(pb *pocketbase.Client, appID string) *Service {
	return &Service{pb: pb, appID: appID}
}

// LookupUser fetches the user's ID and role from PocketBase users collection by email.
func (s *Service) LookupUser(ctx context.Context, email string) (*User, error) {
	filter := fmt.Sprintf("email='%s'", strings.ToLower(strings.TrimSpace(email)))
	items, _, err := s.pb.ListRecords(ctx, "users", filter, "", 1, 1)
	if err != nil {
		return nil, err
	}
	if len(items) == 0 {
		return nil, pocketbase.ErrNotFound
	}
	u := &User{
		ID:   fmt.Sprintf("%v", items[0]["id"]),
		Role: fmt.Sprintf("%v", items[0]["role"]),
	}
	if u.Role == "" || u.Role == "<nil>" {
		u.Role = "admin"
	}
	return u, nil
}
