export interface UpdateEventAgendumDto {
  startDate?: string;
  endDate?: string;
  title?: string;
  description?: string;
  location?: string;
  eventId?: string;
  groupIds?: string[];
}
