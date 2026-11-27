---
title: Testing exceptions
---

Every task has error cases: a negative price, an item that does not exist, invalid input at the REST endpoint. You have to test that your code throws the **right** exception in these cases just as much as the normal case.

## `assertThatThrownBy`

You pass the call as a **lambda**. AssertJ runs it, catches the exception and checks it:

```java
assertThatThrownBy(() -> cart.remove("Notebook"))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("no item named Notebook");
```

Instead of the whole message, part of it is often enough: `hasMessageContaining("Notebook")`. If the call throws **no** exception, the test fails.

:::achtung The call belongs in the lambda
```java
cart.remove("Notebook");                             // already throws here
assertThatThrownBy(() -> {}).isInstanceOf(...);  // never reached
```
If the call is outside the lambda, the exception is thrown before AssertJ can catch it. The test then turns red – even though your code does exactly the right thing.
:::

## `assertThatExceptionOfType`

The same check, just phrased the other way round: first the type, then the call.

```java
assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> cart.add(null))
        .withMessageContaining("null");
```

There are shortcuts for common types: `assertThatIllegalArgumentException()`, `assertThatIllegalStateException()`, `assertThatNullPointerException()`.

```java
assertThatIllegalArgumentException()
        .isThrownBy(() -> calculator.finalPrice(-1));
```

Which form you use is a matter of taste – stick to one in a piece of work.

## `assertThrows` from JUnit

JUnit has its own variant. It **returns the exception** so that you can check it further:

```java
IllegalArgumentException e = assertThrows(IllegalArgumentException.class, () -> cart.remove("Notebook"));
assertThat(e.getMessage()).contains("Notebook");
```

## That **no** exception is thrown

Sometimes that is exactly the point of the test, for example for a validation that has to accept a valid value:

```java
assertThatCode(() -> cart.add(new Item("Book", 20.0))).doesNotThrowAnyException();
```

:::pruefung
In Task 2 (service) and Task 3 (REST) the grading criteria explicitly demand that the **exception cases** are tested too. For a "Sehr gut" in Task 3 you need tests for good cases, edge cases **and** exception cases.
:::

:::merke
- `assertThatThrownBy(() -> call).isInstanceOf(...).hasMessage(...)`.
- The call goes **into** the lambda.
- `assertThatCode(...).doesNotThrowAnyException()` for the case without an exception.
:::
