---
title: Abgeleitete Queries
minutes: 10
cheatsheet: 16
status: draft
---

„Alle Bücher, deren Titel ‚mohn‘ enthält, unabhängig von der Groß-/Kleinschreibung.“ Solche Abfragen stehen in fast jeder Angabe. Spring Data baut sie aus dem **Namen** einer Methode im Repository – du schreibst keine Zeile SQL.

```java
public interface BookRepository extends JpaRepository<Book, Long> {

    Optional<Book> findByIsbn(String isbn);

    List<Book> findByTitleContainingIgnoreCase(String part);
}
```

## Wie der Name gelesen wird

`findBy` + Bedingungen über **Java-Feldnamen** (nicht Spaltennamen), verbunden mit `And`/`Or`, optional `OrderBy…`:

| Schlüsselwort | Beispiel | Bedingung |
|---|---|---|
| (keins) | `findByTitle(String t)` | `title = ?` |
| `IgnoreCase` | `findByTitleIgnoreCase(String t)` | `upper(title) = upper(?)` |
| `Containing` | `findByTitleContaining(String part)` | `title like %?%` |
| `StartingWith` | `findByTitleStartingWith(String p)` | `title like ?%` |
| `LessThan`, `GreaterThanEqual` | `findByPriceLessThan(BigDecimal max)` | `price < ?` |
| `Between` | `findByPublishedOnBetween(LocalDate from, LocalDate to)` | `published_on between ? and ?` (beide Grenzen inklusive) |
| `IsNull` | `findByBranchIsNull()` | `branch_id is null` |
| `In` | `findByTitleIn(Collection<String> titles)` | `title in (…)` |
| `OrderBy…Asc/Desc` | `findByPriceLessThanOrderByPriceAsc(BigDecimal max)` | sortiert |

Die Parameter werden der Reihe nach den Bedingungen zugeordnet.

## Über Beziehungen und Value Objects hinweg

Der Name darf einem Pfad folgen – über `@ManyToOne`, `@Embedded`, `@ManyToMany` und `@ElementCollection`:

```java
List<Book> findByBranchName(String name);           // book.branch.name
List<Book> findByBranchAddressCity(String city);    // book.branch.address.city
List<Book> findByAuthorsName(String name);          // ein Autor in book.authors heißt so
List<Book> findByKeywords(String keyword);          // keywords enthält das Schlagwort
```

Spring Data erzeugt die nötigen Joins selbst.

## Andere Rückgabetypen

```java
long countByBranchName(String name);
boolean existsByIsbn(String isbn);
Optional<Book> findFirstByOrderByPriceDesc();       // das teuerste Buch
List<Book> findTop2ByOrderByPublishedOnDesc();      // die zwei neuesten
```

- `Optional<…>` für höchstens einen Treffer. Gibt es mehr als einen, wirft Spring Data eine `IncorrectResultSizeDataAccessException`.
- `List<…>` für beliebig viele, auch keinen.
- `First`/`TopN` begrenzen die Anzahl.

## Fehler fallen beim Start auf

Spring Data prüft jeden Methodennamen, sobald der Kontext startet. Ein Tippfehler lässt **jeden** Test scheitern:

```text
QueryCreationException: Cannot create query for method [BookRepository.findByTitel(java.lang.String)];
No property 'titel' found for type 'Book'; Did you mean 'title'
```

Scheitern plötzlich alle Tests, schau zuerst ins Repository.

## Testen: auch was *nicht* gefunden werden darf

```java
@Test
void verify_find_by_title_containing_ignore_case() {
    bookRepository.save(book("9783421000000", "Mohn und Gedächtnis"));
    bookRepository.save(book("9783518365000", "Malina"));

    assertThat(bookRepository.findByTitleContainingIgnoreCase("MOHN"))
            .extracting(Book::getTitle)
            .containsExactly("Mohn und Gedächtnis");
}
```

Mit nur einem Buch in der Datenbank würde auch `findAll()` den Test bestehen. Lege deshalb immer auch Daten an, die die Bedingung **nicht** erfüllen – und für `IgnoreCase` einen Suchbegriff in anderer Schreibweise.

:::pruefung
„Alle `Person` mit `lastName` ‚Schmidt‘ unabhängig von der Groß-/Kleinschreibung“ ist eine Zeile: `List<Person> findByLastNameIgnoreCase(String lastName);` – plus ein Test mit `"schmidt"`, `"SCHMIDT"` und einem anderen Namen.
:::

:::merke
- `findBy` + Feldnamen + Schlüsselwörter (`IgnoreCase`, `Containing`, `LessThan`, `Between`, `OrderBy…`).
- Pfade über Beziehungen und Value Objects: `findByBranchAddressCity`.
- `count…`, `exists…`, `findFirst…`, `findTopN…`.
- Fehler im Namen → der Kontext startet nicht.
:::
