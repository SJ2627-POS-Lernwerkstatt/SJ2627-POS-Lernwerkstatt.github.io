---
title: Constructors, this and private fields
---

In the last unit the fields were filled one by one after `new Book()`. That is error-prone: it is easy to forget one, and anyone can set `pages = -5` at any time. It is better if an object is **valid from the start** and **protects** its fields.

## The constructor

A constructor looks like a method, but has **no return type** and is named **exactly like the class**. It runs once on `new`:

```java
public class Book {
    private String title;
    private int pages;

    public Book(String title, int pages) {
        if (pages <= 0) {
            throw new IllegalArgumentException("pages must be positive");
        }
        this.title = title;
        this.pages = pages;
    }
}

Book hobbit = new Book("The Hobbit", 310);   // complete and valid in one line
```

## `this`: the object itself

The parameter `title` and the field `title` have the same name. Inside the constructor, `title` means the **parameter**. With `this.title` you say: "the field of *this* object".

```java
this.title = title;   // field  =  parameter
title = title;        // parameter = parameter → the field stays null!
```

## `private` + getter = encapsulation

`private` means: only code **in this class** may read or write the field. From outside, access goes through methods:

```java
public String getTitle() {
    return title;
}

public int getPages() {
    return pages;
}
```

This way the class itself decides what is allowed. Here, for example, there is no `setPages`, so nobody can break the number of pages later.

## Several constructors and the default constructor

A class may have several constructors if their parameters differ (**overloading**). With `this(…)` one calls the other:

```java
public Book(String title) {
    this(title, 100);   // calls Book(String, int)
}
```

If you write **no** constructor, Java creates an empty `Book()`. As soon as you write your own, it disappears. This matters for JPA: an entity needs a constructor without parameters. In the Matura, Lombok's `@NoArgsConstructor` takes care of that, see [Entities with Lombok](/jpa/konstruktoren).

:::merke
- Constructor: name = class name, no return type, runs on `new`.
- `this.field = field;` separates the field from the parameter with the same name.
- Fields `private`, access via getters. The class protects its own data.
- Own constructor ⇒ no automatic empty constructor any more.
:::
