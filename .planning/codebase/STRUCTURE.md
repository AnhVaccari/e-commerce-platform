# Codebase Structure

**Analysis Date:** 2026-01-23

## Directory Layout

```
e-commerce-platform/
├── src/
│   ├── main/
│   │   ├── java/com/anh/e_commerce_platform/
│   │   │   ├── ECommercePlatformApplication.java       # Spring Boot entry point
│   │   │   ├── config/                                  # Configuration and initialization
│   │   │   ├── controller/                              # REST API endpoints
│   │   │   ├── dto/                                     # Data transfer objects
│   │   │   ├── entity/                                  # JPA domain models
│   │   │   ├── repository/                              # Data access layer
│   │   │   ├── security/                                # JWT and authentication
│   │   │   └── service/                                 # Business logic
│   │   └── resources/
│   │       ├── application.yml                          # JWT configuration
│   │       └── application.properties                   # Spring properties
│   └── test/
│       └── java/com/anh/e_commerce_platform/
│           └── (Test classes)
├── ecommerce-frontend/                                   # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/                              # Angular components
│   │   │   ├── services/                                # Angular services
│   │   │   ├── interfaces/                              # TypeScript interfaces
│   │   │   └── app.ts                                   # Root component
│   │   └── main.ts                                      # Frontend entry point
│   ├── package.json
│   └── angular.json
├── pom.xml                                              # Maven configuration
├── mvnw / mvnw.cmd                                      # Maven wrapper
└── .planning/                                           # GSD planning documents
    └── codebase/
```

## Directory Purposes

**Backend (Spring Boot):**

**`src/main/java/com/anh/e_commerce_platform/`:**
- Purpose: Main application package containing all backend code
- Contains: Controller, Service, Repository, Entity, DTO, Security, Config classes
- Key files: `ECommercePlatformApplication.java` (entry point)

**`config/`:**
- Purpose: Application configuration and initialization
- Contains: Spring @Configuration classes, CommandLineRunner implementations
- Key files:
  - `DataInitializer.java` - Seeds H2 database on startup with test data

**`controller/`:**
- Purpose: REST API endpoints handling HTTP requests
- Contains: @RestController classes with @RequestMapping endpoints
- Key files:
  - `AuthController.java` - `/api/auth/register`, `/api/auth/login`
  - `ProductController.java` - `/api/products` CRUD and search
  - `OrderController.java` - `/api/orders` CRUD and status updates
  - `CategoryController.java` - `/api/categories` management
  - `UserController.java` - `/api/users` (admin only)

**`service/`:**
- Purpose: Business logic and service implementations
- Contains: @Service classes with core application operations
- Key files:
  - `ProductService.java` - Product operations
  - `OrderService.java` - Order operations with validation
  - `UserService.java` - User CRUD with password encoding
  - `CategoryService.java` - Category operations
  - `UserDetailsServiceImpl.java` - Spring Security user loader

**`repository/`:**
- Purpose: Data access layer using Spring Data JPA
- Contains: JpaRepository interfaces with custom query methods
- Key files:
  - `ProductRepository.java` - Product queries (by category, search)
  - `OrderRepository.java` - Order queries
  - `UserRepository.java` - User queries
  - `CategoryRepository.java` - Category queries
  - `OrderItemRepository.java` - Order item queries

**`entity/`:**
- Purpose: JPA domain models mapped to database tables
- Contains: @Entity classes with Jakarta persistence annotations
- Key files:
  - `Product.java` - Product aggregate (id, name, price, stock, category)
  - `Order.java` - Order aggregate (id, user, status, totalAmount)
  - `OrderItem.java` - Line items in orders
  - `User.java` - User accounts (email, password, role, profile)
  - `Category.java` - Product categories
  - `Role.java` - Enum for user roles (ADMIN, USER)
  - `OrderStatus.java` - Enum for order states (PENDING, CONFIRMED, SHIPPED, DELIVERED)

**`dto/`:**
- Purpose: Request/response objects for API boundaries
- Contains: Plain data classes with validation annotations
- Key files:
  - `LoginRequest.java` - Email and password input
  - `LoginResponse.java` - Token, email, name, role output
  - `RegisterRequest.java` - User registration input
  - `OrderStatusUpdateRequest.java` - Order status update input

**`security/`:**
- Purpose: JWT authentication and authorization
- Contains: Spring Security configuration and JWT utilities
- Key files:
  - `WebSecurityConfig.java` - Security filter chain, role-based access rules
  - `JwtTokenUtil.java` - Token generation, validation, claim extraction
  - `JwtRequestFilter.java` - HTTP filter extracting and validating JWT
  - `UserPrincipal.java` - Spring Security UserDetails adapter for User entity

**`resources/`:**
- Purpose: Application configuration files
- Key files:
  - `application.yml` - JWT secret and expiration settings
  - `application.properties` - Spring application name

**Frontend (Angular):**

**`ecommerce-frontend/src/app/`:**
- Purpose: Angular application root with components, services, interfaces
- Key subdirectories:
  - `components/` - Reusable UI components
  - `services/` - HTTP services and state management
  - `interfaces/` - TypeScript interfaces for domain models

**`ecommerce-frontend/src/app/components/`:**
- Purpose: Angular components for UI
- Key files:
  - `product-list/` - Component displaying products with filtering
  - `cart/` - Shopping cart component

**`ecommerce-frontend/src/app/services/`:**
- Purpose: Angular services for API communication and state
- Key files:
  - `product.service.ts` - HTTP calls to product endpoints
  - `cart.service.ts` - Shopping cart state management
  - `change-detection.service.ts` - Utility for change detection

**`ecommerce-frontend/src/app/interfaces/`:**
- Purpose: TypeScript interfaces matching backend entities
- Key files:
  - `product.interface.ts` - Product type definition
  - `cart.interface.ts` - Cart and item type definitions

## Key File Locations

**Entry Points:**

- Backend: `src/main/java/com/anh/e_commerce_platform/ECommercePlatformApplication.java`
- Frontend: `ecommerce-frontend/src/main.ts`

**Configuration:**

- Backend configuration: `src/main/resources/application.yml`, `src/main/resources/application.properties`
- Frontend configuration: `ecommerce-frontend/angular.json`, `ecommerce-frontend/tsconfig.json`
- Build configuration: `pom.xml` (backend), `ecommerce-frontend/package.json`

**Core Logic:**

- REST endpoints: `src/main/java/com/anh/e_commerce_platform/controller/`
- Business logic: `src/main/java/com/anh/e_commerce_platform/service/`
- Database layer: `src/main/java/com/anh/e_commerce_platform/repository/`
- Domain models: `src/main/java/com/anh/e_commerce_platform/entity/`
- Authentication: `src/main/java/com/anh/e_commerce_platform/security/`

**Testing:**

- Backend tests: `src/test/java/com/anh/e_commerce_platform/`
- Frontend tests: `ecommerce-frontend/src/app/**/*.spec.ts`

## Naming Conventions

**Files:**

- Controller classes: `{Feature}Controller.java` (e.g., ProductController, OrderController)
- Service classes: `{Feature}Service.java` (e.g., ProductService, UserService)
- Repository interfaces: `{Entity}Repository.java` (e.g., ProductRepository, UserRepository)
- Entity classes: `{Model}.java` (e.g., Product.java, Order.java)
- DTO classes: `{Purpose}{Type}.java` (e.g., LoginRequest, LoginResponse)
- Configuration classes: `{Feature}Config.java` or `DataInitializer.java`
- Test classes: `{Class}Tests.java` or `{Class}.spec.ts` (frontend)

**Directories:**

- Feature packages: lowercase plural (e.g., `controller/`, `service/`, `repository/`, `entity/`)
- Domain packages: `com.anh.e_commerce_platform.{layer}`
- Frontend components: kebab-case (e.g., `product-list/`, `cart/`)

**Classes:**

- Controllers: `{Feature}Controller` with @RestController annotation
- Services: `{Feature}Service` with @Service annotation
- Repositories: `{Entity}Repository` extending JpaRepository
- Entities: `{Model}` with @Entity annotation
- DTOs: `{Purpose}{Type}` (Request/Response suffix)

## Where to Add New Code

**New REST Endpoint:**

1. Create method in appropriate controller: `src/main/java/com/anh/e_commerce_platform/controller/{Feature}Controller.java`
2. Add @GetMapping/@PostMapping/@PutMapping/@DeleteMapping with path
3. Call corresponding service method
4. Return ResponseEntity with appropriate HTTP status
5. Add CORS header if needed: `@CrossOrigin(origins = "http://localhost:4200")`

Example:
```java
@PostMapping("/search")
public ResponseEntity<List<Product>> search(@RequestBody SearchRequest request) {
    List<Product> results = productService.search(request);
    return ResponseEntity.ok(results);
}
```

**New Feature (Complete Flow):**

1. Create Entity: `src/main/java/com/anh/e_commerce_platform/entity/{Feature}.java`
   - Add @Entity, @Table annotations
   - Add validation annotations

2. Create Repository: `src/main/java/com/anh/e_commerce_platform/repository/{Feature}Repository.java`
   - Extend JpaRepository<{Entity}, Long>
   - Add custom query methods if needed

3. Create Service: `src/main/java/com/anh/e_commerce_platform/service/{Feature}Service.java`
   - Add @Service annotation
   - Inject repository
   - Implement business logic methods

4. Create Controller: `src/main/java/com/anh/e_commerce_platform/controller/{Feature}Controller.java`
   - Add @RestController, @RequestMapping, @CrossOrigin
   - Inject service
   - Map HTTP endpoints to service methods

5. Create DTOs (if needed): `src/main/java/com/anh/e_commerce_platform/dto/{Feature}{Request|Response}.java`
   - Add validation annotations

**New Service Layer Class:**

Location: `src/main/java/com/anh/e_commerce_platform/service/{Feature}Service.java`

Pattern:
```java
@Service
public class {Feature}Service {
    @Autowired
    private {Entity}Repository {entityVar}Repository;

    public {Entity} create({Entity} entity) {
        // Business logic
        return {entityVar}Repository.save(entity);
    }

    public List<{Entity}> getAll() {
        return {entityVar}Repository.findAll();
    }
}
```

**New Repository Query:**

Location: Add method to `src/main/java/com/anh/e_commerce_platform/repository/{Entity}Repository.java`

Pattern:
```java
// For simple queries, Spring Data JPA derives them from method names
List<{Entity}> findByFieldName(String fieldName);
List<{Entity}> findByFieldNameContainingIgnoreCase(String fieldName);
List<{Entity}> findByFieldNameAndOtherField(String field1, String field2);

// For complex queries, use @Query annotation
@Query("SELECT e FROM {Entity} e WHERE e.field = :value")
List<{Entity}> customQueryMethod(@Param("value") String value);
```

**New Component (Frontend):**

Location: `ecommerce-frontend/src/app/components/{feature-name}/`

Pattern:
1. Create folder: `ecommerce-frontend/src/app/components/{feature-name}/`
2. Create component: `{feature-name}.component.ts`
3. Create template: `{feature-name}.component.html`
4. Create spec: `{feature-name}.component.spec.ts`
5. Inject service from `ecommerce-frontend/src/app/services/`

**New Service (Frontend):**

Location: `ecommerce-frontend/src/app/services/{feature-name}.service.ts`

Pattern:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class {Feature}Service {
  constructor(private http: HttpClient) {}

  get{Feature}s() {
    return this.http.get('/api/{features}');
  }
}
```

## Special Directories

**`target/`:**
- Purpose: Maven build output directory
- Generated: Yes (by Maven build process)
- Committed: No (in .gitignore)
- Contains: Compiled classes, JAR files, Maven artifacts

**`node_modules/`:**
- Purpose: Frontend npm dependencies
- Generated: Yes (by npm install)
- Committed: No (in .gitignore)
- Contains: Angular and TypeScript dependencies

**`.planning/codebase/`:**
- Purpose: GSD codebase analysis documents
- Generated: Yes (by /gsd:map-codebase command)
- Committed: Yes (tracked in git)
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, etc.

**`h2-console/`:**
- Purpose: H2 database web console (development only)
- Accessible: http://localhost:8080/h2-console
- Path: Permitted in security config, not committed

---

*Structure analysis: 2026-01-23*
