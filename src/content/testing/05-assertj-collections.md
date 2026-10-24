---
title: AssertJ für Listen
minutes: 8
cheatsheet: 6
status: draft
---

Abfragen in Repositories und Services geben meist Listen zurück. AssertJ hat dafür eigene Prüfungen, die dir die Schleifen im Test ersparen.

## Größe und Inhalt

```java
List<String> names = List.of("Anna", "Ben", "Cem");

assertThat(names).hasSize(3);
assertThat(names).contains("Ben");                          // mindestens dieses Element
assertThat(names).doesNotContain("Dora");
assertThat(names).containsExactly("Anna", "Ben", "Cem");    // alle, genau diese Reihenfolge
assertThat(names).containsExactlyInAnyOrder("Cem", "Anna", "Ben");
assertThat(List.of()).isEmpty();
```

Welche Prüfung passt?

| Prüfung | Alle Elemente? | Reihenfolge? |
|---|---|---|
| `contains(...)` | nein, nur die genannten müssen vorkommen | egal |
| `containsExactlyInAnyOrder(...)` | ja | egal |
| `containsExactly(...)` | ja | ja |

:::achtung Reihenfolge aus der Datenbank
Ohne `order by` (bzw. `OrderBy` im Methodennamen) liefert eine Abfrage die Zeilen in **keiner** festen Reihenfolge. Prüf solche Ergebnisse mit `containsExactlyInAnyOrder`, sonst läuft dein Test heute grün und morgen rot.
:::

## `extracting`: Ein Attribut aus jedem Element

Meist enthält die Liste Objekte, keine Strings. Mit `extracting` holst du aus jedem Element einen Wert heraus und prüfst dann diese Werte:

```java
List<Item> items = List.of(new Item("Buch", 20.0), new Item("Stift", 2.0));

assertThat(items)
        .extracting(Item::name)
        .containsExactly("Buch", "Stift");
```

Mehrere Attribute auf einmal prüfst du mit `tuple`:

```java
import static org.assertj.core.api.Assertions.tuple;

assertThat(items)
        .extracting(Item::name, Item::price)
        .containsExactly(
                tuple("Buch", 20.0),
                tuple("Stift", 2.0));
```

So musst du für den Vergleich keine eigenen `Item`-Objekte bauen – praktisch bei Entities, deren `id` du vorher nicht kennst.

## Elemente filtern

`filteredOn` prüft nur die Elemente, die eine Bedingung erfüllen:

```java
assertThat(items)
        .filteredOn(item -> item.price() > 10)
        .extracting(Item::name)
        .containsExactly("Buch");
```

## Maps

```java
Map<String, Integer> stock = Map.of("Buch", 3, "Stift", 10);

assertThat(stock)
        .hasSize(2)
        .containsKey("Buch")
        .containsEntry("Stift", 10);
```

:::pruefung
Bei Aufgabe 1 musst du Abfragen testen, z. B. „alle Boxen eines Stockwerks“. Ein guter Test legt Daten an, die **zur Abfrage passen und nicht passen**, und prüft dann mit `extracting(...).containsExactlyInAnyOrder(...)`, dass genau die richtigen zurückkommen.
:::

:::merke
- `contains` = mindestens, `containsExactly` = genau diese in dieser Reihenfolge, `containsExactlyInAnyOrder` = genau diese.
- `extracting(Klasse::getter)` holt ein Attribut aus jedem Element, mit `tuple` mehrere.
- Ergebnisse ohne `order by` nie mit `containsExactly` prüfen.
:::
