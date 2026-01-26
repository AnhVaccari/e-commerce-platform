import { Component, inject, signal, computed, OnInit, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product, Category } from '../../../core/models/admin.model';
import { ToastComponent } from '../shared/toast/toast.component';
import { ToastService } from '../shared/toast/toast.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { ProductFormDialogComponent } from './product-form-dialog.component';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    ToastComponent,
    ConfirmDialogComponent,
    ProductFormDialogComponent
  ],
  templateUrl: './product-management.component.html',
  styleUrl: './product-management.component.css'
})
export class ProductManagementComponent implements OnInit {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  @ViewChild('productFormDialog') productFormDialog!: ProductFormDialogComponent;
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;

  // State signals
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  categoryFilter = signal<number | null>(null);
  currentPage = signal(0);
  pageSize = signal(10);
  sortColumn = signal<keyof Product>('name');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Product to delete (for confirm dialog)
  private productToDelete: Product | null = null;

  // Computed signals
  filteredProducts = computed(() => {
    let filtered = this.products();

    // Filter by search term (case insensitive)
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search)
      );
    }

    // Filter by category
    const catId = this.categoryFilter();
    if (catId !== null) {
      filtered = filtered.filter(p => p.category.id === catId);
    }

    return filtered;
  });

  sortedProducts = computed(() => {
    const filtered = [...this.filteredProducts()];
    const column = this.sortColumn();
    const direction = this.sortDirection();

    return filtered.sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];

      // Handle nested category object
      if (column === 'category') {
        const aCat = (a.category as any).name || '';
        const bCat = (b.category as any).name || '';
        return direction === 'asc'
          ? aCat.localeCompare(bCat)
          : bCat.localeCompare(aCat);
      }

      // Handle numbers
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Handle strings
      const aStr = String(aVal);
      const bStr = String(bVal);
      return direction === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  });

  paginatedProducts = computed(() => {
    const sorted = this.sortedProducts();
    const start = this.currentPage() * this.pageSize();
    const end = start + this.pageSize();
    return sorted.slice(start, end);
  });

  totalPages = computed(() =>
    Math.ceil(this.filteredProducts().length / this.pageSize())
  );

  // Effect to reset page when filters change
  constructor() {
    effect(() => {
      // Read signals to track them
      this.searchTerm();
      this.categoryFilter();
      // Reset to first page
      this.currentPage.set(0);
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.isLoading.set(true);

    this.http.get<Product[]>('http://localhost:8080/api/products').subscribe({
      next: (products) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        if (error.status === 0 || error.status >= 500) {
          this.toastService.show('Network error. Unable to load products.', 'error');
        } else if (error.status === 403) {
          this.toastService.show('Unauthorized. Admin access required.', 'error');
        } else {
          this.toastService.show('Failed to load products. Please try again.', 'error');
        }
      }
    });
  }

  loadCategories(): void {
    this.http.get<Category[]>('http://localhost:8080/api/categories').subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (error) => {
        if (error.status === 0 || error.status >= 500) {
          this.toastService.show('Network error. Unable to load categories.', 'error');
        } else {
          this.toastService.show('Failed to load categories.', 'error');
        }
      }
    });
  }

  toggleSort(column: keyof Product): void {
    if (this.sortColumn() === column) {
      // Toggle direction
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  onCategoryFilter(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.categoryFilter.set(value ? parseInt(value, 10) : null);
  }

  openAddDialog(): void {
    this.productFormDialog.open();
  }

  openEditDialog(product: Product): void {
    this.productFormDialog.open(product);
  }

  deleteProduct(product: Product): void {
    this.productToDelete = product;
    this.confirmDialog.open(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      'Delete'
    );
  }

  confirmDelete(): void {
    if (!this.productToDelete) return;

    const id = this.productToDelete.id;

    this.http.delete(`http://localhost:8080/api/products/${id}`).subscribe({
      next: () => {
        this.toastService.show('Product deleted successfully', 'success');
        this.productToDelete = null;
        this.loadProducts();
      },
      error: (error) => {
        this.productToDelete = null;
        if (error.status === 0 || error.status >= 500) {
          this.toastService.show('Network error. Unable to delete product.', 'error');
        } else if (error.status === 403) {
          this.toastService.show('Unauthorized. Admin access required.', 'error');
        } else {
          this.toastService.show('Failed to delete product. Please try again.', 'error');
        }
      }
    });
  }

  onProductSaved(): void {
    this.loadProducts();
    this.toastService.show('Product saved successfully', 'success');
  }

  // Pagination methods
  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(page => page - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(page => page + 1);
    }
  }
}
