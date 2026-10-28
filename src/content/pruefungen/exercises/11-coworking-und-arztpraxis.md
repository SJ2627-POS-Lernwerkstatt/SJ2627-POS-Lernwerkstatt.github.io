---
title: Probeprüfung 11 – Coworking und Arztpraxis
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
| A1 | OR-Mapping: Coworking-Space | 17 | 70 min |
| A2 | OR-Mapping: Arztpraxis (Vererbung) | 17 | 80 min |
| B | Business-Service: Energie-Abrechnung | 17 | 75 min |
| C | REST-API: Feriencamp-Anmeldungen | 17 | 75 min |

:::achtung Entwurf
Die vollständigen Angaben mit UML-Diagrammen kommen in Phase E4. Die Aufgaben B und C
behandeln die Themen der mittleren Probeprüfungen 7 und 8 – in neuer Paarung.
:::

## Aufgabe A1 – Coworking-Space (17 Punkte)

Mitglieder (Firma, `EmailAddress` Rich Type, Adresse VO, Beitrittsdatum) buchen Räume (Name
eindeutig, Kapazität, Preis pro Stunde `BigDecimal(6,2)`). Jede Buchung hat von/bis als
`LocalDateTime` und je ein `@ManyToOne` mit benannten Fremdschlüsseln `fk_booking_room` und
`fk_booking_member`. Raum ↔ Buchungen bidirektional mit Hilfsmethoden, `cascade = PERSIST`
nur an der Raumseite. Abgeleitete Query
`findByCapacityGreaterThanOrderByPricePerHourAsc`. Lifecycle-Tests über alle drei Entities.

## Aufgabe A2 – Arztpraxis (17 Punkte)

Das Personal einer Praxis ist eine **Vererbungshierarchie**: Basisklasse `Employee` (Name,
Geburtsdatum, Adresse VO) mit `@Inheritance(SINGLE_TABLE)` und Diskriminator-Spalte
`employee_type`; Subklassen `Doctor` (Fachrichtung), `Nurse` (Schicht) und
`Clerk` (Abteilung). Patienten (Name, Adresse
VO) haben `@ManyToOne` auf den betreuenden Arzt. `DoctorRepository extends
JpaRepository<Doctor, Long>`: nach flush und clear muss ein `Doctor` als `Doctor` zurückkommen;
abgeleitete Query `findAllByShift` im `NurseRepository`, JPQL `count` über alle
Mitarbeitenden. Die Struktur entspricht Haupttermin 2026, Aufgabe 2.
