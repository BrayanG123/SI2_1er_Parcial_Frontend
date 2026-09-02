export interface City {
  id: string;
  nombre: string;
  departamento: string | null;
}

export interface Branch {
  id: string;
  ciudad_id: string;
  nombre: string;
  direccion: string;
  telefono: string | null;
  horario_informativo: string;
  activa: boolean;
  ciudad: City;
}

export interface CityWrite {
  nombre: string;
  departamento: string | null;
}

export interface BranchWrite {
  ciudad_id: string;
  nombre: string;
  direccion: string;
  telefono: string | null;
  horario_informativo: string;
  activa: boolean;
}
