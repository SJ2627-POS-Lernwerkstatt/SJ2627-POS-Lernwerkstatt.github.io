---
title: "Validation with @Valid"
---

"The attributes name, preparation-time … are mandatory." Rules like this are written as Bean Validation annotations in the **command** – the object that comes in –, just like for the entities in Task 1:

```java
public record BookCreateCmd(
        @NotBlank @Pattern(regexp = "\\d{13}") String isbn,
        @NotBlank String title,
        @NotBlank String author,
        @JsonProperty("published-year") @Min(1450) @Max(2100) int publishedYear) {
}
```

The `BookDto` that goes back needs no annotations: nobody checks what the server sends.

| Annotation | Checks |
|---|---|
| `@NotNull` | not `null` |
| `@NotBlank` | string not `null`, not empty, not only spaces |
| `@NotEmpty` | string or list not `null` and not empty |
| `@Size(min, max)` | length of a string or a list |
| `@Min`, `@Max`, `@Positive` | range of numbers |
| `@Pattern(regexp)` | string matches the regular expression |
| `@Valid` on a field | also checks the nested object or every element of a list |

## `@Valid` in the controller

```java
@PostMapping
public ResponseEntity<BookDto> create(@Valid @RequestBody BookCreateCmd book) { ... }
```

Without `@Valid` nobody checks the annotations. With `@Valid` Spring throws a `MethodArgumentNotValidException` on an error – **before** your method runs – and answers with `400 Bad Request`.

:::achtung Without a handler the body is empty
By default the `400` response has **no body**. The client does not find out which field was wrong. A handler from unit 7 turns it into a `ProblemDetail` with the fields:

```json
{"title":"Bad Request","status":400,
 "detail":"isbn must match \"\\d{13}\", title must not be blank","instance":"/api/books"}
```
:::

## Missing fields

| Missing in the JSON … | Field in the record | Result |
|---|---|---|
| `"title"` | `@NotBlank String title` | `null` → validation error `400` |
| `"published-year"` | `int publishedYear` | `400`, already when reading the JSON: Jackson 3 puts no `null` into an `int` |
| `"published-year"` | `@NotNull Integer publishedYear` | `null` → validation error `400` with the field name |
| a field that does not exist in the DTO | | is ignored |

For mandatory numbers `@NotNull Integer` is therefore better than `int`: the error message names the field.

## Nested objects

```java
public record RecipeCreateCmd(
        @NotBlank String name,
        @NotNull @Valid List<IngredientDto> ingredients) { }

public record IngredientDto(@NotBlank String name, @Positive int amount, @NotBlank String unit) { }
```

`@Valid` on the list checks every ingredient. Without it, an ingredient without a name is accepted.

:::merke
- Rules as annotations in the command, `@Valid` before `@RequestBody`.
- Error → `400`, your method does not run at all.
- Without a handler the body is empty – return the fields with a `ProblemDetail`.
- Do not forget `@Valid` on nested objects and lists.
:::
