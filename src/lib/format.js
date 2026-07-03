import { TN_PLACES } from '../data/mockData'

// Keeps city names consistent (e.g. "coimbatore " and "Coimbatore" match)
// since From/To are free text and used as literal route-matching keys.
export function normalizeCity(value) {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function levenshtein(a, b) {
  const rows = a.length + 1
  const cols = b.length + 1
  const dist = Array.from({ length: rows }, (_, i) => [i, ...Array(cols - 1).fill(0)])
  for (let j = 1; j < cols; j++) dist[0][j] = j

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dist[i][j] = Math.min(
        dist[i - 1][j] + 1, // deletion
        dist[i][j - 1] + 1, // insertion
        dist[i - 1][j - 1] + cost // substitution
      )
    }
  }
  return dist[rows - 1][cols - 1]
}

// Corrects likely misspellings (e.g. "Coimbatoor" -> "Coimbatore") by
// snapping to the closest known Tamil Nadu place name, but only within a
// tolerance proportional to word length — so genuinely new places the user
// types (not in TN_PLACES) are left as their normalized input, not forced
// onto an unrelated match.
export function correctCityName(value, knownPlaces = TN_PLACES) {
  const normalized = normalizeCity(value)
  if (!normalized) return normalized
  if (knownPlaces.includes(normalized)) return normalized

  let bestMatch = null
  let bestDistance = Infinity
  for (const place of knownPlaces) {
    const distance = levenshtein(normalized.toLowerCase(), place.toLowerCase())
    if (distance < bestDistance) {
      bestDistance = distance
      bestMatch = place
    }
  }

  const tolerance = Math.max(1, Math.floor(normalized.length * 0.3))
  return bestMatch && bestDistance <= tolerance ? bestMatch : normalized
}
