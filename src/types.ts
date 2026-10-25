export interface Property {
  id: string;
  code: string;
  title: string;
  type: 'Casa' | 'Apartamento' | 'Terreno' | 'Comercial';
  neighborhood: string;
  city: string;
  price: number;
  bedrooms?: number;
  suites?: number;
  bathrooms?: number;
  parkingSpots?: number;
  areaM2: number;
  featured: boolean;
  images: {
    url: string;
    alt: string;
    recommendedDim: string;
  }[];
  description: string;
  features: string[];
  tag?: string;
}

export interface SearchFilter {
  code: string;
  city: string;
  type: string;
  priceRange: string;
}
