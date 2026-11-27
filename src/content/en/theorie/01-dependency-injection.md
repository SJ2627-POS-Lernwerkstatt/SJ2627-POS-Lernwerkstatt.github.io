---
title: "Theory question: dependency injection"
---

This is how the question could be asked:

> A colleague creates every object their `OrderService` needs with `new` and wonders why the class is so hard to test. Explain to them what **dependency injection** would change here: who takes on which job, and how does Spring do it for you? Back up your explanation with a few lines of code.

The basics are in [What does Spring actually do for me?](/fundament/spring-di). Here it is about **writing a good answer**.

## Writing exercise

Take **5 minutes**, write your answer in key points (phone note or paper) and only then compare with the sample answer below. Copying gets you nothing – remembering gets you the points.

## What belongs in the answer

1. **Definition:** an object does not create its dependencies itself (`new`), but gets them passed in **from outside**.
2. **The problem without DI:** tight coupling. Whoever calls `new MySqlBookRepository()` themselves cannot replace the implementation – neither for a test nor for another database.
3. **Parts:**
   - **dependency** (service) – usually described by an interface,
   - **client** – the class that needs the dependency,
   - **injector / container** – builds the objects and passes them on (in Spring: the ApplicationContext, the objects are called **beans**).
4. **Kinds:** constructor injection (recommended), setter injection, field injection (`@Autowired` on the field – avoid).
5. **Example** in Spring.
6. **Benefit:** replaceability, testability (mock instead of the real class), loose coupling, one central place that plugs the application together.

## Sample answer

> With **dependency injection** a class does not create the objects it depends on itself, but gets them passed in from outside – usually via the constructor. Without DI, a `BookService`, for example, would build its repository itself with `new JpaBookRepository()`. Then it is tightly coupled to this implementation and cannot be tested in isolation.
>
> Three roles are involved: the **dependency** (e.g. `BookRepository`, described by an interface), the **client** that uses it (`BookService`), and the **injector** or **container** that creates and connects all objects. In Spring Boot this is the ApplicationContext: classes with `@Service`, `@Repository`, `@RestController` or `@Component` are created as **beans** at startup and passed in wherever a constructor asks for them.
>
> ```java
> @Service
> public class BookService {
>     private final BookRepository repository;
>
>     public BookService(BookRepository repository) {   // constructor injection
>         this.repository = repository;
>     }
> }
> ```
>
> Advantages: loose coupling (the service only knows the interface), replaceability and above all **testability** – in the unit test I pass in a mock (`@Mock`/`@InjectMocks`, in the controller test `@MockitoBean`). Constructor injection is the recommended way because the dependencies can be `final` and the object never exists without them.

:::pruefung
Checklist – have you …
- defined DI in **one sentence** ("passed in from outside instead of creating it yourself")?
- named the **problem** (tight coupling, hard to test)?
- named the three **roles** (dependency, client, injector/container)?
- made **Spring** concrete (beans, `@Service`, constructor injection, `@RequiredArgsConstructor`)?
- given a **code example**?
- mentioned the **benefit for testing** (mock)?
:::
