---
title: Exceptions – throw, catch, build your own
---

An **exception** reports: "It cannot go on here." It interrupts the method and travels upwards until someone catches it. If nobody catches it, the program crashes and you see a stack trace.

## Throwing

```java
public void borrow(Book book) {
    if (book.isBorrowed()) {
        throw new IllegalStateException("already borrowed: " + book.getTitle());
    }
    book.setBorrowed(true);   // no longer reached if an exception was thrown above
}
```

Two built-in exceptions are enough for most cases:

| Exception | When |
|---|---|
| `IllegalArgumentException` | a **parameter** is invalid (`pages = -5`) |
| `IllegalStateException` | the **state** does not fit (book already borrowed) |

## Catching

```java
try {
    library.borrow(book);
    System.out.println("Enjoy reading!");
} catch (IllegalStateException e) {
    System.out.println("Sorry, already gone: " + e.getMessage());
}
```

If the `try` block runs without an error, `catch` is skipped. If a matching exception is thrown, Java jumps straight into the `catch` block.

## Checked and unchecked

| | unchecked | checked |
|---|---|---|
| inherits from | `RuntimeException` | `Exception` (but not `RuntimeException`) |
| examples | `IllegalArgumentException`, `NullPointerException` | `IOException`, `SQLException` |
| compiler demands `try/catch` or `throws`? | no | **yes** |

In Spring projects you almost only use **unchecked** exceptions.

## Your own exception

Business errors get a name of their own. That makes tests and the error handling in the REST controller readable:

```java
public class BookNotFoundException extends RuntimeException {
    public BookNotFoundException(long id) {
        super("Book " + id + " not found");
    }
}
```

You throw it in the service, check it in the test with `assertThatThrownBy(…).isInstanceOf(BookNotFoundException.class)`, and in Task 3 an `@ExceptionHandler` turns it into a `404 Not Found`.

:::merke
- `throw new …Exception("message")` ends the method.
- `try { … } catch (Type e) { … }` catches it.
- Unchecked = `extends RuntimeException`, no `throws` needed. That is the normal case.
- Your own exception: `class XyzException extends RuntimeException` with `super(message)`.
:::
