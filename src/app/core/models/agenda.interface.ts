import { AppEvent } from './event.interface';
import { EventGroup } from './group.interface';

export interface EventAgenda {
  id: string;
  startDate: Date;
  endDate: Date;
  title: string;
  description?: string;
  location?: string;
  event: AppEvent;
  groups: EventGroup[];
}
