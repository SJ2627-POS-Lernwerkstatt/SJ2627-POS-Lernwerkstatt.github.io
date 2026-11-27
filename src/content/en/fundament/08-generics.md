---
title: Reading generics – what does <Book, Long> mean?
---

The angle brackets say **which type** a class or an interface works with. `List<Book>` is "a list of books": the compiler only lets books in, and whatever comes out is certainly a `Book`.

```java
List<Book> books = new ArrayList<>();
books.add(new Book("Momo", 300));
books.add("Momo");                  // compile error – a String is not a Book
Book first = books.get(0);          // no cast needed
```

On the right `<>` (the "diamond") is enough: the compiler already knows the type from the left.

## The generics you read in the Matura

| Expression | Meaning |
|---|---|
| `Optional<Book>` | maybe a book, maybe none |
| `Map<Genre, Long>` | key `Genre`, value `Long` |
| `AbstractPersistable<Long>` | an entity whose id is a `Long` |
| `JpaRepository<Book, Long>` | repository for the entity `Book`, id type `Long` |
| `AttributeConverter<Genre, String>` | turns `Genre` in Java code into a `String` in the database (and back) |
| `ResponseEntity<BookDto>` | HTTP response whose body is a `BookDto` |
| `ResponseEntity<Void>` | HTTP response without a body, e.g. for `204 No Content` |

The order is fixed by the interface: for `JpaRepository<Book, Long>` the entity comes **first**, **then** the id type. `JpaRepository<Long, Book>` may still compile, but Spring does not start.

## No primitive types in `< >`

There is no `List<int>`. Only classes go in angle brackets, hence the **wrappers**: `Integer`, `Long`, `Double`, `Boolean`. Java converts automatically (autoboxing):

```java
List<Integer> pages = new ArrayList<>();
pages.add(310);          // int → Integer automatically
int p = pages.get(0);    // Integer → int automatically
```

:::merke
- `Type<X>` = "works with X". The compiler checks that only X goes in.
- `new ArrayList<>()` – the diamond on the right is enough.
- `JpaRepository<Entity, IdType>`, `AttributeConverter<JavaType, DbType>`.
- Only classes in `< >`: `Integer`, `Long` instead of `int`, `long`.
:::
