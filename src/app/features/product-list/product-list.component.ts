import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Product } from '../../models/product.model';
import { loadProducts } from '../../store/product/product.actions';
import { signal } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  standalone: true,
  imports: [AsyncPipe, CommonModule, HeaderComponent, LoadingComponent],
})
export class ProductListComponent implements OnInit {
  private store = inject(
    Store<{ products: { items: Product[]; loading: boolean } }>
  );
  private router = inject(Router);
  
  // Keeping the Observable approach to match the template
  products$: Observable<Product[]>;
  loading$: Observable<boolean>;
  searchTerm = signal('');
  
  // Converting from signals to regular properties
  hasMoreProducts = false;
  isLoadingMore = false;

  constructor() {
    this.products$ = this.store.select((state) => state.products.items);
    this.loading$ = this.store.select((state) => state.products.loading);
  }

  ngOnInit(): void {
    this.store.dispatch(loadProducts());
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
    this.isLoadingMore = true;
    // Implement pagination logic here
    setTimeout(() => {
      this.isLoadingMore = false;
      // Example logic to update hasMoreProducts based on loaded data
      this.hasMoreProducts = false;
    }, 1000);
  }
}