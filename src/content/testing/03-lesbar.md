---
title: Tests lesbar machen
minutes: 7
cheatsheet: 4
status: draft
---

Ein Test ist auch Dokumentation: Wer deinen Code beurteilt, liest zuerst die Testnamen. Wenn dort `test1`, `test2` und `test3` steht, muss er jeden Test aufmachen, um zu verstehen, was du geprüft hast.

## Sprechende Testnamen

Der Name sagt, **welches Verhalten** unter **welcher Bedingung** geprüft wird. Zwei übliche Muster:

| Muster | Beispiel |
|---|---|
| `verify_<was>_<wann>` | `verify_discount_is_applied_above_100_euro` |
| `<methode>_<bedingung>_<erwartung>` | `finalPrice_below100_returnsSamePrice` |

Entscheide dich für ein Muster und bleib in der ganzen Arbeit dabei.

## `@DisplayName`

Mit `@DisplayName` gibst du einem Test einen Namen in normaler Sprache. Er erscheint im Testbericht der IDE und von Gradle statt des Methodennamens.

```java
@Test
@DisplayName("Ab 100 Euro gibt es 10 % Rabatt")
void verify_discount_is_applied_above_100_euro() {
    assertThat(new PriceCalculator().finalPrice(120.0)).isEqualTo(108.0);
}
```

## `@Nested`: Tests gruppieren

Eine **innere, nicht-statische** Klasse mit `@Nested` fasst zusammengehörige Tests zusammen. Lifecycle-Methoden der äußeren Klasse laufen auch für die inneren Tests – zuerst außen, dann innen.

```java
class CartTest {

    private Cart cart;

    @BeforeEach
    void setUp() {
        cart = new Cart();
    }

    @Nested
    @DisplayName("Leerer Warenkorb")
    class Empty {

        @Test
        void total_is_zero() {
            assertThat(cart.total()).isZero();
        }
    }

    @Nested
    @DisplayName("Mit einem Artikel")
    class WithOneItem {

        @BeforeEach
        void addItem() {
            cart.add(new Item("Buch", 20.0));
        }

        @Test
        void total_is_price_of_item() {
            assertThat(cart.total()).isEqualTo(20.0);
        }

        @Test
        void remove_empties_cart() {
            cart.remove("Buch");

            assertThat(cart.isEmpty()).isTrue();
        }
    }
}
```

Im Testbericht siehst du dann einen Baum: *CartTest → Mit einem Artikel → remove_empties_cart*.

:::achtung Nicht static
Eine `@Nested`-Klasse darf nicht `static` sein. Nur eine nicht-statische innere Klasse kann auf die Felder der äußeren Klasse zugreifen (im Beispiel `cart`), und nur für sie laufen die `@BeforeEach`-Methoden der äußeren Klasse mit. Eine statische innere Klasse behandelt JUnit wie eine ganz normale, eigenständige Testklasse.
:::

## `@Disabled`

`@Disabled("Grund")` schaltet einen Test oder eine ganze Testklasse ab. Der Test wird im Bericht als übersprungen angezeigt. Gib immer einen Grund an – und gib keine Arbeit mit abgeschalteten Tests ab: Ein abgeschalteter Test prüft nichts.

:::merke
- Testnamen beschreiben Verhalten und Bedingung, ein Muster für alle Tests.
- `@DisplayName` für lesbare Namen im Testbericht.
- `@Nested` gruppiert Tests; die innere Klasse ist **nicht** `static`.
- `@Disabled` nur mit Grund und nie in der Abgabe.
:::
