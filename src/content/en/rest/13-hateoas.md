---
title: HATEOAS with EntityModel
---

**HATEOAS** (*Hypermedia as the Engine of Application State*) means: a response contains **links** to what the client can do next. Whoever reads a book gets the link to its loans right along. Spring HATEOAS is already included in the seed project.

## `EntityModel`: a resource with links

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

The response in the **HAL** format (`application/hal+json`):

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

- `EntityModel.of(dto, links…)` wraps the DTO, the fields stay at the top level.
- `withSelfRel()` is the link to the resource itself, `withRel("name")` every other one.
- `linkTo(methodOn(…).method(…))` builds the URL from the controller method – so links stay right even after a path change.
- Optional `@RequestParam`s appear as a template: `{?author}` with `"templated": true`.
- The method in `methodOn(...)` has to return something that is not a record – `ResponseEntity`, `EntityModel`, `CollectionModel` (unit 4).

## `CollectionModel`: a list with links

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

The elements are under `_embedded`, the name comes from the type: `BookDto` → `bookDtoList`. With `@Relation(collectionRelation = "books")` on the record the list is called `books`.

## The `Location` header from a link

Even without `EntityModel`, `linkTo` helps with `201 Created` (unit 4):

```java
return ResponseEntity
        .created(linkTo(methodOn(BookController.class).findByIsbn(created.isbn())).toUri())
        .body(created);
```

## Testing

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

In `MockMvc` the host is always `http://localhost`.

:::merke
- `EntityModel.of(dto, links)` for a resource, `CollectionModel.of(list, links)` for a list.
- Links with `linkTo(methodOn(Controller.class).method(…)).withSelfRel()` / `.withRel("…")`.
- HAL: links under `_links`, list elements under `_embedded`.
- In the test check `$._links.<rel>.href`.
:::
