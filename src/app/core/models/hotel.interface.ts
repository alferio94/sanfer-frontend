import { AppEvent } from './event.interface';

export interface Hotel {
  id: string;
  name: string;
  address: string;
  phone?: string;
  mapUrl?: string;
  photoUrl?: string;
  event?: AppEvent;
}
