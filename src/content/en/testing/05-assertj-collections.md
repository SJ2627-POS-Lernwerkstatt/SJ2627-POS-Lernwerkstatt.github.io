---
title: AssertJ for lists
---

Queries in repositories and services usually return lists. AssertJ has checks of its own for them that save you the loops in the test.

## Size and content

```java
List<String> names = List.of("Anna", "Ben", "Cem");

assertThat(names).hasSize(3);
assertThat(names).contains("Ben");                          // at least this element
assertThat(names).doesNotContain("Dora");
assertThat(names).containsExactly("Anna", "Ben", "Cem");    // all, exactly this order
assertThat(names).containsExactlyInAnyOrder("Cem", "Anna", "Ben");
assertThat(List.of()).isEmpty();
```

Which check fits?

| Check | All elements? | Order? |
|---|---|---|
| `contains(...)` | no, only the named ones must occur | doesn't matter |
| `containsExactlyInAnyOrder(...)` | yes | doesn't matter |
| `containsExactly(...)` | yes | yes |

:::achtung Order from the database
Without `order by` (or `OrderBy` in the method name) a query returns the rows in **no** fixed order. Check such results with `containsExactlyInAnyOrder`, otherwise your test is green today and red tomorrow.
:::

## `extracting`: one attribute from every element

Usually the list contains objects, not strings. With `extracting` you take one value out of every element and then check these values:

```java
List<Item> items = List.of(new Item("Book", 20.0), new Item("Pen", 2.0));

assertThat(items)
        .extracting(Item::name)
        .containsExactly("Book", "Pen");
```

You check several attributes at once with `tuple`:

```java
import static org.assertj.core.api.Assertions.tuple;

assertThat(items)
        .extracting(Item::name, Item::price)
        .containsExactly(
                tuple("Book", 20.0),
                tuple("Pen", 2.0));
```

This way you do not have to build your own `Item` objects for the comparison – handy for entities whose `id` you do not know in advance.

## Filtering elements

`filteredOn` only checks the elements that meet a condition:

```java
assertThat(items)
        .filteredOn(item -> item.price() > 10)
        .extracting(Item::name)
        .containsExactly("Book");
```

## Maps

```java
Map<String, Integer> stock = Map.of("Book", 3, "Pen", 10);

assertThat(stock)
        .hasSize(2)
        .containsKey("Book")
        .containsEntry("Pen", 10);
```

:::pruefung
In Task 1 you have to test queries, e.g. "all boxes on one floor". A good test creates data that **matches and does not match the query**, and then checks with `extracting(...).containsExactlyInAnyOrder(...)` that exactly the right ones come back.
:::

:::merke
- `contains` = at least, `containsExactly` = exactly these in this order, `containsExactlyInAnyOrder` = exactly these.
- `extracting(Class::getter)` takes one attribute from every element, several with `tuple`.
- Never check results without `order by` with `containsExactly`.
:::
