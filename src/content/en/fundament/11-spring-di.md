---
title: What does Spring actually do for me?
---

Without Spring you build all objects yourself and plug them together:

```java
var repository = new InMemoryBookRepository();
var service = new BookService(repository);
var controller = new BookController(service);
```

With three classes that still works. A real application has hundreds. Spring takes over exactly this work.

## Beans: objects that Spring manages

At startup Spring searches your project for classes with certain annotations, builds **one** object of each and remembers it. These objects are called **beans**.

| Annotation | Role |
|---|---|
| `@Service` | business logic |
| `@Repository` | data access (Spring Data interfaces become beans automatically) |
| `@RestController` | accepts HTTP requests |
| `@Component` | everything else |

## Dependency injection: Spring hands you what you need

If a bean needs another one, you simply write it into the **constructor**. Spring sees the parameter, looks for the matching bean and passes it in – you never write `new BookService(…)`:

```java
@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor                 // Lombok: constructor for all final fields
public class BookController {
    private final BookService service;    // Spring "injects" the service

    @GetMapping("/{id}")
    public BookDto get(@PathVariable long id) {
        return service.find(id);
    }
}

@Service
@RequiredArgsConstructor
public class BookService {
    private final BookRepository repository;   // and the repository here
    // …
}
```

This is called **dependency injection** (DI): a class does not build its dependencies itself, it **gets** them from outside.

## Why is that good?

- **Replaceable:** `BookController` only knows `BookService`. In the test, `@MockitoBean` puts in a fake service and the controller notices nothing – see [polymorphism](/fundament/override).
- **Less wiring:** a new class with `@Service` → Spring builds it and passes it on.
- **One instance:** everyone gets the same service object, nobody builds a second one by accident.

## Typical error

*Parameter 0 of constructor in BookController required a bean of type 'BookService' that could not be found.*

Spring is supposed to pass in a `BookService` but has not built one. Usually `@Service` is missing on the class, or it lives in a package outside the application.

:::pruefung
Dependency injection is a typical topic for a **theory question**. With this unit you can answer it – see also [Theory question: dependency injection](/theorie/dependency-injection): dependency, constructor injection, container (Spring) and beans, replaceability in tests.
:::

:::merke
- Bean = an object that Spring builds and manages (`@Service`, `@Repository`, `@RestController`, `@Component`).
- Dependencies as a `private final` field + constructor (`@RequiredArgsConstructor`) – Spring passes them in.
- Never write `new` for beans yourself.
- "required a bean … could not be found" → the annotation on the class is missing.
:::
