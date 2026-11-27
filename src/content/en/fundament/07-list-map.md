---
title: List and Map – the two collections you always need
---

## `List`: in order, duplicates allowed

```java
List<String> titles = new ArrayList<>();
titles.add("Momo");
titles.add("The Hobbit");
titles.add("Momo");                 // duplicates are ok

titles.get(0);                      // "Momo" – the index starts at 0
titles.size();                      // 3
titles.contains("The Hobbit");      // true
titles.remove("Momo");              // removes the first "Momo"

for (String t : titles) {
    System.out.println(t);
}
```

`List.of(…)` builds an **unmodifiable** list. `add` then throws an `UnsupportedOperationException`:

```java
List<String> fixed = List.of("A", "B");
fixed.add("C");      // UnsupportedOperationException
```

That is on purpose: an entity hands out its list with `Collections.unmodifiableList(…)` or `List.copyOf(…)`, so that nobody can add books past it.

## `Map`: key → value

A map assigns exactly one **value** to every **key** – like a dictionary.

```java
Map<String, Integer> loansPerBranch = new HashMap<>();
loansPerBranch.put("Central", 12);
loansPerBranch.put("North", 5);
loansPerBranch.put("Central", 13);            // overwrites the old value

loansPerBranch.get("Central");                // 13
loansPerBranch.get("South");                  // null – the key does not exist
loansPerBranch.getOrDefault("South", 0);      // 0
loansPerBranch.containsKey("North");          // true

for (Map.Entry<String, Integer> e : loansPerBranch.entrySet()) {
    System.out.println(e.getKey() + ": " + e.getValue());
}
```

:::achtung
`HashMap` has **no** fixed order. If you need sorted keys, use `TreeMap`. For enum keys there is `EnumMap` – the classic in the service task for "result per category".
:::

## Interface on the left, class on the right

```java
List<Book> books = new ArrayList<>();
Map<Genre, List<Book>> byGenre = new HashMap<>();
```

`List` and `Map` are interfaces, `ArrayList` and `HashMap` the implementations. Methods return `List<…>`, not `ArrayList<…>`. That way the inside can change without the caller noticing.

:::merke
- `List`: ordered, index from 0, duplicates allowed. `ArrayList` for filling, `List.of` for fixed lists.
- `Map`: key → value, `put`/`get`/`getOrDefault`/`entrySet`. The same key overwrites.
- The type on the left is always the interface (`List`, `Map`).
:::
