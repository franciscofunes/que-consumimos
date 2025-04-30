import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ProductCategory } from '../../models/product-category.model';

@Injectable({
  providedIn: 'root'
})
export class FirestoreSeedService {
  constructor(private firestore: AngularFirestore) {}

  async initializeIfNeeded(): Promise<void> {
    await this.initializeCategories();
  }

  private async initializeCategories(): Promise<void> {
    const categoryDocRef = this.firestore.doc('categories/dairy');
    const categoryDoc = await categoryDocRef.get().toPromise();
    
    if (!categoryDoc?.exists) {
      // Categories don't exist, let's initialize them
      const defaultCategories: ProductCategory[] = [
        { id: 'dairy', name: 'Lácteos', icon: 'milk', description: 'Leche, queso, yogurt, etc.' },
        { id: 'grains', name: 'Granos y Cereales', icon: 'grain', description: 'Arroz, frijoles, pasta, etc.' },
        { id: 'meat', name: 'Carnes', icon: 'meat', description: 'Res, pollo, cerdo, pescado, etc.' },
        { id: 'produce', name: 'Frutas y Verduras', icon: 'apple', description: 'Frutas y vegetales frescos' },
        { id: 'canned', name: 'Enlatados', icon: 'can', description: 'Alimentos enlatados y conservas' },
        { id: 'snacks', name: 'Snacks', icon: 'cookie', description: 'Bocadillos, galletas, chips, etc.' },
        { id: 'beverages', name: 'Bebidas', icon: 'bottle', description: 'Agua, refrescos, jugos, etc.' },
        { id: 'cleaning', name: 'Limpieza', icon: 'cleaning', description: 'Productos de limpieza para el hogar' },
        { id: 'personal', name: 'Cuidado Personal', icon: 'toiletries', description: 'Higiene personal y belleza' },
        { id: 'other', name: 'Otros', icon: 'misc', description: 'Otros productos' }
      ];
      
      // Create each category document
      for (const category of defaultCategories) {
        await this.firestore.doc(`categories/${category.id}`).set(category);
      }
    }
  }
}
