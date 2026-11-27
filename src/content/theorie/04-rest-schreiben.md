---
title: "Theoriefrage: Schreiboperationen – POST, PUT, PATCH, DELETE"
minutes: 10
status: draft
---

So könnte die Fragestellung lauten:

> Über eine REST-API sollen Bücher neu angelegt, vollständig ersetzt, in einzelnen Feldern geändert und entfernt werden können. Welche HTTP-Methode setzt du für welchen Fall ein, und worin unterscheiden sie sich – beim Request-Body, bei der Antwort und beim Statuscode? Welche Stolperfallen gibt es bei der Umsetzung in Spring?

## Schreibübung

Nimm dir **5 Minuten** und schreib deine Antwort in Stichworten. Erst dann weiterlesen.

## Das Wissen dahinter

| | POST | PUT | PATCH | DELETE |
|---|---|---|---|---|
| Zweck | **neu anlegen** (Server vergibt die Id) | **ganz ersetzen** | **teilweise ändern** | löschen |
| Pfad | Sammlung: `/api/books` | einzelne Ressource: `/api/books/42` | `/api/books/42` | `/api/books/42` |
| Body | vollständiges neues Objekt (ohne Id) | **vollständiges** Objekt – fehlende Felder gelten als leer | nur die **geänderten** Felder | keiner |
| Erfolg | `201 Created` + `Location: /api/books/43` + neues Objekt | `200 OK` mit Objekt oder `204 No Content` | `200 OK` mit Objekt | `204 No Content` |
| idempotent? | **nein** – zweimal senden = zwei Bücher | ja | nicht garantiert (meist ja) | ja |
| Fehler | `400` ungültig, `409` existiert schon | `400`, `404` gibt es nicht | `400`, `404` | `404` (oder `204`, wenn schon weg) |

**Idempotent** heißt: Dieselbe Anfrage mehrmals zu senden hat dieselbe Wirkung wie einmal. Wichtig, wenn der Client nach einem Timeout einfach nochmal sendet.

**Besonderheiten in der Umsetzung (Spring):**

- Eingaben als **Request-DTO** (Record), nie das Entity direkt; Validierung mit `@Valid` + Bean Validation → `400`.
- Bei POST die Id nicht vom Client annehmen; `Location`-Header mit `ServletUriComponentsBuilder` bzw. `URI.create(…)` setzen.
- PATCH: Felder im DTO dürfen `null` sein – `null` heißt „nicht ändern“. Nur gesetzte Felder übernehmen.
- Fachliche Fehler (gibt es nicht, existiert schon) als eigene Exceptions im Service, im Controller per `@ExceptionHandler`/`@RestControllerAdvice` auf `404`/`409` mit `ProblemDetail` abbilden.
- Gleichzeitige Änderungen bedenken → siehe [Optimistic Locking](/theorie/optimistic-locking).

## Musterantwort

> Für Schreiboperationen gibt es in REST vier HTTP-Methoden. **POST** legt eine neue Ressource in einer Sammlung an (`POST /api/books`); der Body enthält die Daten ohne Id, der Server vergibt sie und antwortet mit `201 Created`, einem `Location`-Header auf die neue Ressource und meist dem angelegten Objekt. POST ist nicht idempotent. **PUT** ersetzt eine bestehende Ressource vollständig (`PUT /api/books/42`); der Body muss alle Felder enthalten, fehlende gelten als leer. Antwort `200` mit dem Objekt oder `204`; PUT ist idempotent. **PATCH** ändert eine Ressource teilweise; der Body enthält nur die zu ändernden Felder, typisch z. B. eine Statusänderung. Antwort `200` mit dem geänderten Objekt. **DELETE** löscht ohne Body und antwortet mit `204 No Content`.
>
> In Spring Boot setze ich das mit `@PostMapping`, `@PutMapping`, `@PatchMapping` und `@DeleteMapping` um, die Werte kommen als Record über `@RequestBody` und werden mit `@Valid` geprüft (sonst `400 Bad Request`); die Id steht als `@PathVariable` im Pfad. Fehlerfälle gebe ich über eigene Exceptions und einen `@RestControllerAdvice` als `404 Not Found` bzw. `409 Conflict` mit `ProblemDetail` zurück. Bei PATCH bedeutet ein `null`-Feld „nicht ändern“. Und wenn zwei Benutzer gleichzeitig ändern, braucht es Optimistic Locking (`@Version`, sonst `409`).

:::pruefung
Checkliste – hast du …
- alle **vier** Methoden genannt und ihren Zweck erklärt?
- den Unterschied **PUT (ganz) vs. PATCH (teilweise)** klar gemacht?
- die **Übergabe** beschrieben (Body vollständig / teilweise / keiner; Id im Pfad)?
- die **Responses** genannt (`201` + `Location`, `200`, `204`) und Fehlercodes (`400`, `404`, `409`)?
- **Idempotenz** erwähnt?
- die Umsetzung in **Spring** konkret gemacht (Mappings, `@RequestBody`, `@Valid`, DTOs, Exception-Handler)?
:::
