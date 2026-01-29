# Codebase Concerns

**Analysis Date:** 2026-01-23

## Security Issues

**Hardcoded JWT Secret:**
- Issue: JWT secret key is hardcoded in plain text in source code
- Files: `src/main/resources/application.yml`
- Current value: `mySecretKeyForPortfolioOnly123456789` (short, weak, and production-unsafe)
- Impact: Token signing key is exposed in version control, making JWT tokens forgeable. Any compromise of source code compromises all authentication.
- Fix approach: Move JWT secret to environment variables or secure configuration management (AWS Secrets Manager, HashiCorp Vault). Minimum 256-bit key required for HS256.
- Severity: CRITICAL

**Default Test Credentials Hardcoded:**
- Issue: Default admin and test user passwords embedded in DataInitializer
- Files: `src/main/java/com/anh/e_commerce_platform/config/DataInitializer.java` (lines 95-96, 110)
- Credentials: admin@ecommerce.com / admin123, john@test.com / password123
- Impact: Creates known default accounts that can be used for unauthorized access in production if DataInitializer runs
- Fix approach: Remove DataInitializer auto-user creation or gate it with profile checks (dev profile only). Use random/forced-change passwords.
- Severity: CRITICAL

**No Server-Side Order Validation:**
- Issue: Explicit TODO comment acknowledging missing server-side validation for orders
- Files: `src/main/java/com/anh/e_commerce_platform/service/OrderService.java` (line 25-26)
- Comment: "TODO: Ajouter server-side validation pour la sécurité. On fait confiance front-end calculation de prix pour l'instant"
- Impact: Order prices are calculated client-side and trusted. Attackers can manipulate order amounts by modifying client-side calculations or API requests.
- Fix approach: Implement server-side price calculation based on current product prices from database. Validate line items and totals before order creation.
- Severity: CRITICAL

**Missing Authorization Checks on Protected Endpoints:**
- Issue: OrderController and ProductController endpoints lack method-level authorization annotations
- Files: `src/main/java/com/anh/e_commerce_platform/controller/OrderController.java`, `src/main/java/com/anh/e_commerce_platform/controller/ProductController.java`
- Current: Only global path-based authorization in WebSecurityConfig. No @PreAuthorize/@PostAuthorize annotations on methods.
- Impact: While security config restricts /api/users to ADMIN, order creation/update lacks explicit authorization. Malicious users could create orders for other users.
- Fix approach: Add @PreAuthorize("hasRole('USER')") on order creation, @PreAuthorize("hasRole('ADMIN')") on status updates, restrict product deletion.
- Severity: HIGH

**H2 Console Enabled in Production Configuration:**
- Issue: H2 database console is permitted in SecurityConfig without environment checks
- Files: `src/main/java/com/anh/e_commerce_platform/security/WebSecurityConfig.java` (line 31)
- Code: `.requestMatchers("/h2-console/**").permitAll()`
- Impact: In-memory database console accessible to anyone in production, exposing database structure and data
- Fix approach: Gate H2 console behind spring.profiles.active checks (dev/test only). Remove from production builds.
- Severity: HIGH

**CORS Allowing Hardcoded Origin:**
- Issue: CORS configuration hardcodes localhost:4200 frontend origin across all controllers
- Files: `src/main/java/com/anh/e_commerce_platform/controller/AuthController.java` (line 22), OrderController, ProductController, UserController
- Pattern: `@CrossOrigin(origins = "http://localhost:4200")`
- Impact: In production, CORS origin should be configurable via environment. Hardcoded localhost allows any request from that single origin.
- Fix approach: Configure CORS origins via application.yml with environment variable substitution. Use application-prod.yml for production settings.
- Severity: MEDIUM

**Console Output for Sensitive Operations:**
- Issue: Sensitive information logged to stdout in production code
- Files: `src/main/java/com/anh/e_commerce_platform/config/DataInitializer.java` (lines 101-102, 116), `src/main/java/com/anh/e_commerce_platform/security/JwtRequestFilter.java` (lines 45, 47)
- Examples: "✅ Utilisateur admin créé : admin@ecommerce.com / admin123", "JWT Token has expired"
- Impact: Passwords and token details printed to application logs/console visible to anyone with server access
- Fix approach: Replace System.out.println with proper logging framework (SLF4J/Logback). Use appropriate log levels. Never log credentials.
- Severity: MEDIUM

**Password Exposed in DataInitializer Output:**
- Issue: User passwords are directly exposed in console output
- Files: `src/main/java/com/anh/e_commerce_platform/config/DataInitializer.java` (lines 101, 116)
- Impact: Default account passwords are visible in server logs during startup
- Fix approach: Remove password from output messages. Log only usernames/emails with "created successfully" message.
- Severity: MEDIUM

---

## Tech Debt

**TODO Comment - Missing Server-Side Validation:**
- Issue: Acknowledged in code but not yet implemented
- Files: `src/main/java/com/anh/e_commerce_platform/service/OrderService.java` (line 25)
- Current state: Frontend price calculations are trusted
- Debt impact: System is vulnerable to order amount manipulation attacks
- Priority: HIGH - Must fix before production

**No Transaction Management:**
- Issue: Critical operations lack @Transactional annotations
- Files: `src/main/java/com/anh/e_commerce_platform/service/OrderService.java` (createOrder method)
- Impact: Order creation touching multiple tables (Order, OrderItems, User verification) lacks ACID guarantees. Partial failures could leave inconsistent data.
- Fix approach: Add @Transactional to service methods that modify multiple entities. Configure rollback rules.
- Severity: HIGH

**No Input Validation on Search:**
- Issue: Search endpoint accepts raw parameter without sanitization
- Files: `src/main/java/com/anh/e_commerce_platform/controller/ProductController.java` (line 61)
- Code: `public ResponseEntity<List<Product>> searchProducts(@RequestParam String name)`
- Impact: SQL injection vulnerable if ProductService uses string concatenation in queries
- Fix approach: Use parameterized queries (Spring Data methods do this). Add length limits to search parameter.
- Severity: MEDIUM

**Direct Private Field Access in Cart Component:**
- Issue: Angular component directly accesses private field of service using bracket notation
- Files: `ecommerce-frontend/src/app/components/cart/cart.component.ts` (line 60)
- Code: `this.cartService['cartSubject'].next(this.cartItems)`
- Impact: Violates encapsulation, brittle coupling to internal implementation details, breaks if service refactored
- Fix approach: Add public method in CartService like `updateCart()` to handle quantity changes properly
- Severity: MEDIUM

**No Password Strength Validation:**
- Issue: No minimum requirements enforced for passwords
- Files: `src/main/java/com/anh/e_commerce_platform/dto/RegisterRequest.java`, `src/main/java/com/anh/e_commerce_platform/entity/User.java`
- Current: Only @NotBlank validation on password field
- Impact: Users can register with weak passwords like "password123" (example used in default data)
- Fix approach: Add @Size(min=8), custom @PasswordStrength validator requiring uppercase, number, special char
- Severity: MEDIUM

---

## Fragile Areas

**Cart State Management:**
- Component: `ecommerce-frontend/src/app/components/cart/cart.component.ts`, `ecommerce-frontend/src/app/services/cart.service.ts`
- Why fragile: Cart is purely in-memory local state. No persistence layer. Clearing browser or reloading page loses cart.
- Risk: User experience degradation. Cart data is lost on navigation.
- Safe modification: Add localStorage persistence to CartService. Implement cart recovery on component init.
- Test coverage: No unit tests for CartService (verified in test count)

**Order Creation:**
- Component: `src/main/java/com/anh/e_commerce_platform/service/OrderService.java`
- Why fragile: Accepts Order entity directly without validation. Relies on frontend price calculations. No atomic transaction.
- Risk: Invalid orders, data inconsistency, price manipulation
- Safe modification: Create OrderCreateDTO with validation. Recalculate prices server-side. Add @Transactional.
- Test coverage: No unit tests found for OrderService

**JWT Token Validation:**
- Component: `src/main/java/com/anh/e_commerce_platform/security/JwtTokenUtil.java`, `src/main/java/com/anh/e_commerce_platform/security/JwtRequestFilter.java`
- Why fragile: Only validates token expiration and username match. No revocation list. Weak secret key.
- Risk: Compromised tokens remain valid. Token theft leads to permanent unauthorized access.
- Safe modification: Implement token revocation (blacklist or refresh token pattern). Rotate secret on compromise.
- Test coverage: No unit tests for JWT components

**No Exception Handling Consistency:**
- Component: All controllers and services
- Why fragile: Mix of try-catch returning ResponseEntity and throw IllegalArgumentException
- Risk: Inconsistent error responses. Some errors expose internal details in exception messages.
- Safe modification: Implement global @ControllerAdvice with exception handling strategy. Map exceptions to safe HTTP responses.
- Test coverage: Error paths not tested

---

## Performance Bottlenecks

**No Database Indexes:**
- Issue: No explicit indexes defined on frequently queried columns
- Files: Entity classes use standard @Column without indexes
- Potential problems: Email lookups in User (emailExists, getUserByEmail), category filters on Product
- Impact: Full table scans on every login attempt. Sluggish search/filter operations.
- Improvement path: Add @Index annotations on User.email, Product.category_id. Add composite indexes for search.
- Severity: MEDIUM - Not critical for small datasets but degrades quickly

**No Caching Layer:**
- Issue: Every product/category request hits database
- Files: `src/main/java/com/anh/e_commerce_platform/service/ProductService.java`, CategoryService
- Impact: High database load for read-heavy operations (product listing, filtering)
- Improvement path: Add @Cacheable to getAllProducts, getProductsByCategory. Implement cache invalidation on updates.
- Severity: MEDIUM

**Eager Fetch on Order-User Relationship:**
- Issue: Order entity uses FetchType.EAGER for User relationship
- Files: `src/main/java/com/anh/e_commerce_platform/entity/Order.java` (line 27)
- Impact: Every order query loads associated user data. N+1 queries if fetching multiple orders.
- Improvement path: Change to FetchType.LAZY. Use explicit joins in queries when user data needed.
- Severity: MEDIUM

**ChangeDetectorRef Overuse:**
- Issue: Angular components manually trigger change detection on every update
- Files: `ecommerce-frontend/src/app/components/product-list/product-list.component.ts` (lines 38, 54, 73, 79, 98, 104)
- Impact: Bypasses Angular's zone.js optimization. Full component tree change detection on each API response.
- Improvement path: Use OnPush change detection strategy. Let Angular handle detection naturally. Remove manual cdr.detectChanges().
- Severity: LOW - Performance impact minimal for current scale

---

## Missing Error Handling

**No Global Exception Handler:**
- Issue: Controllers catch exceptions and return generic responses
- Files: `src/main/java/com/anh/e_commerce_platform/controller/AuthController.java` (lines 55-58, 89-92)
- Impact: Inconsistent error response formats. Exception messages leak internal details.
- Fix approach: Create @ControllerAdvice with @ExceptionHandler methods. Return standardized error DTO.
- Severity: MEDIUM

**Async Operations Without Error Handling in Frontend:**
- Issue: Some service subscriptions lack error handlers
- Files: `ecommerce-frontend/src/app/components/product-list/product-list.component.ts` (line 42)
- Code: loadCategories() doesn't set errorMessage on error
- Impact: Silent failures. UI doesn't inform user of category loading failures.
- Fix approach: Add error handler in all subscribe calls. Set error messages for user feedback.
- Severity: MEDIUM

---

## Testing Gaps

**No Backend Unit Tests:**
- Issue: No @SpringBootTest or unit tests found for Java backend
- Services without tests: OrderService, ProductService, UserService, CategoryService
- Files affected: All files in `src/main/java/com/anh/e_commerce_platform/service/`
- Risk: Business logic untested. Regressions during refactoring undetected.
- Priority: HIGH - Add tests for core business logic (order creation, validation, search)

**Minimal Frontend Test Coverage:**
- Issue: Only 6 test files for entire Angular codebase
- Test files found: app.spec.ts, cart.spec.ts, change-detection.service.spec.ts, product-list.spec.ts, cart.service.spec.ts, product.service.spec.ts
- Coverage areas: No test files for auth, order components, or full integration flows
- Risk: Component logic untested. Service integration failures undetected.
- Priority: HIGH - Add tests for cart interactions, product filtering, auth service

**No Integration Tests:**
- Issue: No tests validating API contract between frontend and backend
- Impact: Changes to API structure not caught until manual testing
- Priority: MEDIUM - Add integration tests for critical flows (login → add to cart → order)

**No E2E Tests:**
- Issue: Complete user flows not validated automatically
- Impact: Functional regressions require manual testing
- Priority: MEDIUM - Add Cypress/Protractor tests for critical paths

---

## Dependencies at Risk

**Spring Boot 4.0.0 (Latest Major):**
- Risk: Very recent version. Fewer production deployments. Potential undiscovered bugs.
- Current impact: Mitigated by stable dependencies (JPA, Security stable)
- Migration plan: Monitor for 4.0.1+ patches. Test thoroughly before production.
- Severity: LOW

**H2 Database Runtime Scope:**
- Risk: In-memory database suitable only for development/testing
- Current impact: No persistence. All data lost on restart. No production-ready.
- Migration plan: Replace with PostgreSQL/MySQL for production. Add separate H2 profile for testing.
- Severity: HIGH - Must migrate for production

---

## Configuration Issues

**Environment Configuration Not Externalized:**
- Issue: Database, JWT secret, CORS origins hardcoded or in single application.yml
- Files: `src/main/resources/application.yml`, controllers with hardcoded CORS
- Current state: No environment-specific profiles (application-prod.yml, application-dev.yml)
- Impact: Cannot safely deploy to different environments without modifying source
- Fix approach: Create application-prod.yml, application-dev.yml. Use environment variables for secrets.
- Severity: HIGH

**Missing Health and Readiness Probes:**
- Issue: No Spring Boot Actuator endpoints for deployment
- Impact: Kubernetes/load balancers cannot determine if app is healthy/ready
- Fix approach: Add spring-boot-starter-actuator. Configure management endpoints.
- Severity: MEDIUM - Not urgent for current scale

---

## Production Readiness

**System Not Production-Ready:**
- Issues: Hardcoded secrets, test data auto-seeding, in-memory database, debug logging
- Blocked on:
  1. Moving JWT secret to environment
  2. Removing default admin/user creation from DataInitializer
  3. Replacing H2 with real database
  4. Adding server-side order validation
  5. Removing H2 console access
  6. Setting production CORS configuration
- Timeline: 1-2 weeks estimated for critical fixes

---

*Concerns audit: 2026-01-23*
