---
title: Collectors – grouping and counting
---

"How many students does each class have?", "average age per class", "who passes, who fails?" – for questions like these the result is a **map**. You build it with `collect` and a matching `Collector` from `java.util.stream.Collectors`.

With `import static java.util.stream.Collectors.*;` the code reads shorter.

## `groupingBy`

```java
Map<String, List<Student>> byClass = students.stream()
        .collect(groupingBy(Student::schoolClass));
// {5AHIF=[Anna, Ben], 5BHIF=[Cem, Dora, Emil]}
```

The key is what you group by; by default the value is a list of the elements.

Usually you do not want the list per group, though, but a **value**. For that you pass a second collector:

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

| Collector | value per group |
|---|---|
| `counting()` | count (`Long`) |
| `summingInt(...)`, `summingLong(...)` | sum |
| `averagingInt(...)`, `averagingDouble(...)` | average (`Double`) |
| `mapping(f, toList())` | list of the transformed values |
| `maxBy(comparator)` | largest element (`Optional`) |

:::achtung Order of the keys
`groupingBy` returns a `HashMap` – the keys have **no** fixed order. If you need them sorted, pass a `TreeMap`: `groupingBy(Student::schoolClass, TreeMap::new, counting())`.
:::

## `partitioningBy`: splitting into two groups

If the criterion is a `boolean`, use `partitioningBy`. The map always has exactly the keys `true` and `false` – even if one group is empty:

```java
Map<Boolean, List<String>> olderThan18 = students.stream()
        .collect(partitioningBy(s -> s.age() >= 19, mapping(Student::name, toList())));
// {false=[Anna, Cem], true=[Ben, Dora, Emil]}
```

## `toMap`: one entry per element

```java
Map<String, Integer> ageByName = students.stream()
        .collect(toMap(Student::name, Student::age));

Map<String, Student> byName = students.stream()
        .collect(toMap(Student::name, Function.identity()));
```

:::achtung Duplicate keys
If a key occurs twice, `toMap` throws an `IllegalStateException: Duplicate key 5AHIF ...`. Either `groupingBy` is what you mean, or you say how two values are merged:

```java
students.stream()
        .collect(toMap(Student::schoolClass, Student::name, (a, b) -> a + ", " + b));
// {5AHIF=Anna, Ben, 5BHIF=Cem, Dora, Emil}
```
:::

## `joining`: connecting strings

```java
students.stream().map(Student::name).collect(joining(", "));
// "Anna, Ben, Cem, Dora, Emil"
```

:::pruefung
In Task 2 a requirement often says "… per month" or "… per category". That is almost always `groupingBy(key, summary)`. Test the result with AssertJ: `assertThat(map).containsEntry("5AHIF", 2L)`.
:::

:::merke
- `groupingBy(key)` → `Map<K, List<T>>`, with a second collector one value per group.
- `partitioningBy(condition)` → `Map<Boolean, …>` always with both keys.
- `toMap(key, value)` throws on duplicate keys, unless you give a merge function.
- Sorted keys only with `TreeMap::new`.
:::
