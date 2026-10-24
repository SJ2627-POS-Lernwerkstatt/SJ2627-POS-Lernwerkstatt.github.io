---
title: Sortieren mit Comparator
minutes: 8
cheatsheet: 3
status: draft
---

„Liste alle Schüler sortiert nach Alter, bei gleichem Alter nach Namen“ – solche Anforderungen kommen bei Services und Abfragen ständig vor. `sorted` plus ein `Comparator` erledigt das in einer Zeile.

## Natürliche Ordnung

Strings, Zahlen und Datumswerte haben eine **natürliche Ordnung**. `sorted()` ohne Argument verwendet sie:

```java
students.stream().map(Student::name).sorted().toList();
// [Anna, Ben, Cem, Dora, Emil]

students.stream().map(Student::name).sorted(Comparator.reverseOrder()).toList();
// [Emil, Dora, Cem, Ben, Anna]
```

## Nach einem Attribut: `Comparator.comparing`

Für Objekte sagst du, **wonach** sortiert wird:

```java
List<String> byAge = students.stream()
        .sorted(Comparator.comparing(Student::age))
        .map(Student::name)
        .toList();
// [Anna, Cem, Ben, Emil, Dora]   (18, 18, 19, 19, 20)
```

Bei gleichem Alter bleibt die ursprüngliche Reihenfolge erhalten. Willst du dich darauf nicht verlassen, gib ein zweites Kriterium an.

## Mehrere Kriterien: `thenComparing`

```java
students.stream()
        .sorted(Comparator.comparing(Student::age)
                .thenComparing(Student::name))
        .toList();
```

Zuerst nach Alter; nur wenn das Alter gleich ist, entscheidet der Name.

## Absteigend: `reversed` – aber an der richtigen Stelle

`reversed()` dreht **alles um, was davor steht**:

```java
// Älteste zuerst, bei gleichem Alter Name aufsteigend
Comparator.comparing(Student::age).reversed().thenComparing(Student::name)
// [Dora, Ben, Emil, Anna, Cem]

// Achtung: dreht auch den Namen um!
Comparator.comparing(Student::age).thenComparing(Student::name).reversed()
// [Dora, Emil, Ben, Cem, Anna]
```

Soll nur **ein** Kriterium absteigend sein, gib die Richtung direkt mit:

```java
Comparator.comparing(Student::schoolClass, Comparator.reverseOrder())
        .thenComparing(Student::name)
// 5BHIF vor 5AHIF, innerhalb der Klasse Name aufsteigend
```

:::achtung reversed() am Ende
Ein `reversed()` ganz am Ende einer Kette dreht **alle** Kriterien um. Wenn nur das erste absteigend sein soll, gehört es direkt hinter das erste `comparing(...)` – oder du verwendest `comparing(..., Comparator.reverseOrder())`.
:::

## `comparingInt` und Co.

Für `int`-, `long`- und `double`-Attribute gibt es `comparingInt`, `comparingLong` und `comparingDouble`. Sie sparen das Umwandeln in `Integer`, das Ergebnis ist dasselbe:

```java
.sorted(Comparator.comparingInt(Student::age))
```

:::merke
- `sorted()` für die natürliche Ordnung, `sorted(Comparator.reverseOrder())` umgekehrt.
- `Comparator.comparing(Klasse::attribut).thenComparing(...)` für mehrere Kriterien.
- `reversed()` dreht alles davor um; einzelnes Kriterium absteigend mit `comparing(..., Comparator.reverseOrder())`.
:::
