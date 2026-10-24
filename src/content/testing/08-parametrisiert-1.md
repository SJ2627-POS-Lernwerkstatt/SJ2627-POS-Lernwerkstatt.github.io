---
title: Parametrisierte Tests I
minutes: 9
cheatsheet: 4
status: draft
---

Ein Kino verkauft Tickets nach Alter: unter 6 gratis, bis 17 Jugend, bis 64 Erwachsene, ab 65 Senioren. Um das gründlich zu testen, brauchst du viele Fälle – vor allem die **Grenzen** (5 und 6, 17 und 18, 64 und 65). Sieben fast gleiche Testmethoden wären mühsam. Ein **parametrisierter Test** läuft einmal pro Datensatz.

## `@ParameterizedTest` mit `@ValueSource`

Statt `@Test` schreibst du `@ParameterizedTest` und gibst eine **Quelle** für die Argumente an. Die einfachste ist `@ValueSource` – ein Wert pro Durchlauf:

```java
@ParameterizedTest
@ValueSource(ints = {18, 30, 64})
void adults_pay_full_price(int age) {
    assertThat(Ticket.priceForAge(age)).isEqualTo(10.0);
}
```

Der Test läuft dreimal. Im Bericht siehst du jeden Durchlauf einzeln: `[1] age = 18`, `[2] age = 30`, `[3] age = 64`. Es gibt `ints`, `longs`, `doubles`, `strings`, `booleans` und einige mehr.

## Eingabe und Ergebnis: `@CsvSource`

Meistens brauchst du pro Fall **Eingabe und erwartetes Ergebnis**. Mit `@CsvSource` ist jeder String eine Zeile, die Werte sind durch Beistriche getrennt:

```java
@ParameterizedTest(name = "{0} Jahre → {1}")
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

- JUnit wandelt die Texte selbst in den Parametertyp um: `"17"` → `int`, `"YOUTH"` → Enum.
- Leerzeichen um die Werte werden ignoriert, du kannst also schön ausrichten.
- `name = "{0} Jahre → {1}"` legt fest, wie ein Durchlauf im Bericht heißt; `{0}` ist das erste Argument.

Längere Tabellen schreibst du übersichtlicher als **Text Block**:

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

:::achtung Leer oder null?
In `@CsvSource` ist `''` ein **leerer String**. Ein ganz leerer Wert (`", false"`) wird zu **`null`**. Wenn dein Test `""` erwartet und `null` bekommt, ist das meist der Grund.
:::

## `null` und leere Werte: `@NullSource`, `@EmptySource`

Für die typischen Randfälle gibt es eigene Quellen. Du kannst sie mit `@ValueSource` kombinieren:

```java
@ParameterizedTest
@NullAndEmptySource
@ValueSource(strings = {" ", "ABC1234"})
void invalid_codes(String code) {
    assertThat(Ticket.isValidCode(code)).isFalse();
}
```

Der Test läuft viermal: mit `null`, `""`, `" "` und `"ABC1234"`. `@NullAndEmptySource` ist die Kurzform für `@NullSource` + `@EmptySource`.

## Alle Werte eines Enums: `@EnumSource`

```java
@ParameterizedTest
@EnumSource(Ticket.Category.class)
void every_category_has_a_price(Ticket.Category category) {
    assertThat(Ticket.price(category)).isNotNegative();
}
```

Mit `names` und `mode` schränkst du die Werte ein:

```java
@EnumSource(value = Ticket.Category.class, names = {"CHILD"}, mode = EnumSource.Mode.EXCLUDE)
```

Kommt später ein neuer Enum-Wert dazu, wird er automatisch mitgetestet.

:::pruefung
Bei Aufgabe 2 sind Geschäftsregeln mit Grenzen typisch („ab 85 % voll abrechnen“, „unter 5 Sekunden verwerfen“). Ein `@CsvSource` mit den Werten **direkt an der Grenze und daneben** zeigt mit wenig Code, dass du alle Geschäftsfälle abgedeckt hast.
:::

:::merke
- `@ParameterizedTest` + eine Quelle statt `@Test`.
- `@ValueSource` für einen Wert, `@CsvSource` für Eingabe + Ergebnis.
- `@NullAndEmptySource` für `null` und `""`, `@EnumSource` für alle Enum-Werte.
- Grenzen immer von beiden Seiten testen.
:::
