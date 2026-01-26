import { Component, ViewChild, ElementRef, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../shared/toast/toast.service';

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <dialog #dialog class="user-form-dialog" (cancel)="onCancel($event)">
      <div class="dialog-content">
        <h2>Create New User</h2>

        <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
          <!-- Name Row -->
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name *</label>
              <input
                id="firstName"
                type="text"
                formControlName="firstName"
                class="form-control"
                [class.invalid]="userForm.get('firstName')?.invalid && userForm.get('firstName')?.touched"
              />
              @if (userForm.get('firstName')?.invalid && userForm.get('firstName')?.touched) {
                <span class="error-message">First name is required</span>
              }
            </div>

            <div class="form-group">
              <label for="lastName">Last Name *</label>
              <input
                id="lastName"
                type="text"
                formControlName="lastName"
                class="form-control"
                [class.invalid]="userForm.get('lastName')?.invalid && userForm.get('lastName')?.touched"
              />
              @if (userForm.get('lastName')?.invalid && userForm.get('lastName')?.touched) {
                <span class="error-message">Last name is required</span>
              }
            </div>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="email">Email *</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="form-control"
              [class.invalid]="userForm.get('email')?.invalid && userForm.get('email')?.touched"
            />
            @if (userForm.get('email')?.invalid && userForm.get('email')?.touched) {
              <span class="error-message">
                @if (userForm.get('email')?.errors?.['required']) {
                  Email is required
                }
                @if (userForm.get('email')?.errors?.['email']) {
                  Please enter a valid email address
                }
              </span>
            }
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="password">Password *</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="form-control"
              [class.invalid]="userForm.get('password')?.invalid && userForm.get('password')?.touched"
            />
            @if (userForm.get('password')?.invalid && userForm.get('password')?.touched) {
              <span class="error-message">
                @if (userForm.get('password')?.errors?.['required']) {
                  Password is required
                }
                @if (userForm.get('password')?.errors?.['minlength']) {
                  Password must be at least 6 characters
                }
              </span>
            }
          </div>

          <!-- Role -->
          <div class="form-group">
            <label for="role">Role *</label>
            <select
              id="role"
              formControlName="role"
              class="form-control"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <!-- Phone (Optional) -->
          <div class="form-group">
            <label for="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              formControlName="phone"
              class="form-control"
              placeholder="Optional"
            />
          </div>

          <!-- Address (Optional) -->
          <div class="form-group">
            <label for="address">Address</label>
            <textarea
              id="address"
              formControlName="address"
              class="form-control"
              rows="3"
              placeholder="Optional"
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="close()" [disabled]="isSubmitting">
              Cancel
            </button>
            <button type="submit" class="btn-primary" [disabled]="isSubmitting">
              @if (isSubmitting) {
                <span class="spinner-small"></span>
                Creating...
              } @else {
                Create User
              }
            </button>
          </div>
        </form>
      </div>
    </dialog>
  `,
  styleUrl: './user-form-dialog.component.css'
})
export class UserFormDialogComponent {
  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;
  @Output() saved = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  isSubmitting = false;

  userForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['USER' as 'USER' | 'ADMIN', Validators.required],
    phone: [''],
    address: ['']
  });

  open(): void {
    // Reset form to defaults
    this.userForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'USER',
      phone: '',
      address: ''
    });
    this.dialog.nativeElement.showModal();
  }

  close(): void {
    this.dialog.nativeElement.close();
  }

  onCancel(event: Event): void {
    // Prevent default cancel behavior, allow dialog to close
    this.close();
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    // Build payload matching User entity structure
    const payload = {
      firstName: this.userForm.value.firstName!,
      lastName: this.userForm.value.lastName!,
      email: this.userForm.value.email!,
      password: this.userForm.value.password!,
      role: this.userForm.value.role!,
      phone: this.userForm.value.phone || null,
      address: this.userForm.value.address || null
    };

    this.http.post('http://localhost:8080/api/users', payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.close();
        this.saved.emit();
        // Note: parent component shows success toast
      },
      error: (error) => {
        console.error('Error creating user:', error);
        this.isSubmitting = false;

        // Handle specific error cases
        if (error.status === 400) {
          // Likely email already exists
          this.toastService.show('Email already exists', 'error');
        } else {
          this.toastService.show('Failed to create user', 'error');
        }
      }
    });
  }
}
