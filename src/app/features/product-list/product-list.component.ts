import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, tap, filter, withLatestFrom } from 'rxjs/operators';
import { Product } from '../../models/product.model';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { loadProducts } from '../../store/product/product.actions';
import { checkAuthState } from '../../store/auth/auth.actions';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  standalone: true,
  imports: [CommonModule, HeaderComponent, LoadingComponent],
})
export class ProductListComponent implements OnInit {
  private store = inject(Store<{ 
    products: { items: Product[]; loading: boolean }, 
    auth: { user: any; loading: boolean }
  }>);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  
  products = signal<Product[]>([]);
  loading = signal<boolean>(true); 
  searchTerm = signal<string>('');
  
  hasMoreProducts = signal<boolean>(false);
  isLoadingMore = signal<boolean>(false);
  pageSize = 10;
  lastLoadedId = signal<string | null>(null);
  
  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const productsList = this.products();
    
    if (!term || productsList.length === 0) {
      return productsList;
    }
    
    return productsList.filter(product => 
      (product.name?.toLowerCase().includes(term) || 
       product.brand?.toLowerCase().includes(term) || 
       product.categoryId?.toLowerCase().includes(term))
    );
  });

  constructor() {
    // Subscribe to store for products
    this.store.select(state => state.products?.items || [])
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(products => console.log('Products from store:', products)),
        catchError(err => {
          console.error('Error fetching products from store:', err);
          return of([]);
        })
      )
      .subscribe(products => {
        if (products && products.length > 0) {
          console.log(`Setting products signal with ${products.length} items`);
          this.products.set(products);
          
          this.lastLoadedId.set(products[products.length - 1].id);
          this.hasMoreProducts.set(products.length >= this.pageSize);
        }
      });
    
    // Subscribe to loading state
    this.store.select(state => state.products?.loading !== undefined ? state.products.loading : false)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(loading => console.log('Loading state from store:', loading)),
        catchError(() => of(false))
      )
      .subscribe(isLoading => {
        this.loading.set(isLoading);
      });
  }

  ngOnInit(): void {
    this.loading.set(true);
    
    // First, check auth state - this will trigger the checkAuthState$ effect
    this.store.dispatch(checkAuthState());
    
    // Subscribe to auth state to load products when authenticated
    this.store.select(state => state.auth?.user)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(user => console.log('Auth user from store:', user)),
        filter(user => !!user), // Only proceed when there's a user
        tap(() => {
          console.log('Authenticated user found, dispatching loadProducts action');
          this.store.dispatch(loadProducts({ 
            options: { limit: this.pageSize } 
          }));
        }),
        catchError(error => {
          console.error('Error in auth subscription:', error);
          this.loading.set(false);
          return of(null);
        })
      )
      .subscribe();
  }

  updateSearch(term: string): void {
    this.searchTerm.set(term);
  }

  viewProductDetails(productId: string): void {
    this.router.navigate(['/product-detail', productId]);
  }

  scanNewProduct(): void {
    this.router.navigate(['/product-scan']);
  }
  
  loadMoreProducts(): void {
    if (this.isLoadingMore() || !this.lastLoadedId()) return;
    
    this.isLoadingMore.set(true);
    
    this.store.dispatch(loadProducts({
      options: {
        afterId: this.lastLoadedId()!,
        limit: this.pageSize
      }
    }));
    
    setTimeout(() => {
      this.isLoadingMore.set(false);
    }, 1000);
  }

  refreshProducts(): void {
    this.loading.set(true);
    this.lastLoadedId.set(null);
    
    this.store.dispatch(loadProducts({ 
      options: { limit: this.pageSize } 
    }));
  }
}