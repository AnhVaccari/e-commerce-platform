import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Order, OrderStatus } from '../../../core/models/admin.model';
import { ToastComponent } from '../shared/toast/toast.component';
import { ToastService } from '../shared/toast/toast.service';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, ToastComponent],
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.css'
})
export class OrderManagementComponent implements OnInit {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  // Constants
  readonly ORDER_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  readonly STATUS_LABELS: Record<OrderStatus, string> = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled'
  };

  // State signals
  orders = signal<Order[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  statusFilter = signal<OrderStatus | 'all'>('all');
  currentPage = signal(0);
  pageSize = signal(10);
  sortColumn = signal<'orderDate' | 'totalAmount' | 'status'>('orderDate');
  sortDirection = signal<'asc' | 'desc'>('desc');
  updatingOrderId = signal<number | null>(null);

  // Computed signals
  filteredOrders = computed(() => {
    let filtered = this.orders();

    // Filter by status
    if (this.statusFilter() !== 'all') {
      filtered = filtered.filter(o => o.status === this.statusFilter());
    }

    // Filter by user email (search)
    const searchLower = this.searchTerm().toLowerCase().trim();
    if (searchLower) {
      filtered = filtered.filter(o =>
        o.user.email.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  });

  sortedOrders = computed(() => {
    const orders = [...this.filteredOrders()];
    const column = this.sortColumn();
    const direction = this.sortDirection();

    orders.sort((a, b) => {
      let compareResult = 0;

      if (column === 'orderDate') {
        compareResult = new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
      } else if (column === 'totalAmount') {
        compareResult = a.totalAmount - b.totalAmount;
      } else if (column === 'status') {
        compareResult = a.status.localeCompare(b.status);
      }

      return direction === 'asc' ? compareResult : -compareResult;
    });

    return orders;
  });

  paginatedOrders = computed(() => {
    const start = this.currentPage() * this.pageSize();
    const end = start + this.pageSize();
    return this.sortedOrders().slice(start, end);
  });

  totalPages = computed(() =>
    Math.ceil(this.filteredOrders().length / this.pageSize())
  );

  // Effect: reset to page 0 when filters change
  constructor() {
    effect(() => {
      this.statusFilter();
      this.searchTerm();
      this.currentPage.set(0);
    });
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);

    this.http.get<Order[]>('http://localhost:8080/api/orders').subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);

        if (error.status === 0 || error.status >= 500) {
          this.toastService.show('Network error. Unable to load orders.', 'error');
        } else if (error.status === 403) {
          this.toastService.show('Unauthorized. Admin access required.', 'error');
        } else {
          this.toastService.show('Failed to load orders. Please try again.', 'error');
        }
      }
    });
  }

  toggleSort(column: 'orderDate' | 'totalAmount' | 'status'): void {
    if (this.sortColumn() === column) {
      // Toggle direction
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to descending
      this.sortColumn.set(column);
      this.sortDirection.set('desc');
    }
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  onStatusFilter(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.statusFilter.set(select.value as OrderStatus | 'all');
  }

  updateOrderStatus(order: Order, newStatus: OrderStatus): void {
    if (order.status === newStatus) {
      return; // No change
    }

    this.updatingOrderId.set(order.id);

    this.http.put(
      `http://localhost:8080/api/orders/${order.id}/status`,
      { status: newStatus }
    ).subscribe({
      next: () => {
        // Update order in signal
        this.orders.update(orders =>
          orders.map(o => o.id === order.id ? { ...o, status: newStatus } : o)
        );
        this.updatingOrderId.set(null);
        this.toastService.show(
          `Order #${order.id} status updated to ${this.STATUS_LABELS[newStatus]}`,
          'success'
        );
      },
      error: (error) => {
        this.updatingOrderId.set(null);

        if (error.status === 0 || error.status >= 500) {
          this.toastService.show('Network error. Unable to update order status.', 'error');
        } else if (error.status === 403) {
          this.toastService.show('Unauthorized. Cannot update order.', 'error');
        } else if (error.status === 404) {
          this.toastService.show('Order not found.', 'error');
        } else {
          this.toastService.show('Failed to update order status. Please try again.', 'error');
        }
      }
    });
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
    }
  }
}
