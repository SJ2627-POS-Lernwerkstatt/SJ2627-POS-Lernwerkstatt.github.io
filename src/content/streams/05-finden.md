---
title: Prüfen, finden und Optional
minutes: 9
cheatsheet: 3
status: draft
---

Viele Fragen an eine Liste haben eine kurze Antwort: *Gibt es einen Schüler über 20?* *Wer ist der Jüngste?* Dafür gibt es Endoperationen, die ein `boolean` oder ein einzelnes Element liefern.

## Ja oder nein: `anyMatch`, `allMatch`, `noneMatch`

```java
students.stream().anyMatch(s -> s.age() >= 20);                    // true  – Dora
students.stream().allMatch(s -> s.age() >= 18);                    // true
students.stream().noneMatch(s -> s.schoolClass().equals("5CHIF")); // true
```

Sie hören auf, sobald das Ergebnis feststeht – `anyMatch` beim ersten Treffer.

:::achtung Leere Listen
Für eine **leere** Liste ist `allMatch` immer `true` und `anyMatch` immer `false` – egal, wie die Bedingung lautet. „Alle Schüler einer leeren Klasse sind über 100“ ist logisch wahr. Wenn das in deiner Geschäftsregel falsch wäre, prüf die leere Liste extra.
:::

## Ein Element finden: `findFirst`, `min`, `max`

Ein gesuchtes Element gibt es vielleicht nicht. Deshalb liefern diese Operationen ein **`Optional`**:

```java
Optional<Student> first5B = students.stream()
        .filter(s -> s.schoolClass().equals("5BHIF"))
        .findFirst();                                           // Optional[Cem]

Optional<Student> youngest = students.stream().min(Comparator.comparing(Student::age));
Optional<Student> oldest   = students.stream().max(Comparator.comparing(Student::age));
```

## `Optional` richtig verwenden

Ein `Optional` ist eine Schachtel, die einen Wert enthält – oder leer ist. Du holst den Wert so heraus, dass der leere Fall **bewusst** behandelt wird:

```java
String name = students.stream()
        .filter(s -> s.age() > 30)
        .findFirst()
        .map(Student::name)          // Optional<String>, bleibt leer, wenn leer
        .orElse("niemand");          // Ersatzwert

Student dora = students.stream()
        .filter(s -> s.name().equals("Dora"))
        .findFirst()
        .orElseThrow(() -> new IllegalArgumentException("Dora fehlt"));
```

| Methode | Wenn leer |
|---|---|
| `orElse(wert)` | liefert `wert` |
| `orElseGet(() -> ...)` | ruft den Supplier auf und liefert sein Ergebnis |
| `orElseThrow()` | wirft `NoSuchElementException` |
| `orElseThrow(() -> new ...)` | wirft deine Exception |
| `ifPresent(x -> ...)` | tut nichts |

`orElse(berechne())` ruft `berechne()` **immer** auf, auch wenn ein Wert da ist. Ist der Ersatzwert teuer, nimm `orElseGet(() -> berechne())`.

:::achtung get() und isPresent()
`optional.get()` wirft bei einem leeren `Optional` eine `NoSuchElementException: No value present`. Und `if (o.isPresent()) { o.get() ... }` ist nur eine umständliche Schreibweise für `ifPresent` oder `map`. In Services ist `orElseThrow(() -> new ...NotFoundException(...))` fast immer die richtige Wahl.
:::

:::pruefung
In Services und REST-Controllern ist das typische Muster: `repository.findById(id).orElseThrow(...)`. Die eigene Exception wird dann im Controller zu `404 Not Found` – und du testest diesen Fall ausdrücklich.
:::

:::merke
- `anyMatch` / `allMatch` / `noneMatch` liefern `boolean`; leere Liste: `allMatch` = `true`.
- `findFirst`, `min`, `max` liefern ein `Optional`.
- `map`, `orElse`, `orElseGet`, `orElseThrow`, `ifPresent` statt `get()`.
:::
