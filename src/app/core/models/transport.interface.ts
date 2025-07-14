// src/app/core/models/transport.interface.ts
import { AppEvent } from './event.interface';
import { EventGroup } from './group.interface';

export type TransportType = 'airplane' | 'bus' | 'train' | 'van' | 'boat';

export interface Transport {
  id: string;
  name: string;
  details: string;
  mapUrl?: string;
  type: TransportType;
  departureTime: Date;
  event?: AppEvent;
  groups?: EventGroup[];
}
