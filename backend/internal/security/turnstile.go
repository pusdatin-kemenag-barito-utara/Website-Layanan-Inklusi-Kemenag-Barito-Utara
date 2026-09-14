package security

import (
	"bytes"
	"encoding/json"
	"net/http"
	"time"
)

// VerifyTurnstile validates a Cloudflare Turnstile token server-side.
func VerifyTurnstile(secret, token, ip string) (bool, error) {
	body, _ := json.Marshal(map[string]string{
		"secret":   secret,
		"response": token,
		"remoteip": ip,
	})
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
