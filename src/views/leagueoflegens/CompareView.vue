<template>
    <div class="compare-page">
        <div class="page-header">
            <button class="back-btn" @click="router.push('/')">← Volver</button>
            <h2>Comparar jugadores</h2>
        </div>

        <!-- Inputs para agregar jugadores -->
        <div class="add-players">
            <div v-for="(p, i) in playerInputs" :key="i" class="player-input-row">
                <input v-model="playerInputs[i]" type="text" :placeholder="`Jugador ${i + 1}: GameName#TAG`"
                    class="player-input" @keyup.enter="loadAll" />
                <button v-if="playerInputs.length > 2" class="remove-btn" @click="playerInputs.splice(i, 1)">✕</button>
            </div>
            <div class="add-row">
                <button v-if="playerInputs.length < 5" class="add-player-btn" @click="playerInputs.push('')">+ Agregar
                    jugador</button>
                <button class="compare-btn" @click="loadAll" :disabled="loading">
                    <span v-if="loading" class="spinner"></span>
                    <span v-else>Comparar</span>
                </button>
            </div>
            <p v-if="error" class="error-msg">{{ error }}</p>
        </div>

        <!-- Resultados -->
        <div v-if="players.length" class="results">

            <!-- Cards de perfil + ranked -->
            <div class="profiles-grid">
                <div v-for="p in players" :key="p.gameName" class="profile-card" @click="goTo(p)">
                    <div class="profile-avatar">{{ p.gameName[0]?.toUpperCase() }}</div>
                    <div class="profile-info">
                        <p class="profile-name">{{ p.gameName }}<span class="profile-tag">#{{ p.tagLine }}</span></p>
                        <template v-if="p.soloRank">
                            <p class="profile-rank">{{ p.soloRank.tier }} {{ p.soloRank.rank }}</p>
                            <p class="profile-lp">{{ p.soloRank.leaguePoints }} LP · {{ soloWR(p) }}% WR</p>
                        </template>
                        <p v-else class="profile-rank unranked">Sin clasificar</p>
                    </div>
                </div>
            </div>

            <!-- Tabla comparativa -->
            <div class="compare-table">
                <div class="ct-header">
                    <span class="ct-stat-label">Estadística (últimas 20)</span>
                    <span v-for="p in players" :key="p.gameName" class="ct-player-col">{{ p.gameName }}</span>
                </div>

                <div v-for="stat in compareStats" :key="stat.key" class="ct-row">
                    <span class="ct-stat-label">{{ stat.label }}</span>
                    <span v-for="p in players" :key="p.gameName" class="ct-val"
                        :class="{ best: isBest(stat, p), worst: isWorst(stat, p) }">
                        {{ getStat(stat, p) }}
                    </span>
                </div>
            </div>

            <!-- Campeones top por jugador -->
            <div class="champs-section">
                <h3 class="section-title">Campeones más jugados</h3>
                <div class="champs-columns">
                    <div v-for="p in players" :key="p.gameName" class="champ-column">
                        <p class="champ-col-header">{{ p.gameName }}</p>
                        <div v-for="champ in p.champStats.slice(0, 3)" :key="champ.name" class="champ-mini-row">
                            <img :src="getChampionIconUrl(champ.name, version)" class="champ-mini-icon"
                                @error="$event.target.style.display = 'none'" />
                            <span class="champ-mini-name">{{ champ.name }}</span>
                            <span class="champ-mini-wr"
                                :class="Math.round(champ.wins / champ.games * 100) >= 50 ? 'green' : 'red'">
                                {{ Math.round(champ.wins / champ.games * 100) }}%
                            </span>
                            <span class="champ-mini-games">{{ champ.games }}g</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
    getAccountByRiotId, getSummonerByPuuid, getRankedInfo,
    getMatchHistory, getMatch, getLatestVersion,
    getChampionIconUrl, calcChampionStats, calcKDA
} from '@/services/riot.js'

const router = useRouter()
const playerInputs = ref(['Dieg0ski#LAS', ''])
const players = ref([])
const loading = ref(false)
const error = ref('')
const version = ref('14.1.1')

const compareStats = [
    { key: 'winRate', label: 'Winrate', higher: true },
    { key: 'avgKills', label: 'Kills promedio', higher: true },
    { key: 'avgDeaths', label: 'Muertes promedio', higher: false },
    { key: 'avgAssists', label: 'Asistencias prom.', higher: true },
    { key: 'avgKDA', label: 'KDA promedio', higher: true },
    { key: 'avgCS', label: 'CS promedio', higher: true },
    { key: 'avgDamage', label: 'Daño promedio', higher: true },
]

function soloWR(p) {
    if (!p.soloRank) return 0
    const total = p.soloRank.wins + p.soloRank.losses
    return total ? Math.round((p.soloRank.wins / total) * 100) : 0
}

function getStat(stat, p) {
    const v = p.stats?.[stat.key]
    if (v === undefined) return '-'
    if (stat.key === 'winRate') return v + '%'
    if (stat.key === 'avgDamage') return Math.round(v / 1000) + 'k'
    return typeof v === 'number' ? v.toFixed(2) : v
}

function isBest(stat, p) {
    const vals = players.value.map(pl => p.stats?.[stat.key])
    const myVal = p.stats?.[stat.key]
    if (myVal === undefined) return false
    const best = stat.higher
        ? Math.max(...players.value.map(pl => pl.stats?.[stat.key] ?? -Infinity))
        : Math.min(...players.value.map(pl => pl.stats?.[stat.key] ?? Infinity))
    return myVal === best && players.value.length > 1
}

function isWorst(stat, p) {
    const myVal = p.stats?.[stat.key]
    if (myVal === undefined) return false
    const worst = stat.higher
        ? Math.min(...players.value.map(pl => pl.stats?.[stat.key] ?? Infinity))
        : Math.max(...players.value.map(pl => pl.stats?.[stat.key] ?? -Infinity))
    return myVal === worst && players.value.length > 1
}

function calcStats(matches, puuid) {
    if (!matches.length) return {}
    const participants = matches.map(m => m.info.participants.find(p => p.puuid === puuid)).filter(Boolean)
    const wins = participants.filter(p => p.win).length
    return {
        winRate: Math.round((wins / participants.length) * 100),
        avgKills: participants.reduce((a, p) => a + p.kills, 0) / participants.length,
        avgDeaths: participants.reduce((a, p) => a + p.deaths, 0) / participants.length,
        avgAssists: participants.reduce((a, p) => a + p.assists, 0) / participants.length,
        avgKDA: participants.reduce((a, p) => a + (p.deaths === 0 ? p.kills + p.assists : (p.kills + p.assists) / p.deaths), 0) / participants.length,
        avgCS: participants.reduce((a, p) => a + p.totalMinionsKilled + p.neutralMinionsKilled, 0) / participants.length,
        avgDamage: participants.reduce((a, p) => a + p.totalDamageDealtToChampions, 0) / participants.length,
    }
}

async function loadPlayer(input) {
    const parts = input.trim().split('#')
    if (parts.length !== 2) throw new Error(`Formato inválido: ${input}`)
    const [gameName, tagLine] = parts
    const account = await getAccountByRiotId(gameName, tagLine)
    const [summoner, matchIds] = await Promise.all([
        getSummonerByPuuid(account.puuid),
        getMatchHistory(account.puuid, { count: 20 })
    ])
    const [ranked, matchDetails] = await Promise.all([
        getRankedInfo(summoner.id),
        Promise.all(matchIds.map(id => getMatch(id)))
    ])
    const soloRank = ranked.find(r => r.queueType === 'RANKED_SOLO_5x5') || null
    return {
        gameName, tagLine,
        puuid: account.puuid,
        soloRank,
        matches: matchDetails,
        stats: calcStats(matchDetails, account.puuid),
        champStats: calcChampionStats(matchDetails, account.puuid),
    }
}

async function loadAll() {
    const inputs = playerInputs.value.filter(p => p.trim())
    if (inputs.length < 2) { error.value = 'Necesitás al menos 2 jugadores'; return }
    loading.value = true
    error.value = ''
    players.value = []
    try {
        version.value = await getLatestVersion()
        players.value = await Promise.all(inputs.map(loadPlayer))
    } catch (e) {
        error.value = e.message
    } finally {
        loading.value = false
    }
}

function goTo(p) {
    router.push({ name: 'summoner', params: { gameName: p.gameName, tagLine: p.tagLine } })
}
</script>

<style scoped>
.compare-page {
    min-height: 100vh;
    background: #0a0e1a;
    color: #e8e0c8;
    padding: 1.5rem;
    max-width: 1000px;
    margin: 0 auto;
}

.page-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.back-btn {
    background: none;
    border: none;
    color: #6b7a99;
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0;
    transition: color 0.15s;
}

.back-btn:hover {
    color: #c8973a;
}

h2 {
    margin: 0;
    font-size: 1.4rem;
    color: #e8e0c8;
}

/* Inputs */
.add-players {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 8px;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.player-input-row {
    display: flex;
    gap: 0.5rem;
}

.player-input {
    flex: 1;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 0.6rem 0.9rem;
    color: #e8e0c8;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.15s;
}

.player-input:focus {
    border-color: rgba(200, 155, 60, 0.4);
}

.player-input::placeholder {
    color: #3d4a6a;
}

.remove-btn {
    background: rgba(200, 60, 60, 0.1);
    border: 1px solid rgba(200, 60, 60, 0.2);
    color: #e05555;
    width: 36px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
}

.add-row {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.25rem;
}

.add-player-btn {
    background: none;
    border: 1px dashed rgba(255, 255, 255, 0.15);
    color: #6b7a99;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.15s;
}

.add-player-btn:hover {
    border-color: rgba(200, 155, 60, 0.3);
    color: #c8973a;
}

.compare-btn {
    background: #c8973a;
    border: none;
    padding: 0.5rem 1.5rem;
    color: #0a0e1a;
    font-weight: 700;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
    min-width: 110px;
    margin-left: auto;
}

.compare-btn:hover:not(:disabled) {
    background: #e0ab46;
}

.compare-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.error-msg {
    color: #e05555;
    font-size: 0.85rem;
    margin: 0;
}

/* Profiles */
.profiles-grid {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
}

.profile-card {
    flex: 1;
    min-width: 180px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 0.9rem 1rem;
    cursor: pointer;
    transition: border-color 0.15s;
}

.profile-card:hover {
    border-color: rgba(200, 155, 60, 0.3);
}

.profile-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 2px solid #c8973a;
    background: linear-gradient(135deg, #1a2440, #2a3a60);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: 700;
    color: #c8973a;
    flex-shrink: 0;
}

.profile-name {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
}

.profile-tag {
    color: #6b7a99;
    font-size: 0.75rem;
    font-weight: 400;
}

.profile-rank {
    margin: 0.2rem 0 0;
    font-size: 0.8rem;
    color: #c8973a;
    text-transform: capitalize;
    font-weight: 600;
}

.profile-rank.unranked {
    color: #6b7a99;
}

.profile-lp {
    margin: 0;
    font-size: 0.72rem;
    color: #6b7a99;
}

/* Compare table */
.compare-table {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 1.5rem;
}

.ct-header {
    display: grid;
    grid-template-columns: 1.5fr repeat(v-bind('players.length'), 1fr);
    padding: 0.6rem 1rem;
    font-size: 0.72rem;
    color: #3d4a6a;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.02);
}

.ct-row {
    display: grid;
    grid-template-columns: 1.5fr repeat(v-bind('players.length'), 1fr);
    padding: 0.6rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    align-items: center;
}

.ct-row:last-child {
    border-bottom: none;
}

.ct-row:hover {
    background: rgba(255, 255, 255, 0.02);
}

.ct-stat-label {
    font-size: 0.8rem;
    color: #6b7a99;
}

.ct-player-col {
    font-size: 0.75rem;
    color: #6b7a99;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.ct-val {
    text-align: center;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.15s;
}

.ct-val.best {
    color: #3cc878;
}

.ct-val.worst {
    color: #e05555;
}

/* Champs section */
.section-title {
    font-size: 0.8rem;
    color: #6b7a99;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin: 0 0 0.75rem;
}

.champs-columns {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.champ-column {
    flex: 1;
    min-width: 180px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 6px;
    padding: 0.75rem;
}

.champ-col-header {
    font-size: 0.8rem;
    color: #c8973a;
    font-weight: 600;
    margin: 0 0 0.6rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.champ-mini-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.4rem;
}

.champ-mini-icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid rgba(200, 155, 60, 0.2);
    flex-shrink: 0;
}

.champ-mini-name {
    flex: 1;
    font-size: 0.78rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.champ-mini-wr {
    font-size: 0.75rem;
    font-weight: 700;
}

.champ-mini-wr.green {
    color: #3cc878;
}

.champ-mini-wr.red {
    color: #e05555;
}

.champ-mini-games {
    font-size: 0.7rem;
    color: #6b7a99;
    min-width: 24px;
    text-align: right;
}

.spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(10, 14, 26, 0.3);
    border-top-color: #0a0e1a;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>