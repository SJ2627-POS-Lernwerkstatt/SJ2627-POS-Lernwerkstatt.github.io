---
title: "Theoriefrage: Vererbung auf Tabellen abbilden"
minutes: 10
status: draft
---

So könnte die Fragestellung lauten:

> Dein Domänenmodell enthält eine Vererbungshierarchie, die in einer relationalen Datenbank gespeichert werden soll. Welche Strategien gibt es dafür? Vergleiche ihre Vor- und Nachteile und begründe, wann du welche wählst.

Den Code dazu kennst du aus [Vererbung in JPA](/jpa/vererbung). Hier geht es um die **Begründung**.

## Schreibübung

Nimm dir **5 Minuten** und schreib deine Antwort in Stichworten. Erst dann weiterlesen.

## Das Wissen dahinter

Beispiel: `Person` (name, email) mit den Unterklassen `Speaker` (topic) und `Attendee` (ticketNumber).

| Strategie | Tabellen | Vorteile | Nachteile |
|---|---|---|---|
| **SINGLE_TABLE** (JPA-Default) | **eine** Tabelle `person` mit allen Spalten + **Discriminator**-Spalte (`person_type`) | schnell: keine Joins, polymorphe Abfragen („alle Personen“) einfach | Spalten der Unterklassen müssen **nullable** sein (keine `NOT NULL`-Constraints), viele leere Spalten, Tabelle wird breit |
| **JOINED** | eine Tabelle **pro Klasse**; Unterklassen-Tabellen haben nur ihre eigenen Spalten und einen Fremdschlüssel (= Primärschlüssel) auf `person` | sauber normalisiert, `NOT NULL` möglich, kein Platz verschwendet | **Joins** bei jedem Lesen, Einfügen in mehrere Tabellen → langsamer bei tiefen Hierarchien |
| **TABLE_PER_CLASS** | eine Tabelle pro **konkreter** Klasse mit **allen** (auch geerbten) Spalten | Abfragen auf eine Unterklasse ohne Join, `NOT NULL` möglich | polymorphe Abfragen brauchen `UNION`, Ids müssen über Tabellen eindeutig sein (kein `IDENTITY`), Spalten doppelt |
| **@MappedSuperclass** | keine Tabelle für die Oberklasse, ihre Felder landen in jeder Unterklassen-Tabelle | einfach, für gemeinsame technische Felder (Id, Zeitstempel) | **keine** Vererbung in der DB: keine Abfragen und keine Beziehungen auf die Oberklasse |

**Indizien:**

- Unterklassen haben **wenige eigene Attribute**, oft wird über die Oberklasse abgefragt → **SINGLE_TABLE**.
- Unterklassen haben **viele eigene, verpflichtende** Attribute, Datenintegrität ist wichtig → **JOINED**.
- Es wird fast nie über die Oberklasse abgefragt, Unterklassen sind eigenständig → **TABLE_PER_CLASS** (oder `@MappedSuperclass`, wenn die Oberklasse nur gemeinsame Felder liefert).
- Andere Entities verweisen auf die **Oberklasse** (z. B. `@ManyToOne Person`) → SINGLE_TABLE oder JOINED.

## Musterantwort

> Relationale Datenbanken kennen keine Vererbung, daher gibt es in JPA drei Strategien (`@Inheritance`). Bei **SINGLE_TABLE** (Standard) landen alle Klassen der Hierarchie in einer Tabelle; eine Discriminator-Spalte speichert, um welche Unterklasse es sich handelt. Vorteil: keine Joins, sehr schnelle und einfache polymorphe Abfragen. Nachteil: Die Spalten der Unterklassen müssen nullable sein, man verliert also `NOT NULL`-Constraints, und es entstehen viele leere Felder.
>
> Bei **JOINED** bekommt jede Klasse eine eigene Tabelle; die Tabellen der Unterklassen enthalten nur ihre eigenen Spalten und verweisen über den Primärschlüssel (zugleich Fremdschlüssel) auf die Tabelle der Oberklasse. Das Schema ist normalisiert und Constraints sind möglich, dafür braucht jede Abfrage Joins und jedes Einfügen mehrere Statements. Bei **TABLE_PER_CLASS** hat jede konkrete Klasse eine vollständige eigene Tabelle inklusive der geerbten Spalten; Abfragen auf eine Unterklasse sind schnell, Abfragen über die Oberklasse aber nur per `UNION` möglich, und die Ids müssen tabellenübergreifend eindeutig sein. Zusätzlich gibt es `@MappedSuperclass`, wenn die Oberklasse nur gemeinsame Felder liefert und selbst kein Entity ist.
>
> Für **SINGLE_TABLE** spricht, wenn die Unterklassen wenige eigene Attribute haben und oft über die Oberklasse abgefragt wird. **JOINED** wähle ich, wenn Unterklassen viele eigene Pflichtattribute haben und Datenintegrität wichtig ist. **TABLE_PER_CLASS**, wenn fast nie polymorph abgefragt wird.

:::pruefung
Checkliste – hast du …
- alle **drei Strategien** (SINGLE_TABLE, JOINED, TABLE_PER_CLASS) mit ihrer Tabellenstruktur beschrieben?
- **Discriminator**-Spalte bei SINGLE_TABLE erwähnt?
- je **Vor- und Nachteile** genannt (nullable / Joins / UNION)?
- **Indizien** für die Wahl genannt?
- `@MappedSuperclass` als Abgrenzung erwähnt (Bonus)?
:::
