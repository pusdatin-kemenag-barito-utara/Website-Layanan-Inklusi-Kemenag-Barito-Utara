package security

import (
	"bytes"
	"encoding/json"
	"net/http"
	"time"
)

// VerifyTurnstile validates a Cloudflare Turnstile token server-side.
func VerifyTurnstile(secret, token, ip string) (bool, error) {
	payload := map[string]string{
		"secret":   secret,
		"response": token,
	}
	// remoteip is optional in Cloudflare Turnstile and omitted for local loopback
	if ip != "" && ip != "127.0.0.1" && ip != "::1" && ip != "localhost" {
		payload["remoteip"] = ip
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return false, err
	}
	req, err := http.NewRequest(http.MethodPost, "https://challenges.cloudflare.com/turnstile/v0/siteverify", bytes.NewReader(body))
	if err != nil {
		return false, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	var result struct {
		Success bool `json:"success"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return false, err
	}
	return result.Success, nil
}
