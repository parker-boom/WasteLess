const dayInMs = 24 * 60 * 60 * 1000

export function daysUntil(isoDate: string, now = new Date()): number {
  const target = new Date(isoDate)
  const utcNow = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  )
  const utcTarget = Date.UTC(
    target.getUTCFullYear(),
    target.getUTCMonth(),
    target.getUTCDate(),
  )

  return Math.ceil((utcTarget - utcNow) / dayInMs)
}

export function expiryLabel(isoDate: string): string {
  const diff = daysUntil(isoDate)

  if (diff <= 0) {
    return 'Today'
  }
  if (diff === 1) {
    return 'Tomorrow'
  }
  if (diff < 7) {
    return `${diff} Days`
  }

  const weeks = Math.ceil(diff / 7)
  return weeks === 1 ? '1 Week' : `${weeks} Weeks`
}

export function relativeLabelFromDays(days: number): string {
  if (days <= 0) {
    return 'today'
  }
  if (days === 1) {
    return '1 day from now'
  }
  return `${days} days from now`
}

export function toMeridiem(time24: string): string {
  const [rawHours, rawMinutes] = time24.split(':')
  const hours = Number(rawHours)
  const minutes = Number(rawMinutes)

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time24
  }

  const suffix = hours >= 12 ? 'PM' : 'AM'
  const displayHour = ((hours + 11) % 12) + 1
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${suffix}`
}

export function fromMeridiem(value: string): string {
  const normalized = value.trim().toUpperCase()
  const match = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/)
  if (!match) {
    return '10:00'
  }

  const hour = Number(match[1])
  const minute = Number(match[2])
  const meridiem = match[3]

  let converted = hour % 12
  if (meridiem === 'PM') {
    converted += 12
  }

  return `${converted.toString().padStart(2, '0')}:${minute
    .toString()
    .padStart(2, '0')}`
}

export function addDaysIso(days: number): string {
  const now = new Date()
  now.setDate(now.getDate() + days)
  return now.toISOString()
}
