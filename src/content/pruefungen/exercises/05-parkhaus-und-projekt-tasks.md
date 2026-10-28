---
title: Probeprüfung 5 – Parkhaus und Projekt-Tasks
minutes: 180
grading: teacher
size: medium
status: draft
rubric:
  erwartet: >-
    Beide Aufgaben sind selbstständig und vollständig umgesetzt: der Service mit sauberen
    Geschäftsregeln und eigenen Tests, die REST-API mit Validierung, Fehlerbehandlung und
    `@WebMvcTest`-Tests.
  genuegend: >-
    Beide Aufgaben sind angefangen; Datenklassen und ein Endpunkt bzw. eine Regel
    funktionieren, Tests fehlen meist.
  befriedigend: >-
    Eine Aufgabe brauchbar, die andere angefangen; Hauptfälle laufen, Exceptions und
    Fehlfälle fehlen noch.
  gut: >-
    Beide Aufgaben weitgehend vollständig, eigene Tests vorhanden; Randfälle und
    Detailkriterien (Fehlerreferenzen, Payload-Tests) teilweise offen.
  sehrGut: >-
    Beide Aufgaben vollständig, alle erwarteten Ergebnisse erfüllt, inklusive
    Teststrategie (good, edge, exception) und sauberer Benennung.
---

Diese mittlere Probeprüfung dauert **180 Minuten**: zwei unabhängige Aufgaben zu je 17 Punkten –
wie Teil 2 und 3 der Matura. Du brauchst das Service-Modul (Einheiten 1–10) für Aufgabe B und
das REST-Modul (Einheiten 1–15) für Aufgabe C. Zeitplan-Vorschlag: 90 Minuten pro Aufgabe.
Der Ablauf steht in [So läuft eine Probeprüfung](/pruefungen/ablauf).

| Aufgabe | Thema | Punkte | Zeit |
|---|---|---|---|
| B | Business-Service: Parkhaus | 17 | 90 min |
| C | REST-API: Projekt-Tasks | 17 | 90 min |

Beide Aufgaben bearbeitest du in einem Projekt: `Aufgabe2_BusinessService` und
`Aufgabe3_RestfulApi` – wie bei der Matura, nur ohne OR-Mapping. Bei jedem Push laufen deine
eigenen Tests; schlagen sie fehl, siehst du das an der Abgabe.

## Aufgabe B – Parkhaus (17 Punkte)

Ein Parkhaus berechnet die Gebühr aus Einfahrt und Ausfahrt: Tarif pro angefangene halbe Stunde,
ein Tageshöchstbetrag, ein Nachttarif zwischen 22 und 6 Uhr. Eine Ausfahrt ohne gültigen
Parkschein wirft eine definierte Exception. Datenklassen als Records, Geschäftsregeln im Service
in reinem Java, eigene Testdaten mit AssertJ – wie in Aufgabe 2 der Matura: keine Spring-Kontexte,
nur JUnit.

Erwartete Ergebnisse: Regeln korrekt und vollständig getestet (auch Tagesüberschreitung und
Mitternachtsgrenzen), Exceptions an den richtigen Stellen, keine Java-Datei außer Datenklassen,
Service und Tests.

## Aufgabe C – Projekt-Tasks-API (17 Punkte)

Ein Team verwaltet Projekte mit Tasks in einer API: `GET`/`POST /api/projects`,
`GET`/`POST /api/projects/{id}/tasks` und `PATCH /api/projects/{projectId}/tasks/{id}` für den
Statuswechsel. Ungültige Eingaben werden mit Feldfehler-Details abgelehnt, eine unbekannte ID
liefert ein `ProblemDetail` mit Referenz; die Projekt-ID im Pfad der Unterressource muss zur ID
des Task-Objekts passen (sonst 409). Der Service ist ein Stub und wird im Test mit
`@MockitoBean` ersetzt; getestet wird mit `@WebMvcTest` und MockMvc – good, edge und exception
cases für jeden Endpunkt.

Erwartete Ergebnisse: Pfade und Statuscodes stimmen, Validierung und Fehlerbehandlung sind
getestet, die JSON-Struktur ist durch Tests belegt.

:::achtung Entwurf
Die vollständigen Angaben mit JSON-Beispielen und UML (Service-Klassen) kommen mit dieser
Prüfung in Phase E3. Diese Seite zeigt den Rahmen: Themen, Punkte und Zeit.
:::
