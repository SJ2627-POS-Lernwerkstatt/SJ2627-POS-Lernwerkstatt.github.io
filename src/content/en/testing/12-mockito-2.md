---
title: Mockito II – verifying calls
---

Some methods return nothing but **cause** something: they delete a row or send a message. With a mock you can check afterwards **whether** and **how** it was called.

```java
public void discontinue(String name) {
    Item item = repository.findByName(name)
            .orElseThrow(() -> new IllegalArgumentException("unknown item: " + name));
    repository.delete(item);
    notifier.send("purchasing@shop.at", name + " discontinued");
}
```

## `verify`

```java
import static org.mockito.Mockito.verify;

@Test
void discontinue_deletes_and_notifies() {
    Item book = new Item("Book", 20.0);
    when(repository.findByName("Book")).thenReturn(Optional.of(book));

    service.discontinue("Book");

    verify(repository).delete(book);
    verify(notifier).send("purchasing@shop.at", "Book discontinued");
}
```

`verify(mock).method(arguments)` checks that this method was called **exactly once** with these arguments. `verify` belongs in the **assert** part.

How often? The second argument of `verify` sets it:

| Call | Meaning |
|---|---|
| `verify(mock).m()` | exactly once |
| `verify(mock, times(2)).m()` | exactly twice |
| `verify(mock, never()).m()` | never |
| `verify(mock, atLeastOnce()).m()` | at least once |
| `verifyNoInteractions(mock)` | no method called at all |

For the error case this means: if the item does not exist, nothing may be deleted and nobody notified.

```java
@Test
void unknown_item_is_not_deleted() {
    when(repository.findByName("Notebook")).thenReturn(Optional.empty());

    assertThatIllegalArgumentException().isThrownBy(() -> service.discontinue("Notebook"));

    verify(repository, never()).delete(any());
    verifyNoInteractions(notifier);
}
```

## Argument matchers: `any()`, `anyString()`, `eq()`

If the exact argument does not matter, use a **matcher** from `org.mockito.ArgumentMatchers`: `any()`, `any(Item.class)`, `anyString()`, `anyInt()`, `contains("Book")`. This works with `when` and with `verify`.

:::achtung All or none
If you use **one** matcher in a call, **all** arguments have to be matchers. Wrap fixed values with `eq(...)` then:

```java
verify(notifier).send("purchasing@shop.at", anyString());       // InvalidUseOfMatchersException
verify(notifier).send(eq("purchasing@shop.at"), anyString());   // correct
```
:::

## Making void methods throw: `doThrow`

`when(...)` needs a return value and therefore does not work with `void` methods. For them there is the reversed form:

```java
doThrow(new IllegalStateException("mail server down"))
        .when(notifier).send(anyString(), anyString());

assertThatIllegalStateException().isThrownBy(() -> service.discontinue("Book"));
```

## Returning the argument: `returnsFirstArg`

A `save` in the repository returns the saved object. In the test the mock should simply return what it got:

```java
import static org.mockito.AdditionalAnswers.returnsFirstArg;

when(repository.save(any(Item.class))).thenAnswer(returnsFirstArg());

Item saved = service.addItem("Notebook", 1.5);

assertThat(saved).isEqualTo(new Item("Notebook", 1.5));
```

## What was passed? `ArgumentCaptor`

If the service creates the object itself, you can "catch" it with a captor and check it more closely:

```java
@Captor
private ArgumentCaptor<Item> itemCaptor;

@Test
void add_item_saves_new_item() {
    when(repository.save(any(Item.class))).thenAnswer(returnsFirstArg());

    service.addItem("Notebook", 1.5);

    verify(repository).save(itemCaptor.capture());
    assertThat(itemCaptor.getValue().name()).isEqualTo("Notebook");
}
```

:::merke
- `verify(mock).method(args)` = exactly once; `times(n)`, `never()`, `verifyNoInteractions`.
- Matchers: all arguments or none; fixed values with `eq(...)`.
- A `void` method throws: `doThrow(...).when(mock).method(...)`.
- `thenAnswer(returnsFirstArg())` for `save`, `ArgumentCaptor` to check passed objects.
:::
