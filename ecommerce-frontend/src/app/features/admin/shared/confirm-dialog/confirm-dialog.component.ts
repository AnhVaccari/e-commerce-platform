import { Component, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <dialog #dialog class="confirm-dialog" (cancel)="onCancel($event)">
      <div class="dialog-content">
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <div class="dialog-actions">
          <button type="button" class="btn-secondary" (click)="cancel()">
            Cancel
          </button>
          <button type="button" class="btn-danger" (click)="confirm()">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </dialog>
  `,
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {
  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;
  @Output() confirmed = new EventEmitter<void>();

  title = '';
  message = '';
  confirmText = 'Confirm';

  open(title: string, message: string, confirmText = 'Confirm'): void {
    this.title = title;
    this.message = message;
    this.confirmText = confirmText;
    this.dialog.nativeElement.showModal();
  }

  confirm(): void {
    this.confirmed.emit();
    this.close();
  }

  cancel(): void {
    this.close();
  }

  onCancel(event: Event): void {
    // Allow backdrop click to close for now
    // Can be extended to prevent close on dirty forms
    this.close();
  }

  private close(): void {
    this.dialog.nativeElement.close();
  }
}
