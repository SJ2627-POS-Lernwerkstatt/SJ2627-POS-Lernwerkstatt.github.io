---
title: "@WebMvcTest and @MockitoBean"
---

A controller test needs neither a database nor a real service. **`@WebMvcTest`** only starts the web layer: controllers, `@RestControllerAdvice`, Jackson, validation. A mock replaces the service.

## The structure

```java
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import tools.jackson.databind.ObjectMapper;

@WebMvcTest(BookController.class)
class BookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private BookService bookService;
}
```

- `@WebMvcTest(BookController.class)` loads exactly this controller (and all `@RestControllerAdvice`s).
- **`@MockitoBean`** puts a Mockito mock into the Spring context as a bean. The controller gets it via its constructor. The former `@MockBean` no longer exists in Spring Boot 4.
- `MockMvc` sends requests to the controller without starting a real server.
- `ObjectMapper` turns test DTOs into JSON.

:::achtung `@Mock` is not enough here
`@Mock` from the service layer creates a mock that Spring does not know. In a Spring test you need `@MockitoBean`, otherwise the context does not start: the controller needs a `BookService` bean.
:::

## Setting behaviour

As in the service layer, with Mockito:

```java
when(bookService.findByIsbn("9783518365000")).thenReturn(Optional.of(MALINA));
when(bookService.create(any(BookCreateCmd.class))).thenReturn(MALINA);
doThrow(new BookNotFoundException("1")).when(bookService).delete("1");
```

For `void` methods like `delete` it is `doThrow(…).when(mock).method(…)`.

## What is tested

| Part | In the `@WebMvcTest` |
|---|---|
| path and method | yes |
| parameters (`@PathVariable`, `@RequestParam`) | yes |
| reading and writing JSON | yes |
| `@Valid` | yes |
| `@RestControllerAdvice` | yes |
| service logic | no – the service is a mock |

:::merke
- `@WebMvcTest(Controller.class)` + `@MockitoBean` for the service.
- `MockMvc` and `ObjectMapper` with `@Autowired`.
- Mockito as usual: `when … thenReturn`, `doThrow … when`, `verify`.
:::
