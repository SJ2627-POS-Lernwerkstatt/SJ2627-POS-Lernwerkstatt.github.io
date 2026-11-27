---
title: Optional – the box with a lid
---

If methods that find nothing return `null`, the caller easily forgets the check – and it crashes with a `NullPointerException`. An **`Optional<T>`** is a box that either contains exactly one value or is empty. The signature alone shows that the value can be missing.

## Creating

```java
Optional<String> a = Optional.of("Hello");            // guaranteed not null
Optional<String> b = Optional.ofNullable(maybeNull);  // a value or empty
Optional<String> c = Optional.empty();                // deliberately empty
```

`Optional.of(null)` throws a `NullPointerException` right away – so `of` is only meant for values that are certainly not `null`. For values that can be `null`, use `ofNullable`.

## Using

When taking the value out, always handle the empty case **deliberately**:

```java
Optional<String> opt = findUserEmail(42);

opt.ifPresent(email -> System.out.println(email));   // only if something is inside

var e1 = opt.orElse("default@example.com");          // fallback value
var e2 = opt.orElseGet(() -> generateDefault());     // fallback logic only in the empty case
var e3 = opt.orElseThrow(() -> new NotFoundException("42")); // an empty box is an error
```

The difference between `orElse` and `orElseGet`: the argument of `orElse` is **always** evaluated, even if something is in the box – with `orElseGet` the method only runs if it is empty.

```java
Optional.of("anna@example.com").orElse(expensive());          // expensive() runs!
Optional.of("anna@example.com").orElseGet(() -> expensive()); // does not run
```

:::achtung `get()` without a check
`opt.get()` throws `NoSuchElementException: No value present` on an empty box. Even `if (opt.isPresent()) { opt.get() … }` is only the clumsy version of `ifPresent` or `map` – and if you need the empty case, you usually want `orElse`/`orElseThrow`.
:::

## Process further instead of unpacking

```java
opt.map(String::toUpperCase)                  // Optional<String> – transformed if full
   .filter(s -> s.endsWith(".COM"));          // Optional<String> – checks the inside
```

The empty case simply passes through – no nesting of `if`.

## Best practices

:::merke
- `Optional` is a **return type**: "the search can fail" is stated in the signature.
- Not as a field, not as a method parameter, not for serialising – there it is just an expensive box around `null`.
- Rather transform values (`map`, `filter`) than unpack them (`get`).
:::

In the [stream module](/streams/finden), `findFirst`, `min` and `max` work with `Optional` out of the box – there you see it in action. The same pattern applies in Task 1: `repository.findById(id)` returns an `Optional`, see [Repositories](/jpa/repositories).
