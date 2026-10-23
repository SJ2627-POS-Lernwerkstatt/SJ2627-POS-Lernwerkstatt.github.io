---
title: Aufbau eines Tests
minutes: 7
cheatsheet: 4
status: draft
---

Bei der Matura musst du **jede** Aufgabe testen: Entities, Services und REST-Controller. Ein Test ohne klaren Aufbau ist schwer zu lesen und noch schwerer zu reparieren. Deshalb folgt jeder Test in diesem Kurs demselben Muster.

## Arrange, Act, Assert

Ein Test hat drei Teile:

1. **Arrange** – du baust die Ausgangslage auf: Objekte, Testdaten, Mocks.
2. **Act** – du rufst genau **eine** Methode auf, die du testen willst.
3. **Assert** – du prüfst, ob das Ergebnis stimmt.

```java
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PriceCalculatorTest {

    @Test
    void verify_discount_is_applied_above_100_euro() {
        // arrange
        PriceCalculator calculator = new PriceCalculator();

        // act
        double price = calculator.finalPrice(120.0);

        // assert
        assertThat(price).isEqualTo(108.0);
    }
}
```

Die drei Kommentare sind kein Muss, aber sie helfen dir: Wenn dein *act*-Teil plötzlich drei Aufrufe hat, testest du wahrscheinlich zu viel auf einmal.

## Was macht `@Test`?

JUnit Jupiter sucht in der Testklasse nach Methoden mit `@Test` und führt jede davon **einzeln** aus – mit einer **neuen Instanz** der Testklasse. Ein Test darf sich also nie darauf verlassen, dass ein anderer Test vorher gelaufen ist.

- Die Testklasse und die Testmethoden brauchen kein `public`.
- Testmethoden geben nichts zurück (`void`) und haben normalerweise keine Parameter.
- Der Name beschreibt, **was** geprüft wird, z. B. `verify_discount_is_applied_above_100_euro`.

:::achtung Der falsche Import
Es gibt zwei `@Test`-Annotationen: `org.junit.Test` (JUnit 4) und `org.junit.jupiter.api.Test` (JUnit Jupiter). Mit der alten Annotation werden deine Tests in Spring-Projekten nicht richtig ausgeführt – `@Autowired`-Felder bleiben dann `null` und du bekommst eine `NullPointerException`.

Alle Imports kommen aus `org.junit.jupiter.api`.
:::

## Wo liegen die Tests?

Tests liegen im selben **Package** wie die getestete Klasse, aber unter `src/test/java` statt `src/main/java`. Die Testklasse heißt wie die getestete Klasse mit `Test` am Ende.

| Klasse | Test |
|---|---|
| `src/main/java/shop/PriceCalculator.java` | `src/test/java/shop/PriceCalculatorTest.java` |

:::pruefung
In den Beurteilungskriterien steht bei jeder Aufgabe sinngemäß: *„Alle implementierten Elemente sind durch Unit-Tests überprüft.“* Ohne Tests erreichst du höchstens ein „Genügend“ – auch wenn dein Code fehlerfrei ist.
:::

:::merke
- Ein Test = **Arrange, Act, Assert**.
- Imports immer aus `org.junit.jupiter.api`.
- Jeder Test läuft für sich allein, mit einer frischen Instanz der Testklasse.
:::
