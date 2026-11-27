---
title: "Theory question: recursion"
---

This is how the question could be asked:

> What is **recursion**? Explain with an example how a recursive call runs and what a recursive solution consists of. Which properties must a problem have for it to be solvable recursively, and for which typical tasks is recursion used?

## Writing exercise

Take **5 minutes** and write your answer in key points. Only then read on.

## The knowledge behind it

**Recursion:** a method calls **itself** – with a **smaller** part of the problem – until the problem is so small that the answer is known directly.

```java
static long factorial(int n) {
    if (n <= 1) {                    // termination condition (base case)
        return 1;
    }
    return n * factorial(n - 1);     // recursive call with a smaller problem
}
```

How `factorial(4)` runs:

```
factorial(4) = 4 * factorial(3)
             = 4 * 3 * factorial(2)
             = 4 * 3 * 2 * factorial(1)
             = 4 * 3 * 2 * 1                ← base case reached, now the results are calculated back
             = 24
```

Every call gets its own entry on the **call stack** (its own parameters and local variables). If the termination condition is missing or the problem does not get smaller, the stack grows until a **`StackOverflowError`** comes.

**Parts:**

1. **Base case / termination condition** – solvable directly, without calling itself.
2. **Recursive step** – make the problem smaller and call the method itself.
3. **Combining** – build the overall result from the partial result (here: `n * …`).

**Requirement on the problem:** it can be split into **similar, smaller sub-problems**, and there is a **smallest case** with a known solution (*self-similar* structure, "divide and conquer").

**Classic problems:**

- mathematical: factorial, Fibonacci, greatest common divisor (Euclid), power
- traversing **tree and directory structures** (file system, DOM, categories with subcategories, JSON)
- **divide and conquer:** quicksort, mergesort, binary search
- **backtracking:** Towers of Hanoi, maze, sudoku, eight queens problem, all permutations

**Recursion vs. loop (iteration):** every recursion can also be solved iteratively. Recursion is often shorter and closer to the definition, but needs stack memory and is a little slower. Naive recursion can repeat work (Fibonacci) → **memoization**.

## Sample answer

> With **recursion** a method calls itself to solve a problem by reducing it to a smaller version of the same problem. A recursive solution consists of a **termination condition** (base case) that returns a result without a further call, and a **recursive step** that makes the problem smaller, calls itself and combines the partial result into the overall result. Every call gets its own entry on the call stack; if the termination condition is missing, a `StackOverflowError` occurs.
>
> Example factorial: `factorial(n)` returns 1 for `n <= 1`, otherwise `n * factorial(n - 1)`. `factorial(4)` calls `factorial(3)`, `factorial(2)` and `factorial(1)`; afterwards the results are multiplied from the inside out: 1, 2, 6, 24.
>
> A problem is suitable for recursion if it can be split into similar, smaller sub-problems and there is a smallest case with a known solution. Classic examples are factorial and Fibonacci, traversing trees and directory structures, sorting methods based on "divide and conquer" like quicksort and mergesort, binary search and backtracking problems like the Towers of Hanoi or sudoku. Every recursion can also be solved iteratively; the recursive variant is often more readable but needs more memory.

:::pruefung
Checklist – have you …
- **defined** recursion (a method calls itself with a smaller problem)?
- shown an **example** with code and its flow?
- named the **termination condition** and the **recursive step**?
- mentioned the **call stack** / `StackOverflowError`?
- named the **requirement** on the problem (self-similar, smallest case)?
- listed several **classic problems** (trees, sorting, backtracking …)?
:::
