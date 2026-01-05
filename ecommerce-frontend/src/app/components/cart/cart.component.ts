import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CartItem } from '../../interfaces/cart.interface';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  totalPrice: number = 0;
  totalItems: number = 0;
  private cartSubscription?: Subscription;

  constructor(private cartService: CartService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // S'abonner aux changements du panier
    this.cartSubscription = this.cartService.getCartItems().subscribe({
      next: (items) => {
        this.cartItems = items;
        this.totalPrice = this.cartService.getTotalPrice();
        this.totalItems = this.cartService.getTotalItems();
        this.cdr.detectChanges();
      },
    });
  }

  ngOnDestroy(): void {
    // Nettoyer l'abonnement
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  // Supprimer un produit du panier
  removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  // Vider tout le panier
  clearCart(): void {
    this.cartService.clearCart();
  }

  // Ajouter une unité
  increaseQuantity(item: CartItem): void {
    this.cartService.addToCart(item.product, 1);
  }

  // Diminuer une unité (mais pas en dessous de 1)
  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
      // On notifie le service du changement
      this.cartService['cartSubject'].next(this.cartItems);
    }
  }
}
