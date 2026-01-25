import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  returnUrl: string;

  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false],
  });

  constructor() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/products';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.loginForm.disable();

    const email = this.loginForm.value.email!;
    const password = this.loginForm.value.password!;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.successMessage = 'Welcome back!';
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.loginForm.enable();

        // Handle different error types
        if (error.status === 0 || error.status >= 500) {
          this.errorMessage =
            'Network error. Please check your connection and try again.';
        } else if (error.status === 401) {
          this.errorMessage = 'Invalid email or password.';
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
      },
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  retry(): void {
    this.errorMessage = '';
    this.onSubmit();
  }
}
