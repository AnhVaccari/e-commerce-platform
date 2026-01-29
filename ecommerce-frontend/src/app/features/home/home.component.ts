import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Product, Category } from '../../interfaces/product.interface';
import { CartService } from '../../services/cart.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <section class="hero">
        <h1>Bienvenue sur notre boutique</h1>
        <p>Découvrez nos produits de qualité</p>
      </section>

      <!-- Categories Filter -->
      <div class="filters">
        <button
          class="filter-btn"
          [class.active]="selectedCategory() === null"
          (click)="filterByCategory(null)"
        >
          Tous
        </button>
        @for (category of categories(); track category.id) {
          <button
            class="filter-btn"
            [class.active]="selectedCategory() === category.id"
            (click)="filterByCategory(category.id)"
          >
            {{ category.name }}
          </button>
        }
      </div>

      <!-- Loading -->
      @if (isLoading()) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Chargement des produits...</p>
        </div>
      }

      <!-- Products Grid -->
      @if (!isLoading() && filteredProducts().length > 0) {
        <div class="products-grid">
          @for (product of filteredProducts(); track product.id) {
            <div class="product-card">
              <div class="product-image">
                @if (product.imageUrl) {
                  <img [src]="product.imageUrl" [alt]="product.name" />
                } @else {
                  <div class="placeholder-image">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                      <circle cx="9" cy="9" r="2"></circle>
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                    </svg>
                  </div>
                }
              </div>
              <div class="product-info">
                <span class="category-tag">{{ product.category.name }}</span>
                <h3>{{ product.name }}</h3>
                <p class="description">{{ product.description }}</p>
                <div class="product-footer">
                  <span class="price">{{ product.price | number:'1.2-2' }} €</span>
                  <div class="stock-status" [class.in-stock]="product.stock > 0" [class.out-of-stock]="product.stock === 0">
                    @if (product.stock > 10) {
                      En stock
                    } @else if (product.stock > 0) {
                      Plus que {{ product.stock }} en stock
                    } @else {
                      Rupture de stock
                    }
                  </div>
                </div>
                <button
                  class="add-to-cart-btn"
                  [disabled]="product.stock === 0"
                  (click)="addToCart(product)"
                >
                  @if (product.stock > 0) {
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="8" cy="21" r="1"></circle>
                      <circle cx="19" cy="21" r="1"></circle>
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                    </svg>
                    Ajouter au panier
                  } @else {
                    Indisponible
                  }
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Empty State -->
      @if (!isLoading() && filteredProducts().length === 0) {
        <div class="empty-state">
          <p>Aucun produit trouvé.</p>
        </div>
      }
    </div>
  `,
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private cartService = inject(CartService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(false);
  selectedCategory = signal<number | null>(null);
  searchQuery = signal('');

  filteredProducts = signal<Product[]>([]);

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();

    // Listen for search query params
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery.set(params['search']);
        this.searchProducts(params['search']);
      }
    });
  }

  loadCategories(): void {
    this.http.get<Category[]>('${environment.apiUrl}/categories').subscribe({
      next: (categories) => this.categories.set(categories),
      error: (err) => console.error('Erreur chargement catégories:', err)
    });
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.http.get<Product[]>('${environment.apiUrl}/products').subscribe({
      next: (products) => {
        this.products.set(products);
        this.filteredProducts.set(products);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement produits:', err);
        this.isLoading.set(false);
      }
    });
  }

  filterByCategory(categoryId: number | null): void {
    this.selectedCategory.set(categoryId);

    if (categoryId === null) {
      this.filteredProducts.set(this.products());
    } else {
      this.http.get<Product[]>(`${environment.apiUrl}/products/category/${categoryId}`).subscribe({
        next: (products) => this.filteredProducts.set(products),
        error: (err) => console.error('Erreur filtrage:', err)
      });
    }
  }

  searchProducts(query: string): void {
    if (!query.trim()) {
      this.filteredProducts.set(this.products());
      return;
    }

    this.isLoading.set(true);
    this.http.get<Product[]>(`${environment.apiUrl}/products/search?name=${encodeURIComponent(query)}`).subscribe({
      next: (products) => {
        this.filteredProducts.set(products);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur recherche:', err);
        this.isLoading.set(false);
      }
    });
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
  }
}
