---
title: Exceptions – werfen, fangen, eigene bauen
minutes: 8
status: draft
---

Eine **Exception** meldet: „Hier geht es nicht weiter.“ Sie unterbricht die Methode und wandert so lange nach oben, bis sie jemand fängt. Fängt sie niemand, stürzt das Programm ab und du siehst einen Stacktrace.

## Werfen

```java
public void borrow(Book book) {
    if (book.isBorrowed()) {
        throw new IllegalStateException("already borrowed: " + book.getTitle());
    }
    book.setBorrowed(true);   // wird nicht mehr erreicht, wenn oben geworfen wurde
}
```

Zwei eingebaute Exceptions reichen für die meisten Fälle:

| Exception | Wann |
|---|---|
| `IllegalArgumentException` | Ein **Parameter** ist ungültig (`pages = -5`) |
| `IllegalStateException` | Der **Zustand** passt nicht (Buch schon verliehen) |

## Fangen

```java
try {
    library.borrow(book);
    System.out.println("Viel Spaß beim Lesen!");
} catch (IllegalStateException e) {
    System.out.println("Leider schon weg: " + e.getMessage());
}
```

Läuft der `try`-Block ohne Fehler, wird `catch` übersprungen. Fliegt eine passende Exception, springt Java sofort in den `catch`-Block.

## Checked und unchecked

| | unchecked | checked |
|---|---|---|
| erbt von | `RuntimeException` | `Exception` (aber nicht `RuntimeException`) |
| Beispiele | `IllegalArgumentException`, `NullPointerException` | `IOException`, `SQLException` |
| Compiler verlangt `try/catch` oder `throws`? | nein | **ja** |

In Spring-Projekten verwendest du fast nur **unchecked** Exceptions.

## Eigene Exception

Fachliche Fehler bekommen einen eigenen Namen. Das macht Tests und die Fehlerbehandlung im REST-Controller lesbar:

```java
public class BookNotFoundException extends RuntimeException {
    public BookNotFoundException(long id) {
        super("Book " + id + " not found");
    }
}
```

Im Service wirfst du sie, im Test prüfst du sie mit `assertThatThrownBy(…).isInstanceOf(BookNotFoundException.class)`, und in Aufgabe 3 macht ein `@ExceptionHandler` daraus einen `404 Not Found`.

:::merke
- `throw new …Exception("Nachricht")` bricht die Methode ab.
- `try { … } catch (Typ e) { … }` fängt sie.
- Unchecked = `extends RuntimeException`, kein `throws` nötig. Das ist der Normalfall.
- Eigene Exception: `class XyzException extends RuntimeException` mit `super(message)`.
:::
