export interface Product {
  id: string;
  name: string;
  barcode?: string;
  brand?: string;
  size?: number;
  unit?: string;
  categoryId?: string;
  description?: string;
  imageUrl?: string;
  consumptionRate?: 'low' | 'medium' | 'high'; // String literal type
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// Add the missing DTO interfaces
export type ProductCreateDTO = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

export type ProductUpdateDTO = Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>;

// Additional helper types you might need
export interface ProductFilter {
  category?: string;
  consumptionRate?: 'low' | 'medium' | 'high';
  searchTerm?: string;
}

export interface ProductPagination {
  limit: number;
  afterId?: string;
}