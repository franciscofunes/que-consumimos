import { createReducer, on } from '@ngrx/store';
import { Product } from '../../models/product.model';
import * as ProductActions from './product.actions';

export interface ProductState {
  items: Product[];
  loading: boolean;
  error: any;
}

export const initialState: ProductState = {
  items: [],
  loading: false,
  error: null
};

export const productReducer = createReducer(
  initialState,
  
  // Load products
  on(ProductActions.loadProducts, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ProductActions.loadProductsSuccess, (state, { products }) => ({
    ...state,
    items: products,
    loading: false
  })),
  on(ProductActions.loadProductsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  
  // Add product
  on(ProductActions.addProductSuccess, (state, { product }) => ({
    ...state,
    items: [...state.items, product]
  })),
  
  // Update product
  on(ProductActions.updateProductSuccess, (state, { product }) => ({
    ...state,
    items: state.items.map(item => 
      item.id === product.id ? product : item
    )
  })),
  
  // Delete product
  on(ProductActions.deleteProductSuccess, (state, { productId }) => ({
    ...state,
    items: state.items.filter(item => item.id !== productId)
  }))
);
