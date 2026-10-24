---
title: distinct, limit, skip und peek
minutes: 6
cheatsheet: 3
status: draft
---

Vier kleine Zwischenschritte, die oft gebraucht werden: Duplikate entfernen, die ersten *n* nehmen, Elemente überspringen und in die Pipeline hineinschauen.

## `distinct`: Duplikate entfernen

```java
students.stream()
        .map(Student::schoolClass)
        .distinct()
        .toList();
// [5AHIF, 5BHIF]
```

`distinct` vergleicht mit `equals`. Bei Records und Strings funktioniert das automatisch; bei eigenen Klassen nur, wenn sie `equals` und `hashCode` überschreiben.

## `limit` und `skip`

```java
// Die zwei Ältesten
students.stream()
        .sorted(Comparator.comparing(Student::age).reversed())
        .limit(2)
        .map(Student::name)
        .toList();
// [Dora, Ben]

// "Seite 2" mit je 2 Einträgen
students.stream().map(Student::name).sorted()
        .skip(2)
        .limit(2)
        .toList();
// [Cem, Dora]
```

Die Reihenfolge der Schritte ist entscheidend: **Erst sortieren, dann `limit`.** Umgekehrt nimmst du zwei beliebige Schüler und sortierst nur diese beiden.

`limit` hört auf, sobald genug Elemente da sind. Deshalb funktioniert es sogar mit unendlichen Streams:

```java
Stream.iterate(1, i -> i + 1)       // 1, 2, 3, ... ohne Ende
        .filter(i -> i % 2 == 0)
        .limit(2)
        .toList();
// [2, 4]
```

## `peek`: Hineinschauen beim Debuggen

`peek` führt für jedes Element eine Aktion aus und gibt es **unverändert** weiter. Nützlich, um zu sehen, was an einer Stelle der Pipeline ankommt:

```java
students.stream()
        .peek(s -> System.out.println("vorher: " + s.name()))
        .filter(s -> s.age() > 18)
        .peek(s -> System.out.println("nachher: " + s.name()))
        .map(Student::name)
        .toList();
```

Die Ausgabe zeigt, dass ein Stream die Elemente **einzeln** durch die ganze Pipeline schickt: *vorher: Anna*, *vorher: Ben*, *nachher: Ben*, *vorher: Cem* …

:::achtung peek ist nur zum Debuggen
Verlass dich nicht darauf, dass `peek` ausgeführt wird. Bei `Stream.of("a", "b", "c").peek(...).count()` wird **nichts** ausgegeben: Java kennt die Anzahl schon und spart sich die Pipeline. Echte Arbeit (speichern, Listen befüllen) gehört nicht in `peek`.
:::

:::merke
- `distinct()` entfernt Duplikate nach `equals`.
- `limit(n)` / `skip(n)` – erst sortieren, dann begrenzen.
- `peek` nur zum Debuggen, nie für Logik.
:::
