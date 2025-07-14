import { TransportType } from '@core/models/transport.interface';

export interface UpdateTransportDto {
  name?: string;
  details?: string;
  mapUrl?: string;
  type?: TransportType;
  departureTime?: string; // ISO string format
  groupIds?: string[];
}
