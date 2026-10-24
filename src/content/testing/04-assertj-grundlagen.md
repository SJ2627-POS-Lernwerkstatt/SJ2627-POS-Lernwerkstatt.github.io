---
title: AssertJ Grundlagen
minutes: 8
cheatsheet: 6
status: draft
---

Für das *Assert* in deinen Tests verwendest du **AssertJ**. Es ist in jedem Spring-Boot-Projekt schon dabei (über die Test-Starter) und liest sich fast wie ein Satz: *„Stelle sicher, dass der Preis gleich 108 ist.“*

## Der Einstieg: `assertThat`

```java
import static org.assertj.core.api.Assertions.assertThat;

assertThat(price).isEqualTo(108.0);
```

`assertThat(actual)` nimmt den **tatsächlichen** Wert. Danach wählst du mit Code-Vervollständigung eine passende Prüfung. Welche Prüfungen es gibt, hängt vom Typ ab: Für Strings gibt es `startsWith`, für Zahlen `isPositive`, für Listen `hasSize`.

| Typ | Häufige Prüfungen |
|---|---|
| alle Objekte | `isEqualTo`, `isNotEqualTo`, `isNull`, `isNotNull`, `isSameAs`, `isInstanceOf` |
| `boolean` | `isTrue`, `isFalse` |
| Zahlen | `isZero`, `isPositive`, `isGreaterThan`, `isBetween`, `isCloseTo` |
| `String` | `isEmpty`, `isBlank`, `startsWith`, `contains`, `matches`, `isEqualToIgnoringCase` |
| `BigDecimal` | `isEqualByComparingTo` |

Mehrere Prüfungen auf denselben Wert kannst du verketten:

```java
assertThat(item.name())
        .isNotBlank()
        .startsWith("B")
        .hasSize(4);
```

## Dezimalzahlen richtig vergleichen

`double` rechnet binär und deshalb nicht immer genau: `0.1 + 0.2` ist `0.30000000000000004`. Für berechnete Werte prüfst du deshalb mit Toleranz:

```java
import static org.assertj.core.api.Assertions.within;

assertThat(0.1 + 0.2).isCloseTo(0.3, within(0.0001));
```

Bei `BigDecimal` vergleicht `equals` auch die Anzahl der Nachkommastellen: `new BigDecimal("2.50")` ist **nicht** gleich `new BigDecimal("2.5")`. Vergleiche den Zahlenwert mit `isEqualByComparingTo`:

```java
assertThat(new BigDecimal("2.50")).isEqualByComparingTo("2.5");
```

:::achtung isEqualTo bei BigDecimal
`assertThat(new BigDecimal("2.50")).isEqualTo(new BigDecimal("2.5"))` schlägt fehl. Das passiert oft, wenn ein Wert aus der Datenbank (`precision = 7, scale = 2`) mit einem selbst geschriebenen Wert verglichen wird.
:::

## `isEqualTo` oder `isSameAs`?

- `isEqualTo` vergleicht mit `equals` – also den **Inhalt**.
- `isSameAs` vergleicht mit `==` – also, ob es **dasselbe Objekt** ist.

Für Records, Strings und Zahlen willst du fast immer `isEqualTo`.

## Und `assertEquals`?

JUnit hat eigene Assertions in `org.junit.jupiter.api.Assertions`. Sie funktionieren auch, aber die Reihenfolge der Argumente ist umgekehrt – erst der **erwartete**, dann der **tatsächliche** Wert:

```java
assertEquals(108.0, price);          // JUnit: expected, actual
assertThat(price).isEqualTo(108.0);  // AssertJ: actual zuerst
```

Wer die Reihenfolge verwechselt, bekommt verwirrende Fehlermeldungen („expected: 120 but was: 108“). Verwende in einer Arbeit nur **eine** Bibliothek – in diesem Kurs AssertJ.

## Fehlermeldungen mit `as`

Mit `as(...)` beschreibst du, **was** geprüft wird. Die Beschreibung erscheint in der Fehlermeldung. `as` muss **vor** der Prüfung stehen:

```java
assertThat(cart.total()).as("Summe nach zwei Artikeln").isEqualTo(22.0);
```

:::merke
- `assertThat(actual)` + Prüfung, Import aus `org.assertj.core.api.Assertions`.
- `double` mit `isCloseTo(..., within(...))`, `BigDecimal` mit `isEqualByComparingTo`.
- `isEqualTo` vergleicht den Inhalt, `isSameAs` die Identität.
:::
