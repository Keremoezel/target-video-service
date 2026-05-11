<template>
  <div class="app-shell">
    <!-- Grain overlay -->
    <div class="grain-overlay" />

    <!-- Chaos banner — appears when service is under attack -->
    <Transition name="chaos-banner">
      <div v-if="chaosActive" class="chaos-banner">
        <span class="chaos-banner__icon">⚠</span>
        <span class="chaos-banner__text">
          SYSTEM UNDER CHAOS INJECTION
          <template v-if="chaosState?.killed"> — SERVICE KILLED</template>
          <template v-else-if="chaosState?.delayMs > 0"> — DELAY {{ chaosState.delayMs }}ms</template>
          <template v-else-if="chaosState?.errorRate > 0"> — ERROR RATE {{ chaosState.errorRate }}%</template>
        </span>
        <span class="chaos-banner__pulse" />
      </div>
    </Transition>

    <NuxtPage />
  </div>
</template>

<script setup>
const chaosState = ref(null)
const chaosActive = computed(() => {
  if (!chaosState.value) return false
  return chaosState.value.killed || chaosState.value.delayMs > 0 || chaosState.value.errorRate > 0
})

// Poll chaos status every 3 seconds
onMounted(() => {
  const poll = async () => {
    try {
      const data = await $fetch('/api/admin/status')
      chaosState.value = data
    } catch { }
  }
  poll()
  const t = setInterval(poll, 3000)
  onUnmounted(() => clearInterval(t))
})
</script>

<style>
/* ═══════════════════════════════════════════════════════════
   VOIDSCREEN — Brutalist Cinema Streaming
   Aesthetic: Raw concrete meets celluloid. High contrast.
   Font pairing: Playfair Display (editorial) + DM Mono (data)
   ═══════════════════════════════════════════════════════════ */

:root {
  --bg: #F2EDE4;
  --bg-deep: #E8E0D2;
  --surface: #FFFDF8;
  --text: #0D0D0D;
  --text-muted: #6B6358;
  --text-faint: #A39888;
  --accent: #C62828;
  --accent-glow: #FF1744;
  --blue: #0277BD;
  --green: #2E7D32;
  --border: #D4CBC0;
  --border-strong: #0D0D0D;
  --shadow: rgba(13, 13, 13, 0.08);
  --font-display: 'Playfair Display', Georgia, serif;
  --font-mono: 'DM Mono', 'Courier New', monospace;
}

*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
}

body {
  font-family: var(--font-mono);
  font-weight: 400;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  min-height: 100vh;
}

.app-shell {
  position: relative;
  min-height: 100vh;
}

/* ── Film Grain Overlay ── */
.grain-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  mix-blend-mode: multiply;
}

/* ── Chaos Banner ── */
.chaos-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px 24px;
  background: var(--accent);
  color: white;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.chaos-banner__icon {
  font-size: 1rem;
  animation: chaos-shake 0.15s infinite;
}

.chaos-banner__pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
  animation: pulse-dot 1s ease infinite;
}

@keyframes chaos-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.7); }
}

/* ── Transitions ── */
.chaos-banner-enter-active {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s;
}
.chaos-banner-leave-active {
  transition: transform 0.2s ease, opacity 0.2s;
}
.chaos-banner-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}
.chaos-banner-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* ── Scrollbar ── */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: var(--bg-deep);
}
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 0;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

/* ── Selection ── */
::selection {
  background: var(--accent);
  color: white;
}

/* ── Focus ── */
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* ── Page transition ── */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
