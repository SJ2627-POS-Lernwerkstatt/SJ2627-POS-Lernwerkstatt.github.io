---
title: Inheritance and abstract classes
---

With `extends` a class takes over everything from a **superclass** and can add new things. An e-book *is a* medium, and so is an audiobook:

```java
public class Medium {
    private final String title;

    public Medium(String title) {
        this.title = title;
    }

    public String getTitle() {
        return title;
    }

    public int loanDays() {
        return 21;
    }
}

public class Ebook extends Medium {
    private final double sizeMb;

    public Ebook(String title, double sizeMb) {
        super(title);            // first call the constructor of the superclass
        this.sizeMb = sizeMb;
    }

    @Override
    public int loanDays() {
        return 7;                // e-books only for one week
    }
}
```

- `Ebook` has `getTitle()` without writing it itself – inherited.
- `super(title)` calls the constructor of `Medium`. It must be the **first line**. If the superclass has no empty constructor, it is mandatory.
- `private` fields of the superclass are **not** directly visible in the subclass. That is why it is `getTitle()` instead of `title`.
- Java allows only **one** superclass, but any number of interfaces.

## Abstract classes: half finished

Sometimes the superclass alone makes no sense: there is no "medium as such". Then it becomes `abstract`. You cannot create it with `new`, and it may have methods **without a body** that every subclass has to provide:

```java
public abstract class Medium {
    // … fields, constructor, getTitle() as above …

    public abstract int loanDays();   // every subclass has to say how long
}
```

An abstract class sits between a class and an interface: it can bring fields and finished code *and* leave gaps to fill.

## Where you meet this in the Matura

| Where | Inheritance |
|---|---|
| every entity | `extends AbstractPersistable<Long>` – id, `equals` and `hashCode` come from there |
| Task 1 | inheritance in the UML diagram (`Person` → `Speaker`, `Attendee`), mapped with `@Inheritance`, see [Inheritance in JPA](/jpa/vererbung) |
| Task 3 | `extends ResponseEntityExceptionHandler` for error handling |
| own exceptions | `extends RuntimeException` |

:::merke
- `class B extends A`: B inherits fields and methods from A and may override methods (`@Override`).
- `super(…)` as the first line in the constructor calls the constructor of the superclass.
- `abstract class`: cannot be created with `new`, may have `abstract` methods without a body.
- One superclass, many interfaces.
:::
