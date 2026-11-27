---
title: "@RestController and ResponseEntity"
---

## The skeleton

```java
package restfulapi.presentation;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    @GetMapping
    public List<BookDto> findAll() {
        return bookService.findAll(null);
    }
}
```

- `@RestController` = `@Controller` + `@ResponseBody`: whatever a method returns is written into the body as JSON.
- `@RequestMapping("/api/books")` on the class is the common path of all endpoints. The task names it ("All endpoints under `/api/recipes`").
- `@GetMapping` without a path means: `GET /api/books`.
- The service comes via the constructor that `@RequiredArgsConstructor` generates (as in the service layer, unit 9).

## `ResponseEntity`: setting status and headers yourself

If the method returns an object, Spring answers with `200 OK`. If you need a different status or header, return a `ResponseEntity`:

```java
@GetMapping("/{isbn}")
public ResponseEntity<BookDto> findByIsbn(@PathVariable String isbn) {
    return bookService.findByIsbn(isbn)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}
```

| Factory method | Status |
|---|---|
| `ResponseEntity.ok(body)` | `200` with a body |
| `ResponseEntity.created(uri).body(body)` | `201` with `Location` |
| `ResponseEntity.noContent().build()` | `204` without a body |
| `ResponseEntity.notFound().build()` | `404` without a body |
| `ResponseEntity.badRequest().build()` | `400` without a body |
| `ResponseEntity.status(HttpStatus.CONFLICT).body(...)` | any status |

`Optional.map(ResponseEntity::ok).orElse(notFound)` is the usual pattern when the service returns an `Optional`.

:::achtung The service is a stub
In the exam there is no real service. Create a class with `@Service` whose methods return empty results. With `@Service` the Spring context starts, and the test `contextLoads` from the seed project keeps running. In the controller tests you replace the service with a mock (unit 9).
:::

```java
@Service
public class BookService {

    public List<BookDto> findAll(String author) {
        return List.of();
    }

    public Optional<BookDto> findByIsbn(String isbn) {
        return Optional.empty();
    }
}
```

:::merke
- `@RestController` + `@RequestMapping` on the class, `@GetMapping` etc. on the methods.
- Returning an object = `200` with JSON. For everything else `ResponseEntity`.
- The service is a `@Service` stub with empty results.
:::
