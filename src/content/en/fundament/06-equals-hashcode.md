---
title: "== or equals? And why hashCode belongs to it"
---

`==` asks: **the same object?** (do both variables point to the same place?)
`equals` asks: **the same content?** – exactly as the class defines "equal".

```java
String a = new String("Hobbit");
String b = new String("Hobbit");

System.out.println(a == b);       // false – two different objects
System.out.println(a.equals(b));  // true  – same text
```

:::achtung
Compare strings, `Integer`, `Long`, `BigDecimal`, date values and all your own objects with `equals`. Use `==` only for primitive types (`int`, `long`, `boolean`, …) and for enums.
:::

## Without your own `equals` only identity counts

If you do not write `equals`, the class inherits the one from `Object` – and that does the same as `==`:

```java
public class Isbn {
    private final String value;
    public Isbn(String value) { this.value = value; }
}

new Isbn("9783608938289").equals(new Isbn("9783608938289"));  // false!
```

For values like an ISBN that is wrong. So override it:

```java
@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Isbn other)) return false;
    return value.equals(other.value);
}

@Override
public int hashCode() {
    return value.hashCode();
}
```

## Why `hashCode` always has to come along

`HashSet` and `HashMap` first use `hashCode` to find the right "drawer" and only then compare with `equals` inside it. The rule: **equal objects must have the same hashCode.** If you only override `equals`, the second ISBN lands in another drawer, and `set.contains(…)` does not find it.

## You rarely have to write it yourself

| Type | `equals`/`hashCode` |
|---|---|
| `record` | automatically over all components – that is why records are ideal for value objects and DTOs |
| entity with `AbstractPersistable` | via the **id** (two objects = the same row) |
| Lombok `@EqualsAndHashCode` / `@Data` | over all fields – do **not** use it on entities, it replaces the one from `AbstractPersistable` |

:::merke
- `==` = the same object, `equals` = the same content. Always compare objects with `equals`.
- `equals` and `hashCode` are **always overridden together**.
- Records do it themselves, entities via `AbstractPersistable`.
:::
