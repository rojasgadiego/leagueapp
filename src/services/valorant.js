const BASE_URL = "https://api.henrikdev.xyz";
const API_KEY = "HDEV-b3615f6a-a6bf-444d-be87-e5e2ac15179f";

// ─────────────────────────────────────────
// Helper interno
// ─────────────────────────────────────────

async function request(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: API_KEY,
      "Content-Type": "application/json",
    },
  });

  const json = await response.json();

  if (!response.ok) {
    const message =
      json?.errors?.[0]?.message ?? json?.message ?? "Error desconocido";
    throw new Error(`[${response.status}] ${message}`);
  }

  return json.data;
}

// ─────────────────────────────────────────
// Cuenta / Perfil del jugador
// ─────────────────────────────────────────

/**
 * Obtiene la info de cuenta de un jugador.
 * Importante: usar la region que devuelve este endpoint
 * en las demás llamadas (ej: "na" en vez de "latam").
 *
 * @param {string} name - Nick del jugador (ej: "Dieg0ski")
 * @param {string} tag  - Tag del jugador (ej: "LAS")
 * @returns {{ puuid, region, account_level, name, tag, card, platforms }}
 */
export async function getAccount(name, tag) {
  return request(
    `/valorant/v2/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`
  );
}

// ─────────────────────────────────────────
// MMR / Rango (v3 - última versión)
// ─────────────────────────────────────────

/**
 * Obtiene el rango actual, pico histórico y stats por temporada.
 *
 * @param {string} region   - Región real del jugador (obtenida de getAccount)
 * @param {string} name
 * @param {string} tag
 * @param {"pc"|"console"} [platform="pc"]
 * @returns {{ account, current, peak, seasonal }}
 */
export async function getMMR(region, name, tag, platform = "pc") {
  return request(
    `/valorant/v3/mmr/${region}/${platform}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`
  );
}

// ─────────────────────────────────────────
// Historial de partidas
// ─────────────────────────────────────────

/**
 * Obtiene las últimas partidas de un jugador.
 *
 * @param {string} region
 * @param {string} name
 * @param {string} tag
 * @param {Object} options
 * @param {"competitive"|"unrated"|"deathmatch"|"spikerush"|"escalation"|"all"} [options.mode="all"]
 * @param {number} [options.size=10] - Cantidad de partidas (máx. 10)
 * @returns {Array} Lista de partidas
 */
export async function getMatchHistory(region, name, tag, { mode = "all", size = 10 } = {}) {
  const params = new URLSearchParams();
  if (mode !== "all") params.set("mode", mode);
  params.set("size", size);

  return request(
    `/valorant/v3/matches/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?${params}`
  );
}

// ─────────────────────────────────────────
// Detalle de una partida
// ─────────────────────────────────────────

/**
 * Obtiene el detalle completo de una partida.
 *
 * @param {string} matchId - ID de la partida (metadata.matchid)
 * @returns {{ metadata, players, teams, rounds, kills }}
 */
export async function getMatchDetail(matchId) {
  return request(`/valorant/v2/match/${matchId}`);
}

// ─────────────────────────────────────────
// Flujo completo: buscar jugador
// ─────────────────────────────────────────

/**
 * Carga todos los datos de un jugador en una sola llamada.
 * Primero obtiene el perfil (y la región real), luego en paralelo
 * trae el MMR y el historial de partidas.
 *
 * @param {string} name
 * @param {string} tag
 * @param {"competitive"|"unrated"|"all"} [matchMode="competitive"]
 * @returns {{ account, mmr, matches }}
 *
 * @example
 * const { account, mmr, matches } = await getPlayerProfile("Dieg0ski", "LAS")
 */
export async function getPlayerProfile(name, tag, matchMode = "competitive") {
  // Paso 1: obtener cuenta y región real
  const account = await getAccount(name, tag);
  const region = account.region; // ej: "na" aunque el tag sea LAS

  // Paso 2: MMR e historial en paralelo
  const [mmr, matches] = await Promise.all([
    getMMR(region, name, tag),
    getMatchHistory(region, name, tag, { mode: matchMode, size: 10 }),
  ]);

  return { account, mmr, matches };
}