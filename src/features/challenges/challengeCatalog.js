import { getActivityStreakDays } from '../progression/activityStreak.js'

function addDays(date, days) {
  const result = new Date(`${date}T00:00:00`)
  result.setDate(result.getDate() + days)
  return getDateKey(result)
}

function getDateKey(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

function getChallengeProgress(user, campaign) {
  const activities = (user.partnerChallengeActivities ?? [])
    .filter((entry) => entry.campaignId === campaign.id)
    .sort((a, b) => a.date.localeCompare(b.date))
  if (!activities.length) return 0

  const completionDeadline = addDays(activities[0].date, campaign.completionWindowDays - 1)
  const lastEligibleDay = completionDeadline < campaign.expiresAt ? completionDeadline : campaign.expiresAt
  const eligibleActivities = activities.filter((entry) => entry.date <= lastEligibleDay)

  return campaign.goalType === 'distance'
    ? eligibleActivities.reduce((total, entry) => total + Number(entry.distance || 0), 0)
    : eligibleActivities.length
}

export function getChallengeRarity(reward = 0) {
  if (reward >= 325) return 'platinum'
  if (reward >= 250) return 'gold'
  if (reward >= 150) return 'silver'
  return 'bronze'
}

export function getChallengeCatalog(user, partnerChallenges, context) {
  const { todayISO, currentWeekKey, currentMonthKey, defaultCampaignExpiry } = context
  const routes = user.routeSessions ?? []
  const routeDistance = routes.reduce((total, route) => total + Number(route.distance || 0), 0)
  const distinctOutdoorSports = new Set(routes.map((route) => route.sport)).size
  const joinedCount = (user.joinedGroups ?? []).length + (user.joinedCommunities ?? []).length
  const builtInChallenges = [
    { id: 'first-route', title: 'Erster eigener Weg', description: 'Erfasse deine erste Outdoor-Session.', icon: '↗', category: 'Outdoor', partner: 'Pace & Pine', progress: routes.length, target: 1, unit: 'Route', unitPlural: 'Routen', reward: 80, medal: 'Route Rookie', certificate: 'Erste Schritte draußen' },
    { id: 'route-explorer', title: 'Stadt in Bewegung', description: 'Sammle fünf Lauf-, Rad- oder Wanderrouten.', icon: '⌁', category: 'Outdoor', partner: 'Loop District', progress: routes.length, target: 5, unit: 'Route', unitPlural: 'Routen', reward: 220, medal: 'Route Explorer', certificate: 'Fünf Wege entdeckt' },
    { id: 'city-collector', title: 'Kilometer sammeln', description: 'Bewege dich draußen über insgesamt 25 Kilometer.', icon: '◎', category: 'Ausdauer', partner: 'Northstar Motion', progress: routeDistance, target: 25, unit: 'km', unitPlural: 'km', reward: 350, medal: 'City Collector', certificate: '25 Kilometer unterwegs' },
    { id: 'multi-sport', title: 'Multisport-Moment', description: 'Probiere drei verschiedene Outdoor-Sportarten aus.', icon: '✳', category: 'Vielfalt', partner: 'Morrow Athletics', progress: distinctOutdoorSports, target: 3, unit: 'Sportart', unitPlural: 'Sportarten', reward: 280, medal: 'Allrounder', certificate: 'Drei Sportarten erlebt' },
    { id: 'match-five', title: 'Teamplayer', description: 'Schließe fünf Matches ab.', icon: '⚽', category: 'Community', partner: 'Goodside Courts', progress: user.matchCount ?? 0, target: 5, unit: 'Match', unitPlural: 'Matches', reward: 250, medal: 'Teamplayer', certificate: 'Fünf Matches gespielt' },
    { id: 'community-three', title: 'Community-Herz', description: 'Werde Teil von drei Gruppen oder Communities.', icon: '♡', category: 'Community', partner: 'Common Ground Club', progress: joinedCount, target: 3, unit: 'Mitgliedschaft', unitPlural: 'Mitgliedschaften', reward: 180, medal: 'Community Hero', certificate: 'Gemeinsam stärker' },
    { id: `weekly-five-${currentWeekKey}`, title: 'Woche in Bewegung', description: 'Erfasse fünf Aktivitäten in deiner Wochen-Challenge.', icon: '⚡', category: 'Wochenziele', partner: 'Daybreak Studio', progress: user.challengeProgress ?? 0, target: 5, unit: 'Aktivität', unitPlural: 'Aktivitäten', reward: 200, medal: 'Weekly Mover', certificate: 'Woche in Bewegung' },
    { id: `monthly-twelve-${currentMonthKey}`, title: 'Monat voller Moves', description: 'Erreiche zwölf Sessions in deiner Monats-Challenge.', icon: '☼', category: 'Monatsziele', partner: 'Open Mile Collective', progress: user.monthProgress ?? 0, target: 12, unit: 'Session', unitPlural: 'Sessions', reward: 300, medal: 'Monthly Legend', certificate: 'Monat voller Moves' },
    { id: 'streak-seven', title: 'Sieben Tage Flow', description: 'Halte deine Aktivitätsserie sieben Tage am Stück.', icon: '🔥', category: 'Dranbleiben', partner: 'Kindred Move', progress: getActivityStreakDays(user, new Date(`${todayISO}T12:00:00`)), target: 7, unit: 'Tag', unitPlural: 'Tage', reward: 240, medal: 'Streak Keeper', certificate: 'Sieben Tage drangeblieben' },
  ]
  const activePartnerChallenges = partnerChallenges
    .filter((campaign) => campaign.startAt <= todayISO && campaign.expiresAt >= todayISO)
    .map((campaign) => {
      const progress = getChallengeProgress(user, campaign)
      const activityLabel = {
        'Alle Trainings': 'Trainingseinheiten',
        Laufen: 'Läufe',
        Radfahren: 'Radfahrten',
        Wandern: 'Wanderungen',
        Workout: 'Workouts',
        Match: 'Matches',
      }[campaign.activity] ?? 'Aktivitäten'

      return {
        id: campaign.id,
        title: campaign.title,
        description: campaign.goalType === 'distance'
          ? `Sammle ${campaign.target} km mit ${activityLabel.toLowerCase()} und sichere dir den Partner-Vorteil.`
          : `Schließe ${campaign.target} ${activityLabel} ab und sichere dir den Partner-Vorteil.`,
        icon: '％',
        category: 'Partner-Challenge',
        partner: campaign.partner,
        partnerEmail: campaign.partnerEmail,
        progress,
        target: campaign.target,
        reward: campaign.reward,
        medal: 'Partner-Vorteil',
        certificate: `Challenge bei ${campaign.partner}`,
        discount: campaign.discount,
        goalType: campaign.goalType,
        website: campaign.website,
        startAt: campaign.startAt,
        expiresAt: campaign.expiresAt,
        completionWindowDays: campaign.completionWindowDays,
        unit: campaign.goalType === 'distance' ? 'km' : 'Aktivität',
        unitPlural: campaign.goalType === 'distance' ? 'km' : 'Aktivitäten',
        couponCode: user.medals?.find((medal) => medal.id === campaign.id)?.couponCode,
        couponCodePrefix: campaign.couponCodePrefix,
      }
    })

  return [...builtInChallenges, ...activePartnerChallenges].map((challenge) => ({
    ...challenge,
    startAt: challenge.startAt ?? todayISO,
    expiresAt: challenge.expiresAt ?? (challenge.id.startsWith('weekly-five')
      ? addDays(todayISO, 6 - ((new Date().getDay() + 6) % 7))
      : challenge.id.startsWith('monthly-twelve')
        ? getDateKey(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0))
        : defaultCampaignExpiry),
    completionWindowDays: challenge.completionWindowDays ?? 30,
    rarity: getChallengeRarity(challenge.reward),
    progress: Math.min(challenge.progress, challenge.target),
    completed: challenge.progress >= challenge.target,
  }))
}
