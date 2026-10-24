---
title: Exceptions testen
minutes: 7
status: draft
---

Bei jeder Aufgabe gibt es Fehlerfälle: ein negativer Preis, ein Artikel, den es nicht gibt, eine ungültige Eingabe am REST-Endpunkt. Dass dein Code in diesen Fällen die **richtige** Exception wirft, musst du genauso testen wie den Normalfall.

## `assertThatThrownBy`

Du übergibst den Aufruf als **Lambda**. AssertJ führt ihn aus, fängt die Exception und prüft sie:

```java
assertThatThrownBy(() -> cart.remove("Heft"))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("no item named Heft");
```

Statt der ganzen Meldung reicht oft ein Teil: `hasMessageContaining("Heft")`. Wirft der Aufruf **keine** Exception, schlägt der Test fehl.

:::achtung Der Aufruf gehört in das Lambda
```java
cart.remove("Heft");                             // wirft schon hier
assertThatThrownBy(() -> {}).isInstanceOf(...);  // nie erreicht
```
Steht der Aufruf außerhalb des Lambdas, fliegt die Exception, bevor AssertJ sie fangen kann. Der Test wird dann rot – obwohl dein Code genau das Richtige tut.
:::

## `assertThatExceptionOfType`

Dieselbe Prüfung, nur andersherum formuliert: erst der Typ, dann der Aufruf.

```java
assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> cart.add(null))
        .withMessageContaining("null");
```

Für häufige Typen gibt es Abkürzungen: `assertThatIllegalArgumentException()`, `assertThatIllegalStateException()`, `assertThatNullPointerException()`.

```java
assertThatIllegalArgumentException()
        .isThrownBy(() -> calculator.finalPrice(-1));
```

Welche Form du nimmst, ist Geschmack – bleib in einer Arbeit bei einer.

## `assertThrows` aus JUnit

JUnit hat eine eigene Variante. Sie **gibt die Exception zurück**, damit du sie weiter prüfen kannst:

```java
IllegalArgumentException e = assertThrows(IllegalArgumentException.class, () -> cart.remove("Heft"));
assertThat(e.getMessage()).contains("Heft");
```

## Dass **keine** Exception fliegt

Manchmal ist genau das die Aussage des Tests, etwa bei einer Validierung, die einen gültigen Wert akzeptieren muss:

```java
assertThatCode(() -> cart.add(new Item("Buch", 20.0))).doesNotThrowAnyException();
```

:::pruefung
Bei Aufgabe 2 (Service) und Aufgabe 3 (REST) verlangen die Beurteilungskriterien ausdrücklich, dass auch die **Exception-Fälle** getestet sind. Für ein „Sehr gut“ bei Aufgabe 3 brauchst du Tests für Good Cases, Edge Cases **und** Exception Cases.
:::

:::merke
- `assertThatThrownBy(() -> aufruf).isInstanceOf(...).hasMessage(...)`.
- Der Aufruf steht **im** Lambda.
- `assertThatCode(...).doesNotThrowAnyException()` für den Fall ohne Exception.
:::
