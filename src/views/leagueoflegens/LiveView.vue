<template>
    <div class="live-page">
        <button class="back-btn" @click="router.back()">← Volver</button>

        <div v-if="loading" class="live-loading">
            <div class="spin"></div>
            <span>Cargando partida...</span>
        </div>

        <div v-else-if="!game" class="live-empty">
            No hay partida en curso.
        </div>

        <div v-else class="live-content">
            <div class="live-header">
                <div class="lh-badge">
                    <span class="live-dot"></span> EN VIVO
                </div>
                <span class="lh-queue">{{ queueLabel }}</span>
                <span class="lh-time">{{ elapsed }}</span>
            </div>

            <div class="teams-grid">
                <div v-for="(team, idx) in teams" :key="idx" class="team-col"
                    :class="idx === 0 ? 'team-blue' : 'team-red'">
                    <div class="team-title">
                        {{ idx === 0 ? '🔵 Equipo Azul' : '🔴 Equipo Rojo' }}
                    </div>
                    <div v-for="p in team" :key="p.puuid" class="player-row" :class="{ 'is-me': p.puuid === puuid }">
                        <img :src="getChampionIconUrl(champMap[p.championId], version)" class="p-icon"
                            @error="$event.target.style.display = 'none'" />
                        <div class="p-info">
                            <span class="p-name">
                                {{ p.riotId }}
                                <span v-if="p.puuid === puuid" class="you-badge">TÚ</span>
                            </span>
                            <span class="p-champ">{{ champMap[p.championId] }}</span>
                        </div>
                        <div class="p-spells">
                            <img v-for="sid in [p.spell1Id, p.spell2Id]" :key="sid" :src="spellUrl(sid)"
                                class="spell-icon" @error="$event.target.style.display = 'none'" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getLiveGame, getChampionIconUrl } from '@/services/riot.js'

const route = useRoute()
const router = useRouter()
const puuid = route.params.puuid
const version = route.query.version || '14.1.1'

const game = ref(null)
const loading = ref(true)
const champMap = ref({})
const elapsedSecs = ref(0)
let tickTimer = null
let pollTimer = null

const QUEUES = {
    420: 'Solo/Duo', 440: 'Flex', 450: 'ARAM',
    400: 'Normal', 430: 'Ciegas', 900: 'URF', 0: 'Custom',
}

const SPELL_NAMES = {
    1: 'SummonerBoost', 3: 'SummonerExhaust', 4: 'SummonerFlash',
    6: 'SummonerHaste', 7: 'SummonerHeal', 11: 'SummonerSmite',
    12: 'SummonerTeleport', 14: 'SummonerDot', 21: 'SummonerBarrier',
    32: 'SummonerSnowball',
}

const queueLabel = computed(() =>
    QUEUES[game.value?.gameQueueConfigId] ?? `Modo ${game.value?.gameQueueConfigId}`
)

const elapsed = computed(() => {
    const m = Math.floor(elapsedSecs.value / 60)
    const s = String(elapsedSecs.value % 60).padStart(2, '0')
    return `${m}:${s}`
})

const teams = computed(() => {
    if (!game.value) return [[], []]
    return [
        game.value.participants.filter(p => p.teamId === 100),
        game.value.participants.filter(p => p.teamId === 200),
    ]
})

function spellUrl(id) {
    const name = SPELL_NAMES[id] ?? 'SummonerFlash'
    return `/ddragon/cdn/${version}/img/spell/${name}.png`
}

async function loadChampMap() {
    try {
        const res = await fetch(`/ddragon/cdn/${version}/data/es_MX/champion.json`)
        const data = await res.json()
        const map = {}
        for (const c of Object.values(data.data)) map[Number(c.key)] = c.id
        champMap.value = map
    } catch (e) { console.error(e) }
}

async function load() {
    loading.value = true
    try {
        await loadChampMap()
        const data = await getLiveGame(puuid)
        game.value = data ?? null
        if (data) {
            elapsedSecs.value = Math.floor(data.gameLength ?? 0)
            tickTimer = setInterval(() => elapsedSecs.value++, 1000)
        }
    } catch (e) {
        console.error(e)
        game.value = null
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    load()
    pollTimer = setInterval(load, 30_000)
})

onUnmounted(() => {
    clearInterval(tickTimer)
    clearInterval(pollTimer)
})
</script>

<style scoped>
.live-page {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    font-family: 'Barlow', sans-serif;
    color: #f0e8d8;
}

.back-btn {
    background: none;
    border: none;
    color: rgba(240, 232, 216, .3);
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .8rem;
    letter-spacing: .14em;
    text-transform: uppercase;
    cursor: pointer;
    margin-bottom: 1.5rem;
    transition: color .15s;
}

.back-btn:hover {
    color: #c89b3c;
}

.live-loading,
.live-empty {
    display: flex;
    align-items: center;
    gap: .75rem;
    color: rgba(240, 232, 216, .4);
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .9rem;
    letter-spacing: .1em;
    padding: 3rem 0;
}

.spin {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(200, 155, 60, .15);
    border-top-color: #c89b3c;
    border-radius: 50%;
    animation: spin .8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg)
    }
}

.live-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: .75rem 1.25rem;
    background: rgba(239, 68, 68, .06);
    border: 1px solid rgba(239, 68, 68, .2);
    border-radius: 12px;
}

.lh-badge {
    display: flex;
    align-items: center;
    gap: .4rem;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .7rem;
    font-weight: 700;
    letter-spacing: .14em;
    color: #ef4444;
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
        opacity: 1
    }

    50% {
        opacity: .3
    }
}

.lh-queue {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .85rem;
    color: #c89b3c;
    font-weight: 600;
}

.lh-time {
    font-family: 'Rajdhani', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #f0e8d8;
    margin-left: auto;
}

.teams-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

@media (max-width: 600px) {
    .teams-grid {
        grid-template-columns: 1fr;
    }
}

.team-col {
    background: rgba(255, 255, 255, .03);
    border: 1px solid rgba(255, 255, 255, .07);
    border-radius: 12px;
    overflow: hidden;
}

.team-blue {
    border-top: 2px solid rgba(96, 165, 250, .4);
}

.team-red {
    border-top: 2px solid rgba(248, 113, 113, .4);
}

.team-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .72rem;
    font-weight: 600;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: rgba(240, 232, 216, .35);
    padding: .65rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, .06);
}

.player-row {
    display: flex;
    align-items: center;
    gap: .7rem;
    padding: .55rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, .04);
    transition: background .1s;
}

.player-row:last-child {
    border-bottom: none;
}

.player-row:hover {
    background: rgba(255, 255, 255, .03);
}

.player-row.is-me {
    background: rgba(200, 155, 60, .08);
}

.p-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1.5px solid rgba(200, 155, 60, .2);
    flex-shrink: 0;
    object-fit: cover;
}

.p-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.p-name {
    font-size: .85rem;
    font-weight: 600;
    color: #f0e8d8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    gap: .35rem;
}

.p-champ {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .72rem;
    color: rgba(240, 232, 216, .4);
    letter-spacing: .03em;
}

.you-badge {
    font-size: .58rem;
    background: #c89b3c;
    color: #0a0e1a;
    padding: .1rem .3rem;
    border-radius: 2px;
    font-weight: 800;
    letter-spacing: .05em;
    flex-shrink: 0;
}

.p-spells {
    display: flex;
    gap: 2px;
    flex-shrink: 0;
}

.spell-icon {
    width: 22px;
    height: 22px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, .1);
    object-fit: cover;
}
</style>