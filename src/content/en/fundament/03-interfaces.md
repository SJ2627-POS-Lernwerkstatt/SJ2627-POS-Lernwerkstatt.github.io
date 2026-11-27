---
title: Interfaces – a promise without code
---

An **interface** says *what* a class must be able to do, but not *how*. It is a contract: "Whoever implements me has these methods."

```java
public interface LateFeePolicy {
    int feeInCents(int daysLate);   // no body, only the signature
}
```

A class **fulfils** the contract with `implements` and then has to program every method:

```java
public class StandardPolicy implements LateFeePolicy {
    @Override
    public int feeInCents(int daysLate) {
        return daysLate * 50;
    }
}

public class StudentPolicy implements LateFeePolicy {
    @Override
    public int feeInCents(int daysLate) {
        return Math.max(0, daysLate - 3) * 20;   // 3 days free, then cheaper
    }
}
```

If a method is missing, the class does not compile: *StandardPolicy is not abstract and does not override abstract method feeInCents(int)*.

## What is it good for?

Code that only knows the **interface** works with **every** implementation:

```java
public class Library {
    private final LateFeePolicy policy;

    public Library(LateFeePolicy policy) {
        this.policy = policy;
    }

    public int fee(int daysLate) {
        return policy.feeInCents(daysLate);   // which rule? doesn't matter – as long as it keeps the contract
    }
}

new Library(new StandardPolicy()).fee(5);   // 250
new Library(new StudentPolicy()).fee(5);    // 40
```

`Library` does not have to change when a `SeniorPolicy` is added tomorrow. And in a test you can pass a simple fake rule.

## Interfaces in the Matura

You use interfaces all the time, even if you rarely write them yourself:

| Where | Interface | Who implements it? |
|---|---|---|
| Task 1 | `interface BookRepository extends JpaRepository<Book, Long>` | Spring Data, automatically at startup |
| Task 1 | `AttributeConverter<Genre, String>` | you, in the converter |
| Task 2 | a repository or data access interface | a stub or mock in the test |
| everywhere | `List`, `Map`, `Comparator`, `Predicate` | `ArrayList`, `HashMap`, lambdas … |

That is why you write `List<Book> books = new ArrayList<>();`: on the left is the contract (`List`), on the right the concrete class (`ArrayList`).

:::achtung
You cannot create an interface with `new`: `new LateFeePolicy()` does not compile. The *how* is missing, after all.
:::

:::merke
- `interface` = a list of methods without a body, a contract.
- `class X implements I` has to program all methods of `I`.
- Variables and parameters of an interface type accept every implementation.
- Spring Data implements your repository interfaces itself.
:::
