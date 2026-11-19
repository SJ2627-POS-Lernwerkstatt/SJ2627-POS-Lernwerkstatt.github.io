---
title: Klasse und Objekt – Bauplan und Ding
minutes: 7
status: draft
---

Eine **Klasse** ist ein Bauplan. Ein **Objekt** ist ein Ding, das nach diesem Bauplan gebaut wurde. Aus einer Klasse `Book` kannst du beliebig viele Bücher bauen, und jedes hat seine eigenen Werte.

```java
public class Book {
    String title;      // Feld: jedes Buch hat seinen eigenen Titel
    int pages;         // … und seine eigene Seitenzahl

    boolean isThick() {            // Methode: was ein Buch „kann“
        return pages > 500;
    }
}
```

Erst mit `new` entsteht ein Objekt:

```java
Book a = new Book();
a.title = "Der Hobbit";
a.pages = 310;

Book b = new Book();
b.title = "Krieg und Frieden";
b.pages = 1274;

System.out.println(a.isThick()); // false
System.out.println(b.isThick()); // true
```

`a` und `b` sind zwei verschiedene Objekte derselben Klasse. `a.pages` und `b.pages` haben nichts miteinander zu tun.

## Variablen zeigen auf Objekte

Eine Variable vom Typ `Book` *ist* nicht das Buch, sie **zeigt** darauf (eine Referenz). Zwei Variablen können auf dasselbe Objekt zeigen:

```java
Book c = a;          // kein neues Buch! c zeigt auf dasselbe Objekt wie a
c.pages = 999;
System.out.println(a.pages); // 999
```

Eine Variable, die auf nichts zeigt, ist `null`. Rufst du darauf eine Methode auf, bekommst du die berühmte `NullPointerException`.

## `static`: gehört der Klasse, nicht dem Objekt

Ein Feld oder eine Methode mit `static` gibt es **nur einmal für die ganze Klasse**. Du brauchst kein Objekt, um sie zu verwenden:

```java
public class Book {
    static int created = 0;   // ein Zähler für alle Bücher zusammen
    String title;

    static boolean isValidIsbn(String isbn) {   // braucht kein konkretes Buch
        return isbn != null && isbn.length() == 13;
    }
}

Book.isValidIsbn("9783608938289"); // Aufruf über den Klassennamen
```

Darum heißt es `Math.max(…)`, `List.of(…)` oder `public static void main(…)`: Dafür musst du nichts mit `new` bauen.

:::achtung
Eine `static`-Methode kennt kein „aktuelles Objekt“. Sie kann `title` nicht lesen, weil nicht klar ist, *welches* Buch gemeint ist. Der Compiler meldet dann *non-static variable cannot be referenced from a static context*.
:::

:::merke
- Klasse = Bauplan, Objekt = mit `new` gebautes Ding. Jedes Objekt hat eigene Feldwerte.
- Variablen zeigen auf Objekte. `b = a` kopiert den Zeiger, nicht das Objekt.
- `static` gehört der Klasse und wird über den Klassennamen aufgerufen.
:::
