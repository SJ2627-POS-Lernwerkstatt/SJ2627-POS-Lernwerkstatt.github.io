---
title: Objektgraphen speichern und testen
minutes: 10
status: draft
---

Die Angabe verlangt meist: „Stellen Sie durch Testen der Zugriffsklassen sicher, dass sich sowohl die einzelnen Klassen lesen und speichern lassen als auch **alle Verbindungen** zwischen den Klassen.“ Ein Test pro Repository reicht dafür nicht. Du brauchst Tests, die einen ganzen **Objektgraphen** speichern, neu lesen und jede Beziehung prüfen.

## Das Muster: bauen – speichern – leeren – lesen – prüfen

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
        // bauen
        Author bachmann = authorRepository.save(new Author("Ingeborg Bachmann"));
        Branch branch = new Branch("Hauptbücherei", new Address("Urban-Loritz-Platz 2a", "1070", "Wien"));
        Book malina = new Book("9783518365000", "Malina", new BigDecimal("12.40"), LocalDate.of(1971, 3, 1));
        malina.addAuthor(bachmann);
        branch.addBook(malina);

        // speichern
        branchRepository.save(branch);

        // leeren
        entityManager.flush();
        entityManager.clear();

        // lesen und prüfen
        Branch reread = branchRepository.findById(branch.getId()).orElseThrow();
        assertThat(reread.getBooks()).singleElement().satisfies(book -> {
            assertThat(book.getBranch()).isEqualTo(reread);
            assertThat(book.getAuthors()).extracting(Author::getName).containsExactly("Ingeborg Bachmann");
        });
    }
}
```

- **bauen**: Erzeuge die Objekte so, wie der Fachcode es tut – mit Konstruktoren und Hilfsmethoden.
- **speichern**: Über das Repository des „obersten“ Objekts. Was nicht per Cascade mitgeht, speicherst du vorher selbst (hier die Autorin).
- **leeren**: `flush` schreibt alles in die Datenbank, `clear` leert den First-Level-Cache. Ohne `clear` liefert `findById` dasselbe Objekt aus dem Speicher zurück, und der Test beweist nichts.
- **prüfen**: Jede Beziehung einmal, in jede Richtung, die das Modell hat.

## `TestEntityManager`

`@DataJpaTest` stellt einen `TestEntityManager` bereit. Neben `flush` und `clear` gibt es:

| Methode | Macht |
|---|---|
| `persist(entity)` | speichert (wie `repository.save`), Cascade gilt |
| `persistAndFlush(entity)` | speichert und schreibt sofort in die Datenbank |
| `persistFlushFind(entity)` | speichert, schreibt, leert den Cache und liest neu – in einem Schritt |
| `find(Type.class, id)` | liest über die Id |

Damit kannst du Testdaten anlegen, ohne für jede Klasse ein Repository zu brauchen:

```java
Author author = entityManager.persistFlushFind(new Author("Paul Celan"));
assertThat(author.getId()).isNotNull();
```

## Lazy Loading im Test

`@OneToMany` und `@ManyToMany` laden ihre Elemente erst, wenn du sie brauchst (*lazy*). Im normalen `@DataJpaTest` läuft jeder Test in einer Transaktion, deshalb klappt das Nachladen nach `clear` problemlos.

Ohne Transaktion – etwa mit `@Transactional(propagation = Propagation.NOT_SUPPORTED)` wie in den Bewertungstests – ist die Session nach `findById` schon wieder zu:

```text
LazyInitializationException: Cannot lazily initialize collection of role
'ormapping.model.Branch.books' with key '2' (no session)
```

`@ManyToOne` und `@OneToOne` sind dagegen *eager* und werden sofort mitgeladen. Brauchst du eine Liste außerhalb einer Transaktion, lade sie mit einer Abfrage mit `join fetch` (Einheit 17).

## Was ein vollständiger Testsatz enthält

Für jede Klasse aus dem Diagramm:

1. **Entity**: speichern und lesen (Lifecycle-Test aus Einheit 5).
2. **Constraint**: mindestens ein Test, dass ungültige Daten abgelehnt werden.
3. **Value Object**: Spalten und Validierung über das Entity, das es einbettet.
4. **Rich Type / Enum**: Converter einzeln testen (auch `null`) und den gespeicherten Wert prüfen.
5. **Beziehung**: Graph speichern, neu lesen, beide Richtungen prüfen.
6. **Abfrage**: mit Testdaten, die auch Treffer **ausschließen** (Einheit 16).

:::pruefung
Ungetestete Klassen werden bei der Beurteilung nicht berücksichtigt. Ein Graph-Test pro Beziehung ist schnell geschrieben und sichert gleich mehrere Klassen ab.
:::

:::merke
- Bauen – speichern – `flush` – `clear` – lesen – prüfen.
- `TestEntityManager`: `persist`, `persistAndFlush`, `persistFlushFind`, `find`.
- Lazy-Listen brauchen eine offene Session; im normalen `@DataJpaTest` ist sie da.
:::
