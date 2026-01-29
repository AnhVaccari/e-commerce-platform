# Architecture

**Analysis Date:** 2026-01-23

## Pattern Overview

**Overall:** Layered MVC (Model-View-Controller) with separation of concerns through Spring Boot best practices.

**Key Characteristics:**
- Clean separation of HTTP concerns (Controller), business logic (Service), and data access (Repository)
- Security layer with JWT token-based authentication
- RESTful API design with Spring Web
- JPA-based persistence with H2 in-memory database
- Frontend Angular application with standalone components

## Layers

**Presentation Layer (Controllers):**
- Purpose: Handle HTTP requests, validate input, return responses
- Location: `src/main/java/com/anh/e_commerce_platform/controller/`
- Contains: RestController classes with @RequestMapping endpoints
- Depends on: Service layer
- Used by: HTTP clients (Angular frontend)
- Key files:
  - `ProductController.java` - Product CRUD endpoints
  - `OrderController.java` - Order management endpoints
  - `AuthController.java` - Authentication (register/login)
  - `CategoryController.java` - Category management
  - `UserController.java` - User management

**Service Layer:**
- Purpose: Implement business logic, transactions, and orchestration
- Location: `src/main/java/com/anh/e_commerce_platform/service/`
- Contains: @Service classes with business methods
- Depends on: Repository layer, PasswordEncoder
- Used by: Controller layer
- Key files:
  - `ProductService.java` - Product business logic (create, search, filter by category)
  - `OrderService.java` - Order creation with user validation
  - `UserService.java` - User CRUD with password encoding
  - `CategoryService.java` - Category management
  - `UserDetailsServiceImpl.java` - Spring Security integration for loading users

**Data Access Layer (Repository):**
- Purpose: Database interaction via Spring Data JPA
- Location: `src/main/java/com/anh/e_commerce_platform/repository/`
- Contains: JpaRepository interfaces with custom query methods
- Depends on: Entity models
- Used by: Service layer
- Key files:
  - `ProductRepository.java` - Product queries (by category, search by name)
  - `OrderRepository.java` - Order queries
  - `UserRepository.java` - User queries (by email, existence checks)
  - `CategoryRepository.java` - Category queries
  - `OrderItemRepository.java` - OrderItem queries

**Entity Layer:**
- Purpose: Domain models mapped to database tables
- Location: `src/main/java/com/anh/e_commerce_platform/entity/`
- Contains: @Entity classes with JPA annotations
- Depends on: Nothing (pure domain objects)
- Used by: Service and Repository layers
- Key entities:
  - `Product.java` - Product aggregate with category reference
  - `Order.java` - Order aggregate with user and status
  - `OrderItem.java` - Line items in orders
  - `User.java` - User account with roles
  - `Category.java` - Product categories
  - `Role.java` - User roles enum (ADMIN, USER)
  - `OrderStatus.java` - Order status enum (PENDING, CONFIRMED, SHIPPED, DELIVERED)

**Security Layer:**
- Purpose: JWT authentication and authorization
- Location: `src/main/java/com/anh/e_commerce_platform/security/`
- Contains: JWT utilities, filters, and security configuration
- Depends on: User service, Spring Security
- Used by: Spring Security framework
- Key files:
  - `WebSecurityConfig.java` - Security configuration, filter chain, role-based access
  - `JwtTokenUtil.java` - JWT token generation and validation
  - `JwtRequestFilter.java` - HTTP filter for extracting and validating JWT tokens
  - `UserPrincipal.java` - Spring Security UserDetails implementation

**Data Transfer Layer:**
- Purpose: Request/response objects for API boundaries
- Location: `src/main/java/com/anh/e_commerce_platform/dto/`
- Contains: @Data classes with validation annotations
- Depends on: Entity models (for mapping)
- Used by: Controllers
- Key files:
  - `LoginRequest.java` - Credentials input
  - `LoginResponse.java` - Token and user info output
  - `RegisterRequest.java` - User registration input
  - `OrderStatusUpdateRequest.java` - Order status update input

**Configuration Layer:**
- Purpose: Application startup and data initialization
- Location: `src/main/java/com/anh/e_commerce_platform/config/`
- Contains: Spring @Configuration and CommandLineRunner classes
- Depends on: Repository and Service layers
- Used by: Spring Boot startup
- Key files:
  - `DataInitializer.java` - Seeds database with test data (products, categories, users)

## Data Flow

**Product Retrieval:**

1. Client requests `GET /api/products`
2. `ProductController.getAllProducts()` receives request
3. Controller calls `ProductService.getAllProducts()`
4. Service calls `ProductRepository.findAll()`
5. Repository executes JPA query against H2 database
6. Results returned as List<Product> back through layers
7. Controller returns 200 OK with product JSON array

**Product Search with Filter:**

1. Client requests `GET /api/products/category/{categoryId}`
2. `ProductController.getProductsByCategory()` validates category exists
3. Calls `ProductService.getProductsByCategory(category)`
4. Service calls `ProductRepository.findByCategory(category)`
5. Custom JPA query filters products by category foreign key
6. Results returned as JSON list

**User Authentication Flow:**

1. Client posts credentials to `POST /api/auth/login`
2. `AuthController.login()` receives LoginRequest with email and password
3. Controller calls `authenticationManager.authenticate()` with UsernamePasswordAuthenticationToken
4. Authentication manager loads user via `UserDetailsServiceImpl.loadUserByUsername()`
5. Service calls `UserRepository.findByEmail(email)`
6. Password validation occurs via Spring Security (BCrypt comparison)
7. If valid, `JwtTokenUtil.generateToken()` creates JWT token
8. Token and user info returned in LoginResponse (200 OK)

**Protected Request with JWT:**

1. Client sends request with `Authorization: Bearer {token}` header
2. `JwtRequestFilter` intercepts request
3. Filter extracts JWT token from header (removes "Bearer " prefix)
4. Calls `JwtTokenUtil.getUsernameFromToken()` to extract email from token
5. Calls `UserDetailsServiceImpl.loadUserByUsername()` to fetch user details
6. Validates token hasn't expired and matches user via `JwtTokenUtil.validateToken()`
7. If valid, creates `UsernamePasswordAuthenticationToken` and sets in SecurityContext
8. Request continues to protected endpoint with authentication context set
9. If invalid, request continues without authentication (may fail at endpoint level)

**Order Creation:**

1. Client posts order to `POST /api/orders`
2. `OrderController.createOrder()` receives Order object
3. Controller calls `OrderService.createOrder(order)`
4. Service validates user exists via `UserService.getUserById()`
5. Replaces partial user object with full entity from database
6. Calls `OrderRepository.save()` to persist
7. Order persisted with PENDING status (set in Order constructor)
8. Response returned with 200 OK and created order

**State Management:**

- Stateless HTTP - no session storage (SessionCreationPolicy.STATELESS)
- Each request includes JWT token in Authorization header
- Server validates token on each request without storing session state
- Supports horizontal scaling (no server affinity required)

## Key Abstractions

**UserDetails (Spring Security):**
- Purpose: Bridge between User entity and Spring Security authentication
- Examples: `UserPrincipal.java`
- Pattern: Adapter pattern - wraps User entity in Spring Security interface

**JPA Repositories:**
- Purpose: Provide database query abstraction
- Examples: `ProductRepository.java`, `UserRepository.java`
- Pattern: Data Mapper pattern - maps entities to/from database

**Service Layer:**
- Purpose: Encapsulate business rules and transactions
- Examples: `ProductService.java`, `UserService.java`
- Pattern: Facade pattern - simplifies complex operations for controllers

**DTOs:**
- Purpose: Decouple API contracts from entity models
- Examples: `LoginRequest.java`, `LoginResponse.java`
- Pattern: Transfer Object pattern - shapes data for HTTP boundaries

## Entry Points

**Spring Boot Application:**
- Location: `src/main/java/com/anh/e_commerce_platform/ECommercePlatformApplication.java`
- Triggers: `java -jar` or IDE Run
- Responsibilities: Starts Spring application context, loads all beans, initializes database

**Data Initializer:**
- Location: `src/main/java/com/anh/e_commerce_platform/config/DataInitializer.java`
- Triggers: Spring startup (CommandLineRunner executes after context initialization)
- Responsibilities: Seeds database with test categories, products, and default user accounts

**Rest Controllers:**
- Entry points for HTTP requests
- Trigger: HTTP requests to `/api/` paths
- Responsibilities: Receive requests, validate input, call services, return responses

## Error Handling

**Strategy:** Exception handling at controller level with ResponseEntity for HTTP status codes.

**Patterns:**
- Controllers catch exceptions and return appropriate HTTP status codes (400, 404, 401, 500)
- IllegalArgumentException used for business rule violations (user not found, etc.)
- BadCredentialsException thrown by Spring Security for auth failures
- Validation happens via Jakarta validation annotations (@NotBlank, @Email, @Positive) on entities and DTOs

**Example from OrderController:**
```java
try {
    Order updatedOrder = orderService.updateOrderStatus(id, request.getStatus());
    return ResponseEntity.ok(updatedOrder);
} catch (IllegalArgumentException e) {
    return ResponseEntity.notFound().build();
}
```

## Cross-Cutting Concerns

**Logging:**
- System.out.println used for data initialization logging
- Spring default logging for framework events
- No centralized logging framework

**Validation:**
- Jakarta validation annotations on entities and DTOs
- Server-side validation in controllers and services
- TODO in OrderService indicates need for price validation server-side

**Authentication:**
- Spring Security filters request chain
- JWT tokens in Authorization header
- Stateless session policy

**CORS:**
- @CrossOrigin annotations on controllers allow Angular frontend
- Currently allows http://localhost:4200

---

*Architecture analysis: 2026-01-23*
