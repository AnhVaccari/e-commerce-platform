import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Category, Product } from '../../interfaces/product.interface';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  isLoading = false;
  errorMessage = '';
  searchTerm = '';

  categories: Category[] = [];
  selectedCategoryId: number | null = null;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadCategories(): void {
    this.productService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur catégories:', error);
      },
    });
  }

  onCategoryFilter(): void {
    if (this.selectedCategoryId) {
      this.isLoading = true;
      // Utiliser l'API de filtrage par catégorie
      this.productService.getProductsByCategory(this.selectedCategoryId).subscribe({
        next: (data) => {
          this.products = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur filtre:', error);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.loadProducts(); // Toutes les catégories
    }
  }

  loadProducts(): void {
    this.isLoading = true;
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
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
    console.log('Produit ajouté au panier:', product.name);
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.isLoading = true;
      this.errorMessage = '';

      this.productService.searchProducts(this.searchTerm).subscribe({
        next: (data) => {
          this.products = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur recherche:', error);
          this.errorMessage = 'Erreur lors de la recherche';
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      // Si recherche vide, recharger tous les produits
      this.loadProducts();
    }
  }
}
