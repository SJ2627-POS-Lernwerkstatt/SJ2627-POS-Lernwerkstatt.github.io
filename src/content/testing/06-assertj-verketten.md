---
title: AssertJ verketten und Optional prüfen
minutes: 7
cheatsheet: 6
status: draft
---

Repositories liefern bei `findById` ein `Optional`, Services oft ein Objekt mit mehreren Attributen. Statt den Wert erst herauszuholen und dann Zeile für Zeile zu prüfen, kannst du die Prüfungen in AssertJ **verketten**.

## `Optional` prüfen

```java
assertThat(cart.find("Buch")).isPresent();
assertThat(cart.find("Heft")).isEmpty();
assertThat(cart.find("Buch")).contains(new Item("Buch", 20.0));
```

Willst du mehrere Attribute des Inhalts prüfen, nimm `hasValueSatisfying`. Du bekommst den Wert als Lambda-Parameter und prüfst ihn darin wie gewohnt:

```java
assertThat(cart.find("Buch")).hasValueSatisfying(item -> {
    assertThat(item.name()).isEqualTo("Buch");
    assertThat(item.price()).isEqualTo(20.0);
});
```

Das ist das Standardmuster für den Lebenszyklus-Test eines Repositories:

```java
Station saved = repository.save(new Station("Westbahnhof", "Europaplatz 2", 24));

assertThat(repository.findById(saved.getId())).hasValueSatisfying(found -> {
    assertThat(found.getName()).isEqualTo("Westbahnhof");
    assertThat(found.getCapacity()).isEqualTo(24);
});
```

:::achtung Kein .get() ohne Prüfung
`repository.findById(id).get()` wirft eine `NoSuchElementException`, wenn nichts gefunden wurde. Der Test schlägt dann zwar fehl, aber mit einer Meldung, die nichts über den Fehler verrät. `hasValueSatisfying` sagt dir genau: *Expecting Optional to contain a value but it was empty*.
:::

## Ein Objekt mit mehreren Attributen

`satisfies` funktioniert wie `hasValueSatisfying`, nur für ein normales Objekt:

```java
assertThat(book).satisfies(item -> {
    assertThat(item.name()).isEqualTo("Buch");
    assertThat(item.price()).isPositive();
});
```

Für einfache Vergleiche gibt es zwei kürzere Formen:

```java
assertThat(book)
        .returns("Buch", Item::name)
        .returns(20.0, Item::price);

assertThat(book)
        .extracting(Item::name, Item::price)
        .containsExactly("Buch", 20.0);
```

`returns(erwartet, getter)` – hier steht der erwartete Wert **zuerst**.

## Alle, eines, keines

Für Listen kannst du eine Prüfung auf jedes Element anwenden:

```java
assertThat(items).allSatisfy(item -> assertThat(item.price()).isPositive());
assertThat(items).anySatisfy(item -> assertThat(item.name()).isEqualTo("Stift"));
assertThat(items).noneSatisfy(item -> assertThat(item.price()).isGreaterThan(100));
```

Und einzelne Elemente herausgreifen:

```java
assertThat(items).first().extracting(Item::name).isEqualTo("Buch");
assertThat(items).element(1).returns("Stift", Item::name);
assertThat(List.of(book)).singleElement().returns("Buch", Item::name);
```

`singleElement()` prüft gleich mit, dass die Liste **genau ein** Element hat – praktisch für Abfragen, die einen einzigen Treffer liefern sollen.

:::merke
- `Optional`: `isPresent`, `isEmpty`, `contains`, `hasValueSatisfying(...)`.
- Objekt: `satisfies(...)`, `returns(erwartet, getter)`, `extracting(...)`.
- Listen: `allSatisfy`, `anySatisfy`, `noneSatisfy`, `first`, `element(i)`, `singleElement`.
:::
