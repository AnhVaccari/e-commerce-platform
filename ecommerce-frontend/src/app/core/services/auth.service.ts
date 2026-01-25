import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { User } from '../models/user.model';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'jwt_token';
  private readonly USER_KEY = 'current_user';

  private http = inject(HttpClient);
  private router = inject(Router);

  // Private writable signals
  private currentUserSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);

  // Public readonly signals
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  constructor() {
    this.initializeAuth();
  }

  // localStorage wrappers with error handling
  private getFromStorage(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  private setInStorage(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  private removeFromStorage(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  // Initialize auth state from localStorage
  private initializeAuth(): void {
    const token = this.getFromStorage(this.TOKEN_KEY);

    if (!token) {
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);

      // Check if token is expired
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        console.log('Token expired, clearing auth state');
        this.clearAuthState();
        this.router.navigate(['/login'], {
          queryParams: { message: 'Session expired, please login again' },
        });
        return;
      }

      // Token is valid, restore state
      this.tokenSignal.set(token);

      const userJson = this.getFromStorage(this.USER_KEY);
      if (userJson) {
        const user = JSON.parse(userJson) as User;
        this.currentUserSignal.set(user);
      }
    } catch (error) {
      console.error('Error decoding token, clearing auth state:', error);
      this.clearAuthState();
    }
  }

  // HTTP methods
  login(email: string, password: string): Observable<LoginResponse> {
    const request: LoginRequest = { email, password };
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, request).pipe(
      tap((response) => this.handleLoginSuccess(response)),
      catchError((error) => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  register(request: RegisterRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, request).pipe(
      catchError((error) => {
        console.error('Registration error:', error);
        throw error;
      })
    );
  }

  // Handle successful login
  private handleLoginSuccess(response: LoginResponse): void {
    // Store token
    this.setInStorage(this.TOKEN_KEY, response.token);
    this.tokenSignal.set(response.token);

    // Create and store user object
    const user: User = {
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      role: response.role as 'USER' | 'ADMIN',
    };

    this.setInStorage(this.USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  // Logout
  logout(): void {
    this.clearAuthState();
    this.router.navigate(['/login']);
  }

  // Clear all auth state
  private clearAuthState(): void {
    this.removeFromStorage(this.TOKEN_KEY);
    this.removeFromStorage(this.USER_KEY);
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
  }

  // Get token for interceptor use
  getToken(): string | null {
    return this.tokenSignal();
  }
}
