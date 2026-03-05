package handler

import (
	"encoding/json"
	"net/http"
)

const version = "1.0.0"

type healthResponse struct {
	Status  string `json:"status"`
	Version string `json:"version"`
}

// Health returns a JSON health status for the Central Station dashboard.
// GET /health → {"status":"healthy","version":"1.0.0"}
func Health(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(healthResponse{
		Status:  "healthy",
		Version: version,
	})
}

// Healthz is a simple liveness probe for Kubernetes.
// GET /healthz → 200 OK
func Healthz(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("ok"))
}

// Readyz is a simple readiness probe for Kubernetes.
// GET /readyz → 200 OK
func Readyz(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("ok"))
}
