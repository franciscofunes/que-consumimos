import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDocs, query, where } from '@angular/fire/firestore';
import { ProductCategory } from '../../models/product-category.model';
import { Product } from '../../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class FirestoreSeedService {
  constructor(private firestore: Firestore) {}

  async seedDatabase() {
    console.log('Starting database seeding...');
    
    await this.seedCategories();
    await this.seedSampleProducts();
    
    console.log('Database seeding completed!');
  }

  private async seedCategories() {
    const categories: ProductCategory[] = [
      { id: 'dairy', name: 'Dairy', icon: 'milk' },
      { id: 'grains', name: 'Grains & Cereals', icon: 'grain' },
      { id: 'meat', name: 'Meat & Poultry', icon: 'meat' },
      { id: 'produce', name: 'Fruits & Vegetables', icon: 'produce' },
      { id: 'canned', name: 'Canned Goods', icon: 'can' },
      { id: 'snacks', name: 'Snacks', icon: 'cookie' },
      { id: 'beverages', name: 'Beverages', icon: 'bottle' },
      { id: 'cleaning', name: 'Cleaning Products', icon: 'cleaning' },
      { id: 'personal', name: 'Personal Care', icon: 'personal' },
      { id: 'other', name: 'Others', icon: 'misc' }
    ];

    const categoriesRef = collection(this.firestore, 'categories');
    
    for (const category of categories) {
      await setDoc(doc(categoriesRef, category.id), category);
    }
    
    console.log(`Seeded ${categories.length} categories`);
  }

  private async seedSampleProducts() {
    const sampleProducts: Partial<Product>[] = [
      {
        barcode: '7501055311507',
        name: 'Arroz SOS',
        size: 1000,
        unit: 'g',
        categoryId: 'grains',
        defaultQuantity: 1,
        consumptionRate: 'medium',
        imageUrl: '/assets/sample-products/rice.jpg',
        nutritionalInfo: {
          calories: 130,
          protein: 2.7,
          carbs: 28,
          fats: 0.3
        }
      },
      {
        barcode: '7501000911301',
        name: 'Leche Alpura',
        size: 1,
        unit: 'l',
        categoryId: 'dairy',
        defaultQuantity: 2,
        consumptionRate: 'high',
        imageUrl: '/assets/sample-products/milk.jpg',
        nutritionalInfo: {
          calories: 120,
          protein: 8,
          carbs: 12,
          fats: 8
        }
      },
      {
        barcode: '7501052471235',
        name: 'Frijoles La Sierra',
        size: 540,
        unit: 'g',
        categoryId: 'canned',
        defaultQuantity: 3,
        consumptionRate: 'low',
        imageUrl: '/assets/sample-products/beans.jpg',
        nutritionalInfo: {
          calories: 130,
          protein: 8,
          carbs: 24,
          fats: 0.5
        }
      }
    ];

    const productsRef = collection(this.firestore, 'products');
    
    for (const product of sampleProducts) {
      // Use barcode as document ID for easier lookups later
      await setDoc(doc(productsRef, product.barcode), {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    console.log(`Seeded ${sampleProducts.length} sample products`);
  }

  async seedSampleHousehold() {
    const householdId = "sample-household";
    const householdRef = doc(this.firestore, 'households', householdId);
    
    // Create a household
    await setDoc(householdRef, {
      name: "Sample Family",
      members: ["User 1", "User 2"],
      createdAt: new Date()
    });
    
    // Now create some inventory items for this household
    const inventoryRef = collection(this.firestore, `households/${householdId}/inventory`);
    
    const inventoryItems = [
      {
        productBarcode: '7501055311507', // Rice
        quantity: 2,
        purchaseDate: new Date(),
        expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
        location: 'pantry'
      },
      {
        productBarcode: '7501000911301', // Milk
        quantity: 3,
        purchaseDate: new Date(),
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 14)),
        location: 'refrigerator'
      }
    ];
    
    for (const item of inventoryItems) {
      await setDoc(doc(inventoryRef), {
        ...item,
        addedAt: new Date()
      });
    }
    
    console.log(`Seeded sample household with ${inventoryItems.length} inventory items`);
  }

  async isDatabaseSeeded(): Promise<boolean> {
    const categoriesRef = collection(this.firestore, 'categories');
    const categoriesSnapshot = await getDocs(categoriesRef);
    
    return !categoriesSnapshot.empty;
  }

  async initializeIfNeeded() {
    const isSeeded = await this.isDatabaseSeeded();
    
    if (!isSeeded) {
      console.log('Database not seeded, running seed process...');
      await this.seedDatabase();
      await this.seedSampleHousehold();
    } else {
      console.log('Database already seeded, skipping seed process.');
    }
  }
}
