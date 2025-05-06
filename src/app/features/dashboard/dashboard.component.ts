import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { logout } from '../../store/auth/auth.actions';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent
  ]
})
export class DashboardComponent implements OnInit {
  private store = inject(Store<{ 
    auth: { user: any },
    products: { items: any[] }
  }>);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  
  userName: string = '';
  productCount: number = 0;
  
  ngOnInit(): void {
    this.store.select(state => state.auth.user)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => {
        if (!user) {
          this.router.navigate(['/auth/login']);
          return;
        }
        
        this.userName = user.displayName || 'Usuario';
      });
    
    this.store.select(state => state.products?.items || [])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(products => {
        this.productCount = products.length;
      });
  }
  
  signOut(): void {
    this.store.dispatch(logout());
  }

  navigateToProducts(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    console.log('Navigating to products');
    this.router.navigate(['/products'])
      .then(success => {
        console.log('Navigation result:', success);
        if (!success) {
          console.warn('Navigation was prevented!');
        }
      })
      .catch(err => console.error('Navigation error:', err));
  }
  
  navigateToScanner(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    console.log('Navigating to scanner');
    this.router.navigate(['/product-scan'])
      .then(success => {
        console.log('Navigation result:', success);
        if (!success) {
          console.warn('Navigation was prevented!');
        }
      })
      .catch(err => console.error('Navigation error:', err));
  }

  get totalProducts(): number {
    return this.productCount;
  }

  get productsAddedToday(): number {
    return 0;
  }

  get totalCategories(): number {
    return 0;
  }

  get recentConsumption(): number {
    return 0;
  }
}