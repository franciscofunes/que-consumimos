import { createReducer, on } from '@ngrx/store';
import { Product, ProductUpdateDTO } from '../../models/product.model';
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
  on(ProductActions.addProduct, state => ({
    ...state,
    loading: true
  })),
  on(ProductActions.addProductSuccess, (state, { product }) => ({
    ...state,
    items: [...state.items, product],
    loading: false
  })),
  on(ProductActions.addProductFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  
  // Update product
  on(ProductActions.updateProduct, state => ({
    ...state,
    loading: true
  })),
  on(ProductActions.updateProductSuccess, (state, { product }) => {
    // Create a full product object by merging the update with the existing product
    const updatedItems = state.items.map(item => 
      item.id === product.id ? { ...item, ...product } : item
    );
    
    return {
      ...state,
      items: updatedItems,
      loading: false
    };
  }),
  on(ProductActions.updateProductFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  
  // Delete product
  on(ProductActions.deleteProduct, state => ({
    ...state,
    loading: true
  })),
  on(ProductActions.deleteProductSuccess, (state, { productId }) => ({
    ...state,
    items: state.items.filter(item => item.id !== productId),
    loading: false
  })),
  on(ProductActions.deleteProductFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  }))
);