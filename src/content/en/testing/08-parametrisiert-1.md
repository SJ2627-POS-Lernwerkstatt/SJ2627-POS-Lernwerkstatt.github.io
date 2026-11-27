---
title: Parameterised tests I
---

A cinema sells tickets by age: under 6 free, up to 17 youth, up to 64 adult, from 65 senior. To test this thoroughly you need many cases – above all the **boundaries** (5 and 6, 17 and 18, 64 and 65). Seven almost identical test methods would be tedious. A **parameterised test** runs once per data set.

## `@ParameterizedTest` with `@ValueSource`

Instead of `@Test` you write `@ParameterizedTest` and give a **source** for the arguments. The simplest one is `@ValueSource` – one value per run:

```java
@ParameterizedTest
@ValueSource(ints = {18, 30, 64})
void adults_pay_full_price(int age) {
    assertThat(Ticket.priceForAge(age)).isEqualTo(10.0);
}
```

The test runs three times. In the report you see every run separately: `[1] age = 18`, `[2] age = 30`, `[3] age = 64`. There are `ints`, `longs`, `doubles`, `strings`, `booleans` and a few more.

## Input and result: `@CsvSource`

Usually you need **input and expected result** per case. With `@CsvSource` every string is a row, the values are separated by commas:

```java
@ParameterizedTest(name = "{0} years → {1}")
@CsvSource({
        "0,  CHILD",
        "5,  CHILD",
        "6,  YOUTH",
        "17, YOUTH",
        "18, ADULT",
        "64, ADULT",
        "65, SENIOR"
})
void category_for_age(int age, Ticket.Category expected) {
    assertThat(Ticket.categoryFor(age)).isEqualTo(expected);
}
```

- JUnit converts the texts into the parameter type itself: `"17"` → `int`, `"YOUTH"` → enum.
- Spaces around the values are ignored, so you can align them nicely.
- `name = "{0} years → {1}"` sets how a run is called in the report; `{0}` is the first argument.

You write longer tables more clearly as a **text block**:

```java
@ParameterizedTest
@CsvSource(textBlock = """
        ABC-1234, true
        abc-1234, false
        ABC-123,  false
        '',       false
        """)
void code_format(String code, boolean valid) {
    assertThat(Ticket.isValidCode(code)).isEqualTo(valid);
}
```

:::achtung Empty or null?
In `@CsvSource`, `''` is an **empty string**. A completely empty value (`", false"`) becomes **`null`**. If your test expects `""` and gets `null`, this is usually the reason.
:::

## `null` and empty values: `@NullSource`, `@EmptySource`

There are sources of their own for the typical edge cases. You can combine them with `@ValueSource`:

```java
@ParameterizedTest
@NullAndEmptySource
@ValueSource(strings = {" ", "ABC1234"})
void invalid_codes(String code) {
    assertThat(Ticket.isValidCode(code)).isFalse();
}
```

The test runs four times: with `null`, `""`, `" "` and `"ABC1234"`. `@NullAndEmptySource` is the short form for `@NullSource` + `@EmptySource`.

## All values of an enum: `@EnumSource`

```java
@ParameterizedTest
@EnumSource(Ticket.Category.class)
void every_category_has_a_price(Ticket.Category category) {
    assertThat(Ticket.price(category)).isNotNegative();
}
```

With `names` and `mode` you restrict the values:

```java
@EnumSource(value = Ticket.Category.class, names = {"CHILD"}, mode = EnumSource.Mode.EXCLUDE)
```

If a new enum value is added later, it is automatically tested too.

:::pruefung
In Task 2 business rules with boundaries are typical ("charge in full from 85 %", "discard under 5 seconds"). A `@CsvSource` with the values **right at the boundary and next to it** shows with little code that you have covered all business cases.
:::

:::merke
- `@ParameterizedTest` + a source instead of `@Test`.
- `@ValueSource` for one value, `@CsvSource` for input + result.
- `@NullAndEmptySource` for `null` and `""`, `@EnumSource` for all enum values.
- Always test boundaries from both sides.
:::
