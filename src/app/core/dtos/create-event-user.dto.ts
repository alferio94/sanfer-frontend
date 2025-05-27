export interface CreateEventUserDto {
  name: string;
  email: string;
  password?: string;
  groups?: string[];
}
