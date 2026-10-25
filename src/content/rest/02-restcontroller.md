---
title: "@RestController und ResponseEntity"
minutes: 9
cheatsheet: 20
status: draft
---

## Das Gerüst

```java
package restfulapi.presentation;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    public List<BookDto> findAll() {
        return bookService.findAll(null);
    }
}
```

- `@RestController` = `@Controller` + `@ResponseBody`: Was eine Methode zurückgibt, wird als JSON in den Body geschrieben.
- `@RequestMapping("/api/books")` an der Klasse ist der gemeinsame Pfad aller Endpunkte. Die Angabe nennt ihn („Alle Endpunkte unter `/api/recipes`“).
- `@GetMapping` ohne Pfad heißt: `GET /api/books`.
- Das Service kommt über den Konstruktor (wie in der Service-Schicht, Einheit 9).

## `ResponseEntity`: Status und Header selbst bestimmen

Gibt die Methode ein Objekt zurück, antwortet Spring mit `200 OK`. Brauchst du einen anderen Status oder Header, gib eine `ResponseEntity` zurück:

```java
@GetMapping("/{isbn}")
public ResponseEntity<BookDto> findByIsbn(@PathVariable String isbn) {
    return bookService.findByIsbn(isbn)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}
```

| Fabrikmethode | Status |
|---|---|
| `ResponseEntity.ok(body)` | `200` mit Body |
| `ResponseEntity.created(uri).body(body)` | `201` mit `Location` |
| `ResponseEntity.noContent().build()` | `204` ohne Body |
| `ResponseEntity.notFound().build()` | `404` ohne Body |
| `ResponseEntity.badRequest().build()` | `400` ohne Body |
| `ResponseEntity.status(HttpStatus.CONFLICT).body(...)` | beliebiger Status |

`Optional.map(ResponseEntity::ok).orElse(notFound)` ist das übliche Muster, wenn das Service ein `Optional` liefert.

:::achtung Das Service ist ein Stub
In der Prüfung gibt es kein echtes Service. Lege eine Klasse mit `@Service` an, deren Methoden leere Ergebnisse liefern. Mit `@Service` startet der Spring-Kontext, und der Test `contextLoads` aus dem Seed-Projekt läuft weiter. In den Controller-Tests ersetzt du das Service durch einen Mock (Einheit 9).
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
- `@RestController` + `@RequestMapping` an der Klasse, `@GetMapping` usw. an den Methoden.
- Rückgabe eines Objekts = `200` mit JSON. Für alles andere `ResponseEntity`.
- Das Service ist ein `@Service`-Stub mit leeren Ergebnissen.
:::
