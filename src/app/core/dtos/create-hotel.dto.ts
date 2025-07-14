export interface CreateHotelDto {
  name: string;
  address: string;
  eventId: string;
  phone?: string;
  mapUrl?: string;
  photoUrl?: string;
}
