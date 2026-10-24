---
title: Mockito II – Aufrufe prüfen
minutes: 9
cheatsheet: 6
status: draft
---

Manche Methoden geben nichts zurück, sondern **bewirken** etwas: Sie löschen einen Datensatz oder verschicken eine Nachricht. Bei einem Mock kannst du nachträglich prüfen, **ob** und **wie** er aufgerufen wurde.

```java
public void discontinue(String name) {
    Item item = repository.findByName(name)
            .orElseThrow(() -> new IllegalArgumentException("unknown item: " + name));
    repository.delete(item);
    notifier.send("einkauf@shop.at", name + " ausgelistet");
}
```

## `verify`

```java
import static org.mockito.Mockito.verify;

@Test
void discontinue_deletes_and_notifies() {
    Item book = new Item("Buch", 20.0);
    when(repository.findByName("Buch")).thenReturn(Optional.of(book));

    service.discontinue("Buch");

    verify(repository).delete(book);
    verify(notifier).send("einkauf@shop.at", "Buch ausgelistet");
}
```

`verify(mock).methode(argumente)` prüft, dass diese Methode **genau einmal** mit diesen Argumenten aufgerufen wurde. `verify` gehört in den **Assert**-Teil.

Wie oft? Das zweite Argument von `verify` legt es fest:

| Aufruf | Bedeutung |
|---|---|
| `verify(mock).m()` | genau einmal |
| `verify(mock, times(2)).m()` | genau zweimal |
| `verify(mock, never()).m()` | nie |
| `verify(mock, atLeastOnce()).m()` | mindestens einmal |
| `verifyNoInteractions(mock)` | gar keine Methode aufgerufen |

Für den Fehlerfall heißt das: Wenn der Artikel nicht existiert, darf weder gelöscht noch benachrichtigt werden.

```java
@Test
void unknown_item_is_not_deleted() {
    when(repository.findByName("Heft")).thenReturn(Optional.empty());

    assertThatIllegalArgumentException().isThrownBy(() -> service.discontinue("Heft"));

    verify(repository, never()).delete(any());
    verifyNoInteractions(notifier);
}
```

## Argument Matcher: `any()`, `anyString()`, `eq()`

Ist das genaue Argument egal, nimmst du einen **Matcher** aus `org.mockito.ArgumentMatchers`: `any()`, `any(Item.class)`, `anyString()`, `anyInt()`, `contains("Buch")`. Das geht bei `when` und bei `verify`.

:::achtung Alle oder keiner
Verwendest du bei einem Aufruf **einen** Matcher, müssen **alle** Argumente Matcher sein. Feste Werte verpackst du dann mit `eq(...)`:

```java
verify(notifier).send("einkauf@shop.at", anyString());       // InvalidUseOfMatchersException
verify(notifier).send(eq("einkauf@shop.at"), anyString());   // richtig
```
:::

## Void-Methoden eine Exception werfen lassen: `doThrow`

`when(...)` braucht einen Rückgabewert und funktioniert deshalb nicht mit `void`-Methoden. Dafür gibt es die umgedrehte Form:

```java
doThrow(new IllegalStateException("mail server down"))
        .when(notifier).send(anyString(), anyString());

assertThatIllegalStateException().isThrownBy(() -> service.discontinue("Buch"));
```

## Das Argument zurückgeben: `returnsFirstArg`

Ein `save` im Repository gibt das gespeicherte Objekt zurück. Im Test soll der Mock einfach das zurückgeben, was er bekommen hat:

```java
import static org.mockito.AdditionalAnswers.returnsFirstArg;

when(repository.save(any(Item.class))).thenAnswer(returnsFirstArg());

Item saved = service.addItem("Heft", 1.5);

assertThat(saved).isEqualTo(new Item("Heft", 1.5));
```

## Was wurde übergeben? `ArgumentCaptor`

Erzeugt der Service das Objekt selbst, kannst du es dir mit einem Captor „fangen“ und genauer prüfen:

```java
@Captor
private ArgumentCaptor<Item> itemCaptor;

@Test
void add_item_saves_new_item() {
    when(repository.save(any(Item.class))).thenAnswer(returnsFirstArg());

    service.addItem("Heft", 1.5);

    verify(repository).save(itemCaptor.capture());
    assertThat(itemCaptor.getValue().name()).isEqualTo("Heft");
}
```

:::merke
- `verify(mock).methode(args)` = genau einmal; `times(n)`, `never()`, `verifyNoInteractions`.
- Matcher: alle Argumente oder keines; feste Werte mit `eq(...)`.
- `void`-Methode wirft: `doThrow(...).when(mock).methode(...)`.
- `thenAnswer(returnsFirstArg())` für `save`, `ArgumentCaptor` zum Prüfen übergebener Objekte.
:::
