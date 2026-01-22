# App Menu API - Guia de Integracion

## Descripcion General

El modulo **App Menu** permite configurar que secciones/funcionalidades estan visibles en la aplicacion movil para cada evento. Cada evento tiene **exactamente un** menu de configuracion (relacion 1:1).

**Base URL**: `https://api.sanfer.com/api` (ajustar segun ambiente)

---

## Secciones Configurables

| Campo              | Descripcion                     | Default |
| ------------------ | ------------------------------- | ------- |
| `transporte`       | Seccion de transporte/traslados | `true`  |
| `alimentos`        | Seccion de comidas/catering     | `true`  |
| `codigoVestimenta` | Informacion de dress code       | `true`  |
| `ponentes`         | Lista de speakers/ponentes      | `true`  |
| `encuestas`        | Encuestas del evento            | `true`  |
| `hotel`            | Informacion de hospedaje        | `true`  |
| `agenda`           | Calendario/agenda del evento    | `true`  |
| `atencionMedica`   | Servicios medicos               | `true`  |
| `sede`             | Informacion del venue/sede      | `true`  |

---

# SECCION 1: ADMIN PANEL (Frontend Web)

Esta seccion es para el equipo de **frontend del panel administrativo**.

## Autenticacion Requerida

Todos los endpoints de admin requieren el header:

```
Authorization: Bearer <admin_jwt_token>
```

El token se obtiene del login de administrador (`POST /api/usuarios/login`).

---

## Endpoint 1: Crear Menu para un Evento

Usar cuando se crea un nuevo evento y se quiere configurar su menu inicial.

**NOTA**: Si no se crea manualmente, el sistema crea uno automatico con todos los valores en `true` cuando la app movil lo solicite.

```http
POST /api/app-menu
Authorization: Bearer <admin_token>
Content-Type: application/json
```

### Request Body

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "transporte": true,
  "alimentos": true,
  "codigoVestimenta": false,
  "ponentes": true,
  "encuestas": true,
  "hotel": false,
  "agenda": true,
  "atencionMedica": false,
  "sede": true
}
```

| Campo              | Tipo    | Requerido | Descripcion     |
| ------------------ | ------- | --------- | --------------- |
| `eventId`          | UUID    | **Si**    | ID del evento   |
| `transporte`       | boolean | No        | Default: `true` |
| `alimentos`        | boolean | No        | Default: `true` |
| `codigoVestimenta` | boolean | No        | Default: `true` |
| `ponentes`         | boolean | No        | Default: `true` |
| `encuestas`        | boolean | No        | Default: `true` |
| `hotel`            | boolean | No        | Default: `true` |
| `agenda`           | boolean | No        | Default: `true` |
| `atencionMedica`   | boolean | No        | Default: `true` |
| `sede`             | boolean | No        | Default: `true` |

### Response Exitosa (201 Created)

```json
{
  "message": "App menu creado exitosamente",
  "appMenu": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "eventId": "550e8400-e29b-41d4-a716-446655440000",
    "transporte": true,
    "alimentos": true,
    "codigoVestimenta": false,
    "ponentes": true,
    "encuestas": true,
    "hotel": false,
    "agenda": true,
    "atencionMedica": false,
    "sede": true
  }
}
```

### Errores Posibles

| Status             | Descripcion                                                  |
| ------------------ | ------------------------------------------------------------ |
| `400 Bad Request`  | Validacion fallida (eventId no es UUID, campo no es boolean) |
| `401 Unauthorized` | Token invalido o expirado                                    |
| `409 Conflict`     | Ya existe un menu para este evento                           |

---

## Endpoint 2: Actualizar Menu de un Evento

Usar para modificar la configuracion del menu existente.

```http
PUT /api/app-menu/event/{eventId}
Authorization: Bearer <admin_token>
Content-Type: application/json
```

### Request Body

Solo enviar los campos que se desean modificar:

```json
{
  "ponentes": false,
  "encuestas": false,
  "hotel": true
}
```

| Campo              | Tipo    | Requerido |
| ------------------ | ------- | --------- |
| `transporte`       | boolean | No        |
| `alimentos`        | boolean | No        |
| `codigoVestimenta` | boolean | No        |
| `ponentes`         | boolean | No        |
| `encuestas`        | boolean | No        |
| `hotel`            | boolean | No        |
| `agenda`           | boolean | No        |
| `atencionMedica`   | boolean | No        |
| `sede`             | boolean | No        |

### Response Exitosa (200 OK)

```json
{
  "message": "App menu actualizado exitosamente",
  "appMenu": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "eventId": "550e8400-e29b-41d4-a716-446655440000",
    "transporte": true,
    "alimentos": true,
    "codigoVestimenta": false,
    "ponentes": false,
    "encuestas": false,
    "hotel": true,
    "agenda": true,
    "atencionMedica": false,
    "sede": true
  }
}
```

### Errores Posibles

| Status             | Descripcion                     |
| ------------------ | ------------------------------- |
| `400 Bad Request`  | eventId no es UUID valido       |
| `401 Unauthorized` | Token invalido o expirado       |
| `404 Not Found`    | No existe menu para este evento |

---

## Endpoint 3: Eliminar Menu de un Evento

Usar con precaucion. Elimina la configuracion del menu.

```http
DELETE /api/app-menu/event/{eventId}
Authorization: Bearer <admin_token>
```

### Response Exitosa (204 No Content)

Sin body de respuesta.

### Errores Posibles

| Status             | Descripcion                     |
| ------------------ | ------------------------------- |
| `400 Bad Request`  | eventId no es UUID valido       |
| `401 Unauthorized` | Token invalido o expirado       |
| `404 Not Found`    | No existe menu para este evento |

---

## Ejemplo de Integracion en Admin Panel (TypeScript/Angular)

```typescript
// app-menu.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface AppMenu {
  id: string;
  eventId: string;
  transporte: boolean;
  alimentos: boolean;
  codigoVestimenta: boolean;
  ponentes: boolean;
  encuestas: boolean;
  hotel: boolean;
  agenda: boolean;
  atencionMedica: boolean;
  sede: boolean;
}

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

export type UpdateAppMenuDto = Partial<Omit<AppMenu, "id" | "eventId">>;

@Injectable({ providedIn: "root" })
export class AppMenuService {
  private readonly baseUrl = "/api/app-menu";

  constructor(private http: HttpClient) {}

  create(dto: CreateAppMenuDto): Observable<{ message: string; appMenu: AppMenu }> {
    return this.http.post<{ message: string; appMenu: AppMenu }>(this.baseUrl, dto);
  }

  getByEventId(eventId: string): Observable<{ message: string; appMenu: AppMenu }> {
    return this.http.get<{ message: string; appMenu: AppMenu }>(`${this.baseUrl}/event/${eventId}`);
  }

  update(eventId: string, dto: UpdateAppMenuDto): Observable<{ message: string; appMenu: AppMenu }> {
    return this.http.put<{ message: string; appMenu: AppMenu }>(`${this.baseUrl}/event/${eventId}`, dto);
  }

  delete(eventId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/event/${eventId}`);
  }
}
```

### Ejemplo de Componente de Configuracion

```typescript
// event-menu-config.component.ts
@Component({
  selector: "app-event-menu-config",
  template: `
    <form [formGroup]="menuForm" (ngSubmit)="saveConfig()">
      <h3>Configuracion de Menu para la App</h3>

      <div class="toggle-list">
        <mat-slide-toggle formControlName="transporte">Transporte</mat-slide-toggle>
        <mat-slide-toggle formControlName="alimentos">Alimentos</mat-slide-toggle>
        <mat-slide-toggle formControlName="codigoVestimenta">Codigo de Vestimenta</mat-slide-toggle>
        <mat-slide-toggle formControlName="ponentes">Ponentes</mat-slide-toggle>
        <mat-slide-toggle formControlName="encuestas">Encuestas</mat-slide-toggle>
        <mat-slide-toggle formControlName="hotel">Hotel</mat-slide-toggle>
        <mat-slide-toggle formControlName="agenda">Agenda</mat-slide-toggle>
        <mat-slide-toggle formControlName="atencionMedica">Atencion Medica</mat-slide-toggle>
        <mat-slide-toggle formControlName="sede">Sede</mat-slide-toggle>
      </div>

      <button mat-raised-button color="primary" type="submit">Guardar Configuracion</button>
    </form>
  `,
})
export class EventMenuConfigComponent implements OnInit {
  menuForm: FormGroup;
  eventId: string;

  constructor(
    private fb: FormBuilder,
    private appMenuService: AppMenuService,
    private route: ActivatedRoute,
  ) {
    this.menuForm = this.fb.group({
      transporte: [true],
      alimentos: [true],
      codigoVestimenta: [true],
      ponentes: [true],
      encuestas: [true],
      hotel: [true],
      agenda: [true],
      atencionMedica: [true],
      sede: [true],
    });
  }

  ngOnInit() {
    this.eventId = this.route.snapshot.params["eventId"];
    this.loadCurrentConfig();
  }

  loadCurrentConfig() {
    this.appMenuService.getByEventId(this.eventId).subscribe({
      next: (response) => {
        const { id, eventId, ...menuConfig } = response.appMenu;
        this.menuForm.patchValue(menuConfig);
      },
      error: (err) => console.error("Error loading menu config", err),
    });
  }

  saveConfig() {
    this.appMenuService.update(this.eventId, this.menuForm.value).subscribe({
      next: () => alert("Configuracion guardada!"),
      error: (err) => console.error("Error saving config", err),
    });
  }
}
```

---

# SECCION 2: APP MOVIL (React Native / Expo)

Esta seccion es para el equipo de **desarrollo mobile**.

## Autenticacion Requerida

El endpoint de lectura requiere el header:

```
Authorization: Bearer <event_user_jwt_token>
```

El token se obtiene del login de usuario de evento (`POST /api/event-user/login`).

---

## Endpoint: Obtener Menu del Evento

```http
GET /api/app-menu/event/{eventId}
Authorization: Bearer <event_user_token>
```

### Comportamiento Especial

**IMPORTANTE**: Este endpoint tiene logica "smart":

- Si existe configuracion para el evento, la retorna
- Si NO existe configuracion, **crea automaticamente** una con todos los valores en `true` y la retorna

Esto garantiza que la app **nunca falle** por falta de configuracion.

### Response (200 OK)

```json
{
  "message": "App menu obtenido exitosamente",
  "appMenu": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "eventId": "550e8400-e29b-41d4-a716-446655440000",
    "transporte": true,
    "alimentos": true,
    "codigoVestimenta": false,
    "ponentes": true,
    "encuestas": true,
    "hotel": false,
    "agenda": true,
    "atencionMedica": false,
    "sede": true
  }
}
```

### Errores Posibles

| Status             | Descripcion               |
| ------------------ | ------------------------- |
| `400 Bad Request`  | eventId no es UUID valido |
| `401 Unauthorized` | Token invalido o expirado |

---

## Ejemplo de Integracion en React Native / Expo

### Types

```typescript
// types/app-menu.ts
export interface AppMenu {
  id: string;
  eventId: string;
  transporte: boolean;
  alimentos: boolean;
  codigoVestimenta: boolean;
  ponentes: boolean;
  encuestas: boolean;
  hotel: boolean;
  agenda: boolean;
  atencionMedica: boolean;
  sede: boolean;
}

export interface AppMenuResponse {
  message: string;
  appMenu: AppMenu;
}
```

### API Service

```typescript
// services/app-menu.service.ts
import { api } from "./api"; // tu instancia de axios/fetch configurada
import { AppMenu, AppMenuResponse } from "../types/app-menu";

export const appMenuService = {
  getByEventId: async (eventId: string): Promise<AppMenu> => {
    const response = await api.get<AppMenuResponse>(`/app-menu/event/${eventId}`);
    return response.data.appMenu;
  },
};
```

### Hook con React Query

```typescript
// hooks/useAppMenu.ts
import { useQuery } from "@tanstack/react-query";
import { appMenuService } from "../services/app-menu.service";
import { AppMenu } from "../types/app-menu";

export const useAppMenu = (eventId: string) => {
  return useQuery<AppMenu>({
    queryKey: ["appMenu", eventId],
    queryFn: () => appMenuService.getByEventId(eventId),
    staleTime: 1000 * 60 * 5, // 5 minutos - la config no cambia frecuentemente
  });
};
```

### Hook con Zustand (alternativa)

```typescript
// stores/app-menu.store.ts
import { create } from "zustand";
import { AppMenu } from "../types/app-menu";
import { appMenuService } from "../services/app-menu.service";

interface AppMenuState {
  menu: AppMenu | null;
  isLoading: boolean;
  error: string | null;
  fetchMenu: (eventId: string) => Promise<void>;
  isFeatureEnabled: (feature: keyof Omit<AppMenu, "id" | "eventId">) => boolean;
}

export const useAppMenuStore = create<AppMenuState>((set, get) => ({
  menu: null,
  isLoading: false,
  error: null,

  fetchMenu: async (eventId: string) => {
    set({ isLoading: true, error: null });
    try {
      const menu = await appMenuService.getByEventId(eventId);
      set({ menu, isLoading: false });
    } catch (error) {
      set({ error: "Error al cargar configuracion", isLoading: false });
    }
  },

  isFeatureEnabled: (feature) => {
    const { menu } = get();
    return menu ? menu[feature] : true; // default true si no hay config
  },
}));
```

### Componente de Navegacion Dinamica

```tsx
// components/EventNavigation.tsx
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useAppMenu } from "../hooks/useAppMenu";
import { useNavigation } from "@react-navigation/native";

interface NavItem {
  key: keyof AppMenu;
  label: string;
  screen: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: "agenda", label: "Agenda", screen: "Agenda", icon: "calendar" },
  { key: "ponentes", label: "Ponentes", screen: "Speakers", icon: "users" },
  {
    key: "encuestas",
    label: "Encuestas",
    screen: "Surveys",
    icon: "clipboard",
  },
  { key: "transporte", label: "Transporte", screen: "Transport", icon: "bus" },
  { key: "hotel", label: "Hotel", screen: "Hotel", icon: "building" },
  { key: "alimentos", label: "Alimentos", screen: "Food", icon: "utensils" },
  {
    key: "codigoVestimenta",
    label: "Dress Code",
    screen: "DressCode",
    icon: "tshirt",
  },
  {
    key: "atencionMedica",
    label: "Atencion Medica",
    screen: "Medical",
    icon: "medkit",
  },
  { key: "sede", label: "Sede", screen: "Venue", icon: "map-marker" },
];

interface Props {
  eventId: string;
}

export const EventNavigation: React.FC<Props> = ({ eventId }) => {
  const { data: menu, isLoading, error } = useAppMenu(eventId);
  const navigation = useNavigation();

  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }

  if (error || !menu) {
    return <Text>Error cargando menu</Text>;
  }

  // Filtrar solo las secciones habilitadas
  const enabledItems = NAV_ITEMS.filter((item) => menu[item.key]);

  return (
    <View style={styles.container}>
      {enabledItems.map((item) => (
        <TouchableOpacity key={item.key} style={styles.navItem} onPress={() => navigation.navigate(item.screen as never)}>
          {/* <Icon name={item.icon} size={24} /> */}
          <Text style={styles.label}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  navItem: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    textAlign: "center",
  },
});
```

### Context Provider (alternativa a Zustand)

```tsx
// contexts/AppMenuContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AppMenu } from "../types/app-menu";
import { appMenuService } from "../services/app-menu.service";

interface AppMenuContextValue {
  menu: AppMenu | null;
  isLoading: boolean;
  isFeatureEnabled: (feature: keyof Omit<AppMenu, "id" | "eventId">) => boolean;
  refreshMenu: () => Promise<void>;
}

const AppMenuContext = createContext<AppMenuContextValue | null>(null);

interface Props {
  eventId: string;
  children: ReactNode;
}

export const AppMenuProvider: React.FC<Props> = ({ eventId, children }) => {
  const [menu, setMenu] = useState<AppMenu | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMenu = async () => {
    setIsLoading(true);
    try {
      const data = await appMenuService.getByEventId(eventId);
      setMenu(data);
    } catch (error) {
      console.error("Error fetching app menu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [eventId]);

  const isFeatureEnabled = (feature: keyof Omit<AppMenu, "id" | "eventId">): boolean => {
    return menu ? menu[feature] : true;
  };

  return <AppMenuContext.Provider value={{ menu, isLoading, isFeatureEnabled, refreshMenu: fetchMenu }}>{children}</AppMenuContext.Provider>;
};

export const useAppMenuContext = () => {
  const context = useContext(AppMenuContext);
  if (!context) {
    throw new Error("useAppMenuContext must be used within AppMenuProvider");
  }
  return context;
};
```

---

# SECCION 3: NOTAS IMPORTANTES

## Flujo Recomendado

```
1. Admin crea evento en panel
   |
2. Admin configura menu (opcional - si no, se crea default)
   |
3. Usuario abre app movil
   |
4. App llama GET /api/app-menu/event/{eventId}
   |
5. Backend retorna config (o crea default si no existe)
   |
6. App renderiza solo las secciones habilitadas
```

## Consideraciones de Cache

- **Admin Panel**: No cachear, siempre mostrar data fresca
- **App Movil**: Cachear por 5-10 minutos (la config no cambia frecuentemente)
- Invalidar cache si el usuario hace "pull to refresh" en home

## Manejo de Errores

| Escenario        | Comportamiento Recomendado                |
| ---------------- | ----------------------------------------- |
| 401 Unauthorized | Redirigir a login                         |
| Network Error    | Mostrar ultimo estado cacheado o defaults |
| 500 Server Error | Mostrar mensaje generico, usar defaults   |

## Valores Default (Fallback)

Si la app no puede obtener la configuracion, usar estos defaults:

```typescript
const DEFAULT_MENU: Omit<AppMenu, "id" | "eventId"> = {
  transporte: true,
  alimentos: true,
  codigoVestimenta: true,
  ponentes: true,
  encuestas: true,
  hotel: true,
  agenda: true,
  atencionMedica: true,
  sede: true,
};
```

---

## Contacto

Para dudas sobre la API, contactar al equipo de backend.

---

_Documento generado el: Enero 2026_
_Version API: 1.0_
