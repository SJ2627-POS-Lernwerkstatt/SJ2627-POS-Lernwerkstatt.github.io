---
title: Probeprüfung 12 – Coworking und Arztpraxis
minutes: 300
grading: teacher
size: full
status: draft
rubric:
  erwartet: >-
    Alle vier Aufgaben sind selbstständig und vollständig umgesetzt: beide OR-Mappings
    (eines mit Vererbung), der Service mit Spring-Injektion und Exceptions, die REST-API
    mit nested Validation und `@JsonTest`.
  genuegend: >-
    Zwei Aufgaben elementar gelöst; Vererbung und Testdetails fehlen.
  befriedigend: >-
    Alle vier angefangen, zwei brauchbar; Diskriminator, Validierungsdetails offen.
  gut: >-
    Drei vollständig, eine brauchbar; Tests der Subtypen und Payload-Tests lückenhaft.
  sehrGut: >-
    Vollständig und prüfbar: SINGLE_TABLE korrekt abgebildet, alle Schichten getestet.
---

Die dritte volle Probeprüfung: **vier Aufgaben, 300 Minuten, je 17 Punkte**. Zeitplan und
Vorgehen: [So läuft eine Probeprüfung](/pruefungen/ablauf).

| Aufgabe | Thema | Punkte | Zeit |
|---|---|---|---|
| 1 | OR-Mapping: Coworking-Space | 17 | 70 min |
| 2 | OR-Mapping: Arztpraxis (Vererbung) | 17 | 80 min |
| 3 | Business-Service: Energie-Abrechnung | 17 | 75 min |
| 4 | REST-API: Kurs-Anmeldungen | 17 | 75 min |

:::achtung Entwurf
Die vollständigen Angaben mit UML-Diagrammen kommen in Phase E4. Aufgabe 3 und 4 sind die
Themen der mittleren Probeprüfungen 7 und 8 – in neuer Paarung.
:::

## Aufgabe 1 – Coworking-Space (17 Punkte)

Mitglieder (Firma, `EmailAdresse` Rich Type, Adresse VO, Beitrittsdatum) buchen Räume (Name
unique, Kapazität, Preis pro Stunde `BigDecimal(6,2)`) für Buchungen (von/bis als
`LocalDateTime`, je ein `@ManyToOne` mit benannten Fremdschlüsseln `fk_buchung_raum` und
`fk_buchung_mitglied`). Raum ↔ Buchungen bidirektional mit Hilfsmethoden, `cascade = PERSIST`
nur an der Raumseite. Abgeleitete Query
`findByKapazitaetGreaterThanOrderByPreisProStundeAsc`. Lifecycle-Tests über alle drei Entities.

## Aufgabe 2 – Arztpraxis (17 Punkte)

Das Personal einer Praxis ist eine **Vererbungshierarchie**: Basisklasse `Mitarbeiter` (Name,
Geburtsdatum, Adresse VO) mit `@Inheritance(SINGLE_TABLE)` und Diskriminator-Spalte
`mitarbeiter_typ`; Subklassen `Arzt` (Spezialisierung), `Pflegekraft` (Schicht) und
`Verwaltungsangestellter` (Abteilung) – ohne weitere Besonderheiten. Patienten (Name, Adresse
VO) haben `@ManyToOne` auf den betreuenden Arzt. `ArztRepository extends
JpaRepository<Arzt, Long>`: nach flush und clear muss ein `Arzt` als `Arzt` zurückkommen;
abgeleitete Query `findAllBySchicht` auf der Pflegekraft-Seite, JPQL `count` über alle
Mitarbeiter. Spiegel der Struktur aus Haupttermin 2026, Aufgabe 2.
