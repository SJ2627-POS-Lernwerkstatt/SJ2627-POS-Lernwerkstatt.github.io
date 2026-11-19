---
title: List und Map – die zwei Sammlungen, die du immer brauchst
minutes: 8
status: draft
---

## `List`: der Reihe nach, Duplikate erlaubt

```java
List<String> titles = new ArrayList<>();
titles.add("Momo");
titles.add("Der Hobbit");
titles.add("Momo");                 // Duplikate sind ok

titles.get(0);                      // "Momo" – Index beginnt bei 0
titles.size();                      // 3
titles.contains("Der Hobbit");      // true
titles.remove("Momo");              // entfernt das erste "Momo"

for (String t : titles) {
    System.out.println(t);
}
```

`List.of(…)` baut eine **unveränderliche** Liste. `add` wirft dann eine `UnsupportedOperationException`:

```java
List<String> fixed = List.of("A", "B");
fixed.add("C");      // UnsupportedOperationException
```

Das ist gewollt: Ein Entity gibt seine Liste nach außen mit `Collections.unmodifiableList(…)` oder `List.copyOf(…)` heraus, damit niemand daran vorbei Bücher hinzufügt.

## `Map`: Schlüssel → Wert

Eine Map ordnet jedem **Schlüssel** genau einen **Wert** zu – wie ein Wörterbuch.

```java
Map<String, Integer> loansPerBranch = new HashMap<>();
loansPerBranch.put("Mitte", 12);
loansPerBranch.put("Nord", 5);
loansPerBranch.put("Mitte", 13);              // überschreibt den alten Wert

loansPerBranch.get("Mitte");                  // 13
loansPerBranch.get("Süd");                    // null – Schlüssel gibt es nicht
loansPerBranch.getOrDefault("Süd", 0);        // 0
loansPerBranch.containsKey("Nord");           // true

for (Map.Entry<String, Integer> e : loansPerBranch.entrySet()) {
    System.out.println(e.getKey() + ": " + e.getValue());
}
```

:::achtung
`HashMap` hat **keine** feste Reihenfolge. Brauchst du sortierte Schlüssel, nimm `TreeMap`. Für Enum-Schlüssel gibt es `EnumMap` – in der Service-Aufgabe der Klassiker für „Ergebnis pro Kategorie“.
:::

## Links das Interface, rechts die Klasse

```java
List<Book> books = new ArrayList<>();
Map<Genre, List<Book>> byGenre = new HashMap<>();
```

`List` und `Map` sind Interfaces, `ArrayList` und `HashMap` die Implementierungen. Methoden geben `List<…>` zurück, nicht `ArrayList<…>`. So kann sich das Innere ändern, ohne dass der Aufrufer etwas merkt.

:::merke
- `List`: geordnet, Index ab 0, Duplikate erlaubt. `ArrayList` zum Befüllen, `List.of` für fixe Listen.
- `Map`: Schlüssel → Wert, `put`/`get`/`getOrDefault`/`entrySet`. Gleicher Schlüssel überschreibt.
- Typ links immer das Interface (`List`, `Map`).
:::
