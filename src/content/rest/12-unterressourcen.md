---
title: Unterressourcen
minutes: 8
cheatsheet: 21
status: draft
---

„Lesen der Liste der Zutaten eines Rezeptes, Hinzufügen, Ändern und Löschen einer Zutat eines Rezeptes.“ Zutaten gibt es nur **in** einem Rezept. Ihr Pfad hängt deshalb unter dem Rezept:

| Methode | Pfad | |
|---|---|---|
| `GET` | `/api/recipes/{reference}/ingredients` | alle Zutaten eines Rezepts |
| `POST` | `/api/recipes/{reference}/ingredients` | eine Zutat hinzufügen |
| `PUT` | `/api/recipes/{reference}/ingredients/{name}` | eine Zutat ersetzen |
| `DELETE` | `/api/recipes/{reference}/ingredients/{name}` | eine Zutat entfernen |

## Im Controller

Die Unterressource bleibt im Controller der Hauptressource – oder bekommt einen eigenen Controller mit dem längeren Pfad:

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

`loan` gibt eine `ResponseEntity` zurück, kein `LoanDto` – sonst scheitert `methodOn(...).loan(...)` (Einheit 4).

```java
@RestController
@RequestMapping("/api/books/{isbn}/loans")
public class LoanController {

    @GetMapping
    public List<LoanDto> findAll(@PathVariable String isbn) { ... }
}
```

## Zwei Arten von „nicht gefunden“

| Anfrage | Was fehlt | Antwort |
|---|---|---|
| `GET /api/books/1/loans` | das Buch | `404` |
| `GET /api/books/9783518365000/loans` | nichts, das Buch hat nur keine Ausleihen | `200` mit `[]` |
| `GET /api/books/9783518365000/loans/99` | die Ausleihe | `404` |

Eine leere Liste ist kein Fehler. Teste beide Fälle getrennt – das eine ist ein Edge Case, das andere ein Exception Case.

:::merke
- Unterressource = Pfad unter der Hauptressource: `/api/books/{isbn}/loans`.
- Hauptressource fehlt → `404`; keine Elemente → `200` mit `[]`.
- `Location` beim Anlegen zeigt auf die Unterressource.
:::
