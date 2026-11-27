---
title: "@Query with JPQL"
---

If a method name gets too long or you need something no keyword can do, you write the query yourself – in **JPQL**, the query language of JPA:

```java
public interface BookRepository extends JpaRepository<Book, Long> {

    @Query("select b from Book b join b.authors a where a.name = :name order by b.title")
    List<Book> findWrittenBy(String name);
}
```

## JPQL is not SQL

JPQL looks like SQL but works with **classes and fields**:

| | SQL | JPQL |
|---|---|---|
| what comes after `from` | table `books` | entity `Book` |
| columns | `published_on`, `branch_id` | fields `publishedOn`, `branch` |
| join | `join branches br on br.id = b.branch_id` | `join b.branch br` |
| value object | column `city` | path `b.branch.address.city` |

A table name in JPQL already fails at startup:

```text
Query validation failed for 'select b from books b'
UnknownEntityException: Could not resolve root entity 'books'
```

## Parameters

```java
@Query("select b from Book b where b.branch.address.city = :city and b.price <= :max")
List<Book> findCheapInCity(String city, BigDecimal max);
```

`:city` and `:max` are assigned via the **parameter names** of the method. That works because the Spring Boot Gradle plugin compiles with `-parameters`. With `@Param` it is safe:

```java
List<Book> findCheapInCity(@Param("city") String city, @Param("max") BigDecimal max);
```

## Joins

```java
// books by an author: join via @ManyToMany
@Query("select b from Book b join b.authors a where a.name = :name")

// branches that have at least one book above a price
@Query("select distinct br from Branch br join br.books b where b.price > :min")
```

- `join b.authors a` follows a relation and gives the target an alias.
- A path with a dot (`b.branch.name`) creates the join automatically.
- `distinct` if a join can return the same row several times.

## Functions

```java
@Query("select b from Book b where lower(b.title) like lower(concat('%', :part, '%'))")
List<Book> searchTitle(String part);
```

`lower`, `upper`, `concat`, `length`, `like`, `between`, `in`, `is null` exist as in SQL.

## `join fetch`: loading lists right along

```java
@Query("select b from Book b left join fetch b.authors where b.isbn = :isbn")
Optional<Book> findWithAuthors(String isbn);
```

`fetch` loads the authors in the same query. The list is then available even without an open session (unit 15). `left` so that books without authors are found too.

## Native queries

```java
@Query(value = "select * from books where price > :min", nativeQuery = true)
List<Book> nativeExpensive(BigDecimal min);
```

With `nativeQuery = true` you write real SQL with table and column names. It is **not** checked at startup and depends on the database. Only use it when JPQL is not enough.

:::achtung Errors show at startup
Spring Data checks every JPQL query when the context starts. A wrong field name (`b.titel`) makes all tests fail – read the message with `Query validation failed for …`.
:::

## Testing

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

Again with a book that must **not** be included, and with `order by` in the query so that `containsExactly` can check the order.

:::merke
- `@Query("…")` with JPQL: entities and fields instead of tables and columns.
- Parameters `:name`, safe with `@Param("name")`.
- `join` across relations, paths like `b.branch.address.city`.
- `join fetch` loads lists along; `nativeQuery = true` only in an emergency.
:::
