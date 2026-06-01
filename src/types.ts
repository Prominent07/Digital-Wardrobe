export interface ClothingItem {
  id: string;
  name: string;
  category: 'Top' | 'Bottom' | 'Dress' | 'Outerwear' | 'Shoes' | 'Accessory';
  color: string;
  imageUrl: string;
  brand?: string;
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter' | 'All';
  size?: string;
}

export interface Outfit {
  id: string;
  name: string;
  items: ClothingItem[];
  dateWorn?: string; // YYYY-MM-DD
}
