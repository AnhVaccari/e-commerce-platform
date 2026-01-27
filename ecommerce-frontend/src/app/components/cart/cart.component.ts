import { Component, inject, computed } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  private cartService = inject(CartService);

  // Use signals from CartService
  cartItems = this.cartService.cartItems;
  totalPrice = this.cartService.totalPrice;
  totalItems = this.cartService.totalItems;

  // Supprimer un produit du panier
  removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  // Vider tout le panier
  clearCart(): void {
    this.cartService.clearCart();
  }

  // Ajouter une unité
  increaseQuantity(item: { product: { id: number }; quantity: number }): void {
    this.cartService.updateQuantity(item.product.id, item.quantity + 1);
  }

  // Diminuer une unité
  decreaseQuantity(item: { product: { id: number }; quantity: number }): void {
    this.cartService.updateQuantity(item.product.id, item.quantity - 1);
  }
}
