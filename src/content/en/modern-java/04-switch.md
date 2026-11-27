---
title: Switch expressions – arrow instead of break
---

The classic `switch` has two well-known weaknesses: if a `break` is missing, the code simply runs on into the next branch (**fall-through**), and the `switch` does not produce a value.

```java
String result;
switch (day) {
    case MONDAY:
    case FRIDAY:
        result = "Work day";
        break;   // forgotten = wrong result, without an error message
    case SATURDAY:
    case SUNDAY:
        result = "Weekend";
        break;
    default:
        result = "Midweek";
}
```

## The modern form: arrow and value

```java
var result = switch (day) {
    case MONDAY, FRIDAY   -> "Work day";
    case SATURDAY, SUNDAY -> "Weekend";
    default               -> "Midweek";
};
```

No `break`, no falling through – the switch is an **expression**: you can assign its result directly to a variable. Several cases are separated by commas.

If you need several lines in a branch, it becomes a block and returns its value with **`yield`**:

```java
String season = switch (month) {
    case 12, 1, 2 -> "Winter";
    default -> {
        var note = "Monat " + month;
        yield note;
    }
};
```

## Completeness

A switch **expression** must cover all input values – otherwise it does not compile: "the switch expression does not cover all possible input values". For an `enum` the rule is: cover all constants or write `default`.

With **sealed types** it is more elegant: a `sealed interface` lists all allowed subtypes with `permits` – often records. The compiler then knows all cases and needs no `default`:

```java
sealed interface Shape permits Circle, Rectangle, Triangle { }
record Circle(double radius) implements Shape { }
record Rectangle(double width, double height) implements Shape { }
record Triangle(double base, double height) implements Shape { }

double area = switch (shape) {
    case Circle c     -> Math.PI * c.radius() * c.radius();
    case Rectangle r  -> r.width() * r.height();
    case Triangle t   -> t.base() * t.height() / 2.0;
};
```

This is **pattern matching for switch** (Java 21): every case checks a type, names the object and can use it right away. `null` may now also be a case of its own – `case null -> …` (or `case null, default -> …`) replaces the check before the switch.

:::pruefung
In Task 2 (service), states and types show up as an `enum` – mapping them to texts, fees or deadlines is a case for the arrow switch with record or enum cases. A switch expression without `default` shows the grader that you have considered every case.
:::
