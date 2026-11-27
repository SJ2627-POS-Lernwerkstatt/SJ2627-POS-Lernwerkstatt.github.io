---
title: Summarising results
---

Many tasks do not demand a single result, but an **evaluation**:

> Return a map of the ratings: passed, repetition possible, failed – each with a list of exam results, sorted by points in descending order.

For the library: all members, divided into **no**, **low** (under €5) and **high** fees, each with the highest fee first.

## Step 1: types for the keys and the result

```java
public enum FeeLevel {
    NONE, LOW, HIGH
}

public record MemberFee(String name, int cents) {
}
```

- The keys of the `Map` are an **enum**, not strings like `"Bestanden"`: typos are then impossible.
- An entry of the list is a **record** with exactly what the task demands (name and amount).

```java
static FeeLevel level(int cents) {
    if (cents == 0) {
        return FeeLevel.NONE;
    }
    return cents < 500 ? FeeLevel.LOW : FeeLevel.HIGH;
}
```

## Step 2: calculate, sort, group

```java
public Map<FeeLevel, List<MemberFee>> overview(LocalDate today) {
    Map<FeeLevel, List<MemberFee>> result = new EnumMap<>(FeeLevel.class);
    for (FeeLevel level : FeeLevel.values()) {
        result.put(level, List.of());
    }
    result.putAll(loans.stream()
            .map(Loan::member)
            .distinct()
            .map(member -> new MemberFee(member.name(), feeFor(member, today)))
            .sorted(Comparator.comparingInt(MemberFee::cents).reversed()
                    .thenComparing(MemberFee::name))
            .collect(Collectors.groupingBy(fee -> level(fee.cents()))));
    return result;
}
```

- `distinct()` – every member only once, even if they have several loans (records have `equals`).
- **Sort first, then group:** `groupingBy` keeps the order of the stream in every list. That way every list is sorted without sorting each one separately.
- `reversed()` reverses the order – descending. `thenComparing` decides what applies with equal amounts.
- The `EnumMap` with empty lists makes sure that **all three keys** are in the result, even if nobody has high fees. `groupingBy` alone only returns keys that occur.

:::achtung `reversed()` and lambdas
`Comparator.comparingInt(f -> f.cents()).reversed()` does not compile: before `reversed()` Java does not know the type of `f`. The message is `cannot find symbol … method cents() … variable f of type Object`. Use a method reference (`MemberFee::cents`) or give the type: `(MemberFee f) -> f.cents()`.
:::

## Alternative without streams

```java
Map<FeeLevel, List<MemberFee>> result = new EnumMap<>(FeeLevel.class);
for (FeeLevel level : FeeLevel.values()) {
    result.put(level, new ArrayList<>());
}
for (Member member : members) {
    MemberFee fee = new MemberFee(member.name(), feeFor(member, today));
    result.get(level(fee.cents())).add(fee);
}
result.values().forEach(list -> list.sort(BY_CENTS_DESC));
```

Both are correct. Use the variant you can do confidently in the exam.

## Testing

```java
@Test
void verify_overview_sorted_by_fee_descending() {
    LateFeeService service = new LateFeeService(List.of(
            returnedAfter(ANNA, 31), returnedAfter(DORA, 40), returnedAfter(CARLA, 35)));

    assertThat(service.overview(TODAY).get(FeeLevel.LOW))
            .extracting(MemberFee::name)
            .containsExactly("Dora", "Carla", "Anna");
}

@Test
void verify_empty_overview_has_all_levels() {
    assertThat(new LateFeeService(List.of()).overview(TODAY))
            .containsOnlyKeys(FeeLevel.values())
            .allSatisfy((level, fees) -> assertThat(fees).isEmpty());
}
```

`containsExactly` checks content **and** order. The test data is deliberately not passed in already sorted – otherwise a service without sorting would pass as well.

:::merke
- Keys as an enum, entries as a record.
- Sort first, then `groupingBy` – the lists stay sorted.
- Pre-fill the `EnumMap` with all keys.
- Pass test data unsorted, check the order with `containsExactly`.
:::
