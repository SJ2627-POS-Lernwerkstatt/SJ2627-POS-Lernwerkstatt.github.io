---
title: Immobilienmakler – kleine Probeprüfung
minutes: 90
grading: auto
size: small
status: draft
rubric:
  erwartet: >-
    Die Angabe ist vollständig und selbstständig umgesetzt: alle Entities mit den Namen und
    Attributen aus dem UML-Diagramm, Constraints und benannte Foreign Keys, Repositories und
    Lifecycle-Tests mit `@DataJpaTest`. Alle Bewertungstests bestehen.
  genuegend: >-
    Die Entities existieren und werden gespeichert; wesentliche Details fehlen (Constraints,
    No-Args-Konstruktor oder Tests). Einzelne Bewertungstests bestehen.
  befriedigend: >-
    Entities, Keys und Repositories stimmen; einige Constraints und Beziehungen sind ungenau.
    Die Tests laufen teilweise.
  gut: >-
    Mapping und Constraints sind korrekt, alle Tests der eigenen Lifecycle-Tests laufen; einzelne
    Detailpunkte (Spaltennamen, Benennungen) fehlen noch.
  sehrGut: >-
    Alles stimmt bis auf die letzten Details: benannte Constraints, abgeleitete Query, gekapselte
    Listen – alle Bewertungstests grün.
---

Eine kleine Probeprüfung wie den ersten Teil der Matura: **eine OR-Mapping-Aufgabe, 90 Minuten,
17 Punkte**, automatisch bewertet. Du brauchst die Einheiten 1–10 aus dem JPA-Modul.
Der Ablauf steht in [So läuft eine Probeprüfung](/pruefungen/ablauf).

## Aufgabe 1 – Ein Maklermodell in die Datenbank (17 Punkte)

Ein Immobilienmakler verwaltet **Objekte** und **Interessenten**. Jedes Objekt hat eine Lage
(Adresse als Value Object), eine Fläche und einen Preis; Interessenten melden sich mit
E-Mail (Rich Type) und wollen Besichtigungen buchen.

```plantuml
@startuml
hide empty methods

class Address <<(V) ValueObject>> {
  - street : String {nn}
  - city : String {nn}
  - zip : String {nn}
}

class Property <<(E) Entity>> {
  - title : String {nn}
  - areaSqm : BigDecimal {nn}
  - price : BigDecimal {nn}
}

class Buyer <<(E) Entity>> {
  - name : String {nn}
  - email : String {uq}
}

class Viewing <<(E) Entity>> {
  - date : LocalDateTime {nn}
}

Address -- Property : location {nn}
Property "1" -- "0..*" Viewing : shown for
Buyer "1" -- "0..*" Viewing : wants
@enduml
```

:::achtung Entwurf
Die vollständige Angabe mit allen Attributen, Längen, Precision-Werten und exakten Namen
(Benennung der Tabellen, Foreign Keys, abgeleitete Query) kommt in Phase E2 auf diese Seite.
Diese Skizze zeigt nur die Struktur.
:::

## Was du baust

- Entities `Property`, `Buyer`, `Viewing` im Package `ormapping.model`, Address als `@Embeddable`.
- Repositories und je ein `@DataJpaTest`, der Speichern und Wiederlesen prüft (flush/clear nicht
  vergessen).
- Constraints aus dem Diagramm: `not null`, unique E-Mail, `precision/scale` bei `BigDecimal`.

Erwartete Ergebnisse und Bewertung siehe unten bei **Beurteilung** – nach der Abgabe schätzt du
dich selbst ein; die Punkte kommen aus dem Autograding-Release in deinem Repository.
