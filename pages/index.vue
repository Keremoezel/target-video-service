<template>
  <div class="page-index">
    <!-- Header -->
    <header class="header">
      <div class="header__inner">
        <div class="header__brand">
          <div class="header__logo">
            <span class="header__logo-block" />
            <span class="header__logo-block header__logo-block--accent" />
          </div>
          <div>
            <h1 class="header__title">VOIDSCREEN</h1>
            <p class="header__subtitle">streaming / vol. 01</p>
          </div>
        </div>

        <div class="header__right">
          <!-- Floating chaos pill (no full-width overlap) -->
          <div v-if="chaosState.active" class="chaos-pill" :class="`chaos-pill--${chaosState.type}`">
            <span class="chaos-pill__dot" />
            <span>{{ chaosState.icon }} {{ chaosState.shortLabel }}</span>
            <span class="chaos-pill__sep">·</span>
            <span class="chaos-pill__ms">{{ lastPingMs }}ms</span>
          </div>
          <div class="header__status">
            <div class="status-dot" :class="serviceUp ? 'status-dot--up' : 'status-dot--down'" />
            <span class="header__status-label">{{ serviceUp ? 'ONLINE' : 'OFFLINE' }}</span>
            <span class="header__divider">·</span>
            <span class="header__status-label">{{ videoCount }} titles</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Category pills -->
    <nav class="categories">
      <button
        v-for="cat in categories"
        :key="cat"
        class="cat-pill"
        :class="{ 'cat-pill--active': activeCategory === cat }"
        @click="activeCategory = cat"
      >
        {{ cat }}
      </button>
    </nav>

    <!-- Video Grid -->
    <main class="grid-section">
      <div v-if="loading" class="grid-loading">
        <div class="loader" />
        <p v-if="chaosState.type === 'delay'" class="grid-loading__chaos">
          ⏱ Chaos delay active — catalog loading slowly (+{{ chaosState.delayMs ?? '?' }}ms)
        </p>
        <p v-else>Loading catalog...</p>
        <p v-if="lastCatalogMs !== null" class="grid-loading__time">Last fetch took {{ lastCatalogMs }}ms</p>
      </div>

      <div v-else-if="error" class="grid-error">
        <p class="grid-error__code">ERR_503</p>
        <p class="grid-error__msg">{{ error }}</p>
        <button class="btn btn--accent" @click="fetchVideos">RETRY</button>
      </div>

      <div v-else class="video-grid">
        <article
          v-for="(video, i) in videos"
          :key="video.id"
          class="video-card"
          :style="{ '--stagger': i }"
          @click="openPlayer(video)"
          style="cursor:pointer"
        >
          <div class="video-card__img-wrap">
            <img
              :src="video.thumbnail"
              :alt="video.title"
              class="video-card__img"
              loading="lazy"
            />
            <div class="video-card__duration">{{ video.duration }}</div>
            <div class="video-card__overlay">
              <span class="video-card__play">▶</span>
            </div>
          </div>

          <div class="video-card__body">
            <div class="video-card__meta">
              <span class="video-card__category">{{ video.category }}</span>
              <span class="video-card__year">{{ video.year }}</span>
            </div>
            <h2 class="video-card__title">{{ video.title }}</h2>
            <p class="video-card__desc">{{ video.description }}</p>
            <div class="video-card__footer">
              <span class="video-card__rating">★ {{ video.rating }}</span>
              <span class="video-card__views">{{ formatViews(video.views) }} views</span>
            </div>
          </div>
        </article>
      </div>
    </main>

    <!-- Video Player Modal -->
    <div v-if="activeVideo" class="player-modal" @click.self="closePlayer">
      <div class="player-box">
        <div class="player-header">
          <div>
            <p class="player-cat">{{ activeVideo.category }} · {{ activeVideo.year }}</p>
            <h2 class="player-title">{{ activeVideo.title }}</h2>
          </div>
          <button class="player-close" @click="closePlayer">✕</button>
        </div>
        <div class="player-wrap">
          <div v-if="videoLoading" class="player-buffer">
            <div class="loader" />
            <p v-if="chaosState.type === 'delay'" class="player-chaos-msg">
              ⏱ Chaos +{{ chaosState.delayMs }}ms delay — waiting for video service response...
              <br><small>{{ videoLoadMs }}ms elapsed</small>
            </p>
            <p v-else-if="chaosState.type === 'kill'">💀 Service killed — video unavailable</p>
            <p v-else>Resolving stream from video service...</p>
          </div>
          <div v-else-if="videoError" class="player-error">
            <p class="player-error__code">⚠ {{ videoError.code }}</p>
            <p class="player-error__msg">{{ videoError.message }}</p>
            <button class="btn btn--accent" style="margin-top:16px" @click="retryVideo">RETRY</button>
          </div>
          <video
            v-else-if="resolvedVideoUrl"
            :src="resolvedVideoUrl"
            controls
            autoplay
            class="player-video"
          />
        </div>
        <p class="player-desc">{{ activeVideo.description }}</p>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer__inner">
        <p class="footer__text">VOIDSCREEN © 2025 — Chaos Engineering Target Service</p>
        <div class="footer__links">
          <a href="/api/health" class="footer__link">/api/health</a>
          <a href="/api/videos" class="footer__link">/api/videos</a>
          <a href="/api/debug" class="footer__link footer__link--danger">/api/debug ⚠</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const videos = ref([])
const categories = ref(['ALL'])
const activeCategory = ref('ALL')
const loading = ref(true)
const error = ref(null)
const serviceUp = ref(true)
const videoCount = ref(0)
const chaosActive = ref(false)
const activeVideo = ref(null)
const lastPingMs = ref(null)
const lastCatalogMs = ref(null)

// Player
const resolvedVideoUrl = ref(null)
const videoLoading = ref(false)
const videoError = ref(null)
const videoLoadMs = ref(0)
let videoLoadTimer = null

const chaosState = ref({ active: false, type: 'ok', icon: '', message: '', shortLabel: '', delayMs: 0 })

const formatViews = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n
}

const resolveVideoUrl = async (videoId) => {
  videoLoading.value = true
  videoError.value = null
  resolvedVideoUrl.value = null
  videoLoadMs.value = 0
  const t0 = performance.now()
  videoLoadTimer = setInterval(() => { videoLoadMs.value = Math.round(performance.now() - t0) }, 100)
  try {
    // Native fetch — goes through Nuxt chaos middleware!
    // Delay  → response is N ms late  → spinner with elapsed counter
    // Error  → 500 response           → error screen shown
    // Kill   → 503 response           → error screen shown
    const resp = await fetch(`/api/video-url/${videoId}`)
    const data = await resp.json()
    if (!resp.ok) {
      videoError.value = {
        code: `ERR_${resp.status}`,
        message: data?.message || `Service returned ${resp.status} — chaos injection may be active`,
      }
      return
    }
    resolvedVideoUrl.value = data.url
  } catch (e) {
    videoError.value = {
      code: 'ERR_NETWORK',
      message: 'Network error — service may be killed or unreachable',
    }
  } finally {
    clearInterval(videoLoadTimer)
    videoLoading.value = false
  }
}

const openPlayer = (video) => {
  activeVideo.value = video
  document.body.style.overflow = 'hidden'
  resolveVideoUrl(video.id)
}

const closePlayer = () => {
  activeVideo.value = null
  resolvedVideoUrl.value = null
  videoError.value = null
  clearInterval(videoLoadTimer)
  document.body.style.overflow = ''
}

const retryVideo = () => resolveVideoUrl(activeVideo.value?.id)

const fetchVideos = async () => {
  loading.value = true
  error.value = null
  const t0 = performance.now()
  try {
    const catParam = activeCategory.value === 'ALL' ? '' : `?category=${activeCategory.value}`
    const data = await $fetch(`/api/videos${catParam}`)
    lastCatalogMs.value = Math.round(performance.now() - t0)
    videos.value = data.videos
    videoCount.value = data.total
    if (data.categories) {
      categories.value = ['ALL', ...data.categories]
    }
    serviceUp.value = true
  } catch (e) {
    lastCatalogMs.value = Math.round(performance.now() - t0)
    error.value = e?.data?.message || e?.message || 'Service unreachable'
    serviceUp.value = false
  } finally {
    loading.value = false
  }
}

// Ping /api/health every 2s — measures real response time to show delay
const pingHealth = async () => {
  const t0 = performance.now()
  try {
    const data = await $fetch('/api/health')
    lastPingMs.value = Math.round(performance.now() - t0)

    const chaos = data.chaos
    if (chaos?.killed) {
      chaosState.value = { active: true, type: 'kill', icon: '💀', message: 'KILL injected', shortLabel: 'SERVICE KILLED', delayMs: 0 }
    } else if ((chaos?.delayMs ?? 0) > 0) {
      const ttlLeft = chaos.expiresAt ? Math.max(0, Math.ceil((chaos.expiresAt - Date.now()) / 1000)) : '?'
      chaosState.value = { active: true, type: 'delay', icon: '⏱', message: `DELAY +${chaos.delayMs}ms`, shortLabel: `+${chaos.delayMs}ms DELAY · ${ttlLeft}s`, delayMs: chaos.delayMs }
    } else if ((chaos?.errorRate ?? 0) > 0) {
      const ttlLeft = chaos.expiresAt ? Math.max(0, Math.ceil((chaos.expiresAt - Date.now()) / 1000)) : '?'
      chaosState.value = { active: true, type: 'error', icon: '⚠️', message: `ERROR ${chaos.errorRate}%`, shortLabel: `${chaos.errorRate}% ERROR · ${ttlLeft}s`, delayMs: 0 }
    } else {
      chaosState.value = { active: false, type: 'ok', icon: '', message: '', shortLabel: '', delayMs: 0 }
    }
    chaosActive.value = chaosState.value.active
  } catch {
    lastPingMs.value = Math.round(performance.now() - t0)
    chaosState.value = { active: true, type: 'kill', icon: '💀', message: 'UNREACHABLE', shortLabel: 'UNREACHABLE', delayMs: 0 }
    chaosActive.value = true
    serviceUp.value = false
    error.value = 'Service unreachable — chaos injection may be active'
    videos.value = []
  }
}

onMounted(async () => {
  await fetchVideos()
  await pingHealth()

  // Ping every 2s to show real-time response time
  setInterval(pingHealth, 2000)

  // Auto-refresh catalog every 4s so error injection & delay are visible
  setInterval(async () => {
    if (!activeVideo.value) {  // don't refresh while player is open
      await fetchVideos()
    }
  }, 4000)
})

watch(activeCategory, () => fetchVideos())
</script>

<style scoped>
/* ═══════════════════════════════════════
   INDEX PAGE — Brutalist Cinema Catalog
   ═══════════════════════════════════════ */

/* ── Chaos Pill (header sağı) ── */
.chaos-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px 7px 12px;
  border-radius: 999px;
  border: 2px solid;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  font-weight: 800;
  white-space: nowrap;
  text-transform: uppercase;
}

.chaos-pill--kill {
  background: rgba(220, 38, 38, 0.2);
  border-color: #dc2626;
  color: #f87171;
  box-shadow: 0 0 16px rgba(220, 38, 38, 0.4), inset 0 0 12px rgba(220, 38, 38, 0.1);
  animation: pill-kill-pulse 1s ease-in-out infinite alternate;
}

.chaos-pill--delay {
  background: rgba(217, 119, 6, 0.18);
  border-color: #f59e0b;
  color: #fbbf24;
  box-shadow: 0 0 14px rgba(245, 158, 11, 0.35), inset 0 0 10px rgba(245, 158, 11, 0.08);
}

.chaos-pill--error {
  background: rgba(234, 88, 12, 0.18);
  border-color: #f97316;
  color: #fb923c;
  box-shadow: 0 0 14px rgba(249, 115, 22, 0.35), inset 0 0 10px rgba(249, 115, 22, 0.08);
}

@keyframes pill-kill-pulse {
  from { box-shadow: 0 0 10px rgba(220, 38, 38, 0.3), inset 0 0 8px rgba(220,38,38,0.08); }
  to   { box-shadow: 0 0 24px rgba(220, 38, 38, 0.6), inset 0 0 16px rgba(220,38,38,0.15); }
}

.chaos-pill__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
  animation: dot-blink 1.2s ease-in-out infinite;
}

@keyframes dot-blink {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.6); }
}

.chaos-pill__sep { opacity: 0.35; margin: 0 2px; }
.chaos-pill__ms { opacity: 0.75; font-size: 0.7rem; font-weight: 600; }



/* ── Header ── */
.header {
  border-bottom: 2px solid var(--border-strong);
  padding: 0 clamp(20px, 4vw, 60px);
}

.header__inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0;
}

.header__brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header__logo {
  display: flex;
  gap: 3px;
}

.header__logo-block {
  width: 14px;
  height: 28px;
  background: var(--text);
}

.header__logo-block--accent {
  background: var(--accent);
  width: 6px;
}

.header__title {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1;
}

.header__subtitle {
  font-size: 0.7rem;
  color: var(--text-muted);
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.header__right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header__status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.header__divider {
  color: var(--border);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot--up {
  background: var(--green);
  box-shadow: 0 0 6px var(--green);
  animation: pulse-dot 2s infinite;
}

.status-dot--down {
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent-glow);
  animation: pulse-dot 0.5s infinite;
}

/* ── Categories ── */
.categories {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px clamp(20px, 4vw, 60px);
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--border);
}

.cat-pill {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 6px 16px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.cat-pill:hover {
  border-color: var(--text);
  color: var(--text);
}

.cat-pill--active {
  background: var(--text);
  color: var(--bg);
  border-color: var(--text);
}

/* ── Grid Section ── */
.grid-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px clamp(20px, 4vw, 60px) 80px;
}

.grid-loading,
.grid-error {
  text-align: center;
  padding: 100px 20px;
  color: var(--text-muted);
}

.grid-loading__chaos {
  color: #fcd34d;
  font-size: 0.85rem;
  margin-top: 8px;
}

.grid-loading__time {
  font-size: 0.7rem;
  color: var(--text-faint);
  margin-top: 6px;
  font-family: var(--font-mono);
}

.grid-error__code {
  font-family: var(--font-display);
  font-size: 4rem;
  font-weight: 900;
  color: var(--accent);
  line-height: 1;
}

.grid-error__msg {
  margin: 12px 0 24px;
  font-size: 0.85rem;
}

.loader {
  width: 40px;
  height: 40px;
  border: 2px solid var(--border);
  border-top-color: var(--text);
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Video Grid ── */
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
}

/* ── Video Card ── */
.video-card {
  border: 1px solid var(--border);
  background: var(--surface);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: card-enter 0.5s ease calc(var(--stagger) * 0.08s) both;
}

.video-card:hover {
  transform: translateY(-4px);
  box-shadow: 8px 8px 0 var(--border-strong);
}

@keyframes card-enter {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.video-card__img-wrap {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 9;
}

.video-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease, filter 0.5s ease;
}

.video-card:hover .video-card__img {
  transform: scale(1.05);
  filter: contrast(1.1);
}

.video-card__duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  font-size: 0.65rem;
  font-family: var(--font-mono);
  background: var(--text);
  color: var(--bg);
  padding: 2px 8px;
  letter-spacing: 0.05em;
}

.video-card__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-card:hover .video-card__overlay {
  opacity: 1;
}

.video-card__play {
  width: 56px;
  height: 56px;
  border: 2px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  padding-left: 4px;
  transition: transform 0.2s;
}

.video-card:hover .video-card__play {
  transform: scale(1.1);
}

.video-card__body {
  padding: 20px;
}

.video-card__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.video-card__category {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--accent);
  font-weight: 500;
}

.video-card__year {
  font-size: 0.65rem;
  color: var(--text-faint);
}

.video-card__title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 8px;
}

.video-card__desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  font-size: 0.7rem;
}

.video-card__rating {
  color: var(--accent);
  font-weight: 500;
}

.video-card__views {
  color: var(--text-faint);
}

/* ── Button ── */
.btn {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 10px 24px;
  border: 2px solid var(--border-strong);
  cursor: pointer;
  transition: all 0.2s;
}

.btn--accent {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.btn--accent:hover {
  background: transparent;
  color: var(--accent);
}

/* ── Footer ── */
.footer {
  border-top: 2px solid var(--border-strong);
  padding: 0 clamp(20px, 4vw, 60px);
}

.footer__inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.footer__text {
  font-size: 0.7rem;
  color: var(--text-faint);
  letter-spacing: 0.05em;
}

.footer__links {
  display: flex;
  gap: 16px;
}

.footer__link {
  font-size: 0.65rem;
  color: var(--text-muted);
  text-decoration: none;
  font-family: var(--font-mono);
  transition: color 0.2s;
}

.footer__link:hover {
  color: var(--text);
}

.footer__link--danger {
  color: var(--accent);
}

/* ── Player Modal ── */
.player-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.92);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(8px);
}

.player-box {
  width: 100%;
  max-width: 900px;
  background: var(--surface);
  border: 2px solid var(--border-strong);
}

.player-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border);
}

.player-cat {
  font-size: 0.65rem;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 4px;
}

.player-title {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
}

.player-close {
  font-size: 1rem;
  color: var(--text-muted);
  background: none;
  border: 1px solid var(--border);
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-left: 16px;
}

.player-close:hover {
  border-color: var(--text);
  color: var(--text);
}

.player-wrap {
  position: relative;
  background: #000;
  aspect-ratio: 16/9;
}

.player-video {
  width: 100%;
  height: 100%;
  display: block;
  border: 0;
}

.player-buffer {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.player-desc {
  padding: 16px 24px;
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.5;
  border-top: 1px solid var(--border);
}

@media (max-width: 640px) {
  .video-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .header__status {
    display: none;
  }
}
</style>
