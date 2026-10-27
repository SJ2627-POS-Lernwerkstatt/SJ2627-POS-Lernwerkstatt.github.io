---
title: Optional – die Schachtel mit Deckel
minutes: 8
status: draft
---

Methoden, die nichts finden, geben `null` zurück – und der Aufrufer vergisst die Prüfung: `NullPointerException`. Ein **`Optional<T>`** ist eine Schachtel, die entweder genau einen Wert enthält oder leer ist. Der Compiler zwingt dich, beide Fälle hinzuschreiben.

## Erzeugen

```java
Optional<String> a = Optional.of("Hello");            // garantiert nicht null
Optional<String> b = Optional.ofNullable(maybeNull);  // Wert oder leer
Optional<String> c = Optional.empty();                // bewusst leer
```

`Optional.of(null)` wirft sofort `NullPointerException` – Absicherung wäre es nicht. Für Werte, die `null` sein können, nimm `ofNullable`.

## Benutzen

Der Inhalt kommt so heraus, dass der leere Fall **bewusst** behandelt wird:

```java
Optional<String> opt = findUserEmail(42);

opt.ifPresent(email -> System.out.println(email));   // nur wenn was drin ist

var e1 = opt.orElse("default@example.com");          // Ausweichwert
var e2 = opt.orElseGet(() -> generateDefault());     // Ausweich-Logik nur im leeren Fall
var e3 = opt.orElseThrow(() -> new NotFoundException("42")); // leere Schachtel ist ein Fehler
```

Der Unterschied zwischen `orElse` und `orElseGet`: Das Argument von `orElse` wird **immer** ausgewertet, auch wenn etwas in der Schachtel ist – bei `orElseGet` läuft die Methode nur, wenn sie leer ist.

```java
Optional.of("anna@example.com").orElse(expensive());          // expensive() läuft!
Optional.of("anna@example.com").orElseGet(() -> expensive()); // läuft nicht
```

:::achtung `get()` ohne Prüfung
`opt.get()` wirft bei leerer Schachtel `NoSuchElementException: No value present`. Auch `if (opt.isPresent()) { opt.get() … }` ist nur die umständliche Version von `ifPresent` oder `map` – und wenn du den leeren Fall brauchst, willst du meist `orElse`/`orElseThrow`.
:::

## Weiterverarbeiten statt auspacken

```java
opt.map(String::toUpperCase)                  // Optional<String> – transformiert, wenn voll
   .filter(s -> s.endsWith(".COM"));          // Optional<String> – prüft im Inneren
```

Der leere Fall wandert einfach durch – kein Verschachteln von `if`.

## Best Practices

:::merke
- `Optional` ist ein **Rückgabetyp**: „das Finden kann daneben gehen" steht in der Signatur.
- Nicht als Feld, nicht als Methodenparameter, nicht zum Serialisieren – dort ist es nur eine teure Schachtel um `null`.
- Werte eher umwandeln (`map`, `filter`) als auspacken (`get`).
:::

Im [Stream-Modul](/streams/finden) arbeiten `findFirst`, `min` und `max` von Haus aus mit `Optional` – dort siehst du es im Einsatz. Dasselbe Muster gilt in Aufgabe 1: `repository.findById(id)` liefert ein `Optional`, siehe [Repositories](/jpa/repositories).
