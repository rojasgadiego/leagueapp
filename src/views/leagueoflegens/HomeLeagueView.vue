<template>
    <div class="home">

        <!-- CAPA 1: imagen de fondo (z-index: 0) -->
        <div class="bg-layer">
            <div class="bg-img"></div>
            <div class="bg-grad-left"></div>
            <div class="bg-grad-bottom"></div>
        </div>

        <!-- CAPA 2: todo el contenido (z-index: 10) -->
        <div class="content-layer">

            <!-- NAV -->
            <nav class="nav">
                <div class="nav-logo">
                    <span class="nav-logo-icon">◈</span>
                    <span class="nav-logo-text">AMGAMES</span>
                    <span class="nav-divider"></span>
                    <span class="nav-sub">LEAGUE OF LEGENDS</span>
                </div>
            </nav>

            <div class="hero">

                <div class="hero-eyebrow fade-in" style="--delay: 0.05s">
                    <span class="eyebrow-dot"></span>
                    ESTADÍSTICAS EN TIEMPO REAL
                </div>

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

            <!-- BADGE INFERIOR -->
            <div class="bottom-badge fade-in" style="--delay: 0.45s">
                <span class="badge-dot"></span>
                LAS · Americas · Actualizado en vivo
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

/* ─── FADE SIMPLE ───────────────────────────────────── */
@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.fade-in {
    opacity: 0;
    animation: fadeIn 0.55s ease forwards;
    animation-delay: var(--delay, 0s);
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

.bg-jinx-light {
    position: absolute;
    inset: 0;
    background:
        radial-gradient(ellipse 42% 60% at 80% 46%,
            rgba(255, 200, 80, 0.22) 0%,
            rgba(255, 140, 30, 0.10) 45%,
            transparent 70%),
        radial-gradient(ellipse 18% 28% at 84% 32%,
            rgba(255, 235, 150, 0.15) 0%,
            transparent 55%);
    mix-blend-mode: screen;
    animation: jinx-flicker 4s ease-in-out infinite;
}

@keyframes jinx-flicker {

    0%,
    100% {
        opacity: 1;
    }

    45% {
        opacity: 0.82;
    }

    50% {
        opacity: 0.95;
    }

    55% {
        opacity: 0.78;
    }

    60% {
        opacity: 1;
    }
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

.hero-eyebrow {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    color: #d4a84b;
    text-transform: uppercase;
}

.eyebrow-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #d4a84b;
    flex-shrink: 0;
    box-shadow: 0 0 7px rgba(212, 168, 75, 0.9);
    animation: pulse 2.2s ease-in-out infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.4;
        transform: scale(0.65);
    }
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
    padding: 1.05rem 0.5rem;
    background: transparent;
    border: none;
    outline: none;
    color: #f0ece0;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.95rem;
    letter-spacing: 0.05em;
    min-width: 0;
}

.search-input::placeholder {
    color: rgba(240, 236, 224, 0.18);
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
    border-radius: 0px 20px 20px 0px;
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

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* ─── BADGE INFERIOR ────────────────────────────────── */
.bottom-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 0 1.75rem 3.5rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    color: rgba(240, 236, 224, 0.2);
    text-transform: uppercase;
    flex-shrink: 0;
}

.badge-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #3a9c65;
    box-shadow: 0 0 6px rgba(58, 156, 101, 0.8);
    animation: pulse 2.5s ease-in-out infinite;
    flex-shrink: 0;
}

/* ─── RESPONSIVE ────────────────────────────────────── */
@media (max-width: 700px) {
    .hero-line {
        font-size: 3.5rem;
    }

    .hero {
        padding-left: 1.5rem;
    }

    .bottom-badge {
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