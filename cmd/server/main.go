package main

import (
	"io/fs"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	secretsviewer "github.com/ns/secrets-viewer"
	"github.com/ns/secrets-viewer/internal/handler"
)

func main() {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(securityHeaders)

	// Health endpoints
	r.Get("/health", handler.Health)
	r.Get("/healthz", handler.Healthz)
	r.Get("/readyz", handler.Readyz)

	// API endpoints
	r.Route("/api", func(r chi.Router) {
		r.Use(noCacheHeaders)
		r.Get("/secrets", handler.ListSecrets)
		r.Get("/info", handler.PodInfo)
	})

	// Serve frontend SPA
	distFS, err := fs.Sub(secretsviewer.FrontendFS, "frontend/dist")
	if err != nil {
		log.Fatal(err)
	}
	fileServer := http.FileServer(http.FS(distFS))
	r.Get("/*", spaHandler(distFS, fileServer))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Starting secrets-viewer on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

// securityHeaders sets common security headers on every response.
func securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		next.ServeHTTP(w, r)
	})
}

// noCacheHeaders prevents caching of API responses.
func noCacheHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "no-store")
		next.ServeHTTP(w, r)
	})
}

// spaHandler serves static files, falling back to index.html for client-side routing.
func spaHandler(fsys fs.FS, fileServer http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		if path == "/" {
			path = "index.html"
		} else {
			path = path[1:] // strip leading /
		}

		// Try to open the file; if it doesn't exist, serve index.html
		if _, err := fs.Stat(fsys, path); os.IsNotExist(err) {
			r.URL.Path = "/"
		}
		fileServer.ServeHTTP(w, r)
	}
}
