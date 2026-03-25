<template>
    <div class="match-page">

        <div class="scroll-root">

            <!-- HEADER -->
            <div class="page-header">
                <button class="back-btn" @click="router.back()">← Volver</button>
                <div class="header-meta" v-if="match">
                    <span class="badge queue-badge">{{ getQueueLabel(match.info.queueId) }}</span>
                    <span class="badge">{{ formatDuration(match.info.gameDuration) }}</span>
                    <span class="badge muted-badge">{{ timeAgo(match.info.gameEndTimestamp) }}</span>
                </div>
                <div class="header-result" v-if="match">
                    <span class="result-pill" :class="getTeamWin(100) ? 'rp-win' : 'rp-loss'">
                        {{ getTeamWin(100) ? 'Victoria' : 'Derrota' }}
                    </span>
                    <span class="vs-sep">vs</span>
                    <span class="result-pill" :class="getTeamWin(200) ? 'rp-win' : 'rp-loss'">
                        {{ getTeamWin(200) ? 'Victoria' : 'Derrota' }}
                    </span>
                </div>
            </div>

            <!-- LOADING -->
            <div v-if="loading" class="loading-state">
                <div class="load-ring">
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <p>Cargando partida…</p>
            </div>

            <template v-else-if="match">

                <!-- BUSCADOR -->
                <div class="friend-bar">
                    <span class="search-icon">⌕</span>
                    <input v-model="friendSearch" type="text" placeholder="Buscar jugador en esta partida…"
                        class="friend-input" autocomplete="off" />
                    <div v-if="matchedPlayers.length" class="friend-chips">
                        <div v-for="p in matchedPlayers" :key="p.puuid" class="friend-chip"
                            @click="goToSummoner(p.riotIdGameName, p.riotIdTagline)">
                            <img :src="getChampionIconUrl(p.championName, version)" class="friend-champ-icon"
                                @error="$event.target.style.display = 'none'" />
                            {{ p.riotIdGameName }}
                        </div>
                    </div>
                </div>

                <!-- WRAPPER con overflow-x para que no rompa el layout -->
                <div class="table-wrapper">
                    <div class="match-grid">

                        <!-- ── HEADER AZUL ── -->
                        <div class="team-header blue-header">
                            <div class="team-dot dot-blue"></div>
                            <span class="team-name blue-name">Equipo Azul</span>
                            <span class="team-summary">
                                {{ teamTotals(100).kills }}K ·
                                {{ teamTotals(100).towers }}T ·
                                {{ teamTotals(100).dragons }}D
                            </span>
                            <span class="team-result-pill" :class="getTeamWin(100) ? 'rp-win' : 'rp-loss'">
                                {{ getTeamWin(100) ? 'Victoria' : 'Derrota' }}
                            </span>
                        </div>

                        <div class="center-header">Stats</div>

                        <!-- ── HEADER ROJO ── -->
                        <div class="team-header red-header">
                            <div class="team-dot dot-red"></div>
                            <span class="team-name red-name">Equipo Rojo</span>
                            <span class="team-summary">
                                {{ teamTotals(200).kills }}K ·
                                {{ teamTotals(200).towers }}T ·
                                {{ teamTotals(200).dragons }}D
                            </span>
                            <span class="team-result-pill" :class="getTeamWin(200) ? 'rp-win' : 'rp-loss'">
                                {{ getTeamWin(200) ? 'Victoria' : 'Derrota' }}
                            </span>
                        </div>

                        <!-- ── EQUIPO AZUL ── -->
                        <div class="players-col blue-col">
                            <div v-for="player in getTeamPlayers(100)" :key="player.puuid" class="p-row" :class="{
                                'p-me': player.puuid === highlightPuuid,
                                'p-searched': friendSearch && player.riotIdGameName?.toLowerCase().includes(friendSearch.toLowerCase())
                            }" @click="goToSummoner(player.riotIdGameName, player.riotIdTagline)">

                                <!-- avatar -->
                                <div class="p-avatar">
                                    <img :src="getChampionIconUrl(player.championName, version)" class="p-champ-img"
                                        @error="$event.target.style.display = 'none'" />
                                    <span class="p-lvl">{{ player.champLevel }}</span>
                                </div>

                                <!-- nombre + campeón -->
                                <div class="p-name-col">
                                    <span class="p-name" :class="{ 'me-name': player.puuid === highlightPuuid }">
                                        {{ player.riotIdGameName }}
                                    </span>
                                    <span class="p-chname">{{ player.championName }}</span>
                                </div>

                                <!-- items -->
                                <div class="items-row">
                                    <div v-for="s in 7" :key="s" class="ibox"
                                        :class="{ 'ibox-on': player[`item${s - 1}`] }">
                                        <img v-if="player[`item${s - 1}`]"
                                            :src="getItemIconUrl(player[`item${s - 1}`], version)" class="item-img"
                                            @error="$event.target.style.display = 'none'" />
                                    </div>
                                </div>

                                <!-- kda -->
                                <div class="kda-wrap">
                                    <div class="kda-nums">
                                        {{ player.kills }}<span class="sep">/</span><span class="deaths">{{
                                            player.deaths }}</span><span class="sep">/</span>{{ player.assists }}
                                    </div>
                                    <div class="kda-ratio">{{ calcKDA(player.kills, player.deaths, player.assists) }}
                                        KDA</div>
                                </div>

                                <!-- daño -->
                                <div class="dmg-wrap">
                                    <div class="dmg-val">{{ Math.round(player.totalDamageDealtToChampions / 1000) }}k
                                    </div>
                                    <div class="dmg-bar">
                                        <div class="dmg-fill" :style="{ width: getDamagePct(player) + '%' }"></div>
                                    </div>
                                </div>

                                <!-- cs -->
                                <div class="stat-cell">{{ player.totalMinionsKilled + player.neutralMinionsKilled }}
                                </div>
                                <!-- oro -->
                                <div class="stat-cell">{{ (player.goldEarned / 1000).toFixed(1) }}k</div>
                            </div>
                        </div>

                        <!-- ── COLUMNA CENTRAL ── -->
                        <div class="center-col">
                            <div class="c-stat">Campeón<br>+ Items</div>
                            <div class="c-stat">KDA</div>
                            <div class="c-stat">Daño</div>
                            <div class="c-stat">CS</div>
                            <div class="c-stat">Oro</div>
                        </div>

                        <!-- ── EQUIPO ROJO (espejado) ── -->
                        <div class="players-col red-col">
                            <div v-for="player in getTeamPlayers(200)" :key="player.puuid" class="p-row" :class="{
                                'p-me': player.puuid === highlightPuuid,
                                'p-searched': friendSearch && player.riotIdGameName?.toLowerCase().includes(friendSearch.toLowerCase())
                            }" @click="goToSummoner(player.riotIdGameName, player.riotIdTagline)">

                                <!-- oro -->
                                <div class="stat-cell">{{ (player.goldEarned / 1000).toFixed(1) }}k</div>
                                <!-- cs -->
                                <div class="stat-cell">{{ player.totalMinionsKilled + player.neutralMinionsKilled }}
                                </div>

                                <!-- daño -->
                                <div class="dmg-wrap">
                                    <div class="dmg-val" style="text-align:center">{{
                                        Math.round(player.totalDamageDealtToChampions / 1000) }}k</div>
                                    <div class="dmg-bar">
                                        <div class="dmg-fill" :style="{ width: getDamagePct(player) + '%' }"></div>
                                    </div>
                                </div>

                                <!-- kda -->
                                <div class="kda-wrap">
                                    <div class="kda-nums">
                                        {{ player.kills }}<span class="sep">/</span><span class="deaths">{{
                                            player.deaths }}</span><span class="sep">/</span>{{ player.assists }}
                                    </div>
                                    <div class="kda-ratio">{{ calcKDA(player.kills, player.deaths, player.assists) }}
                                        KDA</div>
                                </div>

                                <!-- items -->
                                <div class="items-row" style="justify-content:flex-end">
                                    <div v-for="s in 7" :key="s" class="ibox"
                                        :class="{ 'ibox-on': player[`item${s - 1}`] }">
                                        <img v-if="player[`item${s - 1}`]"
                                            :src="getItemIconUrl(player[`item${s - 1}`], version)" class="item-img"
                                            @error="$event.target.style.display = 'none'" />
                                    </div>
                                </div>

                                <!-- nombre + campeón -->
                                <div class="p-name-col" style="text-align:right">
                                    <span class="p-name" :class="{ 'me-name': player.puuid === highlightPuuid }">
                                        {{ player.riotIdGameName }}
                                    </span>
                                    <span class="p-chname">{{ player.championName }}</span>
                                </div>

                                <!-- avatar -->
                                <div class="p-avatar">
                                    <img :src="getChampionIconUrl(player.championName, version)" class="p-champ-img"
                                        @error="$event.target.style.display = 'none'" />
                                    <span class="p-lvl">{{ player.champLevel }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- ── TOTALES ── -->
                        <div class="bottom-stats left-stats">
                            <div class="bs-pill" v-for="s in bottomStats(100)" :key="s.label">
                                <span class="bs-val">{{ s.val }}</span>
                                <span class="bs-lbl">{{ s.label }}</span>
                            </div>
                        </div>
                        <div class="bottom-center">Total</div>
                        <div class="bottom-stats right-stats">
                            <div class="bs-pill" v-for="s in bottomStats(200)" :key="s.label">
                                <span class="bs-val">{{ s.val }}</span>
                                <span class="bs-lbl">{{ s.label }}</span>
                            </div>
                        </div>

                    </div>
                </div>

            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    getMatch, getLatestVersion,
    getChampionIconUrl, getItemIconUrl,
    calcKDA, formatDuration, timeAgo
} from '@/services/riot.js'

const route = useRoute()
const router = useRouter()

const match = ref(null)
const version = ref('14.1.1')
const loading = ref(true)
const highlightPuuid = route.query.puuid || ''
const friendSearch = ref('')

const queueLabels = {
    420: 'Solo/Duo', 440: 'Flex', 450: 'ARAM',
    400: 'Normal Draft', 430: 'Normal Ciegas', 900: 'URF', 0: 'Custom'
}
function getQueueLabel(id) { return queueLabels[id] || `Modo ${id}` }
function getTeamPlayers(teamId) { return match.value?.info.participants.filter(p => p.teamId === teamId) || [] }
function getTeamWin(teamId) { return match.value?.info.teams.find(t => t.teamId === teamId)?.win }

const matchedPlayers = computed(() => {
    if (!friendSearch.value || !match.value) return []
    const q = friendSearch.value.toLowerCase()
    return match.value.info.participants.filter(p => p.riotIdGameName?.toLowerCase().includes(q))
})

const maxDamage = computed(() => {
    if (!match.value) return 1
    return Math.max(...match.value.info.participants.map(p => p.totalDamageDealtToChampions))
})

function getDamagePct(player) {
    return Math.round((player.totalDamageDealtToChampions / maxDamage.value) * 100)
}

function teamTotals(teamId) {
    const players = getTeamPlayers(teamId)
    const team = match.value?.info.teams.find(t => t.teamId === teamId)
    return {
        kills: players.reduce((s, p) => s + p.kills, 0),
        gold: (players.reduce((s, p) => s + p.goldEarned, 0) / 1000).toFixed(1) + 'k',
        damage: (players.reduce((s, p) => s + p.totalDamageDealtToChampions, 0) / 1000).toFixed(1) + 'k',
        towers: team?.objectives.tower.kills || 0,
        dragons: team?.objectives.dragon.kills || 0,
    }
}

function bottomStats(teamId) {
    const t = teamTotals(teamId)
    return [
        { label: 'Kills', val: t.kills },
        { label: 'Oro', val: t.gold },
        { label: 'Daño', val: t.damage },
        { label: 'Torres', val: t.towers },
        { label: 'Dragones', val: t.dragons },
    ]
}

function goToSummoner(gameName, tagLine) {
    if (gameName && tagLine) router.push({ name: 'summoner', params: { gameName, tagLine } })
}

onMounted(async () => {
    try {
        version.value = await getLatestVersion()
        match.value = await getMatch(route.params.matchId)
    } catch (e) { console.error(e) }
    finally { loading.value = false }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Barlow+Condensed:wght@400;500;600&family=Barlow:wght@300;400;500&display=swap');

*,
*::before,
*::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

.match-page {
    position: relative;
    min-height: 100vh;
    font-family: 'Barlow', sans-serif;
    color: #f0e8d8;
}

/* ── BG: absolute, no fixed, para no tapar el sidebar ── */
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
    filter: brightness(0.45) saturate(1.1);
}

.bg-grad-left {
    position: absolute;
    inset: 0;
    background: linear-gradient(to right,
            #07080f 0%, #07080f 15%,
            rgba(7, 8, 15, .9) 40%, rgba(7, 8, 15, .6) 70%,
            rgba(7, 8, 15, .35) 100%);
}

.bg-grad-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: linear-gradient(to top, #ffffff 0%, transparent 100%);
}

.scroll-root {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
    padding: 1.25rem 1.5rem 3rem;
    display: flex;
    flex-direction: column;
    gap: .85rem;
}

/* ── HEADER ── */
.page-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.back-btn {
    background: none;
    border: none;
    color: rgba(240, 232, 216, .35);
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .8rem;
    letter-spacing: .14em;
    text-transform: uppercase;
    cursor: pointer;
    transition: color .15s;
}

.back-btn:hover {
    color: #c89b3c;
}

.header-meta {
    display: flex;
    align-items: center;
    gap: .45rem;
    margin-left: auto;
}

.badge {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1rem;
    font-weight: 500;
    letter-spacing: .08em;
    padding: 3px 9px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, .1);
    background: rgba(255, 255, 255, .05);
    color: rgba(240, 232, 216, .6);
}

.queue-badge {
    color: #c89b3c;
    background: rgba(200, 155, 60, .1);
    border-color: rgba(200, 155, 60, .25);
}

.muted-badge {
    color: rgba(240, 232, 216, .3);
    border-color: rgba(255, 255, 255, .06);
}

.header-result {
    display: flex;
    align-items: center;
    gap: .45rem;
}

.result-pill {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: .1em;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 100px;
}

.rp-win {
    background: rgba(74, 222, 128, .15);
    color: #4ade80;
    border: 1px solid rgba(74, 222, 128, .2);
}

.rp-loss {
    background: rgba(248, 113, 113, .12);
    color: #f87171;
    border: 1px solid rgba(248, 113, 113, .18);
}

.vs-sep {
    font-size: .72rem;
    color: rgba(240, 232, 216, .25);
}

/* ── LOADING ── */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 4rem;
    color: rgba(240, 232, 216, .4);
    font-family: 'Barlow Condensed', sans-serif;
    letter-spacing: .12em;
    text-transform: uppercase;
    font-size: .82rem;
}

.load-ring {
    position: relative;
    width: 40px;
    height: 40px;
}

.load-ring div {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: #c89b3c;
    animation: spin .9s linear infinite;
}

.load-ring div:nth-child(2) {
    inset: 7px;
    border-top-color: rgba(200, 155, 60, .3);
    animation-duration: 1.5s;
    animation-direction: reverse;
}

.load-ring div:nth-child(3) {
    inset: 14px;
    border-top-color: rgba(200, 155, 60, .12);
    animation-duration: 2.2s;
}

@keyframes spin {
    to {
        transform: rotate(360deg)
    }
}

/* ── BUSCADOR ── */
.friend-bar {
    display: flex;
    align-items: center;
    gap: .65rem;
    padding: .6rem 1rem;
    background: rgba(8, 12, 24, .65);
    border: 1px solid rgba(255, 255, 255, .08);
    border-radius: 10px;
    backdrop-filter: blur(12px);
    flex-wrap: wrap;
}

.search-icon {
    font-size: 1rem;
    color: rgba(240, 232, 216, .3);
    flex-shrink: 0;
}

.friend-input {
    flex: 1;
    min-width: 160px;
    background: transparent;
    border: none;
    outline: none;
    color: #f0e8d8;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .88rem;
    letter-spacing: .04em;
}

.friend-input::placeholder {
    color: rgba(240, 232, 216, .2);
}

.friend-chips {
    display: flex;
    gap: .4rem;
    flex-wrap: wrap;
}

.friend-chip {
    display: flex;
    align-items: center;
    gap: .4rem;
    background: rgba(200, 155, 60, .1);
    border: 1px solid rgba(200, 155, 60, .25);
    color: #c89b3c;
    padding: .22rem .6rem;
    border-radius: 4px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .75rem;
    cursor: pointer;
    transition: background .15s;
}

.friend-chip:hover {
    background: rgba(200, 155, 60, .2);
}

.friend-champ-icon {
    width: 18px;
    height: 18px;
    border-radius: 50%;
}

/* ── TABLE WRAPPER — permite scroll horizontal si es necesario ── */
.table-wrapper {
    width: 100%;
    overflow-x: auto;
    border-radius: 14px;
}

/* ── MATCH GRID ── */
.match-grid {
    display: grid;
    grid-template-columns: 1fr 90px 1fr;
    min-width: 900px;
    background: rgba(8, 12, 24, .6);
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    border: 1px solid rgba(255, 255, 255, .09);
    border-radius: 14px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, .06), 0 4px 40px rgba(0, 0, 0, .5);
}

/* ── HEADERS EQUIPO ── */
.team-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 18px;
    border-bottom: 1px solid rgba(255, 255, 255, .07);
}

.blue-header {
    background: rgba(55, 138, 221, .08);
}

.red-header {
    background: rgba(226, 75, 74, .08);
}

.team-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.dot-blue {
    background: #378add;
}

.dot-red {
    background: #e24b4a;
}

.team-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: .1em;
    text-transform: uppercase;
}

.blue-name {
    color: #85b7eb;
}

.red-name {
    color: #f09595;
}

.team-summary {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1rem;
    color: rgba(240, 232, 216, .3);
    letter-spacing: .05em;
}

.team-result-pill {
    margin-left: auto;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: .1em;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 100px;
}

/* ── CENTRO ── */
.center-header {
    padding: 11px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, .07);
    background: rgba(255, 255, 255, .02);
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .63rem;
    font-weight: 600;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: rgba(240, 232, 216, .2);
    text-align: center;
    border-left: 1px solid rgba(255, 255, 255, .07);
    border-right: 1px solid rgba(255, 255, 255, .07);
}

.center-col {
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, .02);
    border-left: 1px solid rgba(255, 255, 255, .07);
    border-right: 1px solid rgba(255, 255, 255, .07);
}

.c-stat {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, .05);
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .63rem;
    font-weight: 500;
    letter-spacing: .07em;
    text-transform: uppercase;
    color: rgba(240, 232, 216, .2);
    padding: 0 10px;
    line-height: 1.4;
    min-height: 68px;
}

.c-stat:last-child {
    border-bottom: none;
}

/* ── FILAS ── */
.players-col {
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/*
  Azul:  [48 avatar] [140 nombre] [182 items] [86 kda] [106 daño] [48 cs] [52 oro]
  Total: 48+140+182+86+106+48+52 + 6×8gap = 662 + 48 = 710px
*/
.blue-col .p-row {
    display: grid;
    grid-template-columns: 48px 140px 182px 86px 106px 48px 52px;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    min-height: 68px;
    border-bottom: 1px solid rgba(255, 255, 255, .05);
    cursor: pointer;
    transition: background .12s;
}

/*
  Rojo (espejado): [52 oro] [48 cs] [106 daño] [86 kda] [182 items] [140 nombre] [48 avatar]
*/
.red-col .p-row {
    display: grid;
    grid-template-columns: 52px 48px 106px 86px 182px 140px 48px;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    min-height: 68px;
    border-bottom: 1px solid rgba(255, 255, 255, .05);
    cursor: pointer;
    transition: background .12s;
}

.p-row:last-child {
    border-bottom: none;
}

.p-row:hover {
    background: rgba(255, 255, 255, .04);
}

.p-me {
    background: rgba(200, 155, 60, .07) !important;
    border-left: 3px solid rgba(200, 155, 60, .55);
}

.p-searched {
    background: rgba(55, 138, 221, .07) !important;
    border-left: 3px solid rgba(55, 138, 221, .5);
}

/* ── AVATAR ── */
.p-avatar {
    position: relative;
    width: 48px;
    height: 48px;
    flex-shrink: 0;
}

.p-champ-img {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    border: 1.5px solid rgba(200, 155, 60, .22);
    display: block;
    object-fit: cover;
}

.p-lvl {
    position: absolute;
    bottom: -4px;
    right: -4px;
    width: 17px;
    height: 17px;
    border-radius: 50%;
    background: #060912;
    border: 1px solid #c89b3c;
    color: #c89b3c;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .6rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* ── NOMBRE ── */
.p-name-col {
    display: flex;
    flex-direction: column;
    gap: 3px;
    overflow: hidden;
}

.p-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .95rem;
    font-weight: 600;
    color: #f0e8d8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    letter-spacing: .02em;
}

.p-chname {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .7rem;
    color: rgba(240, 232, 216, .3);
    white-space: nowrap;
    letter-spacing: .02em;
}

.me-name {
    color: #c89b3c;
}

/* ── ITEMS: 7×24px + 6×2px gap = 180px ≈ 182px ── */
.items-row {
    display: flex;
    gap: 2px;
    align-items: center;
}

.ibox {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    flex-shrink: 0;
    background: rgba(255, 255, 255, .04);
    border: 1px solid rgba(255, 255, 255, .08);
    overflow: hidden;
}

.ibox-on {
    background: rgba(200, 155, 60, .08);
    border-color: rgba(200, 155, 60, .22);
}

.item-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

/* ── KDA ── */
.kda-wrap {
    text-align: center;
}

.kda-nums {
    font-family: 'Rajdhani', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    color: #f0e8d8;
}

.sep {
    color: rgba(240, 232, 216, .25);
    margin: 0 1px;
}

.deaths {
    color: #f87171;
}

.kda-ratio {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .68rem;
    color: rgba(240, 232, 216, .35);
    margin-top: 1px;
}

/* ── DAÑO ── */
.dmg-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.dmg-val {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .88rem;
    color: rgba(240, 232, 216, .8);
    text-align: center;
}

.dmg-bar {
    height: 3px;
    background: rgba(255, 255, 255, .08);
    border-radius: 2px;
    overflow: hidden;
}

.dmg-fill {
    height: 100%;
    border-radius: 2px;
    background: #c89b3c;
}

/* ── CS / ORO ── */
.stat-cell {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .88rem;
    color: rgba(240, 232, 216, .55);
    text-align: center;
}

/* ── TOTALES ── */
.bottom-stats {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 12px 18px;
    border-top: 1px solid rgba(255, 255, 255, .07);
    background: rgba(255, 255, 255, .02);
}

.right-stats {
    justify-content: flex-end;
}

.bottom-center {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 10px;
    background: rgba(255, 255, 255, .02);
    border-top: 1px solid rgba(255, 255, 255, .07);
    border-left: 1px solid rgba(255, 255, 255, .07);
    border-right: 1px solid rgba(255, 255, 255, .07);
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .63rem;
    font-weight: 600;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: rgba(240, 232, 216, .2);
}

.bs-pill {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    background: rgba(255, 255, 255, .04);
    border: 1px solid rgba(255, 255, 255, .08);
    border-radius: 8px;
    padding: 8px 14px;
    min-width: 58px;
}

.bs-val {
    font-family: 'Rajdhani', sans-serif;
    font-size: 1.2rem;
    font-weight: 600;
    color: #f0e8d8;
    line-height: 1;
}

.bs-lbl {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .62rem;
    letter-spacing: .07em;
    text-transform: uppercase;
    color: rgba(240, 232, 216, .3);
}

/* ── RESPONSIVE ── */
@media (max-width:900px) {
    .match-grid {
        grid-template-columns: 1fr;
    }

    .center-header,
    .center-col,
    .bottom-center {
        display: none;
    }

    .blue-col .p-row,
    .red-col .p-row {
        grid-template-columns: 48px 130px 196px 80px;
        padding: 8px 10px;
    }

    .scroll-root {
        padding: 1rem .75rem 2rem;
    }
}
</style>