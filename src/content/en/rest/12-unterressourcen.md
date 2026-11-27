---
title: Sub-resources
---

"Reading the list of ingredients of a recipe, adding, changing and deleting an ingredient of a recipe." Ingredients only exist **in** a recipe. That is why their path hangs below the recipe:

| Method | Path | |
|---|---|---|
| `GET` | `/api/recipes/{reference}/ingredients` | all ingredients of a recipe |
| `POST` | `/api/recipes/{reference}/ingredients` | add an ingredient |
| `PUT` | `/api/recipes/{reference}/ingredients/{name}` | replace an ingredient |
| `DELETE` | `/api/recipes/{reference}/ingredients/{name}` | remove an ingredient |

## In the controller

The sub-resource stays in the controller of the main resource – or gets a controller of its own with the longer path:

```java
@GetMapping("/{isbn}/loans")
public List<LoanDto> loans(@PathVariable String isbn) {
    return bookService.loansOf(isbn);
}

@PostMapping("/{isbn}/loans")
public ResponseEntity<LoanDto> borrow(@PathVariable String isbn, @Valid @RequestBody LoanCreateCmd loan) {
    LoanDto created = bookService.borrow(isbn, loan);
    return ResponseEntity
            .created(linkTo(methodOn(BookController.class).loan(isbn, created.id())).toUri())
            .body(created);
}

@GetMapping("/{isbn}/loans/{loanId}")
public ResponseEntity<LoanDto> loan(@PathVariable String isbn, @PathVariable long loanId) {
    return ResponseEntity.ok(bookService.loan(isbn, loanId));
}
```

`loan` returns a `ResponseEntity`, not a `LoanDto` – otherwise `methodOn(...).loan(...)` fails (unit 4).

```java
@RestController
@RequestMapping("/api/books/{isbn}/loans")
public class LoanController {

    @GetMapping
    public List<LoanDto> findAll(@PathVariable String isbn) { ... }
}
```

## Two kinds of "not found"

| Request | What is missing | Response |
|---|---|---|
| `GET /api/books/1/loans` | the book | `404` |
| `GET /api/books/9783518365000/loans` | nothing, the book just has no loans | `200` with `[]` |
| `GET /api/books/9783518365000/loans/99` | the loan | `404` |

An empty list is not an error. Test both cases separately – one is an edge case, the other an exception case.

:::merke
- Sub-resource = a path below the main resource: `/api/books/{isbn}/loans`.
- Main resource missing → `404`; no elements → `200` with `[]`.
- `Location` when creating points to the sub-resource.
:::
