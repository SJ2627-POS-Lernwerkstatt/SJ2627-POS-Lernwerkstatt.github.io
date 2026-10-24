---
title: Reihenfolge von Tests
minutes: 5
core: false
cheatsheet: 4
status: draft
---

In welcher Reihenfolge laufen die Tests einer Klasse? Nicht in der, in der sie im Code stehen, und auch nicht alphabetisch. JUnit verwendet eine Reihenfolge, die **gleich bleibt, aber absichtlich nicht offensichtlich** ist. Bei drei Tests `c_third`, `a_first`, `b_second` liefen sie bei uns als `a_first`, `c_third`, `b_second`.

Das ist Absicht: Jeder Test soll für sich allein funktionieren. Wenn ein Test nur grün ist, weil ein anderer vorher etwas angelegt hat, ist das ein versteckter Fehler.

## Eine Reihenfolge erzwingen

Mit `@TestMethodOrder` legst du fest, wie JUnit die Methoden sortiert. Am häufigsten ist die Sortierung nach `@Order`:

```java
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.TestMethodOrder;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class CheckoutTest {

    @Test
    @Order(1)
    void first() { /* ... */ }

    @Test
    @Order(2)
    void second() { /* ... */ }

    @Test
    void unordered() { /* ... */ }
}
```

Kleinere Zahlen laufen zuerst. Methoden **ohne** `@Order` kommen nach denen mit `@Order`.

Andere Sortierungen: `MethodOrderer.MethodName.class` (alphabetisch), `MethodOrderer.DisplayName.class` und `MethodOrderer.Random.class` – Letztere ist nützlich, um versteckte Abhängigkeiten zwischen Tests **aufzudecken**.

Für `@Nested`-Klassen gibt es dasselbe auf Klassenebene: `@TestClassOrder(ClassOrderer.OrderAnnotation.class)` an der äußeren Klasse und `@Order` an den inneren Klassen.

## Warum man es selten braucht

:::achtung Kein Ersatz für Arrange
`@Order` ist **keine** Lösung für Tests, die voneinander abhängen. Läuft ein Test einmal allein (z. B. weil du in der IDE nur ihn startest), fehlen ihm die Daten des „vorigen“ Tests. Jeder Test baut seine Ausgangslage selbst auf – in `@BeforeEach` oder im Arrange-Teil.
:::

Sinnvoll ist eine feste Reihenfolge nur, wenn sie das **Lesen** des Testberichts erleichtert, oder bei langen Integrationstests, die bewusst einen Ablauf Schritt für Schritt nachspielen.

:::merke
- Ohne Angabe: feste, aber nicht offensichtliche Reihenfolge.
- `@TestMethodOrder(MethodOrderer.OrderAnnotation.class)` + `@Order(n)`; ohne `@Order` zuletzt.
- `@TestClassOrder` für `@Nested`-Klassen.
- Tests dürfen nie von der Reihenfolge abhängen.
:::
