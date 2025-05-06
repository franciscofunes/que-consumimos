import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { Product } from '../../models/product.model';
import { loadProducts, loadProductsSuccess } from '../../store/product/product.actions';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { AuthService } from '../../core/services/auth.service';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  standalone: true,
  imports: [CommonModule, HeaderComponent, LoadingComponent],
})
export class ProductListComponent implements OnInit {
  private store = inject(Store<{ products: { items: Product[]; loading: boolean } }>);
  private router = inject(Router);
  private authService = inject(AuthService);
  private productService = inject(ProductService);
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
    // Subscribe to store
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
    
    // Use reactive approach instead of promises
    const userId = this.authService.getUserId();
    if (userId) {
      console.log('User ID found:', userId);
      
      // Convert promise to observable for better integration
      from(this.authService.getUserHousehold(userId))
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap(householdId => console.log('Household ID retrieved:', householdId)),
          switchMap(householdId => {
            // Dispatch action through NgRx
            console.log('Dispatching loadProducts action');
            this.store.dispatch(loadProducts({ 
              options: { limit: this.pageSize } 
            }));
            
            // Also directly load products as a fallback
            return this.productService.getProducts({ limit: this.pageSize });
          }),
          tap(products => {
            console.log(`Direct service call returned ${products.length} products`);
            
            // Update products if we got results
            if (products && products.length > 0) {
              this.products.set(products);
              this.lastLoadedId.set(products[products.length - 1].id);
              this.hasMoreProducts.set(products.length >= this.pageSize);
              
              // Ensure store has the products too
              this.store.dispatch(loadProductsSuccess({ products }));
            }
            
            this.loading.set(false);
          }),
          catchError(error => {
            console.error('Error in getting products:', error);
            this.loading.set(false);
            return of([]);
          })
        )
        .subscribe();
    } else {
      // User not found - try direct service call
      console.log('No user ID found, loading products directly');
      
      this.productService.getProducts({ limit: this.pageSize })
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap(products => {
            if (products && products.length > 0) {
              this.products.set(products);
              this.lastLoadedId.set(products[products.length - 1].id);
              this.hasMoreProducts.set(products.length >= this.pageSize);
            }
            this.loading.set(false);
          }),
          catchError(error => {
            console.error('Error in direct service call:', error);
            this.loading.set(false);
            return of([]);
          })
        )
        .subscribe();
    }
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
    const lastId = this.lastLoadedId();
    
    // Load more products directly since we know this works
    this.productService.getProducts({
      afterId: lastId!,
      limit: this.pageSize
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(newProducts => {
          console.log(`Load more returned ${newProducts.length} products`);
          
          if (newProducts.length > 0) {
            // Append new products to existing ones
            const updatedProducts = [...this.products(), ...newProducts];
            this.products.set(updatedProducts);
            
            this.lastLoadedId.set(newProducts[newProducts.length - 1].id);
            this.hasMoreProducts.set(newProducts.length >= this.pageSize);
          } else {
            this.hasMoreProducts.set(false);
          }
          
          this.isLoadingMore.set(false);
        }),
        catchError(error => {
          console.error('Error loading more products:', error);
          this.isLoadingMore.set(false);
          return of([]);
        })
      )
      .subscribe();
  }

  refreshProducts(): void {
    this.loading.set(true);
    this.lastLoadedId.set(null);
    
    this.productService.getProducts({ limit: this.pageSize })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(products => {
          if (products.length > 0) {
            this.products.set(products);
            this.lastLoadedId.set(products[products.length - 1].id);
            this.hasMoreProducts.set(products.length >= this.pageSize);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          console.error('Error refreshing products:', error);
          this.loading.set(false);
          return of([]);
        })
      )
      .subscribe();
  }
}