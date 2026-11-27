---
title: Testing Spring services
---

A service test needs **no** Spring context and no database. Mockito replaces the repositories, and the test runs in milliseconds.

## The structure

```java
@ExtendWith(MockitoExtension.class)
class FeeReportServiceTest {

    @Mock
    private LoanRepository loanRepository;

    @Spy
    private FeeRules rules = new FeeRules();

    @InjectMocks
    private FeeReportService service;
}
```

- `@Mock` for the repository: every method returns an empty list, `null` or `0` until you set something.
- `@Spy` for the real rules: a real object that Mockito still puts into the service.
- `@InjectMocks` creates the service via its constructor with mock and spy.

No `@SpringBootTest`, no `@DataJpaTest`: the service is a normal class.

:::achtung Missing parameters become `null`
`@InjectMocks` takes the constructor with the **most** parameters. For a parameter for which there is neither a `@Mock` nor a `@Spy`, Mockito passes `null` – without a warning. If the `@Spy` is missing here, the test only fails later with `NullPointerException: … because "this.rules" is null`.
:::

## Good case, error case, calls

```java
@Test
void verify_fee_dto() {
    when(loanRepository.findByMemberName("Anna")).thenReturn(List.of(
            new Loan(ANNA, MALINA, START, START.plusDays(40)),
            new Loan(ANNA, MALINA, START, null)));

    FeeDto dto = service.feeFor("Anna", START.plusDays(31));

    assertThat(dto).isEqualTo(new FeeDto("Anna", 3.0, 1));
    verify(loanRepository).findByMemberName("Anna");
}

@Test
void verify_unknown_member() {
    when(loanRepository.findByMemberName("Zoe")).thenReturn(List.of());

    assertThatThrownBy(() -> service.feeFor("Zoe", START))
            .isInstanceOf(MemberNotFoundException.class)
            .hasMessage("no loans for member Zoe");
}
```

- **Good case**: the DTO is compared as a whole – records have `equals`.
- **Error case**: the repository returns nothing, the service throws its own exception.
- `verify` checks that the service asked the repository with the right name.

## Checking writing methods

If the service changes something, you check with `verify` and an `ArgumentCaptor` **what** was saved (Unit Testing, unit 12):

```java
verify(loanRepository).save(captor.capture());
assertThat(captor.getValue().returnedOn()).isEqualTo(TODAY);
```

## Which tests belong to it?

| Case | Example |
|---|---|
| good case | a member with fees |
| edge case | a member without fees, an open loan |
| error case | unknown member, invalid date |

The grading of Task 3 demands these three kinds too. The controller tests there use the service itself as a mock – so you test the service here.

:::merke
- `@ExtendWith(MockitoExtension.class)`, `@Mock` for repositories, `@InjectMocks` for the service.
- Pass real helper classes as `@Spy` or directly with `new`.
- Good cases, edge cases and error cases; `verify` for calls.
:::
