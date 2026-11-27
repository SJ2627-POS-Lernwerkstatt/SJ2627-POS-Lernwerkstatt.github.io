---
title: "Pagination with Pageable"
---

A library has ten thousand books. `GET /api/books` should not return all of them at once, but **page by page**: `GET /api/books?page=1&size=20&sort=title`.

## `Pageable` in the controller

```java
@GetMapping
public PagedModel<BookDto> findAll(@PageableDefault(size = 20, sort = "title") Pageable pageable) {
    return new PagedModel<>(bookService.findPage(pageable));
}
```

- Spring reads `page`, `size` and `sort` from the query and builds a `Pageable` from them.
- `page` counts from **0**.
- `@PageableDefault` sets what applies without parameters. Without the annotation: page 0, 20 entries, unsorted.
- `sort=author,desc` sorts in descending order, several `sort` parameters are allowed.
- Spring ignores invalid values like `page=x` and takes the default.

The service returns a **`Page<BookDto>`**: the entries of the page and the total count. With Spring Data JPA it comes directly from the repository (`findAll(Pageable)`); in the stub you create it with `Page.empty(pageable)` or `new PageImpl<>(list, pageable, total)`.

## What to return?

Returning `Page` directly works, but Spring warns the first time:

```text
Serializing PageImpl instances as-is is not supported, meaning that there is no guarantee
about the stability of the resulting JSON structure!
```

The JSON of `PageImpl` contains many internal fields (`pageable`, `sort`, `first`, `last`, …) that can change with every version. Stable are:

**`org.springframework.data.web.PagedModel`** – compact, without links:

```json
{
  "content": [ { "isbn": "9783518365000", "title": "Malina" } ],
  "page": { "size": 2, "number": 1, "totalElements": 11, "totalPages": 6 }
}
```

**`org.springframework.hateoas.PagedModel`** – with links to the neighbouring pages (HATEOAS, unit 13):

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

The two classes have the same name – watch the package when importing.

## Testing

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

- `thenAnswer` builds the page from the `Pageable` that really arrived.
- `verify(…).findPage(PageRequest.of(1, 2))` proves that the query parameters were translated correctly. `PageRequest` has `equals`.

:::merke
- `Pageable` as a parameter, `@PageableDefault` for the defaults, `page` from 0.
- The service returns `Page<…>`; `new PagedModel<>(page)` (Spring Data) or `assembler.toModel(page)` (HATEOAS with links) goes back.
- In the test check the page settings with `verify(...).findPage(PageRequest.of(...))`.
:::
