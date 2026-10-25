---
title: "MockMvc: Anfragen und Erwartungen"
minutes: 10
cheatsheet: 22
status: draft
---

## Eine Anfrage schicken

```java
mockMvc.perform(get("/api/books/9783518365000"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.title").value("Malina"))
        .andExpect(jsonPath("$.published-year").value(1971));
```

Die statischen Imports:

```java
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;
```

## Anfragen bauen

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

`objectMapper.writeValueAsString(cmd)` erzeugt das JSON aus einem Record. Für ungültiges oder absichtlich falsches JSON schreibst du den Text selbst.

## Erwartungen

| Erwartung | Prüft |
|---|---|
| `status().isOk()`, `isCreated()`, `isNoContent()`, `isNotFound()`, `isBadRequest()`, `isConflict()` | Statuscode |
| `header().string("Location", endsWith("/api/books/9783518365000"))` | Header |
| `content().contentType(MediaType.APPLICATION_PROBLEM_JSON)` | Content-Type |
| `jsonPath("$.title").value("Malina")` | ein Feld |
| `jsonPath("$", hasSize(2))` | Länge einer Liste |
| `jsonPath("$[0].isbn").value("…")` | Feld im ersten Element |
| `jsonPath("$.detail", containsString("isbn"))` | Teil eines Texts |
| `jsonPath("$.returnedOn").isEmpty()` | `null` oder leer |
| `jsonPath("$.reference").isNotEmpty()` | vorhanden und nicht leer |

`$` ist das ganze JSON, `$.feld` ein Feld, `$[0]` das erste Element einer Liste. Feldnamen mit Bindestrich gehen direkt: `$.published-year`.

## Den Mock prüfen

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

- `verify(bookService).create(CREATE_MALINA)` beweist, dass das JSON richtig in ein `BookCreateCmd` umgewandelt wurde – Records vergleichen mit `equals`.
- `verifyNoInteractions` beweist, dass bei ungültigen Daten das Service gar nicht aufgerufen wurde.

:::merke
- `perform(get/post/put/patch/delete(...))`, beim Body `contentType` und `content`.
- `andExpect(status()…)`, `header()…`, `jsonPath(…)…`.
- Mit `verify`/`verifyNoInteractions` prüfen, was beim Service ankam.
:::
