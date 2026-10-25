---
title: HATEOAS mit EntityModel
minutes: 10
cheatsheet: 22
status: draft
---

**HATEOAS** (*Hypermedia as the Engine of Application State*) heißt: Eine Antwort enthält **Links** auf das, was der Client als Nächstes tun kann. Wer ein Buch liest, bekommt den Link auf seine Ausleihen gleich mit. Spring HATEOAS ist im Seed-Projekt schon eingebunden.

## `EntityModel`: eine Ressource mit Links

```java
@GetMapping("/{isbn}")
public ResponseEntity<EntityModel<BookDto>> findByIsbn(@PathVariable String isbn) {
    return bookService.findByIsbn(isbn)
            .map(book -> EntityModel.of(book,
                    linkTo(methodOn(BookController.class).findByIsbn(isbn)).withSelfRel(),
                    linkTo(methodOn(BookController.class).loans(isbn)).withRel("loans"),
                    linkTo(methodOn(BookController.class).findAll(null)).withRel("books")))
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}
```

Die Antwort im Format **HAL** (`application/hal+json`):

```json
{
  "isbn": "9783518365000",
  "title": "Malina",
  "author": "Ingeborg Bachmann",
  "published-year": 1971,
  "_links": {
    "self":  { "href": "http://localhost/api/books/9783518365000" },
    "loans": { "href": "http://localhost/api/books/9783518365000/loans" },
    "books": { "href": "http://localhost/api/books{?author}", "templated": true }
  }
}
```

- `EntityModel.of(dto, links…)` verpackt das DTO, die Felder bleiben auf oberster Ebene.
- `withSelfRel()` ist der Link auf die Ressource selbst, `withRel("name")` jeder weitere.
- `linkTo(methodOn(…).methode(…))` baut die URL aus der Controller-Methode – so stimmen Links auch nach einer Pfadänderung.
- Optionale `@RequestParam`s erscheinen als Vorlage: `{?author}` mit `"templated": true`.
- Die Methode in `methodOn(...)` muss etwas zurückgeben, das kein Record ist – `ResponseEntity`, `EntityModel`, `CollectionModel` (Einheit 4).

## `CollectionModel`: eine Liste mit Links

```java
@GetMapping
public CollectionModel<EntityModel<BookDto>> findAll() {
    List<EntityModel<BookDto>> books = bookService.findAll(null).stream()
            .map(book -> EntityModel.of(book,
                    linkTo(methodOn(BookController.class).findByIsbn(book.isbn())).withSelfRel()))
            .toList();
    return CollectionModel.of(books, linkTo(methodOn(BookController.class).findAll()).withSelfRel());
}
```

```json
{
  "_embedded": {
    "bookDtoList": [
      { "isbn": "9783518365000", "title": "Malina", "_links": { "self": { "href": "…/api/books/9783518365000" } } }
    ]
  },
  "_links": { "self": { "href": "http://localhost/api/books" } }
}
```

Die Elemente stehen unter `_embedded`, der Name kommt vom Typ: `BookDto` → `bookDtoList`. Mit `@Relation(collectionRelation = "books")` am Record heißt die Liste `books`.

## Den `Location`-Header aus einem Link

Auch ohne `EntityModel` hilft `linkTo` beim `201 Created` (Einheit 4):

```java
return ResponseEntity
        .created(linkTo(methodOn(BookController.class).findByIsbn(created.isbn())).toUri())
        .body(created);
```

## Testen

```java
@Test
void verify_book_links() throws Exception {
    when(bookService.findByIsbn("9783518365000")).thenReturn(Optional.of(MALINA));

    mockMvc.perform(get("/api/books/9783518365000"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Malina"))
            .andExpect(jsonPath("$._links.self.href").value("http://localhost/api/books/9783518365000"))
            .andExpect(jsonPath("$._links.loans.href", endsWith("/api/books/9783518365000/loans")));
}
```

In `MockMvc` ist der Host immer `http://localhost`.

:::merke
- `EntityModel.of(dto, links)` für eine Ressource, `CollectionModel.of(liste, links)` für eine Liste.
- Links mit `linkTo(methodOn(Controller.class).methode(…)).withSelfRel()` / `.withRel("…")`.
- HAL: Links unter `_links`, Listenelemente unter `_embedded`.
- Im Test `$._links.<rel>.href` prüfen.
:::
