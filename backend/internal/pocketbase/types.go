package pocketbase

import "errors"

var (
	// ErrNotFound is returned when a record cannot be found in PocketBase.
	ErrNotFound = errors.New("record not found")

	// ErrUnauthorized is returned when authentication fails.
	ErrUnauthorized = errors.New("unauthorized")
)

// ListResponse encapsulates PocketBase paginated results.
type ListResponse struct {
	Page       int                      `json:"page"`
	PerPage    int                      `json:"perPage"`
	TotalItems int                      `json:"totalItems"`
	TotalPages int                      `json:"totalPages"`
	Items      []map[string]interface{} `json:"items"`
}

// AuthRecord represents an authenticated PocketBase user.
type AuthRecord struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Name     string `json:"name"`
	Role     string `json:"role"`
	NIP      string `json:"nip"`
	UnitName string `json:"unit_name"`
	Verified bool   `json:"verified"`
}

// AuthResponse holds the user record and JWT token from PocketBase password login.
type AuthResponse struct {
	Token  string     `json:"token"`
	Record AuthRecord `json:"record"`
}
