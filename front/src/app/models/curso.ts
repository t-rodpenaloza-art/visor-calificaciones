import { Calificacion } from "./calificacion";
import { Falta } from './falta';

export interface Curso {

    nombreCurso: string;
    claveCurso: string;
    numeroReferenciaCurso: string;
    id: string;
    limiteFaltasMock: number;
    calificaciones: Calificacion;
    faltas: Falta;
    nFaltasMock: number;
    sis_course_id: string,
    user_id: string,
    course_code: string,
    enrollments: any,
    term: any
}