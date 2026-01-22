// src/app/core/dtos/app-menu.dto.ts

/**
 * DTO for creating a new App Menu configuration
 */
export interface CreateAppMenuDto {
  eventId: string;
  transporte?: boolean;
  alimentos?: boolean;
  codigoVestimenta?: boolean;
  ponentes?: boolean;
  encuestas?: boolean;
  hotel?: boolean;
  agenda?: boolean;
  atencionMedica?: boolean;
  sede?: boolean;
}

/**
 * DTO for updating an existing App Menu configuration
 * All fields are optional - only send the fields you want to update
 */
export interface UpdateAppMenuDto {
  transporte?: boolean;
  alimentos?: boolean;
  codigoVestimenta?: boolean;
  ponentes?: boolean;
  encuestas?: boolean;
  hotel?: boolean;
  agenda?: boolean;
  atencionMedica?: boolean;
  sede?: boolean;
}
