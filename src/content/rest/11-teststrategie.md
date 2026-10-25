---
title: "Teststrategie: Good, Edge, Exception Cases"
minutes: 8
cheatsheet: 22
status: draft
---

Die Beurteilung von Aufgabe 3 steigt in drei Stufen: **Good Cases** für Befriedigend, zusätzlich **Edge Cases** für Gut, zusätzlich **Exception Cases** für Sehr gut. Plane deine Tests genau so.

## Pro Endpunkt drei Fragen

| | Frage | Beispiele für `GET /api/books/{isbn}` und `POST /api/books` |
|---|---|---|
| Good Case | Funktioniert der normale Fall? | Buch gefunden → `200` mit JSON; angelegt → `201` mit `Location` |
| Edge Case | Was ist am Rand? | leere Liste → `200` mit `[]`; Filter ohne Treffer; Buch ohne `addedOn`; ein Feld genau an der Grenze |
| Exception Case | Was, wenn es schiefgeht? | Buch fehlt → `404`; ungültige Eingabe → `400`; existiert schon → `409` |

Schreib dir eine Tabelle mit allen Endpunkten und diesen drei Spalten. Jede Zelle wird ein Test.

## Namen, die die Stufe zeigen

```java
@Test void verify_find_by_isbn() { ... }                 // good
@Test void verify_find_all_empty() { ... }               // edge
@Test void verify_find_by_isbn_not_found() { ... }       // exception
@Test void verify_create_invalid() { ... }               // exception
@Test void verify_delete_not_found() { ... }             // exception
```

Oder gruppiert mit `@Nested`:

```java
@Nested
class Create {
    @Test void good() { ... }
    @Test void invalid_isbn() { ... }
    @Test void already_exists() { ... }
}
```

## Was jeder Test prüfen sollte

1. **Status** – immer.
2. **Header**, wo die Angabe ihn verlangt (`Location` bei `201`).
3. **Body**: die wichtigsten Felder mit `jsonPath`, bei Listen auch die Länge.
4. **Service-Aufruf**: mit `verify`, dass die richtigen Werte ankamen – oder mit `verifyNoInteractions`, dass bei ungültigen Daten nichts aufgerufen wurde.

## Exception Cases brauchen zwei Seiten

Ein `404`-Test hat zwei Hälften:

```java
@Test
void verify_delete_not_found() throws Exception {
    doThrow(new BookNotFoundException("9783518000000")).when(bookService).delete("9783518000000");

    mockMvc.perform(delete("/api/books/9783518000000"))
            .andExpect(status().isNotFound())
            .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
            .andExpect(jsonPath("$.detail").value("no book with isbn 9783518000000"));
}
```

Der Mock **wirft** die Exception, wie es das echte Service täte. Der Test prüft, dass der Controller (bzw. der `@RestControllerAdvice`) daraus den richtigen Status und ein `ProblemDetail` macht.

:::pruefung
Ein Test pro Endpunkt reicht für Befriedigend. Für Sehr gut braucht jeder Endpunkt, der scheitern kann, auch einen Fehlertest. Zähle am Ende nach: Gibt es für jeden Statuscode, den deine API liefern kann, einen Test?
:::

:::merke
- Pro Endpunkt: Good, Edge, Exception Case.
- Status, Header, Body und Service-Aufruf prüfen.
- Für Fehler lässt der Mock die Exception werfen, der Test prüft Status und `ProblemDetail`.
:::
