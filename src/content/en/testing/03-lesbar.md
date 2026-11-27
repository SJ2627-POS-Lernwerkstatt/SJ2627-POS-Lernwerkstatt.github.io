---
title: Making tests readable
---

A test is also documentation: whoever grades your code reads the test names first. If they say `test1`, `test2` and `test3`, they have to open every test to understand what you checked.

## Descriptive test names

The name says **which behaviour** is checked under **which condition**. Two common patterns:

| Pattern | Example |
|---|---|
| `verify_<what>_<when>` | `verify_discount_is_applied_above_100_euro` |
| `<method>_<condition>_<expectation>` | `finalPrice_below100_returnsSamePrice` |

Decide on one pattern and stick to it throughout your work.

## `@DisplayName`

With `@DisplayName` you give a test a name in plain language. It appears in the test report of the IDE and of Gradle instead of the method name.

```java
@Test
@DisplayName("10 % discount from 100 euros")
void verify_discount_is_applied_above_100_euro() {
    assertThat(new PriceCalculator().finalPrice(120.0)).isEqualTo(108.0);
}
```

## `@Nested`: grouping tests

An **inner, non-static** class with `@Nested` groups tests that belong together. Lifecycle methods of the outer class also run for the inner tests – outer first, then inner.

```java
class CartTest {

    private Cart cart;

    @BeforeEach
    void setUp() {
        cart = new Cart();
    }

    @Nested
    @DisplayName("Empty cart")
    class Empty {

        @Test
        void total_is_zero() {
            assertThat(cart.total()).isZero();
        }
    }

    @Nested
    @DisplayName("With one item")
    class WithOneItem {

        @BeforeEach
        void addItem() {
            cart.add(new Item("Book", 20.0));
        }

        @Test
        void total_is_price_of_item() {
            assertThat(cart.total()).isEqualTo(20.0);
        }

        @Test
        void remove_empties_cart() {
            cart.remove("Book");

            assertThat(cart.isEmpty()).isTrue();
        }
    }
}
```

In the test report you then see a tree: *CartTest → With one item → remove_empties_cart*.

:::achtung Not static
A `@Nested` class must not be `static`. Only a non-static inner class can access the fields of the outer class (`cart` in the example), and only for it do the `@BeforeEach` methods of the outer class run as well. JUnit treats a static inner class like a completely normal, separate test class.
:::

## `@Disabled`

`@Disabled("reason")` switches off a test or a whole test class. The test is shown as skipped in the report. Always give a reason – and do not hand in work with disabled tests: a disabled test checks nothing.

:::merke
- Test names describe behaviour and condition, one pattern for all tests.
- `@DisplayName` for readable names in the test report.
- `@Nested` groups tests; the inner class is **not** `static`.
- `@Disabled` only with a reason and never in the submission.
:::
