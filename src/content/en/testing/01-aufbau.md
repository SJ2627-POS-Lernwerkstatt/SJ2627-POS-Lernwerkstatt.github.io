---
title: Structure of a test
---

At the Matura you have to test **every** task: entities, services and REST controllers. A test without a clear structure is hard to read and even harder to fix. That is why every test in this course follows the same pattern.

## Arrange, act, assert

A test has three parts:

1. **Arrange** – you set up the starting situation: objects, test data, mocks.
2. **Act** – you call exactly **one** method that you want to test.
3. **Assert** – you check whether the result is right.

```java
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PriceCalculatorTest {

    @Test
    void verify_discount_is_applied_above_100_euro() {
        // arrange
        PriceCalculator calculator = new PriceCalculator();

        // act
        double price = calculator.finalPrice(120.0);

        // assert
        assertThat(price).isEqualTo(108.0);
    }
}
```

The three comments are not a must, but they help you: if your *act* part suddenly has three calls, you are probably testing too much at once.

## What does `@Test` do?

JUnit Jupiter looks for methods with `@Test` in the test class and runs each of them **separately** – with a **new instance** of the test class. So a test must never rely on another test having run before it.

- The test class and the test methods do not need `public`.
- Test methods return nothing (`void`) and normally have no parameters.
- The name describes **what** is checked, e.g. `verify_discount_is_applied_above_100_euro`.

:::achtung The wrong import
There are two `@Test` annotations: `org.junit.Test` (JUnit 4) and `org.junit.jupiter.api.Test` (JUnit Jupiter). With the old annotation your tests do not run properly in Spring projects – `@Autowired` fields then stay `null` and you get a `NullPointerException`.

All imports come from `org.junit.jupiter.api`.
:::

## Where do the tests go?

Tests live in the same **package** as the class under test, but under `src/test/java` instead of `src/main/java`. The test class is named like the class under test with `Test` at the end.

| Class | Test |
|---|---|
| `src/main/java/shop/PriceCalculator.java` | `src/test/java/shop/PriceCalculatorTest.java` |

:::pruefung
For every task the grading criteria say roughly: *"All implemented elements are checked by unit tests."* Without tests you reach at most a "Genügend" – even if your code is free of errors.
:::

:::merke
- A test = **arrange, act, assert**.
- Imports always from `org.junit.jupiter.api`.
- Every test runs on its own, with a fresh instance of the test class.
:::
