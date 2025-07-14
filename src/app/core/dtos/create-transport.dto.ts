import { TransportType } from '@core/models/transport.interface';
export interface CreateTransportDto {
  name: string;
  details: string;
  mapUrl?: string;
  type: TransportType;
  departureTime: string; // ISO string format
  eventId: string;
  groupIds: string[];
}
