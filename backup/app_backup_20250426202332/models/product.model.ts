export interface Product {
  id?: string;
  barcode: string;
  name: string;
  brand?: string;
  description?: string;
  size: number;
  unit: string;
  categoryId: string;
  imageUrl?: string;
  defaultQuantity?: number;
  consumptionRate?: 'low' | 'medium' | 'high';
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    [key: string]: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
