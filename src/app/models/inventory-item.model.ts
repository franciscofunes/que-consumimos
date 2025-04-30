export interface InventoryItem {
  id?: string;
  productBarcode: string;
  quantity: number;
  purchaseDate?: Date;
  expiryDate?: Date;
  price?: number;
  location?: string;
  notes?: string;
  addedAt: Date;
  addedBy?: string;
}
