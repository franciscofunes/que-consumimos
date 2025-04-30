import { Injectable, inject } from '@angular/core';
import { Observable, map, from, of } from 'rxjs';

// Modern Firebase imports
import { Firestore, collection, doc, getDoc, getDocs, query, where, collectionData, docData, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';

// Import the product model
import { Product, ProductCreateDTO, ProductUpdateDTO } from '../../models/product.model';

// Type guard to check if a property exists on a product
function hasProperty(obj: any, prop: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, prop) && obj[prop] !== undefined;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private firestore: Firestore = inject(Firestore);
  
  constructor() { }

  getProductByBarcode(barcode: string): Observable<Product | null> {
    const productsRef = collection(this.firestore, 'products');
    const q = query(productsRef, where('barcode', '==', barcode));
    
    return from(getDocs(q)).pipe(
      map(actions => {
        if (actions.empty) {
          return null;
        }
        
        const doc = actions.docs[0];
        const data = doc.data();
        const id = doc.id;
        
        return { id, ...data } as Product;
      })
    );
  }
  
  getProductById(id: string): Observable<Product | null> {
    const productRef = doc(this.firestore, `products/${id}`);
    
    return from(getDoc(productRef)).pipe(
      map(doc => {
        if (!doc.exists()) {
          return null;
        }
        
        const data = doc.data();
        return { id: doc.id, ...data } as Product;
      })
    );
  }
  
  getAllProducts(): Observable<Product[]> {
    const productsRef = collection(this.firestore, 'products');
    
    return collectionData(productsRef, { idField: 'id' }) as Observable<Product[]>;
  }
  
  searchProducts(term: string): Observable<Product[]> {
    if (!term.trim()) {
      return of([]);
    }
    
    const searchTerm = term.toLowerCase();
    const productsRef = collection(this.firestore, 'products');
    
    // Since Firestore doesn't support direct text search, we'll fetch all products
    // and filter client-side (for small collections)
    return collectionData(productsRef, { idField: 'id' }).pipe(
      map(products => 
        products.filter(product => {
          const nameMatch = hasProperty(product, 'name') && 
            product['name'].toLowerCase().includes(searchTerm);
          const descMatch = hasProperty(product, 'description') && 
            product['description'].toLowerCase().includes(searchTerm);
          return nameMatch || descMatch;
        }) as Product[]
      )
    );
  }

  // Methods to match exactly what's being called in the effects
  createProduct(product: ProductCreateDTO): Observable<Product> {
    const productsRef = collection(this.firestore, 'products');
    
    // Remove the id field if it exists, as Firestore will generate one
    const { id, ...productData } = product;
    
    return from(addDoc(productsRef, productData)).pipe(
      map(docRef => {
        return {
          id: docRef.id,
          ...productData
        } as Product;
      })
    );
  }

  updateProduct(product: ProductUpdateDTO): Observable<void> {
    const { id, ...updateData } = product;
    if (!id) {
      throw new Error('Product ID is required for updating');
    }
    
    const productRef = doc(this.firestore, `products/${id}`);
    return from(updateDoc(productRef, updateData));
  }

  removeProduct(productId: string): Observable<void> {
    if (!productId) {
      throw new Error('Product ID is required for removal');
    }
    
    const productRef = doc(this.firestore, `products/${productId}`);
    return from(deleteDoc(productRef));
  }
}