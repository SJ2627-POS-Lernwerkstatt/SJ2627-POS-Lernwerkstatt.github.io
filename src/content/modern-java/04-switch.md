---
title: Switch-Ausdrücke – Pfeil statt break
minutes: 6
cheatsheet: 2
status: draft
---

Der klassische `switch` hat zwei Eigenschaften, die jeder kennt: Fehlt ein `break`, fällt der Code einfach in den nächsten Zweig durch (**Fall-through**), und er liefert keinen Wert.

```java
String result;
switch (day) {
    case MONDAY:
    case FRIDAY:
        result = "Work day";
        break;   // vergessen = falsches Ergebnis, ohne Fehlermeldung
    case SATURDAY:
    case SUNDAY:
        result = "Weekend";
        break;
    default:
        result = "Midweek";
}
```

## Die moderne Form: Pfeil und Wert

```java
var result = switch (day) {
    case MONDAY, FRIDAY   -> "Work day";
    case SATURDAY, SUNDAY -> "Weekend";
    default               -> "Midweek";
};
```

Kein `break`, kein Durchfallen – der switch ist ein **Ausdruck**: Sein Ergebnis kannst du direkt einer Variablen zuweisen. Mehrere Fälle teilt man mit Komma.

Brauchst du im Zweig mehrere Zeilen, wird er zum Block und liefert mit **`yield`**:

```java
String season = switch (month) {
    case 12, 1, 2 -> "Winter";
    default -> {
        var note = "monat " + month;
        yield note;
    }
};
```

## Vollständigkeit

Ein Switch-**Ausdruck** muss alle Eingabewerte abdecken – sonst kompiliert er nicht: „Der Switch-Ausdruck deckt nicht alle möglichen Eingabewerte ab". Bei einem `enum` heißt die Regel: alle Konstanten durchdecken oder `default` schreiben.

Bei **versiegelten Typen** (`sealed`, siehe [Records](/modern-java/records)) ist die Sache schöner – der Compiler kennt alle erlaubten Subtypen und braucht kein `default`:

```java
sealed interface Shape permits Circle, Rectangle, Triangle { }
record Circle(double radius) implements Shape { }
record Rectangle(double width, double height) implements Shape { }
record Triangle(double base, double height) implements Shape { }

double area = switch (shape) {
    case Circle c     -> Math.PI * c.radius() * c.radius();
    case Rectangle r  -> r.width() * r.height();
    case Triangle t   -> t.base() * t.height() / 2.0;
};
```

Das ist **Pattern Matching for switch** (Java 21): Jeder Fall prüft einen Typ, benennt das Objekt und kann es sofort benutzen. Auch `null` darf jetzt ein eigener Fall sein – `case null -> …` (oder `case null, default -> …`) ersetzt die Prüfung vor dem Switch.

:::pruefung
In Aufgabe 2 (Service) tauchen Zustände und Typen als `enum` auf – die Zuordnung zu Texten, Gebühren oder Fristen ist ein Fall für den Pfeil-Switch mit Record- oder Enum-Fällen. Ein Switch-Ausdruck ohne `default` zeigt der Korrekturleserin, dass du alle Fälle bedacht hast.
:::
