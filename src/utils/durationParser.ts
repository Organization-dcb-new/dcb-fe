/**
 * Parses an Indonesian human-readable duration string (from API) into total seconds.
 * Examples:
 *   "1 menit 30 detik" → 90
 *   "10 detik" → 10
 *   "2 menit" → 120
 *   "45 detik" → 45
 *   "1 jam 2 menit 30 detik" → 3750
 */
export function parseDurationToSeconds(durationStr: string): number {
  if (!durationStr || typeof durationStr !== 'string') return 0

  let totalSeconds = 0
  const lower = durationStr.toLowerCase().trim()

  // Match hours: "X jam"
  const jamMatch = lower.match(/(\d+)\s*jam/)
  if (jamMatch) {
    totalSeconds += parseInt(jamMatch[1], 10) * 3600
  }

  // Match minutes: "X menit"
  const menitMatch = lower.match(/(\d+)\s*menit/)
  if (menitMatch) {
    totalSeconds += parseInt(menitMatch[1], 10) * 60
  }

  // Match seconds: "X detik"
  const detikMatch = lower.match(/(\d+)\s*detik/)
  if (detikMatch) {
    totalSeconds += parseInt(detikMatch[1], 10)
  }

  return totalSeconds
}

/**
 * Formats seconds back into a human-readable duration string.
 * Examples:
 *   90 → "1m 30s"
 *   10 → "10s"
 *   120 → "2m"
 *   3750 → "1h 2m 30s"
 */
export function formatSecondsToDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0s'

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const parts: string[] = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (seconds > 0) parts.push(`${seconds}s`)

  return parts.join(' ') || '0s'
}
