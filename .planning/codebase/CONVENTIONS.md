# Coding Conventions

**Analysis Date:** 2026-01-23

## Naming Patterns

**Files:**
- Java files: PascalCase, one class per file (e.g., `Product.java`, `ProductController.java`)
- TypeScript files: kebab-case for components/services (e.g., `product-list.component.ts`, `cart.service.ts`)
- Interface files: kebab-case with `.interface.ts` suffix (e.g., `product.interface.ts`, `cart.interface.ts`)
- Test files: same name as source with `.spec.ts` suffix (e.g., `product.service.spec.ts`)

**Functions/Methods (Java):**
- camelCase for method names
- Descriptive verb-based names: `getAllProducts()`, `getProductById()`, `createProduct()`, `deleteProduct()`
- Boolean getters use `is` or `get` prefix: `emailExists()`, `isTokenExpired()`
- Private methods use camelCase with `is` or helper names: `isTokenExpired()`, `getSigningKey()`, `getAllClaimsFromToken()`

**Functions/Methods (TypeScript):**
- camelCase for method names
- Descriptive action names: `loadProducts()`, `addToCart()`, `onSearch()`, `onCategoryFilter()`
- Lifecycle hooks follow Angular conventions: `ngOnInit()`, `ngOnDestroy()`
- Component event handlers use `on` prefix: `onSearch()`, `onCategoryFilter()`

**Variables:**
- Java: camelCase for all local variables, fields, and parameters
- TypeScript: camelCase for variables; use `readonly` for constants
- Angular component properties: public camelCase (e.g., `products`, `isLoading`, `errorMessage`, `selectedCategoryId`)
- Angular private properties: camelCase with `private` keyword (e.g., `private cartSubject`, `private cartItems`)

**Classes/Interfaces:**
- Java: PascalCase for all classes (e.g., `Product`, `ProductService`, `AuthController`)
- TypeScript: PascalCase for classes (e.g., `ProductListComponent`, `CartService`)
- TypeScript interfaces: PascalCase with no prefix (e.g., `Product`, `Category`, `CartItem`)

**Constants:**
- Java: UPPER_SNAKE_CASE (spring.boot managed)
- TypeScript/Angular: UPPER_SNAKE_CASE not commonly used; `readonly` properties preferred

## Code Style

**Formatting:**
- Java: 4-space indentation (standard)
- TypeScript: 2-space indentation (Angular CLI default)
- Line length: 100 characters (preferred in prettier config for frontend)
- No trailing semicolons enforced in TypeScript (Angular convention with Prettier)

**Linting:**
- Java: Spring Boot conventions, no explicit linter configuration found
- TypeScript: Prettier configured via `package.json` with `printWidth: 100`, `singleQuote: true`
- Angular HTML: Prettier with angular parser applied

**Prettier Configuration (Frontend):**
```json
{
  "printWidth": 100,
  "singleQuote": true,
  "overrides": [
    {
      "files": "*.html",
      "options": {
        "parser": "angular"
      }
    }
  ]
}
```

## Import Organization

**Java Order:**
1. Package declaration
2. Import jakarta.* (JEE/Spring Boot)
3. Import java.*
4. Import org.springframework.*
5. Import custom classes (com.anh.*)

Example from `ProductController.java`:
```java
package com.anh.e_commerce_platform.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.anh.e_commerce_platform.entity.Category;
import com.anh.e_commerce_platform.entity.Product;
import com.anh.e_commerce_platform.service.CategoryService;
import com.anh.e_commerce_platform.service.ProductService;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
```

**TypeScript Order:**
1. Angular imports
2. RxJS imports
3. Local interfaces/types
4. Local services
5. Local components

Example from `ProductListComponent`:
```typescript
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Category, Product } from '../../interfaces/product.interface';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { FormsModule } from '@angular/forms';
```

**Path Aliases:**
- Not detected in current codebase; relative paths used throughout (e.g., `'../../interfaces/product.interface'`)

## Error Handling

**Java Patterns:**
- Try-catch blocks at controller level for user-facing errors
- Returns ResponseEntity with appropriate HTTP status codes
- BadCredentialsException caught separately for authentication failures
- Generic Exception catch-all for unexpected errors with message propagation
- Example from `AuthController.java`:
```java
try {
    if (userService.emailExists(registerRequest.getEmail())) {
        return ResponseEntity.badRequest()
                .body("Erreur: L'email est déjà utilisé !");
    }
    // ... process
    return ResponseEntity.ok("Utilisateur créé avec succès !");
} catch (Exception e) {
    return ResponseEntity.badRequest()
            .body("Erreur lors de la création de l'utilisateur: " + e.getMessage());
}
```

**TypeScript Patterns:**
- Observable error handlers in RxJS subscriptions
- console.error() for logging errors
- User-facing error messages stored in component properties (e.g., `errorMessage`)
- Null/undefined checks before operations
- Example from `ProductListComponent`:
```typescript
this.productService.getAllProducts().subscribe({
  next: (data) => {
    this.products = data;
    this.isLoading = false;
    this.cdr.detectChanges();
  },
  error: (error) => {
    console.error('Erreur lors du chargement des produits:', error);
    this.errorMessage = 'Impossible de charger les produits';
    this.isLoading = false;
    this.cdr.detectChanges();
  },
});
```

## Logging

**Framework:**
- Java: Spring Boot default (no explicit logging framework specified, uses System.out.println for initialization)
- TypeScript: console.error(), console.log()

**Patterns:**
- Java: Used in `DataInitializer.java` for startup messages with emoji indicators (✅)
- TypeScript: Debug logging in service calls (e.g., `console.log('Service: Calling API...')`)
- Error logging with context (e.g., `console.error('Erreur catégories:', error)`)
- No structured logging framework detected

Example from `DataInitializer.java`:
```java
System.out.println("✅ Données de test créées : " + productRepository.count() + " produits");
System.out.println("✅ Utilisateur admin créé : admin@ecommerce.com / admin123");
```

Example from `ProductListComponent`:
```typescript
console.error('Erreur lors du chargement des produits:', error);
console.log('Produit ajouté au panier:', product.name);
```

## Comments

**When to Comment:**
- French comments used throughout codebase for method descriptions
- Comments explain "what" rather than "why" (limited best practice adherence)
- Inline comments used for clarifying logic (e.g., "Produit déjà dans le panier, augmenter la quantité")
- API endpoint comments describe HTTP method and route (e.g., `// GET /api/products - Récupérer tous les produits`)

**JSDoc/TSDoc:**
- Not used in TypeScript files
- No JSDoc comments on functions or classes
- Java files lack Javadoc documentation (missing entirely)

**Example comment style:**
```java
// Getters et Setters
public Long getId() {
    return id;
}

// Vérifier si le token a expiré
private Boolean isTokenExpired(String token) {
    final Date expiration = getExpirationDateFromToken(token);
    return expiration.before(new Date());
}
```

## Function Design

**Size:**
- Java service methods: 1-10 lines typical (simple CRUD operations)
- Java controller methods: 10-25 lines with error handling
- TypeScript service methods: 3-8 lines (HTTP calls wrapped)
- TypeScript component methods: 5-30 lines (logic + change detection)

**Parameters:**
- Java: Explicit parameter types, @Valid annotations for DTOs, @PathVariable/@RequestBody for routing
- TypeScript: Explicit types in method signatures (e.g., `loadProducts(): void`, `addToCart(product: Product, quantity: number = 1): void`)
- Default parameters used in TypeScript (e.g., `quantity: number = 1` in CartService)

**Return Values:**
- Java: ResponseEntity<T> for controllers, List<T>/Optional<T> for services
- TypeScript: void for component methods, Observable<T> for service HTTP calls
- RxJS subscriptions used for async operations rather than Promises

Example function:
```typescript
addToCart(product: Product, quantity: number = 1): void {
  const existingItem = this.cartItems.find((item) => item.product.id === product.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.cartItems.push({ product, quantity });
  }

  this.cartSubject.next(this.cartItems);
}
```

## Module Design

**Exports:**
- Java: @Service, @Controller, @Component annotations for Spring dependency injection
- TypeScript: No barrel files; components/services explicitly imported from individual files
- Angular components use @Injectable decorator with providedIn: 'root' pattern

**Barrel Files:**
- Not used in current codebase
- Each service/component is in its own file with direct imports

Example TypeScript service export:
```typescript
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // ...
}
```

---

*Convention analysis: 2026-01-23*
