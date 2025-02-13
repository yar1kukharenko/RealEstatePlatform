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
