---
title: Probeprüfung 6 – Versandkosten und Produktkatalog
minutes: 180
grading: teacher
size: medium
status: draft
rubric:
  erwartet: >-
    Beide Aufgaben sind selbstständig und vollständig umgesetzt: der Service mit Gruppierung
    und Aggregation über Maps, die REST-API mit Pagination und HATEOAS-Links, jeweils mit
    eigenen Tests.
  genuegend: >-
    Beide Aufgaben sind angefangen; einfache Fälle laufen, Gruppierung und Seiten-Links fehlen.
  befriedigend: >-
    Eine Aufgabe brauchbar, die andere angefangen; Hauptfälle funktionieren, Randfälle offen.
  gut: >-
    Beide Aufgaben weitgehend vollständig; Testabdeckung bei Fehlfällen und leeren Seiten
    ungenau.
  sehrGut: >-
    Beide Aufgaben vollständig und prüfbar inklusive leerer Ergebnisse, Sortierung und
    Link-Struktur – gute Teststrategie.
---

Diese mittlere Probeprüfung dauert **180 Minuten**: zwei unabhängige Aufgaben zu je 17 Punkten.
Du brauchst das Service-Modul (Einheiten 1–10) und das REST-Modul (speziell Pagination und
HATEOAS, Einheiten 13–14). Zeitplan-Vorschlag: 90 Minuten pro Aufgabe. Der Ablauf steht in
[So läuft eine Probeprüfung](/pruefungen/ablauf).

| Aufgabe | Thema | Punkte | Zeit |
|---|---|---|---|
| B | Business-Service: Versandkosten | 17 | 90 min |
| C | REST-API: Produktkatalog | 17 | 90 min |

Beide Aufgaben bearbeitest du in einem Projekt: `Aufgabe2_BusinessService` und
`Aufgabe3_RestfulApi` – wie bei der Matura, nur ohne OR-Mapping. Bei jedem Push laufen deine
eigenen Tests; schlagen sie fehl, siehst du das an der Abgabe.

## Aufgabe B – Versandkostenrechner (17 Punkte)

Ein Versandhaus berechnet Portokosten: Pakete haben Gewicht und **Zone**; pro Zone gilt ein
Staffeltarif, ab einem Bestellwert entfällt das Porto, Sperrgut hat einen Zuschlag. Der Service
liefert für eine Bestellung die Kosten **je Paket** und die Gesamtsumme – als Map vom Paket
zum Betrag, gruppiert nach Zone. Datenklassen als Records, eigene Testdaten mit AssertJ,
Exceptions bei unbekannten Zonen. Reines Java, nur JUnit.

Erwartete Ergebnisse: alle Tarifgrenzen (genau auf der Stufe, knapp darüber, Gratisgrenze)
getestet, Gruppierung korrekt, keine Magic Numbers verstreut.

## Aufgabe C – Produktkatalog-API (17 Punkte)

Ein Shop stellt seinen Katalog als API bereit: `GET /api/products` **paginiert** mit `Pageable`
(Seite, Größe, Sortierung nach Name), Antwort als `PagedModel` mit `_links` auf die erste, letzte,
nächste und vorige Seite; `GET /api/products/{id}` mit Link auf die Kategorie; unbekannte ID als
`ProblemDetail` mit Referenz. Der Service ist ein Stub, ersetzt durch `@MockitoBean`;
getestet mit `@WebMvcTest` – auch die leere letzte Seite und die Sortierung.

Erwartete Ergebnisse: Seitenzahlen und Links stimmen, `PageImpl` wird nicht direkt
serialisiert, die Teststrategie deckt good, edge und exception cases ab.

:::achtung Entwurf
Die vollständige Angabe mit JSON-Beispielen kommt in Phase E3 auf diese Seite.
:::
