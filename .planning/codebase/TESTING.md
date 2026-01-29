# Testing Patterns

**Analysis Date:** 2026-01-23

## Test Framework

**Runner:**
- Angular/TypeScript: Vitest 4.0.8
- Java: JUnit (bundled with Spring Boot 4.0.0 via spring-boot-starter-webmvc-test)

**Test Assertion Library:**
- TypeScript/Angular: Jasmine (via Angular testing utilities)
- Java: JUnit assertions (via Spring Boot)

**Run Commands:**
```bash
# Frontend (Angular/TypeScript)
npm test                          # Run all tests (Angular default)
npm run test                      # Explicit test command

# Backend (Java/Maven)
mvn test                          # Run all tests
mvn test -Dtest=ClassName        # Run specific test class
mvn test -Dtest=ClassName#method # Run specific test method
```

**Test Configuration Files:**
- Frontend: `tsconfig.spec.json` (TypeScript spec configuration)
- Frontend: `angular.json` with test builder `@angular/build:unit-test`
- Backend: pom.xml with test dependencies

## Test File Organization

**Location:**
- TypeScript: Co-located with source files (same directory structure)
  - `src/app/services/product.service.ts` → `src/app/services/product.service.spec.ts`
  - `src/app/components/product-list/product-list.component.ts` → `src/app/components/product-list/product-list.component.spec.ts`
- Java: Separate source tree structure
  - `src/main/java/com/anh/e_commerce_platform/...` → `src/test/java/com/anh/e_commerce_platform/...`

**Naming:**
- TypeScript: `.spec.ts` suffix (e.g., `product.service.spec.ts`, `cart.component.spec.ts`)
- Java: `ApplicationTests` suffix for integration tests (e.g., `ECommercePlatformApplicationTests.java`)

**Structure:**
```
ecommerce-frontend/
└── src/
    └── app/
        ├── services/
        │   ├── product.service.ts
        │   ├── product.service.spec.ts
        │   ├── cart.service.ts
        │   └── cart.service.spec.ts
        └── components/
            └── product-list/
                ├── product-list.component.ts
                └── product-list.component.spec.ts

e-commerce-platform/ (Java backend)
└── src/
    └── test/
        └── java/
            └── com/anh/e_commerce_platform/
                └── ECommercePlatformApplicationTests.java
```

## Test Structure

**Suite Organization (TypeScript with Jasmine):**
```typescript
import { TestBed } from '@angular/core/testing';
import { ProductService } from './product.service';

describe('Product', () => {
  let service: ProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

**Suite Organization (Component):**
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';

describe('ProductList', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

**Patterns:**
- Setup: `beforeEach()` used for TestBed configuration and service/component initialization
- Async handling: `async` keyword for `beforeEach` when components need async compilation
- Wait for stability: `fixture.whenStable()` for async operations before assertions
- Component detection: Change detection happens automatically in Angular testing

**Java Test Structure:**
```java
@SpringBootTest
class ECommercePlatformApplicationTests {

  @Test
  void contextLoads() {
  }

}
```

- Setup: `@SpringBootTest` annotation for full application context
- Test methods: Single test per class currently
- Assertions: JUnit assertions via Spring Boot testing

## Mocking

**Framework:**
- TypeScript: Jasmine spies built-in; Angular TestBed for service mocking
- Java: Mockito available through Spring Boot Test dependencies (but not used in current code)

**Patterns (TypeScript):**
```typescript
// No mocking currently demonstrated in test files
// Service injected via TestBed without explicit mocking
describe('Product', () => {
  let service: ProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductService);
  });
});
```

**What to Mock:**
- HTTP dependencies (HttpClient calls) - should be mocked for service tests
- External API calls - should be mocked to avoid real network requests
- Database calls - should be mocked in unit tests
- Authentication/Authorization - should be mocked for isolated testing

**What NOT to Mock:**
- Core Angular services (unless testing integration with specific service)
- RxJS operators and Observables (test actual behavior)
- Component template rendering (only mock external dependencies)
- Business logic calculations (test real implementations)

## Fixtures and Factories

**Test Data:**
- Not detected in current test files
- No fixture files or factory patterns observed
- Tests use minimal inline setup

**Location:**
- No dedicated fixtures directory found
- Would typically be in `src/app/testing/` or `src/testing/fixtures/` if used

## Coverage

**Requirements:**
- Not enforced in current configuration
- No coverage thresholds defined in `package.json` or Maven config
- No coverage reports configured

**View Coverage:**
```bash
# To view coverage (if configured)
# ng test --code-coverage
# mvn test jacoco:report
```

## Test Types

**Unit Tests (TypeScript):**
- Scope: Individual service/component testing
- Approach: Jasmine describe/it blocks with TestBed isolation
- Current state: Minimal - only basic instantiation tests
- File locations: `src/app/services/*.spec.ts`, `src/app/components/**/*.spec.ts`

Example: `product.service.spec.ts` - Service instantiation test
```typescript
describe('Product', () => {
  let service: ProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

**Component Tests (TypeScript):**
- Scope: Component creation and initialization
- Approach: TestBed with ComponentFixture
- Current state: Only basic creation tests
- File locations: `src/app/components/**/*.spec.ts`

Example: `product-list.component.spec.ts` - Component instantiation test
```typescript
describe('ProductList', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

**Integration Tests (Java):**
- Scope: Full application context with Spring Boot
- Approach: @SpringBootTest annotation
- Current state: Basic context loading test
- File locations: `src/test/java/com/anh/e_commerce_platform/`

Example: `ECommercePlatformApplicationTests.java`
```java
@SpringBootTest
class ECommercePlatformApplicationTests {

  @Test
  void contextLoads() {
  }

}
```

**E2E Tests:**
- Status: Not implemented
- Framework: None configured
- Would use Cypress, Playwright, or Protractor if added

## Common Patterns

**Async Testing (TypeScript):**
```typescript
beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [ProductListComponent],
  }).compileComponents();

  fixture = TestBed.createComponent(ProductListComponent);
  component = fixture.componentInstance;
  await fixture.whenStable();
});
```

**Error Testing:**
- Not demonstrated in current test files
- Should follow pattern of component/service error handling
- Would test observable error callbacks in subscriptions

**Observables Testing:**
```typescript
// Pattern to test (not yet implemented)
it('should handle subscription errors', (done) => {
  this.productService.getAllProducts().subscribe(
    (data) => {
      expect(data).toBeTruthy();
      done();
    },
    (error) => {
      expect(error).toBeDefined();
      done();
    }
  );
});
```

## Test Execution Flow

**Frontend Test Execution:**
1. Vitest runner processes `.spec.ts` files
2. TestBed configures Angular testing module
3. Component/Service instantiated via TestBed
4. Assertions executed via Jasmine expect()
5. Cleanup via `destroy()` or fixture cleanup

**Backend Test Execution:**
1. Maven surefire plugin runs tests
2. @SpringBootTest loads full application context
3. JUnit @Test method executed
4. Spring context cleaned up after test

## Testing Best Practices (To Implement)

**Current Gaps:**
1. No meaningful assertions beyond instantiation
2. No mocking of HTTP calls or external dependencies
3. No test coverage metrics
4. No E2E tests
5. No fixture/factory data patterns

**Recommended Next Steps:**
- Add meaningful service tests with mocked HTTP calls
- Test component lifecycle and subscription handling
- Add component template rendering tests
- Implement E2E tests for user workflows
- Add test data factories for complex objects
- Configure coverage thresholds

---

*Testing analysis: 2026-01-23*
