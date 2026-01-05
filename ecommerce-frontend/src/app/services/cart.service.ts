import { Injectable } from '@angular/core';
import { CartItem } from '../interfaces/cart.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>(this.cartItems);

  constructor() {}

  // Observable pour que les composants puissent s'abonner aux changements
  getCartItems(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }

  // Ajouter un produit au panier
  addToCart(product: Product, quantity: number = 1): void {
    const existingItem = this.cartItems.find((item) => item.product.id === product.id);

    if (existingItem) {
      // Produit déjà dans le panier, augmenter la quantité
      existingItem.quantity += quantity;
    } else {
      // Nouveau produit, l'ajouter au panier
      this.cartItems.push({ product, quantity });
    }

    this.cartSubject.next(this.cartItems);
  }

  // Supprimer un produit du panier
  removeFromCart(productId: number): void {
    this.cartItems = this.cartItems.filter((item) => item.product.id !== productId);
    this.cartSubject.next(this.cartItems);
  }

  // Calculer le total du panier
  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  }

  // Vider le panier
  clearCart(): void {
    this.cartItems = [];
    this.cartSubject.next(this.cartItems);
  }

  // Obtenir le nombre total d'articles
  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }
}
