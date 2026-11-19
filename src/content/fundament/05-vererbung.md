---
title: Vererbung und abstrakte Klassen
minutes: 8
status: draft
---

Mit `extends` übernimmt eine Klasse alles von einer **Oberklasse** und kann Neues dazubauen. Ein E-Book *ist ein* Medium, ein Hörbuch auch:

```java
public class Medium {
    private final String title;

    public Medium(String title) {
        this.title = title;
    }

    public String getTitle() {
        return title;
    }

    public int loanDays() {
        return 21;
    }
}

public class Ebook extends Medium {
    private final double sizeMb;

    public Ebook(String title, double sizeMb) {
        super(title);            // zuerst den Konstruktor der Oberklasse aufrufen
        this.sizeMb = sizeMb;
    }

    @Override
    public int loanDays() {
        return 7;                // E-Books nur eine Woche
    }
}
```

- `Ebook` hat `getTitle()`, ohne es selbst zu schreiben – geerbt.
- `super(title)` ruft den Konstruktor von `Medium` auf. Er muss die **erste Zeile** sein. Hat die Oberklasse keinen leeren Konstruktor, ist er Pflicht.
- `private`-Felder der Oberklasse sind in der Unterklasse **nicht** direkt sichtbar. Darum `getTitle()` statt `title`.
- Java erlaubt nur **eine** Oberklasse, aber beliebig viele Interfaces.

## Abstrakte Klassen: halb fertig

Manchmal ergibt die Oberklasse allein keinen Sinn: Es gibt kein „Medium an sich“. Dann wird sie `abstract`. Man kann sie nicht mit `new` erzeugen, und sie darf Methoden **ohne Rumpf** haben, die jede Unterklasse liefern muss:

```java
public abstract class Medium {
    // … Felder, Konstruktor, getTitle() wie oben …

    public abstract int loanDays();   // jede Unterklasse muss sagen, wie lange
}
```

Eine abstrakte Klasse liegt zwischen Klasse und Interface: Sie kann Felder und fertigen Code mitbringen *und* Lücken vorgeben.

## Wo dir das in der Matura begegnet

| Wo | Vererbung |
|---|---|
| jedes Entity | `extends AbstractPersistable<Long>` – Id, `equals` und `hashCode` kommen von dort |
| Aufgabe 1 | Vererbung im UML-Diagramm (`Person` → `Speaker`, `Attendee`), abgebildet mit `@Inheritance`, siehe [Vererbung in JPA](/jpa/vererbung) |
| Aufgabe 3 | `extends ResponseEntityExceptionHandler` für die Fehlerbehandlung |
| eigene Exceptions | `extends RuntimeException` |

:::merke
- `class B extends A`: B erbt Felder und Methoden von A und darf Methoden überschreiben (`@Override`).
- `super(…)` als erste Zeile im Konstruktor ruft den Konstruktor der Oberklasse auf.
- `abstract class`: nicht mit `new` erzeugbar, darf `abstract`-Methoden ohne Rumpf haben.
- Eine Oberklasse, viele Interfaces.
:::
