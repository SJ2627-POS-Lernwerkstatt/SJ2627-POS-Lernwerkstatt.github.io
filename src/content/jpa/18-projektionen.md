---
title: Projektionen und Aggregate
minutes: 12
cheatsheet: 16
status: draft
---

Oft will die Angabe keine ganzen Entities, sondern eine Liste mit ausgewählten Werten:

> Eine Liste der Bücher mit Titel, Name der Filiale und Preis.
> Pro Filiale die Anzahl der Bücher und ihr Gesamtwert.

Solche Ergebnisse heißen **Projektionen**. Du beschreibst sie mit einem Record und lässt die Abfrage ihn füllen.

## Ein Record als Ergebnis

```java
package ormapping.persistence;

public record BookOverview(String title, String branchName, BigDecimal price) {
}
```

### Variante 1: Konstruktor-Ausdruck

```java
@Query("""
        select new ormapping.persistence.BookOverview(b.title, b.branch.name, b.price)
        from Book b
        order by b.title""")
List<BookOverview> findOverview();
```

- `select new` ruft für jede Zeile den Konstruktor auf. Typen und Reihenfolge müssen zum Record passen.
- Der Klassenname braucht das **ganze Package**. `select new BookOverview(…)` scheitert beim Start mit `Could not resolve class 'BookOverview' named for instantiation`.

### Variante 2: Spring Data baut den Konstruktor-Aufruf

```java
@Query("select b.title, br.name, b.price from Book b join b.branch br order by b.title")
List<BookOverview> findOverviewShort();
```

Ist der Rückgabetyp ein Record, ergänzt Spring Data das `new …` selbst. Die Werte werden der Reihe nach übergeben.

### Variante 3: abgeleitete Query mit Record

```java
List<BookOverview> findByTitleStartingWith(String prefix);
```

Spring Data liest die Namen der Record-Komponenten: `title` → `b.title`, `branchName` → `b.branch.name` (Pfad wie in Einheit 16), `price` → `b.price`.

### Interface-Projektion

```java
public interface BookTitleOnly {
    String getTitle();
    String getIsbn();
}

List<BookTitleOnly> findByPriceGreaterThan(BigDecimal min);
```

Spring Data liefert Objekte, die das Interface implementieren. Für eigene, berechnete Werte ist der Record einfacher.

## Werte zusammensetzen

> Raumnummer als ein Attribut, zusammengesetzt aus Gebäude, Stockwerk und Raum.

```java
public record BranchLabel(String name, String location) {
}

@Query("""
        select new ormapping.persistence.BranchLabel(
            br.name, concat(br.address.zip, ' ', br.address.city))
        from Branch br""")
List<BranchLabel> findLabels();
```

`concat(…)` hängt Texte zusammen, mit beliebig vielen Argumenten. `br.address.zip || ' ' || br.address.city` liefert dasselbe. Zahlen wandelst du vorher mit `cast(x as String)` in Text um.

## Aggregate: `count`, `sum`, `avg`, `min`, `max`

```java
public record BranchStock(String branchName, long bookCount, BigDecimal totalValue) {
}

@Query("""
        select new ormapping.persistence.BranchStock(br.name, count(b), sum(b.price))
        from Branch br left join br.books b
        group by br.name
        order by br.name""")
List<BranchStock> findStock();
```

| Funktion | Ergebnistyp in Java |
|---|---|
| `count(…)` | `Long` (Record: `long` oder `Long`) |
| `sum(b.price)` bei `BigDecimal` | `BigDecimal` |
| `sum(…)` bei `Integer` | `Long` |
| `avg(…)` | `Double` |

- `group by` fasst die Zeilen pro Filiale zusammen. Alles im `select`, das kein Aggregat ist, gehört in `group by`.
- `left join` behält Filialen **ohne** Bücher: `count` ist dann `0`, `sum` aber `null`. Mit `coalesce(sum(b.price), 0)` wird daraus `0`.

```text
BranchStock[branchName=Graz Zentrum, bookCount=1, totalValue=9.90]
BranchStock[branchName=Hauptbücherei, bookCount=2, totalValue=40.40]
BranchStock[branchName=Leer, bookCount=0, totalValue=null]
```

## Testen

```java
@Test
void verify_stock_per_branch() {
    // Hauptbücherei mit 12.40 + 28.00, Graz Zentrum mit 9.90, eine Filiale ohne Bücher
    ...
    assertThat(bookRepository.findStock()).containsExactly(
            new BranchStock("Graz Zentrum", 1, new BigDecimal("9.90")),
            new BranchStock("Hauptbücherei", 2, new BigDecimal("40.40")),
            new BranchStock("Leer", 0, null));
}
```

Records haben `equals`, deshalb kannst du ganze Ergebnisse vergleichen. Achtung bei `BigDecimal`: `new BigDecimal("40.4")` ist **nicht** `equals` zu `40.40`. Die Datenbank liefert die Scale der Spalte, hier 2.

:::pruefung
Eine „Liste mit folgenden Attributen“ in der Angabe ist eine Projektion: Record anlegen, Query mit `select new …` (oder Variante 2) schreiben, mit Daten testen, die das Ergebnis eindeutig machen.
:::

:::merke
- Projektion = Record + `select new paket.Record(…)`, ganzes Package angeben.
- Spring Data kann das `new` selbst ergänzen oder einen Record aus einer abgeleiteten Query füllen.
- `concat` setzt Werte zusammen; `count`, `sum`, `avg` mit `group by`.
- `left join` + `count` = 0, aber `sum` = `null`.
:::
