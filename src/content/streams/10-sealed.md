---
title: Sealed Interfaces und Pattern Matching
minutes: 8
core: false
cheatsheet: 2
status: draft
---

Manchmal gibt es von einem Typ eine **feste Anzahl von Varianten**: Eine Form ist ein Kreis, ein Rechteck oder ein Quadrat – sonst nichts. Mit einem *sealed interface* sagst du das dem Compiler, und mit *Pattern Matching* behandelst du jede Variante in einem `switch`.

## `sealed` und `permits`

```java
public sealed interface Shape permits Circle, Rectangle, Square { }

public record Circle(double radius) implements Shape { }
public record Rectangle(double width, double height) implements Shape { }
public record Square(double side) implements Shape { }
```

Nur die in `permits` genannten Klassen dürfen `Shape` implementieren. Eine vierte Form würde nicht kompilieren.

## `switch` mit Typ-Mustern

```java
public static double area(Shape shape) {
    return switch (shape) {
        case Circle c -> Math.PI * c.radius() * c.radius();
        case Rectangle(double w, double h) -> w * h;
        case Square s when s.side() == 0 -> 0;
        case Square s -> s.side() * s.side();
    };
}
```

- `case Circle c` prüft den Typ und gibt dir die Variable `c` schon als `Circle`.
- `case Rectangle(double w, double h)` ist ein **Record-Muster**: Es zerlegt den Record gleich in seine Bestandteile.
- `when` fügt eine zusätzliche Bedingung hinzu. Der speziellere Fall muss **vor** dem allgemeinen stehen.

Es gibt **kein `default`**. Weil `Shape` sealed ist, weiß der Compiler, dass alle Fälle abgedeckt sind. Kommt später eine neue Form dazu, meldet er jeden `switch`, in dem sie fehlt – ein `default` würde diesen Fehler verstecken.

## Pattern Matching mit `instanceof`

Dasselbe geht auch in einem `if`:

```java
if (o instanceof Circle(double r) && r > 10) {
    return "großer Kreis";
}
if (o instanceof Shape s) {
    return "Form " + s.getClass().getSimpleName();
}
```

Der Cast nach dem `instanceof` entfällt.

## Wo hilft das bei der Matura?

Wenn die Angabe von Aufgabe 2 verschiedene Arten von etwas beschreibt, die unterschiedlich berechnet werden (z. B. Tarife oder Buchungsarten), ist ein sealed interface mit Records und einem `switch` eine saubere Lösung. Die Geschäftsregel steht dann an einer Stelle, und du testest jede Variante mit einem eigenen Fall.

:::merke
- `sealed interface X permits A, B, C` legt alle Varianten fest.
- `switch` mit `case A a ->`, Record-Muster `case B(int x, int y) ->` und `when`.
- Über einem sealed Typ braucht der `switch` kein `default` – und sollte keines haben.
:::
