---
title: Probeprüfung 12 – Bäckereikette und Messe
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
    Vollständig und prüfbar: Join-Tabelle gepflegt, Projektion als Record, Aggregate korrekt
    typisiert.
---

Die vierte volle Probeprüfung: **vier Aufgaben, 300 Minuten, je 17 Punkte**. Zeitplan und
Vorgehen: [So läuft eine Probeprüfung](/pruefungen/ablauf).

| Aufgabe | Thema | Punkte | Zeit |
|---|---|---|---|
| A1 | OR-Mapping: Bäckereikette | 17 | 70 min |
| A2 | OR-Mapping: Messe (m:n + Projektionen) | 17 | 80 min |
| B | Business-Service: Bonusprogramm | 17 | 75 min |
| C | REST-API: Sensorwerte | 17 | 75 min |

:::achtung Entwurf
Die vollständigen Angaben mit UML-Diagrammen kommen in Phase E4. Die Aufgaben B und C
behandeln die Themen der mittleren Probeprüfungen 8 und 7 – in neuer Paarung.
:::

## Aufgabe A1 – Bäckereikette (17 Punkte)

Filialen (Adresse VO, Eröffnungsdatum) verkaufen Produkte (Name eindeutig, Preis
`BigDecimal(6,2)`); Bestellungen (Bestelldatum, Abholzeit, Kundenname, `@ManyToOne` Filiale mit
benanntem FK `fk_customer_order_branch`; Entity `CustomerOrder`, weil `order` in H2 reserviert ist) enthalten Positionen (Anzahl, Einzelpreis, `@ManyToOne`
Produkt) als bidirektionale **Komposition** von der Bestellung aus: `cascade = ALL`,
`orphanRemoval = true`. Eine Position wird entfernt, indem man sie aus der Collection der Bestellung nimmt.
Lifecycle-Test auch für das Löschen einer Position.

## Aufgabe A2 – Messe (17 Punkte)

Messen (Name, von/bis, Gelände-Adresse als VO) haben Hallen (`@ManyToOne` Messe, bidirektional),
Hallen haben Aussteller (Firma, `EmailAddress` Rich Type). **Aussteller ↔ Produkte ist
eine m:n-Beziehung**: Tabelle `exhibitor_products` mit Spalten `exhibitor_id`/`product_id`,
Hilfsmethoden auf der Ausstellerseite. Projektionen als Record:
`record ExhibitorProduct(String company, String productName, String hallName)` per
JPQL-Dreifach-Join; dazu `count(distinct e.hall)` über die Produkte einer Messe und die
Lifecycle-Tests der m:n-Beziehung (nach clear vorhanden, Entfernen auf einer Seite).
Die Struktur entspricht Haupttermin 2026, Aufgabe 1.
