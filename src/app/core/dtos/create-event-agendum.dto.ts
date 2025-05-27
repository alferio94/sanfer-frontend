export interface CreateEventAgendumDto {
  startDate: string; // ISO string format
  endDate: string; // ISO string format
  title: string;
  description?: string;
  location?: string;
  eventId: string;
  groupIds: string[];
}
