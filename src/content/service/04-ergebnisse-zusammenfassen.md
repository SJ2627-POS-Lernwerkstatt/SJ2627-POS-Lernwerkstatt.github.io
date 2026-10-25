---
title: Ergebnisse zusammenfassen
minutes: 11
status: draft
---

Viele Angaben verlangen kein einzelnes Ergebnis, sondern eine **Auswertung**:

> Geben Sie eine Map der Beurteilungen zurück: Bestanden, Wiederholung möglich, Nicht bestanden – jeweils mit einer Liste von Prüfungsergebnissen, absteigend nach Punkten sortiert.

Bei der Bücherei: Alle Mitglieder, eingeteilt in **keine**, **niedrige** (unter 5 €) und **hohe** Gebühren, jeweils die höchste Gebühr zuerst.

## Schritt 1: Typen für Schlüssel und Ergebnis

```java
public enum FeeLevel {
    NONE, LOW, HIGH
}

public record MemberFee(String name, int cents) {
}
```

- Die Schlüssel der `Map` sind ein **Enum**, nicht Strings wie `"Bestanden"`: Tippfehler sind dann unmöglich.
- Ein Eintrag der Liste ist ein **Record** mit genau dem, was die Angabe verlangt (Name und Betrag).

```java
static FeeLevel level(int cents) {
    if (cents == 0) {
        return FeeLevel.NONE;
    }
    return cents < 500 ? FeeLevel.LOW : FeeLevel.HIGH;
}
```

## Schritt 2: berechnen, sortieren, gruppieren

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

- `distinct()` – jedes Mitglied nur einmal, auch wenn es mehrere Ausleihen hat (Records haben `equals`).
- **Erst sortieren, dann gruppieren:** `groupingBy` behält die Reihenfolge des Streams in jeder Liste. So ist jede Liste sortiert, ohne sie einzeln zu sortieren.
- `reversed()` dreht die Reihenfolge um – absteigend. `thenComparing` legt fest, was bei gleichem Betrag gilt.
- Die `EnumMap` mit leeren Listen sorgt dafür, dass **alle drei Schlüssel** im Ergebnis stehen, auch wenn niemand hohe Gebühren hat. `groupingBy` allein liefert nur Schlüssel, die vorkommen.

:::achtung `reversed()` und Lambdas
`Comparator.comparingInt(f -> f.cents()).reversed()` kompiliert nicht: Vor `reversed()` kennt Java den Typ von `f` nicht. Die Meldung lautet `Symbol nicht gefunden … Methode cents() … Variable f von Typ Object`. Nimm eine Methodenreferenz (`MemberFee::cents`) oder gib den Typ an: `(MemberFee f) -> f.cents()`.
:::

## Alternative ohne Streams

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

Beides ist richtig. Nimm die Variante, die du in der Prüfung sicher hinbekommst.

## Testen

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

`containsExactly` prüft Inhalt **und** Reihenfolge. Die Testdaten sind absichtlich nicht schon sortiert übergeben – sonst würde auch ein Service ohne Sortierung bestehen.

:::merke
- Schlüssel als Enum, Einträge als Record.
- Erst sortieren, dann `groupingBy` – die Listen bleiben sortiert.
- `EnumMap` mit allen Schlüsseln vorbelegen.
- Testdaten unsortiert übergeben, Reihenfolge mit `containsExactly` prüfen.
:::
