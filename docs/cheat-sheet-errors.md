# Errors in POS_Java_CheatSheet.pdf

Page numbers are the printed page numbers in the PDF. Sorted by how likely a student copies the mistake into exam code.

## Code that does not compile or does not work

| Page | Section | In the sheet | Correct |
|---|---|---|---|
| 12 | Enumeration | `@Enumerated(EnumerationType.STRING)` | `@Enumerated(EnumType.STRING)` |
| 11, 12 | Rich Type, Enumeration | `@Converter(autoapply=true)` | `@Converter(autoApply = true)` |
| 12 | Enumeration | `// @Convert(GenderConverter.class)` | `@Convert(converter = GenderConverter.class)` (`converter` is not the default attribute) |
| 12 | Enumeration | `private Gender Gender;` (second field, same type, capitalised name) | Remove the field or name it e.g. `private Gender otherGender;` (field names start lowercase) |
| 14 | Associations | `@EmbeddedColumnNaming("contact_")` | `@EmbeddedColumnNaming("contact_%s")` (the value is a format pattern with `%s`) |
| 16 | Query | `findByLastNameUpper(String lastName)` | `Upper` is no Spring Data keyword. Use `findByLastNameIgnoreCase(String lastName)` |
| 16 | Query | `public ProjectionForStudent projectionFromStudent();` (query without `where`) | Return `List<ProjectionForStudent>`. A single return type throws `IncorrectResultSizeDataAccessException` as soon as there are two students |
| 21, 22 | Controller Advice | `public GlobalControllerAdvice {` | `public class GlobalControllerAdvice {` |
| 22 | HATEOAS Links | `linkTo(methodOn(<controller>.class).<method>(<args>).toUri();` | `linkTo(methodOn(<controller>.class).<method>(<args>)).toUri();` (closing parenthesis missing) |
| 20 | Classes shortlist | `HttpMessageNotWriteableException` | `HttpMessageNotWritableException` |
| 9 | Entity / EmbeddedId | `record UserId(@GeneratedValue Long id)` | `@GeneratedValue` inside an `@EmbeddedId` is not supported by JPA. The ID has to be set by the application (or use `@Id @GeneratedValue` directly). The snippet is also missing the closing `}` of the class |

## Pitfalls with Spring Boot 4 (not wrong, but missing)

| Page | Section | Note |
|---|---|---|
| 22 | Presentation Layer Tests | `ObjectMapper` must be imported from `tools.jackson.databind` (Jackson 3). `com.fasterxml.jackson.databind.ObjectMapper` is no longer a bean and the test fails at startup |
| 5, 17, 22 | Spring Tests | The test annotations moved packages: `org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest`, `org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest`. Old imports from Boot 3 tutorials do not compile |
| 17 | Auditing | Also needs `@EntityListeners(AuditingEntityListener.class)` on the entity and `@EnableJpaAuditing` on a configuration class. `@CreatedBy`/`@LastModifiedBy` also need an `AuditorAware` bean |
| 20 | REST annotations | `@PatchMapping` is missing from the table, although PATCH is mentioned on page 21 |

## Minor (wording, inconsistencies)

| Page | Section | In the sheet | Correct |
|---|---|---|---|
| 3 | Terminal operations | `reduce(BinaryOperator<T>)` with example `.reduce(0, Integer::sum)` | The example uses `reduce(T identity, BinaryOperator<T>)` |
| 12 | Enumeration | "loose some points" | "lose some points" |
| 16 | Query | "JQL .. Java Persistence Query Language" | JPQL |
| 19 | Service class | `WeatherInformationService` returns `Page<PersonDto> people(...)` | Name and content do not match, e.g. `PersonService` |
