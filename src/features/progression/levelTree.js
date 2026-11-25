import { getLevelInfo } from './leveling.js'

export const levelTreeBranches = [
  {
    id: 'endurance',
    direction: 'north',
    directionLabel: 'Norden',
    title: 'Ausdauer',
    description: 'Werde mit jedem Training ausdauernder.',
    icon: '↗',
    position: { x: 500, y: 285 },
    nodes: [
      { id: 'endurance-1', shortTitle: 'Training', title: 'Trainingsfunke', description: 'Deine Workouts bringen dauerhaft 10 % mehr XP.', level: 2, x: 410, y: 185, effect: { source: 'activity', bonus: 0.1 } },
      { id: 'endurance-2', shortTitle: 'Flow', title: 'Trainingsflow', description: 'Noch einmal 10 % mehr XP für abgeschlossene Workouts.', level: 4, requires: 'endurance-1', x: 350, y: 105, effect: { source: 'activity', bonus: 0.1 } },
      { id: 'endurance-3', shortTitle: 'Ausdauer', title: 'Ausdauer-Profi', description: 'Verdiene weitere 10 % XP mit jedem Workout.', level: 6, requires: 'endurance-2', x: 270, y: 60, effect: { source: 'activity', bonus: 0.1 } },
      { id: 'endurance-7', shortTitle: 'Kraft', title: 'Kraftreserve', description: 'Deine Workouts bringen weitere 10 % XP.', level: 6, requires: 'endurance-2', x: 430, y: 60, effect: { source: 'activity', bonus: 0.1 } },
      { id: 'endurance-4', shortTitle: 'Routen', title: 'Kilometerjäger:in', description: 'Deine Outdoor-Routen bringen dir 10 % mehr XP.', level: 2, x: 590, y: 185, effect: { source: 'route', bonus: 0.1 } },
      { id: 'endurance-5', shortTitle: 'Wegwissen', title: 'Wegwissen', description: 'Sammle weitere 10 % XP für deine Outdoor-Routen.', level: 4, requires: 'endurance-4', x: 650, y: 105, effect: { source: 'route', bonus: 0.1 } },
      { id: 'endurance-6', shortTitle: 'Allround', title: 'Unaufhaltsam', description: 'Alle deine Aktivitäten bringen dauerhaft 5 % mehr XP.', level: 6, requires: 'endurance-5', x: 570, y: 60, effect: { source: 'all', bonus: 0.05 } },
      { id: 'endurance-8', shortTitle: 'Entdecker', title: 'Weitblick', description: 'Deine Outdoor-Routen bringen weitere 10 % XP.', level: 6, requires: 'endurance-5', x: 730, y: 60, effect: { source: 'route', bonus: 0.1 } },
    ],
  },
  {
    id: 'community',
    direction: 'south',
    directionLabel: 'Süden',
    title: 'Teamgeist',
    description: 'Wachse gemeinsam mit deiner Sport-Crew.',
    icon: '♡',
    position: { x: 500, y: 715 },
    nodes: [
      { id: 'community-1', shortTitle: 'Matches', title: 'Fair-Play-Funken', description: 'Matches bringen dir dauerhaft 10 % mehr XP.', level: 2, x: 410, y: 815, effect: { source: 'match', bonus: 0.1 } },
      { id: 'community-2', shortTitle: 'Teamflow', title: 'Team-Momentum', description: 'Sammle weitere 10 % XP für abgeschlossene Matches.', level: 4, requires: 'community-1', x: 350, y: 895, effect: { source: 'match', bonus: 0.1 } },
      { id: 'community-3', shortTitle: 'Goodie-Los', title: 'Team-Gewinnchance', description: 'Schalte ein virtuelles Demo-Los für ein Partner-Goodie frei.', level: 6, requires: 'community-2', x: 270, y: 940, effect: { raffleEntries: 1 } },
      { id: 'community-7', shortTitle: 'Crew-XP', title: 'Gemeinsam stärker', description: 'Eingelöste Challenges bringen dir 10 % mehr XP.', level: 6, requires: 'community-2', x: 430, y: 940, effect: { source: 'challenge', bonus: 0.1 } },
      { id: 'community-4', shortTitle: 'Challenges', title: 'Crew-Champion', description: 'Eingelöste Challenges bringen dir 10 % mehr XP.', level: 2, x: 590, y: 815, effect: { source: 'challenge', bonus: 0.1 } },
      { id: 'community-5', shortTitle: 'Goodie-Los', title: 'Crew-Gewinnchance', description: 'Schalte ein virtuelles Demo-Los für ein Partner-Goodie frei.', level: 4, requires: 'community-4', x: 650, y: 895, effect: { raffleEntries: 1 } },
      { id: 'community-6', shortTitle: 'Legende', title: 'Legendenstatus', description: 'Matches bringen weitere 15 % XP und ein Demo-Los.', level: 6, requires: 'community-5', x: 570, y: 940, effect: { source: 'match', bonus: 0.15, raffleEntries: 1 } },
      { id: 'community-8', shortTitle: 'Team-Los', title: 'Crew-Glück', description: 'Schalte ein weiteres virtuelles Demo-Los für ein Partner-Goodie frei.', level: 6, requires: 'community-5', x: 730, y: 940, effect: { raffleEntries: 1 } },
    ],
  },
  {
    id: 'discovery',
    direction: 'east',
    directionLabel: 'Osten',
    title: 'Entdecken',
    description: 'Finde neue Wege und sammle Bonus-XP.',
    icon: '⌁',
    position: { x: 715, y: 500 },
    nodes: [
      { id: 'discovery-1', shortTitle: 'Routen', title: 'Routen-Scout', description: 'Outdoor-Routen bringen dir dauerhaft 10 % mehr XP.', level: 2, x: 815, y: 410, effect: { source: 'route', bonus: 0.1 } },
      { id: 'discovery-2', shortTitle: 'Wege-Wissen', title: 'Wege-Wissen', description: 'Erhalte weitere 10 % XP für deine Outdoor-Routen.', level: 4, requires: 'discovery-1', x: 895, y: 350, effect: { source: 'route', bonus: 0.1 } },
      { id: 'discovery-3', shortTitle: 'Horizont', title: 'Horizont-Erweiterung', description: 'Deine Routen bringen weitere 15 % XP.', level: 6, requires: 'discovery-2', x: 940, y: 270, effect: { source: 'route', bonus: 0.15 } },
      { id: 'discovery-7', shortTitle: 'Pfadfinder', title: 'Pfadfinder', description: 'Outdoor-Routen bringen dir weitere 10 % XP.', level: 6, requires: 'discovery-2', x: 940, y: 430, effect: { source: 'route', bonus: 0.1 } },
      { id: 'discovery-4', shortTitle: 'Entdecken', title: 'Partner-Entdecker:in', description: 'Schalte ein virtuelles Demo-Los für ein Partner-Goodie frei.', level: 2, x: 815, y: 590, effect: { raffleEntries: 1 } },
      { id: 'discovery-5', shortTitle: 'Kompass', title: 'Challenge-Kompass', description: 'Eingelöste Challenges bringen dir 10 % mehr XP.', level: 4, requires: 'discovery-4', x: 895, y: 650, effect: { source: 'challenge', bonus: 0.1 } },
      { id: 'discovery-6', shortTitle: 'Goodie-Los', title: 'Entdecker-Los', description: 'Schalte ein weiteres virtuelles Demo-Los für ein Partner-Goodie frei.', level: 6, requires: 'discovery-5', x: 940, y: 570, effect: { raffleEntries: 1 } },
      { id: 'discovery-8', shortTitle: 'Challenge-XP', title: 'Entdecker-Challenge', description: 'Eingelöste Challenges bringen dir weitere 10 % XP.', level: 6, requires: 'discovery-5', x: 940, y: 730, effect: { source: 'challenge', bonus: 0.1 } },
    ],
  },
  {
    id: 'consistency',
    direction: 'west',
    directionLabel: 'Westen',
    title: 'Dranbleiben',
    description: 'Mach aus kleinen Moves starke Gewohnheiten.',
    icon: '✦',
    position: { x: 285, y: 500 },
    nodes: [
      { id: 'consistency-1', shortTitle: 'Check-in', title: 'Erster Funke', description: 'Dein täglicher Check-in bringt dir 10 % mehr XP.', level: 2, x: 185, y: 410, effect: { source: 'checkin', bonus: 0.1 } },
      { id: 'consistency-2', shortTitle: 'Streak', title: 'Streak-Keeper', description: 'Deine Check-ins bringen weitere 15 % XP.', level: 4, requires: 'consistency-1', x: 105, y: 350, effect: { source: 'checkin', bonus: 0.15 } },
      { id: 'consistency-3', shortTitle: 'Flow', title: 'Flow gefunden', description: 'Alle deine Aktivitäten bringen dauerhaft 5 % mehr XP.', level: 6, requires: 'consistency-2', x: 60, y: 270, effect: { source: 'all', bonus: 0.05 } },
      { id: 'consistency-7', shortTitle: 'Serie', title: 'Serienprofi', description: 'Deine Check-ins bringen weitere 10 % XP.', level: 6, requires: 'consistency-2', x: 60, y: 430, effect: { source: 'checkin', bonus: 0.1 } },
      { id: 'consistency-4', shortTitle: 'Workout', title: 'Gute Gewohnheit', description: 'Workouts bringen dir zusätzlich 10 % mehr XP.', level: 2, x: 185, y: 590, effect: { source: 'activity', bonus: 0.1 } },
      { id: 'consistency-5', shortTitle: 'Challenges', title: 'Immer in Bewegung', description: 'Jede Challenge bringt dir 10 % mehr XP.', level: 4, requires: 'consistency-4', x: 105, y: 650, effect: { source: 'challenge', bonus: 0.1 } },
      { id: 'consistency-6', shortTitle: 'Allround', title: 'Ganz in Bewegung', description: 'Alle deine Aktivitäten bringen dauerhaft 5 % mehr XP.', level: 6, requires: 'consistency-5', x: 60, y: 570, effect: { source: 'all', bonus: 0.05 } },
      { id: 'consistency-8', shortTitle: 'Routinen', title: 'Routinenprofi', description: 'Deine Challenges bringen weitere 10 % XP.', level: 6, requires: 'consistency-5', x: 60, y: 730, effect: { source: 'challenge', bonus: 0.1 } },
    ],
  },
]

const allNodes = levelTreeBranches.flatMap((branch) => branch.nodes)

export function getLevelTreeState(totalXp, unlockedNodeIds = []) {
  const { level } = getLevelInfo(totalXp)
  const requestedIds = new Set(Array.isArray(unlockedNodeIds) ? unlockedNodeIds : [])
  const unlockedIds = new Set()

  for (const node of allNodes) {
    if (
      requestedIds.has(node.id)
      && node.level <= level
      && (!node.requires || unlockedIds.has(node.requires))
    ) {
      unlockedIds.add(node.id)
    }
  }

  const earnedPoints = Math.max(0, level - 1)
  const spentPoints = unlockedIds.size
  const availablePoints = Math.max(0, earnedPoints - spentPoints)

  return {
    level,
    earnedPoints,
    spentPoints,
    availablePoints,
    raffleEntries: allNodes
      .filter((node) => unlockedIds.has(node.id))
      .reduce((total, node) => total + (node.effect.raffleEntries ?? 0), 0),
    branches: levelTreeBranches.map((branch) => ({
      ...branch,
      nodes: branch.nodes.map((node) => ({
        ...node,
        direction: branch.direction,
        directionIcon: branch.icon,
        unlocked: unlockedIds.has(node.id),
        available: !unlockedIds.has(node.id)
          && availablePoints > 0
          && node.level <= level
          && (!node.requires || unlockedIds.has(node.requires)),
        lockedByLevel: node.level > level,
        prerequisiteTitle: node.requires
          ? allNodes.find((item) => item.id === node.requires)?.title
          : undefined,
      })),
    })),
    unlockedIds,
  }
}

export function getLevelTreeXpReward(user, amount, source) {
  const unlockedIds = getLevelTreeState(user.xp, user.levelTreeNodes).unlockedIds
  const bonus = allNodes.reduce((total, node) => (
    unlockedIds.has(node.id) && (node.effect.source === source || node.effect.source === 'all')
      ? total + node.effect.bonus
      : total
  ), 0)
  return Math.round(amount * (1 + bonus))
}
