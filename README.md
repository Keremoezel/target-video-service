# Target Video Service

**VOIDSCREEN** — A video streaming platform designed as a chaos engineering target.

## Purpose

This is a real Nuxt 3 application with embedded chaos injection endpoints. The [Service Test Tool](https://github.com/Keremoezel/grup6-service-test-tool) platform uses this as a target to demonstrate real chaos engineering:

- **Kill** — Makes the service return 503 for all requests
- **Delay** — Injects artificial latency into every response
- **Error** — Randomly returns 500 errors at a configurable rate
- **Security Scan** — Detects intentional vulnerabilities (open debug endpoint, leaked secrets, weak CORS)

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/videos` | GET | Video catalog (supports `?category=` filter) |
| `/api/health` | GET | Health check with chaos status |
| `/api/debug` | GET | ⚠️ Intentional vulnerability — exposes env vars |
| `/api/admin/status` | GET | Current chaos injection state |
| `/api/admin/shutdown` | POST | Kill service for N seconds (`?ttl=30`) |
| `/api/admin/inject-delay` | POST | Add latency (`?ms=2000&ttl=30`) |
| `/api/admin/inject-error` | POST | Set error rate (`?rate=50&ttl=30`) |
| `/api/admin/reset` | POST | Clear all chaos effects |

## Running Locally

```bash
npm install
npm run dev
# → http://localhost:4000
```

## Deploy to Vercel

```bash
# Push to GitHub, then import in Vercel
# No environment variables needed
```

## Testing Chaos

```bash
# Kill the service
curl -X POST http://localhost:4000/api/admin/shutdown?ttl=30

# Try to access videos — will get 503
curl http://localhost:4000/api/videos

# Inject 3-second delay
curl -X POST http://localhost:4000/api/admin/inject-delay?ms=3000&ttl=60

# Inject 50% error rate
curl -X POST http://localhost:4000/api/admin/inject-error?rate=50&ttl=30

# Reset everything
curl -X POST http://localhost:4000/api/admin/reset
```
