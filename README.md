# SportQuest

**Play. Connect. Level Up.** SportQuest ist ein deutschsprachiger, responsiver iOS-inspirierter Prototyp für Sportaktivitäten, lokale Communities und spielerischen Trainingsfortschritt. Das dunkle UI verwendet `#121826` als Basis und `#cdf63d` als Akzentfarbe.

## Lokal starten

Voraussetzung: Node.js 20.19+ oder 22.12+.

```bash
npm install
npm run dev
```

Vite zeigt die lokale URL (standardmäßig `http://localhost:5173`) im Terminal an. Weitere Projektchecks:

```bash
npm run lint
npm run build
npm run preview
```

## Demo-Konten

Auf dem Anmeldebildschirm kann ohne Passwort eines der drei vorbereiteten Konten gewählt werden:

| Konto | Rolle | Vorschau-Berechtigungen |
|---|---|---|
| Alex Morgan | Mitglied | Profil pflegen, Treffen und Gruppen erstellen, Aktivitäten, Zusagen und Communities verwalten |
| Lina Becker | Mitglied | Wie Alex; mit eigenem Premium-Status und eigenem Fortschritt |
| Robin Admin | Admin | Zusätzlich Treffen moderieren, ausblenden, wieder veröffentlichen und entfernen |

Die Auswahl ist eine lokale Demo-Anmeldung, keine echte Authentifizierung oder Sicherheitsgrenze. Das Admin-Konto besitzt keine produktionsgeeignete Serverberechtigung.

## Funktionen ausprobieren

- **Übersicht:** XP, Level-Fortschritt und Fortschrittsbalken, Check-in, Workout-/Match-Erfassung, Wochen- und Monats-Challenges, Level-up-Animation sowie Basis-/Premium-Umschalter. Die Wochenserie zählt Kalenderwochen mit mindestens einer datierten Aktivität am Stück; Check-ins allein zählen nicht als Training. Der XP-Bedarf startet bei 1.000 und steigt pro Level um 25 %, auf volle 100 XP aufgerundet; vorhandene Gesamt-XP bleiben erhalten. Bei Level 5, 10, 15 usw. gibt es automatisch eine Level-Medaille. Die XP-Regeln sind direkt im Fortschritt erklärt.
- **Entdecken:** Aktivitäten aus Fußball, Basketball, Tennis, Padel, Klettern, Joggen, Radfahren, Wandern, Fitness und Yoga nach Sportart, Tag, Tageszeit und Umkreis filtern. Details öffnen, Plätze prüfen und einer Aktivität lokal zusagen oder wieder absagen.
- **Treffen erstellen:** Eigene Community-Treffen mit Sportart, Ort, Datum, Uhrzeit, Dauer, Level, Umkreis, Preis und freien Plätzen veröffentlichen. Die Ersteller:innen können ihre Treffen verwalten; angelegte Treffen erscheinen direkt in Entdecken.
- **Bewegungs-Heatmap:** Im Bereich „Fortschritt“ zwischen Levelübersicht und Heatmap wechseln. Fünf eigens gestaltete Musterkarten für Park, Innenstadt, Wald, Laufbahn und Flussufer erkunden. Häufiger genutzte Beispielwege werden breiter und farbintensiver dargestellt. Lauf-, Rad- und Wandersessions filtern, Strecken mit Dauer eintragen und XP sammeln. Karten, Wege und Wegdichten sind vollständig fiktiv und lokal gezeichnet – es werden keine externen Kartenanbieter, Kacheln oder echten GPS-/Nutzungsdaten verwendet.
- **Aktivitätskalender & Verlauf:** Im Bereich „Fortschritt“ zeigt ein Monatskalender die Tage mit Trainings und Outdoor-Routen. Der Listenmodus führt alle erfassten Aktivitäten chronologisch auf; einzelne Einträge zeigen Datum, Dauer, Distanz, Ort, XP, teilnehmende Freund:innen und neu abgeschlossene Challenges. Neue Workouts, Matches und Outdoor-Sessions lassen sich mit Freunden eintragen. Bereits vorhandene Outdoor-Routen werden im Verlauf rückwärtskompatibel angezeigt.
- **Connect:** Freundeübersicht mit Namenssuche, auswählbaren Treffern und lokal gespeicherter Freundesliste. Profile zeigen Aktivitäts- und Medaillendetails sowie einen direkten Vergleich für Level, XP, Sessions, Strecken, Serien und Auszeichnungen. Daneben können Mitglieder offenen Gruppen und Communities beitreten, eigene Gruppen und Communities erstellen, Einladungslinks kopieren und Demo-Nachrichten im lokalen Chat schreiben.
- **Fortschritt & Challenge Board:** Exponentielles Levelsystem mit nachvollziehbarer 25-%-Steigerung, automatisch verliehenen grafischen Level-Medaillen bei jedem fünften Level und einem Vergleich der Demo-Profile. Daneben gibt es aktivitätsbasierte Challenges für Outdoor-Routen, Distanz, Sportvielfalt, Matches, Community, Aktivitätsserie und Wochen-/Monatsfortschritt. Kategorie-Buttons filtern nach Alle, Solo, Community oder Partner; Status und Thema lassen sich zusätzlich über Buttons und die Themen-Auswahl eingrenzen. Die Sortierung erfolgt nach XP oder Fortschritt. Detail-Pop-ups zeigen Ziel, Fortschritt, Gültigkeitszeitraum, Abschlussfenster, Partnerlink und Belohnung. Medaillen sind nach Seltenheit gestaltet und werden zusammen mit Level-Meilensteinen gesammelt.
- **Profil & Einstellungen:** Profilangaben, persönliche Statistiken und kontoabhängige Einstellungen pflegen. Konten wechseln oder abmelden ist über das Profilmenü möglich.
- **Admin:** Eigene Ansicht für die Moderation von Treffen und die Übersicht der Demo-Konten; sichtbar nur mit dem ausgewählten Admin-Demokonto.
- **Partner Portal:** Unternehmen können sich in der Demo mit Kontaktadresse und Webseite anmelden und Challenges mit Sportart, Aktivitäts- oder Kilometerziel, Rabatt, Start- und Ablaufdatum sowie einem Abschlussfenster von 7, 14 oder 30 Tagen veröffentlichen. Passende Aktivitäten zählen zum Ziel; nach Abschluss wird ein persönlicher Demo-Rabattcode zusammen mit XP freigeschaltet. Bestehende Partner, Challenges und Codes sind fiktive Beispiele und keine echten Angebote.

Die App ist Mobile-First gestaltet und kann für die Präsentation im Browser über die Geräteansicht der Entwicklertools in schmalen Smartphone-Ansichten getestet werden.

## Speicherung und Demo-Grenzen

Profile, XP, Einstellungen, Freundeslisten, Zusagen, erstellte Treffen, Gruppen, Communities, Chat-Nachrichten, Outdoor-Sessions, datierte Aktivitätsverläufe, eingelöste Challenges, Medaillen, Partnerunternehmen und Partner-Challenges werden im `localStorage` dieses Browsers gespeichert und bleiben nach einem Neuladen erhalten. Ein Zurücksetzen der Browserdaten entfernt auch diesen Demo-Zustand.

Alle Daten sind lokal und beispielhaft. Die fünf Heatmap-Karten sind selbst gezeichnete schematische Illustrationen mit simulierten Wegen und Dichtewerten. Es gibt keinen Server, keine echte Buchung oder Zahlung, keine echten Partner-Rabatte, keine extern zugestellten Nachrichten und keine Push-Benachrichtigungen. Partneranmeldung, Gutscheincodes, Premium und Ranglisten sind Präsentationsvorschauen und lösen keine externen Transaktionen aus.

## Technik

- React 19 und JavaScript
- Vite
- Fluent UI v9 und Fluent UI Icons
- Oxlint (`npm run lint`)
- Responsive Styles mit `prefers-reduced-motion`-Unterstützung

## Code-Struktur

- `src/App.jsx` koordiniert Navigation, lokale Profilzustände und die bestehenden App-Flows.
- `src/features/activity-history/` enthält Kalender-/Verlaufskomponenten, deren Styles sowie reine Funktionen zur Datumsauswertung und zur rückwärtskompatiblen Umwandlung vorhandener Routen.
- `src/features/challenges/` kapselt Challenge-Katalog, Partnerfortschritt und Seltenheitsregeln.
- `src/features/progression/` enthält die Level- und XP-Stufenberechnung.

Neue fachliche Logik wird möglichst in den zugehörigen Feature-Modulen statt in der zentralen App-Komponente ergänzt. Die Profile und bisherigen Funktionen bleiben im Browser-`localStorage` erhalten.
