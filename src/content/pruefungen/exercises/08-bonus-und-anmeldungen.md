---
title: Probeprüfung 8 – Bonusprogramm und Anmeldungen
minutes: 180
grading: teacher
size: medium
status: draft
rubric:
  erwartet: >-
    Beide Aufgaben sind vollständig: der Service sauber in Rechner und Stufen-Service
    aufgeteilt, die API mit verschachtelter Validierung, 409-Konflikt, PATCH und
    `@JsonTest` gegen Datei; jeweils mit Tests.
  genuegend: >-
    Beide Aufgaben angefangen; Rechenregeln oder ein Endpunkt vorhanden, Aufteilung und
    Tests fehlen.
  befriedigend: >-
    Eine Aufgabe brauchbar, die andere angefangen; Validierungs- und Konfliktfälle offen.
  gut: >-
    Beide Aufgaben funktional vollständig; Aufteilung oder Payload-Tests ungenau.
  sehrGut: >-
    Vollständig: getrennte Verantwortlichkeiten mit Mock-Tests, nested Validation, 409,
    `@JsonTest` – gute Teststrategie.
---

Diese mittlere Probeprüfung dauert **180 Minuten**: zwei unabhängige Aufgaben zu je 17 Punkten.
Du brauchst das Service-Modul (speziell Einheit 8: Aufteilen) und das REST-Modul (Validierung,
Ändern/Löschen, `@JsonTest`). Zeitplan-Vorschlag: 90 Minuten pro Aufgabe. Der Ablauf steht in
[So läuft eine Probeprüfung](/pruefungen/ablauf).

| Aufgabe | Thema | Punkte | Zeit |
|---|---|---|---|
| 1 | Business-Service: Bonusprogramm | 17 | 90 min |
| 2 | REST-API: Kurs-Anmeldungen | 17 | 90 min |

Beide Aufgaben bearbeitest du in einem Projekt: `Aufgabe2_BusinessService` und
`Aufgabe3_RestfulApi`. Bei jedem Push laufen deine eigenen Tests.

## Aufgabe 1 – Bonusprogramm (17 Punkte)

Ein Händler führt Bonuspunkte: Einkäufe sammeln Punkte nach Warengruppe und Kundestufe;
ab einer Schwelle steigt der Kunde auf, nach zwei Jahren ohne Einkauf fällt er zurück. Der
Service wird **aufgeteilt**: ein `BonusCalculator` reiner Punkte, ein `TierService` entscheidet
über Auf- und Abstieg und bekommt den Rechner per Konstruktor. Der `TierService` wird mit
Mockito getestet (der Rechner ist ein `@Mock`), der Rechner mit reinen AssertJ-Tests.
Datenklassen als Records, Java ohne Spring – wie in Aufgabe 2 der Matura.

Erwartete Ergebnisse: keine Regel an zwei Stellen, beide Klassen unabhängig testbar,
Mock-Tests zeigen die Zusammenarbeit.

## Aufgabe 2 – Kurs-Anmeldungen (17 Punkte)

Eine Volkshochschule nimmt Anmeldungen zu Kursen an: `POST /api/courses/{id}/enrollments`
mit verschachteltem Teilnehmenden-Objekt (Name Pflicht, E-Mail Format, Geburtsdatum vor 2012),
ein voller Kurs antwortet mit 409, ein unbekannter Kurs mit 404 und `ProblemDetail`-Referenz;
`PATCH /api/enrollments/{id}` ändert den Status (bestätigt, storniert). Das JSON des
Anmeldungs-Objekts wird zusätzlich per `@JsonTest` gegen eine Beispieldatei geprüft.
Service gestubbt (`@MockitoBean`), Controller-Tests mit `@WebMvcTest`.

Erwartete Ergebnisse: alle Statuscodes und Fehlerformate getestet, Validierungsmeldungen pro
Feld, Payload-Roundtrip bewiesen.

:::achtung Entwurf
Die vollständige Angabe mit JSON-Beispielen kommt in Phase E3 auf diese Seite.
:::
