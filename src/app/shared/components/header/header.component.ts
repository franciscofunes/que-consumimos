import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { logout } from '../../../store/auth/auth.actions';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class HeaderComponent {
  menuOpen = false;
  
  constructor(
    private store: Store,
    private router: Router,
    public authService: AuthService
  ) {}
  
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
  
  signOut(): void {
    this.store.dispatch(logout());
  }
  
  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.menuOpen = false;
  }

  getName(): string {
    const user = this.authService.currentUser;
    return user?.displayName || 'Usuario';
  }

  getPhoto(): string | null {
    const user = this.authService.currentUser;
    return user!.photoURL;
  }
}