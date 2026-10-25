---
title: "@Query mit JPQL"
minutes: 10
cheatsheet: 16
status: draft
---

Wird ein Methodenname zu lang oder brauchst du etwas, das kein Schlüsselwort kann, schreibst du die Abfrage selbst – in **JPQL**, der Abfragesprache von JPA:

```java
public interface BookRepository extends JpaRepository<Book, Long> {

    @Query("select b from Book b join b.authors a where a.name = :name order by b.title")
    List<Book> findWrittenBy(String name);
}
```

## JPQL ist nicht SQL

JPQL sieht aus wie SQL, arbeitet aber mit **Klassen und Feldern**:

| | SQL | JPQL |
|---|---|---|
| Was nach `from` steht | Tabelle `books` | Entity `Book` |
| Spalten | `published_on`, `branch_id` | Felder `publishedOn`, `branch` |
| Join | `join branches br on br.id = b.branch_id` | `join b.branch br` |
| Value Object | Spalte `city` | Pfad `b.branch.address.city` |

Ein Tabellenname in JPQL scheitert schon beim Start:

```text
Query validation failed for 'select b from books b'
UnknownEntityException: Could not resolve root entity 'books'
```

## Parameter

```java
@Query("select b from Book b where b.branch.address.city = :city and b.price <= :max")
List<Book> findCheapInCity(String city, BigDecimal max);
```

`:city` und `:max` werden über die **Parameternamen** der Methode zugeordnet. Das klappt, weil das Spring-Boot-Gradle-Plugin mit `-parameters` kompiliert. Sicher geht es mit `@Param`:

```java
List<Book> findCheapInCity(@Param("city") String city, @Param("max") BigDecimal max);
```

## Joins

```java
// Bücher einer Autorin: join über @ManyToMany
@Query("select b from Book b join b.authors a where a.name = :name")

// Filialen, die mindestens ein Buch über einem Preis haben
@Query("select distinct br from Branch br join br.books b where b.price > :min")
```

- `join b.authors a` folgt einer Beziehung und gibt dem Ziel einen Alias.
- Ein Pfad mit Punkt (`b.branch.name`) erzeugt den Join automatisch.
- `distinct`, wenn ein Join dieselbe Zeile mehrfach liefern kann.

## Funktionen

```java
@Query("select b from Book b where lower(b.title) like lower(concat('%', :part, '%'))")
List<Book> searchTitle(String part);
```

`lower`, `upper`, `concat`, `length`, `like`, `between`, `in`, `is null` gibt es wie in SQL.

## `join fetch`: Listen gleich mitladen

```java
@Query("select b from Book b left join fetch b.authors where b.isbn = :isbn")
Optional<Book> findWithAuthors(String isbn);
```

`fetch` lädt die Autoren in derselben Abfrage. Die Liste ist dann auch ohne offene Session verfügbar (Einheit 15). `left`, damit auch Bücher ohne Autoren gefunden werden.

## Native Queries

```java
@Query(value = "select * from books where price > :min", nativeQuery = true)
List<Book> nativeExpensive(BigDecimal min);
```

Mit `nativeQuery = true` schreibst du echtes SQL mit Tabellen- und Spaltennamen. Es wird **nicht** beim Start geprüft und hängt an der Datenbank. Nimm es nur, wenn JPQL nicht reicht.

:::achtung Fehler zeigen sich beim Start
Spring Data prüft jede JPQL-Abfrage beim Start des Kontexts. Ein falscher Feldname (`b.titel`) lässt alle Tests scheitern – lies die Meldung mit `Query validation failed for …`.
:::

## Testen

```java
@Test
void verify_find_written_by() {
    Author bachmann = authorRepository.save(new Author("Ingeborg Bachmann"));
    Author celan = authorRepository.save(new Author("Paul Celan"));
    bookRepository.save(bookBy("Malina", bachmann));
    bookRepository.save(bookBy("Herzzeit", bachmann, celan));
    bookRepository.save(bookBy("Mohn und Gedächtnis", celan));

    assertThat(bookRepository.findWrittenBy("Ingeborg Bachmann"))
            .extracting(Book::getTitle)
            .containsExactly("Herzzeit", "Malina");
}
```

Wieder mit einem Buch, das **nicht** dabei sein darf, und mit `order by` im Query, damit `containsExactly` die Reihenfolge prüfen kann.

:::merke
- `@Query("…")` mit JPQL: Entities und Felder statt Tabellen und Spalten.
- Parameter `:name`, sicher mit `@Param("name")`.
- `join` über Beziehungen, Pfade wie `b.branch.address.city`.
- `join fetch` lädt Listen mit; `nativeQuery = true` nur im Notfall.
:::
