---
title: Checking, finding and Optional
---

Many questions about a list have a short answer: *Is there a student over 20?* *Who is the youngest?* For that there are terminal operations that return a `boolean` or a single element.

## Yes or no: `anyMatch`, `allMatch`, `noneMatch`

```java
students.stream().anyMatch(s -> s.age() >= 20);                    // true  – Dora
students.stream().allMatch(s -> s.age() >= 18);                    // true
students.stream().noneMatch(s -> s.schoolClass().equals("5CHIF")); // true
```

They stop as soon as the result is certain – `anyMatch` at the first hit.

:::achtung Empty lists
For an **empty** list `allMatch` is always `true` and `anyMatch` always `false` – no matter what the condition says. "All students of an empty class are over 100" is logically true. If that would be wrong in your business rule, check the empty list separately.
:::

## Finding one element: `findFirst`, `min`, `max`

A sought element might not exist. That is why these operations return an **`Optional`**:

```java
Optional<Student> first5B = students.stream()
        .filter(s -> s.schoolClass().equals("5BHIF"))
        .findFirst();                                           // Optional[Cem]

Optional<Student> youngest = students.stream().min(Comparator.comparing(Student::age));
Optional<Student> oldest   = students.stream().max(Comparator.comparing(Student::age));
```

## Using `Optional` correctly

An `Optional` is a box that contains a value – or is empty. You take the value out in a way that handles the empty case **deliberately**. From the ground up (creating, `orElse` vs. `orElseGet`, best practices): [Modern Java features – Optional](/modern-java/optional).

```java
String name = students.stream()
        .filter(s -> s.age() > 30)
        .findFirst()
        .map(Student::name)          // Optional<String>, stays empty if empty
        .orElse("niemand");          // fallback value

Student dora = students.stream()
        .filter(s -> s.name().equals("Dora"))
        .findFirst()
        .orElseThrow(() -> new IllegalArgumentException("Dora is missing"));
```

| Method | If empty |
|---|---|
| `orElse(value)` | returns `value` |
| `orElseGet(() -> ...)` | calls the supplier and returns its result |
| `orElseThrow()` | throws `NoSuchElementException` |
| `orElseThrow(() -> new ...)` | throws your exception |
| `ifPresent(x -> ...)` | does nothing |

`orElse(compute())` **always** calls `compute()`, even if there is a value. If the fallback is expensive, use `orElseGet(() -> compute())`.

:::achtung get() and isPresent()
`optional.get()` throws a `NoSuchElementException: No value present` on an empty `Optional`. And `if (o.isPresent()) { o.get() ... }` is only a clumsy way to write `ifPresent` or `map`. In services, `orElseThrow(() -> new ...NotFoundException(...))` is almost always the right choice.
:::

:::pruefung
In services and REST controllers the typical pattern is: `repository.findById(id).orElseThrow(...)`. The controller then turns your own exception into `404 Not Found` – and you test this case explicitly.
:::

:::merke
- `anyMatch` / `allMatch` / `noneMatch` return a `boolean`; empty list: `allMatch` = `true`.
- `findFirst`, `min`, `max` return an `Optional`.
- `map`, `orElse`, `orElseGet`, `orElseThrow`, `ifPresent` instead of `get()`.
:::
