---
title: Test data and boundary values
---

For Task 2 the grading criteria say: *"Tests create enough test data to cover all defined business cases."* So the question is not only **how** you test, but **with which data**.

## Which cases do I need?

Go through the business rules of the task and divide the possible inputs into **classes** that are treated the same. One typical value per class is enough – but at every **boundary** you test both sides.

Example cinema tickets: under 6 free, up to 17 youth, up to 64 adult, from 65 senior, a negative age is an error.

| Class | typical value | boundary values |
|---|---|---|
| invalid | -10 | -1 |
| child | 3 | 0, 5 |
| youth | 12 | 6, 17 |
| adult | 40 | 18, 64 |
| senior | 80 | 65 |

Most bugs happen at the boundaries: `<` instead of `<=`, `17` instead of `18`. A test with only "typical" values does not find them.

```java
@ParameterizedTest
@CsvSource({
        "99.99,  99.99",
        "100.00, 90.00",
        "100.01, 90.009"
})
void discount_starts_at_100(double price, double expected) {
    assertThat(new PriceCalculator().finalPrice(price)).isCloseTo(expected, within(0.001));
}
```

:::pruefung
Before testing, write a small table like the one above: rule, classes, boundaries. That way you see whether every business case has a test – this is exactly what separates "Befriedigend" (some basic cases) from "Gut" (all business cases) in Task 2.
:::

## Creating test data without repeating yourself

If every test builds its objects with five constructor arguments itself, the test gets long and the essential part gets lost. Write **helper methods** that return valid standard objects:

```java
final class TestFixtures {

    private TestFixtures() {
    }

    static Item book() {
        return new Item("Book", 20.0);
    }

    static Item pen() {
        return new Item("Pen", 2.0);
    }

    static Cart cartWith(Item... items) {
        Cart cart = new Cart();
        for (Item item : items) {
            cart.add(item);
        }
        return cart;
    }
}
```

With a static import the test then reads almost like the task:

```java
import static shop.TestFixtures.*;

@Test
void total_of_book_and_pen() {
    Cart cart = cartWith(book(), pen());

    assertThat(cart.total()).isEqualTo(22.0);
}
```

- The class lives under `src/test/java`, in the same package as the tests.
- Every call returns a **new** object. That way no test can change another test's data.
- If only one or two values matter for the test, take only those as parameters, e.g. `itemWithPrice(100.0)`.

## Values that stand out

Choose test data so that a wrong result is **recognisable**. If both items cost 10 euros, you will not notice when the code always doubles the first price. With 20 and 2 euros you will.

:::merke
- Per business rule: form classes, one typical value each, **both sides** at every boundary.
- Invalid inputs are a class of their own – with an exception test.
- Helper methods in a `TestFixtures` class return fresh, valid objects.
- Choose different values so that mix-ups stand out.
:::
