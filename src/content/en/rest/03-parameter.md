---
title: "@PathVariable and @RequestParam"
---

Values get into the controller in two ways: as part of the **path** or as **query parameters** after the `?`.

## `@PathVariable`: which resource

```java
@GetMapping("/{isbn}")
public ResponseEntity<BookDto> findByIsbn(@PathVariable String isbn) { ... }

@GetMapping("/{isbn}/loans/{loanId}")
public LoanDto loan(@PathVariable String isbn, @PathVariable long loanId) { ... }
```

- `{isbn}` in the path and the parameter `isbn` must have the same name – or you write `@PathVariable("isbn") String id`.
- Spring converts the text into the type of the parameter. `GET /api/books/by-id/abc` on a `long` parameter returns `400 Bad Request` without your method being called.

## `@RequestParam`: filtering, searching, paging

```java
@GetMapping
public List<BookDto> findAll(@RequestParam(required = false) String author) {
    return bookService.findAll(author);
}
```

`GET /api/books?author=Bachmann` calls the method with `"Bachmann"`, `GET /api/books` with `null`.

| Variant | If the parameter is missing … |
|---|---|
| `@RequestParam String q` | `400 Bad Request` |
| `@RequestParam(required = false) String q` | `null` |
| `@RequestParam(defaultValue = "20") int size` | `20` |
| `@RequestParam Optional<String> q` | `Optional.empty()` |

## What goes where?

- **Path**: what a resource **is** – the id, the ISBN, the sub-resource.
- **Query**: **how** it is read – filter, search, sorting, page.

`/api/books/9783518365000` is a book. `/api/books?author=Bachmann` is a filtered list – not a resource of its own.

:::merke
- `@PathVariable` for ids in the path, the name matching `{…}`.
- `@RequestParam` for filters and options; `required = false` or `defaultValue` for optional ones.
- Wrong type or missing mandatory parameter → `400`, without your method running.
:::
