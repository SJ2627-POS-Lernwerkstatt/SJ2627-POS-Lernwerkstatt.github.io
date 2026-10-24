---
title: Streams erzeugen, filtern, umwandeln
minutes: 8
cheatsheet: 2
status: draft
---

Ein Stream ist eine **Pipeline**: Daten kommen aus einer Quelle, laufen durch Zwischenschritte und werden am Ende zu einem Ergebnis zusammengefasst.

```java
List<String> names = students.stream()                        // Quelle
        .filter(s -> s.schoolClass().equals("5AHIF"))         // Zwischenschritt
        .map(Student::name)                                   // Zwischenschritt
        .toList();                                            // Endoperation
// [Anna, Ben]
```

## Quellen

| Quelle | Beispiel |
|---|---|
| Collection | `students.stream()` |
| einzelne Werte | `Stream.of("a", "b", "c")` |
| Array | `Arrays.stream(numbers)` |
| Zahlenbereich | `IntStream.rangeClosed(1, 5)` (1 bis 5), `IntStream.range(1, 5)` (1 bis 4) |

## `filter` und `map`

- `filter(Predicate)` behält nur die Elemente, für die die Bedingung `true` ist.
- `map(Function)` wandelt jedes Element in etwas anderes um: Student → Name, Name → Großbuchstaben.

```java
List<String> upper = students.stream()
        .map(Student::name)
        .map(String::toUpperCase)
        .toList();
// [ANNA, BEN, CEM, DORA, EMIL]
```

Die Reihenfolge zählt: Erst filtern, dann umwandeln – nach `map(Student::name)` hast du nur noch Strings und kannst nicht mehr nach der Klasse filtern.

## Ohne Endoperation passiert nichts

Zwischenschritte sind **lazy**: Sie beschreiben nur, was passieren soll. Erst die Endoperation (`toList`, `count`, `forEach`, `collect` …) setzt die Pipeline in Gang.

```java
students.stream().filter(s -> s.age() > 18);   // filtert nichts – es fehlt die Endoperation
```

Ein Stream kann nur **einmal** verwendet werden. Ein zweites `toList()` auf demselben Stream wirft `IllegalStateException: stream has already been operated upon or closed`. Brauchst du die Daten nochmal, ruf `students.stream()` neu auf.

## `toList()` oder `collect(Collectors.toList())`?

Beide liefern eine Liste, aber:

| | `toList()` | `collect(Collectors.toList())` |
|---|---|---|
| seit | Java 16 | Java 8 |
| Liste veränderbar? | **nein** – `add` wirft `UnsupportedOperationException` | ja (derzeit eine `ArrayList`) |

Für Ergebnisse, die du nur zurückgibst oder prüfst, ist `toList()` die richtige Wahl. Brauchst du sicher eine veränderbare Liste, schreib das ausdrücklich: `collect(Collectors.toCollection(ArrayList::new))`.

:::achtung Liste aus toList() verändern
```java
List<String> names = students.stream().map(Student::name).toList();
names.add("Fritz");   // UnsupportedOperationException
```
Das passiert oft, wenn ein Service ein Ergebnis zurückgibt und der Aufrufer es danach erweitern will.
:::

:::merke
- Quelle → Zwischenschritte (`filter`, `map`, …) → **eine** Endoperation.
- Ohne Endoperation läuft nichts; jeder Stream nur einmal.
- `toList()` liefert eine unveränderliche Liste.
:::
