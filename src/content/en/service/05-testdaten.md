---
title: Test data for all business cases
---

"Gut" demands that **all business cases** are tested. That only works with a plan: which cases are hidden in the task?

## Reading the cases from the task

Go through the rules sentence by sentence and note for every boundary the values **just before, exactly on and just after** it:

| Rule | Cases |
|---|---|
| loan period 28 days | 28 days (on time), 29 days |
| up to 2 days late free | 30 days (2 late) → 0, 31 days (3 late) → 60 cents |
| at most €10 | 78 days (exactly €10), 200 days (capped) |
| children pay half | a child with a fee |
| book not returned yet | open loan, counted until today |
| only the member's loans | a loan of another member in the data |
| evaluation | every level filled, one level empty, sorting |

This table is already half the work. Every row becomes a test – or a row in a parameterised test.

## Boundary values, parameterised

```java
@ParameterizedTest(name = "{0} days → {1} cents")
@CsvSource({
        "0, 0",
        "28, 0",      // last day of the loan period
        "30, 0",      // 2 days late: free
        "31, 60",     // 3 days late: all 3 days count
        "78, 1000",   // exactly the maximum
        "200, 1000"   // capped
})
void verify_fee_for_returned_loan(int days, int cents) {
    assertThat(LateFeeService.fee(returnedAfter(ANNA, days), TODAY)).isEqualTo(cents);
}
```

The `name` makes the output readable: `31 days → 60 cents`. The comments document **which rule** a row checks.

## Building test data without repeating yourself

```java
private static final LocalDate START = LocalDate.of(2026, 3, 2);
private static final LocalDate TODAY = START.plusYears(1);
private static final Member ANNA = new Member("Anna", MemberType.ADULT);
private static final Member BEN = new Member("Ben", MemberType.CHILD);
private static final Book MALINA = new Book("9783518365000", "Malina");

/** A loan that came back after the given number of days. */
private static Loan returnedAfter(Member member, int days) {
    return new Loan(member, MALINA, START, START.plusDays(days));
}
```

- Constants for objects that appear in many tests.
- One **factory method** per kind of test data. The test only shows what matters for it: `returnedAfter(ANNA, 31)`.
- A fixed date (`START`), never `LocalDate.now()` – otherwise the result changes every day.

## A test for the interplay

Besides the rules you need at least one test that calls the **main method** with mixed data:

```java
@Test
void verify_fee_for_member_sums_only_their_loans() {
    LateFeeService service = new LateFeeService(List.of(
            returnedAfter(ANNA, 31), returnedAfter(ANNA, 40), returnedAfter(CARLA, 78)));

    assertThat(service.feeFor(ANNA, TODAY)).isEqualTo(300);
}
```

Carla's loan is included on purpose: without it, a service without a filter would also return 300.

:::pruefung
Write the case table as a comment above the test class or as the names of the test methods. Whoever reads your submission then sees right away that every business case is covered.
:::

:::merke
- Read the cases from the task: every boundary before, on, after.
- Boundary values with `@ParameterizedTest` and `@CsvSource`.
- Factory methods and constants for test data, a fixed date instead of `now()`.
- Choose test data so that a wrong service does not pass the test.
:::
