export interface Role {
  id: string;
  nombre: string;
  descripcion: string | null;
}

export interface CustomerProfile {
  id: string;
  direccion: string | null;
  preferencias_json: Record<string, unknown> | null;
}

export interface User {
  id: string;
  email: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  activo: boolean;
  sucursal_id: string | null;
  creado_en: string;
  roles: Role[];
  perfil_cliente: CustomerProfile | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistrationRequest extends LoginRequest {
  nombres: string;
  apellidos: string;
  telefono?: string | null;
  direccion?: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
  user: User;
}
