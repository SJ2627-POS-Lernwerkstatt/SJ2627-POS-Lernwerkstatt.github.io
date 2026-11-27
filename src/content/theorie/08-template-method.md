---
title: "Theoriefrage: Template Method"
minutes: 9
status: draft
---

So könnte die Fragestellung lauten:

> Mehrere Klassen arbeiten einen Ablauf in derselben Reihenfolge ab, unterscheiden sich aber in einzelnen Schritten. Zeig, wie das Entwurfsmuster **Template Method** diese Situation löst, und skizziere die beteiligten Klassen in einem Diagramm. Wie setzt du das in Java um – und wann greifst du zu einer abstrakten Klasse, wann zu einem Interface oder einem Lambda?

Voraussetzung: [Vererbung und abstrakte Klassen](/fundament/vererbung).

## Schreibübung

Nimm dir **5 Minuten** und schreib deine Antwort in Stichworten. Erst dann weiterlesen.

## Das Wissen dahinter

**Idee:** Eine Oberklasse legt den **Ablauf** eines Algorithmus fest (die *Template Method*). Einzelne **Schritte** lässt sie offen – die füllen die Unterklassen aus. Der Ablauf selbst kann nicht verändert werden.

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

    public final String export(List<Book> books) {     // Template Method: fester Ablauf
        var sb = new StringBuilder(header());
        for (Book b : books) {
            sb.append(line(b));
        }
        return sb.append(footer()).toString();
    }

    protected abstract String header();                // Schritte, die Unterklassen liefern MÜSSEN
    protected abstract String line(Book book);

    protected String footer() {                        // „Hook“: optional überschreibbar
        return "";
    }
}

public class CsvExporter extends ReportExporter {
    @Override protected String header() { return "isbn;title\n"; }
    @Override protected String line(Book b) { return b.getIsbn() + ";" + b.getTitle() + "\n"; }
}
```

- `final` an der Template Method verhindert, dass Unterklassen den Ablauf ändern.
- `abstract`-Methoden = Pflichtschritte, normale `protected`-Methoden mit Standardverhalten = **Hooks**.
- Prinzip: *„Don't call us, we'll call you“* (Hollywood-Prinzip) – die Oberklasse ruft die Unterklasse auf, nicht umgekehrt.

**Varianten in Java:**

- **Interface mit `default`-Methode** als Template Method und abstrakten Methoden als Schritte (keine Felder möglich).
- **Functional Interfaces / Lambdas** statt Unterklassen: Die Schritte werden als `Function<Book, String>` übergeben → eher *Strategy*, aber weniger Klassen.
- **In Spring** begegnet dir das Muster überall: `JdbcTemplate`, `RestTemplate` (Ablauf fix, du lieferst den Callback), `ResponseEntityExceptionHandler` (Spring steuert die Fehlerbehandlung, du überschreibst einzelne `handle…`-Methoden), JUnit (`@BeforeEach` → Test → `@AfterEach`).

**Abgrenzung zu Strategy:** Template Method nutzt **Vererbung** (Schritte in Unterklassen), Strategy nutzt **Komposition** (ein austauschbares Objekt wird übergeben).

## Musterantwort

> Das Design Pattern **Template Method** gehört zu den Verhaltensmustern. Eine abstrakte Oberklasse definiert in einer Methode – der Template Method – den festen Ablauf eines Algorithmus und ruft darin einzelne Schritte auf. Diese Schritte sind als abstrakte Methoden deklariert und werden von den Unterklassen implementiert; optionale Schritte („Hooks“) haben eine Standardimplementierung, die überschrieben werden kann. Die Template Method selbst ist `final`, damit der Ablauf nicht verändert wird. So wird gemeinsamer Code nur einmal geschrieben, und Unterklassen liefern nur die Unterschiede.
>
> Beispiel: Ein abstrakter `ReportExporter` hat die Methode `export(List<Book>)`, die Kopfzeile, eine Zeile pro Buch und eine Fußzeile zusammensetzt; `CsvExporter` und `HtmlExporter` implementieren nur `header()` und `line(Book)`. In Java setzt man das mit `abstract class`, `abstract`- und `protected`-Methoden sowie `@Override` um. Alternativ kann ein Interface mit einer `default`-Methode als Template dienen, oder man übergibt die Schritte als Functional Interfaces (Lambdas), was dem Strategy-Pattern entspricht. In Spring findet man das Muster z. B. beim `JdbcTemplate` oder beim `ResponseEntityExceptionHandler`, dessen `handle…`-Methoden man überschreibt.

:::pruefung
Checkliste – hast du …
- das Muster in einem Satz erklärt (fester Ablauf in der Oberklasse, Schritte in Unterklassen)?
- ein **Klassenmodell** (abstrakte Klasse + 2 Unterklassen) gezeichnet oder beschrieben?
- **`abstract`**, **`final`** und **Hooks** erklärt?
- die Java-Varianten genannt (abstrakte Klasse, Interface mit `default`, Lambdas/Functional Interfaces)?
- ein **Beispiel aus Spring** oder JUnit gebracht?
:::
