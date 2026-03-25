import { cacheGet, cacheSet } from './cache.js'

const API_KEY = 'RGAPI-1ff426bf-42c5-411c-b43c-91d5f8ee0032'

async function cachedFetch(key, url) {
  const hit = cacheGet(key)
  if (hit) return hit
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Error ${res.status} en ${key}`)
  const data = await res.json()
  cacheSet(key, data)
  return data
}

export async function getAccountByRiotId(gameName, tagLine) {
  const key = `account:${gameName}:${tagLine}`.toLowerCase()
  const res = await fetch(
    `/riot-api/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}?api_key=${API_KEY}`
  )
  if (!res.ok) throw new Error(`Jugador no encontrado (${res.status})`)
  const data = await res.json()
  cacheSet(key, data)
  return data
}

export async function getSummonerByPuuid(puuid) {
  return cachedFetch(`summoner:${puuid}`, `/lol-api-las/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${API_KEY}`)
}

export async function getRankedInfo(puuid) {
  return cachedFetch(`ranked:${puuid}`, `/lol-api-las/lol/league/v4/entries/by-puuid/${puuid}?api_key=${API_KEY}`)
}

// Trae solo los IDs — count bajo para ahorrar calls
export async function getMatchHistory(puuid, { start = 0, count = 10 } = {}) {
  // Los IDs no se cachean porque dependen de start
  const res = await fetch(
    `/riot-api/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}&api_key=${API_KEY}`
  )
  if (!res.ok) throw new Error(`Error historial (${res.status})`)
  return res.json()
}

// Cada partida sí se cachea — nunca cambia
export async function getMatch(matchId) {
  return cachedFetch(`match:${matchId}`, `/riot-api/lol/match/v5/matches/${matchId}?api_key=${API_KEY}`)
}

export async function getLiveGame(puuid) {
  // La partida en vivo NO se cachea — siempre fresca
  const res = await fetch(`/lol-api-las/lol/spectator/v5/active-games/by-summoner/${puuid}?api_key=${API_KEY}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Error spectator (${res.status})`)
  return res.json()
}

export async function getLatestVersion() {
  return cachedFetch('version', 'https://ddragon.leagueoflegends.com/api/versions.json')
    .then(v => v[0])
}

export function getChampionIconUrl(championName, version) {
    if (!championName || !version) return ''
    return `/ddragon/cdn/${version}/img/champion/${championName}.png`
}

export function getItemIconUrl(itemId, version) {
    if (!itemId || !version) return null
    return `/ddragon/cdn/${version}/img/item/${itemId}.png`
}

export function calcKDA(kills, deaths, assists) {
  if (deaths === 0) return 'Perfect'
  return ((kills + assists) / deaths).toFixed(2)
}

export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function timeAgo(timestamp) {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `hace ${days}d`
  if (hours > 0) return `hace ${hours}h`
  return `hace ${minutes}m`
}

export function calcChampionStats(matches, puuid) {
  const stats = {}
  for (const match of matches) {
    const p = match.info.participants.find(x => x.puuid === puuid)
    if (!p) continue
    const c = p.championName
    if (!stats[c]) stats[c] = { name: c, games: 0, wins: 0, kills: 0, deaths: 0, assists: 0, damage: 0 }
    stats[c].games++
    if (p.win) stats[c].wins++
    stats[c].kills += p.kills
    stats[c].deaths += p.deaths
    stats[c].assists += p.assists
    stats[c].damage += p.totalDamageDealtToChampions
  }
  return Object.values(stats).sort((a, b) => b.games - a.games)
}

export const SPECTATOR_QUEUE_LABELS = {
  400: 'Normal Draft', 420: 'Solo/Duo', 430: 'Normal Ciegas',
  440: 'Flex', 450: 'ARAM', 900: 'URF', 1020: 'One for All', 0: 'Custom'
}