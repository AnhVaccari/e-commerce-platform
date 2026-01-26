import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Product, Order, User } from '../../../core/models/admin.model';
import { ToastComponent } from '../shared/toast/toast.component';
import { ToastService } from '../shared/toast/toast.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ToastComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  // Data signals
  products = signal<Product[]>([]);
  orders = signal<Order[]>([]);
  users = signal<User[]>([]);
  isLoading = signal(false);

  // Computed summary signals
  totalProducts = computed(() => this.products().length);
  lowStockProducts = computed(() =>
    this.products().filter(p => p.stock < 10).length
  );

  totalOrders = computed(() => this.orders().length);
  pendingOrders = computed(() =>
    this.orders().filter(o => o.status === 'PENDING').length
  );

  totalUsers = computed(() => this.users().length);
  adminUsers = computed(() =>
    this.users().filter(u => u.role === 'ADMIN').length
  );

  ngOnInit(): void {
    this.loadSummaryData();
  }

  loadSummaryData(): void {
    this.isLoading.set(true);

    forkJoin({
      products: this.http.get<Product[]>('http://localhost:8080/api/products'),
      orders: this.http.get<Order[]>('http://localhost:8080/api/orders'),
      users: this.http.get<User[]>('http://localhost:8080/api/users')
    }).subscribe({
      next: ({ products, orders, users }) => {
        this.products.set(products);
        this.orders.set(orders);
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);

        if (error.status === 0 || error.status >= 500) {
          this.toastService.show('Network error. Unable to load dashboard data.', 'error');
        } else if (error.status === 403) {
          this.toastService.show('Unauthorized. Admin access required.', 'error');
        } else {
          this.toastService.show('Failed to load dashboard data. Please try again.', 'error');
        }
      }
    });
  }
}
