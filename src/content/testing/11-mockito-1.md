---
title: Mockito I – Abhängigkeiten ersetzen
minutes: 9
cheatsheet: 5
status: draft
---

Ein Service arbeitet selten allein: Er holt Daten aus einem Repository und verschickt vielleicht eine Nachricht. Willst du **nur die Logik des Service** testen, ersetzt du diese Abhängigkeiten durch **Mocks** – Attrappen, deren Verhalten du im Test festlegst.

## Das Beispiel

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

`ItemRepository` und `Notifier` sind Interfaces. Für den Test von `priceOf` brauchen wir keine Datenbank – nur ein Repository, das auf `findByName("Buch")` einen bestimmten Artikel liefert.

## Mocks anlegen mit `@Mock` und `@InjectMocks`

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
        when(repository.findByName("Buch")).thenReturn(Optional.of(new Item("Buch", 20.0)));

        // act
        double price = service.priceOf("Buch");

        // assert
        assertThat(price).isEqualTo(20.0);
    }
}
```

- `@ExtendWith(MockitoExtension.class)` schaltet Mockito für die Testklasse ein.
- `@Mock` erzeugt vor jedem Test einen neuen Mock.
- `@InjectMocks` erzeugt das Objekt, das du testest, und übergibt ihm die Mocks über den Konstruktor.

## Verhalten festlegen: `when … thenReturn`

`when(mock.methode(argumente)).thenReturn(wert)` heißt: *Wenn diese Methode mit genau diesen Argumenten aufgerufen wird, gib diesen Wert zurück.* Das gehört zum **Arrange**-Teil.

Ein Mock, dem du nichts beigebracht hast, liefert „leere“ Standardwerte: `null` für Objekte, `0` für Zahlen, `false`, eine leere Liste oder ein leeres `Optional`. Den Fehlerfall testest du trotzdem ausdrücklich, damit man im Test sieht, was gemeint ist:

```java
@Test
void price_of_unknown_item_fails() {
    when(repository.findByName("Heft")).thenReturn(Optional.empty());

    assertThatIllegalArgumentException()
            .isThrownBy(() -> service.priceOf("Heft"))
            .withMessageContaining("Heft");
}
```

Mit `thenThrow(new IllegalStateException("db down"))` lässt du die Abhängigkeit eine Exception werfen – so testest du, wie dein Service auf Fehler von außen reagiert.

:::achtung Unnötiges Stubbing
Die `MockitoExtension` ist **streng**: Legst du mit `when(...)` ein Verhalten fest, das der Test nie verwendet, schlägt der Test mit `UnnecessaryStubbingException` fehl. Das ist Absicht – ein überflüssiges `when` zeigt meist, dass der Test nicht das prüft, was du glaubst. Lösch die Zeile.
:::

## Mockito in Spring-Tests

Bei Aufgabe 3 testest du einen REST-Controller mit `@WebMvcTest`. Dort ersetzt du den Service nicht mit `@Mock`, sondern mit **`@MockitoBean`** – das legt den Mock als Bean in den Spring-Kontext. `when … thenReturn` funktioniert genau gleich. Mehr dazu im Modul REST-Controller.

:::merke
- `@ExtendWith(MockitoExtension.class)`, `@Mock` für Abhängigkeiten, `@InjectMocks` für das getestete Objekt.
- `when(mock.methode(...)).thenReturn(...)` bzw. `.thenThrow(...)` im Arrange-Teil.
- Ohne Stubbing liefert ein Mock leere Standardwerte.
- Jedes `when` muss im Test auch gebraucht werden.
:::
