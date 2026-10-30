import { getActivityHistory } from '../activity-history/activityHistory.js'

function formatDateKey(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

function shiftDateKey(dateKey, days) {
  const date = new Date(`${dateKey}T12:00:00`)
  date.setDate(date.getDate() + days)
  return formatDateKey(date)
}

function getWeekStartKey(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`)
  const daysSinceMonday = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - daysSinceMonday)
  return formatDateKey(date)
}

function getActiveDates(user) {
  return new Set(getActivityHistory(user).map((activity) => activity.date))
}

export function getActivityStreakDays(user, referenceDate = new Date()) {
  const activeDates = getActiveDates(user)
  const todayKey = formatDateKey(referenceDate)
  const anchorKey = activeDates.has(todayKey) ? todayKey : shiftDateKey(todayKey, -1)
  if (!activeDates.has(anchorKey)) return 0

  let streak = 0
  let dateKey = anchorKey
  while (activeDates.has(dateKey)) {
    streak += 1
    dateKey = shiftDateKey(dateKey, -1)
  }
  return streak
}

export function getActivityStreakWeeks(user, referenceDate = new Date()) {
  const activeWeeks = new Set([...getActiveDates(user)].map(getWeekStartKey))
  const currentWeek = getWeekStartKey(formatDateKey(referenceDate))
  const anchorWeek = activeWeeks.has(currentWeek) ? currentWeek : shiftDateKey(currentWeek, -7)
  if (!activeWeeks.has(anchorWeek)) return 0

  let streak = 0
  let week = anchorWeek
  while (activeWeeks.has(week)) {
    streak += 1
    week = shiftDateKey(week, -7)
  }
  return streak
}
