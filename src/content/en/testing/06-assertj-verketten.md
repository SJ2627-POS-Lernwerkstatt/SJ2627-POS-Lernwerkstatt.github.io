---
title: Chaining AssertJ and checking Optional
---

Repositories return an `Optional` for `findById`, services often an object with several attributes. Instead of taking the value out first and then checking it line by line, you can **chain** the checks in AssertJ.

## Checking `Optional`

```java
assertThat(cart.find("Book")).isPresent();
assertThat(cart.find("Notebook")).isEmpty();
assertThat(cart.find("Book")).contains(new Item("Book", 20.0));
```

If you want to check several attributes of the content, use `hasValueSatisfying`. You get the value as a lambda parameter and check it inside as usual:

```java
assertThat(cart.find("Book")).hasValueSatisfying(item -> {
    assertThat(item.name()).isEqualTo("Book");
    assertThat(item.price()).isEqualTo(20.0);
});
```

This is the standard pattern for the lifecycle test of a repository:

```java
Station saved = repository.save(new Station("Westbahnhof", "Europaplatz 2", 24));

assertThat(repository.findById(saved.getId())).hasValueSatisfying(found -> {
    assertThat(found.getName()).isEqualTo("Westbahnhof");
    assertThat(found.getCapacity()).isEqualTo(24);
});
```

:::achtung No .get() without a check
`repository.findById(id).get()` throws a `NoSuchElementException` if nothing was found. The test fails then, but with a message that tells you nothing about the mistake. `hasValueSatisfying` tells you exactly: *Expecting Optional to contain a value but it was empty*.
:::

## An object with several attributes

`satisfies` works like `hasValueSatisfying`, just for a normal object:

```java
assertThat(book).satisfies(item -> {
    assertThat(item.name()).isEqualTo("Book");
    assertThat(item.price()).isPositive();
});
```

For simple comparisons there are two shorter forms:

```java
assertThat(book)
        .returns("Book", Item::name)
        .returns(20.0, Item::price);

assertThat(book)
        .extracting(Item::name, Item::price)
        .containsExactly("Book", 20.0);
```

`returns(expected, getter)` – here the expected value comes **first**.

## All, one, none

For lists you can apply a check to every element:

```java
assertThat(items).allSatisfy(item -> assertThat(item.price()).isPositive());
assertThat(items).anySatisfy(item -> assertThat(item.name()).isEqualTo("Pen"));
assertThat(items).noneSatisfy(item -> assertThat(item.price()).isGreaterThan(100));
```

And pick out single elements:

```java
assertThat(items).first().extracting(Item::name).isEqualTo("Book");
assertThat(items).element(1).returns("Pen", Item::name);
assertThat(List.of(book)).singleElement().returns("Book", Item::name);
```

`singleElement()` also checks that the list has **exactly one** element – handy for queries that should return a single hit.

:::merke
- `Optional`: `isPresent`, `isEmpty`, `contains`, `hasValueSatisfying(...)`.
- Object: `satisfies(...)`, `returns(expected, getter)`, `extracting(...)`.
- Lists: `allSatisfy`, `anySatisfy`, `noneSatisfy`, `first`, `element(i)`, `singleElement`.
:::
