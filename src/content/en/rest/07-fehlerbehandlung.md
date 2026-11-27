---
title: "Error handling with ProblemDetail"
---

The service throws exceptions like `BookNotFoundException`. Without handling, Spring answers with `500` – for the grading that is "exceptions are not handled correctly". A **`@RestControllerAdvice`** translates every exception into the matching status code in one place.

## `ProblemDetail`

`ProblemDetail` is the standard format for errors in HTTP APIs (RFC 9457). Spring writes it with the content type `application/problem+json`:

```json
{
  "title": "Not Found",
  "status": 404,
  "detail": "no book with isbn 9783518000000",
  "instance": "/api/books/9783518000000"
}
```

## One handler for all controllers

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

- `@ExceptionHandler(X.class)` – this method handles `X` and all its subclasses. If it returns a `ProblemDetail`, Spring takes its `status` as the HTTP status.
- `@RestControllerAdvice` applies to all controllers. An `@ExceptionHandler` directly in the controller only applies to that one.
- **`extends ResponseEntityExceptionHandler`** answers all errors that Spring recognises itself with the right status and a `ProblemDetail`: broken JSON `400`, missing parameter `400`, wrong method `405`, wrong content type `415`, unknown path `404`.
- Validation is one of them. For the field names in `detail` you override `handleMethodArgumentNotValid` (`@Override`, no `@ExceptionHandler` annotation).

```json
{"title":"Bad Request","status":400,"detail":"isbn must match \"\\d{13}\", title must not be blank","instance":"/api/books"}
```

:::achtung A handler for `Exception.class` without the base class turns everything into `500`
Without `extends ResponseEntityExceptionHandler`, `@ExceptionHandler(Exception.class)` also catches the errors that Spring would otherwise answer correctly itself:

| Request | right | with a catch-all without the base class |
|---|---|---|
| `/api/books/by-id/abc` (wrong type) | `400` | `500` |
| mandatory parameter missing | `400` | `500` |
| `PUT /api/books` | `405` | `500` |
| unknown path | `404` | `500` |

With the base class its own, more specific handler wins for these errors – the catch-all only applies to real surprises.
:::

## An error reference for the log

"When errors occur, the error is to get a unique reference. This reference is written into the HTTP response and the exception with this reference into the log output."

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

`setProperty` adds fields of your own. The exception as the last argument of `log.warn` writes the stack trace into the log as well – support finds it via the reference.

## Without the base class

If you do not extend `ResponseEntityExceptionHandler`, Spring answers its own errors (broken JSON, missing parameter, `405`, `415`) with the right status, but **without a body**. For validation you then write an `@ExceptionHandler(MethodArgumentNotValidException.class)` of your own.

:::achtung `spring.mvc.problemdetails.enabled` pushes your handler aside
The setting `spring.mvc.problemdetails.enabled: true` registers a `ResponseEntityExceptionHandler` of its own that applies **before** yours: "isbn must match …, title must not be blank" becomes just "Invalid request content.". Extend it yourself instead, as above.
:::

:::achtung The catch-all does not replace your own handlers
A handler for `Exception.class` is the last safety net with `500`. Every exception of the service that reports an expected situation ("not found", "already exists") needs a handler of its own.
:::

:::merke
- `@RestControllerAdvice` + `extends ResponseEntityExceptionHandler`, one `@ExceptionHandler` per exception of your own, returning `ProblemDetail`.
- Field names for validation errors: override `handleMethodArgumentNotValid`.
- Not found → `404`, already exists → `409`, invalid → `400`.
- Reference with `UUID`, `setProperty("reference", …)` and write it to the log.
:::
