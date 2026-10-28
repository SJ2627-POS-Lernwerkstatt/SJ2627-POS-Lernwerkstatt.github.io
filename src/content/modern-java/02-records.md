---
title: Records – Datenklassen in einer Zeile
minutes: 8
cheatsheet: 2
status: draft
---

Ein **Record** (Java 16) ist eine Klasse für Daten, die sich nicht ändern: Du schreibst nur, welche Felder es gibt – den Rest erzeugt Java.

```java
public record Person(String name, int age) { }
```

Daraus macht Java automatisch:

- `private final`-Felder `name` und `age`,
- einen Konstruktor `Person(String name, int age)`,
- Zugriffsmethoden `name()` und `age()` – **ohne** `get`,
- `equals`, `hashCode` und `toString` über alle Felder.

```java
var p = new Person("Anna", 19);
System.out.println(p.name());   // Anna  – Zugriff heißt name(), nicht getName()
System.out.println(p);          // Person[name=Anna, age=19]
System.out.println(new Person("Anna", 19).equals(p)); // true
```

## Prüfen im kompakten Konstruktor

Ungültige Objekte sollen gar nicht erst entstehen. Der **kompakte Konstruktor** hat keine eigene Parameterliste – du prüfst nur, die Felder weist Java danach selbst zu:

```java
public record Point(int x, int y) {
    public Point {
        if (x < 0 || y < 0) {
            throw new IllegalArgumentException("Negative coordinates");
        }
    }

    public double distanceFromOrigin() {          // eigene Methoden sind erlaubt
        return Math.sqrt(x * x + y * y);
    }
}

new Point(3, 4).distanceFromOrigin(); // 5.0
```

## Ändern geht nicht – neu anlegen

Felder sind `final`. Einen anderen Wert bekommst du nur über ein neues Objekt:

```java
var older = new Person(p.name(), p.age() + 1);
```

Seit Java 21 kannst du Records direkt dort **auspacken**, wo du ihren Typ prüfst:

```java
Object obj = new Point(3, 4);
if (obj instanceof Point(int x, int y)) {
    System.out.println(x + ", " + y);   // 3, 4
}
```

## Wann Record, wann Klasse?

Der Spickzettel (S. 2, „Java types“ und „Data Classes“) listet beides. Als Faustregel:

| Datenstruktur | Record? |
|---|---|
| Ergebnis einer Query, DTO in der REST-API, Datenklasse in Aufgabe 2 | ja |
| Entity in Aufgabe 1 (JPA) | nein – JPA braucht veränderliche Felder und einen No-Args-Konstruktor, siehe [Entity-Klassen richtig bauen](/jpa/konstruktoren) |
| Objekt mit veränderlichem Zustand (Zähler, Puffer) | nein |

Vertiefung: Im [Stream-Modul](/streams/datenklassen) geht es weiter – mit gekapselten Listen (`List.copyOf`) und Klassen, die Sammlungen sicher herausgeben.

:::merke
- `record Name(Typ feld, …)` – Konstruktor, Zugriff `feld()`, `equals`, `hashCode`, `toString` geschenkt.
- Gültigkeit im kompakten Konstruktor `public Name { … }` prüfen, ohne Zuweisung.
- Unveränderlich: „Ändern“ heißt ein neues Objekt; Entities bleiben normale Klassen.
:::
