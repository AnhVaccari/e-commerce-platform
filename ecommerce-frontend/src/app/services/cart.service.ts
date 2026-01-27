import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../interfaces/cart.interface';
import { Product } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  // Signal pour les items du panier
  cartItems = signal<CartItem[]>([]);

  // Computed signals
  totalItems = computed(() =>
    this.cartItems().reduce((total, item) => total + item.quantity, 0)
  );

  totalPrice = computed(() =>
    this.cartItems().reduce((total, item) => total + item.product.price * item.quantity, 0)
  );

  constructor() {
    // Charger le panier depuis localStorage au démarrage
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        this.cartItems.set(JSON.parse(stored));
      } catch {
        this.cartItems.set([]);
      }
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems()));
  }

  // Ajouter un produit au panier
  addToCart(product: Product, quantity: number = 1): void {
    const items = this.cartItems();
    const existingItem = items.find((item) => item.product.id === product.id);

    if (existingItem) {
      // Produit déjà dans le panier, augmenter la quantité
      this.cartItems.update(items =>
        items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      // Nouveau produit, l'ajouter au panier
      this.cartItems.update(items => [...items, { product, quantity }]);
    }

    this.saveToStorage();
  }

  // Modifier la quantité d'un produit
  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    this.cartItems.update(items =>
      items.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
    this.saveToStorage();
  }

  // Supprimer un produit du panier
  removeFromCart(productId: number): void {
    this.cartItems.update(items =>
      items.filter((item) => item.product.id !== productId)
    );
    this.saveToStorage();
  }

  // Vider le panier
  clearCart(): void {
    this.cartItems.set([]);
    this.saveToStorage();
  }

  // Calculer le total du panier (méthode pour compatibilité)
  getTotalPrice(): number {
    return this.totalPrice();
  }

  // Obtenir le nombre total d'articles (méthode pour compatibilité)
  getTotalItems(): number {
    return this.totalItems();
  }
}
