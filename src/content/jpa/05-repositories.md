---
title: Repositories und der erste @DataJpaTest
minutes: 10
cheatsheet: 17
status: draft
---

Ein Entity allein speichert noch nichts. Für das Speichern, Lesen und Löschen brauchst du eine **Zugriffsklasse**, in Spring Data ein Repository. Und weil ungetestete Klassen in der Beurteilung nicht zählen, schreibst du für jedes Repository gleich einen Test.

## Ein Repository ist nur ein Interface

```java
package ormapping.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import ormapping.model.Book;

public interface BookRepository extends JpaRepository<Book, Long> {
}
```

Die beiden Typargumente sind das Entity und der Typ seiner Id. Eine Implementierung schreibst du nicht – Spring erzeugt sie beim Start. `@Repository` darfst du dazuschreiben, nötig ist es nicht.

## Welches Interface?

| Interface | Bringt mit |
|---|---|
| `CrudRepository<T, ID>` | `save`, `findById` (liefert `Optional`), `findAll` (liefert `Iterable`), `count`, `existsById`, `delete`, `deleteById` |
| `ListCrudRepository<T, ID>` | dasselbe, aber `findAll` liefert eine `List` |
| `JpaRepository<T, ID>` | zusätzlich `flush`, `saveAndFlush`, `findAll(Sort)` und mehr |

Nimm `JpaRepository`. Mit einer `List` lässt es sich im Test leichter arbeiten, und `saveAndFlush` brauchst du für Constraint-Tests (Einheit 4).

## `@DataJpaTest`

```java
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

@DataJpaTest
class BookRepositoryTest {

    @Autowired
    private BookRepository bookRepository;
}
```

`@DataJpaTest` startet nur den JPA-Teil von Spring: Entities, Repositories und eine H2-Datenbank im Speicher. Jeder Test läuft in einer eigenen Transaktion, die am Ende **zurückgerollt** wird. Jeder Test beginnt also mit leeren Tabellen.

:::achtung Spring Boot 4: neues Package
`DataJpaTest` liegt in Spring Boot 4 in `org.springframework.boot.data.jpa.test.autoconfigure`. Der Import aus älteren Tutorials (`org.springframework.boot.test.autoconfigure.orm.jpa`) kompiliert nicht mehr.
:::

## Der Lifecycle-Test

Der wichtigste Test für jedes Repository: speichern, wieder lesen, vergleichen, löschen.

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

## Warum `flush` und `clear`?

Hibernate merkt sich jedes Objekt, das du speicherst oder liest, im **Persistence Context**. Fragst du danach mit `findById` nach derselben Id, bekommst du **dasselbe Objekt** aus dem Speicher zurück – ohne dass die Datenbank gefragt wird. Dein Test vergleicht dann ein Objekt mit sich selbst und findet nichts.

- `flush()` schreibt alle ausstehenden Änderungen in die Datenbank.
- `clear()` leert den Persistence Context. Das nächste `findById` muss wirklich aus der Datenbank lesen.

Erst dann fällt auf, wenn eine Spalte falsch abgebildet ist oder der Konstruktor ohne Parameter fehlt (Einheit 3).

:::achtung BigDecimal vergleichen
`new BigDecimal("19.90").equals(new BigDecimal("19.9"))` ist `false`, weil die Anzahl der Nachkommastellen mitzählt. Vergleiche Beträge mit `isEqualByComparingTo`.
:::

:::merke
- Repository = Interface, das `JpaRepository<Entity, Long>` erweitert.
- `@DataJpaTest`: nur JPA, H2 im Speicher, jeder Test wird zurückgerollt.
- Lifecycle-Test: `save` → Id prüfen → `flush`/`clear` → `findById` → Attribute vergleichen → löschen.
- Ohne `clear()` liest `findById` aus dem Speicher, nicht aus der Datenbank.
:::
