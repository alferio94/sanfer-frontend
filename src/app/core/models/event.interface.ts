import { EventAgenda } from './agenda.interface';
import { EventUserAssignment } from './event-user-assigment.interface';
import { EventGroup } from './group.interface';
import { Hotel } from './hotel.interface';
import { Speaker } from './speaker.interface';
import { Transport } from './transport.interface';

export interface AppEvent {
  id: string;
  name: string;
  campus?: string;
  campusPhone?: string;
  campusMap?: string;
  dressCode?: string;
  startDate: Date;
  endDate: Date;
  tips?: string;
  extra?: string;
  banner?: string;
  campusImage?: string;
  dressCodeImage?: string;
  groups?: EventGroup[];
  users?: EventUserAssignment[];
  agendas?: EventAgenda[];
  hotels?: Hotel[];
  speakers?: Speaker[]; // Array of speaker IDs
  transports?: Transport[];
}
