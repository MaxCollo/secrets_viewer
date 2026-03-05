package handler

import (
	"encoding/json"
	"net/http"
	"os"
	"time"
)

var startTime = time.Now()

type podInfoResponse struct {
	Hostname  string `json:"hostname"`
	Namespace string `json:"namespace"`
	PodName   string `json:"podName"`
	NodeName  string `json:"nodeName"`
	StartTime string `json:"startTime"`
}

// PodInfo returns metadata about the running pod.
// GET /api/info → {"hostname":"...","namespace":"...","podName":"...","nodeName":"...","startTime":"..."}
func PodInfo(w http.ResponseWriter, r *http.Request) {
	hostname, _ := os.Hostname()

	info := podInfoResponse{
		Hostname:  hostname,
		Namespace: envOrDefault("POD_NAMESPACE", "unknown"),
		PodName:   envOrDefault("POD_NAME", hostname),
		NodeName:  envOrDefault("NODE_NAME", "unknown"),
		StartTime: startTime.Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(info)
}

func envOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
