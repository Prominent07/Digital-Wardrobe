import { ClothingItem, Outfit } from './types';

export const mockCloset: ClothingItem[] = [
  {
    id: '1',
    name: 'Silk Camisole',
    category: 'Top',
    color: 'Ivory',
    brand: 'Anine Bing',
    season: 'Summer',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '2',
    name: 'Tailored Wide Leg Trousers',
    category: 'Bottom',
    color: 'Beige',
    brand: 'The Frankie Shop',
    season: 'All',
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '3',
    name: 'Oversized Blazer',
    category: 'Outerwear',
    color: 'Camel',
    brand: 'Everlane',
    season: 'Fall',
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '4',
    name: 'Knit Midi Dress',
    category: 'Dress',
    color: 'Olive',
    brand: 'Reformation',
    season: 'All',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '5',
    name: 'Leather Loafers',
    category: 'Shoes',
    color: 'Black',
    brand: 'Gucci',
    season: 'All',
    imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '6',
    name: 'Cashmere Cardigan',
    category: 'Top',
    color: 'Soft Pink',
    brand: 'Naadam',
    season: 'Winter',
    imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600',
  },
];

export const mockOutfits: Outfit[] = [
  {
    id: 'o1',
    name: 'Office Chic',
    items: [mockCloset[0], mockCloset[1], mockCloset[2], mockCloset[4]],
    dateWorn: new Date().toISOString().split('T')[0],
  }
];
