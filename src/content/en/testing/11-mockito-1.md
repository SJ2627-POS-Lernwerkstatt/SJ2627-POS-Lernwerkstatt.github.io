---
title: Mockito I – replacing dependencies
---

A service rarely works alone: it gets data from a repository and maybe sends a message. If you want to test **only the logic of the service**, you replace these dependencies with **mocks** – dummies whose behaviour you set in the test.

## The example

```java
public class ShopService {

    private final ItemRepository repository;
    private final Notifier notifier;

    public ShopService(ItemRepository repository, Notifier notifier) {
        this.repository = repository;
        this.notifier = notifier;
    }

    public double priceOf(String name) {
        return repository.findByName(name)
                .map(Item::price)
                .orElseThrow(() -> new IllegalArgumentException("unknown item: " + name));
    }
    // ...
}
```

`ItemRepository` and `Notifier` are interfaces. For the test of `priceOf` we need no database – only a repository that returns a certain item for `findByName("Book")`.

## Creating mocks with `@Mock` and `@InjectMocks`

```java
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShopServiceTest {

    @Mock
    private ItemRepository repository;

    @Mock
    private Notifier notifier;

    @InjectMocks
    private ShopService service;

    @Test
    void price_of_known_item() {
        // arrange
        when(repository.findByName("Book")).thenReturn(Optional.of(new Item("Book", 20.0)));

        // act
        double price = service.priceOf("Book");

        // assert
        assertThat(price).isEqualTo(20.0);
    }
}
```

- `@ExtendWith(MockitoExtension.class)` switches Mockito on for the test class.
- `@Mock` creates a new mock before every test.
- `@InjectMocks` creates the object you test and passes the mocks to it via the constructor.

## Setting behaviour: `when … thenReturn`

`when(mock.method(arguments)).thenReturn(value)` means: *when this method is called with exactly these arguments, return this value.* This belongs to the **arrange** part.

A mock that you have taught nothing returns "empty" default values: `null` for objects, `0` for numbers, `false`, an empty list or an empty `Optional`. You still test the error case explicitly so that the test shows what is meant:

```java
@Test
void price_of_unknown_item_fails() {
    when(repository.findByName("Notebook")).thenReturn(Optional.empty());

    assertThatIllegalArgumentException()
            .isThrownBy(() -> service.priceOf("Notebook"))
            .withMessageContaining("Notebook");
}
```

With `thenThrow(new IllegalStateException("db down"))` you make the dependency throw an exception – that is how you test how your service reacts to errors from outside.

:::achtung Unnecessary stubbing
The `MockitoExtension` is **strict**: if you set a behaviour with `when(...)` that the test never uses, the test fails with `UnnecessaryStubbingException`. That is on purpose – a superfluous `when` usually shows that the test does not check what you think. Delete the line.
:::

## Mockito in Spring tests

In Task 3 you test a REST controller with `@WebMvcTest`. There you replace the service not with `@Mock` but with **`@MockitoBean`** – this puts the mock into the Spring context as a bean. `when … thenReturn` works exactly the same. More on this in the REST controller module.

:::merke
- `@ExtendWith(MockitoExtension.class)`, `@Mock` for dependencies, `@InjectMocks` for the object under test.
- `when(mock.method(...)).thenReturn(...)` or `.thenThrow(...)` in the arrange part.
- Without stubbing a mock returns empty default values.
- Every `when` must actually be used in the test.
:::
