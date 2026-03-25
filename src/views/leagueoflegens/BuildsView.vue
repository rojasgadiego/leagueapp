<template>
    <div class="page">

        <div class="bg-layer">
            <div class="bg-img"></div>
            <div class="bg-jinx-light"></div>
        </div>
        <div class="bg-vignette"></div>
        <div class="bg-grain"></div>

        <div class="scroll-root">

            <div class="page-header">
                <h1 class="page-title">Builds</h1>
                <p class="page-sub">Recomendaciones generadas por IA para el meta actual</p>
            </div>

            <!-- Buscador -->
            <div class="glass-card search-card">
                <div class="search-row">
                    <div class="champ-search-wrap">
                        <input v-model="champInput" @input="onChampInput" @keydown.enter="selectFirstSuggestion"
                            placeholder="Buscar campeón..." class="champ-input" autocomplete="off" />
                        <!-- Sugerencias -->
                        <div v-if="suggestions.length && !selectedChamp" class="suggestions-list">
                            <button v-for="s in suggestions.slice(0, 6)" :key="s.id" class="suggestion-item"
                                @click="selectChamp(s)">
                                <img :src="getChampIconUrl(s.id)" class="sug-icon"
                                    @error="$event.target.style.display = 'none'" />
                                <span>{{ s.name }}</span>
                            </button>
                        </div>
                        <!-- Champ seleccionado -->
                        <div v-if="selectedChamp" class="selected-champ">
                            <img :src="getChampIconUrl(selectedChamp.id)" class="selected-icon" />
                            <span class="selected-name">{{ selectedChamp.name }}</span>
                            <button class="clear-btn" @click="clearChamp">✕</button>
                        </div>
                    </div>

                    <!-- Rol -->
                    <div class="role-filters">
                        <button v-for="r in roles" :key="r.id" :class="['role-btn', { active: selectedRole === r.id }]"
                            @click="selectedRole = r.id" :title="r.label">
                            <span class="role-icon">{{ r.icon }}</span>
                            <span class="role-label">{{ r.label }}</span>
                        </button>
                    </div>

                    <button class="generate-btn" :disabled="!selectedChamp || generating" @click="generateBuild">
                        <span v-if="generating" class="btn-spin"></span>
                        <span v-else>⚡</span>
                        {{ generating ? 'Generando...' : 'Generar build' }}
                    </button>
                </div>
            </div>

            <!-- Estado vacío -->
            <div v-if="!build && !generating && !error" class="empty-state">
                <div class="empty-icon">⚔</div>
                <p class="empty-title">Seleccioná un campeón y un rol</p>
                <p class="empty-sub">La IA analizará el meta actual y te recomendará la mejor build</p>
            </div>

            <!-- Error -->
            <div v-if="error" class="error-banner">
                <span>✕</span> {{ error }}
            </div>

            <!-- Skeleton cargando -->
            <div v-if="generating" class="build-grid">
                <div class="glass-card build-section skel-section">
                    <div class="skel skel-text" style="width:120px;height:14px;margin-bottom:1.2rem"></div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap">
                        <div v-for="i in 6" :key="i" class="skel" style="width:48px;height:48px;border-radius:8px">
                        </div>
                    </div>
                </div>
                <div class="glass-card build-section skel-section">
                    <div class="skel skel-text" style="width:100px;height:14px;margin-bottom:1.2rem"></div>
                    <div style="display:flex;gap:8px">
                        <div v-for="i in 2" :key="i" class="skel" style="width:48px;height:48px;border-radius:8px">
                        </div>
                    </div>
                </div>
                <div class="glass-card build-section skel-section">
                    <div class="skel skel-text" style="width:80px;height:14px;margin-bottom:1.2rem"></div>
                    <div style="display:flex;gap:8px">
                        <div v-for="i in 2" :key="i" class="skel" style="width:48px;height:48px;border-radius:8px">
                        </div>
                    </div>
                </div>
                <div class="glass-card build-section skel-section">
                    <div class="skel skel-text" style="width:140px;height:14px;margin-bottom:1.2rem"></div>
                    <div style="display:flex;gap:16px">
                        <div v-for="i in 5" :key="i" class="skel" style="width:36px;height:36px;border-radius:6px">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Build generada -->
            <template v-if="build && !generating">

                <div class="build-meta-bar">
                    <div class="build-champ-info">
                        <img :src="getChampIconUrl(selectedChamp?.id)" class="build-champ-icon" />
                        <div>
                            <span class="build-champ-name">{{ selectedChamp?.name }}</span>
                            <span class="build-role-tag">{{roles.find(r => r.id === selectedRole)?.label}}</span>
                        </div>
                    </div>
                    <div class="build-winrate" v-if="build.winrate">
                        <span class="wr-num" :class="build.winrate >= 50 ? 'wr-pos' : 'wr-neg'">{{ build.winrate
                            }}%</span>
                        <span class="wr-lbl">WR estimado</span>
                    </div>
                </div>

                <div class="build-grid">

                    <!-- Items -->
                    <div class="glass-card build-section">
                        <div class="section-header">
                            <span class="section-title">Items</span>
                            <span class="section-sub">Orden de compra recomendado</span>
                        </div>

                        <!-- Inicio -->
                        <div class="item-group">
                            <span class="item-group-label">Inicio</span>
                            <div class="items-row">
                                <div v-for="item in build.items?.start" :key="item.id" class="item-slot"
                                    :title="item.name">
                                    <img :src="getItemIconUrl(item.id)" class="item-img"
                                        @error="$event.target.style.display = 'none'" />
                                    <span class="item-name">{{ item.name }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Core -->
                        <div class="item-group">
                            <span class="item-group-label">Core</span>
                            <div class="items-row">
                                <div v-for="(item, idx) in build.items?.core" :key="item.id" class="item-slot"
                                    :title="item.name">
                                    <div class="item-order">{{ idx + 1 }}</div>
                                    <img :src="getItemIconUrl(item.id)" class="item-img"
                                        @error="$event.target.style.display = 'none'" />
                                    <span class="item-name">{{ item.name }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Opcionales -->
                        <div class="item-group" v-if="build.items?.optional?.length">
                            <span class="item-group-label">Situacionales</span>
                            <div class="items-row">
                                <div v-for="item in build.items?.optional" :key="item.id" class="item-slot optional"
                                    :title="item.name">
                                    <img :src="getItemIconUrl(item.id)" class="item-img"
                                        @error="$event.target.style.display = 'none'" />
                                    <span class="item-name">{{ item.name }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Runas -->
                    <div class="glass-card build-section">
                        <div class="section-header">
                            <span class="section-title">Runas</span>
                        </div>
                        <div class="runes-layout">
                            <!-- Árbol principal -->
                            <div class="rune-tree">
                                <span class="rune-tree-label">{{ build.runes?.primaryTree }}</span>
                                <div class="rune-slot keystone" :title="build.runes?.keystone?.name">
                                    <img v-if="getRuneIcon(build.runes?.keystone?.id)"
                                        :src="getRuneIcon(build.runes?.keystone?.id)" class="rune-img keystone-img"
                                        @error="$event.target.style.display = 'none'" />
                                    <span class="rune-name">{{ build.runes?.keystone?.name }}</span>
                                </div>
                                <div class="runes-minor-list">
                                    <div v-for="r in build.runes?.primary" :key="r.id" class="rune-slot minor"
                                        :title="r.name">
                                        <img v-if="getRuneIcon(r.id)" :src="getRuneIcon(r.id)" class="rune-img"
                                            @error="$event.target.style.display = 'none'" />
                                        <span class="rune-name">{{ r.name }}</span>
                                    </div>
                                </div>
                            </div>
                            <!-- Árbol secundario -->
                            <div class="rune-tree secondary">
                                <span class="rune-tree-label">{{ build.runes?.secondaryTree }}</span>
                                <div class="runes-minor-list">
                                    <div v-for="r in build.runes?.secondary" :key="r.id" class="rune-slot minor"
                                        :title="r.name">
                                        <img v-if="getRuneIcon(r.id)" :src="getRuneIcon(r.id)" class="rune-img"
                                            @error="$event.target.style.display = 'none'" />
                                        <span class="rune-name">{{ r.name }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Estadísticas de fragmentos -->
                        <div class="shards-row" v-if="build.runes?.shards?.length">
                            <span class="item-group-label">Fragmentos</span>
                            <div class="shards-list">
                                <span v-for="s in build.runes.shards" :key="s" class="shard-pill">{{ s }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Summoner Spells -->
                    <div class="glass-card build-section">
                        <div class="section-header">
                            <span class="section-title">Summoner Spells</span>
                        </div>
                        <div class="spells-row">
                            <div v-for="spell in build.spells" :key="spell.id" class="spell-slot">
                                <img :src="getSpellUrl(spell.id)" class="spell-img"
                                    @error="$event.target.style.display = 'none'" />
                                <span class="spell-name">{{ spell.name }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Orden de habilidades -->
                    <div class="glass-card build-section">
                        <div class="section-header">
                            <span class="section-title">Orden de habilidades</span>
                            <span class="section-sub">Prioridad de nivel</span>
                        </div>
                        <div class="skills-priority">
                            <div v-for="(skill, idx) in build.skillOrder" :key="idx" class="skill-badge">
                                <span class="skill-key">{{ skill }}</span>
                                <span v-if="idx < build.skillOrder.length - 1" class="skill-arrow">›</span>
                            </div>
                        </div>
                        <div class="skill-level-grid" v-if="build.skillLevels?.length">
                            <div class="skill-level-header">
                                <span class="slh-label">Niv.</span>
                                <span v-for="n in 18" :key="n" class="slh-num">{{ n }}</span>
                            </div>
                            <div v-for="sk in ['Q', 'W', 'E', 'R']" :key="sk" class="skill-level-row">
                                <span class="slr-key">{{ sk }}</span>
                                <div v-for="n in 18" :key="n" class="slr-cell"
                                    :class="{ active: build.skillLevels[n - 1] === sk, ultimate: sk === 'R' && build.skillLevels[n - 1] === sk }">
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- Tips de la IA -->
                <div class="glass-card tips-card" v-if="build.tips?.length">
                    <div class="section-header">
                        <span class="section-title">💡 Consejos de la IA</span>
                    </div>
                    <ul class="tips-list">
                        <li v-for="(tip, i) in build.tips" :key="i" class="tip-item">{{ tip }}</li>
                    </ul>
                </div>

            </template>

            <div class="page-bottom-pad"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getLatestVersion } from '@/services/riot.js'

const version = ref('14.1.1')
const champInput = ref('')
const selectedChamp = ref(null)
const selectedRole = ref('mid')
const suggestions = ref([])
const generating = ref(false)
const build = ref(null)
const error = ref('')
const champList = ref([])
const runeMap = ref({})
const itemMap = ref({})

const roles = [
    { id: 'top', label: 'Top', icon: '🛡' },
    { id: 'jungle', label: 'Jungla', icon: '🌿' },
    { id: 'mid', label: 'Mid', icon: '⚡' },
    { id: 'adc', label: 'ADC', icon: '🏹' },
    { id: 'support', label: 'Support', icon: '💊' },
]

const SPELL_NAMES = {
    SummonerFlash: 'Flash', SummonerIgnite: 'Ignite', SummonerExhaust: 'Exhaust',
    SummonerBarrier: 'Barrier', SummonerHeal: 'Heal', SummonerSmite: 'Smite',
    SummonerTeleport: 'Teleport', SummonerBoost: 'Cleanse', SummonerDot: 'Ignite',
    SummonerHaste: 'Ghost', SummonerMana: 'Clarity', SummonerSnowball: 'Snowball',
}

function getChampIconUrl(champId) {
    if (!champId) return ''
    return `/ddragon/cdn/${version.value}/img/champion/${champId}.png`
}

function getItemIconUrl(itemId) {
    if (!itemId) return ''
    return `/ddragon/cdn/${version.value}/img/item/${itemId}.png`
}

function getSpellUrl(spellId) {
    if (!spellId) return ''
    return `/ddragon/cdn/${version.value}/img/spell/${spellId}.png`
}

function getRuneIcon(runeId) {
    if (!runeId || !runeMap.value[runeId]) return ''
    return `https://ddragon.leagueoflegends.com/cdn/img/${runeMap.value[runeId]}`
}

async function loadChampList() {
    try {
        const res = await fetch(`/ddragon/cdn/${version.value}/data/es_MX/champion.json`)
        const data = await res.json()
        champList.value = Object.values(data.data).map(c => ({ id: c.id, name: c.name, key: c.key }))
    } catch (e) { console.error(e) }
}

async function loadRuneMap() {
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
    } catch (e) { console.error(e) }
}

async function loadItemMap() {
    try {
        const res = await fetch(`/ddragon/cdn/${version.value}/data/es_MX/item.json`)
        const data = await res.json()
        itemMap.value = data.data
    } catch (e) { console.error(e) }
}

function onChampInput() {
    selectedChamp.value = null
    build.value = null
    const q = champInput.value.toLowerCase().trim()
    if (!q) { suggestions.value = []; return }
    suggestions.value = champList.value.filter(c =>
        c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    )
}

function selectChamp(champ) {
    selectedChamp.value = champ
    champInput.value = champ.name
    suggestions.value = []
    build.value = null
}

function selectFirstSuggestion() {
    if (suggestions.value.length) selectChamp(suggestions.value[0])
}

function clearChamp() {
    selectedChamp.value = null
    champInput.value = ''
    suggestions.value = []
    build.value = null
}

async function generateBuild() {
    if (!selectedChamp.value) return
    generating.value = true
    error.value = ''
    build.value = null

    const role = roles.find(r => r.id === selectedRole.value)?.label ?? selectedRole.value
    const champ = selectedChamp.value.name

    const prompt = `Eres un experto en League of Legends. Genera una build óptima para ${champ} en el rol de ${role} basada en el meta más reciente que conozcas.

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin backticks, sin explicaciones fuera del JSON. El formato debe ser exactamente este:

{
  "winrate": 52,
  "items": {
    "start": [
      { "id": "1055", "name": "Doran's Blade" }
    ],
    "core": [
      { "id": "6672", "name": "Kraken Slayer" },
      { "id": "3031", "name": "Infinity Edge" },
      { "id": "3046", "name": "Phantom Dancer" }
    ],
    "optional": [
      { "id": "3033", "name": "Mortal Reminder" },
      { "id": "3036", "name": "Lord Dominik's Regards" }
    ]
  },
  "runes": {
    "primaryTree": "Precisión",
    "keystone": { "id": 8021, "name": "Conqueror" },
    "primary": [
      { "id": 9101, "name": "Triunfo" },
      { "id": 9104, "name": "Leyenda: Velocidad de Ataque" },
      { "id": 8299, "name": "Golpe de Gracia" }
    ],
    "secondaryTree": "Brujería",
    "secondary": [
      { "id": 8210, "name": "Calzado de Mago" },
      { "id": 8236, "name": "Celerity" }
    ],
    "shards": ["Velocidad de ataque", "Vida adaptable", "Armadura"]
  },
  "spells": [
    { "id": "SummonerFlash", "name": "Flash" },
    { "id": "SummonerIgnite", "name": "Ignite" }
  ],
  "skillOrder": ["Q", "E", "W", "R"],
  "skillLevels": ["Q","W","E","R","Q","Q","R","Q","Q","W","R","W","W","E","E","R","E","E"],
  "tips": [
    "Consejo 1 sobre cómo jugar este campeón en este rol",
    "Consejo 2 sobre el early game",
    "Consejo 3 sobre el late game"
  ]
}

Usa IDs reales de items de League of Legends y IDs reales de runas. Los spell IDs deben ser los nombres internos como SummonerFlash, SummonerIgnite, etc. skillLevels debe tener exactamente 18 elementos indicando qué habilidad subir en cada nivel.`

    try {
        const response = await fetch('/anthropic-api/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'TU_API_KEY_ACA',
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                messages: [{ role: 'user', content: prompt }]
            })
        })

        const data = await response.json()
        const text = data.content?.map(b => b.text || '').join('') ?? ''
        const clean = text.replace(/```json|```/g, '').trim()
        build.value = JSON.parse(clean)
    } catch (e) {
        console.error(e)
        error.value = 'Error al generar la build. Intentá de nuevo.'
    } finally {
        generating.value = false
    }
}

onMounted(async () => {
    try {
        const res = await fetch('https://ddragon.leagueoflegends.com/api/versions.json')
        const versions = await res.json()
        version.value = versions[0]
    } catch { }
    await Promise.all([loadChampList(), loadRuneMap(), loadItemMap()])
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
    display: block;
}

.skel-text {
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
    background: radial-gradient(ellipse 42% 60% at 80% 46%, rgba(255, 200, 80, .22) 0%, rgba(255, 140, 30, .10) 45%, transparent 70%),
        radial-gradient(ellipse 18% 28% at 84% 32%, rgba(255, 235, 150, .15) 0%, transparent 55%);
    mix-blend-mode: screen;
    animation: jinx-flicker 4s ease-in-out infinite;
}

@keyframes jinx-flicker {

    0%,
    100% {
        opacity: 1
    }

    45% {
        opacity: .82
    }

    50% {
        opacity: .95
    }

    55% {
        opacity: .78
    }

    60% {
        opacity: 1
    }
}

.page {
    position: relative;
    min-height: 100vh;
    width: 100%;
    font-family: 'Barlow', sans-serif;
    font-size: 15px;
    color: var(--tb);
}

.bg-vignette {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: radial-gradient(ellipse 140% 70% at 50% 0%, rgba(4, 6, 14, .2) 0%, rgba(4, 6, 14, .88) 65%),
        linear-gradient(to bottom, transparent 0%, rgba(4, 6, 14, .47) 60%, #04060e 100%);
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

.scroll-root {
    position: relative;
    z-index: 10;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 2rem 2rem 0;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.page-bottom-pad {
    height: 3rem;
}

.page-header {
    padding-bottom: .5rem;
}

.page-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: 2.4rem;
    font-weight: 700;
    color: var(--tb);
    line-height: 1;
}

.page-sub {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .8rem;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--td);
    margin-top: .3rem;
}

.glass-card {
    background: var(--gb);
    backdrop-filter: blur(var(--blur)) saturate(1.6);
    -webkit-backdrop-filter: blur(var(--blur)) saturate(1.6);
    border: 1px solid var(--gd);
    border-radius: var(--r);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, .06), 0 4px 24px rgba(0, 0, 0, .35);
}

/* SEARCH CARD */
.search-card {
    padding: 1.25rem 1.5rem;
}

.search-row {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    flex-wrap: wrap;
}

.champ-search-wrap {
    position: relative;
    flex: 1;
    min-width: 220px;
}

.champ-input {
    width: 100%;
    background: rgba(255, 255, 255, .05);
    border: 1px solid var(--gd);
    border-radius: 10px;
    padding: .6rem 1rem;
    color: var(--tb);
    font-family: 'Barlow', sans-serif;
    font-size: .95rem;
    outline: none;
    transition: border-color .15s;
}

.champ-input::placeholder {
    color: var(--td);
}

.champ-input:focus {
    border-color: rgba(200, 155, 60, .4);
}

.suggestions-list {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: rgba(8, 12, 24, .95);
    border: 1px solid var(--gd);
    border-radius: 10px;
    overflow: hidden;
    z-index: 50;
    backdrop-filter: blur(20px);
}

.suggestion-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: .6rem;
    padding: .5rem .85rem;
    background: none;
    border: none;
    color: var(--tm);
    font-family: 'Barlow', sans-serif;
    font-size: .9rem;
    cursor: pointer;
    transition: background .1s;
    text-align: left;
}

.suggestion-item:hover {
    background: rgba(200, 155, 60, .08);
    color: var(--tb);
}

.sug-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    object-fit: cover;
    border: 1px solid var(--gd);
}

.selected-champ {
    display: flex;
    align-items: center;
    gap: .6rem;
    background: rgba(200, 155, 60, .1);
    border: 1px solid rgba(200, 155, 60, .3);
    border-radius: 10px;
    padding: .5rem .85rem;
}

.selected-icon {
    width: 32px;
    height: 32px;
    border-radius: 7px;
    object-fit: cover;
    border: 1px solid rgba(200, 155, 60, .3);
}

.selected-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    color: var(--accent);
    flex: 1;
}

.clear-btn {
    background: none;
    border: none;
    color: var(--td);
    cursor: pointer;
    font-size: .85rem;
    padding: 0 .2rem;
    transition: color .15s;
}

.clear-btn:hover {
    color: var(--loss);
}

/* ROLE FILTERS */
.role-filters {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
}

.role-btn {
    display: flex;
    align-items: center;
    gap: .35rem;
    background: none;
    border: 1px solid var(--gd);
    color: var(--td);
    padding: .5rem .85rem;
    border-radius: 8px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .78rem;
    letter-spacing: .06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all .15s;
}

.role-btn:hover {
    border-color: rgba(200, 155, 60, .35);
    color: var(--tm);
}

.role-btn.active {
    border-color: rgba(200, 155, 60, .5);
    background: var(--as);
    color: var(--accent);
}

.role-icon {
    font-size: 1rem;
}

/* GENERATE BTN */
.generate-btn {
    display: flex;
    align-items: center;
    gap: .5rem;
    background: linear-gradient(135deg, rgba(200, 155, 60, .3) 0%, rgba(200, 155, 60, .15) 100%);
    border: 1px solid rgba(200, 155, 60, .5);
    color: var(--accent);
    padding: .6rem 1.4rem;
    border-radius: 10px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .85rem;
    letter-spacing: .08em;
    text-transform: uppercase;
    font-weight: 600;
    cursor: pointer;
    transition: all .15s;
    white-space: nowrap;
}

.generate-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(200, 155, 60, .45) 0%, rgba(200, 155, 60, .25) 100%);
}

.generate-btn:disabled {
    opacity: .45;
    cursor: not-allowed;
}

.btn-spin {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(200, 155, 60, .2);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin .7s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg)
    }
}

/* EMPTY */
.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: .75rem;
}

.empty-icon {
    font-size: 3rem;
    opacity: .3;
}

.empty-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--tm);
}

.empty-sub {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .82rem;
    letter-spacing: .06em;
    color: var(--td);
    max-width: 360px;
}

.error-banner {
    background: rgba(248, 113, 113, .1);
    border: 1px solid rgba(248, 113, 113, .25);
    border-radius: 10px;
    padding: .75rem 1.25rem;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .85rem;
    color: var(--loss);
    display: flex;
    align-items: center;
    gap: .5rem;
}

/* BUILD META BAR */
.build-meta-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .5rem 0;
}

.build-champ-info {
    display: flex;
    align-items: center;
    gap: .85rem;
}

.build-champ-icon {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    border: 2px solid rgba(200, 155, 60, .3);
    object-fit: cover;
}

.build-champ-name {
    font-family: 'Rajdhani', sans-serif;
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--tb);
    display: block;
    line-height: 1;
}

.build-role-tag {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .72rem;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--accent);
    background: var(--as);
    border: 1px solid rgba(200, 155, 60, .25);
    padding: .15rem .55rem;
    border-radius: 100px;
    margin-top: .25rem;
    display: inline-block;
}

.build-winrate {
    text-align: right;
}

.wr-num {
    font-family: 'Rajdhani', sans-serif;
    font-size: 2rem;
    font-weight: 700;
    display: block;
    line-height: 1;
}

.wr-lbl {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .68rem;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--td);
}

.wr-pos {
    color: var(--win);
}

.wr-neg {
    color: var(--loss);
}

/* BUILD GRID */
.build-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.build-section {
    padding: 1.25rem 1.5rem;
    border-radius: 20px;
}

.skel-section {
    min-height: 140px;
}

.section-header {
    margin-bottom: 1rem;
}

.section-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .75rem;
    letter-spacing: .16em;
    text-transform: uppercase;
    color: var(--accent);
    display: block;
}

.section-sub {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .65rem;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--td);
    margin-top: 2px;
    display: block;
}

/* ITEMS */
.item-group {
    margin-bottom: 1rem;
}

.item-group:last-child {
    margin-bottom: 0;
}

.item-group-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .65rem;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--td);
    display: block;
    margin-bottom: .5rem;
}

.items-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.item-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    position: relative;
}

.item-slot.optional {
    opacity: .7;
}

.item-img {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    border: 1px solid rgba(200, 155, 60, .25);
    object-fit: cover;
    background: rgba(255, 255, 255, .04);
    transition: transform .15s, border-color .15s;
}

.item-img:hover {
    transform: scale(1.1);
    border-color: rgba(200, 155, 60, .6);
}

.item-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .58rem;
    letter-spacing: .03em;
    color: var(--td);
    text-align: center;
    max-width: 52px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.item-order {
    position: absolute;
    top: -6px;
    left: -6px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--accent);
    color: #080c1a;
    font-family: 'Rajdhani', sans-serif;
    font-size: .6rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
}

/* RUNAS */
.runes-layout {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.rune-tree {
    display: flex;
    flex-direction: column;
    gap: .5rem;
    flex: 1;
    min-width: 120px;
}

.rune-tree.secondary {
    opacity: .85;
}

.rune-tree-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .65rem;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--td);
}

.rune-slot {
    display: flex;
    align-items: center;
    gap: .5rem;
}

.rune-slot.keystone {
    margin-bottom: .25rem;
}

.rune-img {
    width: 36px;
    height: 36px;
    object-fit: contain;
    border-radius: 50%;
    background: rgba(255, 255, 255, .04);
    border: 1px solid rgba(255, 255, 255, .08);
    flex-shrink: 0;
}

.rune-img.keystone-img {
    width: 44px;
    height: 44px;
    border-color: rgba(200, 155, 60, .3);
}

.rune-slot.minor .rune-img {
    width: 28px;
    height: 28px;
}

.rune-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .72rem;
    color: var(--tm);
}

.runes-minor-list {
    display: flex;
    flex-direction: column;
    gap: .4rem;
}

.shards-row {
    margin-top: 1rem;
}

.shards-list {
    display: flex;
    gap: .4rem;
    flex-wrap: wrap;
    margin-top: .4rem;
}

.shard-pill {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .68rem;
    letter-spacing: .05em;
    color: var(--accent);
    background: var(--as);
    border: 1px solid rgba(200, 155, 60, .2);
    padding: .18rem .55rem;
    border-radius: 100px;
}

/* SPELLS */
.spells-row {
    display: flex;
    gap: 1rem;
}

.spell-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.spell-img {
    width: 52px;
    height: 52px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, .12);
    object-fit: cover;
    background: rgba(255, 255, 255, .04);
}

.spell-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .65rem;
    letter-spacing: .04em;
    color: var(--td);
    text-align: center;
}

/* SKILL ORDER */
.skills-priority {
    display: flex;
    align-items: center;
    gap: .3rem;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
}

.skill-badge {
    display: flex;
    align-items: center;
    gap: .3rem;
}

.skill-key {
    width: 34px;
    height: 34px;
    border-radius: 7px;
    background: rgba(200, 155, 60, .12);
    border: 1px solid rgba(200, 155, 60, .3);
    color: var(--accent);
    font-family: 'Rajdhani', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
}

.skill-arrow {
    color: var(--td);
    font-size: 1.1rem;
}

.skill-level-grid {
    overflow-x: auto;
}

.skill-level-header {
    display: flex;
    align-items: center;
    gap: 2px;
    margin-bottom: 3px;
}

.slh-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .6rem;
    letter-spacing: .06em;
    color: var(--td);
    width: 18px;
    flex-shrink: 0;
}

.slh-num {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: .6rem;
    color: var(--td);
    width: 22px;
    text-align: center;
    flex-shrink: 0;
}

.skill-level-row {
    display: flex;
    align-items: center;
    gap: 2px;
    margin-bottom: 2px;
}

.slr-key {
    font-family: 'Rajdhani', sans-serif;
    font-size: .78rem;
    font-weight: 700;
    color: var(--tm);
    width: 18px;
    flex-shrink: 0;
}

.slr-cell {
    width: 22px;
    height: 22px;
    border-radius: 4px;
    background: rgba(255, 255, 255, .04);
    border: 1px solid rgba(255, 255, 255, .06);
    flex-shrink: 0;
    transition: background .1s;
}

.slr-cell.active {
    background: rgba(200, 155, 60, .35);
    border-color: rgba(200, 155, 60, .5);
}

.slr-cell.ultimate {
    background: rgba(148, 103, 189, .45);
    border-color: rgba(148, 103, 189, .6);
}

/* TIPS */
.tips-card {
    padding: 1.25rem 1.5rem;
    border-radius: 20px;
}

.tips-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: .6rem;
    margin-top: .5rem;
}

.tip-item {
    font-family: 'Barlow', sans-serif;
    font-size: .88rem;
    color: var(--tm);
    padding-left: 1.1rem;
    position: relative;
    line-height: 1.5;
}

.tip-item::before {
    content: '›';
    position: absolute;
    left: 0;
    color: var(--accent);
    font-size: 1rem;
}

@media (max-width: 900px) {
    .build-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 600px) {
    .scroll-root {
        padding: 1.25rem .75rem 0;
    }

    .search-row {
        flex-direction: column;
    }

    .role-filters {
        width: 100%;
    }

    .generate-btn {
        width: 100%;
        justify-content: center;
    }
}
</style>