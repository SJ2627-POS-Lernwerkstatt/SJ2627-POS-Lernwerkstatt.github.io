---
title: "@JsonTest"
minutes: 7
cheatsheet: 5
status: draft
---

Stimmt das JSON wirklich mit der Angabe überein – `preparation-time` mit Bindestrich, Datum als `"2024-03-01"`? Ein **`@JsonTest`** prüft das für ein DTO allein, ohne Controller und ohne `MockMvc`.

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

- `@JsonTest` startet nur Jackson – mit derselben Konfiguration wie die Anwendung.
- `JacksonTester<T>` schreibt (`write`) und liest (`parseObject`) JSON für einen Typ.
- `extractingJsonPath…Value` und `doesNotHaveJsonPath` prüfen das geschriebene JSON mit AssertJ.

## Gegen eine Datei vergleichen

```java
assertThat(json.write(book)).isEqualToJson("book.json");
```

`book.json` liegt im selben Package unter `src/test/resources`. `isEqualToJson` ignoriert Reihenfolge und Leerzeichen. So steht das JSON aus der Angabe 1:1 im Test.

## Wann `@JsonTest`, wann `MockMvc`?

| | `@JsonTest` | `@WebMvcTest` |
|---|---|---|
| prüft | ein DTO ↔ JSON | einen ganzen Endpunkt |
| schnell und genau für | Feldnamen, Datumsformat, Enums, `null` | Status, Header, Validierung, Fehler |

Ein `@JsonTest` pro Schnittstellenobjekt der Angabe zeigt der Beurteilung, dass die „Datenklassen für die geforderten JSON-Objekte“ stimmen.

:::merke
- `@JsonTest` + `JacksonTester<Dto>`: `write` und `parseObject`.
- Felder mit `extractingJsonPath…Value`, ganze Objekte mit `isEqualToJson`.
- Ein Test pro JSON-Objekt der Angabe.
:::
