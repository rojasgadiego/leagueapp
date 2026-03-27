<template>
    <div class="page">

        <div v-if="error" class="error-state">
            <span class="error-icon">✕</span>
            <p>{{ error }}</p>
            <button class="retry-btn" @click="$router.go(0)">Reintentar</button>
        </div>

        <template v-else>
            <div class="scroll-root">

                <button class="back-btn" @click="$router.back()">
                    <span>←</span> Volver
                </button>

                <!-- ══ HEADER CARDS ══ -->
                <div class="header-cards">

                    <!-- Identity -->
                    <div class="glass-card card-identity">
                        <div class="avatar-ring">
                            <div class="avatar-inner">
                                <template v-if="!loading">
                                    <img v-if="account?.card?.small" :src="account.card.small" class="avatar-img"
                                        @error="$event.target.style.display = 'none'" />
                                    <template v-else>{{ gameName[0]?.toUpperCase() }}</template>
                                </template>
                                <div v-else class="skel skel-circle" style="width:100%;height:100%;border-radius:50%">
                                </div>
                            </div>
                        </div>
                        <div class="identity-text">
                            <template v-if="!loading">
                                <h1>{{ gameName }}</h1>
                                <div class="identity-meta">
                                    <span class="pill">#{{ tagLine }}</span>
                                    <span class="pill">LVL {{ account?.account_level || 0 }}</span>
                                </div>
                            </template>
                            <template v-else>
                                <div class="skel skel-text" style="width:160px;height:2.5rem;margin-bottom:.5rem"></div>
                                <div style="display:flex;gap:.35rem">
                                    <div class="skel skel-text" style="width:60px;height:20px;border-radius:100px">
                                    </div>
                                    <div class="skel skel-text" style="width:60px;height:20px;border-radius:100px">
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>

                    <!-- Rank -->
                    <div class="glass-card card-ranked">
                        <template v-if="!loading">
                            <!-- Current rank -->
                            <div class="rank-block">
                                <span class="rank-queue-label">Competitivo</span>
                                <div class="rank-body" v-if="currentRank">
                                    <div class="rank-badge">
                                        <img :src="`/images/emblemasvalorant/${currentRank.tier?.name}.png`" alt="Emblema de liga"
                                            class="rank-emblem-img" @error="$event.target.style.display = 'none'" />
                                        <span class="rank-badge-letter">{{ rankInitials(currentRank.tier?.name)
                                            }}</span>
                                    </div>
                                    <div class="rank-info">
                                        <div class="rank-tier-row">
                                            <span class="rank-tier-text">{{ currentRank.tier?.name }}</span>
                                        </div>
                                        <span class="rank-record">
                                            {{ wins }}V {{ losses }}D
                                            <span :class="winrate >= 50 ? 'wr-pos' : 'wr-neg'">({{ winrate }}%)</span>
                                            <span class="rank-lp">▲ {{ currentRank.rr }} RR</span>
                                        </span>
                                        <div class="wr-bar">
                                            <div class="wr-fill"
                                                :style="{ width: winrate + '%', background: winrate >= 50 ? 'var(--win)' : 'var(--loss)' }">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else class="rank-unranked">Sin clasificar</div>
                            </div>

                            <!-- Peak rank -->
                            <div class="rank-block rank-divider" v-if="peak">
                                <span class="rank-queue-label">Peak</span>
                                <div class="rank-body">
                                    <div class="rank-badge peak-badge">
                                        <img :src="`/images/emblemasvalorant/${peak.tier?.name}.png`" alt="Emblema de liga"
                                            class="rank-emblem-img" @error="$event.target.style.display = 'none'" />
                                        <span class="rank-badge-letter">{{ rankInitials(peak.tier?.name) }}</span>
                                    </div>
                                    <div class="rank-info">
                                        <div class="rank-tier-row">
                                            <span class="rank-tier-text peak-text">{{ peak.tier?.name }}</span>
                                        </div>
                                        <span class="rank-record">Mejor rango alcanzado</span>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <div v-for="i in 2" :key="i" class="rank-block" :class="{ 'rank-divider': i > 1 }">
                                <div class="skel skel-text" style="width:70px;height:12px;margin-bottom:.6rem"></div>
                                <div class="rank-body">
                                    <div class="skel skel-circle"
                                        style="width:64px;height:64px;border-radius:50%;flex-shrink:0"></div>
                                    <div style="display:flex;flex-direction:column;gap:.4rem">
                                        <div class="skel skel-text" style="width:130px;height:1.8rem"></div>
                                        <div class="skel skel-text" style="width:100px;height:14px"></div>
                                        <div class="skel skel-text" style="width:120px;height:3px;border-radius:2px">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>

                    <!-- Metrics -->
                    <div class="glass-card card-metrics">
                        <template v-if="!loading && matches.length">
                            <span class="card-eyebrow">Últimas {{ matches.length }} partidas</span>
                            <div class="metrics-grid">
                                <div class="metric-item" v-for="m in headerMetrics" :key="m.label">
                                    <span class="metric-val" :class="m.cls">{{ m.val }}</span>
                                    <span class="metric-lbl">{{ m.label }}</span>
                                </div>
                            </div>
                        </template>
                        <template v-else-if="loading">
                            <div class="skel skel-text" style="width:120px;height:10px;margin-bottom:.65rem"></div>
                            <div class="metrics-grid">
                                <div class="metric-item" v-for="i in 5" :key="i">
                                    <div class="skel skel-text" style="width:44px;height:1.6rem;margin-bottom:4px">
                                    </div>
                                    <div class="skel skel-text" style="width:38px;height:10px"></div>
                                </div>
                            </div>
                        </template>
                    </div>

                </div>

                <!-- ══ BODY ══ -->
                <div class="body-grid">

                    <!-- Matches -->
                    <div class="glass-card card-matches">
                        <div class="card-header">
                            <span class="card-title">Historial de partidas</span>
                            <div class="queue-filters">
                                <button v-for="q in queues" :key="q.id"
                                    :class="['qf-btn', { active: activeQueue === q.id }]" @click="activeQueue = q.id">{{
                                        q.label }}</button>
                            </div>
                        </div>

                        <!-- Skeleton -->
                        <div v-if="loading" class="match-scroll-area">
                            <div class="day-group" v-for="g in 2" :key="g">
                                <div class="day-header">
                                    <div class="skel skel-text" style="width:28px;height:9px"></div>
                                    <div class="day-line"></div>
                                    <div class="skel skel-text" style="width:40px;height:9px"></div>
                                </div>
                                <div v-for="i in 3" :key="i" class="f-card skel-card">
                                    <div class="f-bar skel" style="align-self:stretch;border-radius:0"></div>
                                    <div class="f-icon">
                                        <div class="skel" style="width:38px;height:38px;border-radius:8px"></div>
                                    </div>
                                    <div class="f-info">
                                        <div class="skel skel-text" style="width:70px;height:12px;margin-bottom:5px">
                                        </div>
                                        <div class="skel skel-text" style="width:120px;height:10px"></div>
                                    </div>
                                    <div class="f-kda">
                                        <div class="skel skel-text" style="width:56px;height:13px;margin:0 auto 4px">
                                        </div>
                                        <div class="skel skel-text" style="width:40px;height:10px;margin:0 auto"></div>
                                    </div>
                                    <div class="f-stat">
                                        <div class="skel skel-text" style="width:24px;height:12px;margin:0 auto 4px">
                                        </div>
                                        <div class="skel skel-text" style="width:16px;height:9px;margin:0 auto"></div>
                                    </div>
                                    <div class="f-stat">
                                        <div class="skel skel-text" style="width:28px;height:12px;margin:0 auto 4px">
                                        </div>
                                        <div class="skel skel-text" style="width:20px;height:9px;margin:0 auto"></div>
                                    </div>
                                    <div class="f-badge">
                                        <div class="skel skel-text" style="width:52px;height:22px;border-radius:4px">
                                        </div>
                                    </div>
                                    <div></div>
                                </div>
                            </div>
                        </div>

                        <!-- Real matches -->
                        <div v-else class="match-scroll-area">
                            <template v-for="group in groupedMatches" :key="group.label">
                                <div class="day-group">
                                    <div class="day-header">
                                        <span class="day-label">{{ group.label }}</span>
                                        <div class="day-line"></div>
                                        <span class="day-summary">{{ group.wins }}V · {{ group.losses }}D</span>
                                    </div>

                                    <template v-for="match in group.matches" :key="match.metadata?.matchid">
                                        <div class="f-card" :class="matchResult(match) ? 'f-card-win' : 'f-card-loss'"
                                            @click="toggleExpand(match.metadata?.matchid)">
                                            <div class="f-bar"
                                                :style="{ background: matchResult(match) ? 'var(--win)' : 'var(--loss)' }">
                                            </div>

                                            <!-- Agent icon -->
                                            <div class="f-icon">
                                                <div class="f-sq">
                                                    <img v-if="playerInMatch(match)?.assets?.agent?.small"
                                                        :src="playerInMatch(match).assets.agent.small"
                                                        class="f-champ-img"
                                                        @error="$event.target.style.display = 'none'" />
                                                    <span v-else class="f-champ-fallback">AG</span>
                                                </div>
                                            </div>

                                            <!-- Info -->
                                            <div class="f-info">
                                                <div class="f-cname">{{ match.metadata?.map }}</div>
                                                <div class="f-meta">
                                                    {{ match.metadata?.mode }} ·
                                                    {{ relativeTime(match.metadata?.game_start) }}
                                                </div>
                                            </div>

                                            <!-- KDA -->
                                            <div class="f-kda">
                                                <div class="f-kda-nums">
                                                    {{ playerInMatch(match)?.stats?.kills }}/<span class="f-d">{{
                                                        playerInMatch(match)?.stats?.deaths }}</span>/{{
                                                            playerInMatch(match)?.stats?.assists }}
                                                </div>
                                                <div class="f-kda-sub">
                                                    {{ calcKDA(playerInMatch(match)?.stats?.kills,
                                                        playerInMatch(match)?.stats?.deaths,
                                                        playerInMatch(match)?.stats?.assists) }} KDA
                                                </div>
                                            </div>

                                            <!-- ACS -->
                                            <div class="f-stat">
                                                <div class="f-stat-v">{{ playerACS(match) }}</div>
                                                <div class="f-stat-l">ACS</div>
                                            </div>

                                            <!-- HS% -->
                                            <div class="f-stat">
                                                <div class="f-stat-v">{{ playerHS(match) }}%</div>
                                                <div class="f-stat-l">HS%</div>
                                            </div>

                                            <!-- Badge -->
                                            <div class="f-badge">
                                                <span class="f-badge-inner"
                                                    :class="matchResult(match) ? 'fb-win' : 'fb-loss'">
                                                    {{ matchResult(match) ? 'Victoria' : 'Derrota' }}
                                                </span>
                                            </div>

                                            <!-- RR -->
                                            <div v-if="playerInMatch(match)?.mmr_change_to_last_game != null"
                                                :class="['f-rr', playerInMatch(match).mmr_change_to_last_game > 0 ? 'rr-up' : 'rr-dn']">
                                                {{ playerInMatch(match).mmr_change_to_last_game > 0 ? '+' : '' }}{{
                                                    playerInMatch(match).mmr_change_to_last_game }}
                                            </div>
                                            <div v-else class="f-chevron"
                                                :class="{ open: expandedId === match.metadata?.matchid }">›</div>
                                        </div>

                                        <!-- Accordion panel -->
                                        <Transition name="acc">
                                            <div v-if="expandedId === match.metadata?.matchid" class="acc-panel">
                                                <div class="acc-stats-row">
                                                    <div class="acc-stat-pill" v-for="(s, i) in accStats(match)"
                                                        :key="i">
                                                        <span class="acc-stat-val" :class="s.cls">{{ s.val }}</span>
                                                        <span class="acc-stat-lbl">{{ s.label }}</span>
                                                    </div>
                                                </div>
                                                <div class="acc-bottom">
                                                    <!-- Team attackers -->
                                                    <div class="acc-team-col">
                                                        <span class="acc-team-title"
                                                            :class="getTeamWin(match, 'red') ? 'team-win' : 'team-loss'">
                                                            {{ getTeamWin(match, 'red') ? '⬆ Victoria' : '⬇ Derrota' }}
                                                        </span>
                                                        <div v-for="p in getTeamPlayers(match, 'red')" :key="p.puuid"
                                                            class="acc-player"
                                                            :class="{ 'acc-player-me': p.name?.toLowerCase() === gameName.toLowerCase() && p.tag?.toLowerCase() === tagLine.toLowerCase() }">
                                                            <img v-if="p.assets?.agent?.small"
                                                                :src="p.assets.agent.small" class="acc-p-icon"
                                                                @error="$event.target.style.display = 'none'" />
                                                            <span class="acc-p-icon-fallback" v-else>AG</span>
                                                            <span class="acc-p-name">{{ p.name }}#{{ p.tag }}</span>
                                                            <span class="acc-p-kda">{{ p.stats?.kills }}/{{
                                                                p.stats?.deaths }}/{{ p.stats?.assists }}</span>
                                                        </div>
                                                    </div>

                                                    <!-- Score center -->
                                                    <div class="acc-score-col">
                                                        <span class="acc-items-lbl">Resultado</span>
                                                        <div class="acc-score-display">
                                                            <span
                                                                :class="matchResult(match) ? 'score-win' : 'score-loss'">{{
                                                                    matchScore(match) }}</span>
                                                        </div>
                                                        <button class="see-full-btn"
                                                            @click.stop="goToMatch(match.metadata?.matchid)">
                                                            Ver partida →
                                                        </button>
                                                    </div>

                                                    <!-- Team defenders -->
                                                    <div class="acc-team-col">
                                                        <span class="acc-team-title"
                                                            :class="getTeamWin(match, 'blue') ? 'team-win' : 'team-loss'">
                                                            {{ getTeamWin(match, 'blue') ? '⬆ Victoria' : '⬇ Derrota' }}
                                                        </span>
                                                        <div v-for="p in getTeamPlayers(match, 'blue')" :key="p.puuid"
                                                            class="acc-player"
                                                            :class="{ 'acc-player-me': p.name?.toLowerCase() === gameName.toLowerCase() && p.tag?.toLowerCase() === tagLine.toLowerCase() }">
                                                            <img v-if="p.assets?.agent?.small"
                                                                :src="p.assets.agent.small" class="acc-p-icon"
                                                                @error="$event.target.style.display = 'none'" />
                                                            <span class="acc-p-icon-fallback" v-else>AG</span>
                                                            <span class="acc-p-name">{{ p.name }}#{{ p.tag }}</span>
                                                            <span class="acc-p-kda">{{ p.stats?.kills }}/{{
                                                                p.stats?.deaths }}/{{ p.stats?.assists }}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Transition>
                                    </template>
                                </div>
                            </template>
                        </div>
                    </div>

                    <!-- Agents sidebar -->
                    <div class="glass-card card-champions">
                        <div class="card-header">
                            <div class="queue-filters">
                                <button class="qf-btn active">Agentes</button>
                            </div>
                        </div>
                        <template v-if="loading">
                            <div class="champ-stats-list">
                                <div v-for="i in 8" :key="i" class="champ-stat-row">
                                    <div class="skel skel-circle"
                                        style="width:38px;height:38px;border-radius:8px;flex-shrink:0"></div>
                                    <div class="cs-info">
                                        <div class="skel skel-text" style="width:80px;height:12px;margin-bottom:5px">
                                        </div>
                                        <div class="skel skel-text" style="width:100%;height:2px;border-radius:2px">
                                        </div>
                                    </div>
                                    <div class="cs-right">
                                        <div class="skel skel-text" style="width:34px;height:14px"></div>
                                        <div class="skel skel-text" style="width:22px;height:10px;margin-top:2px"></div>
                                    </div>
                                    <div class="skel skel-text" style="width:30px;height:12px"></div>
                                </div>
                            </div>
                        </template>
                        <div v-else class="champ-stats-list">
                            <div v-for="a in agentStats.slice(0, 8)" :key="a.name" class="champ-stat-row">
                                <img v-if="a.icon" :src="a.icon" class="cs-icon"
                                    @error="$event.target.style.display = 'none'" />
                                <div v-else class="cs-icon-fallback">{{ a.name?.slice(0, 2).toUpperCase() }}</div>
                                <div class="cs-info">
                                    <span class="cs-name">{{ a.name }}</span>
                                    <div class="cs-bar-wrap">
                                        <div class="cs-bar-fill"
                                            :style="{ width: Math.round(a.wins / a.games * 100) + '%', background: Math.round(a.wins / a.games * 100) >= 50 ? '#4ade80' : '#f87171' }">
                                        </div>
                                    </div>
                                </div>
                                <div class="cs-right">
                                    <span class="cs-wr"
                                        :class="Math.round(a.wins / a.games * 100) >= 50 ? 'wr-pos' : 'wr-neg'">
                                        {{ Math.round(a.wins / a.games * 100) }}%
                                    </span>
                                    <span class="cs-games">{{ a.games }}g</span>
                                </div>
                                <span class="cs-kda" :class="kdaClass(calcKDA(a.kills, a.deaths, a.assists))">
                                    {{ calcKDA(a.kills, a.deaths, a.assists) }}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                <div class="page-bottom-pad"></div>
            </div>
        </template>
    </div>
</template>


<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPlayerProfile } from '@/services/valorant.js'

const route = useRoute()
const router = useRouter()

const account = ref(null)
const mmr = ref(null)
const matches = ref([])
const loading = ref(true)
const error = ref('')
const activeQueue = ref('all')
const expandedId = ref(null)

// ── Params ───────────────────────────────
const gameName = computed(() => route.params.gameName || '')
const tagLine = computed(() => route.params.tagLine || '')

const queues = [
    { id: 'all', label: 'Todas' },
    { id: 'competitive', label: 'Competitivo' },
    { id: 'unrated', label: 'Sin clasificar' },
    { id: 'spikerush', label: 'Spike Rush' },
]

// ── Fetch ────────────────────────────────
watch(
    () => [gameName.value, tagLine.value],
    async ([name, tag]) => {
        if (!name || !tag) { error.value = 'Nombre o tag inválido'; loading.value = false; return }
        loading.value = true; error.value = ''
        try {
            const data = await getPlayerProfile(name, tag, 'competitive')
            account.value = data.account
            mmr.value = data.mmr
            matches.value = data.matches ?? []
        } catch (e) {
            error.value = e?.message ?? 'No se pudo cargar el perfil.'
        } finally {
            loading.value = false
        }
    },
    { immediate: true }
)

// ── MMR ──────────────────────────────────
const currentRank = computed(() => mmr.value?.current ?? null)
const peak = computed(() => mmr.value?.peak ?? null)

function rankInitials(name = '') {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

// ── Match helpers ────────────────────────
function playerInMatch(match) {
    return match.players?.all_players?.find(
        p => p.name?.toLowerCase() === gameName.value.toLowerCase() &&
            p.tag?.toLowerCase() === tagLine.value.toLowerCase()
    ) ?? null
}

function matchResult(match) {
    const player = playerInMatch(match)
    if (!player) return false
    return !!match.teams?.[player.team?.toLowerCase()]?.has_won
}

function matchScore(match) {
    const blue = match.teams?.blue?.rounds_won ?? 0
    const red = match.teams?.red?.rounds_won ?? 0
    return `${Math.max(blue, red)} - ${Math.min(blue, red)}`
}

function relativeTime(ts) {
    if (!ts) return ''
    const diff = Date.now() / 1000 - ts
    if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
    return `hace ${Math.floor(diff / 86400)}d`
}

function goToMatch(id) {
    router.push({ name: 'match', params: { matchId: id } })
}

function toggleExpand(id) {
    expandedId.value = expandedId.value === id ? null : id
}

function getTeamPlayers(match, team) {
    return match.players?.all_players?.filter(p => p.team?.toLowerCase() === team) ?? []
}

function getTeamWin(match, team) {
    return !!match.teams?.[team]?.has_won
}

function playerACS(match) {
    const p = playerInMatch(match)
    if (!p) return '—'
    const totalRounds = (match.teams?.blue?.rounds_won ?? 0) + (match.teams?.red?.rounds_won ?? 0)
    return totalRounds ? Math.round((p.stats?.score ?? 0) / totalRounds) : '—'
}

function playerHS(match) {
    const p = playerInMatch(match)
    if (!p) return '—'
    const hs = p.stats?.headshots ?? 0
    const total = hs + (p.stats?.bodyshots ?? 0) + (p.stats?.legshots ?? 0)
    return total ? Math.round((hs / total) * 100) : '—'
}

function calcKDA(k = 0, d = 0, a = 0) {
    const deaths = d || 1
    return ((k + a) / deaths).toFixed(2)
}

function kdaClass(v) {
    const n = parseFloat(v)
    if (isNaN(n)) return ''
    if (n >= 5) return 'c-amber'
    if (n >= 3) return 'c-pos'
    if (n >= 2) return 'c-muted'
    return 'c-neg'
}

function accStats(match) {
    const p = playerInMatch(match)
    if (!p) return []
    const hs = playerHS(match)
    const acs = playerACS(match)
    const kda = calcKDA(p.stats?.kills, p.stats?.deaths, p.stats?.assists)
    const ddelta = p.damage_made && p.damage_received
        ? Math.round(p.damage_made - p.damage_received)
        : null
    return [
        { val: kda, label: 'KDA', cls: kdaClass(kda) },
        { val: acs, label: 'ACS', cls: 'c-blue' },
        { val: hs + '%', label: 'HS%', cls: 'c-teal' },
        { val: p.stats?.kills ?? '—', label: 'Kills', cls: 'c-white' },
        { val: p.stats?.assists ?? '—', label: 'Asistencias', cls: 'c-purple' },
        { val: ddelta !== null ? (ddelta >= 0 ? '+' + ddelta : String(ddelta)) : '—', label: 'DD±', cls: ddelta !== null && ddelta >= 0 ? 'c-pos' : 'c-neg' },
    ]
}

// ── Stats ────────────────────────────────
const wins = computed(() => matches.value.filter(m => matchResult(m)).length)
const losses = computed(() => matches.value.length - wins.value)

const winrate = computed(() => {
    if (!matches.value.length) return 0
    return Math.round((wins.value / matches.value.length) * 100)
})

const avgKDA = computed(() => {
    const players = matches.value.map(m => playerInMatch(m)).filter(Boolean)
    if (!players.length) return '—'
    const sum = players.reduce((acc, p) => acc + (p.stats?.kills + p.stats?.assists) / (p.stats?.deaths || 1), 0)
    return (sum / players.length).toFixed(2)
})

const avgACS = computed(() => {
    const players = matches.value.map(m => playerInMatch(m)).filter(Boolean)
    if (!players.length) return '—'
    const sum = players.reduce((acc, p) => acc + (p.stats?.score ?? 0), 0)
    const rounds = matches.value.reduce((acc, m) =>
        acc + (m.teams?.blue?.rounds_won ?? 0) + (m.teams?.red?.rounds_won ?? 0), 0)
    return rounds ? Math.round(sum / rounds) : '—'
})

const avgHS = computed(() => {
    const players = matches.value.map(m => playerInMatch(m)).filter(Boolean)
    if (!players.length) return '—'
    const hs = players.reduce((acc, p) => acc + (p.stats?.headshots ?? 0), 0)
    const total = players.reduce((acc, p) =>
        acc + (p.stats?.headshots ?? 0) + (p.stats?.bodyshots ?? 0) + (p.stats?.legshots ?? 0), 0)
    return total ? Math.round((hs / total) * 100) : '—'
})

const headerMetrics = computed(() => [
    { val: avgKDA.value, label: 'KDA', cls: kdaClass(avgKDA.value) },
    { val: avgHS.value + '%', label: 'HS%', cls: 'c-teal' },
    { val: avgACS.value, label: 'ACS', cls: 'c-blue' },
    { val: winrate.value + '%', label: 'Winrate', cls: winrate.value >= 50 ? 'c-pos' : 'c-neg' },
    { val: `${wins.value}/${losses.value}`, label: 'V / D', cls: 'c-white' },
])

// ── Grouped matches ──────────────────────
const filteredMatches = computed(() => {
    if (activeQueue.value === 'all') return matches.value
    return matches.value.filter(m =>
        m.metadata?.mode?.toLowerCase() === activeQueue.value.toLowerCase()
    )
})

const groupedMatches = computed(() => {
    const groups = []
    const map = new Map()
    const now = new Date()
    const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1)
    const sameDay = (a, b) =>
        a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

    for (const match of filteredMatches.value) {
        const d = new Date((match.metadata?.game_start ?? 0) * 1000)
        let label
        if (sameDay(d, now)) label = 'Hoy'
        else if (sameDay(d, yesterday)) label = 'Ayer'
        else {
            label = d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' })
            label = label.charAt(0).toUpperCase() + label.slice(1)
        }
        if (!map.has(label)) {
            map.set(label, { label, matches: [], wins: 0, losses: 0 })
            groups.push(map.get(label))
        }
        const g = map.get(label)
        g.matches.push(match)
        if (matchResult(match)) g.wins++; else g.losses++
    }
    return groups
})

// ── Agent stats ──────────────────────────
const agentStats = computed(() => {
    const map = new Map()
    for (const match of matches.value) {
        const p = playerInMatch(match)
        if (!p) continue
        const name = p.character ?? p.agent ?? 'Unknown'
        const icon = p.assets?.agent?.small ?? null
        if (!map.has(name)) map.set(name, { name, icon, games: 0, wins: 0, kills: 0, deaths: 0, assists: 0 })
        const entry = map.get(name)
        entry.games++
        if (matchResult(match)) entry.wins++
        entry.kills += p.stats?.kills ?? 0
        entry.deaths += p.stats?.deaths ?? 0
        entry.assists += p.stats?.assists ?? 0
    }
    return [...map.values()].sort((a, b) => b.games - a.games)
})
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow:ital,wght@0,300;0,400;0,500;1,300&family=Barlow+Condensed:wght@400;600;700&display=swap');

*,
*::before,
*::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0
}

:root {
    --gb: rgba(8, 12, 24, 0.55);
    --gd: rgba(255, 255, 255, 0.07);
    --blur: 18px;
    --r: 16px;
    --accent: #FF4655;
    --as: rgba(255, 70, 85, 0.12);
    --ag: rgba(255, 70, 85, 0.25);
    --win: #4ade80;
    --loss: #f87171;
    --tb: #f0e8d8;
    --tm: rgba(240, 232, 216, 0.5);
    --td: rgba(240, 232, 216, 0.2);
    --gap: .75rem;
}

/* ─── SKELETON ───────────────────────────────────────── */
.skel {
    background: linear-gradient(90deg,
            rgba(255, 255, 255, .04) 25%,
            rgba(255, 255, 255, .09) 50%,
            rgba(255, 255, 255, .04) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.6s ease-in-out infinite;
    border-radius: 4px;
    flex-shrink: 0;
}

.skel-text,
.skel-circle {
    display: block
}

@keyframes shimmer {
    0% {
        background-position: 200% 0
    }

    100% {
        background-position: -200% 0
    }
}

.skel-card {
    pointer-events: none
}

/* ─── BACKGROUNDS ────────────────────────────────────── */
.bg-vignette {
    position: fixed;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background:
        radial-gradient(ellipse 140% 70% at 50% 0%, rgba(4, 6, 14, .2) 0%, rgba(4, 6, 14, .88) 65%),
        linear-gradient(to bottom, transparent 0%, rgba(4, 6, 14, .47) 60%, rgba(4, 6, 14, .9) 100%);
}

.bg-grain {
    position: fixed;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    opacity: .04;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 160px;
}

/* ─── PAGE ───────────────────────────────────────────── */
.page {
    position: relative;
    min-height: 100vh;
    width: 100%;
    font-family: 'Barlow', sans-serif;
    font-size: 15px;
    color: var(--tb);
    background: #07080c;
}

.scroll-root {
    position: relative;
    z-index: 10;
    max-width: 1600px;
    width: 100%;
    margin: 0 auto;
    padding: 1.5rem 2rem 0;
    display: flex;
    flex-direction: column;
    gap: var(--gap);
}

.page-bottom-pad {
    height: 2rem
}

/* ─── ERROR ──────────────────────────────────────────── */
.error-state {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.25rem;
    background: #090f25;
    color: var(--tm);
    font-family: 'Barlow Condensed', sans-serif;
    letter-spacing: .15em;
    text-transform: uppercase;
    font-size: .9rem;
}

.error-icon {
    font-size: 2rem;
    color: var(--loss)
}

.retry-btn {
    padding: .5rem 1.5rem;
    background: none;
    border: 1px solid var(--accent);
    color: var(--accent);
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .9rem;
    letter-spacing: .1em;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 4px;
    transition: background .15s;
}

.retry-btn:hover {
    background: var(--as)
}

/* ─── BACK BUTTON ────────────────────────────────────── */
.back-btn {
    background: #080c1a;
    color: var(--td);
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1rem;
    letter-spacing: .14em;
    text-transform: uppercase;
    cursor: pointer;
    height: 50px;
    align-self: flex-start;
    padding: 10px;
    margin-bottom: 20px;
    transition: color .15s;
    display: flex;
    align-items: center;
    gap: .4rem;
    border-radius: 20px;
    border: 0.5px solid var(--accent);
}

.back-btn:hover {
    color: var(--accent)
}

/* ─── GLASS CARD ─────────────────────────────────────── */
.glass-card {
    background-color: rgba(52, 50, 50, 0.303);
    backdrop-filter: blur(var(--blur)) saturate(1.6);
    -webkit-backdrop-filter: blur(var(--blur)) saturate(1.6);
    border: 1px solid var(--gd);
    border-radius: var(--r);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 4px 15px rgba(125, 123, 123, 0.35);
}

/* ─── HEADER CARDS ───────────────────────────────────── */
.header-cards {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 20px;
    align-items: stretch;
    padding-bottom: 20px;
}

/* Identity */
.card-identity {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 2rem;
    min-width: 260px;
    border-radius: 20px;
}

.avatar-ring {
    width: 86px;
    height: 86px;
    border-radius: 50%;
    flex-shrink: 0;
    padding: 2px;
    background: conic-gradient(var(--accent) 0%, rgba(255, 70, 85, .08) 55%, var(--accent) 100%);
    box-shadow: 0 0 28px var(--ag);
}

.avatar-inner {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #080c1a;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Rajdhani', sans-serif;
    font-size: 2.4rem;
    font-weight: 700;
    color: var(--accent);
    overflow: hidden;
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: 50%;
}

.identity-text {
    display: flex;
    flex-direction: column
}

.identity-text h1 {
    font-family: 'Rajdhani', sans-serif;
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1;
    color: var(--tb);
    white-space: nowrap;
    text-shadow: 0 2px 16px rgba(0, 0, 0, .6);
}

.identity-meta {
    display: flex;
    gap: .35rem;
    margin-top: .45rem
}

.pill {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .72rem;
    letter-spacing: .13em;
    text-transform: uppercase;
    color: var(--accent);
    background: var(--as);
    border: 1px solid rgba(255, 70, 85, .28);
    padding: .18rem .65rem;
    border-radius: 100px;
}

/* Ranked */
.card-ranked {
    display: flex;
    align-items: stretch;
    padding: 1.5rem 2rem;
    border-radius: 20px;
}

.rank-block {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: .5rem;
    padding: 0 1.25rem;
}

.rank-block:first-child {
    padding-left: 0
}

.rank-block:last-child {
    padding-right: 0
}

.rank-divider {
    border-left: 1px solid var(--gd)
}

.rank-queue-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .7rem;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: var(--td);
}

.rank-body {
    display: flex;
    align-items: center;
    gap: .85rem
}

.rank-badge {
    flex-shrink: 0;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.rank-emblem-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
}

.rank-badge-letter {
    display: none;
}


.rank-info {
    display: flex;
    flex-direction: column;
    gap: .22rem
}

.rank-tier-row {
    display: flex;
    align-items: baseline;
    gap: .6rem
}

.rank-tier-text {
    font-family: 'Rajdhani', sans-serif;
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent);
    text-transform: uppercase;
    line-height: 1;
}

.peak-text {
    color: #7B9FFF
}

.rank-lp {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .85rem;
    letter-spacing: .05em;
    color: var(--win);
    margin-left: 5px;
}

.rank-record {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .92rem;
    color: var(--tm);
    letter-spacing: .04em;
}

.rank-unranked {
    font-family: 'Rajdhani', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--td);
}

.wr-bar {
    height: 3px;
    background: rgba(255, 255, 255, .06);
    border-radius: 2px;
    overflow: hidden;
    width: 120px;
    margin-top: 2px;
}

.wr-fill {
    height: 100%;
    border-radius: 2px;
    transition: width .8s ease
}

.wr-pos {
    color: var(--win)
}

.wr-neg {
    color: var(--loss)
}

/* Metrics */
.card-metrics {
    display: flex;
    flex-direction: column;
    gap: .65rem;
    padding: 1.5rem 2rem;
    min-width: 400px;
    border-radius: 20px;
}

.card-eyebrow {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .7rem;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: var(--td);
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1px;
    flex: 1;
    background: var(--gd);
    border: 1px solid var(--gd);
    border-radius: 10px;
    overflow: hidden;
}

.metric-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: .12rem;
    padding: .7rem .4rem;
    background: rgba(4, 6, 14, .45);
    transition: background .15s;
}

.metric-item:hover {
    background: rgba(255, 70, 85, .06)
}

.metric-val {
    font-family: 'Rajdhani', sans-serif;
    font-size: 2.4rem;
    font-weight: 700;
    line-height: 1;
}

.metric-lbl {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .8rem;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--td);
}

/* ─── BODY GRID ──────────────────────────────────────── */
.body-grid {
    display: flex;
    gap: var(--gap);
    align-items: flex-start;
}

/* ─── CARD MATCHES ───────────────────────────────────── */
.card-matches {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin-right: 20px;
    border-radius: 20px;
}

.card-header {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: .85rem 1.4rem;
    border-bottom: 1px solid var(--gd);
    background: rgba(255, 255, 255, .02);
}

.card-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .75rem;
    letter-spacing: .16em;
    text-transform: uppercase;
    color: var(--accent);
}

.queue-filters {
    display: flex;
    gap: 1px
}

.qf-btn {
    background: none;
    border: 1px solid rgba(255, 255, 255, .07);
    color: var(--td);
    padding: .28rem .7rem;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .75rem;
    letter-spacing: .07em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all .15s;
}

.qf-btn:first-child {
    border-radius: 4px 0 0 4px
}

.qf-btn:last-child {
    border-radius: 0 4px 4px 0
}

.qf-btn:hover {
    color: var(--accent);
    border-color: rgba(255, 70, 85, .4)
}

.qf-btn.active {
    color: var(--accent);
    border-color: rgba(255, 70, 85, .5);
    background: var(--as)
}

/* ─── MATCH SCROLL ───────────────────────────────────── */
.match-scroll-area {
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 465px;
    padding: .75rem;
    display: flex;
    flex-direction: column;
    gap: 0;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 70, 85, .15) transparent;
}

.match-scroll-area::-webkit-scrollbar {
    width: 3px
}

.match-scroll-area::-webkit-scrollbar-thumb {
    background: rgba(255, 70, 85, .2);
    border-radius: 2px
}

/* Day groups */
.day-group {
    margin-bottom: 1rem
}

.day-group:last-child {
    margin-bottom: 0
}

.day-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    padding: 0 2px;
}

.day-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .68rem;
    font-weight: 600;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: var(--td);
    white-space: nowrap;
}

.day-line {
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, .06)
}

.day-summary {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .68rem;
    letter-spacing: .08em;
    color: var(--td);
    white-space: nowrap;
}

/* ─── MATCH ROW ──────────────────────────────────────── */
.f-card {
    display: grid;
    grid-template-columns: 4px 60px minmax(0, 1fr) 100px 52px 52px 72px 48px;
    align-items: center;
    gap: 0;
    min-height: 58px;
    background: rgba(255, 255, 255, .03);
    border: 1px solid rgba(255, 255, 255, .06);
    border-radius: 10px;
    margin-bottom: 4px;
    cursor: pointer;
    overflow: hidden;
    transition: border-color .15s, background .12s;
}

.f-card:last-child {
    margin-bottom: 0
}

.f-card:hover {
    border-color: rgba(255, 70, 85, .25);
    background: rgba(255, 255, 255, .055)
}

.f-card-win {
    background: rgba(74, 222, 128, .04)
}

.f-card-loss {
    background: rgba(248, 113, 113, .04)
}

.f-card-win:hover {
    background: rgba(74, 222, 128, .08)
}

.f-card-loss:hover {
    background: rgba(248, 113, 113, .08)
}

.f-bar {
    align-self: stretch;
    flex-shrink: 0
}

.f-icon {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0 10px
}

.f-sq {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    border: 1px solid rgba(255, 70, 85, .2);
    overflow: hidden;
    flex-shrink: 0;
    background: rgba(255, 255, 255, .05);
    display: flex;
    align-items: center;
    justify-content: center;
}

.f-champ-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block
}

.f-champ-fallback {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .65rem;
    font-weight: 700;
    color: var(--accent);
}

.f-info {
    padding: 0 8px;
    overflow: hidden
}

.f-cname {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--tb);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    letter-spacing: .02em;
}

.f-meta {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .9rem;
    color: var(--td);
    margin-top: 2px;
    letter-spacing: .03em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.f-kda {
    padding: 0 8px;
    text-align: center
}

.f-kda-nums {
    font-family: 'Rajdhani', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    color: var(--tb);
}

.f-d {
    color: var(--loss)
}

.f-kda-sub {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .7rem;
    color: var(--td);
    margin-top: 1px;
    letter-spacing: .03em;
}

.f-stat {
    padding: 0 8px;
    text-align: center
}

.f-stat-v {
    font-family: 'Rajdhani', sans-serif;
    font-size: .92rem;
    font-weight: 600;
    color: var(--tm);
}

.f-stat-l {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .62rem;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: var(--td);
    margin-top: 1px;
}

.f-badge {
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: center
}

.f-badge-inner {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .72rem;
    font-weight: 600;
    letter-spacing: .06em;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 4px;
    white-space: nowrap;
}

.fb-win {
    background: rgba(74, 222, 128, .15);
    color: #4ade80;
    border: 1px solid rgba(74, 222, 128, .2)
}

.fb-loss {
    background: rgba(248, 113, 113, .12);
    color: #f87171;
    border: 1px solid rgba(248, 113, 113, .18)
}

.f-rr {
    font-family: 'Rajdhani', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    text-align: center;
    padding: 0 6px;
}

.rr-up {
    color: var(--win)
}

.rr-dn {
    color: var(--loss)
}

.f-chevron {
    font-size: 1.1rem;
    color: var(--td);
    display: flex;
    align-items: center;
    justify-content: center;
    padding-right: 6px;
    transition: transform .2s, color .15s;
}

.f-chevron.open {
    transform: rotate(90deg);
    color: var(--accent)
}

/* ─── ACCORDION ──────────────────────────────────────── */
.acc-enter-active {
    transition: all .22s ease
}

.acc-leave-active {
    transition: all .15s ease
}

.acc-enter-from,
.acc-leave-to {
    opacity: 0;
    transform: translateY(-4px)
}

.acc-panel {
    background: rgba(255, 255, 255, .03);
    border: 1px solid rgba(255, 255, 255, .07);
    border-top: none;
    border-radius: 0 0 10px 10px;
    margin-top: -4px;
    margin-bottom: 4px;
    overflow: hidden;
}

.acc-stats-row {
    display: flex;
    gap: 4px;
    padding: 10px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, .06);
    background: rgba(255, 255, 255, .02);
}

.acc-stat-pill {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 3px;
    background: rgba(255, 255, 255, .04);
    border-radius: 6px;
    padding: 7px 4px;
}

.acc-stat-val {
    font-family: 'Rajdhani', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1;
    color: var(--tb);
}

.acc-stat-lbl {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .62rem;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--td);
}

.acc-bottom {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
}

.acc-team-col {
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 0;
}

.acc-team-col:first-child {
    border-right: 1px solid rgba(255, 255, 255, .06)
}

.acc-team-col:last-child {
    border-left: 1px solid rgba(255, 255, 255, .06)
}

.acc-team-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .68rem;
    font-weight: 600;
    letter-spacing: .12em;
    text-transform: uppercase;
    margin-bottom: 6px;
    display: block;
}

.acc-score-col {
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    background: rgba(255, 255, 255, .02);
    border-left: 1px solid rgba(255, 255, 255, .06);
    border-right: 1px solid rgba(255, 255, 255, .06);
    min-width: 116px;
}

.acc-items-lbl {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .65rem;
    font-weight: 600;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--td);
}

.acc-score-display {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
}

.score-win {
    font-family: 'Rajdhani', sans-serif;
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--win);
    line-height: 1;
}

.score-loss {
    font-family: 'Rajdhani', sans-serif;
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--loss);
    line-height: 1;
}

.acc-player {
    display: flex;
    align-items: center;
    gap: .4rem;
    padding: 2px .25rem;
    border-radius: 4px;
    transition: background .1s;
}

.acc-player:hover {
    background: rgba(255, 255, 255, .04)
}

.acc-player-me {
    background: var(--as)
}

.acc-p-icon {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    flex-shrink: 0;
    border: 1px solid rgba(255, 70, 85, .18);
    object-fit: cover;
}

.acc-p-icon-fallback {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    flex-shrink: 0;
    background: rgba(255, 70, 85, .1);
    border: 1px solid rgba(255, 70, 85, .18);
    font-size: .45rem;
    font-weight: 700;
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
}

.acc-p-name {
    font-size: .78rem;
    color: var(--tm);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.acc-player-me .acc-p-name {
    color: var(--accent)
}

.acc-p-kda {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1rem;
    color: var(--td);
    flex-shrink: 0;
}

.see-full-btn {
    width: 100%;
    background: none;
    border: 1px solid rgba(255, 70, 85, .28);
    color: var(--accent);
    padding: .35rem .5rem;
    border-radius: 5px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .72rem;
    letter-spacing: .07em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all .15s;
    white-space: nowrap;
    text-align: center;
}

.see-full-btn:hover {
    background: var(--as);
    border-color: var(--accent)
}

.team-win {
    color: var(--win)
}

.team-loss {
    color: var(--loss)
}

/* ─── AGENTS SIDEBAR ─────────────────────────────────── */
.card-champions {
    width: 280px;
    min-width: 280px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 20px;
}

.champ-stats-list {
    margin-top: 10px;
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: .4rem .6rem;
    gap: .1rem;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 70, 85, .15) transparent;
}

.champ-stats-list::-webkit-scrollbar {
    width: 3px
}

.champ-stats-list::-webkit-scrollbar-thumb {
    background: rgba(255, 70, 85, .2);
    border-radius: 2px
}

.champ-stat-row {
    display: flex;
    align-items: center;
    gap: .6rem;
    padding: .5rem .45rem;
    border-radius: 8px;
    transition: background .1s;
}

.champ-stat-row:hover {
    background: rgba(255, 255, 255, .04)
}

.cs-icon {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    border: 1.5px solid rgba(255, 70, 85, .18);
    flex-shrink: 0;
    object-fit: cover;
}

.cs-icon-fallback {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    border: 1.5px solid rgba(255, 70, 85, .18);
    flex-shrink: 0;
    background: rgba(255, 70, 85, .08);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .7rem;
    font-weight: 700;
    color: var(--accent);
}

.cs-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px
}

.cs-name {
    font-size: .88rem;
    font-weight: 500;
    color: var(--tb);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.cs-bar-wrap {
    height: 2px;
    background: rgba(255, 255, 255, .06);
    border-radius: 2px;
    overflow: hidden
}

.cs-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width .6s ease
}

.cs-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
    min-width: 38px;
}

.cs-wr {
    font-family: 'Rajdhani', sans-serif;
    font-size: .95rem;
    font-weight: 700;
}

.cs-games {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .68rem;
    color: var(--td);
    letter-spacing: .05em;
}

.cs-kda {
    font-family: 'Rajdhani', sans-serif;
    font-size: .88rem;
    font-weight: 700;
    min-width: 34px;
    text-align: right;
    flex-shrink: 0;
}

/* ─── UTILITY COLORS ─────────────────────────────────── */
.c-amber {
    color: #f0c060
}

.c-teal {
    color: #2dd4bf
}

.c-blue {
    color: #60a5fa
}

.c-purple {
    color: #a78bfa
}

.c-white {
    color: var(--tb)
}

.c-pos {
    color: var(--win)
}

.c-neg {
    color: var(--loss)
}

.c-muted {
    color: var(--tm)
}

/* ─── RESPONSIVE ─────────────────────────────────────── */
@media (max-width: 1280px) {
    .f-card {
        grid-template-columns: 4px 60px minmax(0, 1fr) 90px 48px 72px 40px
    }

    .f-stat:last-of-type {
        display: none
    }

    .card-champions {
        width: 250px;
        min-width: 250px
    }

    .header-cards {
        grid-template-columns: auto 1fr
    }

    .card-metrics {
        grid-column: 1 / -1
    }
}

@media (max-width: 960px) {
    .f-card {
        grid-template-columns: 4px 60px minmax(0, 1fr) 90px 72px 40px
    }

    .f-stat {
        display: none
    }

    .card-metrics {
        display: none
    }

    .card-champions {
        width: 210px;
        min-width: 210px
    }
}

@media (max-width: 700px) {
    .scroll-root {
        padding: 1rem .75rem 0
    }

    .header-cards {
        grid-template-columns: 1fr
    }

    .card-ranked {
        flex-direction: column;
        padding: 1rem 1.25rem
    }

    .rank-block {
        padding: 0
    }

    .rank-divider {
        border-left: none;
        border-top: 1px solid var(--gd);
        padding-top: .85rem;
        margin-top: .85rem
    }

    .rank-tier-text {
        font-size: 1.5rem
    }

    .rank-badge {
        width: 52px;
        height: 52px
    }

    .body-grid {
        flex-direction: column;
        align-items: stretch
    }

    .card-matches {
        margin-right: 0
    }

    .card-champions {
        width: 100%;
        min-width: 0
    }

    .match-scroll-area {
        max-height: none
    }

    .identity-text h1 {
        font-size: 2.2rem
    }

    .f-card {
        grid-template-columns: 4px 56px minmax(0, 1fr) 80px 64px 36px
    }
}
</style>