---
title: Probeprüfung 13 – Bäckereikette und Messe
minutes: 300
grading: teacher
size: full
status: draft
rubric:
  erwartet: >-
    Alle vier Aufgaben sind selbstständig und vollständig umgesetzt: beide OR-Mappings
    (eines mit m:n und Projektionen), der aufgeteilte Service, die REST-API mit
    Parameter-Varianten und vollständigen Tests.
  genuegend: >-
    Zwei Aufgaben elementar gelöst; Join-Tabelle und Projektionen fehlen.
  befriedigend: >-
    Alle vier angefangen, zwei brauchbar; orphanRemoval, Aggregat-Typen offen.
  gut: >-
    Drei vollständig, eine brauchbar; m:n-Lifecycle und Teststrategie teilweise ungenau.
  sehrGut: >-
    Vollständig und prüfbar: Join-Table gepflegt, Projektion als Record, Aggregate korrekt
    typisiert.
---

Die vierte volle Probeprüfung: **vier Aufgaben, 300 Minuten, je 17 Punkte**. Zeitplan und
Vorgehen: [So läuft eine Probeprüfung](/pruefungen/ablauf).

| Aufgabe | Thema | Punkte | Zeit |
|---|---|---|---|
| 1 | OR-Mapping: Bäckereikette | 17 | 70 min |
| 2 | OR-Mapping: Messe (m:n + Projektionen) | 17 | 80 min |
| 3 | Business-Service: Bonusprogramm | 17 | 75 min |
| 4 | REST-API: Sensorwerte | 17 | 75 min |

:::achtung Entwurf
Die vollständigen Angaben mit UML-Diagrammen kommen in Phase E4. Aufgabe 3 und 4 sind die
Themen der mittleren Probeprüfungen 8 und 7 – in neuer Paarung.
:::

## Aufgabe 1 – Bäckereikette (17 Punkte)

Filialen (Adresse VO, Eröffnungsdatum) verkaufen Produkte (Name unique, Preis
`BigDecimal(6,2)`); Bestellungen (Bestelldatum, Abholzeit, Kundenname, `@ManyToOne` Filiale mit
benanntem FK `fk_bestellung_filiale`) enthalten Positionen (Anzahl, Einzelpreis, `@ManyToOne`
Produkt) als bidirektionale **Komposition** von der Bestellung aus: `cascade = ALL`,
`orphanRemoval = true`. Position entfernen heißt aus der Collection entfernen.
Lifecycle-Test auch für das Löschen einer Position.

## Aufgabe 2 – Messe (17 Punkte)

Messen (Name, von/bis, Adresse VO Gelände) haben Hallen (`@ManyToOne` Messe, bidirektional),
Hallen haben Aussteller (Firma, `EmailAdresse` Rich Type). **Aussteller ↔ Produkte ist
many-to-many**: Tabelle `messe_produkte` mit Spalten `aussteller_id`/`produkt_id`,
Hilfsmethoden auf der Ausstellerseite. Projektionen als Record:
`record AusstellerProdukt(String firma, String produktName, String hallenBezeichnung)` per
JPQL-Dreifach-Join; dazu `count(distinct a.halle)` über die Produkte einer Messe und die
Lebensdauer-Tests der m:n-Beziehung (nach clear vorhanden, Lösen in eine Richtung).
Spiegel der Struktur aus Haupttermin 2026, Aufgabe 1.
