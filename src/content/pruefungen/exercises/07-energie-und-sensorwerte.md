---
title: Probeprüfung 7 – Energie-Abrechnung und Sensorwerte
minutes: 180
grading: teacher
size: medium
status: draft
rubric:
  erwartet: >-
    Beide Aufgaben sind vollständig: der Spring-Service mit DTOs und typisierten Exceptions,
    die REST-API mit Parameter-Varianten und vollständiger Teststrategie (good, edge,
    exception) über `@WebMvcTest`.
  genuegend: >-
    Ansätze in beiden Aufgaben; Services sind noch ohne Injektion, Tests rudimentär.
  befriedigend: >-
    Eine Aufgabe weitgehend, die andere im Kern; Exceptions und Parameter-Fehlfälle offen.
  gut: >-
    Beide Funktionen laufen; Teststrategie an den Rändern (leere Zeiträume, Default-Größen)
    lückenhaft.
  sehrGut: >-
    Vollständig mit sauberer Schichttrennung und vollständiger Teststrategie – alle
    erwarteten Ergebnisse erfüllt.
---

Diese mittlere Probeprüfung dauert **180 Minuten**: zwei unabhängige Aufgaben zu je 17 Punkten.
Du brauchst das Service-Modul (Einheiten 1–10, besonders `@Service`) und das REST-Modul
(Einheiten 1–11). Zeitplan-Vorschlag: 90 Minuten pro Aufgabe. Der Ablauf steht in
[So läuft eine Probeprüfung](/pruefungen/ablauf).

| Aufgabe | Thema | Punkte | Zeit |
|---|---|---|---|
| 1 | Business-Service: Energie-Abrechnung | 17 | 90 min |
| 2 | REST-API: Sensorwerte | 17 | 90 min |

Beide Aufgaben bearbeitest du in einem Projekt: `Aufgabe2_BusinessService` und
`Aufgabe3_RestfulApi`. Bei jedem Push laufen deine eigenen Tests.

## Aufgabe 1 – Energie-Abrechnung (17 Punkte)

Ein Versorger rechnet Haushaltsverbrauch ab: Zählerstände von und bis, Tarif je Kilowattstunde
mit Grundgebühr, Einspeisung wird vergütet. Der Service ist eine Spring-`@Service`-Klasse mit
einem Repository-Interface (im Test als `@MockitoBean` ersetzt), nimmt ein Request-DTO und
liefert ein Response-DTO. Ungültige oder rückwärts laufende Zählerstände werfen typisierte
Exceptions. Wie in Aufgabe 2 der Matura, aber mit Spring: Testdaten selbst bauen, AssertJ.

Erwartete Ergebnisse: Schichten sauber getrennt, DTOs haben keine Geschäftslogik, alle Regeln
und beide Exceptions getestet.

## Aufgabe 2 – Sensorwerte-API (17 Punkte)

Eine Wetterstation liefert Messwerte: `GET /api/measurements?sensorId=…&from=…&to=…`
mit optionalem Zeitraum, `GET /api/measurements/latest?count=…` (Default 10), `POST` zum
Melden. Parameterfehler (Datum vor Zeitraumende, `count` über 100) als 400 mit
`ProblemDetail`; leerer Zeitraum als 204. Service gestubbt; getestet mit `@WebMvcTest`,
MockMvc und `@MockitoBean` – good, edge (leere Ergebnisse, Grenzen) und exception cases.

Erwartete Ergebnisse: alle Parameter-Varianten behandelt und getestet, Statuscodes korrekt.

:::achtung Entwurf
Die vollständige Angabe mit JSON-Beispielen kommt in Phase E3 auf diese Seite.
:::
