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
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
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
        this.successMessage = 'Bienvenue !';

        // Redirect: prioritize returnUrl if explicitly set, otherwise admin goes to dashboard
        const user = this.authService.currentUser();
        const hasExplicitReturnUrl = this.returnUrl !== '/';
        const redirectUrl = hasExplicitReturnUrl
          ? this.returnUrl
          : user?.role === 'ADMIN'
            ? '/admin/dashboard'
            : '/';

        setTimeout(() => {
          this.router.navigate([redirectUrl]);
        }, 1000);
      },
      error: (error) => {
        this.isLoading = false;
        this.loginForm.enable();

        // Handle different error types
        if (error.status === 0 || error.status >= 500) {
          this.errorMessage =
            'Erreur réseau. Veuillez vérifier votre connexion et réessayer.';
        } else if (error.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect.';
        } else {
          this.errorMessage = 'Échec de la connexion. Veuillez réessayer.';
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
