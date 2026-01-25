import { Component, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  passwordRequirements = {
    minLength: false,
    hasNumber: false,
    hasLetter: false
  };

  registerForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/)
    ]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: [''],
    address: ['']
  });

  constructor() {
    // Monitor password changes for requirement display
    this.registerForm.get('password')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(password => this.updatePasswordRequirements(password || ''));
  }

  updatePasswordRequirements(password: string): void {
    this.passwordRequirements = {
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasLetter: /[A-Za-z]/.test(password)
    };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.registerForm.disable();

    const request: RegisterRequest = this.registerForm.value as RegisterRequest;

    this.authService.register(request).subscribe({
      next: () => {
        this.successMessage = 'Registration successful! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.registerForm.enable();

        if (error.status === 409) {
          this.errorMessage = 'Email already registered.';
        } else if (error.status === 0 || error.status >= 500) {
          this.errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  retry(): void {
    this.onSubmit();
  }
}
