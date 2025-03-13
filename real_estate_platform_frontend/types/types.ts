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
  full_address: string;
}

export interface Offer {
  id: number;
  client: Client; // ID клиента
  property: Property; // ID недвижимости
  realtor: Realtor | null; // ID риэлтора (может быть null)
  price: number; // Положительное целое число
  created_at: string; // Дата создания
  fulfilled: boolean;
}

export interface OfferMutationInput {
  client: number;
  property: number;
  realtor?: number;
  price: number;
}

export interface Demand {
  id: number;
  client: Client; // ID клиента
  realtor: Realtor | null; // ID риэлтора (может быть null)
  property_type: 'apartment' | 'house' | 'land'; // Тип недвижимости
  address: Property; // Адрес
  min_price: number; // Минимальная цена
  max_price: number; // Максимальная цена

  // Дополнительные поля для квартир и домов
  min_area?: number; // Мин. площадь
  max_area?: number; // Макс. площадь
  min_rooms?: number; // Мин. комнаты
  max_rooms?: number; // Макс. комнаты
  min_floor?: number; // Мин. этаж (только для квартиры)
  max_floor?: number; // Макс. этаж (только для квартиры)
  min_total_floors?: number; // Мин. этажность (только для дома)
  max_total_floors?: number; // Макс. этажность (только для дома)

  created_at: string; // Дата создания
  fulfilled: boolean;
}

export interface DemandMutationInput {
  client: number; // ID клиента
  realtor: number; // ID риэлтора (может быть null)
  property_type: 'apartment' | 'house' | 'land'; // Тип недвижимости
  address: number; // Адрес
  min_price: number; // Минимальная цена
  max_price: number; // Максимальная цена

  // Дополнительные поля для квартир и домов
  min_area?: number; // Мин. площадь
  max_area?: number; // Макс. площадь
  min_rooms?: number; // Мин. комнаты
  max_rooms?: number; // Макс. комнаты
  min_floor?: number; // Мин. этаж (только для квартиры)
  max_floor?: number; // Макс. этаж (только для квартиры)
  min_total_floors?: number; // Мин. этажность (только для дома)
  max_total_floors?: number; // Макс. этажность (только для дома)
}

export interface Deal {
  id: number;
  offer: number; // ID предложения
  demand: number; // ID потребности
  created_at: string; // Дата создания сделки

  // Комиссии
  seller_fee: number; // Комиссия с продавца
  buyer_fee: number; // Комиссия с покупателя
  company_share: number; // Отчисления компании
  realtor_share: number; // Отчисления риэлтору

  // Детали сделки (опционально для удобства работы в UI)
  offer_details: {
    id: number;
    price: number;
    property: string; // full_address
    fulfilled: boolean;
  };
  demand_details: {
    id: number;
    min_price: number;
    max_price: number;
    property_type: string;
    fulfilled: boolean;
  };
}

export interface SnackbarNotificationProps {
  open: boolean;
  onCloseAction?: () => void;
  message: string;
  severity?: 'success' | 'error' | 'warning' | 'info';
}
