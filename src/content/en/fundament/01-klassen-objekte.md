---
title: Class and object – blueprint and thing
---

A **class** is a blueprint. An **object** is a thing built from that blueprint. From a class `Book` you can build as many books as you like, and each one has its own values.

```java
public class Book {
    String title;      // field: every book has its own title
    int pages;         // … and its own number of pages

    boolean isThick() {            // method: what a book "can do"
        return pages > 500;
    }
}
```

Only `new` creates an object:

```java
Book a = new Book();
a.title = "The Hobbit";
a.pages = 310;

Book b = new Book();
b.title = "War and Peace";
b.pages = 1274;

System.out.println(a.isThick()); // false
System.out.println(b.isThick()); // true
```

`a` and `b` are two different objects of the same class. `a.pages` and `b.pages` have nothing to do with each other.

## Variables point to objects

A variable of type `Book` *is* not the book, it **points** to it (a reference). Two variables can point to the same object:

```java
Book c = a;          // no new book! c points to the same object as a
c.pages = 999;
System.out.println(a.pages); // 999
```

A variable that points to nothing is `null`. If you call a method on it, you get the famous `NullPointerException`.

## `static`: belongs to the class, not to the object

A field or method with `static` exists **only once for the whole class**. You do not need an object to use it:

```java
public class Book {
    static int created = 0;   // one counter for all books together
    String title;

    static boolean isValidIsbn(String isbn) {   // does not need a particular book
        return isbn != null && isbn.length() == 13;
    }
}

Book.isValidIsbn("9783608938289"); // called via the class name
```

That is why you write `Math.max(…)`, `List.of(…)` or `public static void main(…)`: you do not have to build anything with `new` for them.

:::achtung
A `static` method has no "current object". It cannot read `title`, because it is not clear *which* book is meant. The compiler then reports *non-static variable cannot be referenced from a static context*.
:::

:::merke
- Class = blueprint, object = a thing built with `new`. Every object has its own field values.
- Variables point to objects. `b = a` copies the pointer, not the object.
- `static` belongs to the class and is called via the class name.
:::
