export interface CreateEventDto {
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
}
