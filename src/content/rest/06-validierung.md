---
title: "Validierung mit @Valid"
minutes: 8
cheatsheet: 21
status: draft
---

„Die Attribute name, preparation-time … sind verpflichtend.“ Solche Regeln stehen als Bean-Validation-Annotationen im **Command** – dem Objekt, das hereinkommt –, genau wie bei den Entities in Aufgabe 1:

```java
public record BookCreateCmd(
        @NotBlank @Pattern(regexp = "\\d{13}") String isbn,
        @NotBlank String title,
        @NotBlank String author,
        @JsonProperty("published-year") @Min(1450) @Max(2100) int publishedYear) {
}
```

Das `BookDto`, das zurückgeht, braucht keine Annotationen: Was der Server schickt, prüft niemand.

| Annotation | Prüft |
|---|---|
| `@NotNull` | nicht `null` |
| `@NotBlank` | String nicht `null`, nicht leer, nicht nur Leerzeichen |
| `@NotEmpty` | String oder Liste nicht `null` und nicht leer |
| `@Size(min, max)` | Länge eines Strings oder einer Liste |
| `@Min`, `@Max`, `@Positive` | Zahlenbereich |
| `@Pattern(regexp)` | String passt zum regulären Ausdruck |
| `@Valid` an einem Feld | prüft auch das verschachtelte Objekt bzw. jedes Element einer Liste |

## `@Valid` im Controller

```java
@PostMapping
public ResponseEntity<BookDto> create(@Valid @RequestBody BookCreateCmd book) { ... }
```

Ohne `@Valid` prüft niemand die Annotationen. Mit `@Valid` wirft Spring bei einem Fehler eine `MethodArgumentNotValidException` – **bevor** deine Methode läuft – und antwortet mit `400 Bad Request`.

:::achtung Ohne Handler ist der Body leer
Standardmäßig hat die `400`-Antwort **keinen Body**. Der Client erfährt nicht, welches Feld falsch war. Ein Handler aus Einheit 7 macht daraus ein `ProblemDetail` mit den Feldern:

```json
{"title":"Bad Request","status":400,
 "detail":"isbn must match \"\\d{13}\", title must not be blank","instance":"/api/books"}
```
:::

## Fehlende Felder

| Im JSON fehlt … | Feld im Record | Ergebnis |
|---|---|---|
| `"title"` | `@NotBlank String title` | `null` → Validierungsfehler `400` |
| `"published-year"` | `int publishedYear` | `400`, schon beim Lesen des JSON: Jackson 3 setzt kein `null` in ein `int` |
| `"published-year"` | `@NotNull Integer publishedYear` | `null` → Validierungsfehler `400` mit Feldname |
| ein Feld, das es im DTO nicht gibt | | wird ignoriert |

Für Pflichtzahlen ist `@NotNull Integer` deshalb besser als `int`: Die Fehlermeldung nennt das Feld.

## Verschachtelte Objekte

```java
public record RecipeCreateCmd(
        @NotBlank String name,
        @NotNull @Valid List<IngredientDto> ingredients) { }

public record IngredientDto(@NotBlank String name, @Positive int amount, @NotBlank String unit) { }
```

`@Valid` an der Liste prüft jede Zutat. Fehlt es, wird eine Zutat ohne Namen angenommen.

:::merke
- Regeln als Annotationen im Command, `@Valid` vor `@RequestBody`.
- Fehler → `400`, deine Methode läuft gar nicht.
- Ohne Handler ist der Body leer – gib mit einem `ProblemDetail` die Felder zurück.
- `@Valid` an verschachtelten Objekten und Listen nicht vergessen.
:::
