import { Component, signal, computed, effect, inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { User } from '../../../core/models/admin.model';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../shared/toast/toast.service';
import { ToastComponent } from '../shared/toast/toast.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { UserFormDialogComponent } from './user-form-dialog.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    ToastComponent,
    ConfirmDialogComponent,
    UserFormDialogComponent
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  @ViewChild('userFormDialog') userFormDialog!: UserFormDialogComponent;
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;

  // State signals
  users = signal<User[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  roleFilter = signal<'USER' | 'ADMIN' | 'all'>('all');
  currentPage = signal(0);
  pageSize = signal(10);
  sortColumn = signal<'email' | 'firstName' | 'role' | 'createdAt'>('email');
  sortDirection = signal<'asc' | 'desc'>('asc');
  deletingUserId = signal<number | null>(null);

  // Computed signals
  filteredUsers = computed(() => {
    let filtered = this.users();

    // Filter by role
    if (this.roleFilter() !== 'all') {
      filtered = filtered.filter(u => u.role === this.roleFilter());
    }

    // Filter by search term (email or name)
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      filtered = filtered.filter(u =>
        u.email.toLowerCase().includes(search) ||
        u.firstName.toLowerCase().includes(search) ||
        u.lastName.toLowerCase().includes(search)
      );
    }

    return filtered;
  });

  sortedUsers = computed(() => {
    const users = [...this.filteredUsers()];
    const column = this.sortColumn();
    const direction = this.sortDirection();

    users.sort((a, b) => {
      let aVal: any = a[column];
      let bVal: any = b[column];

      // Handle nested or special cases
      if (column === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return users;
  });

  paginatedUsers = computed(() => {
    const start = this.currentPage() * this.pageSize();
    const end = start + this.pageSize();
    return this.sortedUsers().slice(start, end);
  });

  totalPages = computed(() => Math.ceil(this.sortedUsers().length / this.pageSize()));

  currentUserEmail = computed(() => this.authService.currentUser()?.email || '');

  // Effect to reset page when filters change
  constructor() {
    effect(() => {
      // Access signals to track them
      this.roleFilter();
      this.searchTerm();
      // Reset to first page
      this.currentPage.set(0);
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.http.get<User[]>(`${environment.apiUrl}/users`).subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.toastService.show('Échec du chargement des utilisateurs', 'error');
        this.isLoading.set(false);
      }
    });
  }

  toggleSort(column: 'email' | 'firstName' | 'role' | 'createdAt'): void {
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

  onRoleFilter(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.roleFilter.set(target.value as 'USER' | 'ADMIN' | 'all');
  }

  openAddDialog(): void {
    this.userFormDialog.open();
  }

  deleteUser(user: User): void {
    // Check if trying to delete self
    if (user.email === this.currentUserEmail()) {
      this.toastService.show('Vous ne pouvez pas vous supprimer vous-même', 'error');
      return;
    }

    this.confirmDialog.open(
      'Supprimer l\'utilisateur',
      `Êtes-vous sûr de vouloir supprimer ${user.firstName} ${user.lastName} ?`,
      'Supprimer'
    );

    // Store user ID for confirmation handler
    this.deletingUserId.set(user.id);
  }

  confirmDelete(): void {
    const userId = this.deletingUserId();
    if (userId === null) return;

    this.http.delete(`${environment.apiUrl}/users/${userId}`).subscribe({
      next: () => {
        this.toastService.show('Utilisateur supprimé avec succès', 'success');
        this.loadUsers();
        this.deletingUserId.set(null);
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.toastService.show('Échec de la suppression de l\'utilisateur', 'error');
        this.deletingUserId.set(null);
      }
    });
  }

  onUserSaved(): void {
    this.loadUsers();
    this.toastService.show('Utilisateur créé avec succès', 'success');
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
    }
  }
}
