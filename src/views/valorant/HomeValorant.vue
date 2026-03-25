<template>
    <div class="home">

        <div class="bg-layer">
            <div class="bg-img"></div>
            <div class="bg-grad-left"></div>
            <div class="bg-grad-bottom"></div>
        </div>

        <div class="content-layer">

            <nav class="nav">
                <div class="nav-logo">
                    <svg class="nav-logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 17L9 5L15 13L18 8L21 17H3Z" fill="#FF4655" />
                    </svg>
                    <span class="nav-logo-text">AMGAMES</span>
                    <span class="nav-divider"></span>
                    <span class="nav-sub">VALORANT</span>
                </div>
            </nav>

            <div class="hero">
                <h1 class="hero-title">
                    <span class="hero-line clip-in" style="--delay: 0.15s">DOMINA</span>
                    <span class="hero-line accent clip-in" style="--delay: 0.28s">
                        EL MAPA
                        <span class="accent-strike"></span>
                    </span>
                </h1>

                <form class="search-form clip-in" style="--delay: 0.48s" @submit.prevent="search">
                    <div class="search-wrapper" :class="{ focused: isFocused }">
                        <div class="search-corner search-corner--tl"></div>
                        <div class="search-corner search-corner--br"></div>
                        <span class="search-icon">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" stroke-width="1.5" />
                                <path d="M10 10L14 14" stroke="currentColor" stroke-width="1.5"
                                    stroke-linecap="square" />
                            </svg>
                        </span>
                        <input v-model="searchInput" type="text" placeholder="GameName#TAG" class="search-input"
                            autocomplete="off" spellcheck="false" @focus="isFocused = true" @blur="isFocused = false" />
                        <button type="submit" class="search-btn" :disabled="loading">
                            <span v-if="loading" class="spinner"></span>
                            <template v-else>
                                <span class="btn-text">BUSCAR</span>
                                <svg class="btn-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M2 7H12M8 3L12 7L8 11" stroke="currentColor" stroke-width="1.5"
                                        stroke-linecap="square" />
                                </svg>
                            </template>
                        </button>
                    </div>
                    <p v-if="errorMsg" class="search-error">⚠ {{ errorMsg }}</p>
                </form>
            </div>

            <div class="bottom-bar clip-in" style="--delay: 0.6s">
                <div class="bottom-bar-left">
                    <span class="bar-badge">
                        <span class="badge-ping"></span>
                        LATAM · Americas
                    </span>
                    <span class="bar-sep">|</span>
                    <span class="bar-info">Actualizado en tiempo real</span>
                </div>
                <div class="bottom-bar-right">
                    <span class="bar-stat">MMR</span>
                    <span class="bar-stat">HISTORIAL</span>
                    <span class="bar-stat">AGENTES</span>
                </div>
            </div>

        </div>

        <div class="crosshair-deco" aria-hidden="true">
            <div class="ch-h"></div>
            <div class="ch-v"></div>
            <div class="ch-ring"></div>
        </div>

    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchInput = ref('')
const loading = ref(false)
const errorMsg = ref('')
const isFocused = ref(false)

async function search() {
    errorMsg.value = ''
    if (!searchInput.value.includes('#')) {
        errorMsg.value = 'Formato requerido: GameName#TAG'
        return
    }
    const [name, tag] = searchInput.value.split('#')
    router.push({
        name: 'ValorantSummoner',
        params: { gameName: name, tagLine: tag }
    })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Barlow+Condensed:wght@400;500;700;800&family=Share+Tech+Mono&display=swap');

:root {
    --red: #FF4655;
    --red-dark: #c93040;
    --red-glow: rgba(255, 70, 85, 0.35);
    --bg: #0f1116;
    --bg-card: rgba(15, 17, 22, 0.75);
    --white: #ECE8E1;
    --white-dim: rgba(236, 232, 225, 0.18);
    --white-mid: rgba(236, 232, 225, 0.45);
    --mono: 'Share Tech Mono', monospace;
    --display: 'Barlow Condensed', sans-serif;
    --ui: 'Rajdhani', sans-serif;
}

*,
*::before,
*::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

@keyframes clipIn {
    from { clip-path: inset(0 100% 0 0); opacity: 0; }
    to   { clip-path: inset(0 0% 0 0);   opacity: 1; }
}

@keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1);   }
    50%       { opacity: 0.3; transform: scale(0.6); }
}

@keyframes ping {
    0%   { transform: scale(1);   opacity: 0.8; }
    100% { transform: scale(2.4); opacity: 0;   }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

@keyframes crosshairPulse {
    0%, 100% { opacity: 0.12; }
    50%       { opacity: 0.22; }
}

.clip-in {
    opacity: 0;
    animation: clipIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: var(--delay, 0s);
}

/* ─── ROOT ──────────────────────────────────────────── */
.home {
    width: 100%;
    height: 100vh;
    position: relative;
    overflow: hidden;
    font-family: var(--ui);
    color: var(--white);
    background: var(--bg);
}

/* ─── FONDO ─────────────────────────────────────────── */
.bg-layer {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
}

.bg-img {
    position: absolute;
    inset: 0;
    background-image: url('/images/portadaValorant.jpg');
    background-size: cover;
    background-position: center right;
    filter: brightness(0.55) saturate(0.85);
}

.bg-grad-left {
    position: absolute;
    inset: 0;
    background: linear-gradient(to right,
        #07080f 0%,
        #07080f 25%,
        rgba(7, 8, 15, 0.9) 42%,
        rgba(7, 8, 15, 0.4) 60%,
        transparent 78%);
}

.bg-grad-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 28%;
    background: linear-gradient(to top, var(--bg) 0%, transparent 100%);
}

/* ─── CROSSHAIR DECO ────────────────────────────────── */
.crosshair-deco {
    position: absolute;
    bottom: 14%;
    right: 8%;
    width: 60px;
    height: 60px;
    z-index: 5;
    pointer-events: none;
    animation: crosshairPulse 3s ease-in-out infinite;
}

.ch-h, .ch-v {
    position: absolute;
    background: var(--red);
}

.ch-h {
    width: 100%;
    height: 1px;
    top: 50%;
    transform: translateY(-50%);
}

.ch-v {
    height: 100%;
    width: 1px;
    left: 50%;
    transform: translateX(-50%);
}

.ch-ring {
    position: absolute;
    inset: 12px;
    border: 1px solid var(--red);
    border-radius: 50%;
}

/* ─── CONTENIDO ─────────────────────────────────────── */
.content-layer {
    position: absolute;
    inset: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

/* ─── NAV ───────────────────────────────────────────── */
.nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.6rem 2.5rem;
    flex-shrink: 0;
}

.nav-logo {
    display: flex;
    align-items: center;
    gap: 0.55rem;
}

.nav-logo-icon {
    width: 22px;
    height: 22px;
}

.nav-logo-text {
    font-family: 'Syne', sans-serif;
    font-size: 0.9rem;
    font-weight: 800;
    letter-spacing: 0.2em;
    color: #f0ece0;
}

.nav-divider {
    width: 1px;
    height: 14px;
    background: rgba(255, 70, 85, 0.5);
    margin: 0 0.2rem;
}

.nav-sub {
    font-family: var(--mono);
    font-size: 0.6rem;
    letter-spacing: 0.18em;
    color: var(--red);
    text-transform: uppercase;
}

/* ─── HERO ──────────────────────────────────────────── */
.hero {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1.5rem;
    padding: 0 0 0 3.5rem;
    max-width: 600px;
}

.hero-title {
    display: flex;
    flex-direction: column;
    line-height: 0.92;
    gap: 0.1rem;
}

.hero-line {
    font-family: var(--display);
    font-size: 7rem;
    font-weight: 800;
    color: var(--white);
    letter-spacing: -0.01em;
    display: block;
    text-transform: uppercase;
}

.hero-line.accent {
    color: #e83544;
    position: relative;
}

.accent-strike {
    position: absolute;
    bottom: 4px;
    left: 0;
    width: 100%;
    height: 3px;
    background: var(--red);
    transform-origin: left;
    animation: clipIn 0.4s 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* ─── BUSCADOR ──────────────────────────────────────── */
.search-form {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
}

.search-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    max-width: 460px;
    background: rgba(15, 17, 22, 0.8);
    border: 1.5px solid rgba(255, 70, 85, 0.22);
    border-radius: 20px;
    overflow: visible;
    backdrop-filter: blur(16px);
    transition: border-color 0.2s, box-shadow 0.2s;
}

.search-corner {
    position: absolute;
    width: 8px;
    height: 8px;
    z-index: 2;
    pointer-events: none;
}

.search-corner--tl {
    top: -2px;
    left: -2px;
    border-top: 2px solid var(--red);
    border-left: 2px solid var(--red);
}

.search-corner--br {
    bottom: -2px;
    right: -2px;
    border-bottom: 2px solid var(--red);
    border-right: 2px solid var(--red);
}

.search-wrapper.focused {
    border-color: rgba(255, 70, 85, 0.55);
    box-shadow: 0 0 0 3px rgba(255, 70, 85, 0.07),
                inset 0 0 24px rgba(255, 70, 85, 0.04);
}

.search-icon {
    padding: 0 0.6rem 0 1rem;
    color: rgba(255, 70, 85, 0.4);
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

.search-input {
    flex: 1;
    padding: 1rem 0.5rem;
    background: transparent;
    border: none;
    outline: none;
    color: var(--white);
    font-family: var(--mono);
    font-size: 0.9rem;
    letter-spacing: 0.06em;
    min-width: 0;
}

.search-input::placeholder {
    color: rgba(240, 236, 224, 0.54);
    letter-spacing: 0.08em;
}

.search-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: var(--red);
    border: none;
    padding: 1rem 1.25rem;
    color: #fff;
    font-family: var(--display);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    cursor: pointer;
    flex-shrink: 0;
    min-width: 90px;
    border-radius: 0 20px 20px 0;
    justify-content: center;
    transition: background 0.15s, gap 0.2s;
    clip-path: polygon(8px 0%, 100% 0%, 100% 100%, 0% 100%);
}

.search-btn:hover:not(:disabled) {
    background: #e83544;
    gap: 0.65rem;
}

.search-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-arrow {
    flex-shrink: 0;
    color: rgba(255, 255, 255, 0.7);
}

.search-error {
    font-family: var(--mono);
    font-size: 0.6rem;
    color: var(--red);
    letter-spacing: 0.07em;
}

/* ─── SPINNER ───────────────────────────────────────── */
.spinner {
    display: inline-block;
    width: 13px;
    height: 13px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
}

/* ─── BOTTOM BAR ────────────────────────────────────── */
.bottom-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2.5rem 1.6rem 3.5rem;
    flex-shrink: 0;
}

.bottom-bar-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.bar-badge {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-family: var(--mono);
    font-size: 0.58rem;
    letter-spacing: 0.14em;
    color: var(--white-mid);
    text-transform: uppercase;
}

.badge-ping {
    position: relative;
    width: 6px;
    height: 6px;
    flex-shrink: 0;
}

.badge-ping::before,
.badge-ping::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
}

.badge-ping::before {
    background: #3ddc84;
    box-shadow: 0 0 5px rgba(61, 220, 132, 0.8);
}

.badge-ping::after {
    background: #3ddc84;
    animation: ping 1.8s ease-out infinite;
}

.bar-sep {
    color: rgba(255, 70, 85, 0.3);
    font-family: var(--mono);
    font-size: 0.6rem;
}

.bar-info {
    font-family: var(--mono);
    font-size: 0.58rem;
    letter-spacing: 0.1em;
    color: var(--white-dim);
    text-transform: uppercase;
}

.bottom-bar-right {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.bar-stat {
    font-family: var(--mono);
    font-size: 0.58rem;
    letter-spacing: 0.16em;
    color: var(--white-dim);
    text-transform: uppercase;
    position: relative;
}

.bar-stat::after {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 0;
    width: 0;
    height: 1px;
    background: var(--red);
    transition: width 0.2s;
}

.bar-stat:hover::after {
    width: 100%;
}

/* ─── RESPONSIVE ────────────────────────────────────── */
@media (max-width: 700px) {
    .hero-line {
        font-size: 4.2rem;
    }

    .hero {
        padding-left: 1.5rem;
    }

    .bottom-bar {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
    }

    .bottom-bar-right {
        display: none;
    }

    .nav {
        padding: 1.2rem 1.5rem;
    }

    .bg-grad-left {
        background: linear-gradient(to right,
            var(--bg) 0%,
            var(--bg) 40%,
            rgba(15, 17, 22, 0.9) 70%,
            rgba(15, 17, 22, 0.6) 100%);
    }

    .crosshair-deco {
        display: none;
    }
}
</style>