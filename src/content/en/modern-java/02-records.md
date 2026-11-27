---
title: Records – data classes in one line
---

A **record** (Java 16) is a class for data that does not change: you only write which fields there are – Java generates the rest.

```java
public record Person(String name, int age) { }
```

From this Java automatically creates:

- `private final` fields `name` and `age`,
- a constructor `Person(String name, int age)`,
- accessor methods `name()` and `age()` – **without** `get`,
- `equals`, `hashCode` and `toString` over all fields.

```java
var p = new Person("Anna", 19);
System.out.println(p.name());   // Anna  – the accessor is name(), not getName()
System.out.println(p);          // Person[name=Anna, age=19]
System.out.println(new Person("Anna", 19).equals(p)); // true
```

## Checking in the compact constructor

Invalid objects should never come into existence. The **compact constructor** has no parameter list of its own – you only check, Java assigns the fields itself afterwards:

```java
public record Point(int x, int y) {
    public Point {
        if (x < 0 || y < 0) {
            throw new IllegalArgumentException("Negative coordinates");
        }
    }

    public double distanceFromOrigin() {          // own methods are allowed
        return Math.sqrt(x * x + y * y);
    }
}

new Point(3, 4).distanceFromOrigin(); // 5.0
```

## Changing is not possible – create a new one

Fields are `final`. You only get a different value through a new object:

```java
var older = new Person(p.name(), p.age() + 1);
```

Since Java 21 you can **unpack** records right where you check their type:

```java
Object obj = new Point(3, 4);
if (obj instanceof Point(int x, int y)) {
    System.out.println(x + ", " + y);   // 3, 4
}
```

## When a record, when a class?

The cheat sheet (p. 2, "Java types" and "Data Classes") lists both. As a rule of thumb:

| Data structure | Record? |
|---|---|
| result of a query, DTO in the REST API, data class in Task 2 | yes |
| entity in Task 1 (JPA) | no – JPA needs mutable fields and a no-args constructor, see [Entities with Lombok](/jpa/konstruktoren) |
| object with mutable state (counter, buffer) | no |

Going further: the [stream module](/streams/datenklassen) continues with encapsulated lists (`List.copyOf`) and classes that hand out collections safely.

:::merke
- `record Name(Type field, …)` – constructor, accessor `field()`, `equals`, `hashCode`, `toString` for free.
- Check validity in the compact constructor `public Name { … }`, without assignments.
- Immutable: "changing" means a new object; entities stay normal classes.
:::
