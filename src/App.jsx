import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { FluentProvider, Button, Avatar, ProgressBar, webDarkTheme } from '@fluentui/react-components'
import {
  AddRegular, ArrowRightRegular, CalendarLtrRegular, CheckmarkCircleRegular,
  ChevronDownRegular, ChevronRightRegular, ClockRegular, CompassNorthwestRegular,
  CrownRegular, FlashRegular, GroupRegular, HomeRegular, LocationRegular, PeopleCommunityRegular,
  SearchRegular, ShieldCheckmarkRegular, SparkleRegular, TrophyRegular, PersonRegular,
  SettingsRegular, SignOutRegular, DeleteRegular, PersonRunningRegular,
  VehicleBicycleRegular, SportBasketballRegular, SportSoccerRegular, SportRegular,
  DumbbellRegular,
} from '@fluentui/react-icons'
import { getChallengeCatalog, getChallengeRarity } from './features/challenges/challengeCatalog.js'
import ActivityHistoryView from './features/activity-history/ActivityHistoryView.jsx'
import { getActivityHistory } from './features/activity-history/activityHistory.js'
import { getActivityStreakWeeks } from './features/progression/activityStreak.js'
import { getLevelInfo } from './features/progression/leveling.js'
import './App.css'

const demoUsers = [
  { id: 'alex', name: 'Alex Morgan', gender: 'Mann', role: 'user', initials: 'AM', city: 'Berlin', xp: 14800, streakDays: 5, premium: false, settings: { notifications: true, profilePublic: true, weeklyDigest: false }, joinedGroups: [], joinedCommunities: [1], bookings: [], activityLogged: 0, matchCount: 0, challengeProgress: 3, monthProgress: 4, lastCheckIn: '', bio: 'Laufen, Fußball und neue Leute kennenlernen.' },
  { id: 'lina', name: 'Lina Becker', gender: 'Frau', role: 'user', initials: 'LB', city: 'Berlin', xp: 4875, streakDays: 3, premium: true, settings: { notifications: true, profilePublic: true, weeklyDigest: true }, joinedGroups: [2], joinedCommunities: [2], bookings: [], activityLogged: 3, matchCount: 2, challengeProgress: 2, monthProgress: 8, lastCheckIn: '', bio: 'Padel-Fan und immer offen für neue Sportarten.' },
  { id: 'admin', name: 'Robin Admin', gender: 'Admin', role: 'admin', initials: 'RA', city: 'Berlin', xp: 28600, streakDays: 14, premium: true, settings: { notifications: true, profilePublic: true, weeklyDigest: false }, joinedGroups: [], joinedCommunities: [1, 2, 3], bookings: [], activityLogged: 18, matchCount: 11, challengeProgress: 5, monthProgress: 12, lastCheckIn: '', bio: 'SportQuest Community-Team.' },
]
function getDemoDate(daysAgo) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return getLocalDate(date)
}

const demoFriends = [
  { id: 'friend-mia', name: 'Mia Chen', initials: 'MC', role: 'user', city: 'Berlin', bio: 'Läuft am liebsten früh morgens am Wasser und probiert gerne neue Strecken aus.', xp: 2840, activityLogged: 27, streakDays: 9, matchCount: 6, challengeProgress: 4, monthProgress: 9, premium: false, routeSessions: [{ sport: 'Laufen', distance: 7.4, date: getDemoDate(0), area: 'Musterufer' }, { sport: 'Radfahren', distance: 16.2, date: getDemoDate(7), area: 'Stadtpark' }], medals: [{ id: 'mia-medal-1', title: 'Ufer-Entdeckerin', category: 'Outdoor', icon: '⌁', rarity: 'silver' }, { id: 'mia-medal-2', title: 'Neun Tage Flow', category: 'Dranbleiben', icon: '✦', rarity: 'bronze' }] },
  { id: 'friend-jonas', name: 'Jonas Weber', initials: 'JW', role: 'user', city: 'Berlin', bio: 'Teamplayer auf dem Platz, am Wochenende gern mit dem Rad unterwegs.', xp: 2610, activityLogged: 34, streakDays: 4, matchCount: 12, challengeProgress: 3, monthProgress: 11, premium: true, routeSessions: [{ sport: 'Radfahren', distance: 22.8, date: getDemoDate(0), area: 'Muster-Innenstadt' }, { sport: 'Laufen', distance: 4.1, date: getDemoDate(7), area: 'Musterpark' }], medals: [{ id: 'jonas-medal-1', title: 'Teamplayer', category: 'Community', icon: '⚽', rarity: 'gold' }] },
  { id: 'friend-samira', name: 'Samira Ali', initials: 'SA', role: 'user', city: 'Berlin', bio: 'Wandern, Yoga und gemeinsam aktiv bleiben – am liebsten ohne Leistungsdruck.', xp: 1920, activityLogged: 19, streakDays: 12, matchCount: 3, challengeProgress: 5, monthProgress: 7, premium: false, routeSessions: [{ sport: 'Wandern', distance: 8.6, date: getDemoDate(0), area: 'Musterwald' }, { sport: 'Laufen', distance: 5.3, date: getDemoDate(7), area: 'Musterpark' }], medals: [{ id: 'samira-medal-1', title: 'Waldpfad-Profi', category: 'Outdoor', icon: '✳', rarity: 'bronze' }] },
]

function readLocal(key, fallback) {
  const saved = localStorage.getItem(key)
  if (!saved) return fallback
  try {
    return JSON.parse(saved)
  } catch (error) {
    console.error(`SportQuest: gespeicherte Daten für "${key}" konnten nicht gelesen werden.`, error)
    return fallback
  }
}

function getSafeWebsiteUrl(value) {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])
}

function getNextId(items) {
  return Math.max(0, ...items.map((item) => Number(item.id) || 0)) + 1
}

function getLocalDateTime() {
  const date = new Date()
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return { date: local.toISOString().slice(0, 10), time: local.toISOString().slice(11, 16) }
}

function getLocalDate(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

function getWeekKey(date) {
  const isoDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = isoDate.getUTCDay() || 7
  isoDate.setUTCDate(isoDate.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(isoDate.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((isoDate - yearStart) / 86400000 + 1) / 7)
  return `${isoDate.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

function formatMeetingTime(date, time) {
  return new Date(`${date}T${time}`).toLocaleString('de-DE', { weekday: 'short', hour: '2-digit', minute: '2-digit' })
}

const todayISO = getLocalDate(new Date())
const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
const tomorrowISO = getLocalDate(tomorrow)
const yesterday = new Date()
yesterday.setDate(yesterday.getDate() - 1)
const previousISO = getLocalDate(yesterday)
const localNow = getLocalDateTime()
const currentWeekKey = getWeekKey(new Date())
const currentMonthKey = todayISO.slice(0, 7)
const defaultCampaignExpiry = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
const challengeContext = { todayISO, currentWeekKey, currentMonthKey, defaultCampaignExpiry }
const demoSettings = { notifications: true, profilePublic: true, weeklyDigest: false }
const dailyMotivations = [
  'Du musst nicht schneller sein als gestern. Fang einfach wieder an.',
  'Jeder Schritt zählt – auch der erste, der dich nach draußen bringt.',
  'Stärke wächst nicht an den leichten Tagen, sondern wenn du dranbleibst.',
  'Bewegung ist kein Wettbewerb. Heute zählt, dass du es für dich tust.',
  'Kleine Runden werden mit der Zeit zu großen Gewohnheiten.',
  'Dein Tempo. Dein Weg. Dein nächster Schritt.',
  'Du musst nicht alles geben. Gib heute einfach dir selbst eine Chance.',
]
function getDailyMotivation(date = getLocalDate(new Date())) {
  const [year, month, day] = date.split('-').map(Number)
  const dayNumber = Math.floor(Date.UTC(year, month - 1, day) / 86400000)
  return dailyMotivations[dayNumber % dailyMotivations.length]
}
const demoRouteSessions = [
  { id: 1, sport: 'Laufen', distance: 5.2, duration: 31, date: todayISO, daysAgo: 0, area: 'Kreuzberg' },
  { id: 2, sport: 'Radfahren', distance: 12.4, duration: 38, date: previousISO, daysAgo: 1, area: 'Tempelhofer Feld' },
  { id: 3, sport: 'Wandern', distance: 3.6, duration: 52, date: previousISO, daysAgo: 1, area: 'Landwehrkanal' },
]
const initialPartnerChallenges = [
  { id: 'partner-campaign-canopy', partner: 'Canopy Stride', partnerEmail: 'partner@canopystride.example', website: 'https://canopystride.example', title: 'Vier Runden im Grünen', activity: 'Laufen', goalType: 'sessions', target: 4, discount: 15, reward: 100, couponCodePrefix: 'GREEN15', startAt: todayISO, expiresAt: defaultCampaignExpiry, completionWindowDays: 14 },
  { id: 'partner-campaign-form', partner: 'Form & Fern', partnerEmail: 'hello@formundfern.example', website: 'https://formundfern.example', title: 'Dein erster Trainingsblock', activity: 'Alle Trainings', goalType: 'sessions', target: 3, discount: 10, reward: 100, couponCodePrefix: 'MOVE10', startAt: todayISO, expiresAt: defaultCampaignExpiry, completionWindowDays: 30 },
]
const initialPartnerOrganizations = [
  { name: 'Canopy Stride', email: 'partner@canopystride.example', website: 'https://canopystride.example' },
  { name: 'Form & Fern', email: 'hello@formundfern.example', website: 'https://formundfern.example' },
]
const initialDemoUsers = demoUsers.map((profile) => ({ ...profile, lastCheckIn: previousISO, routeSessions: demoRouteSessions, challengeWeekKey: currentWeekKey, monthChallengeKey: currentMonthKey }))

const activities = [
  { id: 1, title: 'Fußball 5v5 im Käfig', sport: 'Fußball', place: 'Kreuzberg Courts', time: 'Heute, 18:30', day: 'Heute', period: 'Abend', distance: 2.4, duration: '60 Min.', level: 'Alle Level', spots: 2, price: 'Kostenlos', mark: '◎', tone: 'basket' },
  { id: 2, title: 'Pick-up Basketball', sport: 'Basketball', place: 'Kreuzberg Courts', time: 'Morgen, 17:30', day: 'Morgen', period: 'Abend', distance: 3.2, duration: '75 Min.', level: 'Mittel', spots: 3, price: 'Kostenlos', mark: '◉', tone: 'basket' },
  { id: 3, title: 'Padel After Work', sport: 'Padel', place: 'Padel Social Mitte', time: 'Heute, 19:00', day: 'Heute', period: 'Abend', distance: 3.1, duration: '90 Min.', level: 'Fortgeschritten', spots: 2, price: '12 €', mark: '↗', tone: 'court' },
  { id: 4, title: 'Tennis Feierabend-Doppel', sport: 'Tennis', place: 'Sportpark Mitte', time: 'Morgen, 18:00', day: 'Morgen', period: 'Abend', distance: 4.8, duration: '90 Min.', level: 'Alle Level', spots: 2, price: '9 €', mark: '◉', tone: 'court' },
  { id: 5, title: 'Boulder Session', sport: 'Klettern', place: 'Boulderwerk Kreuzberg', time: 'Heute, 17:00', day: 'Heute', period: 'Nachmittag', distance: 5.6, duration: '90 Min.', level: 'Einsteiger:innen', spots: 5, price: '14 €', mark: '↗', tone: 'run' },
  { id: 6, title: 'Sonnenaufgang Run Club', sport: 'Joggen', place: 'Tempelhofer Feld', time: 'Morgen, 07:00', day: 'Morgen', period: 'Vormittag', distance: 2.4, duration: '45 Min.', level: 'Alle Level', spots: 4, price: 'Kostenlos', mark: '↗', tone: 'run' },
  { id: 7, title: 'Gym Buddy Workout', sport: 'Fitness', place: 'Urban Sports Club', time: 'Heute, 17:30', day: 'Heute', period: 'Abend', distance: 1.8, duration: '60 Min.', level: 'Alle Level', spots: 3, price: '10 €', mark: '✳', tone: 'yoga' },
  { id: 8, title: 'Sunday Flow', sport: 'Yoga', place: 'Studio Morgenrot', time: 'Morgen, 09:00', day: 'Morgen', period: 'Vormittag', distance: 1.8, duration: '60 Min.', level: 'Alle Level', spots: 6, price: '8 €', mark: '✳', tone: 'yoga' },
  { id: 9, title: 'Tempelhofer Feierabendrunde', sport: 'Radfahren', place: 'Tempelhofer Feld', time: 'Heute, 18:00', day: 'Heute', period: 'Abend', distance: 4.2, duration: '50 Min.', level: 'Alle Level', spots: 5, price: 'Kostenlos', mark: '↗', tone: 'run' },
  { id: 10, title: 'Landwehrkanal Walk & Talk', sport: 'Wandern', place: 'Admiralbrücke', time: 'Morgen, 10:00', day: 'Morgen', period: 'Vormittag', distance: 2.1, duration: '60 Min.', level: 'Alle Level', spots: 6, price: 'Kostenlos', mark: '↗', tone: 'run' },
]
const communities = [
  { id: 1, name: 'Berlin Run Collective', sport: 'Laufen', location: 'Berlin · 2,4 km', members: 128, detail: 'Gemeinsam Kilometer sammeln und die Stadt laufend entdecken.', initials: 'RC' },
  { id: 2, name: 'Padel People Berlin', sport: 'Padel', location: 'Berlin · 3,1 km', members: 86, detail: 'Spielpartner:innen finden, Matches organisieren, besser werden.', initials: 'PP' },
  { id: 3, name: 'Yoga im Park', sport: 'Yoga', location: 'Berlin · 1,8 km', members: 54, detail: 'Bewegung, frische Luft und gute Energie für alle Level.', initials: 'YP' },
]
const groupsSeed = [
  { id: 1, name: 'Fußball 5v5 im Käfig', sport: 'Fußball', members: 8, openSpots: 2, description: 'Zwei Mitspieler:innen gesucht – heute Abend am Kreuzberg.' },
  { id: 2, name: 'Padel Doppel gesucht', sport: 'Tennis', members: 3, openSpots: 1, description: 'Uns fehlt noch ein Team für Donnerstagabend.' },
]
const todayLabel = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()).toUpperCase()
const certificateDate = new Intl.DateTimeFormat('de-DE', { dateStyle: 'long' }).format(new Date())
const Icon = ({ children, size = 18 }) => <span className="icon" aria-hidden="true" style={{ '--icon-size': `${size}px` }}>{children}</span>
const activitySportIcons = {
  Joggen: PersonRunningRegular,
  Laufen: PersonRunningRegular,
  Radfahren: VehicleBicycleRegular,
  Wandern: 'hiking',
  Klettern: 'climbing',
  Fitness: DumbbellRegular,
  Yoga: 'yoga',
  Fußball: SportSoccerRegular,
  Basketball: SportBasketballRegular,
  Padel: 'padel',
  Tennis: 'tennis',
}
function ActivitySportIcon({ sport }) {
  const SportIcon = activitySportIcons[sport] ?? SportRegular
  if (SportIcon === 'tennis') return (
    <svg aria-hidden="true" viewBox="0 0 64 64" fill="none" focusable="false">
      <ellipse cx="34" cy="23" rx="11" ry="15" transform="rotate(35 34 23)" stroke="currentColor" strokeWidth="3.5" />
      <path d="m26 35-15 18m10-34 19 18m-23-8 17 16m-6-28 17 18m-24 4 17-17m-11 24 17-17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="13" cy="12" r="4.5" fill="currentColor" />
    </svg>
  )
  if (SportIcon === 'padel') return (
    <svg aria-hidden="true" viewBox="0 0 64 64" fill="none" focusable="false">
      <path d="M35 7C22 5 11 17 11 31c0 11 6 18 15 17 13-1 24-13 24-26C50 14 44 8 35 7Z" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="m24 46-11 12" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="25" cy="19" r="1.5" fill="currentColor" /><circle cx="36" cy="16" r="1.5" fill="currentColor" />
      <circle cx="19" cy="29" r="1.5" fill="currentColor" /><circle cx="30" cy="27" r="1.5" fill="currentColor" /><circle cx="41" cy="25" r="1.5" fill="currentColor" />
      <circle cx="22" cy="38" r="1.5" fill="currentColor" /><circle cx="34" cy="37" r="1.5" fill="currentColor" />
    </svg>
  )
  if (SportIcon === 'yoga') return (
    <svg aria-hidden="true" viewBox="0 0 64 64" fill="none" focusable="false">
      <circle cx="32" cy="12" r="4.5" stroke="currentColor" strokeWidth="3.5" />
      <path d="m32 18 0 15m0-10-14 7m14-7 14 7M32 33 20 45m12-12 12 12M14 49h36" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 55h44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
  if (SportIcon === 'hiking') return (
    <svg aria-hidden="true" viewBox="0 0 64 64" fill="none" focusable="false">
      <path d="m5 51 15-21 9 11 10-19 20 29H5Z" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
      <circle cx="32" cy="15" r="4" fill="currentColor" />
      <path d="m30 21-5 11 8 6 5-10m-11 5-9 9m16-4-3 12m3-12 9 9m-17-23 5 6m-15 2-5 18m39-17 5 17" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
  if (SportIcon === 'climbing') return (
    <svg aria-hidden="true" viewBox="0 0 64 64" fill="none" focusable="false">
      <path d="M13 7v50m38-50v50M13 57h38" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M23 18h3m12 8h3M20 40h3m15 9h3M46 15h2M30 33h2m13 14h2" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="34" cy="14" r="4" fill="currentColor" />
      <path d="m32 19-8 9 9 5 8-8m-17 3-7 6m16-1-7 11m7-11 10 8m-12-19 6 3" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
  return <SportIcon aria-hidden="true" />
}
const navItems = [
  { id: 'home', label: 'Übersicht', icon: <HomeRegular /> },
  { id: 'discover', label: 'Entdecken', icon: <CompassNorthwestRegular /> },
  { id: 'connect', label: 'Connect', icon: <PeopleCommunityRegular /> },
  { id: 'progress', label: 'Fortschritt', icon: <TrophyRegular /> },
]
const appPages = [
  ...navItems,
  { id: 'profile', label: 'Mein Profil', icon: <PersonRegular /> },
  { id: 'settings', label: 'Einstellungen', icon: <SettingsRegular /> },
  { id: 'admin', label: 'Admin', icon: <ShieldCheckmarkRegular />, adminOnly: true },
]

function App() {
  const [page, setPage] = useState('home')
  const [profiles, setProfiles] = useState(() => readLocal('sportquest-profiles', initialDemoUsers).map((profile) => ({
    ...profile,
    friendIds: Array.isArray(profile.friendIds) ? profile.friendIds : [],
    routeSessions: profile.routeSessions ?? demoRouteSessions,
    challengeProgress: profile.challengeWeekKey && profile.challengeWeekKey !== currentWeekKey ? 0 : profile.challengeProgress ?? 0,
    challengeWeekKey: currentWeekKey,
    monthProgress: profile.monthChallengeKey && profile.monthChallengeKey !== currentMonthKey ? 0 : profile.monthProgress ?? 0,
    monthChallengeKey: currentMonthKey,
  })))
  const [currentUserId, setCurrentUserId] = useState(() => localStorage.getItem('sportquest-current-user') ?? '')
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [sportFilter, setSportFilter] = useState('Alle')
  const [dayFilter, setDayFilter] = useState('Alle')
  const [timeFilter, setTimeFilter] = useState('Alle')
  const [distanceFilter, setDistanceFilter] = useState('25')
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [meetingDialog, setMeetingDialog] = useState(false)
  const [events, setEvents] = useState(() => readLocal('sportquest-events', activities.map((activity) => ({ ...activity, ownerId: 'seed', attendees: [] }))))
  const [groups, setGroups] = useState(() => readLocal('sportquest-groups', groupsSeed))
  const [activeGroup, setActiveGroup] = useState(1)
  const [chatText, setChatText] = useState('')
  const [messages, setMessages] = useState(() => readLocal('sportquest-chat', [{ from: 'Mia', text: 'Bin heute dabei! Wir treffen uns wie immer am Eingang?', mine: false }, { from: 'Du', text: 'Genau, bis später!', mine: true }]))
  const [showCreate, setShowCreate] = useState(false)
  const [showGroupDialog, setShowGroupDialog] = useState(false)
  const [communityName, setCommunityName] = useState('')
  const [communityList, setCommunityList] = useState(() => readLocal('sportquest-communities', communities))
  const [leaderboardTab, setLeaderboardTab] = useState('Freunde')
  const [progressTab, setProgressTab] = useState('Fortschritt')
  const [challengeFilter, setChallengeFilter] = useState('Alle')
  const [partnerMode, setPartnerMode] = useState(false)
  const [partnerChallenges, setPartnerChallenges] = useState(() => readLocal('sportquest-partner-challenges', initialPartnerChallenges)
    .map((campaign) => {
      const defaults = initialPartnerChallenges.find((item) => item.id === campaign.id)
      return {
        ...defaults,
        ...campaign,
        activity: campaign.activity ?? defaults?.activity ?? 'Alle Trainings',
        goalType: campaign.goalType ?? defaults?.goalType ?? 'sessions',
        target: Number(campaign.target) || defaults?.target || 1,
        discount: Number(campaign.discount) || defaults?.discount || 10,
        reward: Number(campaign.reward) || defaults?.reward || 100,
        startAt: campaign.startAt ?? defaults?.startAt ?? todayISO,
        expiresAt: campaign.expiresAt ?? defaults?.expiresAt ?? defaultCampaignExpiry,
        completionWindowDays: Number(campaign.completionWindowDays) || defaults?.completionWindowDays || 30,
      }
    }))
  const [partnerOrganizations, setPartnerOrganizations] = useState(() => readLocal('sportquest-partners', initialPartnerOrganizations)
    .map((partner) => ({ ...initialPartnerOrganizations.find((item) => item.name === partner.name), ...partner })))
  const [occupancy, setOccupancy] = useState(68)
  const [partnerBookings, setPartnerBookings] = useState(12)
  const [hiddenEventIds, setHiddenEventIds] = useState(() => readLocal('sportquest-hidden-events', []))
  const [levelUp, setLevelUp] = useState(0)
  const [toast, setToast] = useState('')
  const lastFocusedElement = useRef(null)
  const currentUser = profiles.find((profile) => profile.id === currentUserId)
  const activeActivity = selectedActivity && (events.find((event) => event.id === selectedActivity.id) ?? selectedActivity)
  const xp = currentUser?.xp ?? 0
  const premium = currentUser?.premium ?? false
  const joinedGroups = currentUser?.joinedGroups ?? []
  const joinedCommunities = currentUser?.joinedCommunities ?? []
  const checkedIn = currentUser?.lastCheckIn === todayISO
  const streakWeeks = currentUser ? getActivityStreakWeeks(currentUser, new Date(`${todayISO}T12:00:00`)) : 0
  const activityLogged = currentUser?.activityLogged ?? 0
  const challengeProgress = currentUser?.challengeProgress ?? 0
  const monthProgress = currentUser?.monthProgress ?? 0
  const settings = currentUser?.settings ?? { notifications: true, profilePublic: true, weeklyDigest: false }
  const bookings = currentUser?.bookings ?? []
  const isAdmin = currentUser?.role === 'admin'
  const visiblePages = appPages.filter((item) => !item.adminOnly || isAdmin)

  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }
  useEffect(() => {
    localStorage.setItem('sportquest-profiles', JSON.stringify(profiles))
  }, [profiles])
  useEffect(() => {
    if (currentUserId) localStorage.setItem('sportquest-current-user', currentUserId)
    else localStorage.removeItem('sportquest-current-user')
  }, [currentUserId])
  useEffect(() => {
    localStorage.setItem('sportquest-events', JSON.stringify(events))
  }, [events])
  useEffect(() => {
    localStorage.setItem('sportquest-groups', JSON.stringify(groups))
  }, [groups])
  useEffect(() => {
    localStorage.setItem('sportquest-hidden-events', JSON.stringify(hiddenEventIds))
  }, [hiddenEventIds])
  useEffect(() => {
    localStorage.setItem('sportquest-chat', JSON.stringify(messages))
  }, [messages])
  useEffect(() => {
    localStorage.setItem('sportquest-communities', JSON.stringify(communityList))
  }, [communityList])
  useEffect(() => {
    localStorage.setItem('sportquest-partner-challenges', JSON.stringify(partnerChallenges))
  }, [partnerChallenges])
  useEffect(() => {
    localStorage.setItem('sportquest-partners', JSON.stringify(partnerOrganizations))
  }, [partnerOrganizations])

  const updateCurrentProfile = (key, update) => {
    if (!currentUser) return
    setProfiles((current) => current.map((profile) => {
      if (profile.id !== currentUser.id) return profile
      const value = typeof update === 'function' ? update(profile[key]) : update
      return { ...profile, [key]: value }
    }))
  }
  const signIn = (id) => {
    setCurrentUserId(id)
    setPage('home')
    setPartnerMode(false)
    setShowAccountMenu(false)
  }
  const setPremium = (update) => updateCurrentProfile('premium', update)
  const setJoinedGroups = (update) => updateCurrentProfile('joinedGroups', update)
  const setJoinedCommunities = (update) => updateCurrentProfile('joinedCommunities', update)
  const setSettings = (update) => updateCurrentProfile('settings', (current) => {
    const value = { ...demoSettings, ...current }
    return typeof update === 'function' ? update(value) : update
  })
  const signOut = () => {
    setCurrentUserId('')
    setPage('home')
    setPartnerMode(false)
    setShowAccountMenu(false)
  }
  useEffect(() => {
    if (!selectedActivity && !showCreate && !meetingDialog && !showGroupDialog) {
      if (lastFocusedElement.current instanceof HTMLElement) lastFocusedElement.current.focus()
      return undefined
    }
    const dialog = document.querySelector('[role="dialog"]')
    dialog?.querySelector('button:not(:disabled), input:not(:disabled)')?.focus()
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setSelectedActivity(null)
        setShowCreate(false)
        setMeetingDialog(false)
        setShowGroupDialog(false)
        return
      }
      if (event.key === 'Tab') {
        const focusable = dialog?.querySelectorAll('button:not(:disabled), input:not(:disabled), [href], [tabindex]:not([tabindex="-1"])')
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
    }
  }, [selectedActivity, showCreate, meetingDialog, showGroupDialog])
  const openActivity = (activity) => {
    lastFocusedElement.current = document.activeElement
    setSelectedActivity(activity)
  }
  const openCreateCommunity = () => {
    lastFocusedElement.current = document.activeElement
    setShowCreate(true)
  }
  const createPartnerCampaign = ({ partner, partnerEmail, website, title, activity, goalType, target, discount, startAt, expiresAt, completionWindowDays }) => {
    const cleanPartner = partner.trim()
    const safeWebsite = getSafeWebsiteUrl(website)
    const couponPrefix = cleanPartner.replace(/[^A-Z0-9]/gi, '').slice(0, 8).toUpperCase() || 'MOVE'
    const campaign = {
      id: `partner-campaign-${Date.now()}`,
      partner: cleanPartner,
      partnerEmail: partnerEmail.trim(),
      website: safeWebsite,
      title: title.trim(),
      activity,
      goalType,
      target: Number(target),
      discount: Number(discount),
      reward: 100,
      couponCodePrefix: `${couponPrefix}${discount}`,
      startAt,
      expiresAt,
      completionWindowDays: Number(completionWindowDays),
    }
    setPartnerChallenges((current) => [campaign, ...current])
    setPartnerOrganizations((current) => current.some((item) => item.name.toLocaleLowerCase('de-DE') === cleanPartner.toLocaleLowerCase('de-DE'))
      ? current
      : [{ name: cleanPartner, email: partnerEmail.trim(), website: safeWebsite }, ...current])
    showToast(`Partner-Challenge „${campaign.title}“ veröffentlicht · ${campaign.discount}% Rabatt`)
  }

  const visibleActivities = useMemo(() => events.filter((activity) => (
    (sportFilter === 'Alle' || activity.sport === sportFilter)
    && (dayFilter === 'Alle' || activity.day === dayFilter)
    && (timeFilter === 'Alle' || activity.period === timeFilter)
    && activity.distance <= Number(distanceFilter)
    && !hiddenEventIds.includes(activity.id)
  )), [events, sportFilter, dayFilter, timeFilter, distanceFilter, hiddenEventIds])
  const activeChatGroup = groups.find((group) => group.id === activeGroup) ?? groups[0]

  const createMeeting = (meeting) => {
    const id = getNextId(events)
    const hour = Number(meeting.time.slice(0, 2))
    const item = {
      ...meeting,
      id,
      time: formatMeetingTime(meeting.date, meeting.time),
      day: meeting.date === todayISO ? 'Heute' : meeting.date === tomorrowISO ? 'Morgen' : 'Diese Woche',
      period: hour < 12 ? 'Vormittag' : hour < 17 ? 'Nachmittag' : 'Abend',
      distance: Number(meeting.distance),
      duration: `${meeting.duration} Min.`,
      level: meeting.level,
      mark: meeting.sport === 'Fußball' ? '◎' : '↗',
      tone: meeting.sport === 'Yoga' ? 'yoga' : meeting.sport === 'Tennis' || meeting.sport === 'Padel' ? 'court' : 'run',
      ownerId: currentUser.id,
      attendees: [],
    }
    setEvents((current) => [item, ...current])
    setMeetingDialog(false)
    setPage('discover')
    setSportFilter('Alle')
    setDayFilter('Alle')
    setTimeFilter('Alle')
    setDistanceFilter('25')
    showToast('Dein Treffen ist jetzt für die Community sichtbar.')
  }
  const createGroup = (groupData) => {
    const newGroup = { ...groupData, id: getNextId(groups), members: 1, openSpots: groupData.openSpots, ownerId: currentUser.id }
    setGroups((current) => [newGroup, ...current])
    setJoinedGroups((current) => [...current, newGroup.id])
    setActiveGroup(newGroup.id)
    setShowGroupDialog(false)
    showToast('Deine neue Gruppe ist jetzt offen für Mitspieler:innen.')
  }
  const removeEvent = (eventId) => {
    setEvents((current) => current.filter((event) => event.id !== eventId))
    setHiddenEventIds((current) => current.filter((id) => id !== eventId))
    setProfiles((current) => current.map((profile) => ({ ...profile, bookings: (profile.bookings ?? []).filter((id) => id !== eventId) })))
    showToast('Treffen wurde aus der Demo entfernt.')
  }
  const toggleEventVisibility = (eventId) => {
    setHiddenEventIds((current) => current.includes(eventId) ? current.filter((id) => id !== eventId) : [...current, eventId])
    showToast('Sichtbarkeit des Treffens aktualisiert.')
  }
  const joinEvent = (activity) => {
    if (!currentUser) return
    const attendees = activity.attendees ?? []
    if (attendees.includes(currentUser.id) || activity.spots - attendees.length <= 0) return
    setEvents((current) => current.map((event) => event.id === activity.id
      ? { ...event, attendees: [...(event.attendees ?? []), currentUser.id] }
      : event))
    updateCurrentProfile('bookings', [...bookings, activity.id])
    showToast('Du bist dabei! Der Platz ist für diese Demo reserviert.')
  }
  const leaveEvent = (activity) => {
    setEvents((current) => current.map((event) => event.id === activity.id
      ? { ...event, attendees: (event.attendees ?? []).filter((id) => id !== currentUser.id) }
      : event))
    updateCurrentProfile('bookings', bookings.filter((id) => id !== activity.id))
    showToast('Deine Teilnahme wurde entfernt.')
  }
  const copyGroupInvite = async (group) => {
    const link = `${window.location.origin}/#gruppe-${group.id}`
    try {
      await navigator.clipboard.writeText(link)
      showToast('Einladungslink kopiert.')
    } catch (error) {
      console.error('SportQuest: Einladungslink konnte nicht in die Zwischenablage kopiert werden.', error)
      showToast(`Einladungslink: ${link}`)
    }
  }
  const awardXp = (amount, message) => {
    const updatedXp = xp + amount
    const currentLevel = getLevelInfo(xp).level
    const updatedLevel = getLevelInfo(updatedXp).level
    updateCurrentProfile('xp', updatedXp)
    if (updatedLevel > currentLevel) {
      setLevelUp(updatedLevel)
      window.setTimeout(() => setLevelUp(0), 2200)
    }
    showToast(updatedLevel > currentLevel
      ? `LEVEL UP! Level ${updatedLevel} erreicht${Math.floor(updatedLevel / 5) > Math.floor(currentLevel / 5) ? ' · Level-Medaille freigeschaltet' : ''} · ${message}`
      : message)
  }
  const recordCheckIn = () => {
    if (checkedIn) return
    updateCurrentProfile('lastCheckIn', todayISO)
    awardXp(20, '+20 XP – Check-in geschafft!')
  }
  const recordCompletedActivity = (details) => {
    if (!currentUser) return
    const type = details.type ?? 'Workout'
    const distance = Number(details.distance) || 0
    const duration = Number(details.duration) || 0
    const date = details.date ?? todayISO
    const isOutdoor = ['Laufen', 'Radfahren', 'Wandern'].includes(type)
    const reward = type === 'Match' ? 100 : isOutdoor ? 50 + Math.round(distance * 10) : 50
    const routeSessions = currentUser.routeSessions ?? []
    const routeSession = isOutdoor ? {
      id: getNextId(routeSessions),
      sport: type,
      distance,
      duration,
      date,
      daysAgo: Math.max(0, Math.round((new Date(`${todayISO}T12:00:00`) - new Date(`${date}T12:00:00`)) / 86400000)),
      area: details.place?.trim() || 'Berlin · Demo-Route',
    } : null
    const partnerActivities = partnerChallenges
      .filter((campaign) => (
        campaign.startAt <= date
        && campaign.expiresAt >= date
        && (campaign.activity === 'Alle Trainings' || campaign.activity === type)
        && (campaign.goalType !== 'distance' || distance > 0)
      ))
      .map((campaign) => ({ campaignId: campaign.id, activity: type, distance, date }))
    const nextUser = {
      ...currentUser,
      activityLogged: (currentUser.activityLogged ?? 0) + 1,
      matchCount: (currentUser.matchCount ?? 0) + (type === 'Match' ? 1 : 0),
      challengeProgress: Math.min((currentUser.challengeProgress ?? 0) + 1, 5),
      monthProgress: Math.min((currentUser.monthProgress ?? 0) + 1, 12),
      routeSessions: routeSession ? [...routeSessions, routeSession] : routeSessions,
      partnerChallengeActivities: [...(currentUser.partnerChallengeActivities ?? []), ...partnerActivities],
    }
    const completedBefore = new Set(getChallengeCatalog(currentUser, partnerChallenges, challengeContext)
      .filter((challenge) => challenge.completed)
      .map((challenge) => challenge.id))
    const completedChallenges = getChallengeCatalog(nextUser, partnerChallenges, challengeContext)
      .filter((challenge) => challenge.completed && !completedBefore.has(challenge.id) && !(currentUser.claimedChallenges ?? []).includes(challenge.id))
      .map(({ id, title, category }) => ({ id, title, category }))
    const activityRecord = {
      id: getNextId(currentUser.activityHistory ?? []),
      type,
      date,
      duration,
      distance,
      place: details.place?.trim() || routeSession?.area || 'Nicht angegeben',
      friendIds: [...new Set(details.friendIds ?? [])],
      completedChallenges,
      xpEarned: reward,
      routeSessionId: routeSession?.id,
    }
    updateCurrentProfile('activityLogged', nextUser.activityLogged)
    updateCurrentProfile('matchCount', nextUser.matchCount)
    updateCurrentProfile('challengeProgress', nextUser.challengeProgress)
    updateCurrentProfile('monthProgress', nextUser.monthProgress)
    updateCurrentProfile('routeSessions', nextUser.routeSessions)
    updateCurrentProfile('partnerChallengeActivities', nextUser.partnerChallengeActivities)
    updateCurrentProfile('activityHistory', [
      ...(Array.isArray(currentUser.activityHistory) ? currentUser.activityHistory : []),
      activityRecord,
    ])
    awardXp(reward, isOutdoor
      ? `Strecke erfasst · +${reward} XP!`
      : `+${reward} XP – ${type === 'Match' ? 'Match abgeschlossen' : 'Workout eingetragen'}!`)
  }
  const recordActivity = (details) => {
    const activityDetails = details?.nativeEvent ? {} : details ?? {}
    recordCompletedActivity({ ...activityDetails, type: activityDetails.type ?? 'Workout' })
  }
  const recordRoute = (route) => recordCompletedActivity({
    ...route,
    type: route.sport,
    place: route.place ?? route.area,
  })
  const claimChallenge = (challenge) => {
    const claimed = currentUser.claimedChallenges ?? []
    if (!challenge.completed || claimed.includes(challenge.id) || challenge.startAt > todayISO || challenge.expiresAt < todayISO) return
    const couponCode = challenge.discount
      ? `${challenge.couponCodePrefix}-${currentUser.id.toUpperCase()}`
      : ''
    updateCurrentProfile('claimedChallenges', (current) => [...new Set([...(current ?? []), challenge.id])])
    updateCurrentProfile('medals', (current) => [...(current ?? []).filter((medal) => medal.id !== challenge.id), {
      id: challenge.id,
      title: challenge.title,
      category: challenge.category,
      icon: challenge.icon,
      medal: challenge.medal,
      certificate: challenge.certificate,
      description: challenge.description,
      reward: challenge.reward,
      rarity: challenge.rarity ?? getChallengeRarity(challenge.reward),
      badgeType: challenge.discount ? 'partner' : 'challenge',
      partner: challenge.partner,
      website: challenge.website,
      discount: challenge.discount,
      couponCode,
      expiresAt: challenge.expiresAt,
      claimedAt: certificateDate,
    }])
    awardXp(challenge.reward, challenge.discount
      ? `${challenge.discount}% Rabatt bei ${challenge.partner} freigeschaltet · +${challenge.reward} XP!`
      : `Medaille „${challenge.medal}“ gesichert · +${challenge.reward} XP!`)
  }
  const copyDiscountCode = async (couponCode) => {
    try {
      await navigator.clipboard.writeText(couponCode)
      showToast('Rabattcode kopiert.')
    } catch (error) {
      console.error('SportQuest: Rabattcode konnte nicht in die Zwischenablage kopiert werden.', error)
      showToast(`Rabattcode: ${couponCode}`)
    }
  }
  const downloadCertificate = (challenge) => {
    if (!(currentUser.claimedChallenges ?? []).includes(challenge.id)) return
    const content = `<!doctype html><html lang="de"><meta charset="utf-8"><title>SportQuest · ${escapeHtml(challenge.certificate)}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#121826;color:#f4f6fa;font:16pxArial,sans-serif}.certificate{width:min(800px,88vw);padding:56px 36px;text-align:center;border:2px solid #cdf63d;outline:1px solid #cdf63d;outline-offset:10px;background:linear-gradient(145deg,#192130,#111925)}.brand{color:#cdf63d;font-weight:800;letter-spacing:4px}.medal{margin:30px auto 16px;width:90px;height:90px;display:grid;place-items:center;border:2px solid #cdf63d;border-radius:50%;color:#cdf63d;font-size:42px}.eyebrow{color:#9ba6b7;letter-spacing:3px;font-size:12px}.certificate h1{font-size:38px;margin:12px}.certificate h2{color:#cdf63d;font-size:24px}.certificate p{color:#c3ccd8;line-height:1.7}.signature{margin-top:42px;color:#9ba6b7;font-size:12px}@media print{body{background:white;color:#121826}.certificate{background:white;color:#121826;print-color-adjust:exact}}</style><main class="certificate"><div class="brand">SPORTQUEST</div><div class="medal">${escapeHtml(challenge.icon)}</div><div class="eyebrow">URKUNDE · ${escapeHtml(challenge.category.toUpperCase())}</div><h1>${escapeHtml(challenge.certificate)}</h1><p>Diese Auszeichnung wird verliehen an</p><h2>${escapeHtml(currentUser.name)}</h2><p>für den erfolgreichen Abschluss der Challenge<br><strong>${escapeHtml(challenge.description)}</strong></p><div class="signature">Play. Connect. Level Up. · ${certificateDate}</div></main></html>`
    const certificateUrl = URL.createObjectURL(new Blob([content], { type: 'text/html;charset=utf-8' }))
    const downloadLink = document.createElement('a')
    downloadLink.href = certificateUrl
    downloadLink.download = `sportquest-urkunde-${challenge.id}.html`
    downloadLink.click()
    window.setTimeout(() => URL.revokeObjectURL(certificateUrl), 1000)
    showToast('Deine Urkunde wurde heruntergeladen.')
  }

  const submitMessage = (event) => {
    event.preventDefault()
    if (!chatText.trim()) return
    setMessages((current) => [...current, { from: currentUser.name, text: chatText.trim(), mine: true }])
    setChatText('')
    showToast('Demo-Nachricht lokal hinzugefügt')
  }
  if (!currentUser) {
    return (
      <FluentProvider theme={{ ...webDarkTheme, colorBrandBackground: '#cdf63d', colorBrandForeground1: '#121826' }}>
        <LoginScreen users={profiles} onSignIn={signIn} />
      </FluentProvider>
    )
  }
  const navigate = (nextPage) => {
    setPage(nextPage)
    setPartnerMode(false)
    setShowAccountMenu(false)
  }
  const pageTitle = partnerMode ? 'Partner Portal' : visiblePages.find((item) => item.id === page)?.label ?? 'SportQuest'
  return (
    <FluentProvider theme={{ ...webDarkTheme, colorBrandBackground: '#cdf63d', colorBrandForeground1: '#121826', colorBrandForeground2: '#121826', colorNeutralForeground1: '#f4f6fa', colorNeutralBackground1: '#192130', colorNeutralBackground2: '#1d2737' }}>
      <div className="app-shell">
        <aside className="sidebar" aria-label="Hauptnavigation">
          <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); setPage('home'); setPartnerMode(false) }}>
            <span className="brand-mark"><FlashRegular /></span>
            <span>sportquest<span className="brand-dot">.</span><small>Play. Connect. Level Up.</small></span>
          </a>
          <div className="side-label">MENÜ</div>
          <nav className="side-nav">
            {visiblePages.filter((item) => ['home', 'discover', 'connect', 'progress', 'admin'].includes(item.id)).map((item) => (
              <button key={item.id} className={`nav-link ${page === item.id && !partnerMode ? 'active' : ''}`} aria-current={page === item.id && !partnerMode ? 'page' : undefined} onClick={() => navigate(item.id)}>
                <Icon>{item.icon}</Icon><span>{item.label}</span>{item.id === 'connect' && <span className="nav-count">2</span>}
              </button>
            ))}
          </nav>
          <div className="side-label secondary-nav-label">KONTO</div>
          <nav className="side-nav secondary-side-nav">
            {visiblePages.filter((item) => ['profile', 'settings'].includes(item.id)).map((item) => (
              <button key={item.id} className={`nav-link ${page === item.id && !partnerMode ? 'active' : ''}`} aria-current={page === item.id && !partnerMode ? 'page' : undefined} onClick={() => navigate(item.id)}>
                <Icon>{item.icon}</Icon><span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="side-divider" />
          <button className={`nav-link partner-link ${partnerMode ? 'active' : ''}`} onClick={() => setPartnerMode(true)}>
            <Icon><ShieldCheckmarkRegular /></Icon><span>Partner Portal</span><span className="partner-tag">B2B</span>
          </button>
          <div className="sidebar-spacer" />
          <div className="side-premium">
            <span className="premium-icon"><CrownRegular /></span>
            <strong>Mehr aus dir rausholen?</strong>
            <p>{premium ? '4,99 € / Monat · Vorschau' : 'Basis kostenlos · Premium 4,99 € / Monat'}</p>
            <button onClick={() => { setPage('home'); setPartnerMode(false); setPremium((value) => !value) }}>
              {premium ? 'Free preview ansehen' : 'Premium entdecken'} <ArrowRightRegular />
            </button>
          </div>
          <button className="profile-mini" onClick={() => navigate('profile')}>
            <Avatar name={currentUser.name} initials={currentUser.initials} size={36} color="neutral" />
            <span><strong>{currentUser.name}</strong><small>{isAdmin ? 'Administrator' : `Level ${getLevelInfo(xp).level} · ${currentUser.city}`}</small></span>
            <ChevronDownRegular />
          </button>
        </aside>

        <div className="main-column">
          <header className="topbar">
            <div className="mobile-brand"><span className="brand-mark"><FlashRegular /></span> sportquest<span className="brand-dot">.</span></div>
            <div className="breadcrumb"><span>SportQuest</span><ChevronRightRegular />{pageTitle}</div>
            <div className="top-actions">
              <button className="location-pill" aria-label="Standort: Berlin, Demo" onClick={() => showToast('Standort Berlin ist in dieser Demo fest eingestellt')}><LocationRegular /> Berlin, Deutschland <ChevronDownRegular /></button>
              <button className="icon-button notification-button" aria-label={settings.notifications ? 'Benachrichtigungen' : 'Benachrichtigungen pausiert'} onClick={() => showToast(settings.notifications ? 'Du bist auf dem neuesten Stand' : 'Benachrichtigungen sind in deinen Einstellungen pausiert')}><span className={settings.notifications ? 'notification-dot' : 'notification-dot paused'} /><SparkleRegular /></button>
              <button className="account-trigger" aria-label="Profilmenü öffnen" aria-expanded={showAccountMenu} onClick={() => setShowAccountMenu((value) => !value)}><Avatar className="top-avatar" name={currentUser.name} initials={currentUser.initials} size={34} color="neutral" /><ChevronDownRegular /></button>
            </div>
            {showAccountMenu && <AccountMenu currentUser={currentUser} users={profiles} onNavigate={navigate} onSwitch={signIn} onSignOut={signOut} />}
          </header>
          <main id="main-content" className="content">
            {partnerMode ? (
              <PartnerView occupancy={occupancy} setOccupancy={setOccupancy} bookings={partnerBookings} setBookings={setPartnerBookings} showToast={showToast} campaigns={partnerChallenges} partners={partnerOrganizations} onCreateCampaign={createPartnerCampaign} />
            ) : page === 'home' ? (
              <HomeView
                user={currentUser} streakWeeks={streakWeeks} checkedIn={checkedIn} activityLogged={activityLogged}
                onCheckIn={recordCheckIn} onLogActivity={recordActivity} xp={xp} premium={premium} setPremium={setPremium} challengeProgress={challengeProgress}
                setPage={navigate} setPartnerMode={setPartnerMode} onDiscover={() => { setPage('discover'); setSportFilter('Alle') }}
                onActivity={openActivity} onCreateMeeting={() => setMeetingDialog(true)} onProgress={() => { setProgressTab('Fortschritt'); navigate('progress') }} onActivityHistory={() => { setProgressTab('Aktivitäten'); navigate('progress') }} onHeatmap={() => { setProgressTab('Heatmap'); navigate('progress') }} onChallenges={() => { setChallengeFilter('Alle'); setProgressTab('Challenge-Board'); navigate('progress') }} routeSessions={currentUser.routeSessions ?? []}
                today={todayLabel} items={events.filter((event) => !hiddenEventIds.includes(event.id)).slice(0, 3)}
              />
            ) : page === 'discover' ? (
              <DiscoverView
                canCreate={currentUser.role === 'user' || isAdmin} onCreate={() => setMeetingDialog(true)}
                filters={['Alle', 'Fußball', 'Basketball', 'Tennis', 'Padel', 'Klettern', 'Joggen', 'Radfahren', 'Wandern', 'Fitness', 'Yoga']}
                active={sportFilter} onFilter={setSportFilter} day={dayFilter} onDay={setDayFilter}
                time={timeFilter} onTime={setTimeFilter} distance={distanceFilter} onDistance={setDistanceFilter}
                onReset={() => { setSportFilter('Alle'); setDayFilter('Alle'); setTimeFilter('Alle'); setDistanceFilter('25') }}
                items={visibleActivities} onSelect={openActivity} currentUser={currentUser} hiddenEventIds={hiddenEventIds}
                onDeleteEvent={removeEvent} onToggleVisibility={toggleEventVisibility}
                onHeatmap={() => { setProgressTab('Heatmap'); navigate('progress') }}
              />
            ) : page === 'connect' ? (
              <ConnectView groups={groups} setGroups={setGroups} joinedGroups={joinedGroups} setJoinedGroups={setJoinedGroups} communities={communityList} joinedCommunities={joinedCommunities} setJoinedCommunities={setJoinedCommunities} activeGroup={activeGroup} setActiveGroup={setActiveGroup} activeChatGroup={activeChatGroup} messages={messages} chatText={chatText} setChatText={setChatText} submitMessage={submitMessage} onCreate={openCreateCommunity} onCreateGroup={() => setShowGroupDialog(true)} onInvite={copyGroupInvite} showToast={showToast} currentUser={currentUser} users={profiles} onUpdateFriends={(friendIds) => updateCurrentProfile('friendIds', friendIds)} />
            ) : page === 'profile' ? (
              <ProfileView user={currentUser} settings={settings} xp={xp} events={events} bookings={bookings} onEdit={() => setPage('profile-edit')} />
            ) : page === 'profile-edit' ? (
              <ProfileEditView user={currentUser} onSave={(details) => { setProfiles((current) => current.map((profile) => profile.id === currentUser.id ? { ...profile, ...details } : profile)); setPage('profile'); showToast('Profil lokal gespeichert.') }} onCancel={() => setPage('profile')} />
            ) : page === 'settings' ? (
              <SettingsView settings={settings} setSettings={setSettings} user={currentUser} xp={xp} showToast={showToast} />
            ) : page === 'admin' && isAdmin ? (
              <AdminView users={profiles} events={events} hiddenEventIds={hiddenEventIds} onToggleVisibility={toggleEventVisibility} onDelete={removeEvent} />
            ) : (
              <ProgressView user={currentUser} users={profiles} streakWeeks={streakWeeks} xp={xp} leaderboardTab={leaderboardTab} setLeaderboardTab={setLeaderboardTab} challengeProgress={challengeProgress} monthProgress={monthProgress} showToast={showToast} progressTab={progressTab} setProgressTab={setProgressTab} challengeFilter={challengeFilter} setChallengeFilter={setChallengeFilter} onRecordRoute={recordRoute} onRecordActivity={recordActivity} onClaimChallenge={claimChallenge} onDownloadCertificate={downloadCertificate} onCopyDiscountCode={copyDiscountCode} partnerChallenges={partnerChallenges} />
            )}
          </main>
          <footer className="footer-note"><span>© 2026 SportQuest</span><span><span className="status-dot" /> Alles im Demo-Modus <span className="footer-sep">·</span> Keine echten Buchungen oder Zahlungen</span></footer>
        </div>

        <nav className="mobile-nav" aria-label="Mobile Navigation">
          {navItems.map((item) => <button key={item.id} onClick={() => navigate(item.id)} className={page === item.id && !partnerMode ? 'active' : ''} aria-current={page === item.id && !partnerMode ? 'page' : undefined}><Icon>{item.icon}</Icon><span>{item.label}</span></button>)}
          <button onClick={() => setShowAccountMenu((value) => !value)} className={showAccountMenu ? 'active' : ''}><Avatar name={currentUser.name} initials={currentUser.initials} size={22} color="neutral" /><span>Konto</span></button>
        </nav>
        {activeActivity && <ActivityDialog activity={{ ...activeActivity, spots: Math.max(activeActivity.spots - (activeActivity.attendees ?? []).length, 0) }} attendees={(activeActivity.attendees ?? []).map((id) => profiles.find((profile) => profile.id === id)?.name).filter(Boolean)} booked={bookings.includes(activeActivity.id)} onClose={() => setSelectedActivity(null)} onBook={() => joinEvent(activeActivity)} onLeave={() => leaveEvent(activeActivity)} />}
        {meetingDialog && <MeetingDialog onClose={() => setMeetingDialog(false)} onCreate={createMeeting} />}
        {showGroupDialog && <GroupDialog onClose={() => setShowGroupDialog(false)} onCreate={createGroup} />}
        {levelUp > 0 && <LevelUpCelebration level={levelUp} />}
        {showCreate && <CreateCommunityDialog value={communityName} onChange={setCommunityName} onClose={() => setShowCreate(false)} onCreate={() => {
          if (!communityName.trim()) return
          const item = { id: getNextId(communityList), name: communityName.trim(), sport: 'Community', location: `${currentUser.city} · Neu`, members: 1, detail: 'Deine neue lokale Sport-Community.', initials: communityName.trim().slice(0, 2).toUpperCase() }
          setCommunityList((current) => [item, ...current])
          setJoinedCommunities((current) => [...current, item.id])
          setCommunityName('')
          setShowCreate(false)
          showToast('Community lokal erstellt (Demo)')
        }} />}
        <div className="toast-region" aria-live="polite" aria-atomic="true">{toast && <div className="toast"><CheckmarkCircleRegular />{toast}</div>}</div>
      </div>
    </FluentProvider>
  )
}

function PageHeading({ eyebrow, title, description, action, className = '' }) {
  return <div className={`page-heading ${className}`.trim()}><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>
}
function HomeView({ user, streakWeeks, checkedIn, activityLogged, onCheckIn, onLogActivity, xp, premium, setPremium, challengeProgress, setPage, setPartnerMode, onDiscover, onActivity, onCreateMeeting, onProgress, onActivityHistory, onHeatmap, onChallenges, routeSessions, today, items }) {
  const { level, currentXp: levelXp, nextLevelXp } = getLevelInfo(xp)
  const dailyMotivation = getDailyMotivation()
  return (
    <>
      <PageHeading className="home-page-heading" eyebrow={today} title={<>Dein nächstes Level<br className="desktop-break" /> wartet auf dich, {user.name.split(' ')[0]}<span className="lime-period">.</span></>} description={<><span className="motivation-label">Spruch des Tages:</span> „{dailyMotivation}“</>} action={<Button className="outline-button" icon={<CalendarLtrRegular />} onClick={() => setPage('discover')}>Aktivitäten ansehen</Button>} />
      <section className="hero-panel" aria-label="Spielerprofil">
        <div className="hero-content">
          <button className="hero-progress-button" onClick={onProgress} aria-label={`Fortschritt öffnen: Level ${level}, ${levelXp} von ${nextLevelXp} XP`}>
            <span className="player-row"><Avatar name={user.name} initials={user.initials} size={52} color="neutral" /><span><span className="player-greeting">DEIN SPIELERPROFIL <i className="player-live-dot" /> AKTIV</span><strong>{user.name} <span className="level-pill">LEVEL {String(level).padStart(2, '0')}</span></strong></span></span>
            <span className="hero-copy">{premium ? 'Premium preview aktiv — alle Möglichkeiten im Blick.' : 'Jede Bewegung bringt dich weiter. Mach heute den ersten Schritt.'}</span>
            <span className="xp-line"><span>Dein Fortschritt</span><strong>{levelXp.toLocaleString('de-DE')} <small>/ {nextLevelXp.toLocaleString('de-DE')} XP</small></strong></span>
            <ProgressBar className="xp-progress" value={levelXp / nextLevelXp} max={1} aria-label={`${Math.round(levelXp / nextLevelXp * 100)} Prozent bis Level ${level + 1}`} />
            <span className="xp-caption"><span>{levelXp.toLocaleString('de-DE')} / {nextLevelXp.toLocaleString('de-DE')} XP · Level {level}</span><span>Noch {(nextLevelXp - levelXp).toLocaleString('de-DE')} XP bis Level {level + 1}</span></span>
          </button>
          <div className="hero-bottom">
            <button className="streak dashboard-streak-link" onClick={onActivityHistory} aria-label={`${streakWeeks} Wochen Aktivitätsserie. Aktivitätsverlauf öffnen`}><span className="streak-icon"><FlashRegular /></span><span><strong>{streakWeeks} {streakWeeks === 1 ? 'Woche' : 'Wochen'}</strong><small>Aktive Wochen am Stück</small></span><ArrowRightRegular /></button>
            <div className="hero-actions">
            <button className={`checkin-button ${checkedIn ? 'done' : ''}`} onClick={onCheckIn} disabled={checkedIn}>
              {checkedIn ? <><CheckmarkCircleRegular /> Eingecheckt · +20 XP</> : <><FlashRegular /> Täglich einchecken <span>+20 XP</span></>}
            </button>
            <div className="activity-entry-controls" role="group" aria-label="Abgeschlossene Aktivität eintragen">
              <button className="activity-log-button workout-action" aria-label="Abgeschlossenes Workout eintragen, 50 XP" onClick={() => onLogActivity({ type: 'Workout' })}>
                <DumbbellRegular /><span className="activity-action-copy"><strong>Workout</strong><small>Training eintragen</small></span><span className="activity-xp">+50 XP</span>
              </button>
              <button className="activity-log-button match-action" aria-label="Abgeschlossenes Match eintragen, 100 XP" onClick={() => onLogActivity({ type: 'Match' })}>
                <SportRegular /><span className="activity-action-copy"><strong>Match</strong><small>Spiel eintragen</small></span><span className="activity-xp">+100 XP</span>
              </button>
            </div>
            </div>
            {(checkedIn || activityLogged > 0) && <span key={xp} className="reward-pop" role="status">XP gesammelt!</span>}
          </div>
          <div className="hero-demo-note">Dein Fortschritt wird nur lokal für diese Demo angezeigt.</div>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="art-grid" /><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="art-sun" /><div className="art-ball">S</div><div className="art-spark">✳</div><div className="art-number">{String(level).padStart(2, '0')}</div><span className="art-level-caption">LEVEL<br />UNLOCKED</span></div>
      </section>

      <div className="section-title-row"><div><div className="eyebrow">DEIN MOMENTUM</div><h2>Dein Sport, dein Rhythmus</h2></div><button className="text-button" onClick={() => setPage('progress')}>Zum Fortschritt <ArrowRightRegular /></button></div>
      <div className="stat-grid">
        <button className="stat-card dashboard-widget-button" onClick={onActivityHistory} aria-label={`Aktivitätsverlauf öffnen. Aktuelle Serie: ${streakWeeks} ${streakWeeks === 1 ? 'Woche' : 'Wochen'}`}><span className="stat-top"><span className="stat-icon lime"><FlashRegular /></span><span className="stat-label">AKTUELLE SERIE</span></span><span className="stat-value">{streakWeeks} <small>{streakWeeks === 1 ? 'Woche' : 'Wochen'}</small></span><span className="stat-description">Mindestens eine Aktivität pro Kalenderwoche.</span><span className="streak-week-note">{streakWeeks === 0 ? 'Starte diese Woche deine Serie.' : 'Jede aktive Woche zählt – Pausen unterbrechen sie.'}</span></button>
        <button className="stat-card dashboard-widget-button" onClick={onChallenges} aria-label={`Wöchentliche Challenge öffnen. ${challengeProgress} von 5 Aktivitäten`}><span className="stat-top"><span className="stat-icon"><TrophyRegular /></span><span className="stat-label">DIESE WOCHE</span></span><span className="stat-value">{challengeProgress} <small>/ 5 Aktivitäten</small></span><span className="stat-description">{challengeProgress >= 5 ? 'Wochenziel erreicht – stark!' : `Noch ${5 - challengeProgress} bis zum Wochenziel.`}</span><span className="small-progress"><span style={{ width: `${challengeProgress * 20}%` }} /></span><span className="subtle-link">Challenge ansehen <ArrowRightRegular /></span></button>
        <button className="stat-card premium-card dashboard-widget-button" onClick={() => setPremium((value) => !value)} aria-label={premium ? 'Premium-Vorschau ausschalten' : 'Premium-Vorschau ansehen'}><span className="stat-top"><span className="stat-icon"><CrownRegular /></span><span className="stat-label">{premium ? 'PREMIUM-VORSCHAU' : 'BASIS · KOSTENLOS'}</span></span><span className="stat-value">{premium ? 'Alles drin.' : 'Mehr erleben.'}</span><span className="stat-description">{premium ? 'Erweiterte Analytics, persönliche Themes und exklusive Challenges – Vorschau aktiv, kein Kauf.' : 'Premium mit Analytics, individuellen Themes und exklusiven Challenges.'}</span><span className="subtle-link">{premium ? 'Zur kostenlosen Basis wechseln' : 'Premium-Vorschau ansehen'} <ArrowRightRegular /></span></button>
      </div>

      <a className="heatmap-teaser" href="#heatmap" onClick={(event) => { event.preventDefault(); onHeatmap() }} aria-label="Heatmap öffnen: Deine Stadt, deine Spuren">
        <span className="heatmap-teaser-copy"><span className="feature-kicker"><LocationRegular /> DEINE ROUTEN · BERLIN</span><strong className="heatmap-teaser-title">Deine Stadt. Deine Spuren.</strong><span className="heatmap-teaser-description">{routeSessions.length} gespeicherte Outdoor-Sessions · Lauf, radle und entdecke neue Wege.</span><span className="lime-button">Heatmap öffnen <ArrowRightRegular /></span></span>
        <RouteMap compact />
      </a>

      <div className="section-title-row discovery-title"><div><div className="eyebrow">FÜR DICH ENTDECKT</div><h2>Dein nächstes Abenteuer</h2></div><button className="text-button" onClick={onDiscover}>Alle Aktivitäten <ArrowRightRegular /></button></div>
      <div className="activity-grid home-activities">{items.slice(0, 3).map((activity) => <ActivityCard key={activity.id} activity={{ ...activity, spots: activity.spots - (activity.attendees ?? []).length }} onSelect={() => onActivity(activity)} compact />)}</div>
      <a className="community-callout" href="#connect" onClick={(event) => { event.preventDefault(); setPage('connect') }}><span className="callout-icon"><PeopleCommunityRegular /></span><span className="community-callout-copy"><strong>Zusammen macht’s mehr Spaß.</strong><span>Finde deine Crew und bleib gemeinsam in Bewegung.</span></span><span className="callout-button">Community entdecken <ArrowRightRegular /></span></a>
      <div className="home-actions"><Button className="outline-button" icon={<AddRegular />} onClick={onCreateMeeting}>Eigenes Treffen anlegen</Button><button className="bottom-demo-link" onClick={() => { setPartnerMode(true); showToast('Partnerportal-Vorschau geöffnet') }}><ShieldCheckmarkRegular /> Zur B2B-Partneransicht</button></div>
    </>
  )
}
function ActivityCard({ activity, onSelect, compact = false }) {
  return <button type="button" className={`activity-card activity-card-button ${compact ? 'compact' : ''}`} onClick={onSelect} aria-label={`${activity.title}: Details öffnen`}>
    <span className={`activity-art ${activity.tone}`} aria-hidden="true"><span className="art-label">COMMUNITY</span><span className="sport-glyph"><ActivitySportIcon sport={activity.sport} /></span><span className="art-orbit" /></span>
    <span className="activity-body">
      <span className="activity-meta"><span>{activity.sport}</span><span className={`availability ${activity.spots <= 0 ? 'full' : ''}`}><i />{activity.spots > 0 ? `${activity.spots} Plätze frei` : 'Ausgebucht'}</span></span>
      <strong className="activity-title">{activity.title}</strong>
      <span className="activity-place"><LocationRegular /><span>{activity.place} · {activity.distance.toLocaleString('de-DE')} km</span></span>
      <span className="activity-info"><span><CalendarLtrRegular />{activity.time}</span><span><ClockRegular />{activity.duration}</span></span>
      <span className="activity-foot"><span className="level-tag">{activity.level}</span><span className="activity-price">{activity.price}</span><span className="card-arrow" aria-hidden="true"><ArrowRightRegular /></span></span>
    </span>
  </button>
}
function DiscoverView({ filters, active, onFilter, day, onDay, time, onTime, distance, onDistance, onReset, items, onSelect, canCreate, onCreate, currentUser, hiddenEventIds, onDeleteEvent, onToggleVisibility, onHeatmap }) {
  return <>
    <PageHeading eyebrow="FINDE DEINEN FLOW" title={<>Rausgehen. Ausprobieren.<br className="desktop-break" /> Dranbleiben<span className="lime-period">.</span></>} description="Finde deine nächste Aktivität – ganz in deiner Nähe." action={<div className="discover-actions"><Button className="outline-button" icon={<SearchRegular />} onClick={onReset}>Filter zurücksetzen</Button>{canCreate && <Button className="lime-button" icon={<AddRegular />} onClick={onCreate}>Treffen erstellen</Button>}</div>} />
    <div className="discover-feature"><div><span className="feature-kicker"><SparkleRegular /> DEIN WOCHEN-HIGHLIGHT</span><h2>Bewegung verbindet.</h2><p>Von der ersten Runde bis zum neuen Lieblingssport – entdecke, was dich in Berlin bewegt.</p><button className="feature-button" onClick={() => onFilter('Joggen')}>Jogging-Highlights ansehen <ArrowRightRegular /></button></div><div className="feature-illustration" aria-hidden="true"><div className="feature-ring" /><span>MOVE<br />TOGETHER</span><i>✳</i></div></div>
    <div className="section-title-row activities-heading"><div><div className="eyebrow">AKTIVITÄTEN IN DEINER NÄHE</div><h2>Finde deinen nächsten Move</h2></div><span className="result-count">{items.length} {items.length === 1 ? 'Aktivität' : 'Aktivitäten'}</span></div>
    <div className="filter-row" role="group" aria-label="Nach Sportart filtern">{filters.map((filter) => <button key={filter} className={`filter-chip ${active === filter ? 'selected' : ''}`} aria-pressed={active === filter} onClick={() => onFilter(filter)}>{filter === 'Alle' ? 'Alle Sportarten' : filter}</button>)}</div>
    {['Joggen', 'Radfahren', 'Wandern'].includes(active) && <section className="discover-heatmap-card"><div><span className="feature-kicker"><LocationRegular /> DEINE OUTDOOR-SPUREN</span><strong>Deine {active === 'Joggen' ? 'Lauf-' : active === 'Radfahren' ? 'Rad-' : 'Wander-'}Heatmap</strong><small>Sieh dir an, welche Wege in unseren fiktiven Karten viele Sportbegeisterte nutzen.</small><button className="subtle-link" onClick={onHeatmap}>Alle Routen ansehen <ArrowRightRegular /></button></div><RouteMap activeSport={active === 'Joggen' ? 'Laufen' : active} compact /></section>}
    <div className="activity-filter-controls">
      <label>Tag<select aria-label="Nach Tag filtern" value={day} onChange={(event) => onDay(event.target.value)}><option>Alle</option><option>Heute</option><option>Morgen</option><option>Diese Woche</option></select></label>
      <label>Tageszeit<select aria-label="Nach Tageszeit filtern" value={time} onChange={(event) => onTime(event.target.value)}><option>Alle</option><option>Vormittag</option><option>Nachmittag</option><option>Abend</option></select></label>
      <label>Umkreis<select aria-label="Maximale Entfernung filtern" value={distance} onChange={(event) => onDistance(event.target.value)}><option value="3">Bis 3 km</option><option value="5">Bis 5 km</option><option value="10">Bis 10 km</option><option value="25">Bis 25 km</option></select></label>
    </div>
    {items.length ? <div className="activity-grid">{items.map((activity) => {
      const spots = Math.max(activity.spots - (activity.attendees ?? []).length, 0)
      const owner = activity.ownerId === currentUser.id
      return <article className="activity-listing" key={activity.id}>
        <ActivityCard activity={{ ...activity, spots }} onSelect={() => onSelect(activity)} />
        {(owner || currentUser.role === 'admin') && <div className="listing-controls">
          {currentUser.role === 'admin' && <button onClick={() => onToggleVisibility(activity.id)}>{hiddenEventIds.includes(activity.id) ? 'Wieder veröffentlichen' : 'Ausblenden'}</button>}
          {(owner || currentUser.role === 'admin') && <button className="danger-link" onClick={() => onDeleteEvent(activity.id)}><DeleteRegular /> {owner ? 'Treffen löschen' : 'Moderieren'}</button>}
        </div>}
      </article>
    })}</div> : <div className="empty-state"><span className="empty-icon"><CompassNorthwestRegular /></span><h3>Hier ist gerade noch Platz.</h3><p>Für diesen Filter gibt es keine Aktivitäten. Probiere eine andere Sportart.</p><button className="lime-button" onClick={onReset}>Filter zurücksetzen</button></div>}
    <p className="demo-caption">Alle Aktivitäten und Verfügbarkeiten sind fiktive Beispieldaten. Eine Auswahl ist keine echte Buchung.</p>
  </>
}
function ActivityDialog({ activity, attendees, booked, onClose, onBook, onLeave }) {
  const soldOut = activity.spots <= 0 && !booked
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="activity-dialog-title" tabIndex="-1"><button className="modal-close" onClick={onClose} aria-label="Dialog schließen">×</button><div className={`modal-art ${activity.tone}`}><span>{activity.sport.toUpperCase()}</span><strong><ActivitySportIcon sport={activity.sport} /></strong></div><div className="eyebrow">COMMUNITY-TREFFEN · DEMO</div><h2 id="activity-dialog-title">{activity.title}</h2><p className="modal-description">Komm vorbei, lerne neue Leute kennen und mach deinen Tag aktiv. Deine Teilnahme wird nur lokal in diesem Prototyp gespeichert.</p><div className="detail-list"><span><LocationRegular />{activity.place}</span><span><CalendarLtrRegular />{activity.time}</span><span><ClockRegular />{activity.duration}</span><span><GroupRegular />{activity.spots} Plätze frei · {activity.level}</span></div><div className="booking-summary"><span>Beitrag vor Ort (Demo)</span><strong>{activity.price}</strong></div><div className="attendee-preview"><strong>Dabei{attendees.length ? ` · ${attendees.length}` : ''}</strong><span>{attendees.length ? attendees.join(', ') : 'Noch keine Zusagen'}</span></div>{booked && <div className="inline-success"><CheckmarkCircleRegular /> Du bist für dieses Treffen eingetragen.</div>}<button className={booked ? 'outline-button full-button' : 'lime-button full-button'} onClick={booked ? onLeave : onBook} disabled={soldOut}>{booked ? 'Teilnahme zurückziehen' : soldOut ? 'Leider ausgebucht' : 'Teilnehmen'}</button><p className="modal-footnote">Demo-Zusage ohne echte Buchung oder Zahlung.</p></section></div>
}
function FriendsView({ friends, candidates, currentUser, onUpdateFriends, showToast }) {
  const [selectedFriendId, setSelectedFriendId] = useState('')
  const [friendTab, setFriendTab] = useState('Profil')
  const [friendQuery, setFriendQuery] = useState('')
  const [selectedCandidateId, setSelectedCandidateId] = useState('')
  const selectedFriend = friends.find((friend) => friend.id === selectedFriendId) ?? friends[0]
  const searchResults = friendQuery.trim()
    ? candidates.filter((candidate) => candidate.name.toLocaleLowerCase('de-DE').includes(friendQuery.trim().toLocaleLowerCase('de-DE')))
    : []
  const selectedCandidate = searchResults.find((candidate) => candidate.id === selectedCandidateId)
  const currentLevel = getLevelInfo(currentUser.xp).level
  const friendLevel = selectedFriend ? getLevelInfo(selectedFriend.xp).level : 1
  const currentStreakWeeks = getActivityStreakWeeks(currentUser)
  const friendStreakWeeks = selectedFriend ? getActivityStreakWeeks(selectedFriend) : 0
  const currentBadges = (currentUser.medals ?? []).length + Math.floor(currentLevel / 5)
  const friendBadges = selectedFriend ? (selectedFriend.medals ?? []).length + Math.floor(friendLevel / 5) : 0
  const currentRoutes = currentUser.routeSessions ?? []
  const friendRoutes = selectedFriend?.routeSessions ?? []
  const currentDistance = currentRoutes.reduce((sum, route) => sum + Number(route.distance || 0), 0)
  const friendDistance = friendRoutes.reduce((sum, route) => sum + Number(route.distance || 0), 0)
  const compareMetrics = [
    { label: 'Level', mine: currentLevel, theirs: friendLevel, suffix: '' },
    { label: 'Gesamt-XP', mine: currentUser.xp, theirs: selectedFriend?.xp ?? 0, suffix: ' XP' },
    { label: 'Aktivitäten', mine: currentUser.activityLogged ?? 0, theirs: selectedFriend?.activityLogged ?? 0, suffix: '' },
    { label: 'Outdoor-Distanz', mine: currentDistance, theirs: friendDistance, suffix: ' km' },
    { label: 'Aktive Wochen am Stück', mine: currentStreakWeeks, theirs: friendStreakWeeks, suffix: ' Wochen' },
    { label: 'Medaillen', mine: currentBadges, theirs: friendBadges, suffix: '' },
  ]
  const addFriend = () => {
    if (!selectedCandidate) return
    onUpdateFriends([...(currentUser.friendIds ?? []), selectedCandidate.id])
    setSelectedFriendId(selectedCandidate.id)
    setSelectedCandidateId('')
    setFriendQuery('')
    showToast(`${selectedCandidate.name} wurde zu deinen Freunden hinzugefügt.`)
  }
  if (!selectedFriend) return <section className="friends-view"><div className="friends-layout"><aside className="friends-list-panel panel"><div className="panel-heading"><div><span className="eyebrow">DEINE SPORT-CREW</span><h2>Freunde</h2></div><span className="result-count">0</span></div><FriendFinder query={friendQuery} onQueryChange={(value) => { setFriendQuery(value); setSelectedCandidateId('') }} results={searchResults} selectedId={selectedCandidateId} onSelect={setSelectedCandidateId} onAdd={addFriend} canAdd={Boolean(selectedCandidate)} /></aside><div className="friends-empty panel"><span className="stat-icon lime"><PeopleCommunityRegular /></span><h2>Deine Crew startet hier.</h2><p>Suche nach einem Namen und füge dein erstes Profil hinzu.</p></div></div></section>
  const medals = selectedFriend.medals ?? []
  const friendRouteList = friendRoutes.slice(0, 3)
  return <section className="friends-view">
    <div className="friends-layout">
      <aside className="friends-list-panel panel"><div className="panel-heading"><div><span className="eyebrow">DEINE SPORT-CREW</span><h2>Freunde</h2></div><span className="result-count">{friends.length}</span></div><p>Entdecke Profile und vergleiche eure Fortschritte.</p><div className="friend-list-items">{friends.map((friend) => <button key={friend.id} type="button" className={`friend-list-item ${friend.id === selectedFriend.id ? 'selected' : ''}`} onClick={() => setSelectedFriendId(friend.id)}><Avatar name={friend.name} initials={friend.initials} size={42} color="neutral" /><span><strong>{friend.name}</strong><small>{friend.city} · Level {getLevelInfo(friend.xp).level}</small></span><ChevronRightRegular /></button>)}</div><FriendFinder query={friendQuery} onQueryChange={(value) => { setFriendQuery(value); setSelectedCandidateId('') }} results={searchResults} selectedId={selectedCandidateId} onSelect={setSelectedCandidateId} onAdd={addFriend} canAdd={Boolean(selectedCandidate)} /><span className="demo-caption">Freundesprofile sind fiktive Demo-Daten.</span></aside>
      <div className="friend-detail-panel">
        <div className="friend-view-tabs" role="tablist" aria-label="Freundesansicht">{['Profil', 'Vergleich'].map((tab) => <button key={tab} role="tab" aria-selected={friendTab === tab} className={friendTab === tab ? 'active' : ''} onClick={() => setFriendTab(tab)}>{tab === 'Profil' ? <PersonRegular /> : <TrophyRegular />}{tab}</button>)}</div>
        {friendTab === 'Profil' ? <>
          <section className="friend-profile-hero panel"><Avatar name={selectedFriend.name} initials={selectedFriend.initials} size={66} color="neutral" /><div className="friend-profile-heading"><span className="eyebrow">SPORTQUEST COMMUNITY</span><h2>{selectedFriend.name}</h2><span><LocationRegular />{selectedFriend.city} · Level {friendLevel}</span></div><span className="friend-level-pill"><TrophyRegular /> Level {friendLevel}</span><p>{selectedFriend.bio || 'Gemeinsam aktiv bleiben und neue Lieblingssportarten entdecken.'}</p></section>
          <div className="friend-stat-grid"><article><span>XP gesamt</span><strong>{(selectedFriend.xp ?? 0).toLocaleString('de-DE')}</strong></article><article><span>Aktivitäten</span><strong>{selectedFriend.activityLogged ?? 0}</strong></article><article><span>Wochenserie</span><strong>{friendStreakWeeks} {friendStreakWeeks === 1 ? 'Woche' : 'Wochen'}</strong></article><article><span>Outdoor-Strecken</span><strong>{friendRoutes.length}</strong></article><article><span>Matches</span><strong>{selectedFriend.matchCount ?? 0}</strong></article><article><span>Medaillen</span><strong>{friendBadges}</strong></article></div>
          <section className="friend-section panel"><div className="panel-heading"><div><span className="eyebrow">ERKUNDE DIE MOVES</span><h3>Letzte Outdoor-Strecken</h3></div><span className="sport-tag">{friendDistance.toLocaleString('de-DE', { maximumFractionDigits: 1 })} km</span></div>{friendRouteList.length ? friendRouteList.map((route, index) => <div className="friend-route-row" key={`${route.area}-${route.sport}-${index}`}><span className="route-sport-icon">{route.sport === 'Radfahren' ? '↗' : route.sport === 'Wandern' ? '⌁' : '⌁'}</span><div><strong>{route.sport}</strong><small>{route.area || 'Outdoor-Route'}</small></div><b>{Number(route.distance || 0).toLocaleString('de-DE', { maximumFractionDigits: 1 })} km</b></div>) : <p className="empty-copy">Noch keine Outdoor-Strecken erfasst.</p>}</section>
          <section className="friend-section panel"><div className="panel-heading"><div><span className="eyebrow">SAMMLUNG</span><h3>Medaillen & Meilensteine</h3></div><span className="result-count">{friendBadges}</span></div><div className="friend-medal-grid">{medals.map((medal) => <div className="friend-medal-item" key={medal.id}><MedalArtwork rarity={medal.rarity} icon={medal.icon} /><span><strong>{medal.title}</strong><small>{medal.category}</small></span></div>)}{Array.from({ length: Math.floor(friendLevel / 5) }, (_, index) => (index + 1) * 5).map((milestone) => <div className="friend-medal-item" key={`level-${milestone}`}><MedalArtwork rarity={milestone >= 25 ? 'platinum' : milestone >= 15 ? 'gold' : milestone >= 10 ? 'silver' : 'bronze'} icon="★" /><span><strong>Level {milestone}</strong><small>Level-Meilenstein</small></span></div>)}{friendBadges === 0 && <p className="empty-copy">Die erste Medaille wartet schon.</p>}</div></section>
          <div className="friend-profile-footnote"><span><ShieldCheckmarkRegular /> {selectedFriend.premium ? 'Premium-Mitglied' : 'Community-Mitglied'}</span><span>{selectedFriend.challengeProgress ?? 0} Wochen-Challenges · {selectedFriend.monthProgress ?? 0} Monatsziel-Fortschritt</span></div>
        </> : <section className="friend-compare panel"><div className="friend-compare-heading"><span className="eyebrow">EURE MOVES IM DIREKTEN VERGLEICH</span><h2>Zusammen besser werden.</h2><p>Vergleicht eure Fortschritte – jeder Move zählt, unabhängig vom Level.</p></div><div className="friend-compare-people"><div><Avatar name={currentUser.name} initials={currentUser.initials} size={44} color="neutral" /><strong>{currentUser.name}</strong><small>Du · Level {currentLevel}</small></div><span>VS</span><div><Avatar name={selectedFriend.name} initials={selectedFriend.initials} size={44} color="neutral" /><strong>{selectedFriend.name}</strong><small>Level {friendLevel}</small></div></div><div className="friend-compare-metrics">{compareMetrics.map((metric) => { const max = Math.max(metric.mine, metric.theirs, 1); return <article className="friend-compare-row" key={metric.label}><div className="friend-compare-label"><strong>{metric.label}</strong><span>{metric.mine.toLocaleString('de-DE', { maximumFractionDigits: 1 })}{metric.suffix}<i> / </i>{metric.theirs.toLocaleString('de-DE', { maximumFractionDigits: 1 })}{metric.suffix}</span></div><div className="friend-compare-bars"><span className="mine" style={{ width: `${metric.mine / max * 100}%` }} /><span className="theirs" style={{ width: `${metric.theirs / max * 100}%` }} /></div></article>})}</div><div className="friend-compare-legend"><span><i className="mine" />{currentUser.name}</span><span><i className="theirs" />{selectedFriend.name}</span></div><div className="friend-compare-callout"><SparkleRegular /> Euer nächstes gemeinsames Ziel: eine neue Strecke zusammen entdecken.</div></section>}
      </div>
    </div>
  </section>
}

function FriendFinder({ query, onQueryChange, results, selectedId, onSelect, onAdd, canAdd }) {
  const resultLabelId = useId()
  return <section className="friend-finder" aria-labelledby={`${resultLabelId}-label`}>
    <label id={`${resultLabelId}-label`} htmlFor={`${resultLabelId}-input`}>Freunde hinzufügen</label>
    <input id={`${resultLabelId}-input`} type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Namen suchen …" autoComplete="off" />
    {query.trim() && <div className="friend-search-results" role="listbox" aria-label="Gefundene Nutzer">
      {results.length ? results.map((candidate) => <button key={candidate.id} type="button" role="option" aria-selected={selectedId === candidate.id} className={`friend-search-result ${selectedId === candidate.id ? 'selected' : ''}`} onClick={() => onSelect(candidate.id)}><Avatar name={candidate.name} initials={candidate.initials} size={34} color="neutral" /><span><strong>{candidate.name}</strong><small>{candidate.city} · Level {getLevelInfo(candidate.xp).level}</small></span>{selectedId === candidate.id && <CheckmarkCircleRegular />}</button>) : <p className="friend-search-empty">Keine passenden Nutzer gefunden.</p>}
    </div>}
    <button className="lime-button full-button friend-add-button" type="button" disabled={!canAdd} onClick={onAdd}>Ausgewählten Freund hinzufügen <AddRegular /></button>
  </section>
}

function ConnectView({ groups, setGroups, joinedGroups, setJoinedGroups, communities, joinedCommunities, setJoinedCommunities, activeGroup, setActiveGroup, activeChatGroup, messages, chatText, setChatText, submitMessage, onCreate, onCreateGroup, onInvite, showToast, currentUser, users, onUpdateFriends }) {
  const [connectTab, setConnectTab] = useState('Gruppen')
  const friendDirectory = [...new Map([...users, ...demoFriends]
    .filter((user) => user.id !== currentUser.id && user.role !== 'admin')
    .map((user) => [user.id, user])).values()]
  const friends = friendDirectory.filter((user) => (currentUser.friendIds ?? []).includes(user.id))
  return <>
    <PageHeading eyebrow="GEMEINSAM IN BEWEGUNG" title={<>Finde deine<br className="desktop-break" /> Sport-Crew<span className="lime-period">.</span></>} description="Gute Leute machen jeden Move besser." action={<Button className="outline-button" icon={<AddRegular />} onClick={onCreate}>Community erstellen</Button>} />
    <div className="tabs-row" role="tablist" aria-label="Connect Bereiche">{['Freunde', 'Gruppen', 'Communities'].map((tab) => <button role="tab" aria-selected={connectTab === tab} className={connectTab === tab ? 'active' : ''} onClick={() => setConnectTab(tab)} key={tab}>{tab}<span>{tab === 'Freunde' ? friends.length : tab === 'Gruppen' ? groups.length : communities.length}</span></button>)}</div>
    {connectTab === 'Freunde' ? <FriendsView friends={friends} candidates={friendDirectory.filter((user) => !(currentUser.friendIds ?? []).includes(user.id))} currentUser={currentUser} onUpdateFriends={onUpdateFriends} showToast={showToast} /> : connectTab === 'Gruppen' ? <>
      <div className="connect-layout"><div className="group-list-panel"><div className="panel-heading"><div><div className="eyebrow">OFFENE GRUPPEN</div><h2>Deine nächste Crew</h2></div><span className="live-tag"><i /> LOKAL</span></div>{groups.map((group) => { const joinedExtra = joinedGroups.includes(group.id) && group.ownerId !== currentUser.id ? 1 : 0; return <button key={group.id} className={`group-row ${activeGroup === group.id ? 'selected' : ''}`} onClick={() => setActiveGroup(group.id)}><span className="group-avatar">{group.sport.slice(0, 1)}</span><span className="group-text"><strong>{group.name}</strong><small>{group.sport} · {group.members + joinedExtra} Mitglieder</small></span><span className="group-unread">{activeGroup === group.id ? '●' : ''}</span></button> })}<button className="new-group-button" onClick={onCreateGroup}><AddRegular /> Eigene Gruppe erstellen</button></div>
      <div className="chat-panel"><div className="chat-head"><div className="group-avatar">{activeChatGroup?.sport.slice(0, 1) ?? 'S'}</div><div><strong>{activeChatGroup?.name ?? 'Sport-Crew'}</strong><small><span className="status-dot" /> {activeChatGroup ? activeChatGroup.members + (joinedGroups.includes(activeChatGroup.id) && activeChatGroup.ownerId !== currentUser.id ? 1 : 0) : 0} Mitglieder · Demo-Chat</small></div>{activeChatGroup && <button className="invite-button" onClick={() => onInvite(activeChatGroup)}><AddRegular /> Mitspieler einladen</button>}</div><div className="chat-day">HEUTE</div><div className="chat-messages" aria-live="polite" aria-relevant="additions">{messages.map((message, index) => <div key={`${message.from}-${index}`} className={`chat-message ${message.mine ? 'mine' : ''}`}><span className="message-author">{message.from}</span><p>{message.text}</p><small>{message.mine ? 'gerade eben' : 'vor 12 Min.'}</small></div>)}<div className="demo-reply"><SparkleRegular /> Beispiel-Chat – Nachrichten werden nur lokal angezeigt.</div></div><form className="chat-compose" onSubmit={submitMessage}><label className="sr-only" htmlFor="chat-input">Demo-Nachricht schreiben</label><input id="chat-input" value={chatText} onChange={(event) => setChatText(event.target.value)} placeholder="Schreib deiner Crew ..." /><button type="submit" disabled={!chatText.trim()} aria-label="Demo-Nachricht senden"><ArrowRightRegular /></button></form></div></div>
      <div className="section-title-row community-subheading"><div><div className="eyebrow">SEI DABEI</div><h2>Offene Gruppen in deiner Nähe</h2></div><span className="result-count">Berlin</span></div>
      <div className="open-groups-grid">{groups.map((group) => { const joined = joinedGroups.includes(group.id); const joinedExtra = joined && group.ownerId !== currentUser.id ? 1 : 0; const openSpots = Math.max(group.openSpots - joinedExtra, 0); return <article className="open-group-card" key={`open-${group.id}`}><div className="open-group-top"><span className="group-avatar large">{group.sport.slice(0, 1)}</span><span className="sport-tag">{group.sport}</span></div><h3>{group.name}</h3><p>{group.description}</p><div className="member-line"><GroupRegular />{group.members + joinedExtra} Mitglieder <span>· {openSpots} Plätze frei</span></div><div className="group-actions"><button className={joined ? 'joined-button' : 'join-button'} disabled={!joined && openSpots === 0} onClick={() => { setJoinedGroups((current) => current.includes(group.id) ? current.filter((id) => id !== group.id) : [...current, group.id]); showToast(joined ? 'Gruppe verlassen (Demo)' : 'Du bist dabei! (Demo)') }}>{joined ? <><CheckmarkCircleRegular /> Beigetreten</> : openSpots === 0 ? 'Ausgebucht' : 'Teilnehmen'}</button><button className="invite-link" onClick={() => onInvite(group)}>Einladen</button>{(group.ownerId === currentUser.id || currentUser.role === 'admin') && <button className="invite-link danger-link" onClick={() => { setGroups((current) => current.filter((item) => item.id !== group.id)); showToast('Gruppe entfernt.') }}>Gruppe löschen</button>}</div></article> })}</div>
    </> : <><div className="community-intro"><span className="stat-icon lime"><PeopleCommunityRegular /></span><div><strong>Dein Sport hat eine Community.</strong><p>Finde Gleichgesinnte, teile deine Leidenschaft und bleib zusammen dran.</p></div><button className="lime-button" onClick={onCreate}><AddRegular /> Community erstellen</button></div><div className="community-grid">{communities.map((community) => { const joined = joinedCommunities.includes(community.id); return <article className="community-card" key={community.id}><div className="community-cover"><span className="community-initials">{community.initials}</span><span className="sport-tag">{community.sport}</span><PeopleCommunityRegular /></div><div className="community-card-body"><h3>{community.name}</h3><div className="community-location"><LocationRegular />{community.location}</div><p>{community.detail}</p><div className="community-footer"><span><GroupRegular />{community.members + (joined ? 1 : 0)} Mitglieder</span><button className={joined ? 'joined-button' : 'join-button'} onClick={() => { setJoinedCommunities((current) => current.includes(community.id) ? current.filter((id) => id !== community.id) : [...current, community.id]); showToast(joined ? 'Community verlassen (Demo)' : 'Community beigetreten (Demo)') }}>{joined ? 'Dabei' : 'Beitreten'}</button></div></div></article> })}</div></>}
    <p className="demo-caption">Gruppen, Mitglieder und Nachrichten sind vollständig fiktiv und bleiben in dieser Demo.</p>
  </>
}
function CreateCommunityDialog({ value, onChange, onClose, onCreate }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal-card create-modal" role="dialog" aria-modal="true" aria-labelledby="create-title" tabIndex="-1"><button className="modal-close" onClick={onClose} aria-label="Dialog schließen">×</button><span className="modal-symbol"><PeopleCommunityRegular /></span><div className="eyebrow">DEINE LEUTE. DEIN SPORT.</div><h2 id="create-title">Community erstellen</h2><p className="modal-description">Starte einen Ort für Menschen, die deinen Sport genauso lieben wie du.</p><label htmlFor="community-name">Name deiner Community</label><input id="community-name" className="modal-input" value={value} onChange={(event) => onChange(event.target.value)} maxLength={40} placeholder="z. B. Morning Run Club" /><p className="field-note">Wird nur lokal in dieser Demo angelegt.</p><button className="lime-button full-button" disabled={!value.trim()} onClick={onCreate}>Community lokal erstellen</button><button className="cancel-button" onClick={onClose}>Abbrechen</button></section></div>
}
function ProgressModeSwitch({ activeTab, setProgressTab }) {
  const tabs = [
    { id: 'Fortschritt', icon: <TrophyRegular /> },
    { id: 'Challenge-Board', label: 'Challenges', icon: <SparkleRegular /> },
    { id: 'Aktivitäten', icon: <CalendarLtrRegular /> },
    { id: 'Heatmap', icon: <LocationRegular /> },
  ]
  return <div className="progress-mode-switch" role="tablist" aria-label="Fortschritt, Challenges, Aktivitäten oder Heatmap">
    {tabs.map((tab) => <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setProgressTab(tab.id)}>{tab.icon}{tab.label ?? tab.id}</button>)}
  </div>
}

function ProgressView({ user, users, streakWeeks, xp, leaderboardTab, setLeaderboardTab, challengeProgress, monthProgress, showToast, progressTab, setProgressTab, challengeFilter, setChallengeFilter, onRecordRoute, onRecordActivity, onClaimChallenge, onDownloadCertificate, onCopyDiscountCode, partnerChallenges }) {
  const { level, currentXp: levelXp, nextLevelXp, nextLevelTotalXp } = getLevelInfo(xp)
  const challengeCatalog = getChallengeCatalog(user, partnerChallenges, challengeContext)
  const claimedChallenges = user.claimedChallenges ?? []
  const medals = user.medals ?? []
  const medalsEarned = medals.length || claimedChallenges.length
  const levelMedals = Array.from({ length: Math.floor(level / 5) }, (_, index) => (index + 1) * 5)
  const friendsById = new Map([...users, ...demoFriends]
    .filter((friend) => friend.id !== user.id && friend.role !== 'admin')
    .map((friend) => [friend.id, friend]))
  const activityFriends = [...friendsById.values()]
  if (progressTab === 'Aktivitäten') {
    return <>
      <PageHeading eyebrow="DEIN SPORT-VERLAUF" title={<>Jeder Move<br className="desktop-break" /> bleibt in Erinnerung<span className="lime-period">.</span></>} description="Sieh im Kalender, wann du aktiv warst, wer dich begleitet hat und welche Ziele du erreicht hast." action={<span className="period-pill"><CalendarLtrRegular /> {getActivityHistory(user).length} Einträge</span>} />
      <ProgressModeSwitch activeTab={progressTab} setProgressTab={setProgressTab} />
      <ActivityHistoryView user={user} friends={activityFriends} onRecordActivity={onRecordActivity} />
    </>
  }
  if (progressTab === 'Challenge-Board') {
    return <ChallengeBoardView challenges={challengeCatalog} claimed={claimedChallenges} medals={medals} levelMilestones={levelMedals} filter={challengeFilter} setFilter={setChallengeFilter} onClaim={onClaimChallenge} onDownloadCertificate={onDownloadCertificate} onCopyDiscountCode={onCopyDiscountCode} setProgressTab={setProgressTab} />
  }
  const rankings = {
    Freunde: [['1', 'Mia Chen', '2.840 XP', 'MC'], ['2', user.name, `${xp.toLocaleString('de-DE')} XP`, user.initials], ['3', 'Jonas Weber', '2.160 XP', 'JW'], ['4', 'Samira Ali', '1.920 XP', 'SA']],
    'Lokale Community': [['1', 'Mia Chen', '2.840 XP', 'MC'], ['2', 'Jonas Weber', '2.610 XP', 'JW'], ['3', user.name, `${xp.toLocaleString('de-DE')} XP`, user.initials], ['4', 'Lea Fischer', '2.250 XP', 'LF']],
    Gesamtrangliste: [['1', 'Mia Chen', '18.840 XP', 'MC'], ['2', 'Jonas Weber', '17.610 XP', 'JW'], ['3', user.name, `${xp.toLocaleString('de-DE')} XP`, user.initials], ['4', 'Samira Ali', '15.920 XP', 'SA']],
  }[leaderboardTab]
  return <>
    <PageHeading
      eyebrow={progressTab === 'Heatmap' ? 'DEINE OUTDOOR-MOMENTE' : 'KLEINE SCHRITTE, GROSSE MOVES'}
      title={progressTab === 'Heatmap' ? <>Deine Wege.<br className="desktop-break" /> Deine Stadt<span className="lime-period">.</span></> : <>Du bist auf dem<br className="desktop-break" /> richtigen Weg<span className="lime-period">.</span></>}
      description={progressTab === 'Heatmap' ? 'Jede draußen gelaufene, geradelte oder gewanderte Strecke färbt deine Karte.' : 'Jeder Move zählt. Schau, wie weit du schon gekommen bist.'}
      action={progressTab === 'Fortschritt' && <span className="period-pill"><span className="status-dot" /> Diese Woche</span>}
    />
    <ProgressModeSwitch activeTab={progressTab} setProgressTab={setProgressTab} />
    {progressTab === 'Heatmap' ? <OutdoorHeatmap sessions={user.routeSessions ?? []} onRecordRoute={onRecordRoute} /> : <>
      <div className="progress-overview"><div className="progress-main"><div className="eyebrow">DEIN LEVEL</div><div className="level-display"><span>{String(level).padStart(2, '0')}</span><div><strong>Level {level} · In Bewegung</strong><small>{xp.toLocaleString('de-DE')} XP insgesamt</small></div><span className="level-star"><TrophyRegular /></span></div><ProgressBar className="xp-progress" value={levelXp / nextLevelXp} max={1} aria-label={`${Math.round(levelXp / nextLevelXp * 100)} Prozent bis Level ${level + 1}`} /><div className="xp-caption"><span>{levelXp.toLocaleString('de-DE')} / {nextLevelXp.toLocaleString('de-DE')} XP in diesem Level</span><span>Noch {(nextLevelXp - levelXp).toLocaleString('de-DE')} XP · Level {level + 1} ab {nextLevelTotalXp.toLocaleString('de-DE')} Gesamt-XP</span></div></div><div className="progress-side"><div><span className="stat-icon lime"><FlashRegular /></span><strong>{streakWeeks} {streakWeeks === 1 ? 'Woche' : 'Wochen'}</strong><small>Aktive Wochen am Stück</small></div><div><span className="stat-icon"><TrophyRegular /></span><strong>{user.activityLogged}</strong><small>Aktivitäten gesamt</small></div></div></div>
      <section className="xp-earnings panel" aria-labelledby="xp-earnings-title"><div className="xp-earnings-heading"><div><span className="eyebrow">KLAR & TRANSPARENT</span><h2 id="xp-earnings-title">So sammelst du XP</h2></div><span>Level brauchen immer mehr XP · Gesamt-XP bleiben</span></div><div className="xp-earnings-grid"><div><span>✓</span><strong>Trainingseinheit</strong><small>Workout abgeschlossen</small><b>+50 XP</b></div><div><span>⚽</span><strong>Match</strong><small>Spiel abgeschlossen</small><b>+100 XP</b></div><div><span>↗</span><strong>Outdoor-Route</strong><small>50 XP + 10 XP je km</small><b>ab +55 XP</b></div><div><span>☀</span><strong>Tages-Check-in</strong><small>Einmal pro Tag</small><b>+20 XP</b></div><div><span>✦</span><strong>Challenge</strong><small>Nach Abschluss einlösen</small><b>80–350 XP</b></div></div><p className="level-rule-note">Regel: Start bei 1.000 XP, jede Stufe steigt um 25 % und wird auf 100 XP aufgerundet. Beispiel: 1.000 → 1.300 → 1.600 → 2.000 → 2.500 XP.</p></section>
      <LevelMedalCollection users={users} currentUser={user} earnedMilestones={levelMedals} />
      <div className="progress-columns"><section className="challenge-panel"><div className="panel-heading"><div><div className="eyebrow">DEIN FOKUS</div><h2>Challenges</h2></div><span className="challenge-count">{challengeCatalog.filter((challenge) => challenge.completed && !claimedChallenges.includes(challenge.id)).length} bereit</span></div><article className="challenge-card"><div className="challenge-top"><span className="challenge-icon"><FlashRegular /></span><span className="time-left">Wöchentlich</span></div><h3>Woche in Bewegung</h3><p>Mach diese Woche 5 Aktivitäten und bleib in deinem Flow.</p><div className="challenge-progress-line"><span>Fortschritt</span><strong>{challengeProgress} / 5</strong></div><div className="small-progress"><span style={{ width: `${challengeProgress * 20}%` }} /></div><div className="challenge-bottom"><span><TrophyRegular /> <strong>+200 XP</strong> + Medaille</span><button onClick={() => { setChallengeFilter('Alle'); setProgressTab('Challenge-Board') }}>{challengeProgress >= 5 ? 'Belohnung sichern' : 'Board öffnen'} <ArrowRightRegular /></button></div></article><article className="mini-challenge"><span className="mini-challenge-icon"><FlashRegular /></span><div><strong>Multi-Sport im Monat</strong><p>Erreiche 12 Sport-Sessions innerhalb dieses Monats.</p><div className="small-progress"><span style={{ width: `${Math.min(monthProgress / 12 * 100, 100)}%` }} /></div></div><span className="mini-challenge-count">{monthProgress}/12</span></article><button className="challenge-board-link" onClick={() => { setChallengeFilter('Alle'); setProgressTab('Challenge-Board') }}><SparkleRegular /> Alle Ziele & Medaillen ansehen <ArrowRightRegular /></button></section>
        <section className="leaderboard-panel"><div className="panel-heading"><div><div className="eyebrow">GEMEINSAM BESSER</div><h2>Leaderboard</h2></div><span className="rank-period">Diese Woche</span></div><div className="tabs-row small-tabs" role="tablist" aria-label="Leaderboard anzeigen">{['Freunde', 'Lokale Community', 'Gesamtrangliste'].map((tab) => <button key={tab} role="tab" aria-selected={leaderboardTab === tab} className={leaderboardTab === tab ? 'active' : ''} onClick={() => setLeaderboardTab(tab)}>{tab}</button>)}</div><div className="ranking-list">{rankings.map(([rank, name, score, initials]) => <div className={`ranking-row ${name === user.name ? 'self' : ''}`} key={`${leaderboardTab}-${rank}`}><span className={`rank-number ${rank === '1' ? 'first' : ''}`}>{rank}</span><Avatar name={name} initials={initials} size={34} color="neutral" /><span className="rank-name">{name}{name === user.name && <small>Du</small>}</span><strong>{score}</strong></div>)}</div><button className="leaderboard-link" onClick={() => showToast('Das ist deine aktuelle Demo-Rangliste')}>Rangliste ansehen <ArrowRightRegular /></button></section></div>
      <section className="medal-preview panel"><div className="medal-preview-copy"><span className="eyebrow">CHALLENGE-AUSZEICHNUNGEN</span><h2>{medalsEarned} Challenge-Medaillen</h2><p>Deine Level-Medaillen findest du oben. Hier gibt es Urkunden und Partner-Rabatte.</p></div><div className="medal-preview-icons">{medals.slice(-4).map((medal) => <span key={medal.id} title={medal.medal}>{medal.icon}</span>)}{medalsEarned === 0 && <span className="medal-placeholder">✦</span>}</div><button className="outline-button" onClick={() => { setChallengeFilter('Sammlung'); setProgressTab('Challenge-Board') }}>Sammlung öffnen <ArrowRightRegular /></button></section>
      <p className="demo-caption">XP, Auszeichnungen und Ranglisten sind an deine Demo-Aktivitäten gekoppelt und lokal gespeichert.</p>
    </>}
  </>
}

function LevelMedalCollection({ users, currentUser, earnedMilestones }) {
  const nextMilestone = (Math.floor(getLevelInfo(currentUser.xp).level / 5) + 1) * 5
  const comparison = users
    .map((user) => {
      const { level } = getLevelInfo(user.xp)
      const levelMedals = Math.floor(level / 5)
      const challengeMedals = (user.medals ?? []).length
      return { ...user, level, levelMedals, medals: levelMedals + challengeMedals, challengeMedals }
    })
    .sort((a, b) => b.medals - a.medals || b.level - a.level || b.xp - a.xp)
  return <section className="level-medal-collection panel">
    <div className="level-medal-heading"><div><span className="eyebrow">LEVEL-MEILENSTEINE</span><h2>Deine Level-Medaillen</h2><p>Automatisch bei Level 5, 10, 15 und jedem weiteren fünften Level.</p></div><span className="level-medal-total">{earnedMilestones.length}<small> gesammelt</small></span></div>
    <div className="level-medal-content">
      <div className="level-medal-grid" aria-label="Deine Level-Medaillen">
        {earnedMilestones.map((milestone) => <div className="level-medal-item earned" key={milestone}><MedalArtwork rarity={milestone >= 25 ? 'platinum' : milestone >= 15 ? 'gold' : milestone >= 10 ? 'silver' : 'bronze'} icon="★" /><strong>Level {milestone}</strong><small>Meilenstein erreicht</small></div>)}
        <div className="level-medal-item locked"><span>🔒</span><strong>Level {nextMilestone}</strong><small>Noch {Math.max(nextMilestone - getLevelInfo(currentUser.xp).level, 0)} Level</small></div>
      </div>
      <div className="level-medal-leaderboard"><div className="eyebrow">VERGLEICH IN DEINER DEMO-COMMUNITY</div>{comparison.map((user, index) => <div className={`level-medal-rank ${user.id === currentUser.id ? 'self' : ''}`} key={user.id}><span>{index + 1}</span><Avatar name={user.name} initials={user.initials} size={30} color="neutral" /><strong>{user.name}{user.id === currentUser.id && <small>Du</small>}</strong><span className="level-medal-rank-count"><b>{user.medals}</b><small>{user.levelMedals} Level · {user.challengeMedals} Challenge</small></span><span>Lv. {user.level}</span></div>)}</div>
    </div>
  </section>
}

function MedalArtwork({ rarity = 'bronze', icon = '✦', large = false }) {
  const instanceId = useId().replace(/:/g, '')
  const gradientId = `medal-${instanceId}`
  return <svg className={`medal-artwork ${rarity} ${large ? 'large' : ''}`} viewBox="0 0 100 118" role="img" aria-label={`${rarity}farbene Medaille`}>
    <defs>
      <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor={rarity === 'bronze' ? '#f6c889' : rarity === 'silver' ? '#f5f7fb' : rarity === 'gold' ? '#fff3a6' : '#e5e8ff'} />
        <stop offset=".52" stopColor={rarity === 'bronze' ? '#ae633a' : rarity === 'silver' ? '#8794a5' : rarity === 'gold' ? '#d99b24' : '#7585da'} />
        <stop offset="1" stopColor={rarity === 'bronze' ? '#6d382b' : rarity === 'silver' ? '#46536a' : rarity === 'gold' ? '#85551b' : '#3949a3'} />
      </linearGradient>
    </defs>
    <path d="M29 70 17 111l31-13 13 14 9-42" fill={`url(#${gradientId})`} stroke="rgba(255,255,255,.42)" strokeWidth="2" />
    <path d="m71 70 12 41-31-13-13 14-9-42" fill={`url(#${gradientId})`} stroke="rgba(255,255,255,.42)" strokeWidth="2" opacity=".82" />
    <circle cx="50" cy="45" r="36" fill={`url(#${gradientId})`} stroke="rgba(255,255,255,.74)" strokeWidth="3" />
    <circle cx="50" cy="45" r="28" fill="none" stroke="rgba(255,255,255,.54)" strokeWidth="1.5" />
    <path d="m50 25 6 13 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2z" fill="rgba(255,255,255,.24)" />
    <text x="50" y="55" textAnchor="middle" fill="#fff" fontSize="21" fontWeight="800" fontFamily="sans-serif">{icon}</text>
  </svg>
}

function ChallengeBoardView({ challenges, claimed, medals, levelMilestones, filter, setFilter, onClaim, onDownloadCertificate, onCopyDiscountCode, setProgressTab }) {
  const readyCount = challenges.filter((challenge) => challenge.completed && !claimed.includes(challenge.id)).length
  const filters = ['Alle', 'Offen', 'Abgeschlossen', 'Sammlung']
  const challengeTypes = ['Alle', 'Solo', 'Community', 'Partner']
  const [categoryFilter, setCategoryFilter] = useState('Alle Kategorien')
  const [challengeTypeFilter, setChallengeTypeFilter] = useState('Alle')
  const [sortOrder, setSortOrder] = useState('Empfohlen')
  const [selectedChallenge, setSelectedChallenge] = useState(null)
  const collectionChallenges = [
    ...medals.map((medal) => ({
    ...medal,
    target: 1,
    progress: 1,
    completed: true,
    })),
    ...levelMilestones.map((level) => ({
      id: `level-medal-${level}`,
      title: `Level ${level}`,
      description: `Du hast Level ${level} erreicht und dir diese Auszeichnung verdient.`,
      category: 'Level',
      icon: '★',
      medal: 'Level-Meister:in',
      rarity: level >= 25 ? 'platinum' : level >= 15 ? 'gold' : level >= 10 ? 'silver' : 'bronze',
      badgeType: 'level',
      reward: 0,
      target: 1,
      progress: 1,
      completed: true,
    })),
  ]
  const sourceChallenges = filter === 'Sammlung' ? collectionChallenges : challenges
  const categories = ['Alle Kategorien', ...new Set(sourceChallenges.map((challenge) => challenge.category).filter(Boolean))]
  const visibleChallenges = sourceChallenges
    .filter((challenge) => {
      if (filter === 'Offen' && challenge.completed) return false
      if (filter === 'Abgeschlossen' && !challenge.completed) return false
      if (categoryFilter !== 'Alle Kategorien' && challenge.category !== categoryFilter) return false
      const challengeType = challenge.category === 'Partner-Challenge'
        ? 'Partner'
        : challenge.category === 'Community' ? 'Community' : 'Solo'
      return challengeTypeFilter === 'Alle' || challengeType === challengeTypeFilter
    })
    .sort((a, b) => {
      if (sortOrder === 'Höchste XP zuerst') return b.reward - a.reward
      if (sortOrder === 'Bald abgeschlossen') {
        return (b.progress / b.target) - (a.progress / a.target) || b.reward - a.reward
      }
      const aReady = a.completed && !claimed.includes(a.id) ? 1 : 0
      const bReady = b.completed && !claimed.includes(b.id) ? 1 : 0
      return bReady - aReady || (b.progress / b.target) - (a.progress / a.target) || b.reward - a.reward
    })
  return <>
    <PageHeading eyebrow="DEIN WEG. DEINE AUSZEICHNUNGEN." title={<>Jeder Move<br className="desktop-break" /> wird Geschichte<span className="lime-period">.</span></>} description="Finde ein Ziel, sieh deinen Fortschritt und sichere deine XP direkt nach dem Abschluss." action={<span className="period-pill"><TrophyRegular /> {claimed.length} gesammelt</span>} />
    <ProgressModeSwitch activeTab="Challenge-Board" setProgressTab={setProgressTab} />
    <div className="challenge-board-hero">
      <div className="challenge-hero-copy"><span className="feature-kicker"><SparkleRegular /> SPORTQUEST CHALLENGE BOARD</span><h2>Dein nächstes Ziel wartet.</h2><p>Wähle eine Challenge, verfolge jeden Schritt und löse sie nach dem Abschluss gegen XP und eine Medaille ein.</p><div className="challenge-hero-stats"><span><strong>{readyCount}</strong> bereit zum Einlösen</span><span><strong>{challenges.length}</strong> Ziele für dich</span><span><strong>{claimed.length}</strong> Medaillen gesammelt</span></div></div>
      <div className="challenge-hero-medal" aria-hidden="true"><TrophyRegular /><span>{String(claimed.length).padStart(2, '0')}</span><small>GESAMMELT</small></div>
    </div>
    <section className="challenge-board-section">
      <div className="challenge-board-heading"><div><span className="eyebrow">{filter === 'Sammlung' ? 'DEINE PERSÖNLICHE TROPHÄENWAND' : 'DEINE ZIELE & ERFOLGE'}</span><h2>{filter === 'Sammlung' ? 'Medaillen & Urkunden' : 'Challenge Board'}</h2></div><span className="result-count">{visibleChallenges.length} {visibleChallenges.length === 1 ? 'Challenge' : 'Challenges'}</span></div>
      <div className="challenge-board-filters" role="group" aria-label="Challenges nach Status filtern">{filters.map((item) => <button key={item} type="button" aria-pressed={filter === item} className={filter === item ? 'selected' : ''} onClick={() => { setFilter(item); setCategoryFilter('Alle Kategorien') }}>{item}{item === 'Sammlung' && <span>{claimed.length}</span>}{item === 'Abgeschlossen' && <span>{challenges.filter((challenge) => challenge.completed).length}</span>}</button>)}</div>
      <div className="challenge-board-filters challenge-category-filters" role="group" aria-label="Challenges nach Kategorie filtern">{challengeTypes.map((item) => <button key={item} type="button" aria-pressed={challengeTypeFilter === item} className={challengeTypeFilter === item ? 'selected' : ''} onClick={() => setChallengeTypeFilter(item)}>{item}</button>)}</div>
      <div className="challenge-tools">
        <label>Kategorie<select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
        <label>Sortieren<select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}><option>Empfohlen</option><option>Höchste XP zuerst</option><option>Bald abgeschlossen</option></select></label>
      </div>
      {visibleChallenges.length ? <div className="challenge-board-grid">{visibleChallenges.map((challenge) => {
        const isClaimed = challenge.badgeType === 'level' || claimed.includes(challenge.id)
        const progressPercent = Math.min(challenge.progress / challenge.target * 100, 100)
        return <article className={`quest-card ${challenge.completed ? 'completed' : ''} ${isClaimed ? 'claimed' : ''}`} key={challenge.id}>
          <div className="quest-card-top"><span className={`quest-medal ${challenge.completed ? 'unlocked' : ''}`}><MedalArtwork rarity={challenge.rarity} icon={challenge.icon} /></span><span className="quest-category">{challenge.category}</span></div>
          <h3>{challenge.title}</h3><p>{challenge.description}</p>
          {challenge.partner && <div className="quest-partner"><span>Partnerangebot · Demo</span><strong>{challenge.partner}</strong></div>}
          <div className="quest-progress-meta"><span>{isClaimed ? `Eingelöst${challenge.claimedAt ? ` · ${challenge.claimedAt}` : ''}` : challenge.completed ? 'Freigeschaltet' : 'Dein Fortschritt'}</span><strong>{challenge.progress.toLocaleString('de-DE', { maximumFractionDigits: 1 })} / {challenge.target.toLocaleString('de-DE')} {challenge.unit}</strong></div>
          <div className="quest-progress-track"><span style={{ width: `${progressPercent}%` }} /></div>
          <div className="quest-reward-line"><span><TrophyRegular /> {challenge.badgeType === 'level' ? 'Level-Auszeichnung' : challenge.discount ? `${challenge.discount}% Rabatt bei ${challenge.partner}` : challenge.medal}</span><strong>{challenge.badgeType === 'level' ? 'Medaille' : `+${challenge.reward} XP`}</strong></div>
          <button className="quest-details-button" type="button" onClick={() => setSelectedChallenge(challenge)}>Details ansehen <ArrowRightRegular /></button>
          {isClaimed && challenge.discount
            ? <div className="voucher-box"><span>Dein Rabattcode bei {challenge.partner}</span><strong>{challenge.couponCode}</strong><button className="certificate-button" onClick={() => onCopyDiscountCode(challenge.couponCode)}><CheckmarkCircleRegular /> Rabattcode kopieren</button></div>
            : isClaimed
              ? <button className="certificate-button" onClick={() => onDownloadCertificate(challenge)}><CheckmarkCircleRegular /> Urkunde herunterladen</button>
              : <button className={`quest-claim-button ${challenge.completed ? 'ready' : ''}`} disabled={!challenge.completed} onClick={() => onClaim(challenge)}>{challenge.completed ? challenge.discount ? 'Rabatt sichern' : 'Medaille sichern' : challenge.unit === 'km' ? `Noch ${Math.max(challenge.target - challenge.progress, 0).toLocaleString('de-DE', { maximumFractionDigits: 1 })} km` : `Noch ${Math.max(challenge.target - challenge.progress, 0).toLocaleString('de-DE')} ${challenge.target - challenge.progress === 1 ? challenge.unit : challenge.unitPlural}`} {challenge.completed && <ArrowRightRegular />}</button>}
        </article>
      })}</div> : <div className="challenge-empty"><span>✦</span><h3>{filter === 'Sammlung' ? 'Deine Sammlung wartet auf den ersten Erfolg.' : 'Keine passenden Challenges gefunden.'}</h3><p>{filter === 'Sammlung' ? 'Schließe eine Challenge ab und sichere deine erste Medaille mit persönlicher Urkunde.' : 'Ändere deine Kategorie- oder Sortierfilter, um weitere Ziele zu entdecken.'}</p><button className="outline-button" onClick={() => { setFilter('Alle'); setCategoryFilter('Alle Kategorien'); setChallengeTypeFilter('Alle') }}>Filter zurücksetzen <ArrowRightRegular /></button></div>}
    </section>
    <p className="demo-caption">Partnernamen und Challenges sind fiktive Beispieldaten. XP werden nach dem Einlösen gutgeschrieben; Urkunden lassen sich als Demo-Datei herunterladen.</p>
    {selectedChallenge && <div className="modal-backdrop challenge-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedChallenge(null) }}><section className="modal-card challenge-detail-modal" role="dialog" aria-modal="true" aria-labelledby="challenge-detail-title" tabIndex="-1"><button className="modal-close" onClick={() => setSelectedChallenge(null)} aria-label="Dialog schließen">×</button><div className="challenge-modal-art"><MedalArtwork rarity={selectedChallenge.rarity} icon={selectedChallenge.icon} large /></div><div className="eyebrow">{selectedChallenge.category} · {selectedChallenge.rarity === 'platinum' ? 'PLATIN' : selectedChallenge.rarity?.toUpperCase() ?? 'AUSZEICHNUNG'}</div><h2 id="challenge-detail-title">{selectedChallenge.title}</h2><p className="modal-description">{selectedChallenge.description}</p><div className="challenge-detail-grid"><div><span>Ziel</span><strong>{selectedChallenge.goalType === 'distance' ? `${selectedChallenge.target} km ${selectedChallenge.activity}` : `${selectedChallenge.target} ${selectedChallenge.unitPlural ?? selectedChallenge.unit}`}</strong></div><div><span>Dein Fortschritt</span><strong>{selectedChallenge.progress.toLocaleString('de-DE', { maximumFractionDigits: 1 })} / {selectedChallenge.target.toLocaleString('de-DE')} {selectedChallenge.unit}</strong></div><div><span>Gültig</span><strong>{selectedChallenge.startAt ? new Intl.DateTimeFormat('de-DE').format(new Date(`${selectedChallenge.startAt}T00:00:00`)) : 'Ab sofort'} – {selectedChallenge.expiresAt ? new Intl.DateTimeFormat('de-DE').format(new Date(`${selectedChallenge.expiresAt}T00:00:00`)) : 'Unbegrenzt'}</strong></div><div><span>Abschlussfenster</span><strong>{selectedChallenge.completionWindowDays ? `${selectedChallenge.completionWindowDays} Tage ab erster Aktivität` : 'Kein Zeitlimit'}</strong></div></div>{selectedChallenge.partner && <div className="challenge-detail-partner"><div><span>Partner-Angebot</span><strong>{selectedChallenge.partner}</strong>{selectedChallenge.discount && <small>{selectedChallenge.discount}% Rabatt auf den nächsten Einkauf</small>}</div>{selectedChallenge.website && /^https?:\/\//i.test(selectedChallenge.website) && <a className="outline-button" href={selectedChallenge.website} target="_blank" rel="noreferrer">Webseite ↗</a>}</div>}<div className="challenge-detail-reward"><span><TrophyRegular /> {selectedChallenge.badgeType === 'level' ? selectedChallenge.medal : selectedChallenge.discount ? 'Partner-Rabatt + Medaille' : selectedChallenge.medal}</span><strong>{selectedChallenge.badgeType === 'level' ? 'Auszeichnung' : `+${selectedChallenge.reward} XP`}</strong></div>{selectedChallenge.completed && selectedChallenge.badgeType !== 'level' && !claimed.includes(selectedChallenge.id) && <button className="lime-button full-button" onClick={() => onClaim(selectedChallenge)}>{selectedChallenge.discount ? 'Rabatt & XP sichern' : 'Medaille & XP sichern'} <ArrowRightRegular /></button>}<p className="modal-footnote">Partner und Belohnungen sind fiktive Demo-Inhalte.</p></section></div>}
  </>
}

const heatmapAreas = [
  { id: 'park', name: 'Stadtpark', place: 'Musterpark', kind: 'park', routes: [
    { name: 'Parkring', sport: 'Laufen', count: 42, path: 'M 57 159 C 63 91 133 43 219 39 C 322 27 443 46 524 104 C 570 138 558 210 493 250 C 405 300 255 280 153 253 C 87 235 47 200 57 159Z' },
    { name: 'Teichrunde', sport: 'Laufen', count: 31, path: 'M 235 111 C 242 79 277 62 313 68 C 354 74 379 99 377 129 C 375 163 344 184 307 183 C 269 183 238 160 234 132Z' },
    { name: 'Westliche Hauptachse', sport: 'Radfahren', count: 27, path: 'M 139 31 C 153 77 191 105 205 151 C 219 197 221 248 251 287' },
    { name: 'Südlicher Naturpfad', sport: 'Wandern', count: 15, path: 'M 78 211 C 134 184 162 157 211 185 C 256 211 293 249 354 237 C 411 226 459 177 520 191' },
  ] },
  { id: 'city', name: 'Innenstadt', place: 'Muster-Innenstadt', kind: 'city', routes: [
    { name: 'Boulevard', sport: 'Laufen', count: 36, path: 'M 0 94 H 600' },
    { name: 'Südliche Altstadtroute', sport: 'Laufen', count: 29, path: 'M 0 222 H 600' },
    { name: 'Ringstraße', sport: 'Radfahren', count: 39, path: 'M 142 0 V 320' },
    { name: 'Platz-zu-Platz', sport: 'Radfahren', count: 22, path: 'M 432 0 V 320' },
  ] },
  { id: 'forest', name: 'Waldgebiet', place: 'Musterwald', kind: 'forest', routes: [
    { name: 'Forstweg Ost', sport: 'Laufen', count: 34, path: 'M 70 245 C 129 192 147 112 218 88 S 370 126 520 69' },
    { name: 'Kieferntrail', sport: 'Laufen', count: 28, path: 'M 91 57 C 147 116 180 167 274 179 S 412 160 500 254' },
    { name: 'Waldkante', sport: 'Radfahren', count: 20, path: 'M 52 180 C 158 235 214 245 314 213 S 444 116 549 118' },
    { name: 'Bachpfad', sport: 'Wandern', count: 13, path: 'M 160 52 C 188 105 231 130 249 182 S 284 251 388 273' },
  ] },
  { id: 'track', name: 'Laufbahn', place: 'Musterstadion', kind: 'track', routes: [
    { name: 'Innenbahn', sport: 'Laufen', count: 48, path: 'M 154 160 C 154 111 209 87 300 87 C 391 87 446 111 446 160 C 446 209 391 233 300 233 C 209 233 154 209 154 160' },
    { name: 'Außenbahn', sport: 'Laufen', count: 33, path: 'M 123 160 C 123 92 190 58 300 58 C 410 58 477 92 477 160 C 477 228 410 262 300 262 C 190 262 123 228 123 160' },
    { name: 'Einlaufspur', sport: 'Laufen', count: 18, path: 'M 57 160 L 123 160' },
    { name: 'Stadionrunde', sport: 'Radfahren', count: 9, path: 'M 94 160 C 94 78 174 38 300 38 C 426 38 506 78 506 160 C 506 242 426 282 300 282 C 174 282 94 242 94 160' },
  ] },
  { id: 'river', name: 'Flussufer', place: 'Musterufer', kind: 'river', routes: [
    { name: 'Westliche Uferpromenade', sport: 'Laufen', count: 40, path: 'M 229 -5 C 207 35 250 76 232 122 S 271 178 252 222 S 268 279 246 325' },
    { name: 'Brückenrunde', sport: 'Laufen', count: 25, path: 'M 33 81 H 567' },
    { name: 'Östlicher Flussradweg', sport: 'Radfahren', count: 37, path: 'M 366 -5 C 340 39 385 84 365 132 S 397 183 374 230 S 390 278 365 325' },
    { name: 'Südliche Brücke', sport: 'Wandern', count: 17, path: 'M 33 235 H 567' },
  ] },
]

function HeatmapBackdrop({ area }) {
  if (area.kind === 'park') return <>
    <rect width="600" height="320" fill="#202c2b" />
    <path d="M0 0H600V320H0Z" fill="#263234" />
    <g fill="#36413e" stroke="#495550" strokeWidth="2">{[[8,5,74,31],[104,0,66,28],[196,2,75,27],[405,0,74,28],[505,7,90,31],[0,280,82,40],[104,292,76,28],[405,292,77,28],[512,282,88,38]].map(([x,y,w,h])=><rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx="3" />)}</g>
    <path d="M41 49 Q59 31 91 37 L461 35 Q536 41 557 82 L563 229 Q540 274 482 282 L105 280 Q48 267 37 220Z" fill="#344b3a" stroke="#819072" strokeWidth="2" />
    <path d="M44 145 C95 131 144 140 190 155 S292 167 341 152 S461 132 558 150 M299 41 C280 82 285 112 300 146 S321 215 304 280" fill="none" stroke="#82927b" strokeWidth="2" strokeDasharray="3 7" opacity=".58" />
    <path d="M282 91 C298 76 325 80 339 94 C354 110 348 137 332 148 C314 160 289 151 280 134 C273 120 273 102 282 91Z" fill="#3c6870" stroke="#9ab2a7" strokeWidth="3" />
    <path d="M292 96 C310 86 331 91 339 106" fill="none" stroke="#6b9292" strokeWidth="2" opacity=".8" />
    <g fill="#435b3f" stroke="#58714c" strokeWidth="1.5">{[[75,71,16],[117,91,13],[173,65,17],[220,90,13],[390,75,16],[454,94,14],[514,83,17],[82,184,16],[124,226,14],[184,204,17],[391,213,15],[455,236,16],[517,199,14],[237,244,12],[361,57,12]].map(([x,y,r])=><circle key={`${x}-${y}`} cx={x} cy={y} r={r} />)}</g>
    <g fill="#b9c9ae" fontFamily="sans-serif" fontSize="8" fontWeight="700" opacity=".8"><text x="69" y="126">NORDWIESE</text><text x="354" y="118">PARKTEICH</text><text x="360" y="264">ROSENGARTEN</text><text x="432" y="56">PARKCAFÉ</text></g>
  </>
  if (area.kind === 'city') return <>
    <rect width="600" height="320" fill="#263039" />
    <g fill="#39464b" stroke="#52605f" strokeWidth="2">{[[34,28,92,55],[174,22,82,61],[300,18,104,64],[447,25,111,53],[42,113,80,54],[164,120,100,47],[314,111,76,58],[433,113,126,56],[25,222,107,55],[180,213,94,71],[326,218,102,57],[466,215,100,66]].map(([x,y,w,h])=><rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx="4" />)}</g>
    <g fill="none" stroke="#73817c" strokeWidth="11" opacity=".68"><path d="M0 94H600M0 165H600M0 222H600M142 0V320M290 0V320M432 0V320" /></g>
    <g fill="none" stroke="#c1b89e" strokeWidth="2" opacity=".85"><path d="M0 94H600M0 165H600M0 222H600M142 0V320M290 0V320M432 0V320" /></g>
    <circle cx="290" cy="165" r="32" fill="#496050" stroke="#9eaa8b" strokeWidth="3" />
    <g fill="#c7d0c4" fontFamily="sans-serif" fontSize="8" fontWeight="700" opacity=".8"><text x="31" y="83">MARKTGASSE</text><text x="448" y="211">ALTSTADT</text></g>
  </>
  if (area.kind === 'forest') return <>
    <rect width="600" height="320" fill="#172c25" />
    <path d="M-20 78 C96 31 158 89 257 51 S421 77 620 30M-20 259 C83 209 160 265 251 223 S427 247 620 195M81 -20 C31 74 112 137 57 203 S115 278 75 340M364 -20 C417 51 324 115 396 177 S356 265 423 340" fill="none" stroke="#496246" strokeWidth="2" opacity=".52" />
    <path d="M92 0 C150 56 119 111 204 151 S304 201 282 320" fill="none" stroke="#31594a" strokeWidth="11" opacity=".8" />
    <g fill="#284c38" stroke="#3b6749" strokeWidth="2">{[[36,50,24],[95,97,30],[153,39,23],[213,86,28],[274,39,25],[337,82,30],[402,35,25],[463,88,31],[535,52,29],[52,188,28],[116,253,29],[227,238,32],[322,269,29],[462,241,30],[552,183,28],[386,181,24]].map(([x,y,r])=><circle key={`${x}-${y}`} cx={x} cy={y} r={r} />)}</g>
    <g fill="#567647" opacity=".7">{[[36,50],[95,97],[153,39],[213,86],[274,39],[337,82],[402,35],[463,88],[535,52],[52,188],[116,253],[227,238],[322,269],[462,241],[552,183],[386,181]].map(([x,y])=><circle key={`${x}-${y}`} cx={x-7} cy={y-6} r="9" />)}</g>
  </>
  if (area.kind === 'track') return <>
    <rect width="600" height="320" fill="#253039" />
    <rect x="28" y="24" width="544" height="272" rx="18" fill="#35464a" stroke="#536366" strokeWidth="3" />
    <path d="M94 160 C94 78 174 38 300 38 C426 38 506 78 506 160 C506 242 426 282 300 282 C174 282 94 242 94 160Z" fill="#a34f43" stroke="#e1a18a" strokeWidth="3" />
    <path d="M123 160 C123 92 190 58 300 58 C410 58 477 92 477 160 C477 228 410 262 300 262 C190 262 123 228 123 160Z" fill="none" stroke="#ffd0b6" strokeWidth="3" />
    <path d="M154 160 C154 111 209 87 300 87 C391 87 446 111 446 160 C446 209 391 233 300 233 C209 233 154 209 154 160Z" fill="none" stroke="#ffd0b6" strokeWidth="3" />
    <path d="M185 160 C185 130 230 115 300 115 C370 115 415 130 415 160 C415 190 370 205 300 205 C230 205 185 190 185 160Z" fill="#517352" stroke="#8eb17c" strokeWidth="2" />
    <path d="M55 160H94 M506 160H545" stroke="#d7d9d4" strokeWidth="4" />
  </>
  return <>
    <rect width="600" height="320" fill="#283236" />
    <g fill="#3c4846" stroke="#56615a" strokeWidth="2">{[[20,18,118,56],[168,14,92,55],[438,18,135,58],[17,247,112,58],[169,252,95,52],[438,246,138,59],[35,123,86,56],[482,125,86,54]].map(([x,y,w,h])=><rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx="3" />)}</g>
    <path d="M280 -18 C246 36 306 75 286 122 S343 176 321 222 S346 280 315 338" fill="none" stroke="#2d6675" strokeWidth="96" />
    <path d="M280 -18 C246 36 306 75 286 122 S343 176 321 222 S346 280 315 338" fill="none" stroke="#65939a" strokeWidth="3" opacity=".7" />
    <path d="M225 -10 C204 35 250 76 232 122 S271 178 252 222 S268 279 246 330M370 -10 C341 39 385 84 365 132 S397 183 374 230 S390 278 365 330" fill="none" stroke="#b3a98a" strokeWidth="7" opacity=".58" />
    <path d="M33 81H567M33 235H567" fill="none" stroke="#c3b99d" strokeWidth="12" opacity=".75" />
    <path d="M33 81H567M33 235H567" fill="none" stroke="#87948a" strokeWidth="2" strokeDasharray="5 6" />
    <g fill="#c7d0c4" fontFamily="sans-serif" fontSize="8" fontWeight="700" opacity=".8"><text x="51" y="70">NORDKAI</text><text x="443" y="255">SÜDPROMENADE</text><text x="400" y="44">UFERPARK</text></g>
  </>
}

function RouteMap({ compact = false, activeSport = 'Alle', timeRange = '30 Tage', areaId = 'park' }) {
  const area = heatmapAreas.find((item) => item.id === areaId) ?? heatmapAreas[0]
  const visibleRoutes = area.routes.filter((route) => activeSport === 'Alle' || route.sport === activeSport)
  const multiplier = timeRange === '7 Tage' ? .3 : timeRange === 'Alle' ? 3 : 1
  const routes = visibleRoutes.map((route) => ({
    ...route,
    count: Math.max(1, Math.round(route.count * multiplier)),
  }))
  const maxCount = Math.max(...routes.map((route) => route.count), 1)
  return <div className={`route-map ${compact ? 'compact' : ''}`}>
    <svg viewBox="0 0 600 320" role="img" aria-label={`Schematische, eigens gezeichnete Musterkarte ${area.place} mit fiktiver ${activeSport === 'Alle' ? '' : `${activeSport}-`}Aktivitätsdichte`} preserveAspectRatio="xMidYMid meet">
      <defs><filter id={`route-glow-${area.id}`} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      <HeatmapBackdrop area={area} />
      <g fill="none" stroke="#c6c2a8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity=".58">
        {area.routes.map((route) => <path key={`map-path-${route.name}`} d={route.path} />)}
      </g>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" filter={`url(#route-glow-${area.id})`}>
        {routes.map((route) => <path key={`glow-${route.name}`} d={route.path} stroke={route.count / maxCount > .68 ? '#ff8264' : route.count / maxCount > .36 ? '#d4f45a' : '#57ddc0'} strokeWidth={5 + route.count / maxCount * 14} opacity=".42" />)}
      </g>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {routes.map((route) => <path key={route.name} d={route.path} stroke={route.count / maxCount > .68 ? '#ff8264' : route.count / maxCount > .36 ? '#d4f45a' : '#57ddc0'} strokeWidth={2 + route.count / maxCount * 8} opacity=".98"><title>{route.name} · {route.count} fiktive Aktivitäten</title></path>)}
      </g>
      <g fill="#eff3e8" fontFamily="sans-serif" fontSize="12" fontWeight="700" opacity=".88"><text x="20" y="28">{area.place.toUpperCase()}</text></g>
      <g fill="none" stroke="#eff3e8" strokeWidth="2" opacity=".8"><path d="M556 39V19M550 25l6-6 6 6" /><path d="M520 296H574M520 292V300M574 292V300" /></g>
      <text x="563" y="16" fill="#eff3e8" fontFamily="sans-serif" fontSize="8" fontWeight="700" textAnchor="middle">N</text>
      <text x="547" y="311" fill="#eff3e8" fontFamily="sans-serif" fontSize="8" textAnchor="middle">500 m</text>
    </svg>
    <div className="map-live-pill"><span /> MUSTERKARTE · {area.name.toUpperCase()}</div>
  </div>
}

function OutdoorHeatmap({ sessions, onRecordRoute }) {
  const [sportFilter, setSportFilter] = useState('Alle')
  const [range, setRange] = useState('30 Tage')
  const [areaId, setAreaId] = useState('park')
  const [sport, setSport] = useState('Laufen')
  const [distance, setDistance] = useState('5.0')
  const [duration, setDuration] = useState('30')
  const filteredSessions = sessions.filter((session) => (
    (sportFilter === 'Alle' || session.sport === sportFilter)
    && (range === 'Alle' || (session.daysAgo ?? 30) <= (range === '7 Tage' ? 6 : 29))
  ))
  const totalDistance = filteredSessions.reduce((total, session) => total + session.distance, 0)
  const sportCounts = filteredSessions.reduce((counts, session) => ({ ...counts, [session.sport]: (counts[session.sport] ?? 0) + 1 }), {})
  const favoriteSport = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Noch offen'
  const submitRoute = (event) => {
    event.preventDefault()
    onRecordRoute({ sport, distance, duration })
  }
  return <>
    <section className="heatmap-summary">
      <div><span className="stat-label">STRECKE</span><strong>{totalDistance.toLocaleString('de-DE', { maximumFractionDigits: 1 })}<small> km</small></strong></div>
      <div><span className="stat-label">SESSIONS</span><strong>{filteredSessions.length}<small> Routen</small></strong></div>
      <div><span className="stat-label">DEIN FLOW</span><strong>{favoriteSport}</strong></div>
    </section>
    <section className="heatmap-panel panel">
      <div className="heatmap-panel-head"><div><span className="eyebrow">FÜNF SELBST GESTALTETE MUSTERKARTEN</span><h2>Wo sind die Wege besonders beliebt?</h2><p>Die Wegbreite zeigt beispielhaft, wie viele Läufer:innen oder Radfahrer:innen hier unterwegs sind.</p></div><span className="demo-map-tag"><LocationRegular /> OHNE EXTERNE KARTEN</span></div>
      <div className="heatmap-area-picker" role="group" aria-label="Musterkarte auswählen">{heatmapAreas.map((area) => <button key={area.id} className={areaId === area.id ? 'selected' : ''} aria-pressed={areaId === area.id} onClick={() => setAreaId(area.id)}><strong>{area.name}</strong><small>{area.place}</small></button>)}</div>
      <div className="heatmap-filters" role="group" aria-label="Heatmap nach Sportart filtern">{['Alle', 'Laufen', 'Radfahren', 'Wandern'].map((item) => <button key={item} className={sportFilter === item ? 'selected' : ''} aria-pressed={sportFilter === item} onClick={() => setSportFilter(item)}>{item}</button>)}</div>
      <div className="route-map-wrap"><RouteMap activeSport={sportFilter} timeRange={range} areaId={areaId} /></div>
      <div className="heatmap-legend"><span><i /> Fiktive Community-Aktivitäten</span><div><span>weniger Wege</span><i /><i /><i /><i /><span>mehr Wege</span></div></div>
      <div className="heatmap-range" role="group" aria-label="Zeitraum auswählen">{['7 Tage', '30 Tage', 'Alle'].map((item) => <button key={item} className={range === item ? 'selected' : ''} aria-pressed={range === item} onClick={() => setRange(item)}>{item}</button>)}</div>
      <p className="map-disclaimer">Alle fünf Karten und Strecken sind eigens gezeichnete, fiktive Beispiele. Die Wegdichte ist simuliert und zeigt keine echten Personen, GPS-Daten oder tatsächliche Stadtpläne. Keine externen Kartenkacheln oder Kartendienste.</p>
    </section>
    <div className="heatmap-lower-grid">
      <section className="route-log-card panel">
        <div className="eyebrow">NEUE STRECKE</div><h2>Move festhalten<span className="lime-period">.</span></h2><p>Warst du draußen unterwegs? Trag deine Session ein und sammle XP.</p>
        <form className="route-log-form" onSubmit={submitRoute}>
          <label>Sportart<select value={sport} onChange={(event) => setSport(event.target.value)}>{['Laufen', 'Radfahren', 'Wandern'].map((item) => <option key={item}>{item}</option>)}</select></label>
          <div className="route-input-row"><label>Strecke<input type="number" min="0.5" max="100" step="0.1" value={distance} onChange={(event) => setDistance(event.target.value)} required /><small>km</small></label><label>Dauer<input type="number" min="5" max="600" step="1" value={duration} onChange={(event) => setDuration(event.target.value)} required /><small>Min.</small></label></div>
          <button className="lime-button full-button" type="submit"><FlashRegular /> Strecke speichern · +{50 + Math.round((Number(distance) || 0) * 10)} XP</button>
        </form>
      </section>
      <section className="recent-routes-card panel"><div className="panel-heading"><div><span className="eyebrow">DEINE LETZTEN MOVES</span><h2>Frisch unterwegs</h2></div><span className="sport-tag">{sessions.length} gesamt</span></div>{[...sessions].sort((a, b) => b.id - a.id).slice(0, 4).map((session) => <article className="recent-route" key={session.id}><span className="route-sport-icon">{session.sport === 'Radfahren' ? '↗' : session.sport === 'Wandern' ? '⌁' : '⌁'}</span><div><strong>{session.sport} · {session.area}</strong><small>{session.daysAgo === 0 ? 'Heute' : session.daysAgo === 1 ? 'Gestern' : 'Demo-Session'}</small></div><span className="route-distance">{session.distance.toLocaleString('de-DE')} km</span></article>)}{sessions.length === 0 && <p className="empty-copy">Noch keine Strecken. Deine erste Runde wartet!</p>}</section>
    </div>
    <div className="route-quest"><span className="quest-spark"><SparkleRegular /></span><div><strong>Mini-Challenge: Sammle deine Stadt</strong><p>Jede Outdoor-Session leuchtet auf deiner Karte auf. Sammle 3 Routen für einen neuen Wochenrekord.</p></div><span className="quest-progress">{Math.min(sessions.length, 3)} / 3</span></div>
  </>
}
function PartnerView({ occupancy, setOccupancy, bookings, setBookings, showToast, campaigns, partners, onCreateCampaign }) {
  const [releasedBookings, setReleasedBookings] = useState([])
  const [draft, setDraft] = useState({
    partner: '',
    partnerEmail: '',
    website: '',
    title: '',
    activity: 'Laufen',
    goalType: 'sessions',
    target: '3',
    discount: '10',
    startAt: todayISO,
    expiresAt: defaultCampaignExpiry,
    completionWindowDays: '14',
  })
  const submitCampaign = (event) => {
    event.preventDefault()
    if (!getSafeWebsiteUrl(draft.website)) {
      showToast('Bitte gib eine gültige Webseite mit http oder https ein.')
      return
    }
    if (draft.expiresAt < draft.startAt) {
      showToast('Das Ablaufdatum muss nach dem Startdatum liegen.')
      return
    }
    onCreateCampaign(draft)
    setDraft((current) => ({ ...current, partner: '', partnerEmail: '', website: '', title: '' }))
  }
  return <>
    <PageHeading eyebrow="SPORTQUEST FÜR PARTNER" title={<>Mehr Bewegung.<br className="desktop-break" /> Mehr Möglichkeiten<span className="lime-period">.</span></>} description="Partner anmelden, Challenge veröffentlichen und einen Rabatt als Belohnung anbieten." action={<span className="partner-preview-label"><ShieldCheckmarkRegular /> PARTNER-VORSCHAU</span>} />
    <div className="partner-banner"><div><span className="feature-kicker"><ShieldCheckmarkRegular /> PARTNER PORTAL · DEMO</span><h2>Gemeinsam mehr bewegen.</h2><p>Erreiche aktive Menschen und belohne abgeschlossene Challenges mit einem Einkaufsvorteil.</p></div><div className="partner-banner-mark"><span>SP</span><i>✳</i></div></div>
    <div className="partner-stats"><article className="partner-stat"><span className="stat-label">HEUTE RESERVIERT</span><strong>{bookings}<small> Buchungen</small></strong><span className="positive-note"><ArrowRightRegular /> Demo-Wert</span></article><article className="partner-stat"><span className="stat-label">PLATZAUSLASTUNG</span><strong>{occupancy}<small>%</small></strong><span className="occupancy-track"><i style={{ width: `${occupancy}%` }} /></span></article><article className="partner-stat"><span className="stat-label">DEINE COMMUNITY</span><strong>86<small> Spieler:innen</small></strong><span className="positive-note"><PeopleCommunityRegular /> Lokal verbunden</span></article></div>
    <div className="partner-enrollment-grid">
      <section className="partner-card partner-enrollment">
        <div className="panel-heading"><div><span className="eyebrow">NEU BEI SPORTQUEST?</span><h2>Partner werden & Challenge starten</h2></div><span className="demo-label">DEMO</span></div>
        <p>Trage dein Unternehmen und eine Challenge ein. Nach dem Abschluss erhalten Teilnehmende einen Rabattcode und XP.</p>
        <form className="partner-campaign-form" onSubmit={submitCampaign}>
          <label>Unternehmensname<input required maxLength="50" value={draft.partner} onChange={(event) => setDraft((current) => ({ ...current, partner: event.target.value }))} placeholder="z. B. dein Sport- oder Outdoor-Label" /></label>
          <label>Kontakt-E-Mail<input required type="email" maxLength="100" value={draft.partnerEmail} onChange={(event) => setDraft((current) => ({ ...current, partnerEmail: event.target.value }))} placeholder="team@unternehmen.de" /></label>
          <label>Unternehmens-Webseite<input required type="url" maxLength="150" value={draft.website} onChange={(event) => setDraft((current) => ({ ...current, website: event.target.value }))} placeholder="https://www.deine-webseite.de" /></label>
          <label>Challenge-Titel<input required maxLength="60" value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="z. B. Drei Trainings im Park" /></label>
          <div className="partner-form-row">
            <label>Aktivität<select value={draft.activity} onChange={(event) => setDraft((current) => ({ ...current, activity: event.target.value }))}>{(draft.goalType === 'distance' ? ['Laufen', 'Radfahren', 'Wandern'] : ['Alle Trainings', 'Laufen', 'Radfahren', 'Wandern', 'Workout', 'Match']).map((activity) => <option key={activity}>{activity}</option>)}</select></label>
            <label>{draft.goalType === 'distance' ? 'Zielstrecke (km)' : 'Anzahl'}<input type="number" min={draft.goalType === 'distance' ? '1' : '1'} max={draft.goalType === 'distance' ? '500' : '30'} step={draft.goalType === 'distance' ? '0.5' : '1'} required value={draft.target} onChange={(event) => setDraft((current) => ({ ...current, target: event.target.value }))} /></label>
          </div>
          <label>Challenge-Ziel<select value={draft.goalType} onChange={(event) => setDraft((current) => ({ ...current, goalType: event.target.value, activity: event.target.value === 'distance' && !['Laufen', 'Radfahren', 'Wandern'].includes(current.activity) ? 'Laufen' : current.activity, target: event.target.value === 'distance' ? '10' : '3' }))}><option value="sessions">Anzahl abgeschlossener Aktivitäten</option><option value="distance">Gesamtdistanz in Kilometern</option></select></label>
          <div className="partner-form-row">
            <label>Rabatt<input type="number" min="5" max="50" step="5" required value={draft.discount} onChange={(event) => setDraft((current) => ({ ...current, discount: event.target.value }))} /><small>% auf den nächsten Einkauf</small></label>
            <label>Absolvierzeitraum<select value={draft.completionWindowDays} onChange={(event) => setDraft((current) => ({ ...current, completionWindowDays: event.target.value }))}><option value="7">7 Tage ab erster Aktivität</option><option value="14">14 Tage ab erster Aktivität</option><option value="30">30 Tage ab erster Aktivität</option></select></label>
          </div>
          <div className="partner-form-row">
            <label>Startdatum<input type="date" min={todayISO} required value={draft.startAt} onChange={(event) => setDraft((current) => ({ ...current, startAt: event.target.value }))} /></label>
            <label>Ablaufdatum<input type="date" min={draft.startAt} required value={draft.expiresAt} onChange={(event) => setDraft((current) => ({ ...current, expiresAt: event.target.value }))} /></label>
          </div>
          <button className="lime-button full-button" type="submit"><AddRegular /> Partner anmelden & Challenge veröffentlichen</button>
        </form>
      </section>
      <section className="partner-card partner-directory">
        <div className="panel-heading"><div><span className="eyebrow">PARTNER-NETZWERK</span><h2>{partners.length} Partner dabei</h2></div><span className="demo-label">FIKTIVE DEMO</span></div>
        <p>Diese Unternehmen sind erfunden und zeigen, wie Partnerangebote in der App aussehen könnten.</p>
        <div className="partner-directory-list">{partners.map((partner) => { const website = getSafeWebsiteUrl(partner.website); return <article className="partner-directory-item" key={`${partner.name}-${partner.email}`}><span className="partner-initial">{partner.name.slice(0, 1).toUpperCase()}</span><div><strong>{partner.name}</strong><small>{campaigns.filter((campaign) => campaign.partner === partner.name).length} veröffentlichte Challenges</small></div>{website ? <a className="partner-active-mark" href={website} target="_blank" rel="noreferrer">Webseite ↗</a> : <span className="partner-active-mark">Demo</span>}</article> })}</div>
        <div className="partner-campaign-list"><span className="eyebrow">AKTUELLE PARTNER-CHALLENGES</span>{campaigns.slice(0, 3).map((campaign) => <div className="partner-campaign-row" key={campaign.id}><span><strong>{campaign.title}</strong><small>{campaign.partner} · {campaign.goalType === 'distance' ? `${campaign.target} km ${campaign.activity}` : `${campaign.target}× ${campaign.activity}`} · gültig bis {new Intl.DateTimeFormat('de-DE').format(new Date(`${campaign.expiresAt}T00:00:00`))}</small></span><b>{campaign.discount}% Rabatt</b></div>)}</div>
      </section>
    </div>
    <div className="partner-columns"><section className="partner-card occupancy-card"><div className="panel-heading"><div><div className="eyebrow">DEIN ANGEBOT</div><h2>Plätze verwalten</h2></div><span className="demo-label">DEMO</span></div><p>Aktualisiere die Beispiel-Auslastung für deine heutige Padel-Session.</p><div className="occupancy-value"><strong>{occupancy}%</strong><span>Auslastung</span></div><label className="sr-only" htmlFor="occupancy-slider">Beispiel-Auslastung ändern</label><input id="occupancy-slider" type="range" min="0" max="100" step="4" value={occupancy} onChange={(event) => setOccupancy(Number(event.target.value))} /><div className="slider-labels"><span>0 Plätze</span><span>Voll</span></div><button className="lime-button" onClick={() => showToast('Beispiel-Auslastung lokal aktualisiert')}>Änderung übernehmen</button><p className="demo-caption">Nur eine lokale Vorschau – kein Live-Inventar.</p></section><section className="partner-card bookings-card"><div className="panel-heading"><div><div className="eyebrow">DEINE AKTIVITÄTEN</div><h2>Heute im Studio</h2></div><button className="text-button" onClick={() => showToast('Alle Buchungen der Demo werden angezeigt')}>Alle ansehen <ArrowRightRegular /></button></div>{[['19:00', 'Padel After Work', 'Court 2 · 4 Spieler:innen', '4/4'], ['20:30', 'Einsteiger:innen Match', 'Court 1 · 2 Spieler:innen', '2/4'], ['Morgen', 'Early Bird Padel', 'Court 3 · 1 Spieler:in', '1/4']].map(([time, title, info, count]) => { const released = releasedBookings.includes(title); return <div className={`booking-row ${released ? 'released' : ''}`} key={title}><span className="booking-time">{time}</span><span className="booking-info"><strong>{title}</strong><small>{released ? 'Platz lokal freigegeben · Demo' : info}</small></span><span className="booking-count">{count}</span><button className="booking-manage" disabled={released} onClick={() => { setReleasedBookings((current) => [...current, title]); setBookings((value) => Math.max(0, value - 1)); showToast('Beispiel-Platz lokal freigegeben') }}>{released ? 'Freigegeben' : 'Verwalten'}</button></div> })}</section></div>
    <section className="partner-cta"><div className="cta-icon"><SparkleRegular /></div><div><div className="eyebrow">GEMEINSAM MEHR ERREICHEN</div><h2>Dein Angebot. Unsere Community.</h2><p>Erreiche neue Sportler:innen und bringe mehr Menschen in Bewegung.</p></div><button className="outline-button" onClick={() => showToast('Kontaktaufnahme ist in dieser Demo deaktiviert')}>Mehr erfahren <ArrowRightRegular /></button></section>
    <p className="demo-caption">Partnerdaten und Verwaltungsaktionen sind illustrative Demo-Beispiele. Es werden keine echten Buchungen verarbeitet.</p>
  </>
}

function LoginScreen({ users, onSignIn }) {
  return <main className="login-screen">
    <div className="login-card">
      <a className="brand login-brand" href="#login"><span className="brand-mark"><FlashRegular /></span><span>sportquest<span className="brand-dot">.</span><small>Play. Connect. Level Up.</small></span></a>
      <p className="eyebrow">DEINE SPORT-COMMUNITY</p>
      <h1>Finde deinen<br />nächsten <span>Move.</span></h1>
      <p className="login-description">Wähle einen Demo-Zugang und entdecke SportQuest aus der Perspektive unterschiedlicher Rollen.</p>
      <div className="demo-access-note"><ShieldCheckmarkRegular /> Hochschul-Prototyp: Demo-Zugänge ohne echte Anmeldung oder Passwort.</div>
      <div className="login-users">{users.map((user) => {
        const level = getLevelInfo(user.xp).level
        return <article className="login-user-card" key={user.id}>
          <Avatar name={user.name} initials={user.initials} size={48} color="neutral" />
          <div className="login-user-info"><strong>{user.name}</strong><span>{user.role === 'admin' ? 'Administrator · Moderation' : `${user.gender} · Level ${level} · ${user.city}`}</span></div>
          <button className="lime-button" onClick={() => onSignIn(user.id)}>Anmelden <ArrowRightRegular /></button>
        </article>
      })}</div>
      <p className="login-footnote">Die drei Profile sind voneinander getrennte lokale Demo-Konten. Daten werden nur in diesem Browser gespeichert.</p>
    </div>
  </main>
}

function LevelUpCelebration({ level }) {
  return <div className="levelup-overlay" role="status" aria-live="assertive"><div className="levelup-confetti" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} style={{ '--confetti-index': index }} />)}</div><div className="levelup-card"><TrophyRegular /><span>LEVEL UP</span><strong>Level {level}</strong><small>Weiter so. Dein nächster Move wartet.</small></div></div>
}

function AccountMenu({ currentUser, users, onNavigate, onSwitch, onSignOut }) {
  return <div className="account-menu" role="menu" aria-label="Profilmenü">
    <div className="account-menu-heading"><Avatar name={currentUser.name} initials={currentUser.initials} size={38} color="neutral" /><span><strong>{currentUser.name}</strong><small>{currentUser.role === 'admin' ? 'Administrator' : currentUser.city}</small></span></div>
    <button role="menuitem" onClick={() => onNavigate('profile')}><PersonRegular /> Mein Profil</button>
    <button role="menuitem" onClick={() => onNavigate('settings')}><SettingsRegular /> Einstellungen</button>
    {currentUser.role === 'admin' && <button role="menuitem" onClick={() => onNavigate('admin')}><ShieldCheckmarkRegular /> Admin-Bereich</button>}
    <div className="account-menu-divider" />
    <span className="account-menu-label">DEMO-ACCOUNT WECHSELN</span>
    {users.filter((user) => user.id !== currentUser.id).map((user) => <button key={user.id} role="menuitem" onClick={() => onSwitch(user.id)}><Avatar name={user.name} initials={user.initials} size={27} color="neutral" />{user.name}<small>{user.role === 'admin' ? 'Admin' : user.gender}</small></button>)}
    <button className="signout-action" role="menuitem" onClick={onSignOut}><SignOutRegular /> Abmelden</button>
  </div>
}

function ProfileView({ user, settings, xp, events, bookings, onEdit }) {
  const { level, currentXp, nextLevelXp } = getLevelInfo(xp)
  const created = events.filter((event) => event.ownerId === user.id).length
  return <>
    <PageHeading eyebrow="DEIN SPORTQUEST" title={<>Dein Profil<span className="lime-period">.</span></>} description="Deine Community, deine Bewegung, dein Fortschritt." action={<Button className="outline-button" icon={<SettingsRegular />} onClick={onEdit}>Profil bearbeiten</Button>} />
    <section className="profile-hero panel">
      <Avatar name={user.name} initials={user.initials} size={72} color="neutral" />
      <div className="profile-hero-copy"><span className="eyebrow">{user.role === 'admin' ? 'COMMUNITY-TEAM' : 'SPORTQUEST-MITGLIED'}</span><h2>{user.name}</h2><p>{user.city} · {user.gender} · Profil {settings.profilePublic ? 'öffentlich' : 'privat'}</p><p>{user.bio}</p></div>
      <div className="profile-level"><span>LEVEL {level}</span><strong>{xp.toLocaleString('de-DE')} XP</strong><ProgressBar className="xp-progress" value={currentXp / nextLevelXp} max={1} aria-label={`${currentXp} von ${nextLevelXp} XP bis zum nächsten Level`} /><small>{currentXp.toLocaleString('de-DE')} / {nextLevelXp.toLocaleString('de-DE')} XP bis Level {level + 1}</small></div>
      <Button className="outline-button profile-edit-button" icon={<SettingsRegular />} onClick={onEdit}>Bearbeiten</Button>
    </section>
    <div className="profile-stats">
      <article className="stat-card"><span className="stat-label">AKTIVITÄTEN ERFASST</span><strong>{user.activityLogged}</strong><p>Bewegung, die sich auszahlt.</p></article>
      <article className="stat-card"><span className="stat-label">MATCHES</span><strong>{user.matchCount}</strong><p>Gemeinsam gespielt.</p></article>
      <article className="stat-card"><span className="stat-label">TREFFEN ERSTELLT</span><strong>{created}</strong><p>Deine eigenen Sport-Momente.</p></article>
      <article className="stat-card"><span className="stat-label">ZUSAGEN</span><strong>{bookings.length}</strong><p>Treffen in deinem Kalender.</p></article>
    </div>
    <section className="profile-section panel"><div className="panel-heading"><div><div className="eyebrow">DEINE TREFFEN</div><h2>Geplant & organisiert</h2></div></div>{events.filter((event) => bookings.includes(event.id) || event.ownerId === user.id).slice(0, 5).map((event) => <div className="profile-event-row" key={event.id}><span className="sport-tag">{event.sport}</span><strong>{event.title}</strong><span>{event.time}</span><span>{event.ownerId === user.id ? 'Organisiert' : 'Dabei'}</span></div>)}{!events.some((event) => bookings.includes(event.id) || event.ownerId === user.id) && <p className="empty-copy">Noch keine Treffen geplant. Entdecke ein Event oder erstelle dein eigenes.</p>}</section>
  </>
}

function ProfileEditView({ user, onSave, onCancel }) {
  const [name, setName] = useState(user.name)
  const [city, setCity] = useState(user.city)
  const [bio, setBio] = useState(user.bio)
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('')
  const submit = (event) => {
    event.preventDefault()
    if (!name.trim() || !city.trim()) return
    onSave({ name: name.trim(), city: city.trim(), bio: bio.trim(), initials })
  }
  return <><PageHeading eyebrow="KONTO" title={<>Profil bearbeiten<span className="lime-period">.</span></>} description="Passe deinen Auftritt in der SportQuest-Community an." /><form className="edit-profile-form panel" onSubmit={submit}><label>Vor- und Nachname<input className="modal-input" value={name} onChange={(event) => setName(event.target.value)} required maxLength={50} /></label><label>Stadt<input className="modal-input" value={city} onChange={(event) => setCity(event.target.value)} required maxLength={40} /></label><label>Kurzbeschreibung<textarea className="modal-input" value={bio} onChange={(event) => setBio(event.target.value)} rows="4" maxLength={180} placeholder="Was möchtest du mit anderen teilen?" /></label><div className="form-actions"><button className="outline-button" type="button" onClick={onCancel}>Abbrechen</button><button className="lime-button" type="submit">Änderungen speichern</button></div><p className="demo-caption">Diese Änderungen gelten nur für dein lokales Demo-Profil.</p></form></>
}

function SettingsView({ settings, setSettings, user, xp, showToast }) {
  const options = [
    { id: 'notifications', title: 'Aktivitätsbenachrichtigungen', detail: 'Hinweise zu Zusagen, neuen Treffen und Gruppen.' },
    { id: 'profilePublic', title: 'Profil für die Community sichtbar', detail: 'Andere Mitglieder können dein öffentliches Demo-Profil sehen.' },
    { id: 'weeklyDigest', title: 'Wöchentlicher Rückblick', detail: 'Eine Zusammenfassung deiner Aktivitäten und Ziele.' },
  ]
  return <><PageHeading eyebrow="DEIN KONTO" title={<>Einstellungen<span className="lime-period">.</span></>} description="Du entscheidest, wie SportQuest für dich funktioniert." /><section className="settings-card panel"><div className="panel-heading"><div><div className="eyebrow">PERSÖNLICHES ERLEBNIS</div><h2>Benachrichtigungen & Privatsphäre</h2></div><span className="sport-tag">LOKAL GESPEICHERT</span></div>{options.map((option) => <label className="setting-row" key={option.id}><span><strong>{option.title}</strong><small>{option.detail}</small></span><input type="checkbox" checked={settings[option.id]} onChange={(event) => { setSettings((current) => ({ ...current, [option.id]: event.target.checked })); showToast('Einstellung gespeichert.') }} /></label>)}</section>{settings.weeklyDigest && <section className="settings-card digest-card"><div className="eyebrow">DEIN WOCHENRÜCKBLICK</div><h2>Weiter so, {user.name.split(' ')[0]}!</h2><div className="digest-stats"><span><strong>{user.activityLogged}</strong> Aktivitäten</span><span><strong>{user.matchCount}</strong> Matches</span><span><strong>{xp.toLocaleString('de-DE')}</strong> Gesamt-XP</span></div><p>Deine Demo-Zusammenfassung basiert auf deinem aktuellen Fortschritt.</p></section>}<section className="settings-card panel"><div className="eyebrow">DEMO-UMGEBUNG</div><h2>Deine Konten</h2><p>Wechsle über dein Profilmenü zwischen zwei Community-Mitgliedern und dem Admin-Konto. Jedes Konto hat eigene XP, Zusagen, Einstellungen und Berechtigungen.</p><div className="permission-pills"><span><PersonRegular /> Mitglied: Treffen, Gruppen, Profil</span><span><ShieldCheckmarkRegular /> Admin: zusätzlich Moderation</span></div></section><p className="demo-caption">Vorschau-Einstellungen haben keine Verbindung zu Push-Diensten oder externen Profilen.</p></>
}

function AdminView({ users, events, hiddenEventIds, onToggleVisibility, onDelete }) {
  return <><PageHeading eyebrow="SPORTQUEST OPERATIONS" title={<>Community verwalten<span className="lime-period">.</span></>} description="Admin-Werkzeuge für Sicherheit, Qualität und gesunde Communitys." /><div className="admin-summary"><article className="stat-card"><span className="stat-label">DEMO-KONTEN</span><strong>{users.length}</strong><p>Zwei Mitglieder und ein Admin.</p></article><article className="stat-card"><span className="stat-label">TREFFEN</span><strong>{events.length}</strong><p>{hiddenEventIds.length} davon ausgeblendet.</p></article><article className="stat-card"><span className="stat-label">MODERATION</span><strong>{events.length + users.length}</strong><p>Verwaltbare Demo-Objekte.</p></article></div><section className="admin-panel panel"><div className="panel-heading"><div><div className="eyebrow">ROLLEN & ZUGRIFF</div><h2>Demo-Mitglieder</h2></div><span className="sport-tag">ADMIN</span></div>{users.map((user) => <div className="admin-user-row" key={user.id}><Avatar name={user.name} initials={user.initials} size={36} color="neutral" /><span><strong>{user.name}</strong><small>{user.gender} · {user.city} · Profil {user.settings?.profilePublic ? 'öffentlich' : 'privat'}</small></span><span className={`role-chip ${user.role}`}>{user.role === 'admin' ? 'Admin' : 'Mitglied'}</span><span className="admin-user-xp">{user.xp.toLocaleString('de-DE')} XP</span></div>)}</section><section className="admin-panel panel"><div className="panel-heading"><div><div className="eyebrow">COMMUNITY-SICHERHEIT</div><h2>Treffen moderieren</h2></div><span className="sport-tag">{events.length} Einträge</span></div>{events.map((event) => <div className="admin-event-row" key={event.id}><span className="sport-tag">{event.sport}</span><span><strong>{event.title}</strong><small>{event.time} · von {users.find((user) => user.id === event.ownerId)?.name ?? 'SportQuest'}</small></span><button onClick={() => onToggleVisibility(event.id)}>{hiddenEventIds.includes(event.id) ? 'Veröffentlichen' : 'Ausblenden'}</button><button className="danger-link" onClick={() => onDelete(event.id)}><DeleteRegular /> Entfernen</button></div>)}</section><p className="demo-caption">Rollen sind für diesen Prototyp fest definiert. Admin-Aktionen ändern nur lokale Beispieldaten.</p></>
}

function MeetingDialog({ onClose, onCreate }) {
  const [form, setForm] = useState({ title: '', sport: 'Fußball', place: '', date: tomorrowISO, time: '18:00', duration: '60', level: 'Alle Level', spots: '4', distance: '2', price: 'Kostenlos' })
  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const submit = (event) => {
    event.preventDefault()
    if (form.date < todayISO || (form.date === todayISO && form.time <= localNow.time) || !form.title.trim() || !form.place.trim()) return
    onCreate({ ...form, title: form.title.trim(), place: form.place.trim(), duration: Number(form.duration), spots: Number(form.spots), distance: Number(form.distance) })
  }
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal-card create-modal meeting-modal" role="dialog" aria-modal="true" aria-labelledby="meeting-title"><button className="modal-close" onClick={onClose} aria-label="Dialog schließen">×</button><span className="modal-symbol"><CalendarLtrRegular /></span><div className="eyebrow">NEUES COMMUNITY-TREFFEN</div><h2 id="meeting-title">Bring Leute in Bewegung.</h2><p className="modal-description">Erstelle ein Treffen für die Community. Es erscheint sofort bei „Entdecken“.</p><form className="meeting-form" onSubmit={submit}><label>Name des Treffens<input className="modal-input" value={form.title} onChange={(event) => setField('title', event.target.value)} placeholder="z. B. Feierabend-Kick im Park" required maxLength={60} /></label><div className="meeting-fields"><label>Sportart<select className="modal-input" value={form.sport} onChange={(event) => setField('sport', event.target.value)}>{['Fußball', 'Basketball', 'Tennis', 'Padel', 'Klettern', 'Joggen', 'Radfahren', 'Wandern', 'Fitness', 'Yoga'].map((sport) => <option key={sport}>{sport}</option>)}</select></label><label>Freie Plätze<select className="modal-input" value={form.spots} onChange={(event) => setField('spots', event.target.value)}>{[2, 3, 4, 5, 6, 8, 10].map((count) => <option key={count} value={count}>{count} Plätze</option>)}</select></label></div><label>Treffpunkt<input className="modal-input" value={form.place} onChange={(event) => setField('place', event.target.value)} placeholder="Park, Halle oder Studio" required maxLength={70} /></label><div className="meeting-fields"><label>Datum<input className="modal-input" type="date" min={todayISO} value={form.date} onChange={(event) => setField('date', event.target.value)} required /></label><label>Uhrzeit<input className="modal-input" type="time" value={form.time} onChange={(event) => setField('time', event.target.value)} required /></label></div><div className="meeting-fields"><label>Dauer<select className="modal-input" value={form.duration} onChange={(event) => setField('duration', event.target.value)}>{[30, 45, 60, 75, 90, 120].map((duration) => <option key={duration} value={duration}>{duration} Minuten</option>)}</select></label><label>Level<select className="modal-input" value={form.level} onChange={(event) => setField('level', event.target.value)}>{['Alle Level', 'Einsteiger:innen', 'Mittel', 'Fortgeschritten'].map((level) => <option key={level}>{level}</option>)}</select></label></div><div className="meeting-fields"><label>Umkreis<select className="modal-input" value={form.distance} onChange={(event) => setField('distance', event.target.value)}>{['1', '2', '3', '5', '10'].map((km) => <option key={km} value={km}>ca. {km} km</option>)}</select></label><label>Beitrag vor Ort<select className="modal-input" value={form.price} onChange={(event) => setField('price', event.target.value)}><option>Kostenlos</option><option>5 €</option><option>10 €</option><option>15 €</option></select></label></div><div className="form-actions"><button type="button" className="outline-button" onClick={onClose}>Abbrechen</button><button type="submit" className="lime-button">Treffen veröffentlichen</button></div><p className="field-note">Lokal im Browser gespeichert · jederzeit löschbar</p></form></section></div>
}

function GroupDialog({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [sport, setSport] = useState('Fußball')
  const [description, setDescription] = useState('')
  const [openSpots, setOpenSpots] = useState('4')
  const submit = (event) => {
    event.preventDefault()
    if (!name.trim() || !description.trim()) return
    onCreate({ name: name.trim(), sport, description: description.trim(), openSpots: Number(openSpots) })
  }
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal-card create-modal" role="dialog" aria-modal="true" aria-labelledby="group-title"><button className="modal-close" onClick={onClose} aria-label="Dialog schließen">×</button><span className="modal-symbol"><PeopleCommunityRegular /></span><div className="eyebrow">NEUE SPORT-CREW</div><h2 id="group-title">Gruppe gründen</h2><form className="meeting-form" onSubmit={submit}><label>Gruppenname<input className="modal-input" value={name} onChange={(event) => setName(event.target.value)} required maxLength={50} placeholder="z. B. Samstag Basketball Crew" /></label><label>Sportart<select className="modal-input" value={sport} onChange={(event) => setSport(event.target.value)}>{['Fußball', 'Basketball', 'Tennis', 'Padel', 'Klettern', 'Joggen', 'Radfahren', 'Wandern', 'Fitness', 'Yoga'].map((item) => <option key={item}>{item}</option>)}</select></label><label>Worum geht es?<textarea className="modal-input" rows="3" value={description} onChange={(event) => setDescription(event.target.value)} required maxLength={140} placeholder="Erzähl kurz, wer willkommen ist." /></label><label>Freie Plätze<select className="modal-input" value={openSpots} onChange={(event) => setOpenSpots(event.target.value)}>{[2, 3, 4, 5, 6, 8, 10].map((count) => <option key={count} value={count}>{count} Plätze</option>)}</select></label><div className="form-actions"><button className="outline-button" type="button" onClick={onClose}>Abbrechen</button><button className="lime-button" type="submit">Gruppe erstellen</button></div></form></section></div>
}

export default App
