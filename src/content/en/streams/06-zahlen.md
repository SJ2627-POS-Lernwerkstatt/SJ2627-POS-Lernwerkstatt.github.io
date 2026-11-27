---
title: Calculating with numbers
---

Sums and averages are at the heart of many business rules in Task 2: total duration, average grade, revenue per month. Streams have variants of their own for numbers.

## `mapToInt` & co.

A `Stream<Student>` has no `sum()` – how would it know what to add? With `mapToInt` you turn it into an `IntStream` that can calculate:

```java
int sumOfAges = students.stream()
        .mapToInt(Student::age)
        .sum();                                  // 94

OptionalDouble averageAge = students.stream()
        .mapToInt(Student::age)
        .average();                              // OptionalDouble[18.8]
```

For `long` and `double` values there are `mapToLong` and `mapToDouble`.

| Operation | Result | for an empty stream |
|---|---|---|
| `sum()` | `int` / `long` / `double` | `0` |
| `average()` | `OptionalDouble` | empty |
| `min()`, `max()` | `OptionalInt` … | empty |
| `count()` | `long` | `0` |
| `summaryStatistics()` | min, max, average, sum, count at once | count 0 |

The average is an `Optional` because you cannot average nothing. Decide what should apply then (`orElse`, more in [Modern Java features – Optional](/modern-java/optional)):

```java
double avgPos = students.stream()
        .flatMap(s -> s.grades().stream())
        .filter(g -> g.subject().equals("POS"))
        .mapToInt(Grade::value)
        .average()
        .orElse(0.0);                            // 2.5
```

:::achtung Integer division
If you calculate the average yourself, think of the type: `5 / 2` is `2` in Java, not `2.5`. Only `(double) 5 / 2` gives `2.5`. `average()` takes care of that for you.
:::

## `reduce`: combining everything into one value

`reduce` combines the elements step by step: a start value and a function that makes one value out of two.

```java
int total = Stream.of(1, 2, 3, 4).reduce(0, Integer::sum);          // 10
int product = Stream.of(1, 2, 3, 4).reduce(1, (a, b) -> a * b);     // 24
```

The start value is the result for an empty stream – that is why it is `0` for the sum and `1` for the product. Without a start value `reduce` returns an `Optional`:

```java
Optional<Integer> sum = Stream.of(1, 2, 3).reduce(Integer::sum);    // Optional[6]
```

For sums `mapToInt(...).sum()` is shorter and clearer. You need `reduce` for your own combinations, e.g. to add `Duration` or `BigDecimal` values:

```java
BigDecimal total = invoices.stream()
        .map(Invoice::amount)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
```

## Back to objects: `boxed`

An `IntStream` has no `toList()` for `Integer`. With `boxed()` (or `mapToObj`) it becomes a normal stream again:

```java
List<Integer> numbers = IntStream.rangeClosed(1, 3).boxed().toList();   // [1, 2, 3]
```

:::merke
- `mapToInt(...)` → `sum()`, `average()`, `min()`, `max()`, `summaryStatistics()`.
- `average()` returns `OptionalDouble`; set the empty case with `orElse`.
- `reduce(startValue, function)` for your own combinations, e.g. `BigDecimal::add`.
:::
