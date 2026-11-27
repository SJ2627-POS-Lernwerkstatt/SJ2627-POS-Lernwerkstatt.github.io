---
title: "@JsonTest"
---

Does the JSON really match the task – `preparation-time` with a hyphen, the date as `"2024-03-01"`? A **`@JsonTest`** checks that for a DTO on its own, without a controller and without `MockMvc`.

```java
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;

@JsonTest
class BookDtoJsonTest {

    @Autowired
    private JacksonTester<BookDto> json;

    @Test
    void verify_serialize() throws Exception {
        BookDto book = new BookDto("9783518365000", "Malina", "Ingeborg Bachmann", 1971, LocalDate.of(2024, 3, 1));

        var content = json.write(book);

        assertThat(content).extractingJsonPathNumberValue("$.published-year").isEqualTo(1971);
        assertThat(content).extractingJsonPathStringValue("$.addedOn").isEqualTo("2024-03-01");
        assertThat(content).doesNotHaveJsonPath("$.publishedYear");
    }

    @Test
    void verify_deserialize() throws Exception {
        String text = """
                {"isbn":"9783518365000","title":"Malina","author":"Ingeborg Bachmann",
                 "published-year":1971,"addedOn":"2024-03-01"}""";

        assertThat(json.parseObject(text)).isEqualTo(
                new BookDto("9783518365000", "Malina", "Ingeborg Bachmann", 1971, LocalDate.of(2024, 3, 1)));
    }
}
```

- `@JsonTest` only starts Jackson – with the same configuration as the application.
- `JacksonTester<T>` writes (`write`) and reads (`parseObject`) JSON for a type.
- `extractingJsonPath…Value` and `doesNotHaveJsonPath` check the written JSON with AssertJ.

## Comparing against a file

```java
assertThat(json.write(book)).isEqualToJson("book.json");
```

`book.json` lives in the same package under `src/test/resources`. `isEqualToJson` ignores order and whitespace. That way the JSON from the task is in the test 1:1.

## When `@JsonTest`, when `MockMvc`?

| | `@JsonTest` | `@WebMvcTest` |
|---|---|---|
| checks | one DTO ↔ JSON | a whole endpoint |
| fast and precise for | field names, date format, enums, `null` | status, header, validation, errors |

One `@JsonTest` per interface object of the task shows the grader that the "data classes for the required JSON objects" are right.

:::merke
- `@JsonTest` + `JacksonTester<Dto>`: `write` and `parseObject`.
- Fields with `extractingJsonPath…Value`, whole objects with `isEqualToJson`.
- One test per JSON object of the task.
:::
