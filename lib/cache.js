const cache = new Map()

export const setCache = (key, value) => {
  logger.debug('CACHE', `Set: ${key}`)
  cache.set(key, value)
}

export const getCache = (key) => {
  const hit = cache.has(key)
  logger.debug('CACHE', `${hit ? 'Hit' : 'Miss'}: ${key}`)
  return cache.get(key)
}

export default cache