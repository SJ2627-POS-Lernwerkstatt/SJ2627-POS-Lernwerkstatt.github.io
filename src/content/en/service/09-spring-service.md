---
title: The service in Spring
---

In Task 2 the service is plain Java. In a real application – and in Task 3 – **Spring** manages the objects: it creates the service and passes it the repository and the rules.

## `@Service` and constructor injection

```java
@Service
@RequiredArgsConstructor
public class FeeReportService {

    private final LoanRepository loanRepository;
    private final FeeRules rules;
}
```

- `@Service` makes the class a **bean**: Spring creates exactly one object of it.
- `@RequiredArgsConstructor` (Lombok) generates the constructor with all `final` fields. If the class has exactly one constructor, Spring passes the matching beans there. No `@Autowired` is needed.
- The fields are `final`: after the constructor nothing changes any more.

:::achtung Every dependency needs a bean
If `LoanRepository` has no implementation, the Spring context does not start – and the test `contextLoads` from the seed project fails:

```text
Parameter 0 of constructor in businessservice.service.FeeReportService
required a bean of type 'businessservice.persistence.LoanRepository' that could not be found.
```

In Task 2 you therefore do without `@Service`, or you create a simple implementation with `@Repository` that returns empty lists. With Spring Data JPA the repository interface itself is the bean.
:::

`FeeRules` needs a bean as well, for example with `@Component` on the class.

## `@Transactional`

In a project with Spring Data JPA, every service method that changes data runs in a transaction:

```java
@Service
@Transactional(readOnly = true)
public class LoanService {

    @Transactional
    public Loan returnBook(Long loanId, LocalDate on) { ... }
}
```

- On the class `readOnly = true` for all reading methods.
- On methods that write, `@Transactional` without `readOnly`. If the method fails with a `RuntimeException`, everything is rolled back.
- In the subproject `Aufgabe2_BusinessService` there is no `@Transactional` – Spring Data JPA is missing there, and there is nothing to save.

## DTOs as records

The service does not hand out the data classes but a **DTO** (*data transfer object*) with exactly what the caller needs:

```java
public record FeeDto(String member, double euros, int openLoans) {
}
```

```java
public FeeDto feeFor(String memberName, LocalDate today) {
    List<Loan> loans = loanRepository.findByMemberName(memberName);
    if (loans.isEmpty()) {
        throw new MemberNotFoundException(memberName);
    }
    int cents = loans.stream().mapToInt(loan -> rules.fee(loan, today)).sum();
    long open = loans.stream().filter(loan -> loan.returned().isEmpty()).count();
    return new FeeDto(memberName, cents / 100.0, (int) open);
}
```

- The mapping (data class → DTO) is in **one** place, in the service or in a static method `FeeDto.from(...)`.
- The controller in Task 3 returns the DTO as JSON. That way internal fields, such as the whole list of loans, never leave the service.
- Euros as `double` are only for display here. Calculations still use cents.

:::merke
- `@Service` + one constructor = constructor injection, fields `final`.
- Every dependency needs a bean, otherwise the context does not start.
- `@Transactional(readOnly = true)` on the class, `@Transactional` on writing methods (only with Spring Data JPA).
- DTOs as records towards the outside, mapping in one place.
:::
