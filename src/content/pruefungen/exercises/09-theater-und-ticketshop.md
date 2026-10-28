---
title: Probeprüfung 9 – Theaterabonnement und Ticketshop
minutes: 180
grading: teacher
size: medium
status: draft
rubric:
  erwartet: >-
    Beide Aufgaben sind vollständig umgesetzt: der Service mit Datumsregeln, Ausnahmen und
    Map-Auswertung, die REST-API mit Bestellungen, nested Validation und 409-Konflikt,
    jeweils mit eigenen Tests.
  genuegend: >-
    Beide Aufgaben angefangen; Grunddaten und ein Endpunkt bzw. eine Regel vorhanden.
  befriedigend: >-
    Eine Aufgabe brauchbar, die andere angefangen; Fristen und Konfliktfälle offen.
  gut: >-
    Beide funktional vollständig; Tests an den Datums- und Konfliktgrenzen ungenau.
  sehrGut: >-
    Vollständig mit sauberer Teststrategie: Fristgrenzen, Ausnahmefälle, Statuscodes und
    Payloads belegt.
---

Diese mittlere Probeprüfung dauert **180 Minuten**: zwei unabhängige Aufgaben zu je 17
Punkten. Du brauchst das Service-Modul (Einheiten 1–10) und das REST-Modul (Anlegen,
Validierung, Fehlerbehandlung). Zeitplan-Vorschlag: 90 Minuten pro Aufgabe. Der Ablauf steht
in [So läuft eine Probeprüfung](/pruefungen/ablauf).

| Aufgabe | Thema | Punkte | Zeit |
|---|---|---|---|
| B | Business-Service: Theaterabonnement | 17 | 90 min |
| C | REST-API: Ticketshop-Bestellungen | 17 | 90 min |

Beide Aufgaben bearbeitest du in einem Projekt: `Aufgabe2_BusinessService` und
`Aufgabe3_RestfulApi`. Bei jedem Push laufen deine eigenen Tests.

## Aufgabe B – Theaterabonnement (17 Punkte)

Ein Theater verlängert Abonnements: Stückliste mit Terminen, Rabatt nach Anzahl der gebuchten
Stücke und Altersstufe, Frist: 14 Tage vor der Premiere (Verlängerung danach nur mit Zuschlag,
nach Vorstellungsbeginn Ablehnung mit Exception). Der Service liefert pro Abo den fälligen
Preis und eine Übersicht **nach Altersstufe gruppiert** (`Map`). Datenklassen als Records,
eigene Testdaten mit AssertJ, reines Java – wie in Aufgabe 2 der Matura.

Erwartete Ergebnisse: Fristgrenzen exakt getestet (Tag 14, Tag 13, Vorstellung selbst),
Gruppierung vollständig, Exception nur im vorgesehenen Fall.

## Aufgabe C – Ticketshop (17 Punkte)

Bestellungen für ein Festival: `POST /api/orders` mit Positionen (Tickettyp, Anzahl),
`GET /api/orders/{id}`, `DELETE` storniert nur vor dem ersten Nutzungstag (sonst 409),
unbekannte ID 404 mit `ProblemDetail`-Referenz, Validierung mit Feldfehler-Details, Antwort
mit `Location`-Header. Service gestubbt; `@WebMvcTest` mit `@MockitoBean`, MockMvc über
good/edge/exception cases.

Erwartete Ergebnisse: Statuscodes, Fehlerformate und Validierung getestet, Storno-Regel an
der richtigen Schicht.

:::achtung Entwurf
Die vollständige Angabe mit JSON-Beispielen kommt in Phase E3 auf diese Seite.
:::
