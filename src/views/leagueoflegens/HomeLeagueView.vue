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
                    <span class="nav-logo-icon">◈</span>
                    <span class="nav-logo-text">AMGAMES</span>
                    <span class="nav-divider"></span>
                    <span class="nav-sub">LEAGUE OF LEGENDS</span>
                </div>
            </nav>

            <div class="hero">
                <h1 class="hero-title">
                    <span class="hero-line fade-in" style="--delay: 0.15s">CONOCE</span>
                    <span class="hero-line accent fade-in" style="--delay: 0.25s">TU JUEGO</span>
                </h1>

                <form class="search-form fade-in" style="--delay: 0.35s" @submit.prevent="search">
                    <div class="search-wrapper" :class="{ focused: isFocused }">
                        <span class="search-icon">⌕</span>
                        <input v-model="searchInput" type="text" placeholder="GameName#TAG" class="search-input"
                            autocomplete="off" spellcheck="false" @focus="isFocused = true" @blur="isFocused = false" />
                        <button type="submit" class="search-btn" :disabled="loading">
                            <span v-if="loading" class="spinner"></span>
                            <span v-else>BUSCAR</span>
                            <svg class="btn-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M2 7H12M8 3L12 7L8 11" stroke="currentColor" stroke-width="1.5"
                                    stroke-linecap="square" />
                            </svg>
                        </button>
                    </div>
                    <p v-if="errorMsg" class="search-error">{{ errorMsg }}</p>
                </form>
            </div>

            <div class="bottom-bar" style="--delay: 0.6s">
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
                    <span class="bar-stat">CAMPEONES</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAccountByRiotId } from '@/services/riot.js'

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
    const [gameName, tagLine] = searchInput.value.split('#')
    loading.value = true
    try {
        await getAccountByRiotId(gameName, tagLine)
        router.push({ name: 'summoner', params: { gameName, tagLine } })
    } catch {
        errorMsg.value = 'Invocador no encontrado'
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

*,
*::before,
*::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

:root {
    --mono: 'IBM Plex Mono', monospace;
    --display: 'Syne', sans-serif;
    --red: #FF4655;
    --white: #f0ece0;
    --white-mid: rgba(240, 236, 224, 0.6);
    --white-dim: rgba(240, 236, 224, 0.3);
}

@keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
}

.fade-in {
    opacity: 0;
    animation: fadeIn 0.55s ease forwards;
    animation-delay: var(--delay, 0s);
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

@keyframes ping {
    0%   { transform: scale(1);   opacity: 0.8; }
    100% { transform: scale(2.4); opacity: 0;   }
}

/* ─── ROOT ──────────────────────────────────────────── */
.home {
    width: 100%;
    height: 100vh;
    position: relative;
    font-family: 'DM Sans', sans-serif;
    color: #f0ece0;
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
    background-image: url('/images/portada.png');
    background-size: cover;
    background-position: center right;
    filter: brightness(0.72) saturate(1.1);
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
    height: 32%;
    background: linear-gradient(to top, #07080f 0%, transparent 100%);
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
    padding: 1.75rem 2.5rem;
    flex-shrink: 0;
}

.nav-logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.nav-logo-icon {
    font-size: 1.2rem;
    color: #d4a84b;
    line-height: 1;
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
    gap: 1.6rem;
    padding: 0 0 0 3.5rem;
    max-width: 580px;
}

.hero-title {
    display: flex;
    flex-direction: column;
    line-height: 1;
}

.hero-line {
    font-family: 'Syne', sans-serif;
    font-size: 5.7rem;
    font-weight: 800;
    color: #f0ece0;
    letter-spacing: -0.02em;
    display: block;
    white-space: nowrap;
}

.hero-line.accent {
    color: #d4a84b;
}

/* ─── BUSCADOR ──────────────────────────────────────── */
.search-form {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
}

.search-wrapper {
    display: flex;
    align-items: center;
    background: rgba(7, 8, 15, 0.65);
    border: 2.5px solid rgba(212, 168, 75, 0.25);
    border-radius: 50px;
    overflow: hidden;
    backdrop-filter: blur(12px);
    transition: border-color 0.2s, box-shadow 0.2s;
    max-width: 480px;
}

.search-wrapper.focused {
    border-color: rgba(212, 168, 75, 0.65);
    box-shadow: 0 0 0 3px rgba(212, 168, 75, 0.07);
}

.search-icon {
    padding: 0 0.6rem 0 1rem;
    font-size: 1.15rem;
    color: rgba(212, 168, 75, 0.4);
    flex-shrink: 0;
    line-height: 1;
    user-select: none;
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
    background: #e8bc5e;
    gap: 0.65rem;
}

.search-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

.search-error {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.67rem;
    color: #b54040;
    letter-spacing: 0.06em;
}

.btn-arrow {
    flex-shrink: 0;
    color: rgba(255, 255, 255, 0.7);
}

/* ─── SPINNER ───────────────────────────────────────── */
.spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(7, 8, 15, 0.2);
    border-top-color: #07080f;
    border-radius: 50%;
    animation: spin 0.65s linear infinite;
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
        font-size: 3.5rem;
    }

    .hero {
        padding-left: 1.5rem;
    }

    .bottom-bar {
        padding-left: 1.5rem;
    }

    .nav {
        padding: 1.25rem 1.5rem;
    }

    .bg-grad-left {
        background: linear-gradient(to right,
            #07080f 0%,
            #07080f 50%,
            rgba(7, 8, 15, 0.92) 75%,
            rgba(7, 8, 15, 0.6) 100%);
    }
}
</style>