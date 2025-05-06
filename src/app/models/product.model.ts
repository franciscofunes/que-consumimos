export interface Product {
  id: string;
  name: string;
  barcode?: string;
  brand?: string;
  categoryId?: string;
  size?: number;
  unit?: string;
  consumptionRate?: 'low' | 'medium' | 'high';
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
  };
  description?: string;
  price?: number;
  quantity?: number;
  purchaseLocation?: string;
  discountPercentage?: number;
  finalPrice?: number;
}

export interface ProductCreateDTO {
  name: string;
  barcode?: string;
  brand?: string;
  categoryId?: string;
  size?: number;
  unit?: string;
  consumptionRate?: 'low' | 'medium' | 'high';
  imageUrl?: string;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
  };
  description?: string;
  price?: number;
  quantity?: number;
  purchaseLocation?: string;
  discountPercentage?: number;
  finalPrice?: number;
}

export interface ProductUpdateDTO {
  id: string;
  name?: string;
  barcode?: string;
  brand?: string;
  categoryId?: string;
  size?: number;
  unit?: string;
  consumptionRate?: 'low' | 'medium' | 'high';
  imageUrl?: string;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
  };
  description?: string;
  price?: number;
  quantity?: number;
  purchaseLocation?: string;
  discountPercentage?: number;
  finalPrice?: number;
}

export interface ProductFilter {
  category?: string;
  consumptionRate?: 'low' | 'medium' | 'high';
  searchTerm?: string;
}

export interface ProductPagination {
  limit: number;
  afterId?: string;
}