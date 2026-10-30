export function getActivityDateKey(date) {
  if (!date) return ''
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date
  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return ''
  const year = parsedDate.getFullYear()
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
  const day = String(parsedDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getActivityHistory(user) {
  const savedActivities = Array.isArray(user.activityHistory) ? user.activityHistory : []
  const recordedRouteIds = new Set(savedActivities.map((activity) => activity.routeSessionId).filter(Boolean))
  const legacyRoutes = (user.routeSessions ?? [])
    .filter((route) => !recordedRouteIds.has(route.id))
    .map((route) => ({
      id: `route-${route.id}`,
      routeSessionId: route.id,
      type: route.sport,
      date: getActivityDateKey(route.date),
      duration: Number(route.duration) || 0,
      distance: Number(route.distance) || 0,
      place: route.area || 'Outdoor-Route',
      friendIds: [],
      completedChallenges: [],
      xpEarned: 50 + Math.round((Number(route.distance) || 0) * 10),
    }))

  return [...savedActivities, ...legacyRoutes]
    .filter((activity) => getActivityDateKey(activity.date))
    .map((activity) => ({
      ...activity,
      date: getActivityDateKey(activity.date),
      friendIds: Array.isArray(activity.friendIds) ? activity.friendIds : [],
      completedChallenges: Array.isArray(activity.completedChallenges) ? activity.completedChallenges : [],
    }))
    .sort((a, b) => b.date.localeCompare(a.date) || String(b.id).localeCompare(String(a.id)))
}

export function getMonthCalendarDays(monthDate) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const firstCell = new Date(firstDay.getFullYear(), firstDay.getMonth(), 1 - startOffset)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstCell.getFullYear(), firstCell.getMonth(), firstCell.getDate() + index)
    return {
      date,
      dateKey: getActivityDateKey(date),
      inMonth: date.getMonth() === monthDate.getMonth(),
    }
  })
}

export function formatActivityDate(date, options = { dateStyle: 'long' }) {
  const dateKey = getActivityDateKey(date)
  return dateKey
    ? new Intl.DateTimeFormat('de-DE', options).format(new Date(`${dateKey}T12:00:00`))
    : 'Datum unbekannt'
}
