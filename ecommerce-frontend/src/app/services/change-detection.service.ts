import { ChangeDetectorRef, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChangeDetectionService {
  constructor() {}

  // Force la détection dans un composant
  forceDetection(cdr: ChangeDetectorRef): void {
    setTimeout(() => {
      cdr.detectChanges();
    }, 0);
  }
}
