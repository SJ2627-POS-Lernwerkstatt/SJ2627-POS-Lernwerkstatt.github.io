---
title: Parametrisierte Tests II
minutes: 8
cheatsheet: 5
status: draft
---

`@CsvSource` reicht, solange die Argumente Zahlen, Strings oder Enums sind. Brauchst du **Objekte** als Testdaten – einen Warenkorb mit Artikeln, eine Liste von Entities –, kommen die Argumente aus einer Methode oder einem Feld.

## `@MethodSource`

Die Quelle ist eine **statische** Methode in der Testklasse. Sie liefert einen `Stream` (oder eine `List`) von `Arguments`, je ein `Arguments` pro Durchlauf:

```java
import static org.junit.jupiter.params.provider.Arguments.arguments;

static Stream<Arguments> carts() {
    return Stream.of(
            arguments(List.of(), 0.0),
            arguments(List.of(new Item("Buch", 20.0)), 20.0),
            arguments(List.of(new Item("Buch", 20.0), new Item("Stift", 2.0)), 22.0));
}

@ParameterizedTest
@MethodSource("carts")
void total_is_sum_of_prices(List<Item> items, double expected) {
    Cart cart = new Cart();
    items.forEach(cart::add);

    assertThat(cart.total()).isEqualTo(expected);
}
```

Die Reihenfolge in `arguments(...)` entspricht der Reihenfolge der Parameter der Testmethode.

Braucht der Test nur **ein** Argument, kann die Methode die Werte direkt liefern, ohne `Arguments`:

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

## Fälle benennen mit `argumentSet`

Bei Objekten wird der automatische Name im Testbericht schnell unlesbar (`[3] items = [Item[name=Buch, price=20.0], Item[...]]`). Mit `argumentSet` gibst du jedem Fall einen Namen:

```java
import static org.junit.jupiter.params.provider.Arguments.argumentSet;

static Stream<Arguments> namedCarts() {
    return Stream.of(
            argumentSet("leerer Warenkorb", List.of(), 0.0),
            argumentSet("ein Artikel", List.of(new Item("Buch", 20.0)), 20.0));
}
```

Im Bericht steht dann `[1] leerer Warenkorb`, `[2] ein Artikel`.

## `@FieldSource`

Statt einer Methode kann auch ein **statisches Feld** die Werte liefern:

```java
static final List<Item> CHEAP_ITEMS = List.of(new Item("Stift", 2.0), new Item("Heft", 1.5));

@ParameterizedTest
@FieldSource("CHEAP_ITEMS")
void cheap_items_keep_their_price(Item item) {
    assertThat(new PriceCalculator().finalPrice(item.price())).isEqualTo(item.price());
}
```

## Quellen in einer anderen Klasse

Testdaten, die mehrere Testklassen brauchen, legst du in eine eigene Klasse und verweist mit dem voll qualifizierten Namen und `#` darauf:

```java
@MethodSource("shop.TestData#carts")
```

:::achtung static vergessen
Die Quellmethode bzw. das Feld muss `static` sein (außer bei `@TestInstance(Lifecycle.PER_CLASS)`). Sonst bricht JUnit den Test mit einer Fehlermeldung ab, bevor ein einziger Durchlauf startet.
:::

:::merke
- `@MethodSource("name")`: statische Methode, liefert `Stream<Arguments>` mit `arguments(...)`.
- Bei einem einzigen Parameter reicht ein Stream oder eine Liste der Werte.
- `argumentSet("Name", ...)` für lesbare Namen im Bericht.
- `@FieldSource` für ein statisches Feld, `"paket.Klasse#methode"` für fremde Klassen.
:::
