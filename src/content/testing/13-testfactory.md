---
title: Dynamische Tests mit @TestFactory
minutes: 6
core: false
cheatsheet: 4
status: draft
---

Ein `@ParameterizedTest` hat eine feste Liste von Fällen in der Annotation oder einer Quellmethode. Manchmal willst du die Tests aber erst **zur Laufzeit erzeugen** – aus einer Map, einer Schleife über einen Wertebereich oder einer Datei. Dafür gibt es `@TestFactory`.

## Eine Fabrik für Tests

Eine `@TestFactory`-Methode ist selbst kein Test. Sie **liefert** Tests: einen `Stream` (oder eine `Collection`) von `DynamicTest`. Jeder `DynamicTest` hat einen Namen und ein Lambda mit dem eigentlichen Test.

```java
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;

import static org.junit.jupiter.api.DynamicTest.dynamicTest;

class TicketTest {

    @TestFactory
    Stream<DynamicTest> prices_per_category() {
        Map<Ticket.Category, Double> expected = Map.of(
                Ticket.Category.CHILD, 0.0,
                Ticket.Category.YOUTH, 5.0,
                Ticket.Category.ADULT, 10.0,
                Ticket.Category.SENIOR, 7.0);

        return expected.entrySet().stream()
                .map(e -> dynamicTest(e.getKey() + " kostet " + e.getValue(),
                        () -> assertThat(Ticket.price(e.getKey())).isEqualTo(e.getValue())));
    }
}
```

Im Testbericht erscheinen vier Tests: *CHILD kostet 0.0*, *YOUTH kostet 5.0* …

Ein zweites Beispiel: Jedes Alter von 0 bis 100 muss eine Kategorie haben.

```java
@TestFactory
Stream<DynamicTest> every_age_until_100_has_a_category() {
    return Stream.iterate(0, age -> age <= 100, age -> age + 1)
            .map(age -> dynamicTest("Alter " + age,
                    () -> assertThat(Ticket.categoryFor(age)).isNotNull()));
}
```

Das sind 101 Tests aus vier Zeilen.

:::achtung Lebenszyklus
`@BeforeEach` und `@AfterEach` laufen **einmal pro `@TestFactory`-Methode**, nicht für jeden einzelnen dynamischen Test. Brauchen deine dynamischen Tests jeweils frische Objekte, erzeuge sie im Lambda selbst.
:::

## Wann `@TestFactory`, wann `@ParameterizedTest`?

| | `@ParameterizedTest` | `@TestFactory` |
|---|---|---|
| Fälle | fest in Annotation oder Quellmethode | werden im Code erzeugt |
| Lebenszyklus | `@BeforeEach` vor jedem Fall | `@BeforeEach` einmal pro Fabrik |
| Lesbarkeit | sehr gut, Standardfall | etwas mehr Code |

Für die Matura reicht fast immer `@ParameterizedTest`. `@TestFactory` ist nützlich, wenn die Fälle aus einer Datenstruktur kommen, die du ohnehin schon hast.

:::merke
- `@TestFactory` liefert `Stream<DynamicTest>`; `dynamicTest(name, () -> ...)` erzeugt einen Test.
- `@BeforeEach` läuft pro Fabrik, nicht pro dynamischem Test.
- Im Zweifel ist `@ParameterizedTest` die einfachere Wahl.
:::
