export interface Client {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  phone_number?: string;
  email?: string;
}

export interface Realtor {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  commission_rate?: number;
}

export type PropertyType = 'apartment' | 'house' | 'land';

export interface Property {
  id: number;
  title: string;
  description?: string;
  price: number;
  city?: string;
  street?: string;
  house_number?: string;
  apartment_number?: string;
  latitude?: number | null;
  longitude?: number | null;
  property_type: PropertyType;
  floor?: number | null; // Только для квартир
  total_floors?: number | null; // Только для домов
  rooms?: number | null; // Для квартир и домов
  area?: number | null; // Для всех типов
  created_at: string;
}
