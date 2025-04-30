import { createAction, props } from '@ngrx/store';
import { Product, ProductCreateDTO, ProductUpdateDTO } from '../../models/product.model';

// Load Products
export const loadProducts = createAction(
  '[Product] Load Products'
);

export const loadProductsSuccess = createAction(
  '[Product] Load Products Success',
  props<{ products: Product[] }>()
);

export const loadProductsFailure = createAction(
  '[Product] Load Products Failure',
  props<{ error: any }>()
);

// Add Product
export const addProduct = createAction(
  '[Product] Add Product',
  props<{ product: ProductCreateDTO }>()
);

export const addProductSuccess = createAction(
  '[Product] Add Product Success',
  props<{ product: Product }>()
);

export const addProductFailure = createAction(
  '[Product] Add Product Failure',
  props<{ error: any }>()
);

// Update Product
export const updateProduct = createAction(
  '[Product] Update Product',
  props<{ product: ProductUpdateDTO }>()
);

export const updateProductSuccess = createAction(
  '[Product] Update Product Success',
  props<{ product: ProductUpdateDTO }>()
);

export const updateProductFailure = createAction(
  '[Product] Update Product Failure',
  props<{ error: any }>()
);

// Delete Product
export const deleteProduct = createAction(
  '[Product] Delete Product',
  props<{ productId: string }>()
);

export const deleteProductSuccess = createAction(
  '[Product] Delete Product Success',
  props<{ productId: string }>()
);

export const deleteProductFailure = createAction(
  '[Product] Delete Product Failure',
  props<{ error: any }>()
);