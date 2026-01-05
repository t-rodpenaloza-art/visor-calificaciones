/**
 * Interfaz que define la estructura de un estudiante
 * La uso para tipar los datos que vienen de la API
 */
export interface Estudiante {
  matricula: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto: string;
}

/**
 * Interfaz para los grupos de mentoría
 * Representa cada grupo donde estoy enrolado como mentor
 */
export interface GrupoMentoria {
  id: number;
  nombre: string;
  clave: string;
  periodo: string;
}

/**
 * Interfaz para los criterios de búsqueda
 * Contiene los campos del formulario de búsqueda
 */
export interface CriteriosBusqueda {
  matricula: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}