---
title: Derived queries
---

"All books whose title contains 'mohn', regardless of upper/lower case." Queries like this are in almost every task. Spring Data builds them from the **name** of a method in the repository – you do not write a single line of SQL.

```java
public interface BookRepository extends JpaRepository<Book, Long> {

    Optional<Book> findByIsbn(String isbn);

    List<Book> findByTitleContainingIgnoreCase(String part);
}
```

## How the name is read

`findBy` + conditions on **Java field names** (not column names), connected with `And`/`Or`, optionally `OrderBy…`:

| Keyword | Example | Condition |
|---|---|---|
| (none) | `findByTitle(String t)` | `title = ?` |
| `IgnoreCase` | `findByTitleIgnoreCase(String t)` | `upper(title) = upper(?)` |
| `Containing` | `findByTitleContaining(String part)` | `title like %?%` |
| `StartingWith` | `findByTitleStartingWith(String p)` | `title like ?%` |
| `LessThan`, `GreaterThanEqual` | `findByPriceLessThan(BigDecimal max)` | `price < ?` |
| `Between` | `findByPublishedOnBetween(LocalDate from, LocalDate to)` | `published_on between ? and ?` (both limits inclusive) |
| `IsNull` | `findByBranchIsNull()` | `branch_id is null` |
| `In` | `findByTitleIn(Collection<String> titles)` | `title in (…)` |
| `OrderBy…Asc/Desc` | `findByPriceLessThanOrderByPriceAsc(BigDecimal max)` | sorted |

The parameters are assigned to the conditions in order.

## Across relations and value objects

The name may follow a path – across `@ManyToOne`, `@Embedded`, `@ManyToMany` and `@ElementCollection`:

```java
List<Book> findByBranchName(String name);           // book.branch.name
List<Book> findByBranchAddressCity(String city);    // book.branch.address.city
List<Book> findByAuthorsName(String name);          // an author in book.authors has this name
List<Book> findByKeywords(String keyword);          // keywords contains the keyword
```

Spring Data generates the necessary joins itself.

## Other return types

```java
long countByBranchName(String name);
boolean existsByIsbn(String isbn);
Optional<Book> findFirstByOrderByPriceDesc();       // the most expensive book
List<Book> findTop2ByOrderByPublishedOnDesc();      // the two newest
```

- `Optional<…>` for at most one hit. If there is more than one, Spring Data throws an `IncorrectResultSizeDataAccessException`.
- `List<…>` for any number, including none.
- `First`/`TopN` limit the number.

## Errors show up at startup

Spring Data checks every method name as soon as the context starts. A typo makes **every** test fail:

```text
QueryCreationException: Cannot create query for method [BookRepository.findByTitel(java.lang.String)];
No property 'titel' found for type 'Book'; Did you mean 'title'
```

If suddenly all tests fail, look at the repository first.

## Testing: also what must *not* be found

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

With only one book in the database, `findAll()` would pass the test too. So always also create data that does **not** meet the condition – and for `IgnoreCase` a search term in a different case.

:::pruefung
"All `Person`s with `lastName` 'Schmidt' regardless of upper/lower case" is one line: `List<Person> findByLastNameIgnoreCase(String lastName);` – plus a test with `"schmidt"`, `"SCHMIDT"` and another name.
:::

:::merke
- `findBy` + field names + keywords (`IgnoreCase`, `Containing`, `LessThan`, `Between`, `OrderBy…`).
- Paths across relations and value objects: `findByBranchAddressCity`.
- `count…`, `exists…`, `findFirst…`, `findTopN…`.
- A mistake in the name → the context does not start.
:::
