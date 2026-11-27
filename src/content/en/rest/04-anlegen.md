---
title: "Creating: @PostMapping and 201 Created"
---

## Reading JSON with `@RequestBody`

```java
public record BookCreateCmd(String isbn, String title, String author,
                            @JsonProperty("published-year") int publishedYear) { }

@PostMapping
public ResponseEntity<BookDto> create(@Valid @RequestBody BookCreateCmd book) {
    BookDto created = bookService.create(book);
    return ResponseEntity
            .created(linkTo(methodOn(BookController.class).findByIsbn(created.isbn())).toUri())
            .body(created);
}
```

- `@RequestBody` turns the JSON in the body into a `BookCreateCmd` (Jackson, unit 8). A `BookDto` goes back.
- We call incoming DTOs **commands** and append `Cmd`: `BookCreateCmd`, `BookReplaceCmd`, `BookUpdateCmd`. What the server sends back stays a `…Dto` (or `…View`).
- `@Valid` checks the Bean Validation annotations of the DTO (unit 6).
- The client has to send `Content-Type: application/json`, otherwise Spring answers with `415 Unsupported Media Type`.

## `201 Created` and the `Location` header

After creating, the response says **where** the new resource is:

```text
HTTP/1.1 201 Created
Location: http://localhost/api/books/9783518365000
Content-Type: application/json

{"isbn":"9783518365000","title":"Malina", ...}
```

`linkTo(methodOn(BookController.class).findByIsbn(isbn))` builds the URL from the **method** that returns this resource – not from a concatenated string. If the path of the class changes, the link is still right. The two static methods come from Spring HATEOAS, which is already included in the seed project:

```java
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;
```

:::achtung `methodOn` needs a method that does not return a record
`methodOn` calls the method on a proxy and for that also creates a proxy of its return type. Records are `final`, there is no proxy for them:

```text
AopConfigException: Could not generate CGLIB subclass of class restfulapi.service.LoanDto:
Common causes of this problem include using a final class or a non-visible class
```

Let methods that a link points to return a `ResponseEntity<…>` (or an `EntityModel<…>`).
:::

Without HATEOAS it works like this:

```java
URI location = ServletUriComponentsBuilder.fromCurrentRequest()
        .path("/{isbn}").buildAndExpand(created.isbn()).toUri();
```

## Commands of their own for creating

The object for creating usually has fewer fields than the one for reading – the id or reference is assigned by the server. The task then names interface objects of their own, for example `recipeCreate` and `recipeView`. In Java this becomes a command and a DTO:

```java
public record RecipeCreateCmd(String name, int servings, List<IngredientDto> ingredients) { }
public record RecipeViewDto(UUID reference, String name, int servings, List<IngredientDto> ingredients) { }

@PostMapping
public ResponseEntity<RecipeViewDto> create(@Valid @RequestBody RecipeCreateCmd recipe) { ... }
```

## If the resource already exists

If the client creates a book with an ISBN that already exists, the service throws a `BookAlreadyExistsException`. The controller (or a `@RestControllerAdvice`, unit 7) turns it into `409 Conflict`.

:::merke
- `@PostMapping` + `@Valid @RequestBody` with a command (`…Cmd`), a `…Dto` goes back.
- Respond with `201 Created` and a `Location` pointing to the new resource: `ResponseEntity.created(uri).body(...)`.
- Build the URL with `linkTo(methodOn(...))`, not with string concatenation.
- "Already exists" → `409 Conflict`.
:::
