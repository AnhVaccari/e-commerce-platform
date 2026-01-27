import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="cart-page">
      <h1>Mon Panier</h1>

      @if (cartService.cartItems().length === 0) {
        <div class="empty-cart">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="8" cy="21" r="1"></circle>
            <circle cx="19" cy="21" r="1"></circle>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
          </svg>
          <h2>Votre panier est vide</h2>
          <p>Découvrez nos produits et ajoutez-les à votre panier</p>
          <a routerLink="/" class="btn-primary">Voir les produits</a>
        </div>
      } @else {
        <div class="cart-content">
          <div class="cart-items">
            @for (item of cartService.cartItems(); track item.product.id) {
              <div class="cart-item">
                <div class="item-image">
                  @if (item.product.imageUrl) {
                    <img [src]="item.product.imageUrl" [alt]="item.product.name" />
                  } @else {
                    <div class="placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                        <circle cx="9" cy="9" r="2"></circle>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                      </svg>
                    </div>
                  }
                </div>

                <div class="item-details">
                  <h3>{{ item.product.name }}</h3>
                  <p class="item-price">{{ item.product.price | number:'1.2-2' }} €</p>
                </div>

                <div class="quantity-controls">
                  <button
                    class="qty-btn"
                    (click)="decreaseQuantity(item.product.id, item.quantity)"
                  >−</button>
                  <span class="quantity">{{ item.quantity }}</span>
                  <button
                    class="qty-btn"
                    (click)="increaseQuantity(item.product.id, item.quantity)"
                    [disabled]="item.quantity >= item.product.stock"
                  >+</button>
                </div>

                <div class="item-total">
                  {{ item.product.price * item.quantity | number:'1.2-2' }} €
                </div>

                <button class="remove-btn" (click)="removeItem(item.product.id)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            }
          </div>

          <div class="cart-summary">
            <h2>Récapitulatif</h2>

            <div class="summary-row">
              <span>Articles ({{ cartService.totalItems() }})</span>
              <span>{{ cartService.totalPrice() | number:'1.2-2' }} €</span>
            </div>

            <div class="summary-row">
              <span>Livraison</span>
              <span class="free">Gratuite</span>
            </div>

            <div class="summary-total">
              <span>Total</span>
              <span>{{ cartService.totalPrice() | number:'1.2-2' }} €</span>
            </div>

            @if (authService.isAuthenticated()) {
              <button class="checkout-btn">
                Passer la commande
              </button>
            } @else {
              <a routerLink="/login" class="checkout-btn">
                Se connecter pour commander
              </a>
            }

            <button class="clear-btn" (click)="clearCart()">
              Vider le panier
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './cart-page.component.css'
})
export class CartPageComponent {
  cartService = inject(CartService);
  authService = inject(AuthService);

  increaseQuantity(productId: number, currentQty: number): void {
    this.cartService.updateQuantity(productId, currentQty + 1);
  }

  decreaseQuantity(productId: number, currentQty: number): void {
    this.cartService.updateQuantity(productId, currentQty - 1);
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }
}
