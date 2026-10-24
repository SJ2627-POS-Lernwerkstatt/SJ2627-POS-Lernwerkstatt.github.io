---
title: Lambdas und Methodenreferenzen
minutes: 8
status: draft
---

Streams bestehen aus kleinen Bausteinen: *behalte die Volljährigen*, *nimm den Namen*, *sortiere nach Alter*. Jeder Baustein ist eine Funktion, die du als **Lambda** oder **Methodenreferenz** übergibst. Bevor es mit Streams losgeht, schauen wir uns diese Funktionen an.

In diesem Modul verwenden wir durchgehend diese Daten:

```java
public record Grade(String subject, int value) { }

public record Student(String name, String schoolClass, int age, List<Grade> grades) { }
```

## Ein Lambda ist eine Funktion ohne Namen

```java
Predicate<Student> isAdult = s -> s.age() >= 18;
```

Links vom Pfeil stehen die Parameter, rechts das Ergebnis. Braucht der Körper mehrere Anweisungen, schreibst du geschwungene Klammern und `return`:

```java
Predicate<Student> isAdult = s -> {
    int age = s.age();
    return age >= 18;
};
```

## Die vier wichtigsten Funktionstypen

Ein Lambda braucht immer einen **Zieltyp** – ein Interface mit genau einer abstrakten Methode. Diese vier aus `java.util.function` brauchst du ständig:

| Interface | Methode | Bekommt → liefert | Beispiel | Verwendet in |
|---|---|---|---|---|
| `Predicate<T>` | `test` | T → `boolean` | `s -> s.age() >= 18` | `filter`, `anyMatch` |
| `Function<T, R>` | `apply` | T → R | `s -> s.name()` | `map` |
| `Consumer<T>` | `accept` | T → nichts | `text -> System.out.println(text)` | `forEach` |
| `Supplier<T>` | `get` | nichts → T | `() -> new ArrayList<>()` | `orElseGet` |

Dazu kommen `BiFunction<T, U, R>` (zwei Parameter), `UnaryOperator<T>` (T → T) und `BinaryOperator<T>` ((T, T) → T, z. B. bei `reduce`).

## Methodenreferenzen

Ruft ein Lambda nur **eine** vorhandene Methode auf, kannst du stattdessen auf die Methode verweisen:

| Lambda | Methodenreferenz | Art |
|---|---|---|
| `s -> s.name()` | `Student::name` | Methode des Parameters |
| `text -> System.out.println(text)` | `System.out::println` | Methode eines bestimmten Objekts |
| `text -> Integer.parseInt(text)` | `Integer::parseInt` | statische Methode |
| `() -> new ArrayList<>()` | `ArrayList::new` | Konstruktor |

Beide Schreibweisen sind gleichwertig. Methodenreferenzen sind kürzer und meist besser lesbar – nimm sie, wenn es geht.

:::achtung Records haben keine get-Methoden
Bei einem Record heißt der Zugriff wie das Attribut: `Student::name`, nicht `Student::getName`. Bei einer normalen Klasse (z. B. einem Entity) ist es `Student::getName`.
:::

## Predicates kombinieren

```java
Predicate<Student> in5A = s -> s.schoolClass().equals("5AHIF");

Predicate<Student> adultIn5A = isAdult.and(in5A);
Predicate<Student> notIn5A = Predicate.not(in5A);   // oder in5A.negate()
```

Mit `or` gibt es auch das logische Oder. Für `Function` gibt es `andThen`: `toName.andThen(String::length)` liefert die Länge des Namens.

:::merke
- Lambda: `parameter -> ausdruck` oder `parameter -> { ...; return ...; }`.
- `Predicate` → `boolean`, `Function` → Wert, `Consumer` → nichts, `Supplier` → Wert ohne Eingabe.
- Methodenreferenz `Klasse::methode` statt eines Lambdas, das nur eine Methode aufruft.
- Records: `Student::name`, Klassen: `Student::getName`.
:::
