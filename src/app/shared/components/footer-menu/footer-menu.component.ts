import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer-menu',
  templateUrl: './footer-menu.component.html',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host {
      display: block;
    }
    
    /* Add bottom padding to main content to prevent footer overlap */
    ::ng-deep body {
      padding-bottom: 5rem !important;
    }
  `]
})
export class FooterMenuComponent {
  private router = inject(Router);

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  isActive(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(path + '/');
  }
}