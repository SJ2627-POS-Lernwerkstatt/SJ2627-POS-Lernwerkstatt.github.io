---
title: Konstruktoren, this und private Felder
minutes: 8
status: draft
mindest: true
---

In der letzten Einheit wurden die Felder nach `new Book()` einzeln befüllt. Das ist fehleranfällig: Man vergisst leicht eines, und jeder kann jederzeit `pages = -5` setzen. Besser ist es, wenn ein Objekt **von Anfang an gültig** ist und seine Felder **schützt**.

## Der Konstruktor

Ein Konstruktor sieht aus wie eine Methode, hat aber **keinen Rückgabetyp** und heißt **genau wie die Klasse**. Er läuft bei `new` einmal ab:

```java
public class Book {
    private String title;
    private int pages;

    public Book(String title, int pages) {
        if (pages <= 0) {
            throw new IllegalArgumentException("pages must be positive");
        }
        this.title = title;
        this.pages = pages;
    }
}

Book hobbit = new Book("Der Hobbit", 310);   // fertig und gültig in einer Zeile
```

## `this`: das Objekt selbst

Der Parameter `title` und das Feld `title` heißen gleich. Innerhalb des Konstruktors meint `title` den **Parameter**. Mit `this.title` sagst du: „das Feld *dieses* Objekts“.

```java
this.title = title;   // Feld  =  Parameter
title = title;        // Parameter = Parameter → das Feld bleibt null!
```

## `private` + Getter = Kapselung

`private` heißt: Nur Code **in dieser Klasse** darf das Feld lesen oder schreiben. Von außen geht es über Methoden:

```java
public String getTitle() {
    return title;
}

public int getPages() {
    return pages;
}
```

So entscheidet die Klasse selbst, was erlaubt ist. Es gibt hier zum Beispiel keinen `setPages`, also kann niemand die Seitenzahl nachträglich kaputt machen.

## Mehrere Konstruktoren und der Standardkonstruktor

Eine Klasse darf mehrere Konstruktoren haben, wenn sich die Parameter unterscheiden (**Überladen**). Mit `this(…)` ruft einer den anderen auf:

```java
public Book(String title) {
    this(title, 100);   // ruft Book(String, int) auf
}
```

Schreibst du **keinen** Konstruktor, erzeugt Java einen leeren `Book()`. Sobald du einen eigenen schreibst, verschwindet er. Das ist für JPA wichtig: Ein Entity braucht einen Konstruktor ohne Parameter. In der Matura erledigt das `@NoArgsConstructor` von Lombok, siehe [Entities mit Lombok](/jpa/konstruktoren).

:::merke
- Konstruktor: Name = Klassenname, kein Rückgabetyp, läuft bei `new`.
- `this.feld = feld;` trennt Feld und gleichnamigen Parameter.
- Felder `private`, Zugriff über Getter. Die Klasse schützt ihre Daten selbst.
- Eigener Konstruktor ⇒ kein automatischer leerer Konstruktor mehr.
:::
