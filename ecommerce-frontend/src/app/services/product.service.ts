import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category, Product } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Récupérer tous les produits
  getAllProducts(): Observable<Product[]> {
    console.log('Service: Calling API...');
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  // Récupérer produits par catégorie
  getProductsByCategory(categoryId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/category/${categoryId}`);
  }

  // Récupérer un produit par ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  // Récupérer toutes les catégories
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  // Rechercher des produits
  searchProducts(name: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/search?name=${name}`);
  }
}
