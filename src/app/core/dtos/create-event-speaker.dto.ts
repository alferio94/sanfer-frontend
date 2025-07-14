export interface CreateSpeakerDto {
  name: string;
  presentation: string;
  specialty: string;
  photoUrl?: string;
  eventId: string;
}
