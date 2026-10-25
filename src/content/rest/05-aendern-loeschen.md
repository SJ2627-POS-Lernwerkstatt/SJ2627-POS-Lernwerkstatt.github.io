---
title: Ersetzen, Ändern, Löschen
minutes: 8
cheatsheet: 21
status: draft
---

## `PUT`: ersetzen

```java
@PutMapping("/{isbn}")
public BookDto replace(@PathVariable String isbn, @Valid @RequestBody BookDto book) {
    return bookService.replace(isbn, book);
}
```

`PUT` schickt die **ganze** Ressource. Was im Body fehlt, ist danach leer. Oft erlaubt die Angabe nur einen Teil zu ersetzen („only core attributes of the recipe can be replaced“) – dann bekommt `PUT` ein eigenes DTO mit genau diesen Feldern.

## `PATCH`: teilweise ändern

```java
public record BookUpdateDto(@NotBlank String title, @NotBlank String author) { }

@PatchMapping("/{isbn}")
public BookDto update(@PathVariable String isbn, @Valid @RequestBody BookUpdateDto update) {
    return bookService.update(isbn, update);
}
```

`PATCH` ändert nur die geschickten Felder. Mit einem eigenen DTO ist klar, welche das sein dürfen.

## `DELETE`: löschen

```java
@DeleteMapping("/{isbn}")
public ResponseEntity<Void> delete(@PathVariable String isbn) {
    bookService.delete(isbn);
    return ResponseEntity.noContent().build();
}
```

`204 No Content`: erledigt, es gibt nichts zurückzuschicken.

## Was, wenn es die Ressource nicht gibt?

| Methode | Ressource fehlt | Üblich |
|---|---|---|
| `GET` | | `404` |
| `PUT` | | `404` (oder anlegen und `201`, wenn die Angabe es so will) |
| `PATCH` | | `404` |
| `DELETE` | | `404` |

Das Service signalisiert „gibt es nicht“ mit einem leeren `Optional` oder einer Exception wie `BookNotFoundException`. Wirft es, macht der `@RestControllerAdvice` daraus `404` (Einheit 7).

## Idempotent?

**Idempotent** heißt: Einmal oder zehnmal ausführen hat dieselbe Wirkung.

| Methode | idempotent | |
|---|---|---|
| `GET` | ja | ändert nichts |
| `PUT` | ja | dasselbe Buch zehnmal ersetzen = einmal ersetzen |
| `DELETE` | ja | gelöscht ist gelöscht (der zweite Aufruf liefert `404`, der Zustand bleibt gleich) |
| `POST` | nein | zehnmal anlegen = zehn Bücher (oder `409`) |
| `PATCH` | meistens | abhängig von der Änderung |

:::merke
- `PUT` ersetzt ganz, `PATCH` ändert teilweise – je ein passendes DTO.
- `DELETE` → `204 No Content`.
- Fehlt die Ressource → `404`, gemeldet vom Service über `Optional` oder Exception.
:::
