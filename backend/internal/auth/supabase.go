package auth

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"time"
)

// SupaUser represents the user payload returned by Supabase Auth.
type SupaUser struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

// SignInWithPassword authenticates with the Supabase Auth REST endpoint using password credentials.
func SignInWithPassword(supabaseURL, anonKey, email, password string) (*SupaUser, error) {
	payload, _ := json.Marshal(map[string]string{
		"email":    email,
		"password": password,
	})
	url := supabaseURL + "/auth/v1/token?grant_type=password"
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(payload))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", anonKey)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var out struct {
		User  *SupaUser `json:"user"`
		Error string    `json:"error_description"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, err
	}
	if out.User == nil || out.User.ID == "" {
		if out.Error != "" {
			return nil, errors.New(out.Error)
		}
		return nil, errors.New("authentication failed")
	}
	return out.User, nil
}
