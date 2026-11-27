---
title: "Theory question: write operations – POST, PUT, PATCH, DELETE"
---

This is how the question could be asked:

> Which HTTP methods are used to change data in a REST API? Compare them: what is each one meant for, how does the data get to the server, and what does the server answer in each case? What do you have to watch out for when implementing them?

## Writing exercise

Take **5 minutes** and write your answer in key points. Only then read on.

## The knowledge behind it

| | POST | PUT | PATCH | DELETE |
|---|---|---|---|---|
| purpose | **create new** (the server assigns the id) | **replace completely** | **change partially** | delete |
| path | collection: `/api/books` | single resource: `/api/books/42` | `/api/books/42` | `/api/books/42` |
| body | complete new object (without id) | **complete** object – missing fields count as empty | only the **changed** fields | none |
| success | `201 Created` + `Location: /api/books/43` + the new object | `200 OK` with the object or `204 No Content` | `200 OK` with the object | `204 No Content` |
| idempotent? | **no** – sending twice = two books | yes | not guaranteed (mostly yes) | yes |
| errors | `400` invalid, `409` already exists | `400`, `404` does not exist | `400`, `404` | `404` (or `204` if already gone) |

**Idempotent** means: sending the same request several times has the same effect as sending it once. Important when the client simply sends again after a timeout.

**Points to watch in the implementation (Spring):**

- Input as a **request DTO** (record), never the entity directly; validation with `@Valid` + Bean Validation → `400`.
- With POST do not accept the id from the client; set the `Location` header with `ServletUriComponentsBuilder` or `URI.create(…)`.
- PATCH: fields in the DTO may be `null` – `null` means "do not change". Only take over the fields that are set.
- Business errors (does not exist, already exists) as exceptions of their own in the service, mapped in the controller via `@ExceptionHandler`/`@RestControllerAdvice` to `404`/`409` with `ProblemDetail`.
- Think of simultaneous changes → see [optimistic locking](/theorie/optimistic-locking).

## Sample answer

> There are four HTTP methods for write operations in REST. **POST** creates a new resource in a collection (`POST /api/books`); the body contains the data without an id, the server assigns it and answers with `201 Created`, a `Location` header pointing to the new resource and usually the created object. POST is not idempotent. **PUT** replaces an existing resource completely (`PUT /api/books/42`); the body has to contain all fields, missing ones count as empty. Response `200` with the object or `204`; PUT is idempotent. **PATCH** changes a resource partially; the body only contains the fields to change, typically e.g. a status change. Response `200` with the changed object. **DELETE** deletes without a body and answers with `204 No Content`.
>
> In Spring Boot I implement this with `@PostMapping`, `@PutMapping`, `@PatchMapping` and `@DeleteMapping`, the values come as a record via `@RequestBody` and are checked with `@Valid` (otherwise `400 Bad Request`); the id is in the path as a `@PathVariable`. I return error cases via exceptions of my own and a `@RestControllerAdvice` as `404 Not Found` or `409 Conflict` with `ProblemDetail`. With PATCH a `null` field means "do not change". And if two users change at the same time, optimistic locking is needed (`@Version`, otherwise `409`).

:::pruefung
Checklist – have you …
- named all **four** methods and explained their purpose?
- made the difference **PUT (completely) vs. PATCH (partially)** clear?
- described how the data is **passed** (body complete / partial / none; id in the path)?
- named the **responses** (`201` + `Location`, `200`, `204`) and error codes (`400`, `404`, `409`)?
- mentioned **idempotence**?
- made the implementation in **Spring** concrete (mappings, `@RequestBody`, `@Valid`, DTOs, exception handler)?
:::
