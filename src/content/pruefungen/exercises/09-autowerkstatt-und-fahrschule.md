---
title: Probeprüfung 9 – Autowerkstatt und Fahrschule
minutes: 300
grading: teacher
size: full
status: draft
rubric:
  erwartet: >-
    Alle vier Aufgaben sind selbstständig und vollständig umgesetzt: beide OR-Mappings mit
    Constraints, Beziehungen und Lifecycle-Tests, der Service mit sauberen Geschäftsregeln und
    eigenen Tests, die REST-API mit Validierung, Fehlerbehandlung und `@WebMvcTest`-Tests.
  genuegend: >-
    Zwei Aufgaben sind elementar gelöst (Entities gespeichert bzw. Grundfunktionalität), die
    anderen beiden kaum begonnen; Tests fehlen meist.
  befriedigend: >-
    Alle vier Aufgaben sind angefangen, zwei davon brauchbar; Details wie Constraints, Exceptions
    oder Fehlfälle fehlen noch.
  gut: >-
    Drei Aufgaben vollständig, eine brauchbar; eigene Tests vorhanden, Randfälle teilweise geprüft.
  sehrGut: >-
    Alle vier Aufgaben vollständig, alle erwarteten Ergebnisse erfüllt, inklusive
    Teststrategie (good, edge, exception) und sauberer Benennung.
---

Die erste volle Probeprüfung: **vier Aufgaben, 300 Minuten, je 17 Punkte** – Aufbau wie beim
Haupttermin, beide OR-Mapping-Aufgaben sind zu lösen. Der Zeitplan-Vorschlag und die
Vorgehensweise stehen in [So läuft eine Probeprüfung](/pruefungen/ablauf).

| Aufgabe | Thema | Punkte | Zeit |
|---|---|---|---|
| A1 | OR-Mapping: Autowerkstatt | 17 | 70 min |
| A2 | OR-Mapping: Fahrschule (Besonderheit: Enum-Codes) | 17 | 80 min |
| B | Business-Service: Parkhaus | 17 | 75 min |
| C | REST-API: Produktkatalog | 17 | 75 min |

:::achtung Entwurf
Die vollständigen Angaben mit UML-Diagrammen, Attributlisten und exakten Namen kommen in Phase E4.
Diese Seite zeigt den Rahmen: Reihenfolge, Punkte und die Kriterien je Aufgabe.
:::

## Aufgabe A1 – Autowerkstatt (17 Punkte)

Kunden mit Adresse (Value Object) und E-Mail (Rich Type) bringen Fahrzeuge (Kennzeichen als Rich
Type, nächste §57a-Begutachtung („Pickerl“) als Datum) in die Werkstatt; Mechaniker führen Aufträge mit Betrag
(`BigDecimal`) aus. Gefordert: Basis-Mapping der Einheiten 1–10 – Spalten-Constraints, benannte
Foreign Keys, bidirektionale Beziehungen mit Hilfsmethoden, Repositories und Lifecycle-Tests.

Erwartete Ergebnisse: alles gespeichert und wiederlesbar, Constraints sichtbar in der DDL,
Tests grün.

## Aufgabe A2 – Fahrschule (17 Punkte)

Fahrschülerinnen und Fahrschüler haben eine **Führerscheinklasse (A, B, BE, C), die als Code über einen
null-sicheren `AttributeConverter` gespeichert wird** – das ist die Besonderheit dieser Aufgabe.
Dazu Fahrlehrer, Fahrstunden als bidirektionale Beziehung und abgeleitete Queries
(`findByLicenseClass`).

## Aufgabe B – Parkhaus (17 Punkte)

Ein Business-Service ohne Datenbank: Parkscheine mit Ein- und Ausfahrtszeit, Gebühren nach Regeln
(Tageshöchstbetrag, angefangene Minuten werden aufgerundet), Exception bei fehlendem Schein.
Datenklassen als Records, eigene Testdaten, AssertJ. Wie in Aufgabe 2 der Matura: reine Logik, nur JUnit.

## Aufgabe C – Produktkatalog (17 Punkte)

Eine REST-API für Produkte mit Pagination und HATEOAS-Links: `GET /api/products?page=…` mit
`Pageable`, `PagedModel`, Link auf Details; `@WebMvcTest` mit `@MockitoBean`, `@JsonTest` für die
Payloads; Fehlfälle als `ProblemDetail`.

## Abgabe und Feedback

Diese Prüfung wird von der Lehrkraft bewertet: Feedback kommt direkt ins Repository, deine
eigenen Tests müssen grün laufen. Schätze dich nach der Abgabe selbst ein (unten).
