---
title: "Anlegen: @PostMapping und 201 Created"
minutes: 9
cheatsheet: 21
status: draft
---

## JSON lesen mit `@RequestBody`

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

- `@RequestBody` wandelt das JSON im Body in ein `BookCreateCmd` um (Jackson, Einheit 8). Zurück geht ein `BookDto`.
- Eingehende DTOs nennen wir **Commands** und hängen `Cmd` an: `BookCreateCmd`, `BookReplaceCmd`, `BookUpdateCmd`. Was der Server zurückschickt, bleibt ein `…Dto` (oder `…View`).
- `@Valid` prüft die Bean-Validation-Annotationen des DTOs (Einheit 6).
- Der Client muss `Content-Type: application/json` schicken, sonst antwortet Spring mit `415 Unsupported Media Type`.

## `201 Created` und der `Location`-Header

Nach dem Anlegen sagt die Antwort, **wo** die neue Ressource liegt:

```text
HTTP/1.1 201 Created
Location: http://localhost/api/books/9783518365000
Content-Type: application/json

{"isbn":"9783518365000","title":"Malina", ...}
```

`linkTo(methodOn(BookController.class).findByIsbn(isbn))` baut die URL aus der **Methode**, die diese Ressource liefert – nicht aus einem zusammengesetzten String. Ändert sich der Pfad der Klasse, stimmt der Link trotzdem. Die beiden statischen Methoden kommen aus Spring HATEOAS, das im Seed-Projekt schon eingebunden ist:

```java
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;
```

:::achtung `methodOn` braucht eine Methode, die keinen Record zurückgibt
`methodOn` ruft die Methode auf einem Proxy auf und erzeugt dafür auch einen Proxy ihres Rückgabetyps. Records sind `final`, dafür gibt es keinen Proxy:

```text
AopConfigException: Could not generate CGLIB subclass of class restfulapi.service.LoanDto:
Common causes of this problem include using a final class or a non-visible class
```

Lass Methoden, auf die ein Link zeigt, eine `ResponseEntity<…>` (oder ein `EntityModel<…>`) zurückgeben.
:::

Ohne HATEOAS geht es so:

```java
URI location = ServletUriComponentsBuilder.fromCurrentRequest()
        .path("/{isbn}").buildAndExpand(created.isbn()).toUri();
```

## Eigene Commands zum Anlegen

Das Objekt zum Anlegen hat meist weniger Felder als das zum Lesen – die Id oder Referenz vergibt erst der Server. Die Angabe nennt dann eigene Schnittstellenobjekte, etwa `recipeCreate` und `recipeView`. In Java wird daraus ein Command und ein DTO:

```java
public record RecipeCreateCmd(String name, int servings, List<IngredientDto> ingredients) { }
public record RecipeViewDto(UUID reference, String name, int servings, List<IngredientDto> ingredients) { }

@PostMapping
public ResponseEntity<RecipeViewDto> create(@Valid @RequestBody RecipeCreateCmd recipe) { ... }
```

## Wenn es die Ressource schon gibt

Legt der Client ein Buch mit einer ISBN an, die es schon gibt, wirft der Service eine `BookAlreadyExistsException`. Der Controller (oder ein `@RestControllerAdvice`, Einheit 7) macht daraus `409 Conflict`.

:::merke
- `@PostMapping` + `@Valid @RequestBody` mit einem Command (`…Cmd`), zurück ein `…Dto`.
- Antwort `201 Created` mit `Location` auf die neue Ressource: `ResponseEntity.created(uri).body(...)`.
- URL mit `linkTo(methodOn(...))` bauen, nicht mit String-Verkettung.
- „Existiert schon“ → `409 Conflict`.
:::
