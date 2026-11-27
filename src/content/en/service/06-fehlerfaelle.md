---
title: Error cases and your own exceptions
---

What should the service do when the input makes no sense? The task does not always say – but a good solution decides it and tests it.

## Invalid arguments

```java
public LateFeeService(List<Loan> loans) {
    if (loans == null) {
        throw new IllegalArgumentException("loans must not be null");
    }
    this.loans = List.copyOf(loans);
}
```

```java
public record Loan(Member member, Book book, LocalDate borrowedOn, LocalDate returnedOn) {

    public Loan {
        if (member == null) {
            throw new IllegalArgumentException("member must not be null");
        }
        if (borrowedOn == null) {
            throw new IllegalArgumentException("borrowedOn must not be null");
        }
        if (returnedOn != null && returnedOn.isBefore(borrowedOn)) {
            throw new IllegalArgumentException("returnedOn before borrowedOn");
        }
    }
}
```

| Situation | Exception |
|---|---|
| a mandatory value is `null` | `IllegalArgumentException` |
| a value makes no sense (negative, end before start) | `IllegalArgumentException` |
| something searched for does not exist | your own exception, e.g. `MemberNotFoundException` |

If you check in the compact constructor of the record, an invalid object cannot exist at all – the service then does not have to worry about it any more.

:::info Shorter with `Objects.requireNonNull`
Java has a ready-made method for the `null` check: `Objects.requireNonNull(member, "member");` does the same as the `if` in one line, but throws a `NullPointerException` with the message `"member"`. Both are correct – what matters is that you check.
:::

## Your own exception

```java
public class MemberNotFoundException extends RuntimeException {

    public MemberNotFoundException(String name) {
        super("no loans for member " + name);
    }
}
```

- `extends RuntimeException`: nobody has to declare it with `throws` or catch it.
- The name says what happened. In Task 3 the controller turns it into the status code `404`.

## Testing with `assertThatThrownBy`

```java
@Test
void verify_invalid_loan_is_rejected() {
    assertThatThrownBy(() -> new Loan(ANNA, MALINA, START, START.minusDays(1)))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("returnedOn");
}

@Test
void verify_unknown_member() {
    assertThatThrownBy(() -> service.feeFor("Zoe", TODAY))
            .isInstanceOf(MemberNotFoundException.class)
            .hasMessage("no loans for member Zoe");
}
```

Check the **type** and part of the **message**. Only `isInstanceOf(RuntimeException.class)` would also accept a random error in the service as "right".

:::achtung Empty data is not an error
An empty list of loans is allowed: the sum is 0, the evaluation has three empty lists. Only throw an exception if the result would otherwise be wrong or meaningless.
:::

:::merke
- Check missing mandatory values and meaningless values with `if` and throw an `IllegalArgumentException`.
- Checks go into the compact constructor of the records.
- Your own exceptions `extends RuntimeException` with a descriptive name.
- Test with `assertThatThrownBy`: type and message.
:::
