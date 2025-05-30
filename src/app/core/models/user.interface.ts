import { EventUserAssignment } from './event-user-assigment.interface';
import { EventGroup } from './group.interface';

export interface EventUser {
  id: string;
  name: string;
  email: string;
  password?: string; // Opcional, generalmente no se devuelve del backend
  events?: EventUserAssignment[];
  assignedGroups: EventGroup[];
}
