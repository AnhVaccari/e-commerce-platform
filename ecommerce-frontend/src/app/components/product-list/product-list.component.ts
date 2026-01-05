import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Product } from '../../interfaces/product.interface';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
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
}
