---
title: Parametrisierte Testklassen
minutes: 6
core: false
cheatsheet: 4
status: draft
---

Ein `@ParameterizedTest` wiederholt **eine Methode** mit verschiedenen Argumenten. Manchmal willst du aber **mehrere Tests** mit denselben Daten laufen lassen: Für jedes Erwachsenenalter soll die Kategorie stimmen **und** der Preis. Seit JUnit 5.13 kannst du dafür die ganze Klasse parametrisieren.

## `@ParameterizedClass` mit `@Parameter`

```java
import org.junit.jupiter.params.Parameter;
import org.junit.jupiter.params.ParameterizedClass;
import org.junit.jupiter.params.provider.ValueSource;

@ParameterizedClass
@ValueSource(ints = {18, 40, 64})
class AdultTicketTest {

    @Parameter
    int age;

    @Test
    void is_adult() {
        assertThat(Ticket.categoryFor(age)).isEqualTo(Ticket.Category.ADULT);
    }

    @Test
    void pays_full_price() {
        assertThat(Ticket.priceForAge(age)).isEqualTo(10.0);
    }
}
```

JUnit führt die **ganze Klasse** dreimal aus, einmal pro Wert. Vor jedem Durchlauf schreibt es den Wert in das Feld mit `@Parameter`. Das ergibt sechs Tests: zwei Methoden × drei Werte.

Alle Quellen, die du von `@ParameterizedTest` kennst, funktionieren auch hier: `@CsvSource`, `@MethodSource`, `@EnumSource` …

## Mehrere Werte: Konstruktor oder Record

Bei mehreren Werten pro Durchlauf bekommt die Klasse sie über den **Konstruktor**. Am kürzesten geht das mit einem Record:

```java
@ParameterizedClass
@CsvSource({"Buch, 20.0", "Stift, 2.0"})
record CartTotalTest(String name, double price) {

    @Test
    void cart_total_is_price() {
        Cart cart = new Cart();
        cart.add(new Item(name, price));

        assertThat(cart.total()).isEqualTo(price);
    }
}
```

Alternativ nummerierst du mehrere `@Parameter`-Felder: `@Parameter(0) String name;` und `@Parameter(1) double price;`.

:::achtung Noch experimentell
`@ParameterizedClass` ist in JUnit 6 noch als *experimentell* markiert. Es funktioniert, aber Details können sich in einer späteren Version ändern. In der Matura bist du mit `@ParameterizedTest` auf der sicheren Seite.
:::

:::merke
- `@ParameterizedClass` + Quelle an der Klasse: alle Tests laufen einmal pro Datensatz.
- Ein Wert: Feld mit `@Parameter`; mehrere Werte: Konstruktor, Record oder `@Parameter(index)`.
- Für einzelne Testmethoden bleibt `@ParameterizedTest` die erste Wahl.
:::
