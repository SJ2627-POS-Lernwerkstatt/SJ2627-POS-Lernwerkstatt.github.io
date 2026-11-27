---
title: distinct, limit, skip and peek
---

Four small intermediate steps that are needed often: removing duplicates, taking the first *n*, skipping elements and looking into the pipeline.

## `distinct`: removing duplicates

```java
students.stream()
        .map(Student::schoolClass)
        .distinct()
        .toList();
// [5AHIF, 5BHIF]
```

`distinct` compares with `equals`. For records and strings that works automatically; for your own classes only if they override `equals` and `hashCode`.

## `limit` and `skip`

```java
// the two oldest
students.stream()
        .sorted(Comparator.comparing(Student::age).reversed())
        .limit(2)
        .map(Student::name)
        .toList();
// [Dora, Ben]

// "page 2" with 2 entries each
students.stream().map(Student::name).sorted()
        .skip(2)
        .limit(2)
        .toList();
// [Cem, Dora]
```

The order of the steps is crucial: **sort first, then `limit`.** The other way round you take two arbitrary students and only sort those two.

`limit` stops as soon as there are enough elements. That is why it even works with infinite streams:

```java
Stream.iterate(1, i -> i + 1)       // 1, 2, 3, ... without end
        .filter(i -> i % 2 == 0)
        .limit(2)
        .toList();
// [2, 4]
```

## `peek`: looking in while debugging

`peek` runs an action for every element and passes it on **unchanged**. Useful to see what arrives at a certain point of the pipeline:

```java
students.stream()
        .peek(s -> System.out.println("before: " + s.name()))
        .filter(s -> s.age() > 18)
        .peek(s -> System.out.println("after: " + s.name()))
        .map(Student::name)
        .toList();
```

The output shows that a stream sends the elements through the whole pipeline **one by one**: *before: Anna*, *before: Ben*, *after: Ben*, *before: Cem* …

:::achtung peek is only for debugging
Do not rely on `peek` being executed. With `Stream.of("a", "b", "c").peek(...).count()` **nothing** is printed: Java already knows the count and skips the pipeline. Real work (saving, filling lists) does not belong in `peek`.
:::

:::merke
- `distinct()` removes duplicates by `equals`.
- `limit(n)` / `skip(n)` – sort first, then limit.
- `peek` only for debugging, never for logic.
:::
