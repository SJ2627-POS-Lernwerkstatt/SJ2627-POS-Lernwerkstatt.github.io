---
title: Saving and testing object graphs
---

The task usually demands: "Make sure by testing the access classes that both the individual classes can be read and saved and **all connections** between the classes." One test per repository is not enough for that. You need tests that save a whole **object graph**, read it anew and check every relation.

## The pattern: build – save – clear – read – check

```java
@DataJpaTest
class BranchGraphTest {

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private AuthorRepository authorRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void verify_branch_books_and_authors() {
        // build
        Author bachmann = authorRepository.save(new Author("Ingeborg Bachmann"));
        Branch branch = new Branch("Main Library", new Address("Urban-Loritz-Platz 2a", "1070", "Wien"));
        Book malina = new Book("9783518365000", "Malina", new BigDecimal("12.40"), LocalDate.of(1971, 3, 1));
        malina.addAuthor(bachmann);
        branch.addBook(malina);

        // save
        branchRepository.save(branch);

        // clear
        entityManager.flush();
        entityManager.clear();

        // read and check
        Branch reread = branchRepository.findById(branch.getId()).orElseThrow();
        assertThat(reread.getBooks()).singleElement().satisfies(book -> {
            assertThat(book.getBranch()).isEqualTo(reread);
            assertThat(book.getAuthors()).extracting(Author::getName).containsExactly("Ingeborg Bachmann");
        });
    }
}
```

- **build**: create the objects the way the business code does – with constructors and helper methods.
- **save**: via the repository of the "top" object. Whatever does not go along via cascade, you save yourself first (here the author).
- **clear**: `flush` writes everything to the database, `clear` empties the first-level cache. Without `clear`, `findById` returns the same object from memory, and the test proves nothing.
- **check**: every relation once, in every direction the model has.

## `TestEntityManager`

`@DataJpaTest` provides a `TestEntityManager`. Besides `flush` and `clear` there are:

| Method | Does |
|---|---|
| `persist(entity)` | saves (like `repository.save`), cascade applies |
| `persistAndFlush(entity)` | saves and writes to the database right away |
| `persistFlushFind(entity)` | saves, writes, clears the cache and reads anew – in one step |
| `find(Type.class, id)` | reads by id |

With it you can create test data without needing a repository for every class:

```java
Author author = entityManager.persistFlushFind(new Author("Paul Celan"));
assertThat(author.getId()).isNotNull();
```

## Lazy loading in the test

`@OneToMany` and `@ManyToMany` only load their elements when you need them (*lazy*). In a normal `@DataJpaTest` every test runs in a transaction, so loading them later after `clear` works without problems.

Without a transaction – for example with `@Transactional(propagation = Propagation.NOT_SUPPORTED)` as in the grading tests – the session is already closed again after `findById`:

```text
LazyInitializationException: Cannot lazily initialize collection of role
'ormapping.model.Branch.books' with key '2' (no session)
```

`@ManyToOne` and `@OneToOne`, on the other hand, are *eager* and are loaded right away. If you need a list outside a transaction, load it with a query with `join fetch` (unit 17).

## What a complete set of tests contains

For every class from the diagram:

1. **Entity**: save and read (lifecycle test from unit 5).
2. **Constraint**: at least one test that invalid data is rejected.
3. **Value object**: columns and validation via the entity that embeds it.
4. **Rich type / enum**: test the converter on its own (including `null`) and check the stored value.
5. **Relation**: save the graph, read it anew, check both directions.
6. **Query**: with test data that also **excludes** hits (unit 16).

:::pruefung
Untested classes are not taken into account in the grading. A graph test per relation is written quickly and covers several classes at once.
:::

:::merke
- Build – save – `flush` – `clear` – read – check.
- `TestEntityManager`: `persist`, `persistAndFlush`, `persistFlushFind`, `find`.
- Lazy lists need an open session; in a normal `@DataJpaTest` it is there.
:::
