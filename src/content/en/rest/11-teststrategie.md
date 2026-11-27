---
title: "Test strategy: good, edge, exception cases"
---

The grading of Task 3 rises in three steps: **good cases** for Befriedigend, additionally **edge cases** for Gut, additionally **exception cases** for Sehr gut. Plan your tests exactly like that.

## Three questions per endpoint

| | Question | Examples for `GET /api/books/{isbn}` and `POST /api/books` |
|---|---|---|
| good case | does the normal case work? | book found → `200` with JSON; created → `201` with `Location` |
| edge case | what happens at the edge? | empty list → `200` with `[]`; filter without hits; book without `addedOn`; a field exactly at the limit |
| exception case | what if it goes wrong? | book missing → `404`; invalid input → `400`; already exists → `409` |

Write yourself a table with all endpoints and these three columns. Every cell becomes a test.

## Names that show the level

```java
@Test void verify_find_by_isbn() { ... }                 // good
@Test void verify_find_all_empty() { ... }               // edge
@Test void verify_find_by_isbn_not_found() { ... }       // exception
@Test void verify_create_invalid() { ... }               // exception
@Test void verify_delete_not_found() { ... }             // exception
```

Or grouped with `@Nested`:

```java
@Nested
class Create {
    @Test void good() { ... }
    @Test void invalid_isbn() { ... }
    @Test void already_exists() { ... }
}
```

## What every test should check

1. **Status** – always.
2. **Header**, where the task demands it (`Location` with `201`).
3. **Body**: the most important fields with `jsonPath`, for lists also the length.
4. **Service call**: with `verify` that the right values arrived – or with `verifyNoInteractions` that nothing was called for invalid data.

## Exception cases need two sides

A `404` test has two halves:

```java
@Test
void verify_delete_not_found() throws Exception {
    doThrow(new BookNotFoundException("9783518000000")).when(bookService).delete("9783518000000");

    mockMvc.perform(delete("/api/books/9783518000000"))
            .andExpect(status().isNotFound())
            .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
            .andExpect(jsonPath("$.detail").value("no book with isbn 9783518000000"));
}
```

The mock **throws** the exception, as the real service would. The test checks that the controller (or the `@RestControllerAdvice`) turns it into the right status and a `ProblemDetail`.

:::pruefung
One test per endpoint is enough for Befriedigend. For Sehr gut every endpoint that can fail also needs an error test. Count at the end: is there a test for every status code your API can return?
:::

:::merke
- Per endpoint: good, edge, exception case.
- Check status, header, body and service call.
- For errors the mock throws the exception, the test checks status and `ProblemDetail`.
:::
