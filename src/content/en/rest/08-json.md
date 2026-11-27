---
title: JSON and DTOs
---

The task shows the JSON objects of the interface. For each one you write a **record** – and make sure that Spring reads and writes exactly this JSON. Spring Boot 4 uses **Jackson 3** for that.

## From JSON to a record

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

- Every component becomes a JSON field with **the same name**.
- If the field is named differently in the JSON – with a hyphen, like `preparation-time` –, `@JsonProperty("…")` sets the name. A Java name with a hyphen is not possible, after all.
- `LocalDate` is written and read as `"2024-03-01"`, `LocalDateTime` as `"2024-03-01T10:15:00"`.
- An enum is written as its name: `"MEETING"`.

:::achtung Jackson 3 has new packages
Annotations like `@JsonProperty` are still in `com.fasterxml.jackson.annotation`. The `ObjectMapper`, however, is in **`tools.jackson.databind`**, no longer in `com.fasterxml.jackson.databind`. If you import the old one in a test, it does not compile: `package com.fasterxml.jackson.databind does not exist`.
:::

## Nested objects and lists

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

Every nested object gets a record of its own. Lists become `List<…>`.

## One record per purpose

| Record | Direction | For |
|---|---|---|
| `RecipeViewDto` | out | reading: everything, including `reference` |
| `RecipeCreateCmd` | in | creating: without `reference` |
| `RecipeReplaceCmd` | in | replacing: only the core attributes |

The task often names these interface objects explicitly. Each gets its record – even if two only differ in one field. What comes in is a **command** (`…Cmd`, with validation), what goes out a `…Dto`.

## `null` and empty lists

`"description": null` and a missing `"description"` both become `null`. When writing, a `null` field appears as `"description": null`. A list should never be `null` – return `List.of()`, then the JSON says `[]`.

:::merke
- One record per JSON object, components = field names.
- `@JsonProperty("with-hyphen")` for names that are not possible in Java.
- `LocalDate` ↔ `"2024-03-01"`, enums as names.
- Jackson 3: `ObjectMapper` from `tools.jackson.databind`.
:::
