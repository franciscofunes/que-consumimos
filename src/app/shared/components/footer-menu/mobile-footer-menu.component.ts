import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-mobile-footer-menu',
  templateUrl: './mobile-footer-menu.component.html',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host {
      display: block;
    }
    
    ::ng-deep body {
      padding-bottom: 5rem !important;
    }
  `]
})
export class MobileFooterMenuComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  isActive(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(path + '/');
  }
  
  getUserName(): string {
    return this.authService.getUserName() || 'Usuario';
  }

  getUserPhoto(): string | null {
    return this.authService.getUserPhoto();
  }
  
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }
}