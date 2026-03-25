// Cache en memoria simple — dura mientras la sesión esté abierta
const store = new Map()

export function cacheGet(key) {
  const entry = store.get(key)
  if (!entry) return null
  // Expirar después de 3 minutos (la partida en vivo puede cambiar)
  if (Date.now() - entry.ts > 3 * 60 * 1000) {
    store.delete(key)
    return null
  }
  return entry.data
}

export function cacheSet(key, data) {
  store.set(key, { data, ts: Date.now() })
}

export function cacheClear() {
  store.clear()
}