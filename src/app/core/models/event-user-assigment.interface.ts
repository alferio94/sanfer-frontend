import { AppEvent } from './event.interface';
import { EventGroup } from './group.interface';
import { EventUser } from './user.interface';

export interface EventUserAssignment {
  id: string;
  user: EventUser;
  event: AppEvent;
  groups: EventGroup[];
}
