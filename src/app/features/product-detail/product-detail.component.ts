import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../models/product.model';
import { Observable, switchMap, of, catchError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  
  // Use signals instead of async pipe
  productSignal = signal<Product | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);
  
  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const productId = params.get('id');
        this.isLoading.set(true);
        this.error.set(null);
        
        if (!productId) {
          this.error.set('Producto no encontrado');
          this.isLoading.set(false);
          return of(null);
        }
        
        return this.productService.getProductById(productId).pipe(
          catchError(err => {
            this.error.set('Error al cargar el producto');
            this.isLoading.set(false);
            return of(null);
          })
        );
      })
    ).subscribe(product => {
      this.productSignal.set(product);
      this.isLoading.set(false);
      if (!product) {
        this.error.set('Producto no encontrado');
      }
    });
  }
  
  goBack(): void {
    this.router.navigate(['/products']);
  }
}