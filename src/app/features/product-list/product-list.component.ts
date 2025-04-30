import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Product } from '../../models/product.model';
import { loadProducts } from '../../store/product/product.actions';
import { signal } from '@angular/core';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  private store = inject(Store<{ products: { items: Product[], loading: boolean } }>);
  private router = inject(Router);
  
  products$: Observable<Product[]>;
  loading$: Observable<boolean>;
  searchTerm = signal('');
  
  constructor() {
    this.products$ = this.store.select(state => state.products.items);
    this.loading$ = this.store.select(state => state.products.loading);
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
}
