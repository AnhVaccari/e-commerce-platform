import { Component, signal } from '@angular/core';
import { ProductListComponent } from './components/product-list/product-list.component';
import { CartComponent } from './components/cart/cart.component';

@Component({
  selector: 'app-root',
  imports: [ProductListComponent, CartComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('ecommerce-frontend');
}
