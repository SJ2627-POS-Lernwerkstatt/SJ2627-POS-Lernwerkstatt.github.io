---
title: var – Typ dort, wo er offensichtlich ist
minutes: 5
cheatsheet: 2
status: draft
---

Seit Java 10 schreibt man `var`, wenn der Typ rechts ohnehin dasteht. Das ist **keine dynamische Typisierung**: Die Variable behält ihren Typ, `var` nimmt ihn nur vom Startwert ab.

```java
// mit explizitem Typ
String message = "Hello, World!";
List<String> names = new ArrayList<>();

// dasselbe mit var – Typ wird aus dem Startwert abgeleitet
var message = "Hello, World!";        // String
var names = new ArrayList<String>();  // ArrayList<String>
```

## Die Regel

:::merke
Benutze `var`, wenn der Typ auf der rechten Seite **offensichtlich** ist: bei `new …`, bei Literalen und bei Methoden, deren Name den Typ nennt.
:::

Wo der Typ nicht sofort sichtbar ist, schreibst du ihn aus – ein `var` vor einem `readData()`-Aufruf macht den Code schwieriger zu lesen, nicht leichter.

## Grenzen von var

`var` funktioniert **nur für lokale Variablen** – nicht für Felder, Parameter und Rückgabetypen. Außerdem muss der Startwert sofort da sein:

```java
var count = 42;      // ok: int
var name = "Alice";  // ok: String

var x;               // Fehler: muss initialisiert werden
var y = null;        // Fehler: Typ für lokale Variable y kann nicht abgeleitet werden
```

Und als Feld einer Klasse? „var ist hier nicht zulässig" – sagt der Compiler.

## var und Collections

Beim Iterieren bleibt der Code kurz, ohne dass man zweimal nachdenkt:

```java
var map = new HashMap<String, List<Integer>>();
map.put("A", List.of(1, 2));

for (var entry : map.entrySet()) {
    var key = entry.getKey();    // String
    var value = entry.getValue(); // List<Integer>
    System.out.println(key + "=" + value);
}
```

Achtung bei Zahlen: `var i = 42` ist ein `int`, `var d = 42.0` ein `double`, und `var big = 42L` ein `long`. Der Typ steht rechts – und bleibt.

:::pruefung
In den Prüfungsaufgaben ist `var` erlaubt, aber nicht nötig. Bei Definitionen von Records und Klassen schreibst du die Typen aus; `var` passt in Methodenrümpfe und Schleifen.
:::
