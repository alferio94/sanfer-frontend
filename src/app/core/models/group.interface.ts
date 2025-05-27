import { EventAgenda } from './agenda.interface';
import { EventUserAssignment } from './event-user-assigment.interface';
import { AppEvent } from './event.interface';

export interface EventGroup {
  id: string;
  name: string;
  color: string;
  event?: AppEvent;
  activities?: EventAgenda[];
  assignments?: EventUserAssignment[];
}
