import { Component } from '@angular/core';
import { ProductListComponent } from '../../components/product-list/product-list.component';
import { CartComponent } from '../../components/cart/cart.component';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [ProductListComponent, CartComponent],
  template: `
    <div class="products-page">
      <app-product-list></app-product-list>
      <app-cart></app-cart>
    </div>
  `,
  styles: [`
    .products-page {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 2rem;
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    @media (max-width: 968px) {
      .products-page {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductsPageComponent {}
