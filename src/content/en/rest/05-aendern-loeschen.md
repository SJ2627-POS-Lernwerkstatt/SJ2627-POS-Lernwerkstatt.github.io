---
title: Replacing, changing, deleting
---

## `PUT`: replacing

```java
public record BookReplaceCmd(@NotBlank String title, @NotBlank String author,
                             @JsonProperty("published-year") int publishedYear) { }

@PutMapping("/{isbn}")
public BookDto replace(@PathVariable String isbn, @Valid @RequestBody BookReplaceCmd book) {
    return bookService.replace(isbn, book);
}
```

`PUT` sends the **whole** resource. Whatever is missing in the body is empty afterwards. The ISBN is already in the path, so it is missing in the command. The task often allows only part of it to be replaced ("only core attributes of the recipe can be replaced") – the `…ReplaceCmd` then has exactly these fields.

## `PATCH`: changing partially

```java
public record BookUpdateCmd(@NotBlank String title, @NotBlank String author) { }

@PatchMapping("/{isbn}")
public BookDto update(@PathVariable String isbn, @Valid @RequestBody BookUpdateCmd update) {
    return bookService.update(isbn, update);
}
```

`PATCH` only changes the fields that were sent. With a command of its own it is clear which ones they may be.

## `DELETE`: deleting

```java
@DeleteMapping("/{isbn}")
public ResponseEntity<Void> delete(@PathVariable String isbn) {
    bookService.delete(isbn);
    return ResponseEntity.noContent().build();
}
```

`204 No Content`: done, there is nothing to send back.

## What if the resource does not exist?

| Method | Resource missing | Usual |
|---|---|---|
| `GET` | | `404` |
| `PUT` | | `404` (or create it and `201`, if the task wants it that way) |
| `PATCH` | | `404` |
| `DELETE` | | `404` |

The service signals "does not exist" with an empty `Optional` or an exception like `BookNotFoundException`. If it throws, the `@RestControllerAdvice` turns it into `404` (unit 7).

## Idempotent?

**Idempotent** means: running it once or ten times has the same effect.

| Method | idempotent | |
|---|---|---|
| `GET` | yes | changes nothing |
| `PUT` | yes | replacing the same book ten times = replacing it once |
| `DELETE` | yes | deleted is deleted (the second call returns `404`, the state stays the same) |
| `POST` | no | creating ten times = ten books (or `409`) |
| `PATCH` | mostly | depends on the change |

:::merke
- `PUT` replaces completely, `PATCH` changes partially – each with a matching command (`…ReplaceCmd`, `…UpdateCmd`).
- `DELETE` → `204 No Content`.
- Resource missing → `404`, reported by the service via `Optional` or an exception.
:::
