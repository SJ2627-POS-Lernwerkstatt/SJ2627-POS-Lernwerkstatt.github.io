---
title: Repositories and the first @DataJpaTest
---

An entity alone stores nothing yet. For saving, reading and deleting you need an **access class**, in Spring Data a repository. And because untested classes do not count in the grading, you write a test for every repository right away.

## A repository is just an interface

```java
package ormapping.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import ormapping.model.Book;

public interface BookRepository extends JpaRepository<Book, Long> {
}
```

The two type arguments are the entity and the type of its id. You do not write an implementation – Spring generates it at startup. You may add `@Repository`, but it is not necessary.

## Which interface?

| Interface | Brings along |
|---|---|
| `CrudRepository<T, ID>` | `save`, `findById` (returns `Optional`), `findAll` (returns `Iterable`), `count`, `existsById`, `delete`, `deleteById` |
| `ListCrudRepository<T, ID>` | the same, but `findAll` returns a `List` |
| `JpaRepository<T, ID>` | additionally `flush`, `saveAndFlush`, `findAll(Sort)` and more |

Use `JpaRepository`. A `List` is easier to work with in the test, and you need `saveAndFlush` for constraint tests (unit 4).

## `@DataJpaTest`

```java
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

@DataJpaTest
class BookRepositoryTest {

    @Autowired
    private BookRepository bookRepository;
}
```

`@DataJpaTest` only starts the JPA part of Spring: entities, repositories and an in-memory H2 database. Every test runs in a transaction of its own that is **rolled back** at the end. So every test starts with empty tables.

:::achtung Spring Boot 4: new package
In Spring Boot 4, `DataJpaTest` lives in `org.springframework.boot.data.jpa.test.autoconfigure`. The import from older tutorials (`org.springframework.boot.test.autoconfigure.orm.jpa`) no longer compiles.
:::

## The lifecycle test

The most important test for every repository: save, read again, compare, delete.

```java
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

@DataJpaTest
class BookRepositoryTest {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void verify_life_cycle() {
        Book book = new Book("9783161484100", "Der Process", new BigDecimal("19.90"), LocalDate.of(2024, 5, 1));

        Book saved = bookRepository.save(book);
        assertThat(saved.getId()).isNotNull();

        entityManager.flush();
        entityManager.clear();

        Optional<Book> reread = bookRepository.findById(saved.getId());
        assertThat(reread).hasValueSatisfying(b -> {
            assertThat(b.getIsbn()).isEqualTo("9783161484100");
            assertThat(b.getTitle()).isEqualTo("Der Process");
            assertThat(b.getPrice()).isEqualByComparingTo("19.90");
        });

        bookRepository.deleteById(saved.getId());
        assertThat(bookRepository.findById(saved.getId())).isEmpty();
    }
}
```

## Why `flush` and `clear`?

Hibernate remembers every object you save or read in the **persistence context**. If you then ask for the same id with `findById`, you get **the same object** back from memory – without the database being asked. Your test then compares an object with itself and finds nothing.

- `flush()` writes all pending changes to the database.
- `clear()` empties the persistence context. The next `findById` really has to read from the database.

Only then do you notice if a column is mapped wrongly or the constructor without parameters is missing (unit 3).

:::achtung Comparing BigDecimal
`new BigDecimal("19.90").equals(new BigDecimal("19.9"))` is `false`, because the number of decimal places counts. Compare amounts with `isEqualByComparingTo`.
:::

:::merke
- Repository = an interface that extends `JpaRepository<Entity, Long>`.
- `@DataJpaTest`: only JPA, H2 in memory, every test is rolled back.
- Lifecycle test: `save` → check the id → `flush`/`clear` → `findById` → compare attributes → delete.
- Without `clear()`, `findById` reads from memory, not from the database.
:::
