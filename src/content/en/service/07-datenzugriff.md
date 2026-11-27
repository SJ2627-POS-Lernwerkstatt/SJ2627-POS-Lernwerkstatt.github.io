---
title: "Data access as an interface: stub or mock"
---

"A data access interface is to be assumed that returns the given model for processing. The data access classes are to be mocked or replaced by stubs in the tests."

The service then does not get its data via the constructor but via an **interface**. There is no implementation with a database – and you do not need one.

## The interface

```java
package businessservice.persistence;

public interface LoanRepository {

    List<Loan> findAll();

    List<Loan> findByMemberName(String name);
}
```

The service gets the interface in its constructor. Lombok writes it: `@RequiredArgsConstructor` generates a constructor with all `final` fields, here `FeeReportService(LoanRepository loanRepository)` ([Entities with Lombok](/jpa/konstruktoren)).

```java
@RequiredArgsConstructor
public class FeeReportService {

    private final LoanRepository loanRepository;

    public int feeFor(String memberName, LocalDate today) {
        List<Loan> loans = loanRepository.findByMemberName(memberName);
        if (loans.isEmpty()) {
            throw new MemberNotFoundException(memberName);
        }
        return loans.stream().mapToInt(loan -> LateFeeService.fee(loan, today)).sum();
    }
}
```

The service does not know where the data comes from. That is exactly what makes it testable.

## Option 1: a stub

A **stub** is a simple implementation that returns fixed data:

```java
LoanRepository stub = new LoanRepository() {
    @Override
    public List<Loan> findAll() {
        return List.of(LOAN_ANNA, LOAN_CARLA);
    }

    @Override
    public List<Loan> findByMemberName(String name) {
        return findAll().stream().filter(l -> l.member().name().equals(name)).toList();
    }
};

FeeReportService service = new FeeReportService(stub);
```

If the interface has only **one** method, a lambda is enough: `LoanSource stub = () -> List.of(LOAN_ANNA);`. You can also create a stub as a class of its own in the test folder, e.g. `InMemoryLoanRepository` with a list in the constructor.

## Option 2: a mock with Mockito

You know Mockito from the module Unit Testing (units 11 and 12):

```java
@ExtendWith(MockitoExtension.class)
class FeeReportServiceTest {

    @Mock
    private LoanRepository loanRepository;

    @InjectMocks
    private FeeReportService service;

    @Test
    void verify_fee_for_member() {
        when(loanRepository.findByMemberName("Anna")).thenReturn(List.of(
                returnedAfter(ANNA, 40), openLoan(ANNA)));

        assertThat(service.feeFor("Anna", START.plusDays(31))).isEqualTo(300);
        verify(loanRepository).findByMemberName("Anna");
    }
}
```

| | Stub | Mock |
|---|---|---|
| effort | a class of its own or an anonymous class | one line `when(…).thenReturn(…)` per call |
| checks calls | no | yes, with `verify` |
| good when … | many tests need the same data | every test needs different data |

Both fulfil the task. With Mockito you are usually faster.

:::achtung Strict stubs
`MockitoExtension` reports a `when(…)` that is never used in the test as an `UnnecessaryStubbingException`. Only set what the service really calls.
:::

:::merke
- Data access = an interface in the constructor of the service, without an implementation.
- Stub: fixed data in an (anonymous) class or a lambda.
- Mock: `@Mock` + `@InjectMocks`, `when … thenReturn`, `verify`.
:::
