import { ref, watch } from 'vue'

const recentPlayers = ref(JSON.parse(localStorage.getItem('lol-recent') || '[]'))

watch(recentPlayers, (val) => {
  localStorage.setItem('lol-recent', JSON.stringify(val))
}, { deep: true })

export function useSidebar() {
  function addRecent(gameName, tagLine) {
    const filtered = recentPlayers.value.filter(
      p => !(p.gameName.toLowerCase() === gameName.toLowerCase() && p.tagLine.toLowerCase() === tagLine.toLowerCase())
    )
    recentPlayers.value = [{ gameName, tagLine, ts: Date.now() }, ...filtered].slice(0, 8)
  }

  function removeRecent(gameName, tagLine) {
    recentPlayers.value = recentPlayers.value.filter(
      p => !(p.gameName === gameName && p.tagLine === tagLine)
    )
  }

  return { recentPlayers, addRecent, removeRecent }
}