---
title: "@ManyToOne und Fremdschlüssel"
minutes: 10
cheatsheet: 13
status: draft
---

Viele Bücher stehen in einer Filiale: `Book "n" -- "1" Branch`. In der Datenbank ist das eine Spalte `branch_id` in der Tabelle `books` – ein **Fremdschlüssel** auf `branches`. In Java ist es einfach ein Feld vom Typ `Branch`.

## Die einfachste Form

```java
@Entity
@Table(name = "books")
public class Book extends AbstractPersistable<Long> {

    // isbn, title, ...

    @ManyToOne
    private Branch branch;
}
```

Lies `@ManyToOne` von der Klasse aus, in der es steht: **viele** Bücher (*Many*) gehören zu **einer** Filiale (*One*). Hibernate legt dafür an:

```sql
branch_id bigint,
...
alter table if exists books
    add constraint FKkbcxdegd7hcxsrbeh1x7h5drk
    foreign key (branch_id) references branches
```

Der Spaltenname ist `<feld>_id`. Den Namen des Constraints erzeugt Hibernate selbst – eine nichtssagende Zeichenkette.

## `@JoinColumn`: Spalte und Constraint benennen

```java
@ManyToOne
@JoinColumn(name = "branch_id", nullable = false,
        foreignKey = @ForeignKey(name = "fk_books_branch"))
private Branch branch;
```

- `name`: der Name der Fremdschlüssel-Spalte.
- `nullable = false`: Multiplizität `"1"` – jedes Buch **muss** eine Filiale haben. Bei `"0,1"` lässt du es weg.
- `foreignKey = @ForeignKey(name = ...)`: ein sprechender Name statt `FKkbcx...`. Taucht in Fehlermeldungen auf und ist ein Punkt für „Sehr gut“: „Generische Namen von erstellten Datenbankschemaelementen sind mit sinnvollen Namen ersetzt.“

Statt `nullable = false` kannst du auch `@NotNull` an das Feld schreiben: Die Spalte wird ebenfalls `not null`, und Bean Validation meldet ein Buch ohne Filiale schon vor dem `insert`.

## Speichern: zuerst die Filiale

```java
Branch branch = branchRepository.save(new Branch("Hauptbücherei", address));
Book book = new Book(isbn, "Der Process", Genre.FICTION, price, publishedOn, branch);
bookRepository.save(book);
```

Speicherst du ein Buch mit einer **neuen**, noch nicht gespeicherten Filiale, scheitert der Flush:

```text
TransientPropertyValueException: Persistent instance of 'Book' references an unsaved transient
instance of 'Branch' (persist the transient instance before flushing)
```

Entweder speicherst du die Filiale zuerst, oder du lässt Hibernate das mit **Cascade** erledigen:

```java
@ManyToOne(cascade = CascadeType.PERSIST)
private Branch branch;
```

Jetzt wird eine neue Filiale beim Speichern des Buchs mitgespeichert. Die Musterlösungen der Matura verwenden das, damit ein ganzer Objektgraph mit einem `save` gespeichert werden kann.

## Laden: `EAGER` und `LAZY`

Beim Lesen eines Buchs lädt Hibernate die Filiale standardmäßig gleich mit (`FetchType.EAGER`). Mit `@ManyToOne(fetch = FetchType.LAZY)` wird sie erst geladen, wenn du `getBranch().getName()` aufrufst. In einem `@DataJpaTest` merkst du keinen Unterschied, weil der ganze Test in einer Transaktion läuft. Für die Prüfung reicht der Standard.

## Testen

```java
@Test
void verify_book_with_branch() {
    Branch branch = branchRepository.save(new Branch("Hauptbücherei", address));
    Book saved = bookRepository.save(new Book(isbn, "Der Process", Genre.FICTION, price, publishedOn, branch));

    entityManager.flush();
    entityManager.clear();

    Book reread = bookRepository.findById(saved.getId()).orElseThrow();
    assertThat(reread.getBranch().getId()).isEqualTo(branch.getId());
    assertThat(reread.getBranch().getName()).isEqualTo("Hauptbücherei");
}
```

:::merke
- `@ManyToOne` steht auf der „viele“-Seite und wird zur Fremdschlüssel-Spalte `<feld>_id`.
- `@JoinColumn(name, nullable = false, foreignKey = @ForeignKey(name = "fk_..."))` für Name, Pflicht und sprechenden Constraint.
- Neue Objekte zuerst speichern oder `cascade = CascadeType.PERSIST`.
- Lesen nach `flush`/`clear` prüft, dass die Beziehung wirklich in der Datenbank steht.
:::
