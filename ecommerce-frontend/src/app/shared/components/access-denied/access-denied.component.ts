import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="access-denied-container">
      <div class="access-denied-content">
        <h1>Access Denied</h1>
        <p>You do not have permission to access this page.</p>
        <p>Please contact an administrator if you believe this is an error.</p>
        <a routerLink="/" class="home-link">Return to Home</a>
      </div>
    </div>
  `,
  styles: [
    `
      .access-denied-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 1rem;
      }

      .access-denied-content {
        text-align: center;
        max-width: 400px;
      }

      h1 {
        color: #dc3545;
        margin-bottom: 1rem;
      }

      p {
        color: #6c757d;
        margin-bottom: 0.5rem;
      }

      .home-link {
        display: inline-block;
        margin-top: 1.5rem;
        padding: 0.5rem 1.5rem;
        background-color: #007bff;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      .home-link:hover {
        background-color: #0056b3;
      }
    `,
  ],
})
export class AccessDeniedComponent {}
