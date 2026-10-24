---
title: Testdaten und Randwerte
minutes: 8
status: draft
---

Bei Aufgabe 2 steht in den Beurteilungskriterien: *„Tests erzeugen ausreichend Testdaten, um alle definierten Geschäftsfälle abzubilden.“* Die Frage ist also nicht nur **wie** du testest, sondern **mit welchen Daten**.

## Welche Fälle brauche ich?

Geh die Geschäftsregeln der Angabe durch und teile die möglichen Eingaben in **Klassen**, die gleich behandelt werden. Pro Klasse reicht ein typischer Wert – aber an jeder **Grenze** testest du beide Seiten.

Beispiel Kinokarten: unter 6 gratis, bis 17 Jugend, bis 64 Erwachsene, ab 65 Senioren, negatives Alter ist ein Fehler.

| Klasse | typischer Wert | Grenzwerte |
|---|---|---|
| ungültig | -10 | -1 |
| Kind | 3 | 0, 5 |
| Jugend | 12 | 6, 17 |
| Erwachsen | 40 | 18, 64 |
| Senior | 80 | 65 |

Die meisten Fehler entstehen an den Grenzen: `<` statt `<=`, `17` statt `18`. Ein Test mit nur „typischen“ Werten findet sie nicht.

```java
@ParameterizedTest
@CsvSource({
        "99.99,  99.99",
        "100.00, 90.00",
        "100.01, 90.009"
})
void discount_starts_at_100(double price, double expected) {
    assertThat(new PriceCalculator().finalPrice(price)).isCloseTo(expected, within(0.001));
}
```

:::pruefung
Schreib dir vor dem Testen eine kleine Tabelle wie oben: Regel, Klassen, Grenzen. So siehst du, ob jeder Geschäftsfall einen Test hat – genau danach wird bei Aufgabe 2 zwischen „Befriedigend“ (einzelne Basisfälle) und „Gut“ (alle Geschäftsfälle) unterschieden.
:::

## Testdaten erzeugen, ohne sich zu wiederholen

Wenn jeder Test seine Objekte mit fünf Konstruktor-Argumenten selbst baut, wird der Test lang und das Wesentliche geht unter. Lege dir **Hilfsmethoden** an, die gültige Standardobjekte liefern:

```java
final class TestFixtures {

    private TestFixtures() {
    }

    static Item book() {
        return new Item("Buch", 20.0);
    }

    static Item pen() {
        return new Item("Stift", 2.0);
    }

    static Cart cartWith(Item... items) {
        Cart cart = new Cart();
        for (Item item : items) {
            cart.add(item);
        }
        return cart;
    }
}
```

Mit einem statischen Import liest sich der Test dann fast wie die Angabe:

```java
import static shop.TestFixtures.*;

@Test
void total_of_book_and_pen() {
    Cart cart = cartWith(book(), pen());

    assertThat(cart.total()).isEqualTo(22.0);
}
```

- Die Klasse liegt unter `src/test/java`, im selben Package wie die Tests.
- Jeder Aufruf liefert ein **neues** Objekt. So kann kein Test die Daten eines anderen verändern.
- Sind nur ein, zwei Werte für den Test wichtig, gib nur diese als Parameter an, z. B. `itemWithPrice(100.0)`.

## Werte, die sofort auffallen

Wähle Testdaten so, dass ein falsches Ergebnis **erkennbar** ist. Wenn beide Artikel 10 Euro kosten, merkst du nicht, wenn der Code immer den ersten Preis verdoppelt. Mit 20 und 2 Euro schon.

:::merke
- Pro Geschäftsregel: Klassen bilden, je ein typischer Wert, an jeder Grenze **beide Seiten**.
- Ungültige Eingaben sind eine eigene Klasse – mit Exception-Test.
- Hilfsmethoden in einer `TestFixtures`-Klasse liefern frische, gültige Objekte.
- Unterschiedliche Werte wählen, damit Verwechslungen auffallen.
:::
