---
title: "Theory question: template method"
---

This is how the question could be asked:

> Explain the design pattern **template method** with a small class diagram. How do you implement it in Java, and what role do classes, abstract classes, interfaces and lambdas play in it?

Prerequisite: [Inheritance and abstract classes](/fundament/vererbung).

## Writing exercise

Take **5 minutes** and write your answer in key points. Only then read on.

## The knowledge behind it

**Idea:** a superclass defines the **flow** of an algorithm (the *template method*). It leaves individual **steps** open – the subclasses fill them in. The flow itself cannot be changed.

```plantuml
abstract class ReportExporter {
  + export(books : List<Book>) : String {final}
  # {abstract} header() : String
  # {abstract} line(book : Book) : String
  # footer() : String
}
class CsvExporter {
  # header() : String
  # line(book : Book) : String
}
class HtmlExporter {
  # header() : String
  # line(book : Book) : String
  # footer() : String
}
ReportExporter <|-- CsvExporter
ReportExporter <|-- HtmlExporter
```

```java
public abstract class ReportExporter {

    public final String export(List<Book> books) {     // template method: fixed flow
        var sb = new StringBuilder(header());
        for (Book b : books) {
            sb.append(line(b));
        }
        return sb.append(footer()).toString();
    }

    protected abstract String header();                // steps that subclasses MUST provide
    protected abstract String line(Book book);

    protected String footer() {                        // "hook": may be overridden
        return "";
    }
}

public class CsvExporter extends ReportExporter {
    @Override protected String header() { return "isbn;title\n"; }
    @Override protected String line(Book b) { return b.getIsbn() + ";" + b.getTitle() + "\n"; }
}
```

- `final` on the template method prevents subclasses from changing the flow.
- `abstract` methods = mandatory steps, normal `protected` methods with default behaviour = **hooks**.
- Principle: *"Don't call us, we'll call you"* (Hollywood principle) – the superclass calls the subclass, not the other way round.

**Variants in Java:**

- **Interface with a `default` method** as the template method and abstract methods as the steps (no fields possible).
- **Functional interfaces / lambdas** instead of subclasses: the steps are passed as `Function<Book, String>` → more like *strategy*, but fewer classes.
- **In Spring** you meet the pattern everywhere: `JdbcTemplate`, `RestTemplate` (fixed flow, you provide the callback), `ResponseEntityExceptionHandler` (Spring controls the error handling, you override individual `handle…` methods), JUnit (`@BeforeEach` → test → `@AfterEach`).

**Distinction from strategy:** template method uses **inheritance** (steps in subclasses), strategy uses **composition** (a replaceable object is passed in).

## Sample answer

> The design pattern **template method** is one of the behavioural patterns. An abstract superclass defines the fixed flow of an algorithm in one method – the template method – and calls individual steps in it. These steps are declared as abstract methods and implemented by the subclasses; optional steps ("hooks") have a default implementation that can be overridden. The template method itself is `final` so that the flow is not changed. That way common code is written only once, and subclasses only provide the differences.
>
> Example: an abstract `ReportExporter` has the method `export(List<Book>)`, which puts together a header, one line per book and a footer; `CsvExporter` and `HtmlExporter` only implement `header()` and `line(Book)`. In Java this is implemented with `abstract class`, `abstract` and `protected` methods and `@Override`. Alternatively an interface with a `default` method can serve as the template, or the steps are passed as functional interfaces (lambdas), which corresponds to the strategy pattern. In Spring you find the pattern e.g. in `JdbcTemplate` or in `ResponseEntityExceptionHandler`, whose `handle…` methods you override.

:::pruefung
Checklist – have you …
- explained the pattern in one sentence (fixed flow in the superclass, steps in subclasses)?
- drawn or described a **class model** (abstract class + 2 subclasses)?
- explained **`abstract`**, **`final`** and **hooks**?
- named the Java variants (abstract class, interface with `default`, lambdas/functional interfaces)?
- given an **example from Spring** or JUnit?
:::
