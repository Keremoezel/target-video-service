<template>
  <div class="app-shell">
    <!-- Grain overlay -->
    <div class="grain-overlay" />
    <NuxtPage />
  </div>
</template>

<script setup>
// Chaos state handled per-page (index.vue pingHealth)
</script>

<style>
/* ═══════════════════════════════════════════════════════════
   VOIDSCREEN — Brutalist Cinema Streaming
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

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

html { font-size: 16px; -webkit-font-smoothing: antialiased; }

body {
  font-family: var(--font-mono);
  font-weight: 400;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  min-height: 100vh;
}

.app-shell { position: relative; min-height: 100vh; }

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

/* ── Player Modal ── */
.player-modal {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(13, 13, 13, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  backdrop-filter: blur(8px);
}

.player-box {
  background: var(--surface);
  border: 2px solid var(--border-strong);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 4px;
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border);
}

.player-cat {
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.player-title {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
}

.player-close {
  background: none;
  border: 1px solid var(--border);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  font-size: 0.9rem;
  transition: background 0.15s;
}
.player-close:hover { background: var(--bg-deep); }

.player-wrap {
  position: relative;
  aspect-ratio: 16/9;
  background: #000;
  overflow: hidden;
}

.player-video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.player-buffer {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(0,0,0,0.8);
  color: #ccc;
  font-size: 0.8rem;
  text-align: center;
  padding: 24px;
}

.player-chaos-msg {
  color: #fcd34d;
  line-height: 1.7;
}
.player-chaos-msg small {
  display: block;
  font-size: 0.7rem;
  opacity: 0.7;
  font-family: var(--font-mono);
  margin-top: 4px;
}

.player-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(0,0,0,0.9);
  padding: 24px;
  text-align: center;
}
.player-error__code {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: #fca5a5;
  letter-spacing: 0.1em;
}
.player-error__msg {
  font-size: 0.75rem;
  color: #9ca3af;
  max-width: 380px;
  line-height: 1.6;
}

.player-desc {
  padding: 16px 24px;
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.6;
  border-top: 1px solid var(--border);
}

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg-deep); }
::-webkit-scrollbar-thumb { background: var(--border); }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

/* ── Selection + Focus ── */
::selection { background: var(--accent); color: white; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* ── Page transition ── */
.page-enter-active, .page-leave-active { transition: opacity 0.15s ease; }
.page-enter-from, .page-leave-to { opacity: 0; }

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.7); }
}
</style>
