export interface Household {
  id?: string;
  name: string;
  members: string[];
  createdAt: Date;
  createdBy?: string;
}
