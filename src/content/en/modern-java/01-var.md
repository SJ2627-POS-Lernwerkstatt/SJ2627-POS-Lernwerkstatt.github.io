---
title: var – the type where it is obvious
---

Since Java 10 you can write `var` when the type is already on the right-hand side. This is **not dynamic typing**: the variable keeps its type, `var` only infers it from the initial value.

```java
// with an explicit type
String message = "Hello, World!";
List<String> names = new ArrayList<>();

// the same with var – the type is inferred from the initial value
var message = "Hello, World!";        // String
var names = new ArrayList<String>();  // ArrayList<String>
```

## The rule

:::merke
Use `var` when the type on the right-hand side is **obvious**: with `new …`, with literals and with methods whose name states the type.
:::

Where the type is not immediately visible, write it out – a `var` before a `readData()` call makes the code harder to read, not easier.

## Limits of var

`var` works **only for local variables** – not for fields, parameters or return types. Also, the variable needs an initial value right away:

```java
var count = 42;      // ok: int
var name = "Alice";  // ok: String

var x;               // error: must be initialised
var y = null;        // error: cannot infer type for local variable y
```

As a field of a class, the compiler reports: "'var' is not allowed here".

## var and collections

When iterating, `var` saves you long generic types:

```java
var map = new HashMap<String, List<Integer>>();
map.put("A", List.of(1, 2));

for (var entry : map.entrySet()) {
    var key = entry.getKey();    // String
    var value = entry.getValue(); // List<Integer>
    System.out.println(key + "=" + value);
}
```

Careful with numbers: `var i = 42` is an `int`, `var d = 42.0` a `double`, and `var big = 42L` a `long`. The type is on the right – and stays.

:::pruefung
In the exam tasks `var` is allowed but not needed. In definitions of records and classes you write the types out; `var` fits in method bodies and loops.
:::
