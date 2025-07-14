import { AppEvent } from './event.interface';

export interface Speaker {
  id: string;
  name: string;
  presentation: string;
  specialty: string;
  photoUrl?: string;
  event?: AppEvent;
}
