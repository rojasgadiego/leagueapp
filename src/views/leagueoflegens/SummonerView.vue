<template>
    <div class="page">

        <div v-if="error" class="error-state">
            <span class="error-icon">✕</span>
            <p>{{ error }}</p>
            <button class="retry-btn" @click="loadData">Reintentar</button>
        </div>

        <template v-else>
            <div class="bg-vignette"></div>
            <div class="bg-grain"></div>
            <div class="scroll-root">

                <button class="back-btn" @click="router.push('/')">
                    <span>←</span> Volver
                </button>



                <!-- ══ HEADER CARDS ══ -->
                <div class="header-cards">

                    <div class="glass-card card-identity">
                        <div class="avatar-ring">
                            <div class="avatar-inner">
                                <template v-if="!loading">
                                    <img v-if="profileIconId" :src="getProfileIconUrl()" class="avatar-img"
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
                                    <span class="pill">LAS</span>
                                    <span class="pill">Americas</span>
                                </div>
                            </template>
                            <template v-else>
                                <div class="skel skel-text" style="width:160px;height:2.5rem;margin-bottom:.5rem"></div>
                                <div style="display:flex;gap:.35rem">
                                    <div class="skel skel-text" style="width:42px;height:20px;border-radius:100px">
                                    </div>
                                    <div class="skel skel-text" style="width:60px;height:20px;border-radius:100px">
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>

                    <div class="glass-card card-ranked">
                        <template v-if="!loading && rankedData.length">
                            <div v-for="(entry, idx) in rankedData" :key="entry.queueType" class="rank-block"
                                :class="{ 'rank-divider': idx > 0 }">
                                <span class="rank-queue-label">
                                    {{ entry.queueType === 'RANKED_SOLO_5x5' ? 'Solo / Duo' : 'Flex 5v5' }}
                                </span>
                                <div class="rank-body">
                                    <div class="rank-badge">
                                        <img :src="`/images/emblemaslol/${entry.tier}.webp`" alt="Emblema de liga"
                                            class="rank-emblem-img" @error="$event.target.style.display = 'none'" />
                                        <span class="rank-badge-letter">{{ entry.tier?.charAt(0).toUpperCase() }}</span>
                                    </div>
                                    <div class="rank-info">
                                        <div class="rank-tier-row">
                                            <span class="rank-tier-text">{{ entry.tier }} {{ entry.rank }}</span>
                                        </div>
                                        <span class="rank-record">
                                            {{ entry.wins }}V {{ entry.losses }}D
                                            <span :class="winRate(entry) >= 50 ? 'wr-pos' : 'wr-neg'">
                                                ({{ winRate(entry) }}%)
                                            </span>
                                            <span class="rank-lp">▲ {{ entry.leaguePoints }} LP</span>
                                        </span>
                                        <div class="wr-bar">
                                            <div class="wr-fill"
                                                :style="{ width: winRate(entry) + '%', background: winRate(entry) >= 50 ? 'var(--win)' : 'var(--loss)' }">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <template v-else-if="loading">
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

                    <div class="glass-card card-matches">
                        <div class="card-header">
                            <span class="card-title">Historial de partidas</span>
                            <div class="queue-filters">
                                <button v-for="q in queues" :key="q.id"
                                    :class="['qf-btn', { active: activeQueue === q.id }]" @click="activeQueue = q.id">{{
                                        q.label }}</button>
                            </div>
                        </div>

                        <div v-if="loading" class="match-scroll-area">
                            <div class="day-group">
                                <div class="day-header">
                                    <div class="skel skel-text" style="width:28px;height:9px"></div>
                                    <div class="day-line"></div>
                                    <div class="skel skel-text" style="width:40px;height:9px"></div>
                                </div>
                                <div v-for="i in 3" :key="'a' + i" class="f-card skel-card">
                                    <div class="f-bar skel" style="align-self:stretch;border-radius:0"></div>
                                    <div class="f-icon">
                                        <div class="skel" style="width:38px;height:38px;border-radius:8px"></div>
                                        <div class="f-spells-rune">
                                            <div class="f-spells">
                                                <div class="skel" style="width:18px;height:18px;border-radius:3px">
                                                </div>
                                                <div class="skel" style="width:18px;height:18px;border-radius:3px">
                                                </div>
                                            </div>
                                            <div class="skel" style="width:22px;height:22px;border-radius:50%"></div>
                                        </div>
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
                            <div class="day-group">
                                <div class="day-header">
                                    <div class="skel skel-text" style="width:34px;height:9px"></div>
                                    <div class="day-line"></div>
                                    <div class="skel skel-text" style="width:40px;height:9px"></div>
                                </div>
                                <div v-for="i in 3" :key="'b' + i" class="f-card skel-card">
                                    <div class="f-bar skel" style="align-self:stretch;border-radius:0"></div>
                                    <div class="f-icon">
                                        <div class="skel" style="width:38px;height:38px;border-radius:8px"></div>
                                        <div class="f-spells-rune">
                                            <div class="f-spells">
                                                <div class="skel" style="width:18px;height:18px;border-radius:3px">
                                                </div>
                                                <div class="skel" style="width:18px;height:18px;border-radius:3px">
                                                </div>
                                            </div>
                                            <div class="skel" style="width:22px;height:22px;border-radius:50%"></div>
                                        </div>
                                    </div>
                                    <div class="f-info">
                                        <div class="skel skel-text" style="width:80px;height:12px;margin-bottom:5px">
                                        </div>
                                        <div class="skel skel-text" style="width:110px;height:10px"></div>
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

                        <div v-else class="match-scroll-area" ref="scrollContainer" @scroll.passive="onScroll">
                            <template v-for="group in groupedMatches" :key="group.label">
                                <div class="day-group">
                                    <div class="day-header">
                                        <span class="day-label">{{ group.label }}</span>
                                        <div class="day-line"></div>
                                        <span class="day-summary">{{ group.wins }}V · {{ group.losses }}D</span>
                                    </div>

                                    <template v-for="match in group.matches" :key="match.metadata.matchId">
                                        <div class="f-card"
                                            :class="{ 'f-card-win': getPlayerData(match)?.win, 'f-card-loss': !getPlayerData(match)?.win }"
                                            @click="toggleExpand(match)">
                                            <div class="f-bar"
                                                :style="{ background: getPlayerData(match)?.win ? 'var(--win)' : 'var(--loss)' }">
                                            </div>

                                            <div class="f-icon">
                                                <div class="f-sq">
                                                    <img :src="getChampionIconUrl(getPlayerData(match)?.championName, version)"
                                                        class="f-champ-img"
                                                        @error="$event.target.style.display = 'none'" />
                                                </div>
                                                <div class="f-spells-rune">
                                                    <div class="f-spells">
                                                        <img :src="getSpellUrl(getPlayerData(match)?.summoner1Id)"
                                                            class="f-spell"
                                                            @error="$event.target.style.display = 'none'" />
                                                        <img :src="getSpellUrl(getPlayerData(match)?.summoner2Id)"
                                                            class="f-spell"
                                                            @error="$event.target.style.display = 'none'" />
                                                    </div>
                                                    <div class="f-keystone-wrap">
                                                        <img v-if="getKeystoneUrl(match)" :src="getKeystoneUrl(match)"
                                                            class="f-keystone"
                                                            @error="$event.target.style.display = 'none'" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="f-info">
                                                <div class="f-cname">{{ getPlayerData(match)?.championName }}</div>
                                                <div class="f-meta">
                                                    {{ getQueueLabel(match.info.queueId) }} ·
                                                    {{ formatDuration(match.info.gameDuration) }} ·
                                                    {{ timeAgo(match.info.gameEndTimestamp) }}
                                                </div>
                                            </div>
                                            <div class="f-kda">
                                                <div class="f-kda-nums">
                                                    {{ getPlayerData(match)?.kills }}/<span class="f-d">{{
                                                        getPlayerData(match)?.deaths }}</span>/{{
                                                            getPlayerData(match)?.assists }}
                                                </div>
                                                <div class="f-kda-sub">
                                                    {{ calcKDA(getPlayerData(match)?.kills,
                                                        getPlayerData(match)?.deaths, getPlayerData(match)?.assists) }} KDA
                                                </div>
                                            </div>
                                            <div class="f-stat">
                                                <div class="f-stat-v">{{ (getPlayerData(match)?.totalMinionsKilled ?? 0)
                                                    + (getPlayerData(match)?.neutralMinionsKilled ?? 0) }}</div>
                                                <div class="f-stat-l">CS</div>
                                            </div>
                                            <div class="f-stat">
                                                <div class="f-stat-v">{{
                                                    Math.round((getPlayerData(match)?.totalDamageDealtToChampions || 0)
                                                        / 1000) }}k</div>
                                                <div class="f-stat-l">Daño</div>
                                            </div>
                                            <div class="f-badge">
                                                <span class="f-badge-inner"
                                                    :class="getPlayerData(match)?.win ? 'fb-win' : 'fb-loss'">
                                                    {{ getPlayerData(match)?.win ? 'Victoria' : 'Derrota' }}
                                                </span>
                                            </div>
                                            <div class="f-chevron"
                                                :class="{ open: expandedId === match.metadata.matchId }">›</div>
                                        </div>

                                        <Transition name="acc">
                                            <div v-if="expandedId === match.metadata.matchId" class="acc-panel">
                                                <div class="acc-stats-row">
                                                    <div class="acc-stat-pill" v-for="(s, i) in accStats(match)"
                                                        :key="i">
                                                        <span class="acc-stat-val" :class="s.cls">{{ s.val }}</span>
                                                        <span class="acc-stat-lbl">{{ s.label }}</span>
                                                    </div>
                                                </div>
                                                <div class="acc-bottom">
                                                    <div class="acc-team-col">
                                                        <span class="acc-team-title"
                                                            :class="getTeamWin(match, 100) ? 'team-win' : 'team-loss'">
                                                            {{ getTeamWin(match, 100) ? '⬆ Victoria' : '⬇ Derrota' }}
                                                        </span>
                                                        <div v-for="p in getTeamPlayers(match, 100)" :key="p.puuid"
                                                            class="acc-player"
                                                            :class="{ 'acc-player-me': p.puuid === puuid.value }">
                                                            <img :src="getChampionIconUrl(p.championName, version)"
                                                                class="acc-p-icon"
                                                                @error="$event.target.style.display = 'none'" />
                                                            <span class="acc-p-name">{{ p.riotIdGameName }}</span>
                                                            <span class="acc-p-kda">{{ p.kills }}/{{ p.deaths }}/{{
                                                                p.assists }}</span>
                                                        </div>
                                                    </div>
                                                    <div class="acc-items-col">
                                                        <span class="acc-items-lbl">Items</span>
                                                        <div class="acc-items-grid">
                                                            <div v-for="s in 7" :key="s" class="acc-item-slot">
                                                                <img v-if="getPlayerData(match)?.[`item${s - 1}`]"
                                                                    :src="getItemIconUrl(getPlayerData(match)?.[`item${s - 1}`], version)"
                                                                    class="acc-item-img"
                                                                    @error="$event.target.style.display = 'none'" />
                                                            </div>
                                                        </div>
                                                        <button class="see-full-btn"
                                                            @click.stop="router.push({ name: 'match', params: { matchId: match.metadata.matchId }, query: { puuid: puuid.value } })">
                                                            Ver partida →
                                                        </button>
                                                    </div>
                                                    <div class="acc-team-col">
                                                        <span class="acc-team-title"
                                                            :class="getTeamWin(match, 200) ? 'team-win' : 'team-loss'">
                                                            {{ getTeamWin(match, 200) ? '⬆ Victoria' : '⬇ Derrota' }}
                                                        </span>
                                                        <div v-for="p in getTeamPlayers(match, 200)" :key="p.puuid"
                                                            class="acc-player"
                                                            :class="{ 'acc-player-me': p.puuid === puuid.value }">
                                                            <img :src="getChampionIconUrl(p.championName, version)"
                                                                class="acc-p-icon"
                                                                @error="$event.target.style.display = 'none'" />
                                                            <span class="acc-p-name">{{ p.riotIdGameName }}</span>
                                                            <span class="acc-p-kda">{{ p.kills }}/{{ p.deaths }}/{{
                                                                p.assists }}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Transition>
                                    </template>
                                </div>
                            </template>

                            <div v-if="loadingMore" class="load-more-foot">
                                <div class="spin-sm"></div><span>Cargando más partidas…</span>
                            </div>
                            <div v-else-if="noMore" class="load-more-foot muted">Sin más partidas</div>
                        </div>
                    </div>

                    <!-- Sidebar campeones -->
                    <div class="glass-card card-champions">
                        <div class="card-header">
                            <div class="queue-filters">
                                <button class="qf-btn">Campeones</button>
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
                            <div v-for="c in champStats.slice(0, 8)" :key="c.name" class="champ-stat-row">
                                <img :src="getChampionIconUrl(c.name, version)" class="cs-icon"
                                    @error="$event.target.style.display = 'none'" />
                                <div class="cs-info">
                                    <span class="cs-name">{{ c.name }}</span>
                                    <div class="cs-bar-wrap">
                                        <div class="cs-bar-fill"
                                            :style="{ width: Math.round(c.wins / c.games * 100) + '%', background: Math.round(c.wins / c.games * 100) >= 50 ? '#4ade80' : '#f87171' }">
                                        </div>
                                    </div>
                                </div>
                                <div class="cs-right">
                                    <span class="cs-wr"
                                        :class="Math.round(c.wins / c.games * 100) >= 50 ? 'wr-pos' : 'wr-neg'">
                                        {{ Math.round(c.wins / c.games * 100) }}%
                                    </span>
                                    <span class="cs-games">{{ c.games }}g</span>
                                </div>
                                <span class="cs-kda" :class="kdaClass(calcKDA(c.kills, c.deaths, c.assists))">
                                    {{ calcKDA(c.kills, c.deaths, c.assists) }}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                <div class="page-bottom-pad"></div>


                <LiveCard class="live-card" v-if="puuid" :puuid="puuid" :version="version" />

            </div>

        </template>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    getAccountByRiotId, getMatchHistory, getMatch,
    getLatestVersion, getRankedInfo,
    getChampionIconUrl, getItemIconUrl,
    calcKDA, formatDuration, timeAgo, calcChampionStats
} from '@/services/riot.js'
import LiveCard from '@/components/LiveCard.vue'

const route = useRoute()
const router = useRouter()
const { gameName, tagLine } = route.params

const puuid = ref('')
const matches = ref([])
const version = ref('14.1.1')
const rankedData = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const noMore = ref(false)
const error = ref('')
const activeQueue = ref('all')
const expandedId = ref(null)
const scrollContainer = ref(null)
const runeMap = ref({})
const profileIconId = ref(null)
const PAGE_SIZE = 20

const queues = [
    { id: 'all', label: 'Todas' },
    { id: '420', label: 'Solo/Duo' },
    { id: '440', label: 'Flex' },
    { id: '450', label: 'ARAM' },
]
const queueLabels = { 420: 'Solo/Duo', 440: 'Flex', 450: 'ARAM', 400: 'Normal', 430: 'Ciegas', 900: 'URF', 0: 'Custom' }

const SPELL_NAMES = {
    1: 'SummonerBoost', 3: 'SummonerExhaust', 4: 'SummonerFlash',
    6: 'SummonerHaste', 7: 'SummonerHeal', 11: 'SummonerSmite',
    12: 'SummonerTeleport', 14: 'SummonerDot', 21: 'SummonerBarrier',
    32: 'SummonerSnowball',
}

function formatTier(tier) {
    if (!tier) return ''
    return tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase()
}

function getSpellUrl(spellId) {
    const name = SPELL_NAMES[spellId] ?? 'SummonerFlash'
    return `/ddragon/cdn/${version.value}/img/spell/${name}.png`
}

function getProfileIconUrl() {
    if (!profileIconId.value) return ''
    return `/ddragon/cdn/${version.value}/img/profileicon/${profileIconId.value}.png`
}

async function loadRuneMap() {
    if (Object.keys(runeMap.value).length) return
    try {
        const res = await fetch(`/ddragon/cdn/${version.value}/data/es_MX/runesReforged.json`)
        const data = await res.json()
        const map = {}
        for (const tree of data) {
            for (const slot of tree.slots) {
                for (const rune of slot.runes) {
                    map[rune.id] = rune.icon
                }
            }
        }
        runeMap.value = map
    } catch (e) { console.error('Error cargando runas', e) }
}

function getKeystoneUrl(match) {
    const p = getPlayerData(match)
    const keystoneId = p?.perks?.styles?.[0]?.selections?.[0]?.perk
    if (!keystoneId || !runeMap.value[keystoneId]) return ''
    return `https://ddragon.leagueoflegends.com/cdn/img/${runeMap.value[keystoneId]}`
}

function getQueueLabel(id) { return queueLabels[id] || `Modo ${id}` }
function winRate(e) { const t = e.wins + e.losses; return t ? Math.round((e.wins / t) * 100) : 0 }
function kdaClass(v) {
    const n = parseFloat(v)
    if (isNaN(n)) return ''
    if (n >= 5) return 'c-amber'
    if (n >= 3) return 'c-pos'
    if (n >= 2) return 'c-muted'
    return 'c-neg'
}
function getKP(m) {
    const p = getPlayerData(m); if (!p) return 0
    const tk = m.info.participants.filter(x => x.teamId === p.teamId).reduce((s, x) => s + x.kills, 0)
    return tk === 0 ? 0 : Math.round(((p.kills + p.assists) / tk) * 100)
}
function getTeamPlayers(m, tid) { return m.info.participants.filter(p => p.teamId === tid) }
function getTeamWin(m, tid) { return m.info.participants.find(p => p.teamId === tid)?.win ?? false }
function getPlayerData(m) { return m.info.participants.find(p => p.puuid === puuid.value) }
function toggleExpand(m) { expandedId.value = expandedId.value === m.metadata.matchId ? null : m.metadata.matchId }

function accStats(match) {
    const p = getPlayerData(match)
    if (!p) return []
    return [
        { val: calcKDA(p.kills, p.deaths, p.assists), label: 'KDA', cls: kdaClass(calcKDA(p.kills, p.deaths, p.assists)) },
        { val: getKP(match) + '%', label: 'Kill part.', cls: 'c-teal' },
        { val: p.visionScore, label: 'Visión', cls: 'c-white' },
        { val: p.wardsPlaced, label: 'Wards', cls: 'c-white' },
        { val: Math.round((p.totalDamageTaken || 0) / 1000) + 'k', label: 'Daño rec.', cls: 'c-purple' },
        { val: p.goldEarned?.toLocaleString(), label: 'Oro', cls: 'c-amber' },
    ]
}

const groupedMatches = computed(() => {
    const source = activeQueue.value === 'all'
        ? matches.value
        : matches.value.filter(m => m.info.queueId === Number(activeQueue.value))

    const groups = []
    const map = new Map()

    for (const match of source) {
        const ts = match.info.gameEndTimestamp
        const d = new Date(ts)
        const now = new Date()

        const sameDay = (a, b) =>
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate()

        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)

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
        const p = getPlayerData(match)
        if (p?.win) g.wins++; else g.losses++
    }

    return groups
})

const champStats = computed(() => calcChampionStats(matches.value, puuid.value))

const globalStats = computed(() => {
    const ps = matches.value.map(m => getPlayerData(m)).filter(Boolean)
    if (!ps.length) return {}
    const n = ps.length, wins = ps.filter(p => p.win).length
    const sK = ps.reduce((s, p) => s + (p.kills || 0), 0)
    const sD = ps.reduce((s, p) => s + (p.deaths || 0), 0)
    const sA = ps.reduce((s, p) => s + (p.assists || 0), 0)
    const sCs = ps.reduce((s, p) => s + (p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0), 0)
    const sDmg = ps.reduce((s, p) => s + (p.totalDamageDealtToChampions || 0), 0)
    const sKp = matches.value.reduce((s, m) => s + getKP(m), 0)
    const aK = sK / n, aD = sD / n, aA = sA / n
    return {
        winrate: Math.round((wins / n) * 100),
        kda: aD === 0 ? (aK + aA).toFixed(2) : ((aK + aA) / aD).toFixed(2),
        avgCs: Math.round(sCs / n),
        avgDmg: Math.round(sDmg / n / 1000),
        avgKp: Math.round(sKp / n),
    }
})

const headerMetrics = computed(() => {
    const g = globalStats.value
    if (!g.kda) return []
    return [
        { val: g.kda, label: 'KDA', cls: kdaClass(g.kda) },
        { val: g.avgKp + '%', label: 'Kill Part.', cls: 'c-teal' },
        { val: g.avgCs, label: 'CS Prom.', cls: 'c-blue' },
        { val: g.avgDmg + 'k', label: 'Daño', cls: 'c-purple' },
        { val: g.winrate + '%', label: 'Winrate', cls: g.winrate >= 50 ? 'c-pos' : 'c-neg' },
    ]
})

function onScroll() {
    if (loadingMore.value || noMore.value) return
    const el = scrollContainer.value; if (!el) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) loadMore()
}

async function loadMore() {
    if (loadingMore.value || noMore.value) return
    loadingMore.value = true
    try {
        const ids = await getMatchHistory(puuid.value, { start: matches.value.length, count: PAGE_SIZE })
        if (!ids.length) { noMore.value = true; return }
        matches.value.push(...await Promise.all(ids.map(id => getMatch(id))))
        if (ids.length < PAGE_SIZE) noMore.value = true
    } catch (e) { console.error(e) } finally { loadingMore.value = false }
}

async function loadData() {
    loading.value = true; error.value = ''
    try {
        version.value = await getLatestVersion()
        await loadRuneMap()
        const acc = await getAccountByRiotId(gameName, tagLine)
        puuid.value = acc.puuid
        const ids = await getMatchHistory(puuid.value, { start: 0, count: PAGE_SIZE })
        const [ranked, details] = await Promise.all([
            getRankedInfo(puuid.value),
            Promise.all(ids.map(id => getMatch(id))),
        ])
        rankedData.value = ranked.filter(r => r.queueType === 'RANKED_SOLO_5x5' || r.queueType === 'RANKED_FLEX_SR')
        matches.value = details
        if (details.length) {
            const me = details[0].info.participants.find(p => p.puuid === puuid.value)
            profileIconId.value = me?.profileIcon ?? null
        }
        if (ids.length < PAGE_SIZE) noMore.value = true
    } catch (e) { error.value = e.message } finally { loading.value = false }
}

onMounted(loadData)
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
    --accent: #c89b3c;
    --as: rgba(200, 155, 60, 0.15);
    --ag: rgba(200, 155, 60, 0.3);
    --win: #4ade80;
    --loss: #f87171;
    --tb: #f0e8d8;
    --tm: rgba(240, 232, 216, 0.5);
    --td: rgba(240, 232, 216, 0.2);
    --gap: .75rem;
}

.skel {
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.04) 25%, rgba(255, 255, 255, 0.09) 50%, rgba(255, 255, 255, 0.04) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.6s ease-in-out infinite;
    border-radius: 4px;
    flex-shrink: 0;
}

.skel-text,
.skel-circle {
    display: block;
}

@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

.skel-card {
    pointer-events: none;
}

.bg-vignette {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: radial-gradient(ellipse 140% 70% at 50% 0%, rgba(4, 6, 14, .2) 0%, rgba(4, 6, 14, .88) 65%),
        linear-gradient(to bottom, transparent 0%, rgba(4, 6, 14, .47) 60%, #a6a0a0 100%);
}

.bg-grain {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    opacity: .04;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 160px;
}

.page {
    position: relative;
    min-height: 100vh;
    width: 100%;
    font-family: 'Barlow', sans-serif;
    font-size: 15px;
    color: var(--tb);
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
    height: 2rem;
}

.live-card {
    margin-bottom: 20px;
}

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
    color: var(--loss);
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
    background: var(--as);
}

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
    border: 0.5px solid #c89b3c;
}

.back-btn:hover {
    color: var(--accent);
}

.glass-card {
    background: var(--gb);
    backdrop-filter: blur(var(--blur)) saturate(1.6);
    -webkit-backdrop-filter: blur(var(--blur)) saturate(1.6);
    border: 1px solid var(--gd);
    border-radius: var(--r);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, .06), 0 4px 24px rgba(0, 0, 0, .35);
}

.header-cards {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 20px;
    align-items: stretch;
    padding-bottom: 20px;
}

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
    background: conic-gradient(var(--accent) 0%, rgba(200, 155, 60, .08) 55%, var(--accent) 100%);
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
    flex-direction: column;
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
    margin-top: .45rem;
}

.pill {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .72rem;
    letter-spacing: .13em;
    text-transform: uppercase;
    color: var(--accent);
    background: var(--as);
    border: 1px solid rgba(200, 155, 60, .28);
    padding: .18rem .65rem;
    border-radius: 100px;
}

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
    padding-left: 0;
}

.rank-block:last-child {
    padding-right: 0;
}

.rank-divider {
    border-left: 1px solid var(--gd);
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
    gap: .85rem;
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
    gap: .22rem;
}

.rank-tier-row {
    display: flex;
    align-items: baseline;
    gap: .6rem;
}

.rank-tier-text {
    font-family: 'Rajdhani', sans-serif;
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent);
    text-transform: uppercase;
    line-height: 1;
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
    transition: width .8s ease;
}

.wr-pos {
    color: var(--win);
}

.wr-neg {
    color: var(--loss);
}

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
    background: rgba(200, 155, 60, .06);
}

.metric-val {
    font-family: 'Rajdhani', sans-serif;
    font-size: 2.4rem;
    font-weight: 700;
    line-height: 1;
}

.metric-lbl {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.8rem;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--td);
}

.body-grid {
    display: flex;
    gap: var(--gap);
    align-items: flex-start;
}

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
    gap: 1px;
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
    border-radius: 4px 0 0 4px;
}

.qf-btn:last-child {
    border-radius: 0 4px 4px 0;
}

.qf-btn:hover {
    color: var(--accent);
    border-color: rgba(200, 155, 60, .4);
}

.qf-btn.active {
    color: var(--accent);
    border-color: rgba(200, 155, 60, .5);
    background: var(--as);
}

.match-scroll-area {
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 465px;
    padding: .75rem;
    display: flex;
    flex-direction: column;
    gap: 0;
    scrollbar-width: thin;
    scrollbar-color: rgba(200, 155, 60, .15) transparent;
}

.match-scroll-area::-webkit-scrollbar {
    width: 3px;
}

.match-scroll-area::-webkit-scrollbar-thumb {
    background: rgba(200, 155, 60, .2);
    border-radius: 2px;
}

.day-group {
    margin-bottom: 1rem;
}

.day-group:last-child {
    margin-bottom: 0;
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
    background: rgba(255, 255, 255, .06);
}

.day-summary {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .68rem;
    letter-spacing: .08em;
    color: var(--td);
    white-space: nowrap;
}

.f-card {
    display: grid;
    grid-template-columns: 4px 90px minmax(0, 1fr) 100px 52px 52px 72px 24px;
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
    margin-bottom: 0;
}

.f-card:hover {
    border-color: rgba(200, 155, 60, .25);
    background: rgba(255, 255, 255, .055);
}

.f-card-win {
    background: rgba(74, 222, 128, .04);
}

.f-card-loss {
    background: rgba(248, 113, 113, .04);
}

.f-card-win:hover {
    background: rgba(74, 222, 128, .08);
}

.f-card-loss:hover {
    background: rgba(248, 113, 113, .08);
}

.f-bar {
    align-self: stretch;
    flex-shrink: 0;
}

.f-icon {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0 6px;
}

.f-sq {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    border: 1px solid rgba(200, 155, 60, .2);
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
    display: block;
}

.f-spells-rune {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}

.f-spells {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.f-spell {
    width: 18px;
    height: 18px;
    border-radius: 3px;
    border: 1px solid rgba(255, 255, 255, .1);
    object-fit: cover;
    display: block;
}

.f-keystone-wrap {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(255, 255, 255, .05);
    border: 1px solid rgba(200, 155, 60, .2);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.f-keystone {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.f-info {
    padding: 0 8px;
    overflow: hidden;
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
    font-size: 0.9rem;
    color: var(--td);
    margin-top: 2px;
    letter-spacing: .03em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.f-kda {
    padding: 0 8px;
    text-align: center;
}

.f-kda-nums {
    font-family: 'Rajdhani', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    color: var(--tb);
}

.f-d {
    color: var(--loss);
}

.f-kda-sub {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.7rem;
    color: var(--td);
    margin-top: 1px;
    letter-spacing: .03em;
}

.f-stat {
    padding: 0 8px;
    text-align: center;
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
    justify-content: center;
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
    border: 1px solid rgba(74, 222, 128, .2);
}

.fb-loss {
    background: rgba(248, 113, 113, .12);
    color: #f87171;
    border: 1px solid rgba(248, 113, 113, .18);
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
    color: var(--accent);
}

.acc-enter-active {
    transition: all .22s ease;
}

.acc-leave-active {
    transition: all .15s ease;
}

.acc-enter-from,
.acc-leave-to {
    opacity: 0;
    transform: translateY(-4px);
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
    border-right: 1px solid rgba(255, 255, 255, .06);
}

.acc-team-col:last-child {
    border-left: 1px solid rgba(255, 255, 255, .06);
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

.acc-items-col {
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

.acc-items-grid {
    display: grid;
    grid-template-columns: repeat(4, 26px);
    gap: 3px;
}

.acc-item-slot {
    width: 26px;
    height: 26px;
    background: rgba(255, 255, 255, .04);
    border: 1px solid rgba(255, 255, 255, .08);
    border-radius: 4px;
    overflow: hidden;
}

.acc-item-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
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
    background: rgba(255, 255, 255, .04);
}

.acc-player-me {
    background: var(--as);
}

.acc-p-icon {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    flex-shrink: 0;
    border: 1px solid rgba(200, 155, 60, .18);
    object-fit: cover;
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
    color: var(--accent);
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
    border: 1px solid rgba(200, 155, 60, .28);
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
    border-color: var(--accent);
}

.load-more-foot {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .5rem;
    padding: .9rem;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .78rem;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--td);
}

.load-more-foot.muted {
    opacity: .35;
}

.spin-sm {
    width: 13px;
    height: 13px;
    border: 1.5px solid rgba(200, 155, 60, .12);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin .8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg)
    }
}

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
    scrollbar-color: rgba(200, 155, 60, .15) transparent;
}

.champ-stats-list::-webkit-scrollbar {
    width: 3px;
}

.champ-stats-list::-webkit-scrollbar-thumb {
    background: rgba(200, 155, 60, .2);
    border-radius: 2px;
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
    background: rgba(255, 255, 255, .04);
}

.cs-icon {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    border: 1.5px solid rgba(200, 155, 60, .18);
    flex-shrink: 0;
}

.cs-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
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
    overflow: hidden;
}

.cs-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width .6s ease;
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

.team-win {
    color: var(--win);
}

.team-loss {
    color: var(--loss);
}

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

@media (max-width:1280px) {
    .f-card {
        grid-template-columns: 4px 90px minmax(0, 1fr) 90px 48px 72px 20px;
    }

    .f-stat:last-of-type {
        display: none;
    }

    .card-champions {
        width: 250px;
        min-width: 250px;
    }

    .header-cards {
        grid-template-columns: auto 1fr;
    }

    .card-metrics {
        grid-column: 1 / -1;
    }
}

@media (max-width:960px) {
    .f-card {
        grid-template-columns: 4px 90px minmax(0, 1fr) 90px 72px 20px;
    }

    .f-stat {
        display: none;
    }

    .card-metrics {
        display: none;
    }

    .card-champions {
        width: 210px;
        min-width: 210px;
    }
}

@media (max-width:700px) {
    .scroll-root {
        padding: 1rem .75rem 0;
    }

    .header-cards {
        grid-template-columns: 1fr;
    }

    .card-ranked {
        flex-direction: column;
        padding: 1rem 1.25rem;
    }

    .rank-block {
        padding: 0;
    }

    .rank-divider {
        border-left: none;
        border-top: 1px solid var(--gd);
        padding-top: .85rem;
        margin-top: .85rem;
    }

    .rank-tier-text {
        font-size: 1.5rem;
    }

    .rank-badge {
        width: 52px;
        height: 52px;
    }

    .rank-badge-letter {
        font-size: .6rem;
    }

    .body-grid {
        flex-direction: column;
        align-items: stretch;
    }

    .card-matches {
        margin-right: 0;
    }

    .card-champions {
        width: 100%;
        min-width: 0;
    }

    .match-scroll-area {
        max-height: none;
    }

    .identity-text h1 {
        font-size: 2.2rem;
    }

    .f-card {
        grid-template-columns: 4px 78px minmax(0, 1fr) 80px 64px 18px;
    }

    .f-spells-rune {
        display: none;
    }
}
</style>