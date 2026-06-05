export interface IPharmacy {
  _id?: string;
  name: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  phone: string;
  whatsapp?: string;
  photo?: string;
  openHours?: string;
  email?: string;
  is24: boolean;
  isActive: boolean;
  isOpen: boolean;
  rating?: number;
  reviews?: number;
  user_id?: string;
  createdAt?: string;
  updatedAt?: string;
}