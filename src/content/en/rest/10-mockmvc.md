---
title: "MockMvc: requests and expectations"
---

## Sending a request

```java
mockMvc.perform(get("/api/books/9783518365000"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.title").value("Malina"))
        .andExpect(jsonPath("$.published-year").value(1971));
```

The static imports:

```java
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;
```

## Building requests

```java
get("/api/books").param("author", "Bachmann")

post("/api/books")
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(CREATE_MALINA))

patch("/api/books/{isbn}", "9783518365000")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
                {"title": "Malina (Neuauflage)", "author": "Ingeborg Bachmann"}""")

delete("/api/books/9783518365000")
```

`objectMapper.writeValueAsString(cmd)` creates the JSON from a record. For invalid or deliberately wrong JSON you write the text yourself.

## Expectations

| Expectation | Checks |
|---|---|
| `status().isOk()`, `isCreated()`, `isNoContent()`, `isNotFound()`, `isBadRequest()`, `isConflict()` | status code |
| `header().string("Location", endsWith("/api/books/9783518365000"))` | header |
| `content().contentType(MediaType.APPLICATION_PROBLEM_JSON)` | content type |
| `jsonPath("$.title").value("Malina")` | one field |
| `jsonPath("$", hasSize(2))` | length of a list |
| `jsonPath("$[0].isbn").value("…")` | field in the first element |
| `jsonPath("$.detail", containsString("isbn"))` | part of a text |
| `jsonPath("$.returnedOn").isEmpty()` | `null` or empty |
| `jsonPath("$.reference").isNotEmpty()` | present and not empty |

`$` is the whole JSON, `$.field` a field, `$[0]` the first element of a list. Field names with a hyphen work directly: `$.published-year`.

## Checking the mock

```java
private static final BookCreateCmd CREATE_MALINA =
        new BookCreateCmd("9783518365000", "Malina", "Ingeborg Bachmann", 1971);

@Test
void verify_create() throws Exception {
    when(bookService.create(any(BookCreateCmd.class))).thenReturn(MALINA);

    mockMvc.perform(post("/api/books")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(CREATE_MALINA)))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", endsWith("/api/books/9783518365000")))
            .andExpect(jsonPath("$.isbn").value("9783518365000"));
    verify(bookService).create(CREATE_MALINA);
}

@Test
void verify_create_invalid() throws Exception {
    BookCreateCmd invalid = new BookCreateCmd("12", "", "Ingeborg Bachmann", 1971);

    mockMvc.perform(post("/api/books")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalid)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.detail", containsString("isbn")));
    verifyNoInteractions(bookService);
}
```

- `verify(bookService).create(CREATE_MALINA)` proves that the JSON was correctly turned into a `BookCreateCmd` – records compare with `equals`.
- `verifyNoInteractions` proves that the service was not called at all for invalid data.

:::merke
- `perform(get/post/put/patch/delete(...))`, with a body `contentType` and `content`.
- `andExpect(status()…)`, `header()…`, `jsonPath(…)…`.
- Check with `verify`/`verifyNoInteractions` what arrived at the service.
:::
