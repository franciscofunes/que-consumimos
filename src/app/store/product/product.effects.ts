import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import * as ProductActions from './product.actions';
import { ProductService } from '../../core/services/product.service';

@Injectable()
export class ProductEffects {
  constructor(
    private actions$: Actions,
    private productService: ProductService
  ) {}

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      tap(action => console.log('loadProducts action received:', action)), // Add this
      switchMap((action) => {
        const options = action.options || {};
        console.log('Calling productService.getProducts with options:', options); // Add this
        
        return this.productService.getProducts(options).pipe(
          tap(response => console.log('Raw service response:', response)), // Add this
          map(products => {
            console.log('Products loaded:', products);
            return ProductActions.loadProductsSuccess({ products });
          }),
          catchError(error => {
            console.error('Error loading products:', error);
            return of(ProductActions.loadProductsFailure({ error: error.toString() }));
          })
        );
      })
    )
  );

  addProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.addProduct),
      switchMap(({ product }) =>
        this.productService.createProduct(product).pipe(
          map(newProduct => ProductActions.addProductSuccess({ product: newProduct })),
          catchError(error => {
            console.error('Error adding product:', error);
            return of(ProductActions.addProductFailure({ error: error.toString() }));
          })
        )
      )
    )
  );

  updateProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.updateProduct),
      switchMap(({ product }) =>
        this.productService.updateProduct(product).pipe(
          map(updatedProduct => ProductActions.updateProductSuccess({ product: updatedProduct })),
          catchError(error => {
            console.error('Error updating product:', error);
            return of(ProductActions.updateProductFailure({ error: error.toString() }));
          })
        )
      )
    )
  );

  deleteProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.deleteProduct),
      switchMap(({ productId }) =>
        this.productService.removeProduct(productId).pipe(
          map(() => ProductActions.deleteProductSuccess({ productId })),
          catchError(error => {
            console.error('Error deleting product:', error);
            return of(ProductActions.deleteProductFailure({ error: error.toString() }));
          })
        )
      )
    )
  );
}