---
title: "Fehlerbehandlung mit ProblemDetail"
minutes: 10
cheatsheet: 22
status: draft
---

Der Service wirft Exceptions wie `BookNotFoundException`. Ohne Behandlung antwortet Spring mit `500` – das ist für die Beurteilung „Exceptions werden nicht korrekt behandelt“. Ein **`@RestControllerAdvice`** übersetzt jede Exception an einer Stelle in den passenden Statuscode.

## `ProblemDetail`

`ProblemDetail` ist das Standardformat für Fehler in HTTP-APIs (RFC 9457). Spring schreibt es mit dem Content-Type `application/problem+json`:

```json
{
  "title": "Not Found",
  "status": 404,
  "detail": "no book with isbn 9783518000000",
  "instance": "/api/books/9783518000000"
}
```

## Ein Handler für alle Controller

```java
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(BookNotFoundException.class)
    ProblemDetail notFound(BookNotFoundException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(BookAlreadyExistsException.class)
    ProblemDetail conflict(BookAlreadyExistsException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail unexpected(Exception e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "unexpected error");
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException e,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        String detail = e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + " " + error.getDefaultMessage())
                .sorted()
                .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detail));
    }
}
```

- `@ExceptionHandler(X.class)` – diese Methode behandelt `X` und alle Unterklassen. Gibt sie ein `ProblemDetail` zurück, übernimmt Spring dessen `status` als HTTP-Status.
- `@RestControllerAdvice` gilt für alle Controller. Ein `@ExceptionHandler` direkt im Controller gilt nur für diesen.
- **`extends ResponseEntityExceptionHandler`** beantwortet alle Fehler, die Spring selbst erkennt, mit dem richtigen Status und einem `ProblemDetail`: kaputtes JSON `400`, fehlender Parameter `400`, falsche Methode `405`, falscher Content-Type `415`, unbekannter Pfad `404`.
- Die Validierung ist einer davon. Für die Feldnamen im `detail` überschreibst du `handleMethodArgumentNotValid` (`@Override`, keine `@ExceptionHandler`-Annotation).

```json
{"title":"Bad Request","status":400,"detail":"isbn must match \"\\d{13}\", title must not be blank","instance":"/api/books"}
```

:::achtung Ein Handler für `Exception.class` ohne Basisklasse macht alles zu `500`
Ohne `extends ResponseEntityExceptionHandler` fängt `@ExceptionHandler(Exception.class)` auch die Fehler, die Spring sonst selbst richtig beantwortet:

| Anfrage | richtig | mit Catch-all ohne Basisklasse |
|---|---|---|
| `/api/books/by-id/abc` (Typ falsch) | `400` | `500` |
| Pflichtparameter fehlt | `400` | `500` |
| `PUT /api/books` | `405` | `500` |
| unbekannter Pfad | `404` | `500` |

Mit der Basisklasse gewinnt für diese Fehler ihr eigener, genauerer Handler – der Catch-all greift nur noch bei echten Überraschungen.
:::

## Eine Fehlerreferenz für das Log

„Wenn Fehler auftreten, soll der Fehler eine eindeutige Referenz bekommen. Diese Referenz wird in die HTTP-Response geschrieben und die Exception mit dieser Referenz in den Log-Output.“

```java
private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

private static ProblemDetail problem(HttpStatus status, RuntimeException e) {
    String reference = UUID.randomUUID().toString();
    log.warn("error {}: {}", reference, e.getMessage(), e);
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, e.getMessage());
    problem.setProperty("reference", reference);
    return problem;
}
```

```json
{"title":"Not Found","status":404,"detail":"no book with isbn 1","instance":"/api/books/1",
 "reference":"558f73bf-a68c-42be-8111-8095d2625d67"}
```

`setProperty` fügt eigene Felder hinzu. Die Exception als letztes Argument von `log.warn` schreibt den Stacktrace mit ins Log – der Support findet ihn über die Referenz.

## Ohne Basisklasse

Leitest du nicht von `ResponseEntityExceptionHandler` ab, antwortet Spring auf seine eigenen Fehler (kaputtes JSON, fehlender Parameter, `405`, `415`) mit dem richtigen Status, aber **ohne Body**. Für die Validierung schreibst du dann einen eigenen `@ExceptionHandler(MethodArgumentNotValidException.class)`.

:::achtung `spring.mvc.problemdetails.enabled` verdrängt deinen Handler
Die Einstellung `spring.mvc.problemdetails.enabled: true` registriert selbst einen `ResponseEntityExceptionHandler`, der **vor** deinem greift: Aus „isbn must match …, title must not be blank“ wird nur „Invalid request content.“. Leite stattdessen selbst ab, wie oben.
:::

:::achtung Der Catch-all ersetzt keine eigenen Handler
Ein Handler für `Exception.class` ist das letzte Netz mit `500`. Jede Exception des Service, die eine erwartbare Situation meldet („nicht gefunden“, „existiert schon“), braucht ihren eigenen Handler.
:::

:::merke
- `@RestControllerAdvice` + `extends ResponseEntityExceptionHandler`, `@ExceptionHandler` pro eigener Exception, Rückgabe `ProblemDetail`.
- Feldnamen bei Validierungsfehlern: `handleMethodArgumentNotValid` überschreiben.
- Nicht gefunden → `404`, existiert schon → `409`, ungültig → `400`.
- Referenz mit `UUID`, `setProperty("reference", …)` und ins Log schreiben.
:::
