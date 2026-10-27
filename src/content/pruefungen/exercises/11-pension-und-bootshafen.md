---
title: Probeprüfung 11 – Pension und Bootshafen
minutes: 300
grading: teacher
size: full
status: draft
rubric:
  erwartet: >-
    Alle vier Aufgaben sind selbstständig und vollständig umgesetzt: beide OR-Mappings mit
    Constraints, Beziehungen und Lifecycle-Tests, der Service mit sauberen Regeln und eigenen
    Tests, die REST-API mit Validierung, Fehlern und `@WebMvcTest`-Tests.
  genuegend: >-
    Zwei Aufgaben elementar gelöst, die anderen angefangen; Tests fehlen meist.
  befriedigend: >-
    Alle vier angefangen, zwei brauchbar; Constraints, Exceptions oder Fehlfälle offen.
  gut: >-
    Drei Aufgaben vollständig, eine brauchbar; Teststrategie teilweise ungenau.
  sehrGut: >-
    Alle vier vollständig und prüfbar, inklusive good/edge/exception-Tests und sauberer
    Benennung.
---

Die zweite volle Probeprüfung: **vier Aufgaben, 300 Minuten, je 17 Punkte** – beide
OR-Mapping-Aufgaben sind zu lösen. Zeitplan und Vorgehen:
[So läuft eine Probeprüfung](/pruefungen/ablauf).

| Aufgabe | Thema | Punkte | Zeit |
|---|---|---|---|
| 1 | OR-Mapping: Pension Seeblick | 17 | 70 min |
| 2 | OR-Mapping: Bootshafen (ElementCollection + OneToOne) | 17 | 80 min |
| 3 | Business-Service: Versandkosten | 17 | 75 min |
| 4 | REST-API: Projekt-Tasks | 17 | 75 min |

:::achtung Entwurf
Die vollständigen Angaben mit UML-Diagrammen kommen in Phase E4. Aufgabe 3 und 4 sind
dieselben Themen wie in den mittleren Probeprüfungen 6 und 5 – in neuer Paarung.
:::

## Aufgabe 1 – Pension Seeblick (17 Punkte)

Gäste (E-Mail als Rich Type, Adresse als Value Object) buchen Übernachtungen in Zimmern
(`ZimmerNr` Rich Type, Etage, Preis pro Nacht `BigDecimal(6,2)`, Beschreibung length 200).
Übernachtung gehört je genau zu Gast und Zimmer; die Beziehung zu den Übernachtungen läuft
bidirektional von der Zimmerseite mit Hilfsmethoden und `cascade = PERSIST` – Gäste werden
zuerst gespeichert. Eindeutige Zimmernummer mit benanntem Constraint, benannte Fremdschlüssel
`fk_uebernachtung_gast` und `fk_uebernachtung_zimmer`. Repositories und Lifecycle-Tests wie
bei Aufgabe 1 der kleinen Probeprüfungen.

## Aufgabe 2 – Bootshafen (17 Punkte)

Eigner (Name, Adresse VO) besitzen Boote (Name, `Registrierungsnummer` Rich Type über
Converter, Länge in Metern). Jeder Liegeplatz beherbergt **höchstens ein Boot**:
`@OneToOne` auf der Bootseite mit UNIQUE-Fremdschlüssel-Spalte, benannt `fk_boot_liegeplatz`.
Die Wartungshistorie eines Boots ist eine **`@ElementCollection`** (Wertobjekt Datum, Kosten
`BigDecimal(8,2)`, Beschreibung) in der Tabelle **`boot_wartungen`** mit Spalte `boot_id`.
Abgeleitete Query `findByLiegeplatz`. Besonderheit: 1:1 mit UNIQUE und ElementCollection.
