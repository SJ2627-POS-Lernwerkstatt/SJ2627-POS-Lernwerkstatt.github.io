---
title: "Pagination mit Pageable"
minutes: 10
cheatsheet: 20
status: draft
---

Eine Bücherei hat zehntausend Bücher. `GET /api/books` soll sie nicht alle auf einmal liefern, sondern **seitenweise**: `GET /api/books?page=1&size=20&sort=title`.

## `Pageable` im Controller

```java
@GetMapping
public PagedModel<BookDto> findAll(@PageableDefault(size = 20, sort = "title") Pageable pageable) {
    return new PagedModel<>(bookService.findPage(pageable));
}
```

- Spring liest `page`, `size` und `sort` aus der Query und baut daraus ein `Pageable`.
- `page` zählt ab **0**.
- `@PageableDefault` legt fest, was ohne Parameter gilt. Ohne die Annotation: Seite 0, 20 Einträge, unsortiert.
- `sort=author,desc` sortiert absteigend, mehrere `sort`-Parameter sind erlaubt.
- Ungültige Werte wie `page=x` ignoriert Spring und nimmt den Default.

Das Service liefert eine **`Page<BookDto>`**: die Einträge der Seite und die Gesamtzahl. Mit Spring Data JPA kommt sie direkt aus dem Repository (`findAll(Pageable)`); im Stub erzeugst du sie mit `Page.empty(pageable)` oder `new PageImpl<>(liste, pageable, gesamt)`.

## Was zurückgeben?

`Page` direkt zurückzugeben funktioniert, aber Spring warnt beim ersten Mal:

```text
Serializing PageImpl instances as-is is not supported, meaning that there is no guarantee
about the stability of the resulting JSON structure!
```

Das JSON von `PageImpl` enthält viele interne Felder (`pageable`, `sort`, `first`, `last`, …), die sich mit jeder Version ändern können. Stabil sind:

**`org.springframework.data.web.PagedModel`** – kompakt, ohne Links:

```json
{
  "content": [ { "isbn": "9783518365000", "title": "Malina" } ],
  "page": { "size": 2, "number": 1, "totalElements": 11, "totalPages": 6 }
}
```

**`org.springframework.hateoas.PagedModel`** – mit Links auf die Nachbarseiten (HATEOAS, Einheit 13):

```java
@GetMapping
public PagedModel<EntityModel<BookDto>> findAll(@PageableDefault(size = 20) Pageable pageable,
                                                PagedResourcesAssembler<BookDto> assembler) {
    return assembler.toModel(bookService.findPage(pageable));
}
```

```json
{
  "_embedded": { "bookDtoList": [ { "isbn": "9783518365000", "title": "Malina" } ] },
  "_links": {
    "first": { "href": "http://localhost/api/books?page=0&size=2" },
    "prev":  { "href": "http://localhost/api/books?page=0&size=2" },
    "self":  { "href": "http://localhost/api/books?page=1&size=2" },
    "next":  { "href": "http://localhost/api/books?page=2&size=2" },
    "last":  { "href": "http://localhost/api/books?page=5&size=2" }
  },
  "page": { "size": 2, "totalElements": 11, "totalPages": 6, "number": 1 }
}
```

Die beiden Klassen heißen gleich – achte auf das Package beim Import.

## Testen

```java
@Test
void verify_page_request_is_passed_on() throws Exception {
    when(bookService.findPage(any(Pageable.class)))
            .thenAnswer(call -> new PageImpl<>(List.of(MALINA), call.getArgument(0), 11));

    mockMvc.perform(get("/api/books").param("page", "1").param("size", "2"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content", hasSize(1)))
            .andExpect(jsonPath("$.page.number").value(1))
            .andExpect(jsonPath("$.page.totalPages").value(6));
    verify(bookService).findPage(PageRequest.of(1, 2));
}

@Test
void verify_page_defaults() throws Exception {
    when(bookService.findPage(any(Pageable.class)))
            .thenAnswer(call -> new PageImpl<>(List.of(), call.getArgument(0), 0));

    mockMvc.perform(get("/api/books"));
    verify(bookService).findPage(PageRequest.of(0, 20, Sort.by("title")));
}
```

- `thenAnswer` baut die Seite aus dem `Pageable`, das wirklich ankam.
- `verify(…).findPage(PageRequest.of(1, 2))` beweist, dass die Query-Parameter richtig übersetzt wurden. `PageRequest` hat `equals`.

:::merke
- `Pageable` als Parameter, `@PageableDefault` für die Defaults, `page` ab 0.
- Service liefert `Page<…>`; zurück geht `new PagedModel<>(page)` (Spring Data) oder `assembler.toModel(page)` (HATEOAS mit Links).
- Im Test die Seitenangaben mit `verify(...).findPage(PageRequest.of(...))` prüfen.
:::
