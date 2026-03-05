package handler

import (
	"encoding/json"
	"net/http"
	"os"
	"sort"
	"strings"
)

type secretEntry struct {
	Name   string `json:"name"`
	Value  string `json:"value"`
	Source string `json:"source"`
}

// ListSecrets returns all environment variables visible to the pod.
// GET /api/secrets → [{"name":"...","value":"...","source":"env"}]
func ListSecrets(w http.ResponseWriter, r *http.Request) {
	envVars := os.Environ()
	sort.Strings(envVars)

	entries := make([]secretEntry, 0, len(envVars))
	for _, env := range envVars {
		parts := strings.SplitN(env, "=", 2)
		name := parts[0]
		value := ""
		if len(parts) == 2 {
			value = parts[1]
		}

		entries = append(entries, secretEntry{
			Name:   name,
			Value:  value,
			Source: classifySource(name),
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entries)
}

// classifySource guesses the source of an env var based on naming conventions.
func classifySource(name string) string {
	// Kubernetes-injected service env vars
	if strings.HasSuffix(name, "_SERVICE_HOST") || strings.HasSuffix(name, "_SERVICE_PORT") {
		return "configmap"
	}
	// Common secret patterns
	upper := strings.ToUpper(name)
	for _, keyword := range []string{"SECRET", "PASSWORD", "TOKEN", "KEY", "CREDENTIALS"} {
		if strings.Contains(upper, keyword) {
			return "secret"
		}
	}
	return "env"
}
