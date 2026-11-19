---
title: "@Override und Polymorphie"
minutes: 7
status: draft
---

**Überschreiben** heißt: Eine Klasse liefert ihre eigene Version einer Methode, die es schon gibt – aus einem Interface oder aus einer Oberklasse. `@Override` schreibst du darüber, damit der **Compiler prüft**, dass du wirklich etwas überschreibst.

## Warum `@Override`, wenn es auch ohne geht?

Jede Klasse erbt von `Object` die Methode `toString()`. Angenommen, du willst sie für `Book` überschreiben und vertippst dich:

```java
public class Book {
    private String title;

    public String toSting() {           // Tippfehler: „Sting“
        return "Book " + title;
    }
}

System.out.println(new Book());   // Book@1b6d3586 – deine Methode wird nie aufgerufen
```

Das kompiliert, weil `toSting` eben eine *neue* Methode ist. Der Fehler fällt erst viel später auf. Mit `@Override` meldet der Compiler sofort: *method does not override or implement a method from a supertype*.

```java
@Override
public String toString() {
    return "Book " + title;
}
```

Dasselbe gilt für falsche Parametertypen: `public boolean equals(Book other)` überschreibt **nicht** `equals(Object o)`, sondern überlädt es. Ohne `@Override` merkst du das nicht.

## Polymorphie: Wer entscheidet, welche Methode läuft?

Polymorphie heißt „Vielgestaltigkeit“: Eine Variable vom Typ des Interfaces (oder der Oberklasse) kann auf verschiedene Objekte zeigen, und **zur Laufzeit** läuft die Methode des echten Objekts:

```java
LateFeePolicy policy = new StudentPolicy();
policy.feeInCents(5);   // ruft StudentPolicy.feeInCents auf

List<LateFeePolicy> all = List.of(new StandardPolicy(), new StudentPolicy());
for (LateFeePolicy p : all) {
    System.out.println(p.feeInCents(5));   // 250, dann 40
}
```

Der **Typ der Variable** bestimmt, welche Methoden du aufrufen *darfst*. Das **echte Objekt** bestimmt, welcher Code *läuft*.

## Was das mit Spring zu tun hat

In der REST-Aufgabe schreibst du einen Controller gegen ein Service. Im Test ersetzt `@MockitoBean` das echte Service durch ein Objekt, das sich nur gleich *verhält*. Der Controller merkt den Unterschied nicht – Polymorphie. Und in deinen Exception-Handlern und Konvertern steht `@Override` vor jeder Methode, die ein Spring-Interface vorgibt.

:::merke
- `@Override` = „Compiler, prüf bitte, dass ich wirklich überschreibe“. Immer hinschreiben.
- Typische Fallen ohne `@Override`: Tippfehler im Namen, falscher Parametertyp bei `equals`.
- Variable vom Interface-Typ, Objekt einer Implementierung: Es läuft die Methode des Objekts.
:::
