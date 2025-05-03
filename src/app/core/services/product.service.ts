import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc, startAfter, where } from '@angular/fire/firestore';
import { Product, ProductCreateDTO } from '../../models/product.model';
import { AuthService } from './auth.service';

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

  async getProducts(options: GetProductsOptions = {}): Promise<Product[]> {
    try {
      const userId = this.authService.getUserId();
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const householdId = await this.authService.getUserHousehold(userId);
      
      if (!householdId) {
        return [];
      }
      
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
      throw error;
    }
  }

  async getProductById(productId: string): Promise<Product | null> {
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
  
  // Add a method to get product by barcode
  async getProductByBarcode(barcode: string): Promise<Product | null> {
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

  async createProduct(product: ProductCreateDTO): Promise<Product> {
    try {
      const userId = this.authService.getUserId();
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const householdId = await this.authService.getUserHousehold(userId);
      
      if (!householdId) {
        throw new Error('User does not have a household');
      }
      
      const productsRef = collection(this.firestore, `households/${householdId}/products`);
      const newProductRef = doc(productsRef);
      
      const now = new Date();
      const productData = {
        ...product,
        createdAt: now,
        updatedAt: now
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
}