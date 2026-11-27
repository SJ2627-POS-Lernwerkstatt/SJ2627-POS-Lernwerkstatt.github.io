---
title: Business rules as methods of their own
---

Every rule from the task gets a small method of its own. That way you can test every rule on its own, and the main method reads like the task.

## The library's rules

```java
static final int LOAN_DAYS = 28;
static final int GRACE_DAYS = 2;
static final int CENTS_PER_DAY = 20;
static final int MAX_CENTS_PER_LOAN = 1000;

/** Days after the loan period; a book that is still missing counts until today. */
static long daysLate(Loan loan, LocalDate today) {
    LocalDate end = loan.returned().orElse(today);
    long days = ChronoUnit.DAYS.between(loan.borrowedOn(), end);
    return Math.max(0, days - LOAN_DAYS);
}

static int fee(Loan loan, LocalDate today) {
    long late = daysLate(loan, today);
    if (late <= GRACE_DAYS) {
        return 0;
    }
    int cents = (int) Math.min(late * CENTS_PER_DAY, MAX_CENTS_PER_LOAN);
    return loan.member().type() == MemberType.CHILD ? cents / 2 : cents;
}
```

- **Constants** instead of numbers in the code: `28` says nothing, `LOAN_DAYS` does. If the rule changes, you change one line.
- `ChronoUnit.DAYS.between(a, b)` counts the days from `a` to `b`.
- `Math.min(…, MAX)` caps, `Math.max(0, …)` prevents negative values.
- `static` and without `private`: the rule needs no state, and tests in the same package can call it directly.

:::achtung Read the boundaries carefully
"Delays up to and including 2 days are free" means `late <= 2` → 0. From 3 days on **all** days count, i.e. 60 cents – not 20. "Discard streams **under** 5 seconds" means `< 5`, a stream of exactly 5 seconds counts. Every such boundary is a test case of its own (unit 5).
:::

## Filters as `Predicate`

"Only the loans of this member", "only attempts for this exam": filters like these are rules of their own.

```java
static Predicate<Loan> ofMember(Member member) {
    return loan -> loan.member().equals(member);
}
```

The main method puts the rules together with a stream (module Stream API):

```java
public int feeFor(Member member, LocalDate today) {
    return loans.stream()
            .filter(ofMember(member))
            .mapToInt(loan -> fee(loan, today))
            .sum();
}
```

Read aloud, it says what the task says: "Of all loans, those of the member, the fee of each, added up."

## Percentage rules

The streaming task says: "Streams with 85 % of the total length are charged with the total length." Calculate with whole numbers to avoid rounding errors:

```java
static int billedSeconds(int streamed, int songLength) {
    if (streamed < 5) {
        return 0;
    }
    return streamed * 100 >= songLength * 85 ? songLength : streamed;
}
```

`streamed * 100 >= songLength * 85` is the same as `streamed / songLength >= 0.85` – without `double`.

## Money

Calculate amounts in **cents as `int`/`long`** or with `BigDecimal`, never with `double`: `0.1 + 0.2` is `0.30000000000000004` in `double`.

:::merke
- One rule = one method, numbers as constants.
- Filters as `Predicate`, the main method as a stream of rules.
- Implement boundaries ("up to and including", "under") exactly.
- Money in cents or `BigDecimal`, percentages with whole numbers.
:::
