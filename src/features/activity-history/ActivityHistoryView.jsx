import { useMemo, useState } from 'react'
import {
  AddRegular,
  CalendarLtrRegular,
  CheckmarkCircleRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  ClockRegular,
  FlashRegular,
  LocationRegular,
  PeopleCommunityRegular,
  SparkleRegular,
  TrophyRegular,
} from '@fluentui/react-icons'
import {
  formatActivityDate,
  getActivityDateKey,
  getActivityHistory,
  getMonthCalendarDays,
} from './activityHistory.js'
import './ActivityHistoryView.css'

const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const activityFilters = ['Alle', 'Training', 'Laufen', 'Radfahren', 'Wandern', 'Match']
const outdoorActivities = new Set(['Laufen', 'Radfahren', 'Wandern'])

function getLocalToday() {
  return getActivityDateKey(new Date())
}

function ActivityDetailsDialog({ activity, friendNames, onClose }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="modal-card activity-detail-modal" role="dialog" aria-modal="true" aria-labelledby="activity-detail-title" tabIndex="-1">
      <button className="modal-close" onClick={onClose} aria-label="Dialog schließen">×</button>
      <div className="activity-detail-banner"><span className="stat-icon lime"><FlashRegular /></span><span className="eyebrow">ABGESCHLOSSENE AKTIVITÄT</span></div>
      <h2 id="activity-detail-title">{activity.type}</h2>
      <p className="modal-description">{formatActivityDate(activity.date, { dateStyle: 'full' })}</p>
      <div className="activity-detail-stats">
        {activity.distance > 0 && <div><span>Distanz</span><strong>{Number(activity.distance).toLocaleString('de-DE', { maximumFractionDigits: 1 })} km</strong></div>}
        {activity.duration > 0 && <div><span>Dauer</span><strong>{activity.duration} Min.</strong></div>}
        <div><span>XP erhalten</span><strong>+{activity.xpEarned ?? 0} XP</strong></div>
        <div><span>Ort</span><strong>{activity.place || 'Nicht angegeben'}</strong></div>
      </div>
      <section className="activity-detail-section">
        <h3><PeopleCommunityRegular /> Dabei</h3>
        {friendNames.length
          ? <div className="activity-friend-list">{friendNames.map((name) => <span key={name}>{name}</span>)}</div>
          : <p>Diese Aktivität wurde ohne eingetragene Freunde gespeichert.</p>}
      </section>
      <section className="activity-detail-section">
        <h3><TrophyRegular /> Mit dieser Aktivität erreicht</h3>
        {activity.completedChallenges?.length
          ? <div className="activity-challenge-list">{activity.completedChallenges.map((challenge) => <span key={challenge.id}><CheckmarkCircleRegular />{challenge.title}</span>)}</div>
          : <p>Bei dieser Aktivität wurde keine Challenge neu abgeschlossen.</p>}
      </section>
      <p className="modal-footnote">Aktivitäts- und Teilnahmedaten werden lokal in diesem Browser gespeichert.</p>
    </section>
  </div>
}

function ActivityCard({ activity, friendsById, onSelect }) {
  const friends = (activity.friendIds ?? []).map((id) => friendsById.get(id)).filter(Boolean)
  const challengeCount = activity.completedChallenges?.length ?? 0
  return <button className="activity-history-card" type="button" onClick={onSelect}>
    <span className={`activity-history-icon ${outdoorActivities.has(activity.type) ? 'outdoor' : ''}`}>
      {outdoorActivities.has(activity.type) ? <LocationRegular /> : <FlashRegular />}
    </span>
    <span className="activity-history-copy">
      <strong>{activity.type}</strong>
      <small>{activity.place || 'Ort nicht angegeben'} · {activity.duration ? `${activity.duration} Min.` : 'Dauer offen'}</small>
      <span className="activity-history-meta">
        {friends.length > 0 && <span><PeopleCommunityRegular />{friends.map((friend) => friend.name).join(', ')}</span>}
        {challengeCount > 0 && <span><TrophyRegular />{challengeCount} {challengeCount === 1 ? 'Challenge' : 'Challenges'} erreicht</span>}
      </span>
    </span>
    <span className="activity-history-reward">
      {activity.distance > 0 && <small>{Number(activity.distance).toLocaleString('de-DE', { maximumFractionDigits: 1 })} km</small>}
      <strong>+{activity.xpEarned ?? 0} XP</strong>
      <ChevronRightRegular />
    </span>
  </button>
}

export default function ActivityHistoryView({ user, friends, onRecordActivity }) {
  const activities = useMemo(() => getActivityHistory(user), [user])
  const today = getLocalToday()
  const [monthDate, setMonthDate] = useState(() => new Date(`${today}T12:00:00`))
  const [selectedDate, setSelectedDate] = useState(today)
  const [view, setView] = useState('Kalender')
  const [filter, setFilter] = useState('Alle')
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [form, setForm] = useState({ type: 'Workout', duration: '45', distance: '5', place: '', friendIds: [] })
  const friendsById = useMemo(() => new Map(friends.map((friend) => [friend.id, friend])), [friends])
  const activityCounts = useMemo(() => activities.reduce((counts, activity) => {
    counts.set(activity.date, (counts.get(activity.date) ?? 0) + 1)
    return counts
  }, new Map()), [activities])
  const monthDays = useMemo(() => getMonthCalendarDays(monthDate), [monthDate])
  const visibleActivities = activities.filter((activity) => {
    if (filter === 'Alle') return true
    if (filter === 'Training') return !outdoorActivities.has(activity.type) && activity.type !== 'Match'
    return activity.type === filter
  })
  const selectedDayActivities = visibleActivities.filter((activity) => activity.date === selectedDate)
  const monthActivities = activities.filter((activity) => activity.date.startsWith(`${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`))
  const monthXp = monthActivities.reduce((sum, activity) => sum + Number(activity.xpEarned || 0), 0)
  const toggleFriend = (friendId) => setForm((current) => ({
    ...current,
    friendIds: current.friendIds.includes(friendId)
      ? current.friendIds.filter((id) => id !== friendId)
      : [...current.friendIds, friendId],
  }))
  const submitActivity = (event) => {
    event.preventDefault()
    onRecordActivity({
      ...form,
      date: today,
      duration: Number(form.duration),
      distance: outdoorActivities.has(form.type) ? Number(form.distance) : 0,
    })
    setForm((current) => ({ ...current, place: '', friendIds: [] }))
  }
  const shiftMonth = (amount) => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1, 12))

  return <>
    <section className="activity-history-view">
      <div className="activity-history-layout">
        <section className="activity-calendar-panel panel" aria-label="Aktivitäten im Kalender">
          <div className="activity-calendar-head">
            <div><span className="eyebrow">DEIN MONAT</span><h3>{new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(monthDate)}</h3></div>
            <div className="activity-calendar-nav">
              <button type="button" onClick={() => shiftMonth(-1)} aria-label="Vorheriger Monat"><ChevronLeftRegular /></button>
              <button type="button" onClick={() => { setMonthDate(new Date(`${today}T12:00:00`)); setSelectedDate(today) }}>Heute</button>
              <button type="button" onClick={() => shiftMonth(1)} aria-label="Nächster Monat"><ChevronRightRegular /></button>
            </div>
          </div>
          <div className="activity-calendar-grid" role="grid" aria-label="Kalendertage">
            {weekDays.map((day) => <span className="activity-calendar-weekday" role="columnheader" key={day}>{day}</span>)}
            {monthDays.map(({ date, dateKey, inMonth }) => {
              const count = activityCounts.get(dateKey) ?? 0
              return <button type="button" role="gridcell" key={dateKey} aria-label={`${date.getDate()}. ${new Intl.DateTimeFormat('de-DE', { month: 'long' }).format(date)}${count ? `, ${count} Aktivitäten` : ', keine Aktivitäten'}`} aria-pressed={selectedDate === dateKey} className={`activity-calendar-day ${inMonth ? '' : 'outside'} ${selectedDate === dateKey ? 'selected' : ''} ${dateKey === today ? 'today' : ''} ${count ? 'has-activity' : ''}`} onClick={() => setSelectedDate(dateKey)}>
                <span>{date.getDate()}</span>
                {count > 0 && <i aria-hidden="true">{count > 3 ? '3+' : count}</i>}
              </button>
            })}
          </div>
          <div className="activity-calendar-summary"><span><CalendarLtrRegular />{monthActivities.length} Aktivitäten in diesem Monat</span><strong>+{monthXp.toLocaleString('de-DE')} XP</strong></div>
        </section>
        <section className="activity-history-day panel">
          <div className="activity-history-day-head"><div><span className="eyebrow">TAGESÜBERSICHT</span><h3>{formatActivityDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long' })}</h3></div><span className="activity-day-count">{selectedDayActivities.length}</span></div>
          <div className="activity-history-filters" role="group" aria-label="Aktivitätstyp filtern">
            {activityFilters.map((item) => <button type="button" key={item} className={filter === item ? 'selected' : ''} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}
          </div>
          {selectedDayActivities.length
            ? <div className="activity-history-list">{selectedDayActivities.map((activity) => <ActivityCard key={activity.id} activity={activity} friendsById={friendsById} onSelect={() => setSelectedActivity(activity)} />)}</div>
            : <div className="activity-history-empty"><CalendarLtrRegular /><strong>Keine Aktivität an diesem Tag</strong><span>Wähle einen markierten Tag oder erfasse deinen heutigen Move.</span></div>}
        </section>
      </div>
      <section className="activity-all-panel panel">
        <div className="activity-all-heading"><div><span className="eyebrow">DEIN VERLAUF</span><h3>Alle abgeschlossenen Aktivitäten</h3></div><div className="activity-view-toggle" role="tablist" aria-label="Aktivitätsverlauf anzeigen">{['Kalender', 'Liste'].map((item) => <button type="button" role="tab" aria-selected={view === item} className={view === item ? 'selected' : ''} onClick={() => setView(item)} key={item}>{item}</button>)}</div></div>
        {view === 'Liste' && <div className="activity-history-filters all-history-filters" role="group" aria-label="Verlauf filtern">{activityFilters.map((item) => <button type="button" key={item} className={filter === item ? 'selected' : ''} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div>}
        {view === 'Liste' && visibleActivities.length > 0
          ? <div className="activity-history-list">{visibleActivities.map((activity) => <div className="activity-history-list-day" key={activity.id}><span>{formatActivityDate(activity.date, { weekday: 'short', day: 'numeric', month: 'short' })}</span><ActivityCard activity={activity} friendsById={friendsById} onSelect={() => setSelectedActivity(activity)} /></div>)}</div>
          : view === 'Liste'
            ? <div className="activity-history-empty"><CalendarLtrRegular /><strong>Noch keine Aktivitäten in diesem Filter</strong><span>Ändere den Filter oder trage ein Training ein.</span></div>
            : <p className="activity-list-hint"><SparkleRegular /> Wähle „Liste“, um alle Einträge chronologisch anzusehen.</p>}
      </section>
      <details className="activity-record-panel panel">
        <summary><span><AddRegular /> Aktivität erfassen</span><small>Mit Dauer, Ort und Freunden</small></summary>
        <form className="activity-record-form" onSubmit={submitActivity}>
          <label>Aktivität<select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>{['Workout', 'Match', 'Laufen', 'Radfahren', 'Wandern'].map((type) => <option key={type}>{type}</option>)}</select></label>
          <label>Dauer (Min.)<input type="number" min="5" max="600" required value={form.duration} onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))} /></label>
          {outdoorActivities.has(form.type) && <label>Distanz (km)<input type="number" min="0.5" max="100" step="0.1" required value={form.distance} onChange={(event) => setForm((current) => ({ ...current, distance: event.target.value }))} /></label>}
          <label className="activity-record-place">Ort<input maxLength="80" value={form.place} onChange={(event) => setForm((current) => ({ ...current, place: event.target.value }))} placeholder="z. B. Stadtpark" /></label>
          <fieldset className="activity-friend-picker"><legend>Wer war dabei?</legend>{friends.length ? friends.map((friend) => <label key={friend.id}><input type="checkbox" checked={form.friendIds.includes(friend.id)} onChange={() => toggleFriend(friend.id)} />{friend.name}</label>) : <span>Füge Freund:innen hinzu, um sie hier auszuwählen.</span>}</fieldset>
          <button className="lime-button full-button activity-record-submit" type="submit"><CheckmarkCircleRegular /> Aktivität speichern</button>
        </form>
        <p className="activity-record-note"><ClockRegular /> Neue Einträge werden mit dem heutigen Datum gespeichert. Vorhandene Aktivitäten bleiben erhalten.</p>
      </details>
    </section>
    {selectedActivity && <ActivityDetailsDialog activity={selectedActivity} friendNames={(selectedActivity.friendIds ?? []).map((id) => friendsById.get(id)?.name).filter(Boolean)} onClose={() => setSelectedActivity(null)} />}
  </>
}
