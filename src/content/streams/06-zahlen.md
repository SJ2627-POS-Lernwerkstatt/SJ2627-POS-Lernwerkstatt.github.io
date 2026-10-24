---
title: Mit Zahlen rechnen
minutes: 8
cheatsheet: 3
status: draft
---

Summen und Durchschnitte sind der Kern vieler Geschäftsregeln bei Aufgabe 2: Gesamtdauer, Durchschnittsnote, Umsatz pro Monat. Streams haben dafür eigene Varianten für Zahlen.

## `mapToInt` & Co.

Ein `Stream<Student>` kennt kein `sum()` – woher soll er wissen, was er addieren soll? Mit `mapToInt` wandelst du ihn in einen `IntStream` um, der rechnen kann:

```java
int sumOfAges = students.stream()
        .mapToInt(Student::age)
        .sum();                                  // 94

OptionalDouble averageAge = students.stream()
        .mapToInt(Student::age)
        .average();                              // OptionalDouble[18.8]
```

Für `long`- und `double`-Werte gibt es `mapToLong` und `mapToDouble`.

| Operation | Ergebnis | bei leerem Stream |
|---|---|---|
| `sum()` | `int` / `long` / `double` | `0` |
| `average()` | `OptionalDouble` | leer |
| `min()`, `max()` | `OptionalInt` … | leer |
| `count()` | `long` | `0` |
| `summaryStatistics()` | min, max, Durchschnitt, Summe, Anzahl auf einmal | Anzahl 0 |

Der Durchschnitt ist ein `Optional`, weil man aus nichts keinen Durchschnitt bilden kann. Entscheide, was dann gelten soll:

```java
double avgPos = students.stream()
        .flatMap(s -> s.grades().stream())
        .filter(g -> g.subject().equals("POS"))
        .mapToInt(Grade::value)
        .average()
        .orElse(0.0);                            // 2.5
```

:::achtung Ganzzahl-Division
Rechnest du den Durchschnitt selbst aus, denk an den Typ: `5 / 2` ist in Java `2`, nicht `2.5`. Erst `(double) 5 / 2` ergibt `2.5`. `average()` nimmt dir das ab.
:::

## `reduce`: alles zu einem Wert zusammenfassen

`reduce` kombiniert die Elemente schrittweise: Startwert und eine Funktion, die zwei Werte zu einem macht.

```java
int total = Stream.of(1, 2, 3, 4).reduce(0, Integer::sum);          // 10
int product = Stream.of(1, 2, 3, 4).reduce(1, (a, b) -> a * b);     // 24
```

Der Startwert ist das Ergebnis für einen leeren Stream – deshalb `0` für die Summe und `1` für das Produkt. Ohne Startwert liefert `reduce` ein `Optional`:

```java
Optional<Integer> sum = Stream.of(1, 2, 3).reduce(Integer::sum);    // Optional[6]
```

Für Summen ist `mapToInt(...).sum()` kürzer und klarer. `reduce` brauchst du für eigene Kombinationen, z. B. um `Duration`- oder `BigDecimal`-Werte zu addieren:

```java
BigDecimal total = invoices.stream()
        .map(Invoice::amount)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
```

## Zurück zu Objekten: `boxed`

Ein `IntStream` hat kein `toList()` für `Integer`. Mit `boxed()` (oder `mapToObj`) wird er wieder ein normaler Stream:

```java
List<Integer> numbers = IntStream.rangeClosed(1, 3).boxed().toList();   // [1, 2, 3]
```

:::merke
- `mapToInt(...)` → `sum()`, `average()`, `min()`, `max()`, `summaryStatistics()`.
- `average()` liefert `OptionalDouble`; mit `orElse` den leeren Fall festlegen.
- `reduce(startwert, funktion)` für eigene Zusammenfassungen, z. B. `BigDecimal::add`.
:::
