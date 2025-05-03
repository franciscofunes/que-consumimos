import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [CommonModule],
})
export class HeaderComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  getName(): string {
    return this.authService.getUserName() || 'Usuario';
  }

  getPhoto(): string | null {
    return this.authService.getUserPhoto();
  }

  getInitials(): string {
    const name = this.getName();
    return name.charAt(0).toUpperCase();
  }

  signOut(): void {
    this.authService.signOut().then(() => {
      this.router.navigate(['/auth/login']);
    });
  }
}
