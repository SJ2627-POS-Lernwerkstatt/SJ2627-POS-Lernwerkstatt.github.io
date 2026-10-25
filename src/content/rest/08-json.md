---
title: JSON und DTOs
minutes: 9
cheatsheet: 21
status: draft
---

Die Angabe zeigt die JSON-Objekte der Schnittstelle. Für jedes schreibst du einen **Record** – und sorgst dafür, dass Spring genau dieses JSON liest und schreibt. Spring Boot 4 verwendet dafür **Jackson 3**.

## Vom JSON zum Record

```json
{
    "isbn": "9783518365000",
    "title": "Malina",
    "author": "Ingeborg Bachmann",
    "published-year": 1971,
    "addedOn": "2024-03-01"
}
```

```java
public record BookDto(
        String isbn,
        String title,
        String author,
        @JsonProperty("published-year") int publishedYear,
        LocalDate addedOn) {
}
```

- Jede Komponente wird zu einem JSON-Feld mit **demselben Namen**.
- Heißt das Feld im JSON anders – mit Bindestrich, wie `preparation-time` –, setzt `@JsonProperty("…")` den Namen. Ein Java-Name mit Bindestrich ist ja nicht möglich.
- `LocalDate` wird als `"2024-03-01"` geschrieben und gelesen, `LocalDateTime` als `"2024-03-01T10:15:00"`.
- Ein Enum wird als Name geschrieben: `"MEETING"`.

:::achtung Jackson 3 hat neue Packages
Die Annotationen wie `@JsonProperty` liegen weiter in `com.fasterxml.jackson.annotation`. Der `ObjectMapper` liegt aber in **`tools.jackson.databind`**, nicht mehr in `com.fasterxml.jackson.databind`. Importierst du in einem Test den alten, kompiliert er nicht: `Package com.fasterxml.jackson.databind ist nicht vorhanden`.
:::

## Verschachtelte Objekte und Listen

```json
{
  "name": "Toast",
  "ingredients": [ { "name": "Bread slices", "amount": 2, "unit": "pieces" } ],
  "preparation-steps": [ { "step": 1, "description": "Toast the bread." } ]
}
```

```java
public record RecipeViewDto(
        String name,
        List<IngredientDto> ingredients,
        @JsonProperty("preparation-steps") List<PreparationStepDto> preparationSteps) { }

public record IngredientDto(String name, int amount, String unit) { }
public record PreparationStepDto(int step, String description) { }
```

Jedes verschachtelte Objekt bekommt einen eigenen Record. Listen werden zu `List<…>`.

## Ein DTO pro Zweck

| DTO | Wofür |
|---|---|
| `RecipeViewDto` | lesen: alles, inklusive `reference` |
| `RecipeCreateDto` | anlegen: ohne `reference` |
| `RecipeReplaceDto` | ersetzen: nur die Kernattribute |

Die Angabe nennt diese Schnittstellenobjekte oft ausdrücklich. Jedes bekommt seinen Record – auch wenn sich zwei nur in einem Feld unterscheiden.

## `null` und leere Listen

`"description": null` und ein fehlendes `"description"` werden beide zu `null`. Beim Schreiben erscheint ein `null`-Feld als `"description": null`. Eine Liste sollte nie `null` sein – gib `List.of()` zurück, dann steht im JSON `[]`.

:::merke
- Ein Record pro JSON-Objekt, Komponenten = Feldnamen.
- `@JsonProperty("mit-bindestrich")` für Namen, die in Java nicht gehen.
- `LocalDate` ↔ `"2024-03-01"`, Enums als Name.
- Jackson 3: `ObjectMapper` aus `tools.jackson.databind`.
:::
