---
title: "Theory question: mapping inheritance to tables"
---

This is how the question could be asked:

> A fleet management system has a superclass `Vehicle` with the subclasses `Car` and `Truck`, each with attributes of its own. How can such a hierarchy be mapped to the tables of a relational database? Compare the options and justify the criteria you use to decide.

You know the code for it from [Inheritance in JPA](/jpa/vererbung). Here it is about the **justification**.

## Writing exercise

Take **5 minutes** and write your answer in key points. Only then read on.

## The knowledge behind it

Example: `Person` (name, email) with the subclasses `Speaker` (topic) and `Attendee` (ticketNumber).

| Strategy | Tables | Advantages | Disadvantages |
|---|---|---|---|
| **SINGLE_TABLE** (JPA default) | **one** table `person` with all columns + a **discriminator** column (`person_type`) | fast: no joins, polymorphic queries ("all persons") easy | columns of the subclasses have to be **nullable** (no `NOT NULL` constraints), many empty columns, the table gets wide |
| **JOINED** | one table **per class**; subclass tables only have their own columns and a foreign key (= primary key) to `person` | cleanly normalised, `NOT NULL` possible, no space wasted | **joins** on every read, inserting into several tables → slower for deep hierarchies |
| **TABLE_PER_CLASS** | one table per **concrete** class with **all** (including inherited) columns | queries on one subclass without a join, `NOT NULL` possible | polymorphic queries need `UNION`, ids have to be unique across tables (no `IDENTITY`), columns duplicated |
| **@MappedSuperclass** | no table for the superclass, its fields end up in every subclass table | simple, for common technical fields (id, timestamps) | **no** inheritance in the DB: no queries and no relations on the superclass |

**Indicators:**

- Subclasses have **few attributes of their own**, queries often go via the superclass → **SINGLE_TABLE**.
- Subclasses have **many attributes of their own that are mandatory**, data integrity is important → **JOINED**.
- Queries almost never go via the superclass, subclasses are independent → **TABLE_PER_CLASS** (or `@MappedSuperclass` if the superclass only provides common fields).
- Other entities refer to the **superclass** (e.g. `@ManyToOne Person`) → SINGLE_TABLE or JOINED.

## Sample answer

> Relational databases know no inheritance, so JPA has three strategies (`@Inheritance`). With **SINGLE_TABLE** (the default) all classes of the hierarchy end up in one table; a discriminator column stores which subclass a row is. Advantage: no joins, very fast and simple polymorphic queries. Disadvantage: the columns of the subclasses have to be nullable, so you lose `NOT NULL` constraints, and many empty fields come about.
>
> With **JOINED** every class gets a table of its own; the subclass tables only contain their own columns and refer to the superclass table via the primary key (which is also a foreign key). The schema is normalised and constraints are possible, but every query needs joins and every insert several statements. With **TABLE_PER_CLASS** every concrete class has a complete table of its own including the inherited columns; queries on one subclass are fast, but queries via the superclass are only possible with `UNION`, and the ids have to be unique across tables. In addition there is `@MappedSuperclass` if the superclass only provides common fields and is not an entity itself.
>
> **SINGLE_TABLE** is the choice when the subclasses have few attributes of their own and queries often go via the superclass. I choose **JOINED** when subclasses have many mandatory attributes of their own and data integrity matters. **TABLE_PER_CLASS** when there are almost never polymorphic queries.

:::pruefung
Checklist – have you …
- described all **three strategies** (SINGLE_TABLE, JOINED, TABLE_PER_CLASS) with their table structure?
- mentioned the **discriminator** column for SINGLE_TABLE?
- named **advantages and disadvantages** for each (nullable / joins / UNION)?
- named **indicators** for the choice?
- mentioned `@MappedSuperclass` as a distinction (bonus)?
:::
