---
title: "@PathVariable und @RequestParam"
minutes: 7
cheatsheet: 21
status: draft
---

Werte kommen auf zwei Wegen in den Controller: als Teil des **Pfads** oder als **Query-Parameter** nach dem `?`.

## `@PathVariable`: welche Ressource

```java
@GetMapping("/{isbn}")
public ResponseEntity<BookDto> findByIsbn(@PathVariable String isbn) { ... }

@GetMapping("/{isbn}/loans/{loanId}")
public LoanDto loan(@PathVariable String isbn, @PathVariable long loanId) { ... }
```

- `{isbn}` im Pfad und der Parameter `isbn` müssen gleich heißen – oder du schreibst `@PathVariable("isbn") String id`.
- Spring wandelt den Text in den Typ des Parameters um. `GET /api/books/by-id/abc` auf einen `long`-Parameter liefert `400 Bad Request`, ohne dass deine Methode aufgerufen wird.

## `@RequestParam`: filtern, suchen, blättern

```java
@GetMapping
public List<BookDto> findAll(@RequestParam(required = false) String author) {
    return bookService.findAll(author);
}
```

`GET /api/books?author=Bachmann` ruft die Methode mit `"Bachmann"` auf, `GET /api/books` mit `null`.

| Variante | Fehlt der Parameter … |
|---|---|
| `@RequestParam String q` | `400 Bad Request` |
| `@RequestParam(required = false) String q` | `null` |
| `@RequestParam(defaultValue = "20") int size` | `20` |
| `@RequestParam Optional<String> q` | `Optional.empty()` |

## Was wohin?

- **Pfad**: was eine Ressource **ist** – die Id, die ISBN, die Unterressource.
- **Query**: **wie** gelesen wird – Filter, Suche, Sortierung, Seite.

`/api/books/9783518365000` ist ein Buch. `/api/books?author=Bachmann` ist eine gefilterte Liste – keine eigene Ressource.

:::merke
- `@PathVariable` für Ids im Pfad, Name passend zu `{…}`.
- `@RequestParam` für Filter und Optionen; `required = false` oder `defaultValue` für optionale.
- Falscher Typ oder fehlender Pflichtparameter → `400`, ohne dass deine Methode läuft.
:::
