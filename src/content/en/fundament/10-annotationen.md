---
title: Annotations – notes stuck to code
---

An annotation (`@Something`) is a **note** that you stick to a class, a field, a method or a parameter. It does nothing by itself. What matters is **who reads the note**.

| Who reads it? | When? | Examples |
|---|---|---|
| the compiler | when compiling | `@Override` |
| Lombok | when compiling – generates code | `@Getter`, `@Setter`, `@NoArgsConstructor`, `@RequiredArgsConstructor` |
| Hibernate (JPA) | at startup and when saving | `@Entity`, `@Table`, `@Column`, `@ManyToOne`, `@Enumerated` |
| Spring | at startup | `@Service`, `@RestController`, `@GetMapping`, `@Transactional` |
| JUnit | when testing | `@Test`, `@BeforeEach`, `@ParameterizedTest` |
| Bean Validation | when validating | `@NotNull`, `@Size`, `@Valid` |

That is why a typo or a **missing** annotation is so treacherous: the code compiles, but Hibernate or Spring do not see the note and behave differently. Without `@Entity` there is no table, without `@Service` Spring does not find the class.

## Annotations with values

Many annotations take settings in parentheses:

```java
@Table(name = "books")
@Column(length = 13, nullable = false, unique = true)
@Enumerated(EnumType.STRING)
@GetMapping("/{id}")                  // only one value called value → the name may be left out
@NoArgsConstructor(access = AccessLevel.PROTECTED)
```

## Where does the annotation come from?

Every annotation needs an **import**. The IDE often suggests several with the same name – pick the right one:

| Annotation | right | wrong |
|---|---|---|
| `@Test` | `org.junit.jupiter.api.Test` | `org.junit.Test` (JUnit 4) |
| `@Id` | `jakarta.persistence.Id` | `org.springframework.data.annotation.Id` |
| `@Transactional` | `org.springframework.transaction.annotation.Transactional` | `jakarta.transaction.Transactional` works too, but is not the usual choice |

:::merke
- Annotation = a note with information. It only has an effect because a tool reads it.
- If an annotation is missing, the code often still compiles – the error only shows at startup or in the test.
- Values in parentheses: `name = …`. Only `value` → leave out the name.
- Watch the import.
:::
