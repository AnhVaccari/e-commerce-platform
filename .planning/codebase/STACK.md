# Technology Stack

**Analysis Date:** 2026-01-23

## Languages

**Primary:**
- Java 21 - Backend (Spring Boot) services and business logic

**Secondary:**
- TypeScript 5.9.2 - Angular frontend application
- HTML/CSS - Frontend templates and styling

## Runtime

**Environment:**
- Java Runtime Environment (JRE) 21 - Backend
- Node.js (via npm) - Frontend development and build

**Package Manager:**
- Maven 3.9.12 - Java dependencies and build automation
  - Lockfile: `pom.xml`
- npm 10.8.2 - Node.js dependencies
  - Lockfile: `package-lock.json` in `ecommerce-frontend/`

## Frameworks

**Core Backend:**
- Spring Boot 4.0.0 - RESTful API framework and application server
- Spring Data JPA - Object-relational mapping and database layer
- Spring Security 4.0.0 - Authentication and authorization

**Core Frontend:**
- Angular 21.0.0 - Component-based UI framework
- RxJS 7.8.0 - Reactive programming library for async operations
- Angular Router - Client-side routing

**Testing:**
- JUnit Jupiter - Java test framework (via spring-boot-starter-*-test)
- Vitest 4.0.8 - Frontend unit test runner
- JSDOM 27.1.0 - DOM implementation for Node.js testing

**Build/Dev:**
- Angular CLI 21.0.1 - Frontend build tooling and development server
- Spring Boot Maven Plugin - Spring Boot application packaging
- TypeScript Compiler - TypeScript compilation to JavaScript

## Key Dependencies

**Critical Backend:**
- jjwt (JSON Web Token) 0.12.3
  - jjwt-api - JWT token creation and validation
  - jjwt-impl - JWT implementation
  - jjwt-jackson - Jackson integration for JWT
  - Why: Implements JWT-based authentication for API endpoints

- spring-boot-starter-security
  - Why: Provides authentication framework, BCryptPasswordEncoder, and security filters

- spring-boot-h2console
  - Why: H2 database console for development database inspection

- h2 (H2 Database)
  - Why: Embedded in-memory/file-based relational database for development/testing

**Infrastructure:**
- spring-boot-starter-data-jpa
  - Why: Hibernate ORM and persistence layer
- spring-boot-starter-webmvc
  - Why: Spring MVC for REST controller support and HTTP handling
- spring-boot-starter-validation
  - Why: Bean validation (Jakarta Validation) for request/entity validation

**Frontend:**
- @angular/common - Angular common utilities
- @angular/forms - Reactive and template-driven form handling
- @angular/platform-browser - DOM manipulation and bootstrap
- tslib 2.3.0 - TypeScript helper library runtime

## Configuration

**Environment:**
- Application properties: `src/main/resources/application.properties`
- Application YAML config: `src/main/resources/application.yml`
- JWT configuration: Defined in `src/main/resources/application.yml`
  - `jwt.secret` - HMAC secret key for token signing
  - `jwt.expiration` - Token expiration time (86400000ms = 24 hours)

**Build:**
- Maven POM: `pom.xml` (backend)
- Angular configuration: `angular.json` (frontend)
- TypeScript config: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json` (frontend)
- Prettier formatting config: Defined in `ecommerce-frontend/package.json`
  - printWidth: 100 characters
  - singleQuote: true for string literals
  - Angular HTML parser for `*.html` files

## Platform Requirements

**Development:**
- Java 21 (JDK)
- Maven 3.9.12+
- Node.js with npm 10.8.2+
- Git for version control

**Backend Runtime:**
- Java 21 Runtime
- Spring Boot 4.0.0 runtime
- Minimum 512MB heap memory (adjustable via JVM flags)

**Frontend Build:**
- Node.js LTS with npm
- Angular CLI 21.0.1+ globally or via npx

**Production:**
- Java 21 Runtime (backend JAR artifact)
- Static file server or reverse proxy (for compiled Angular frontend)
- H2 database can be configured for file-based persistence or replaced with PostgreSQL/MySQL

---

*Stack analysis: 2026-01-23*
