---
title: Was macht Spring eigentlich für mich?
minutes: 9
status: draft
mindest: true
---

Ohne Spring baust du alle Objekte selbst und steckst sie zusammen:

```java
var repository = new InMemoryBookRepository();
var service = new BookService(repository);
var controller = new BookController(service);
```

Bei drei Klassen geht das noch. Eine echte Anwendung hat Hunderte. Spring übernimmt genau diese Arbeit.

## Beans: Objekte, die Spring verwaltet

Beim Start durchsucht Spring dein Projekt nach Klassen mit bestimmten Annotationen, baut von jeder **ein** Objekt und merkt es sich. Diese Objekte heißen **Beans**.

| Annotation | Rolle |
|---|---|
| `@Service` | Geschäftslogik |
| `@Repository` | Datenzugriff (Spring-Data-Interfaces werden automatisch zu Beans) |
| `@RestController` | nimmt HTTP-Anfragen an |
| `@Component` | alles andere |

## Dependency Injection: Spring reicht dir, was du brauchst

Braucht eine Bean eine andere, schreibst du sie einfach in den **Konstruktor**. Spring sieht den Parameter, sucht die passende Bean und übergibt sie – du schreibst nie `new BookService(…)`:

```java
@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor                 // Lombok: Konstruktor für alle final-Felder
public class BookController {
    private final BookService service;    // Spring „injiziert“ das Service

    @GetMapping("/{id}")
    public BookDto get(@PathVariable long id) {
        return service.find(id);
    }
}

@Service
@RequiredArgsConstructor
public class BookService {
    private final BookRepository repository;   // und hier das Repository
    // …
}
```

Das heißt **Dependency Injection** (DI): Eine Klasse baut ihre Abhängigkeiten nicht selbst, sie **bekommt** sie von außen.

## Warum ist das gut?

- **Austauschbar:** `BookController` kennt nur `BookService`. Im Test setzt `@MockitoBean` ein Fake-Service ein, und der Controller merkt nichts – siehe [Polymorphie](/fundament/override).
- **Weniger Verdrahtung:** Neue Klasse mit `@Service` → Spring baut sie und reicht sie weiter.
- **Eine Instanz:** Alle bekommen dasselbe Service-Objekt, niemand baut versehentlich ein zweites.

## Typischer Fehler

*Parameter 0 of constructor in BookController required a bean of type 'BookService' that could not be found.*

Spring soll ein `BookService` übergeben, hat aber keines gebaut. Meist fehlt `@Service` an der Klasse, oder sie liegt in einem Paket außerhalb der Anwendung.

:::pruefung
Dependency Injection ist ein typisches Thema für eine **Theoriefrage**. Mit dieser Einheit kannst du sie beantworten – siehe auch [Theoriefrage: Dependency Injection](/theorie/dependency-injection): Abhängigkeit, Konstruktor-Injection, Container (Spring) und Beans, Austauschbarkeit im Test.
:::

:::merke
- Bean = Objekt, das Spring baut und verwaltet (`@Service`, `@Repository`, `@RestController`, `@Component`).
- Abhängigkeiten als `private final`-Feld + Konstruktor (`@RequiredArgsConstructor`) – Spring übergibt sie.
- Nie selbst `new` für Beans schreiben.
- „required a bean … could not be found“ → Annotation an der Klasse fehlt.
:::
