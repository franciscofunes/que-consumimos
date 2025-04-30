export interface Product {
  id: string;
  name: string;
  barcode?: string;
  imageUrl?: string;
  size?: string;
  unit?: string;
  categoryId?: string;
  consumptionRate?: number;
  brand?: string;
  description?: string;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    [key: string]: any;
  };
  [key: string]: any; // Index signature for additional properties
}

// A partial version of the Product for creation where ID is optional
export interface ProductCreateDTO extends Omit<Product, 'id'> {
  id?: string;
}

// A minimal version for updates
export interface ProductUpdateDTO {
  id: string;
  [key: string]: any;
}