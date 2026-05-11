# 🎬 VOIDSCREEN — Target Video Service

> A deliberately vulnerable video streaming service designed as the **chaos engineering target** for the Grup 6 microservice test platform.

---

## 📌 What is this?

VOIDSCREEN is a Nuxt 3 web application that simulates a real-world video streaming service. Its purpose is **not** to be a production app — it's designed to be attacked. The companion test tool (`grup6-service-test-tool`) injects chaos scenarios (delays, errors, service kills) into this service while you observe how it behaves under stress.

Think of it as a crash-test dummy for software.

---

## 🏗 Architecture

```
┌─────────────────────────────────────┐
│           VOIDSCREEN (Nuxt 3)       │  ← You are here
│         localhost:4000              │
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │  /api/videos │  │ /api/health │ │
│  │  /api/video- │  │ /api/debug  │ │
│  │   url/:id    │  │ /api/admin/ │ │
│  └──────────────┘  └─────────────┘ │
│         ↑                           │
│   chaos middleware                  │
│   (intercepts ALL requests)         │
└─────────────────────────────────────┘
         ↑ HTTP
┌─────────────────────────────────────┐
│     Grup 6 Test Tool (Docker)       │
│     chaos-service :8081             │
│     Injects: kill / delay / error   │
└─────────────────────────────────────┘
```

---

## 🚀 How to Run

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)

### Start the service

```bash
cd target-video-service
pnpm install
pnpm run dev
```

The service starts at **http://localhost:4000**

---

## 🔌 API Reference

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Service health + current chaos state |
| `GET` | `/api/videos` | List all videos (supports `?category=`) |
| `GET` | `/api/video-url/:id` | Resolve video stream URL (chaos-affected) |
| `GET` | `/api/debug` | Full internal state dump |

### Admin Endpoints (called by chaos-service)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/inject-delay` | Add response delay in milliseconds |
| `POST` | `/api/admin/inject-error` | Set error injection rate (%) |
| `POST` | `/api/admin/shutdown` | Simulate service kill (503) |
| `POST` | `/api/admin/reset` | Clear all chaos state |
| `GET` | `/api/admin/status` | Current chaos configuration |

### Example: Check chaos state
```bash
curl http://localhost:4000/api/health
```
```json
{
  "status": "UP",
  "service": "target-video-service",
  "uptime": "342s",
  "chaos": {
    "active": true,
    "delayMs": 2000,
    "errorRate": 0,
    "killed": false,
    "expiresAt": 1715000000000
  }
}
```

---

## ⚡ Chaos Middleware

Every incoming request passes through `server/middleware/chaos.ts` before reaching any endpoint. This middleware:

1. **Checks if service is killed** → returns `503 Service Unavailable`
2. **Checks for delay** → blocks the request for N milliseconds
3. **Checks error rate** → with probability `rate/100`, returns `500 Internal Server Error`
4. **Otherwise** → passes the request through normally

```
Request → chaos.ts → your endpoint → response
              ↓
         [killed?]   → 503
         [delay?]    → wait Nms → continue
         [error?]    → random() < rate → 500
         [else]      → pass through
```

This means **every API call** — including `/api/videos` and `/api/video-url/:id` — is affected by chaos injection.

---

## 🎯 How Chaos Affects the UI

### Delay Injection
- The `/api/video-url/:id` fetch is slowed by N milliseconds
- The video player modal shows a spinner with an elapsed counter
- The chaos pill in the header turns amber and shows the delay + TTL
- Example: `⏱ +2000MS DELAY · 28s`

### Error Injection (partial failure)
- Each request has a `rate%` chance of returning 500
- Clicking a video card may succeed or fail randomly
- The player shows `ERR_500 CHAOS_ERROR` with a RETRY button
- The catalog auto-refreshes every 4 seconds — you'll see it fail and recover

### Kill
- All requests immediately return 503
- The catalog shows `ERR_503` with a RETRY button
- The chaos pill turns red and pulses
- Example: `💀 SERVICE KILLED`

---

## 🎬 Video Catalog

Videos are served via `/api/video-url/:id` which returns a redirect URL to a publicly hosted MP4 file. The key design decision here: **the fetch to `/api/video-url/:id` goes through the chaos middleware**, so:

- Under delay → video takes longer to start
- Under error → video fails to load (player shows error)
- Under kill → video always fails

Video sources (all CC-licensed, public domain):
- Big Buck Bunny — W3C / Blender Foundation
- Sintel — W3C / Blender Foundation
- Oceans — VideoJS CDN

---

## 🧪 Chaos Engineering Concepts Demonstrated

### 1. Fault Injection
Deliberately introducing failures into a running system to observe behavior. This service implements three failure modes that map to real-world outage scenarios.

### 2. Partial Failure (Error Rate)
Unlike a complete kill, partial failure (e.g., 50% error rate) simulates a degraded service. This tests:
- **Retry logic** — does the client retry failed requests?
- **Graceful degradation** — does the UI show partial content or completely break?
- **Circuit breaker patterns** — does the system stop hammering a failing service?

### 3. Latency Injection
High latency is often worse than outage because it causes resource exhaustion. A service waiting 10 seconds per request can exhaust thread pools and memory while appearing "UP" to health checks.

### 4. Time-bounded Chaos (TTL)
All chaos scenarios have a TTL (time-to-live) so the system automatically recovers. This mirrors real incidents where engineers apply temporary mitigations.

---

## 📁 Project Structure

```
target-video-service/
├── server/
│   ├── api/
│   │   ├── health.get.ts        # Health check endpoint
│   │   ├── videos.get.ts        # Video catalog
│   │   ├── video-url/
│   │   │   └── [id].get.ts      # Chaos-affected video URL resolver
│   │   ├── admin/
│   │   │   ├── inject-delay.post.ts
│   │   │   ├── inject-error.post.ts
│   │   │   ├── shutdown.post.ts
│   │   │   ├── reset.post.ts
│   │   │   └── status.get.ts
│   │   └── debug.get.ts
│   ├── middleware/
│   │   └── chaos.ts             # ← The core: intercepts all requests
│   └── utils/
│       └── chaosState.ts        # Shared in-memory chaos state
├── pages/
│   └── index.vue                # Main UI — video catalog + player
├── app.vue                      # App shell + global styles
└── nuxt.config.ts
```

---

## 🤝 Integration with Test Tool

The test tool (grup6-service-test-tool) communicates with this service via HTTP:

```
Test Tool UI → chaos-service → POST /api/admin/inject-delay?ms=2000&ttl=30
                                    ↓
                             target-video-service updates chaosState
                                    ↓
                             All subsequent requests are delayed 2000ms
```

The test tool dashboard polls `/api/health` to display real-time chaos status.
