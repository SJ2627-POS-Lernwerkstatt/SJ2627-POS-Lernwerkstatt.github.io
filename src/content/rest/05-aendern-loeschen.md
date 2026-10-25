---
title: Ersetzen, Ändern, Löschen
minutes: 8
cheatsheet: 21
status: draft
---

## `PUT`: ersetzen

```java
public record BookReplaceCmd(@NotBlank String title, @NotBlank String author,
                             @JsonProperty("published-year") int publishedYear) { }

@PutMapping("/{isbn}")
public BookDto replace(@PathVariable String isbn, @Valid @RequestBody BookReplaceCmd book) {
    return bookService.replace(isbn, book);
}
```

`PUT` schickt die **ganze** Ressource. Was im Body fehlt, ist danach leer. Die ISBN steht schon im Pfad, deshalb fehlt sie im Command. Oft erlaubt die Angabe nur einen Teil zu ersetzen („only core attributes of the recipe can be replaced“) – das `…ReplaceCmd` hat dann genau diese Felder.

## `PATCH`: teilweise ändern

```java
public record BookUpdateCmd(@NotBlank String title, @NotBlank String author) { }

@PatchMapping("/{isbn}")
public BookDto update(@PathVariable String isbn, @Valid @RequestBody BookUpdateCmd update) {
    return bookService.update(isbn, update);
}
```

`PATCH` ändert nur die geschickten Felder. Mit einem eigenen Command ist klar, welche das sein dürfen.

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
- `PUT` ersetzt ganz, `PATCH` ändert teilweise – je ein passendes Command (`…ReplaceCmd`, `…UpdateCmd`).
- `DELETE` → `204 No Content`.
- Fehlt die Ressource → `404`, gemeldet vom Service über `Optional` oder Exception.
:::
