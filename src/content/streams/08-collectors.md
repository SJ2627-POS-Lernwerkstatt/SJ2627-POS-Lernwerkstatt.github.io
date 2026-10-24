---
title: Collectors – gruppieren und zählen
minutes: 10
status: draft
---

„Wie viele Schüler hat jede Klasse?“, „Durchschnittsalter pro Klasse“, „Wer ist positiv, wer negativ?“ – bei solchen Fragen ist das Ergebnis eine **Map**. Die baust du mit `collect` und einem passenden `Collector` aus `java.util.stream.Collectors`.

Mit `import static java.util.stream.Collectors.*;` liest sich der Code kürzer.

## `groupingBy`

```java
Map<String, List<Student>> byClass = students.stream()
        .collect(groupingBy(Student::schoolClass));
// {5AHIF=[Anna, Ben], 5BHIF=[Cem, Dora, Emil]}
```

Der Schlüssel ist das, wonach du gruppierst; der Wert ist standardmäßig eine Liste der Elemente.

Meist willst du pro Gruppe aber nicht die Liste, sondern einen **Wert**. Dafür gibst du einen zweiten Collector mit:

```java
Map<String, Long> countPerClass = students.stream()
        .collect(groupingBy(Student::schoolClass, counting()));
// {5AHIF=2, 5BHIF=3}

Map<String, Integer> agesPerClass = students.stream()
        .collect(groupingBy(Student::schoolClass, summingInt(Student::age)));
// {5AHIF=37, 5BHIF=57}

Map<String, Double> avgAge = students.stream()
        .collect(groupingBy(Student::schoolClass, averagingInt(Student::age)));
// {5AHIF=18.5, 5BHIF=19.0}

Map<String, List<String>> namesPerClass = students.stream()
        .collect(groupingBy(Student::schoolClass, mapping(Student::name, toList())));
// {5AHIF=[Anna, Ben], 5BHIF=[Cem, Dora, Emil]}
```

| Collector | Wert pro Gruppe |
|---|---|
| `counting()` | Anzahl (`Long`) |
| `summingInt(...)`, `summingLong(...)` | Summe |
| `averagingInt(...)`, `averagingDouble(...)` | Durchschnitt (`Double`) |
| `mapping(f, toList())` | Liste der umgewandelten Werte |
| `maxBy(comparator)` | größtes Element (`Optional`) |

:::achtung Reihenfolge der Schlüssel
`groupingBy` liefert eine `HashMap` – die Schlüssel haben **keine** feste Reihenfolge. Brauchst du sie sortiert, gib eine `TreeMap` an: `groupingBy(Student::schoolClass, TreeMap::new, counting())`.
:::

## `partitioningBy`: in zwei Gruppen teilen

Ist das Kriterium ein `boolean`, nimm `partitioningBy`. Die Map hat immer genau die Schlüssel `true` und `false` – auch wenn eine Gruppe leer ist:

```java
Map<Boolean, List<String>> olderThan18 = students.stream()
        .collect(partitioningBy(s -> s.age() >= 19, mapping(Student::name, toList())));
// {false=[Anna, Cem], true=[Ben, Dora, Emil]}
```

## `toMap`: ein Eintrag pro Element

```java
Map<String, Integer> ageByName = students.stream()
        .collect(toMap(Student::name, Student::age));

Map<String, Student> byName = students.stream()
        .collect(toMap(Student::name, Function.identity()));
```

:::achtung Doppelte Schlüssel
Kommt ein Schlüssel zweimal vor, wirft `toMap` eine `IllegalStateException: Duplicate key 5AHIF ...`. Entweder ist `groupingBy` gemeint, oder du gibst an, wie zwei Werte zusammengeführt werden:

```java
students.stream()
        .collect(toMap(Student::schoolClass, Student::name, (a, b) -> a + ", " + b));
// {5AHIF=Anna, Ben, 5BHIF=Cem, Dora, Emil}
```
:::

## `joining`: Strings verbinden

```java
students.stream().map(Student::name).collect(joining(", "));
// "Anna, Ben, Cem, Dora, Emil"
```

:::pruefung
Bei Aufgabe 2 lautet eine Anforderung oft „… pro Monat“ oder „… je Kategorie“. Das ist fast immer `groupingBy(schlüssel, zusammenfassung)`. Teste das Ergebnis mit AssertJ: `assertThat(map).containsEntry("5AHIF", 2L)`.
:::

:::merke
- `groupingBy(schlüssel)` → `Map<K, List<T>>`, mit zweitem Collector ein Wert pro Gruppe.
- `partitioningBy(bedingung)` → `Map<Boolean, …>` mit immer beiden Schlüsseln.
- `toMap(key, value)` wirft bei doppelten Schlüsseln, außer mit Merge-Funktion.
- Sortierte Schlüssel nur mit `TreeMap::new`.
:::
