---
title: Creating, filtering and transforming streams
---

A stream is a **pipeline**: data comes from a source, runs through intermediate steps and is combined into a result at the end.

```java
List<String> names = students.stream()                        // source
        .filter(s -> s.schoolClass().equals("5AHIF"))         // intermediate step
        .map(Student::name)                                   // intermediate step
        .toList();                                            // terminal operation
// [Anna, Ben]
```

## Sources

| Source | Example |
|---|---|
| collection | `students.stream()` |
| single values | `Stream.of("a", "b", "c")` |
| array | `Arrays.stream(numbers)` |
| range of numbers | `IntStream.rangeClosed(1, 5)` (1 to 5), `IntStream.range(1, 5)` (1 to 4) |

## `filter` and `map`

- `filter(Predicate)` keeps only the elements for which the condition is `true`.
- `map(Function)` turns every element into something else: student → name, name → upper case.

```java
List<String> upper = students.stream()
        .map(Student::name)
        .map(String::toUpperCase)
        .toList();
// [ANNA, BEN, CEM, DORA, EMIL]
```

The order matters: filter first, then transform – after `map(Student::name)` you only have strings and can no longer filter by class.

## Without a terminal operation nothing happens

Intermediate steps are **lazy**: they only describe what should happen. Only the terminal operation (`toList`, `count`, `forEach`, `collect` …) sets the pipeline in motion.

```java
students.stream().filter(s -> s.age() > 18);   // filters nothing – the terminal operation is missing
```

A stream can only be used **once**. A second `toList()` on the same stream throws `IllegalStateException: stream has already been operated upon or closed`. If you need the data again, call `students.stream()` anew.

## `toList()` or `collect(Collectors.toList())`?

Both return a list, but:

| | `toList()` | `collect(Collectors.toList())` |
|---|---|---|
| since | Java 16 | Java 8 |
| list modifiable? | **no** – `add` throws `UnsupportedOperationException` | yes (currently an `ArrayList`) |

For results that you only return or check, `toList()` is the right choice. If you definitely need a modifiable list, say so explicitly: `collect(Collectors.toCollection(ArrayList::new))`.

:::achtung Modifying a list from toList()
```java
List<String> names = students.stream().map(Student::name).toList();
names.add("Fritz");   // UnsupportedOperationException
```
This happens often when a service returns a result and the caller wants to extend it afterwards.
:::

:::merke
- Source → intermediate steps (`filter`, `map`, …) → **one** terminal operation.
- Without a terminal operation nothing runs; every stream only once.
- `toList()` returns an unmodifiable list.
:::
