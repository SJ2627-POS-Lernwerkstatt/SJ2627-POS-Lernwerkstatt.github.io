---
title: Generics lesen – was bedeutet <Book, Long>?
minutes: 6
status: draft
---

Die spitzen Klammern sagen, **mit welchem Typ** eine Klasse oder ein Interface arbeitet. `List<Book>` ist „eine Liste von Büchern“: Der Compiler lässt nur Bücher hinein, und was herauskommt, ist sicher ein `Book`.

```java
List<Book> books = new ArrayList<>();
books.add(new Book("Momo", 300));
books.add("Momo");                  // Kompilierfehler – ein String ist kein Book
Book first = books.get(0);          // kein Cast nötig
```

Rechts reicht `<>` (der „Diamant“): Den Typ kennt der Compiler schon von links.

## Die Generics, die du in der Matura liest

| Ausdruck | Bedeutung |
|---|---|
| `Optional<Book>` | vielleicht ein Buch, vielleicht keins |
| `Map<Genre, Long>` | Schlüssel `Genre`, Wert `Long` |
| `AbstractPersistable<Long>` | Entity, dessen Id ein `Long` ist |
| `JpaRepository<Book, Long>` | Repository für das Entity `Book`, Id-Typ `Long` |
| `AttributeConverter<Genre, String>` | wandelt `Genre` im Java-Code in einen `String` in der Datenbank um (und zurück) |
| `ResponseEntity<BookDto>` | HTTP-Antwort, deren Body ein `BookDto` ist |
| `ResponseEntity<Void>` | HTTP-Antwort ohne Body, z. B. bei `204 No Content` |

Die Reihenfolge ist durch das Interface festgelegt: Bei `JpaRepository<Book, Long>` kommt **zuerst** das Entity, **dann** der Id-Typ. `JpaRepository<Long, Book>` kompiliert vielleicht noch, aber Spring startet nicht.

## Keine primitiven Typen in `< >`

`List<int>` gibt es nicht. In spitzen Klammern stehen nur Klassen, darum die **Wrapper**: `Integer`, `Long`, `Double`, `Boolean`. Java wandelt automatisch um (Autoboxing):

```java
List<Integer> pages = new ArrayList<>();
pages.add(310);          // int → Integer automatisch
int p = pages.get(0);    // Integer → int automatisch
```

:::merke
- `Typ<X>` = „arbeitet mit X“. Der Compiler prüft, dass nur X hineinkommt.
- `new ArrayList<>()` – rechts reicht der Diamant.
- `JpaRepository<Entity, IdTyp>`, `AttributeConverter<JavaTyp, DbTyp>`.
- In `< >` nur Klassen: `Integer`, `Long` statt `int`, `long`.
:::
