---
title: "@Override and polymorphism"
---

**Overriding** means: a class provides its own version of a method that already exists – from an interface or from a superclass. You write `@Override` above it so that the **compiler checks** that you really override something.

## Why `@Override` if it works without?

Every class inherits the method `toString()` from `Object`. Suppose you want to override it for `Book` and make a typo:

```java
public class Book {
    private String title;

    public String toSting() {           // typo: "Sting"
        return "Book " + title;
    }
}

System.out.println(new Book());   // Book@1b6d3586 – your method is never called
```

This compiles, because `toSting` is simply a *new* method. You only notice the mistake much later. With `@Override` the compiler reports right away: *method does not override or implement a method from a supertype*.

```java
@Override
public String toString() {
    return "Book " + title;
}
```

The same goes for wrong parameter types: `public boolean equals(Book other)` does **not** override `equals(Object o)`, it overloads it. Without `@Override` you will not notice.

## Polymorphism: who decides which method runs?

Polymorphism means "many forms": a variable of the interface type (or of the superclass) can point to different objects, and **at runtime** the method of the actual object runs:

```java
LateFeePolicy policy = new StudentPolicy();
policy.feeInCents(5);   // calls StudentPolicy.feeInCents

List<LateFeePolicy> all = List.of(new StandardPolicy(), new StudentPolicy());
for (LateFeePolicy p : all) {
    System.out.println(p.feeInCents(5));   // 250, then 40
}
```

The **type of the variable** decides which methods you *may* call. The **actual object** decides which code *runs*.

## What this has to do with Spring

In the REST task you write a controller against a service. In the test, `@MockitoBean` replaces the real service with an object that only *behaves* the same. The controller does not notice the difference – polymorphism. And in your exception handlers and converters, `@Override` stands before every method that a Spring interface prescribes.

:::merke
- `@Override` = "compiler, please check that I really override". Always write it.
- Typical traps without `@Override`: a typo in the name, a wrong parameter type in `equals`.
- Variable of the interface type, object of an implementation: the object's method runs.
:::
