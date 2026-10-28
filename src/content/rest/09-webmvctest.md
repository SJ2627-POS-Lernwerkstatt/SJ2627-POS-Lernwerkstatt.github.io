---
title: "@WebMvcTest und @MockitoBean"
minutes: 8
cheatsheet: 22
status: draft
---

Ein Controller-Test braucht weder Datenbank noch einen echten Service. **`@WebMvcTest`** startet nur die Web-Schicht: Controller, `@RestControllerAdvice`, Jackson, Validierung. Den Service ersetzt ein Mock.

## Der Aufbau

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

- `@WebMvcTest(BookController.class)` lädt genau diesen Controller (und alle `@RestControllerAdvice`s).
- **`@MockitoBean`** legt einen Mockito-Mock als Bean in den Spring-Kontext. Der Controller bekommt ihn über seinen Konstruktor. Das frühere `@MockBean` gibt es in Spring Boot 4 nicht mehr.
- `MockMvc` schickt Anfragen an den Controller, ohne einen echten Server zu starten.
- `ObjectMapper` wandelt Test-DTOs in JSON um.

:::achtung `@Mock` reicht hier nicht
`@Mock` aus der Service-Schicht erzeugt einen Mock, den Spring nicht kennt. In einem Spring-Test brauchst du `@MockitoBean`, sonst startet der Kontext nicht: Der Controller braucht eine `BookService`-Bean.
:::

## Verhalten festlegen

Wie in der Service-Schicht mit Mockito:

```java
when(bookService.findByIsbn("9783518365000")).thenReturn(Optional.of(MALINA));
when(bookService.create(any(BookCreateCmd.class))).thenReturn(MALINA);
doThrow(new BookNotFoundException("1")).when(bookService).delete("1");
```

Für `void`-Methoden wie `delete` heißt es `doThrow(…).when(mock).methode(…)`.

## Was getestet wird

| Teil | Im `@WebMvcTest` |
|---|---|
| Pfad und Methode | ja |
| Parameter (`@PathVariable`, `@RequestParam`) | ja |
| JSON lesen und schreiben | ja |
| `@Valid` | ja |
| `@RestControllerAdvice` | ja |
| Service-Logik | nein – der Service ist ein Mock |

:::merke
- `@WebMvcTest(Controller.class)` + `@MockitoBean` für den Service.
- `MockMvc` und `ObjectMapper` mit `@Autowired`.
- Mockito wie gewohnt: `when … thenReturn`, `doThrow … when`, `verify`.
:::
