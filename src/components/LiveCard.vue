<template>
    <div v-if="game" class="live-card" @click="goToLive">
        <div class="live-bar"></div>

        <div class="live-left">
            <div class="live-champ-wrap">
                <img :src="champIcon" class="live-champ-img" @error="$event.target.style.display = 'none'" />
            </div>
            <div class="live-text">
                <div class="live-top">
                    <span class="live-dot"></span>
                    <span class="live-label">EN VIVO</span>
                </div>
                <span class="live-sub">{{ queueLabel }} · {{ elapsed }}</span>
                <span class="live-champ-name">{{ champName }}</span>
            </div>
        </div>

        <span class="live-arrow">Ver partida →</span>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getLiveGame, getChampionIconUrl } from '@/services/riot.js'

const props = defineProps({
    puuid: { type: String, required: true },
    version: { type: String, required: true },
})

const router = useRouter()
const game = ref(null)
const champMap = ref({})
let pollTimer = null
let tickTimer = null
const elapsedSecs = ref(0)

const QUEUES = {
    420: 'Solo/Duo', 440: 'Flex', 450: 'ARAM',
    400: 'Normal', 430: 'Ciegas', 900: 'URF', 0: 'Custom',
}

async function loadChampMap() {
    if (Object.keys(champMap.value).length) return
    try {
        const res = await fetch(`/ddragon/cdn/${props.version}/data/es_MX/champion.json`)
        const data = await res.json()
        const map = {}
        for (const c of Object.values(data.data)) map[Number(c.key)] = c.id
        champMap.value = map
    } catch (e) { console.error('champMap error', e) }
}

const myParticipant = computed(() =>
    game.value?.participants?.find(p => p.puuid === props.puuid) ?? null
)

const champName = computed(() =>
    champMap.value[myParticipant.value?.championId] ?? ''
)

const champIcon = computed(() =>
    champName.value ? getChampionIconUrl(champName.value, props.version) : ''
)

const queueLabel = computed(() =>
    QUEUES[game.value?.gameQueueConfigId] ?? `Modo ${game.value?.gameQueueConfigId}`
)

const elapsed = computed(() => {
    const m = Math.floor(elapsedSecs.value / 60)
    const s = String(elapsedSecs.value % 60).padStart(2, '0')
    return `${m}:${s}`
})

function startTick() {
    if (tickTimer) clearInterval(tickTimer)
    tickTimer = setInterval(() => elapsedSecs.value++, 1000)
}

async function poll() {
    if (!props.puuid) return
    try {
        const data = await getLiveGame(props.puuid)
        if (data?.gameId) {
            await loadChampMap()
            game.value = data
            elapsedSecs.value = Math.floor(data.gameLength ?? 0)
            startTick()
        } else {
            game.value = null
            if (tickTimer) clearInterval(tickTimer)
        }
    } catch {
        game.value = null
    }
}

function goToLive() {
    router.push({
        name: 'live',
        params: { puuid: props.puuid },
        query: { version: props.version },
    })
}

// Arranca solo cuando puuid tiene valor real
watch(() => props.puuid, (val) => {
    if (val) poll()
}, { immediate: true })

onMounted(() => {
    pollTimer = setInterval(poll, 60_000)
})

onUnmounted(() => {
    clearInterval(pollTimer)
    clearInterval(tickTimer)
})
</script>

<style scoped>
.live-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: .75rem 1.25rem .75rem .75rem;
    background: rgba(239, 68, 68, .06);
    border: 1px solid rgba(239, 68, 68, .25);
    border-radius: 14px;
    cursor: pointer;
    transition: background .15s, border-color .15s, transform .12s;
    overflow: hidden;
    position: relative;
}

.live-card:hover {
    background: rgba(239, 68, 68, .1);
    border-color: rgba(239, 68, 68, .45);
    transform: translateY(-1px);
}

.live-bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #ef4444;
    border-radius: 0;
}

.live-left {
    display: flex;
    align-items: center;
    gap: .85rem;
}

.live-champ-wrap {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    overflow: hidden;
    border: 1.5px solid rgba(200, 155, 60, .25);
    flex-shrink: 0;
    background: rgba(255, 255, 255, .05);
}

.live-champ-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.live-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.live-top {
    display: flex;
    align-items: center;
    gap: 5px;
}

.live-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #ef4444;
    box-shadow: 0 0 6px rgba(239, 68, 68, .9);
    animation: blink 1.2s ease-in-out infinite;
}

@keyframes blink {

    0%,
    100% {
        opacity: 1;
        transform: scale(1)
    }

    50% {
        opacity: .3;
        transform: scale(.55)
    }
}

.live-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .68rem;
    font-weight: 700;
    letter-spacing: .14em;
    color: #ef4444;
}

.live-sub {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .75rem;
    color: rgba(240, 232, 216, .4);
    letter-spacing: .04em;
}

.live-champ-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .85rem;
    font-weight: 600;
    color: #c89b3c;
    letter-spacing: .03em;
}

.live-arrow {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .78rem;
    letter-spacing: .08em;
    color: rgba(240, 232, 216, .3);
    white-space: nowrap;
    transition: color .15s;
}

.live-card:hover .live-arrow {
    color: #c89b3c;
}
</style>