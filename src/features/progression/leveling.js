export function getLevelInfo(totalXp) {
  const safeXp = Math.max(0, Math.floor(totalXp))
  const xpForLevel = (level) => Math.ceil((1000 * (1.25 ** (level - 1))) / 100) * 100
  let level = 1
  let remainingXp = safeXp
  let nextLevelXp = xpForLevel(level)

  while (remainingXp >= nextLevelXp) {
    remainingXp -= nextLevelXp
    level += 1
    nextLevelXp = xpForLevel(level)
  }

  return {
    level,
    currentXp: remainingXp,
    nextLevelXp,
    nextLevelTotalXp: safeXp + nextLevelXp - remainingXp,
  }
}
