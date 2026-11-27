---
title: Data classes with records
---

In Task 2 you first build the **data classes** from the task, then the service that calculates with them. For data that does not change after it is created, a **record** is the shortest and safest form. The basics – compact constructor, accessor methods, when a record and when a class – are explained in [Modern Java features – Records](/modern-java/records); here it is about the finer points.

## A record

```java
public record Grade(String subject, int value) { }
```

From this Java automatically generates:

- `private final` fields `subject` and `value`,
- a constructor with all fields in this order,
- accessor methods `subject()` and `value()` (without `get`),
- `equals` and `hashCode` over **all** fields,
- `toString()` → `Grade[subject=POS, value=1]`.

Two records with the same values are equal – exactly what `distinct`, `groupingBy` and AssertJ's `isEqualTo` need.

## Checking in the compact constructor

Invalid objects should never come into existence. In the **compact constructor** you check the values before they are stored:

```java
public record Grade(String subject, int value) {
    public Grade {
        if (value < 1 || value > 5) {
            throw new IllegalArgumentException("grade must be 1..5: " + value);
        }
    }
}
```

The parameters have the same names as the fields, and you write no assignment – Java does that itself at the end.

## Lists in records: make a copy

A record is only as immutable as its fields. The caller can still change an `ArrayList` that was passed in later:

```java
public record Student(String name, String schoolClass, int age, List<Grade> grades) {
    public Student {
        if (name == null) {
            throw new IllegalArgumentException("name must not be null");
        }
        grades = List.copyOf(grades);   // unmodifiable copy
    }
}
```

`List.copyOf` creates an **unmodifiable copy**: if someone changes the original list, the student does not notice, and `student.grades().add(...)` throws an `UnsupportedOperationException`.

## Changing means: create a new one

You cannot change a record. If you need a different value, you create a new object:

```java
Student older = new Student(s.name(), s.schoolClass(), s.age() + 1, s.grades());
```

## And if it has to be a class?

Entities (Task 1) and objects with mutable state are normal classes. There, too: do not hand out internal lists directly, otherwise anyone can add elements from outside.

```java
public class Course {
    private final List<String> students = new ArrayList<>();

    public void enroll(String student) {      // changes only through own methods
        students.add(student);
    }

    public List<String> getStudents() {
        return List.copyOf(students);         // or Collections.unmodifiableList(students)
    }
}
```

:::pruefung
The task text of Task 2 often describes the data classes as pseudocode or UML. A record with checks in the compact constructor fulfils "data classes implemented correctly" with little code – and the checks are also a good reason for exception tests.
:::

:::merke
- `record Name(Type field, ...)`: constructor, accessor `field()`, `equals`, `hashCode`, `toString` included.
- Checks in the compact constructor `public Name { ... }`.
- Copy lists with `List.copyOf`; classes hand out lists only as an unmodifiable copy.
:::
