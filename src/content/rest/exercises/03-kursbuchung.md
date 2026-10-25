---
title: Kursbuchung – Validierung, Fehler und JSON
minutes: 110
grading: teacher
classroomUrl: https://classroom50.org/SJ2627-POS-Lernwerkstatt/lernwerkstatt/assignments/rest-03-kursbuchung/accept
status: draft
rubric:
  erwartet: >-
    Alle Endpunkte und JSON-Objekte sind umgesetzt. Eingaben werden vollständig validiert – auch die
    verschachtelten Termine –, und jede Ablehnung nennt die betroffenen Felder. `PATCH` ändert nur
    geschickte Felder. Konflikte liefern `409`. `@JsonTest`s zeigen, dass das JSON genau der Angabe
    entspricht.
  genuegend: >-
    Endpunkte und Datenklassen sind definiert, die Validierung fehlt teilweise. Tests sind nur
    rudimentär vorhanden.
  befriedigend: >-
    Endpunkte, Validierung und Fehler sind umgesetzt; die Good Cases sind getestet.
  gut: >-
    Auch die Edge Cases sind getestet: leere Teilnehmerliste, `PATCH` mit nur einem Feld, unbekannte
    Kategorie, Grenzwerte der Teilnehmerzahl.
  sehrGut: >-
    Auch alle Exception Cases sind getestet (ungültige Termine, Kurs voll, doppelt angemeldet,
    Kapazität zu klein, nicht gefunden), und ein `@JsonTest` vergleicht mit dem JSON aus der Angabe.
---

Eine Volkshochschule bietet Kurse an, für die man sich online anmeldet. Baue die REST-API.

Du brauchst dafür das ganze Modul REST-Controller, vor allem die Einheiten 6, 7, 8 und 15.

Alle Endpunkte liegen unter **`/api/courses`**. Controller und Fehlerbehandlung gehören ins Package `restfulapi.presentation`, das Service und die Datenklassen nach `restfulapi.service`.

## Schnittstellenobjekte

```json
// courseView
{
  "code": "IT-101",
  "title": "Java für Einsteiger",
  "category": "IT",
  "max-participants": 12,
  "participants": 3,
  "sessions": [
    { "date": "2026-11-23", "from": "18:00:00", "to": "20:00:00", "room": "C.3.07" }
  ]
}
```

```json
// courseCreate
{
  "code": "IT-101",
  "title": "Java für Einsteiger",
  "category": "IT",
  "max-participants": 12,
  "sessions": [ { "date": "2026-11-23", "from": "18:00", "to": "20:00", "room": "C.3.07" } ]
}
```

```json
// courseUpdate – jedes Feld darf fehlen
{ "title": "Java für Einsteiger (Abendkurs)", "max-participants": 15 }
```

```json
// participant
{ "name": "Lena Berger", "email": "lena@example.com" }
```

Regeln:

- `code`: zwei Großbuchstaben, Bindestrich, drei Ziffern (`IT-101`).
- `category`: `LANGUAGE`, `SPORT`, `IT` oder `ART`.
- `max-participants`: 2 bis 30.
- `sessions`: mindestens ein Termin; jeder Termin hat Datum, Beginn, Ende und einen Raum.
- `courseUpdate`: Fehlende Felder bleiben unverändert. Geschickte Felder gelten dieselben Regeln.
- `participant`: Name nicht leer, gültige E-Mail.

Lehnt die API eine Eingabe ab, nennt die Antwort **jedes** fehlerhafte Feld, bei Terminen mit Position, z. B. `sessions[0].room must not be blank`.

## Endpunkte

- Alle Kurse lesen, optional nach Kategorie gefiltert (`?category=IT`; eine unbekannte Kategorie ist ein `400`)
- Einen Kurs lesen, anlegen, teilweise ändern (`PATCH`), löschen
- Die Teilnehmenden eines Kurses lesen
- Jemanden anmelden (`Location` auf `/api/courses/{code}/participants/{email}`)
- Jemanden abmelden

## Konflikte

Das Service (ein `@Service`-Stub) meldet mit eigenen Exceptions:

| Situation | Status |
|---|---|
| Kurs oder Teilnehmer nicht gefunden | `404` |
| Kurs mit diesem Code gibt es schon | `409` |
| Kurs ist voll | `409` |
| E-Mail ist schon angemeldet | `409` |
| `max-participants` kleiner als die Zahl der Angemeldeten | `409` |

## Tests

Teste alle Endpunkte mit `@WebMvcTest` und einem Mock des Service. Prüfe die Schnittstellenobjekte zusätzlich mit `@JsonTest` – `courseView` gegen eine Datei mit dem JSON aus dieser Angabe.

:::pruefung
Bei jedem Push läuft `./gradlew test`. Ob deine Tests grün sind, siehst du im Repository; die Beurteilung macht deine Lehrkraft nach den Kriterien unten.
:::
