<template>
    <Transition name="live-badge">
        <div v-if="isLive" class="live-badge" @click="goToLive">

            <!-- barra roja izquierda — igual a .f-bar de las match cards -->
            <div class="live-bar"></div>

            <!-- icono campeón -->
            <div class="live-champ-wrap">
                <img v-if="championName" :src="getChampionIconUrl(championName, version)" class="live-champ-img"
                    @error="$event.target.style.display = 'none'" />
                <div v-else class="live-champ-placeholder"></div>
            </div>

            <!-- texto -->
            <div class="live-text">
                <div class="live-top">
                    <span class="live-dot"></span>
                    <span class="live-label">En vivo</span>
                </div>
                <span class="live-sub">{{ queueLabel }} · {{ elapsed }}</span>
            </div>

            <!-- flecha -->
            <span class="live-arrow">›</span>

        </div>
    </Transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getLiveGame, getChampionIconUrl } from '@/services/riot.js'

const props = defineProps({
    puuid: { type: String, required: true },
    version: { type: String, default: '14.24.1' },
})

const router = useRouter()
const isLive = ref(false)
const gameData = ref(null)
const elapsed = ref('0:00')
let pollTimer = null
let elapsedTimer = null

const QUEUE_LABELS = {
    420: 'Solo/Duo', 440: 'Flex', 450: 'ARAM',
    400: 'Normal', 430: 'Ciegas', 900: 'URF', 0: 'Custom',
}

const championName = computed(() => {
    if (!gameData.value) return null
    return gameData.value.participants?.find(p => p.puuid === props.puuid)?.championName ?? null
})

const queueLabel = computed(() => {
    if (!gameData.value) return ''
    return QUEUE_LABELS[gameData.value.gameQueueConfigId] ?? 'Partida'
})

function formatElapsed(startTime) {
    const s = Math.floor(Math.max(Date.now() - startTime, 0) / 1000)
    const m = Math.floor(s / 60)
    const ss = String(s % 60).padStart(2, '0')
    return `${m}:${ss}`
}

function startElapsedTick() {
    if (elapsedTimer) clearInterval(elapsedTimer)
    elapsedTimer = setInterval(() => {
        if (!gameData.value) return
        elapsed.value = formatElapsed(gameData.value.gameStartTime)
    }, 1000)
}

async function poll() {
    if (!props.puuid) return
    try {
        const data = await getLiveGame(props.puuid)
        if (data && data.gameId) {
            gameData.value = data
            isLive.value = true
            elapsed.value = formatElapsed(data.gameStartTime)
            startElapsedTick()
        } else {
            isLive.value = false
            gameData.value = null
            if (elapsedTimer) clearInterval(elapsedTimer)
        }
    } catch {
        isLive.value = false
        gameData.value = null
    }
}

function goToLive() {
    // No existe ruta 'live' en el router actual.
    // Para habilitarla agregá: { path: '/live/:puuid', name: 'live', component: LiveView }
    // y descomentá la línea de abajo:
    router.push({ name: 'live', params: { puuid: props.puuid } })
}

watch(() => props.puuid, (v) => {
    if (v) poll()
}, { immediate: true })

onMounted(() => {
    pollTimer = setInterval(poll, 60_000)
})

onUnmounted(() => {
    clearInterval(pollTimer)
    clearInterval(elapsedTimer)
})
</script>

<style scoped>
.live-badge {
    position: fixed;
    bottom: 1.75rem;
    right: 1.75rem;
    z-index: 200;

    display: flex;
    align-items: center;
    gap: 0;

    /* mismo estilo glass-card de la app */
    background: rgba(8, 12, 24, 0.82);
    backdrop-filter: blur(18px) saturate(1.6);
    -webkit-backdrop-filter: blur(18px) saturate(1.6);
    border: 1px solid rgba(200, 155, 60, 0.28);
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    min-width: 210px;

    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, .06),
        0 4px 28px rgba(0, 0, 0, .5),
        0 0 24px rgba(200, 155, 60, .07);

    transition: border-color .2s, box-shadow .2s, transform .15s;
}

.live-badge:hover {
    border-color: rgba(200, 155, 60, 0.55);
    transform: translateY(-2px);
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, .08),
        0 6px 32px rgba(0, 0, 0, .55),
        0 0 32px rgba(200, 155, 60, .14);
}

/* barra roja — igual que .f-bar */
.live-bar {
    width: 4px;
    align-self: stretch;
    flex-shrink: 0;
    background: #ef4444;
}

/* campeón */
.live-champ-wrap {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid rgba(200, 155, 60, .2);
    margin: 0 10px;
    background: rgba(255, 255, 255, .05);
}

.live-champ-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.live-champ-placeholder {
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, .06);
}

/* texto */
.live-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 10px 0;
}

.live-top {
    display: flex;
    align-items: center;
    gap: 5px;
}

/* dot pulsante */
.live-dot {
    display: block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #ef4444;
    box-shadow: 0 0 6px rgba(239, 68, 68, .9);
    flex-shrink: 0;
    animation: dot-blink 1.4s ease-in-out infinite;
}

@keyframes dot-blink {

    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.3;
        transform: scale(0.55);
    }
}

.live-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .72rem;
    font-weight: 600;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: #c89b3c;
}

.live-sub {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .7rem;
    letter-spacing: .04em;
    color: rgba(240, 232, 216, 0.35);
}

/* flecha */
.live-arrow {
    font-size: 1.15rem;
    color: rgba(240, 232, 216, 0.2);
    line-height: 1;
    padding: 0 12px 0 8px;
    flex-shrink: 0;
    transition: color .15s, transform .15s;
}

.live-badge:hover .live-arrow {
    color: #c89b3c;
    transform: translateX(3px);
}

/* entrada/salida */
.live-badge-enter-active {
    transition: opacity .4s ease, transform .4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.live-badge-leave-active {
    transition: opacity .25s ease, transform .25s ease;
}

.live-badge-enter-from {
    opacity: 0;
    transform: translateY(16px) scale(0.92);
}

.live-badge-leave-to {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
}
</style>