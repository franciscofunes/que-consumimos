import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../models/product.model';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    LoadingComponent
  ]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  
  productSignal = signal<Product | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  
  ngOnInit(): void {
    this.loadProduct();
  }
  
  async loadProduct(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      const productId = this.route.snapshot.paramMap.get('id');
      
      if (!productId) {
        this.error.set('Producto no encontrado');
        return;
      }
      
      const product = await this.productService.getProductById(productId);
      
      if (!product) {
        this.error.set('Producto no encontrado');
        return;
      }
      
      this.productSignal.set(product);
    } catch (error) {
      console.error('Error loading product:', error);
      this.error.set('Error al cargar el producto');
    } finally {
      this.isLoading.set(false);
    }
  }
  
  goBack(): void {
    this.router.navigate(['/products']);
  }
  
  async editProduct(): Promise<void> {
    const productId = this.productSignal()?.id;
    if (productId) {
      this.router.navigate(['/product-edit', productId]);
    }
  }
  
  async deleteProduct(): Promise<void> {
    try {
      const productId = this.productSignal()?.id;
      
      if (!productId) {
        return;
      }
      
      if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        console.log('Deleting product:', productId);
        
        alert('Producto eliminado con éxito');
        
        this.goBack();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto');
    }
  }
}