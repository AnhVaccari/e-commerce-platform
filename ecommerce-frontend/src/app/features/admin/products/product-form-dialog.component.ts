import { Component, ViewChild, ElementRef, Output, EventEmitter, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Product, Category } from '../../../core/models/admin.model';
import { ToastService } from '../shared/toast/toast.service';

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <dialog #dialog class="product-form-dialog" (cancel)="onCancel($event)">
      <div class="dialog-content">
        <h3>{{ isEdit ? 'Modifier le produit' : 'Ajouter un produit' }}</h3>

        <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
          <!-- Name Field -->
          <div class="form-field">
            <label for="name">Nom du produit *</label>
            <input
              type="text"
              id="name"
              formControlName="name"
              placeholder="Entrez le nom du produit"
              [class.error]="productForm.get('name')?.touched && productForm.get('name')?.invalid"
            />
            @if (productForm.get('name')?.touched && productForm.get('name')?.invalid) {
              <span class="error-message">
                @if (productForm.get('name')?.errors?.['required']) {
                  Le nom du produit est requis
                }
                @if (productForm.get('name')?.errors?.['minlength']) {
                  Le nom doit contenir au moins 3 caractères
                }
              </span>
            }
          </div>

          <!-- Description Field -->
          <div class="form-field">
            <label for="description">Description *</label>
            <textarea
              id="description"
              formControlName="description"
              placeholder="Entrez la description du produit"
              rows="4"
              [class.error]="productForm.get('description')?.touched && productForm.get('description')?.invalid"
            ></textarea>
            @if (productForm.get('description')?.touched && productForm.get('description')?.invalid) {
              <span class="error-message">
                La description est requise
              </span>
            }
          </div>

          <!-- Price Field -->
          <div class="form-field">
            <label for="price">Prix (€) *</label>
            <input
              type="number"
              id="price"
              formControlName="price"
              placeholder="0.00"
              step="0.01"
              min="0"
              [class.error]="productForm.get('price')?.touched && productForm.get('price')?.invalid"
            />
            @if (productForm.get('price')?.touched && productForm.get('price')?.invalid) {
              <span class="error-message">
                @if (productForm.get('price')?.errors?.['required']) {
                  Le prix est requis
                }
                @if (productForm.get('price')?.errors?.['min']) {
                  Le prix doit être supérieur ou égal à 0
                }
              </span>
            }
          </div>

          <!-- Stock Field -->
          <div class="form-field">
            <label for="stock">Quantité en stock *</label>
            <input
              type="number"
              id="stock"
              formControlName="stock"
              placeholder="0"
              min="0"
              [class.error]="productForm.get('stock')?.touched && productForm.get('stock')?.invalid"
            />
            @if (productForm.get('stock')?.touched && productForm.get('stock')?.invalid) {
              <span class="error-message">
                @if (productForm.get('stock')?.errors?.['required']) {
                  La quantité en stock est requise
                }
                @if (productForm.get('stock')?.errors?.['min']) {
                  Le stock doit être supérieur ou égal à 0
                }
              </span>
            }
          </div>

          <!-- Category Field -->
          <div class="form-field">
            <label for="categoryId">Catégorie *</label>
            <select
              id="categoryId"
              formControlName="categoryId"
              [class.error]="productForm.get('categoryId')?.touched && productForm.get('categoryId')?.invalid"
            >
              <option [value]="null">Sélectionnez une catégorie</option>
              @for (category of categories; track category.id) {
                <option [value]="category.id">{{ category.name }}</option>
              }
            </select>
            @if (productForm.get('categoryId')?.touched && productForm.get('categoryId')?.invalid) {
              <span class="error-message">
                La catégorie est requise
              </span>
            }
          </div>

          <!-- Action Buttons -->
          <div class="dialog-actions">
            <button type="button" class="btn-secondary" (click)="close()" [disabled]="isSubmitting">
              Annuler
            </button>
            <button type="submit" class="btn-primary" [disabled]="isSubmitting">
              @if (isSubmitting) {
                <span class="spinner-small"></span>
                Enregistrement...
              } @else {
                {{ isEdit ? 'Modifier' : 'Créer' }}
              }
            </button>
          </div>
        </form>
      </div>
    </dialog>
  `,
  styleUrl: './product-form-dialog.component.css'
})
export class ProductFormDialogComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;
  @Input() categories: Category[] = [];
  @Output() saved = new EventEmitter<void>();

  isEdit = false;
  editingProductId: number | null = null;
  isSubmitting = false;

  productForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    categoryId: [null as number | null, Validators.required]
  });

  open(product?: Product): void {
    if (product) {
      // Edit mode
      this.isEdit = true;
      this.editingProductId = product.id;
      this.productForm.patchValue({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: product.category.id
      });
    } else {
      // Create mode
      this.isEdit = false;
      this.editingProductId = null;
      this.productForm.reset({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        categoryId: null
      });
    }

    this.dialog.nativeElement.showModal();
  }

  close(): void {
    this.productForm.reset();
    this.dialog.nativeElement.close();
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.close();
  }

  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.productForm.value;

    // Build payload matching backend Product entity structure
    const payload = {
      name: formValue.name,
      description: formValue.description,
      price: formValue.price,
      stock: formValue.stock,
      category: {
        id: formValue.categoryId
      }
    };

    // Use PUT for edit, POST for create
    const request$ = this.isEdit
      ? this.http.put<Product>(`http://localhost:8080/api/products/${this.editingProductId}`, payload)
      : this.http.post<Product>('http://localhost:8080/api/products', payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.close();
        this.saved.emit();
      },
      error: (error) => {
        this.isSubmitting = false;

        if (error.status === 0 || error.status >= 500) {
          this.toastService.show('Erreur réseau. Impossible d\'enregistrer le produit.', 'error');
        } else if (error.status === 400) {
          this.toastService.show('Données produit invalides. Veuillez vérifier vos entrées.', 'error');
        } else if (error.status === 403) {
          this.toastService.show('Non autorisé. Accès administrateur requis.', 'error');
        } else {
          this.toastService.show('Échec de l\'enregistrement. Veuillez réessayer.', 'error');
        }
      }
    });
  }
}
