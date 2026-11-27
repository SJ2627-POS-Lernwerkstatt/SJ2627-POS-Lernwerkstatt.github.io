---
title: Lambdas and method references
---

Streams consist of small building blocks: *keep the adults*, *take the name*, *sort by age*. Every building block is a function that you pass as a **lambda** or a **method reference**. Before we start with streams, let us look at these functions.

Throughout this module we use this data:

```java
public record Grade(String subject, int value) { }

public record Student(String name, String schoolClass, int age, List<Grade> grades) { }
```

## A lambda is a function without a name

```java
Predicate<Student> isAdult = s -> s.age() >= 18;
```

Left of the arrow are the parameters, on the right the result. If the body needs several statements, you write curly braces and `return`:

```java
Predicate<Student> isAdult = s -> {
    int age = s.age();
    return age >= 18;
};
```

## The four most important function types

A lambda always needs a **target type** – an interface with exactly one abstract method. You need these four from `java.util.function` all the time:

| Interface | Method | Gets → returns | Example | Used in |
|---|---|---|---|---|
| `Predicate<T>` | `test` | T → `boolean` | `s -> s.age() >= 18` | `filter`, `anyMatch` |
| `Function<T, R>` | `apply` | T → R | `s -> s.name()` | `map` |
| `Consumer<T>` | `accept` | T → nothing | `text -> System.out.println(text)` | `forEach` |
| `Supplier<T>` | `get` | nothing → T | `() -> new ArrayList<>()` | `orElseGet` |

On top of that there are `BiFunction<T, U, R>` (two parameters), `UnaryOperator<T>` (T → T) and `BinaryOperator<T>` ((T, T) → T, e.g. in `reduce`).

## Method references

If a lambda only calls **one** existing method, you can refer to the method instead:

| Lambda | Method reference | Kind |
|---|---|---|
| `s -> s.name()` | `Student::name` | method of the parameter |
| `text -> System.out.println(text)` | `System.out::println` | method of a particular object |
| `text -> Integer.parseInt(text)` | `Integer::parseInt` | static method |
| `() -> new ArrayList<>()` | `ArrayList::new` | constructor |

Both notations are equivalent. Method references are shorter and usually easier to read – use them when you can.

:::achtung Records have no get methods
In a record the accessor is named like the attribute: `Student::name`, not `Student::getName`. In a normal class (e.g. an entity) it is `Student::getName`.
:::

## Combining predicates

```java
Predicate<Student> in5A = s -> s.schoolClass().equals("5AHIF");

Predicate<Student> adultIn5A = isAdult.and(in5A);
Predicate<Student> notIn5A = Predicate.not(in5A);   // or in5A.negate()
```

With `or` there is also the logical or. For `Function` there is `andThen`: `toName.andThen(String::length)` returns the length of the name.

:::merke
- Lambda: `parameter -> expression` or `parameter -> { ...; return ...; }`.
- `Predicate` → `boolean`, `Function` → a value, `Consumer` → nothing, `Supplier` → a value without input.
- Method reference `Class::method` instead of a lambda that only calls one method.
- Records: `Student::name`, classes: `Student::getName`.
:::
