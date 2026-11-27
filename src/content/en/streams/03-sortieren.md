---
title: Sorting with Comparator
---

"List all students sorted by age, with equal age by name" – requirements like this come up all the time in services and queries. `sorted` plus a `Comparator` does it in one line.

## Natural order

Strings, numbers and dates have a **natural order**. `sorted()` without an argument uses it:

```java
students.stream().map(Student::name).sorted().toList();
// [Anna, Ben, Cem, Dora, Emil]

students.stream().map(Student::name).sorted(Comparator.reverseOrder()).toList();
// [Emil, Dora, Cem, Ben, Anna]
```

## By one attribute: `Comparator.comparing`

For objects you say **what** to sort by:

```java
List<String> byAge = students.stream()
        .sorted(Comparator.comparing(Student::age))
        .map(Student::name)
        .toList();
// [Anna, Cem, Ben, Emil, Dora]   (18, 18, 19, 19, 20)
```

With equal age, the original order is kept. If you do not want to rely on that, give a second criterion.

## Several criteria: `thenComparing`

```java
students.stream()
        .sorted(Comparator.comparing(Student::age)
                .thenComparing(Student::name))
        .toList();
```

First by age; only if the age is the same does the name decide.

## Descending: `reversed` – but in the right place

`reversed()` reverses **everything before it**:

```java
// oldest first, with equal age name ascending
Comparator.comparing(Student::age).reversed().thenComparing(Student::name)
// [Dora, Ben, Emil, Anna, Cem]

// careful: reverses the name too!
Comparator.comparing(Student::age).thenComparing(Student::name).reversed()
// [Dora, Emil, Ben, Cem, Anna]
```

If only **one** criterion should be descending, pass the direction along with it:

```java
Comparator.comparing(Student::schoolClass, Comparator.reverseOrder())
        .thenComparing(Student::name)
// 5BHIF before 5AHIF, within the class name ascending
```

:::achtung reversed() at the end
A `reversed()` at the very end of a chain reverses **all** criteria. If only the first one should be descending, it belongs right after the first `comparing(...)` – or you use `comparing(..., Comparator.reverseOrder())`.
:::

## `comparingInt` and friends

For `int`, `long` and `double` attributes there are `comparingInt`, `comparingLong` and `comparingDouble`. They save the conversion into `Integer`, the result is the same:

```java
.sorted(Comparator.comparingInt(Student::age))
```

:::merke
- `sorted()` for the natural order, `sorted(Comparator.reverseOrder())` reversed.
- `Comparator.comparing(Class::attribute).thenComparing(...)` for several criteria.
- `reversed()` reverses everything before it; a single criterion descending with `comparing(..., Comparator.reverseOrder())`.
:::
