import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private firestore: Firestore) {}

  getProducts(): Observable<Product[]> {
    const productsRef = collection(this.firestore, 'products');
    return from(getDocs(productsRef)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, ...data } as Product;
        });
      })
    );
  }

  getProductByBarcode(barcode: string): Observable<Product | null> {
    const productsRef = collection(this.firestore, 'products');
    const q = query(productsRef, where('barcode', '==', barcode));
    
    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (snapshot.empty) {
          return null;
        }
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Product;
      })
    );
  }

  addProduct(product: Product): Observable<Product> {
    const productsRef = collection(this.firestore, 'products');
    return from(addDoc(productsRef, {
      ...product,
      createdAt: new Date(),
      updatedAt: new Date()
    })).pipe(
      map(docRef => {
        return { id: docRef.id, ...product } as Product;
      })
    );
  }

  updateProduct(product: Product): Observable<void> {
    if (!product.id) {
      throw new Error('Product ID is required for update');
    }
    const productRef = doc(this.firestore, `products/${product.id}`);
    return from(updateDoc(productRef, {
      ...product,
      updatedAt: new Date()
    }));
  }

  deleteProduct(productId: string): Observable<void> {
    const productRef = doc(this.firestore, `products/${productId}`);
    return from(deleteDoc(productRef));
  }
}
