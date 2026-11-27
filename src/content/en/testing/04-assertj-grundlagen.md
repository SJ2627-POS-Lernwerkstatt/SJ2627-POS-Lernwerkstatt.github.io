---
title: AssertJ basics
---

For the *assert* in your tests you use **AssertJ**. It is already included in every Spring Boot project (via the test starter) and reads almost like a sentence: *"Make sure that the price is equal to 108."*

## The entry point: `assertThat`

```java
import static org.assertj.core.api.Assertions.assertThat;

assertThat(price).isEqualTo(108.0);
```

`assertThat(actual)` takes the **actual** value. Then you pick a matching check with code completion. Which checks exist depends on the type: for strings there is `startsWith`, for numbers `isPositive`, for lists `hasSize`.

| Type | Common checks |
|---|---|
| all objects | `isEqualTo`, `isNotEqualTo`, `isNull`, `isNotNull`, `isSameAs`, `isInstanceOf` |
| `boolean` | `isTrue`, `isFalse` |
| numbers | `isZero`, `isPositive`, `isGreaterThan`, `isBetween`, `isCloseTo` |
| `String` | `isEmpty`, `isBlank`, `startsWith`, `contains`, `matches`, `isEqualToIgnoringCase` |
| `BigDecimal` | `isEqualByComparingTo` |

You can chain several checks on the same value:

```java
assertThat(item.name())
        .isNotBlank()
        .startsWith("B")
        .hasSize(4);
```

## Comparing decimal numbers correctly

`double` calculates in binary and is therefore not always exact: `0.1 + 0.2` is `0.30000000000000004`. For calculated values you therefore check with a tolerance:

```java
import static org.assertj.core.api.Assertions.within;

assertThat(0.1 + 0.2).isCloseTo(0.3, within(0.0001));
```

With `BigDecimal`, `equals` also compares the number of decimal places: `new BigDecimal("2.50")` is **not** equal to `new BigDecimal("2.5")`. Compare the numeric value with `isEqualByComparingTo`:

```java
assertThat(new BigDecimal("2.50")).isEqualByComparingTo("2.5");
```

:::achtung isEqualTo with BigDecimal
`assertThat(new BigDecimal("2.50")).isEqualTo(new BigDecimal("2.5"))` fails. This happens often when a value from the database (`precision = 7, scale = 2`) is compared with a value you wrote yourself.
:::

## `isEqualTo` or `isSameAs`?

- `isEqualTo` compares with `equals` – that is, the **content**.
- `isSameAs` compares with `==` – that is, whether it is **the same object**.

For records, strings and numbers you almost always want `isEqualTo`.

## And `assertEquals`?

JUnit has its own assertions in `org.junit.jupiter.api.Assertions`. They work too, but the order of the arguments is reversed – first the **expected**, then the **actual** value:

```java
assertEquals(108.0, price);          // JUnit: expected, actual
assertThat(price).isEqualTo(108.0);  // AssertJ: actual first
```

If you mix up the order, you get confusing error messages ("expected: 120 but was: 108"). Use only **one** library in a piece of work – in this course AssertJ.

## Error messages with `as`

With `as(...)` you describe **what** is checked. The description appears in the error message. `as` has to come **before** the check:

```java
assertThat(cart.total()).as("total after two items").isEqualTo(22.0);
```

:::merke
- `assertThat(actual)` + a check, imported from `org.assertj.core.api.Assertions`.
- `double` with `isCloseTo(..., within(...))`, `BigDecimal` with `isEqualByComparingTo`.
- `isEqualTo` compares the content, `isSameAs` the identity.
:::
