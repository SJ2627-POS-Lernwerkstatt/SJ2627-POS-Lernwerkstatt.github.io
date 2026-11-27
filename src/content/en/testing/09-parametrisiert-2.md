---
title: Parameterised tests II
---

`@CsvSource` is enough as long as the arguments are numbers, strings or enums. If you need **objects** as test data – a cart with items, a list of entities – the arguments come from a method or a field.

## `@MethodSource`

The source is a **static** method in the test class. It returns a `Stream` (or a `List`) of `Arguments`, one `Arguments` per run:

```java
import static org.junit.jupiter.params.provider.Arguments.arguments;

static Stream<Arguments> carts() {
    return Stream.of(
            arguments(List.of(), 0.0),
            arguments(List.of(new Item("Book", 20.0)), 20.0),
            arguments(List.of(new Item("Book", 20.0), new Item("Pen", 2.0)), 22.0));
}

@ParameterizedTest
@MethodSource("carts")
void total_is_sum_of_prices(List<Item> items, double expected) {
    Cart cart = new Cart();
    items.forEach(cart::add);

    assertThat(cart.total()).isEqualTo(expected);
}
```

The order in `arguments(...)` matches the order of the parameters of the test method.

If the test needs only **one** argument, the method can return the values directly, without `Arguments`:

```java
static List<Item> expensiveItems() {
    return List.of(new Item("Laptop", 900.0), new Item("Fahrrad", 450.0));
}

@ParameterizedTest
@MethodSource("expensiveItems")
void expensive_items_get_discount(Item item) {
    assertThat(new PriceCalculator().finalPrice(item.price())).isLessThan(item.price());
}
```

## Naming cases with `argumentSet`

With objects the automatic name in the test report quickly becomes unreadable (`[3] items = [Item[name=Book, price=20.0], Item[...]]`). With `argumentSet` you give every case a name:

```java
import static org.junit.jupiter.params.provider.Arguments.argumentSet;

static Stream<Arguments> namedCarts() {
    return Stream.of(
            argumentSet("empty cart", List.of(), 0.0),
            argumentSet("one item", List.of(new Item("Book", 20.0)), 20.0));
}
```

The report then says `[1] empty cart`, `[2] one item`.

## `@FieldSource`

Instead of a method, a **static field** can also provide the values:

```java
static final List<Item> CHEAP_ITEMS = List.of(new Item("Pen", 2.0), new Item("Notebook", 1.5));

@ParameterizedTest
@FieldSource("CHEAP_ITEMS")
void cheap_items_keep_their_price(Item item) {
    assertThat(new PriceCalculator().finalPrice(item.price())).isEqualTo(item.price());
}
```

## Sources in another class

Test data that several test classes need goes into a class of its own, and you refer to it with the fully qualified name and `#`:

```java
@MethodSource("shop.TestData#carts")
```

:::achtung Forgot static
The source method or field has to be `static` (except with `@TestInstance(Lifecycle.PER_CLASS)`). Otherwise JUnit aborts the test with an error message before a single run starts.
:::

:::merke
- `@MethodSource("name")`: static method, returns `Stream<Arguments>` with `arguments(...)`.
- With a single parameter a stream or a list of the values is enough.
- `argumentSet("name", ...)` for readable names in the report.
- `@FieldSource` for a static field, `"package.Class#method"` for other classes.
:::
