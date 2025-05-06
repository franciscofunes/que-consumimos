import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc, startAfter, where, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { Product, ProductCreateDTO, ProductUpdateDTO } from '../../models/product.model';
import { AuthService } from './auth.service';
import { from, Observable } from 'rxjs';

interface GetProductsOptions {
  afterId?: string | null;
  limit?: number;
  category?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private firestore: Firestore = inject(Firestore);
  private authService = inject(AuthService);

  /**
   * Get all products for the current user's household
   */
  getProducts(options: GetProductsOptions = {}): Observable<Product[]> {
    return from(this.getProductsAsync(options));
  }

  /**
   * Alias for getProducts to match effects naming
   */
  getAllProducts(options: GetProductsOptions = {}): Observable<Product[]> {
    return this.getProducts(options);
  }

  /**
   * Async implementation of getProducts
   */
  private async getProductsAsync(options: GetProductsOptions = {}): Promise<Product[]> {
    try {
      const userId = this.authService.getUserId();
      
      if (!userId) {
        console.error('User not authenticated');
        return [];
      }
      
      const householdId = await this.authService.getUserHousehold(userId);
      
      if (!householdId) {
        console.error('User has no household, returning empty products array');
        return [];
      }
      
      console.log('Fetching products for household:', householdId);
      
      // Build query
      const productsRef = collection(this.firestore, `households/${householdId}/products`);
      
      // Start building the query with order
      let productsQuery = query(productsRef, orderBy('createdAt', 'desc'));
      
      // Add category filter if specified
      if (options.category) {
        productsQuery = query(productsQuery, where('categoryId', '==', options.category));
      }
      
      // Add pagination
      if (options.limit) {
        productsQuery = query(productsQuery, limit(options.limit));
      }
      
      // Add cursor if specified
      if (options.afterId) {
        const cursorDoc = await getDoc(doc(productsRef, options.afterId));
        if (cursorDoc.exists()) {
          productsQuery = query(productsQuery, startAfter(cursorDoc));
        }
      }
      
      // Execute query
      const querySnapshot = await getDocs(productsQuery);
      console.log('Products found:', querySnapshot.size);
      
      // Convert to Product objects
      const products: Product[] = [];
      
      querySnapshot.forEach(doc => {
        const data = doc.data() as Omit<Product, 'id'>;
        products.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? (data.createdAt as any).toDate() : undefined,
          updatedAt: data.updatedAt ? (data.updatedAt as any).toDate() : undefined
        });
      });
      
      return products;
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  /**
   * Get a product by ID
   */
  getProductById(productId: string): Observable<Product | null> {
    return from(this.getProductByIdAsync(productId));
  }

  /**
   * Async implementation of getProductById
   */
  private async getProductByIdAsync(productId: string): Promise<Product | null> {
    try {
      const userId = this.authService.getUserId();
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const householdId = await this.authService.getUserHousehold(userId);
      
      if (!householdId) {
        return null;
      }
      
      const productRef = doc(this.firestore, `households/${householdId}/products/${productId}`);
      const productDoc = await getDoc(productRef);
      
      if (!productDoc.exists()) {
        return null;
      }
      
      const data = productDoc.data() as Omit<Product, 'id'>;
      
      return {
        id: productDoc.id,
        ...data,
        createdAt: data.createdAt ? (data.createdAt as any).toDate() : undefined,
        updatedAt: data.updatedAt ? (data.updatedAt as any).toDate() : undefined
      };
    } catch (error) {
      console.error('Error getting product by ID:', error);
      throw error;
    }
  }
  
  /**
   * Get a product by barcode
   */
  getProductByBarcode(barcode: string): Observable<Product | null> {
    return from(this.getProductByBarcodeAsync(barcode));
  }

  /**
   * Async implementation of getProductByBarcode
   */
  private async getProductByBarcodeAsync(barcode: string): Promise<Product | null> {
    try {
      const userId = this.authService.getUserId();
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const householdId = await this.authService.getUserHousehold(userId);
      
      if (!householdId) {
        return null;
      }
      
      // Create a query for products with matching barcode
      const productsRef = collection(this.firestore, `households/${householdId}/products`);
      const barcodeQuery = query(productsRef, where('barcode', '==', barcode));
      
      const querySnapshot = await getDocs(barcodeQuery);
      
      // If no product matches, return null
      if (querySnapshot.empty) {
        return null;
      }
      
      // Return the first matching product
      const productDoc = querySnapshot.docs[0];
      const data = productDoc.data() as Omit<Product, 'id'>;
      
      return {
        id: productDoc.id,
        ...data,
        createdAt: data.createdAt ? (data.createdAt as any).toDate() : undefined,
        updatedAt: data.updatedAt ? (data.updatedAt as any).toDate() : undefined
      };
    } catch (error) {
      console.error('Error getting product by barcode:', error);
      throw error;
    }
  }

  /**
   * Create a new product
   */
  createProduct(product: ProductCreateDTO): Observable<Product> {
    return from(this.createProductAsync(product));
  }

  /**
   * Async implementation of createProduct
   */
  private async createProductAsync(product: ProductCreateDTO): Promise<Product> {
    try {
      const userId = this.authService.getUserId();
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Get household ID and create if needed
      const householdId = await this.authService.getUserHousehold(userId);
      
      if (!householdId) {
        throw new Error('Failed to create or retrieve household');
      }
      
      const productsRef = collection(this.firestore, `households/${householdId}/products`);
      const newProductRef = doc(productsRef);
      
      const now = new Date();
      const productData = {
        ...product,
        createdAt: now,
        updatedAt: now,
        createdBy: userId
      };
      
      await setDoc(newProductRef, productData);
      
      return {
        id: newProductRef.id,
        ...product,
        createdAt: now,
        updatedAt: now
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Update an existing product
   */
  updateProduct(product: ProductUpdateDTO): Observable<Product> {
    return from(this.updateProductAsync(product));
  }

  /**
   * Async implementation of updateProduct
   */
  private async updateProductAsync(product: ProductUpdateDTO): Promise<Product> {
    try {
      const userId = this.authService.getUserId();
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const householdId = await this.authService.getUserHousehold(userId);
      
      if (!householdId) {
        throw new Error('User does not have a household');
      }
      
      if (!product.id) {
        throw new Error('Product ID is required for update');
      }
      
      const productRef = doc(this.firestore, `households/${householdId}/products/${product.id}`);
      
      // Get the current product to merge with updates
      const productDoc = await getDoc(productRef);
      
      if (!productDoc.exists()) {
        throw new Error('Product not found');
      }
      
      const now = new Date();
      const updateData = {
        ...product,
        updatedAt: now
      };
      
      // Remove the id field as it's not stored in the document
      delete (updateData as any).id;
      
      await updateDoc(productRef, updateData);
      
      // Get the updated product and return it
      const updatedProductDoc = await getDoc(productRef);
      const data = updatedProductDoc.data() as Omit<Product, 'id'>;
      
      return {
        id: product.id,
        ...data,
        createdAt: data.createdAt ? (data.createdAt as any).toDate() : undefined,
        updatedAt: data.updatedAt ? (data.updatedAt as any).toDate() : undefined
      };
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Remove/delete a product
   */
  removeProduct(productId: string): Observable<void> {
    return from(this.removeProductAsync(productId));
  }

  /**
   * Async implementation of removeProduct
   */
  private async removeProductAsync(productId: string): Promise<void> {
    try {
      const userId = this.authService.getUserId();
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const householdId = await this.authService.getUserHousehold(userId);
      
      if (!householdId) {
        throw new Error('User does not have a household');
      }
      
      const productRef = doc(this.firestore, `households/${householdId}/products/${productId}`);
      
      await deleteDoc(productRef);
    } catch (error) {
      console.error('Error removing product:', error);
      throw error;
    }
  }
}