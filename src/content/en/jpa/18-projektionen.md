---
title: Projections and aggregates
---

Often the task does not want whole entities, but a list with selected values:

> A list of the books with title, name of the branch and price.
> Per branch the number of books and their total value.

Results like these are called **projections**. You describe them with a record and let the query fill it.

## A record as the result

```java
package ormapping.persistence;

public record BookOverview(String title, String branchName, BigDecimal price) {
}
```

### Option 1: constructor expression

```java
@Query("""
        select new ormapping.persistence.BookOverview(b.title, b.branch.name, b.price)
        from Book b
        order by b.title""")
List<BookOverview> findOverview();
```

- `select new` calls the constructor for every row. Types and order have to match the record.
- The class name needs the **whole package**. `select new BookOverview(…)` fails at startup with `Could not resolve class 'BookOverview' named for instantiation`.

### Option 2: Spring Data builds the constructor call

```java
@Query("select b.title, br.name, b.price from Book b join b.branch br order by b.title")
List<BookOverview> findOverviewShort();
```

If the return type is a record, Spring Data adds the `new …` itself. The values are passed in order.

### Option 3: derived query with a record

```java
List<BookOverview> findByTitleStartingWith(String prefix);
```

Spring Data reads the names of the record components: `title` → `b.title`, `branchName` → `b.branch.name` (a path as in unit 16), `price` → `b.price`.

### Interface projection

```java
public interface BookTitleOnly {
    String getTitle();
    String getIsbn();
}

List<BookTitleOnly> findByPriceGreaterThan(BigDecimal min);
```

Spring Data returns objects that implement the interface. For values of your own that are calculated, the record is simpler.

## Putting values together

> Room number as one attribute, put together from building, floor and room.

```java
public record BranchLabel(String name, String location) {
}

@Query("""
        select new ormapping.persistence.BranchLabel(
            br.name, concat(br.address.zip, ' ', br.address.city))
        from Branch br""")
List<BranchLabel> findLabels();
```

`concat(…)` joins texts, with any number of arguments. `br.address.zip || ' ' || br.address.city` gives the same. Convert numbers to text first with `cast(x as String)`.

## Aggregates: `count`, `sum`, `avg`, `min`, `max`

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

| Function | Result type in Java |
|---|---|
| `count(…)` | `Long` (record: `long` or `Long`) |
| `sum(b.price)` with `BigDecimal` | `BigDecimal` |
| `sum(…)` with `Integer` | `Long` |
| `avg(…)` | `Double` |

- `group by` combines the rows per branch. Everything in the `select` that is not an aggregate belongs in `group by`.
- `left join` keeps branches **without** books: `count` is then `0`, but `sum` is `null`. With `coalesce(sum(b.price), 0)` it becomes `0`.

```text
BranchStock[branchName=Empty, bookCount=0, totalValue=null]
BranchStock[branchName=Graz Zentrum, bookCount=1, totalValue=9.90]
BranchStock[branchName=Main Library, bookCount=2, totalValue=40.40]
```

## Testing

```java
@Test
void verify_stock_per_branch() {
    // Main Library with 12.40 + 28.00, Graz Zentrum with 9.90, a branch without books
    ...
    assertThat(bookRepository.findStock()).containsExactly(
            new BranchStock("Empty", 0, null),
            new BranchStock("Graz Zentrum", 1, new BigDecimal("9.90")),
            new BranchStock("Main Library", 2, new BigDecimal("40.40")));
}
```

Records have `equals`, so you can compare whole results. Careful with `BigDecimal`: `new BigDecimal("40.4")` is **not** `equals` to `40.40`. The database returns the scale of the column, here 2.

:::pruefung
A "list with the following attributes" in the task is a projection: create a record, write the query with `select new …` (or option 2), test with data that makes the result unambiguous.
:::

:::merke
- Projection = record + `select new package.Record(…)`, give the whole package.
- Spring Data can add the `new` itself or fill a record from a derived query.
- `concat` puts values together; `count`, `sum`, `avg` with `group by`.
- `left join` + `count` = 0, but `sum` = `null`.
:::
