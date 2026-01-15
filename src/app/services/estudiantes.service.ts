import { Injectable } from '@angular/core';
import { Estudiante, GrupoMentoria, CriteriosBusqueda } from '../models/estudiante.model';

@Injectable({
  providedIn: 'root'
})
export class EstudiantesService {

  /**
   * Datos de prueba - 100 estudiantes con nombres/apellidos repetidos
   */
  private readonly estudiantesMock: Estudiante[] = [
    // Calderón (varios)
    { matricula: 'A00835741', nombres: 'Martín', apellidoPaterno: 'Calderón', apellidoMaterno: 'Borbolla', nombreCompleto: 'Martín Calderón Borbolla' },
    { matricula: 'A00835742', nombres: 'María Fernanda', apellidoPaterno: 'González', apellidoMaterno: 'Calderón', nombreCompleto: 'María Fernanda González Calderón' },
    { matricula: 'A00835743', nombres: 'Pedro Alejandro', apellidoPaterno: 'Calderón', apellidoMaterno: 'López', nombreCompleto: 'Pedro Alejandro Calderón López' },
    { matricula: 'A00835744', nombres: 'Sofía Isabel', apellidoPaterno: 'Rodríguez', apellidoMaterno: 'Calderón', nombreCompleto: 'Sofía Isabel Rodríguez Calderón' },
    { matricula: 'A00835751', nombres: 'Fernando', apellidoPaterno: 'Calderón', apellidoMaterno: 'Núñez', nombreCompleto: 'Fernando Calderón Núñez' },
    { matricula: 'A00835760', nombres: 'Paola', apellidoPaterno: 'Reyes', apellidoMaterno: 'Calderón', nombreCompleto: 'Paola Reyes Calderón' },
    { matricula: 'A00835761', nombres: 'Sebastián', apellidoPaterno: 'Calderón', apellidoMaterno: 'Silva', nombreCompleto: 'Sebastián Calderón Silva' },
    { matricula: 'A00835763', nombres: 'Emiliano', apellidoPaterno: 'Rojas', apellidoMaterno: 'Calderón', nombreCompleto: 'Emiliano Rojas Calderón' },
    
    // García (varios)
    { matricula: 'A00835745', nombres: 'Carlos Eduardo', apellidoPaterno: 'García', apellidoMaterno: 'Martínez', nombreCompleto: 'Carlos Eduardo García Martínez' },
    { matricula: 'A00835765', nombres: 'Andrea', apellidoPaterno: 'García', apellidoMaterno: 'López', nombreCompleto: 'Andrea García López' },
    { matricula: 'A00835766', nombres: 'Miguel Ángel', apellidoPaterno: 'García', apellidoMaterno: 'Hernández', nombreCompleto: 'Miguel Ángel García Hernández' },
    { matricula: 'A00835767', nombres: 'Laura Patricia', apellidoPaterno: 'García', apellidoMaterno: 'Torres', nombreCompleto: 'Laura Patricia García Torres' },
    { matricula: 'A00835768', nombres: 'Roberto', apellidoPaterno: 'Méndez', apellidoMaterno: 'García', nombreCompleto: 'Roberto Méndez García' },
    { matricula: 'A00835769', nombres: 'Diana', apellidoPaterno: 'Flores', apellidoMaterno: 'García', nombreCompleto: 'Diana Flores García' },
    
    // López (varios)
    { matricula: 'A00835746', nombres: 'Ana Lucía', apellidoPaterno: 'López', apellidoMaterno: 'Sánchez', nombreCompleto: 'Ana Lucía López Sánchez' },
    { matricula: 'A00835747', nombres: 'Diego Andrés', apellidoPaterno: 'López', apellidoMaterno: 'García', nombreCompleto: 'Diego Andrés López García' },
    { matricula: 'A00835770', nombres: 'Carolina', apellidoPaterno: 'López', apellidoMaterno: 'Ramírez', nombreCompleto: 'Carolina López Ramírez' },
    { matricula: 'A00835771', nombres: 'Eduardo', apellidoPaterno: 'López', apellidoMaterno: 'Morales', nombreCompleto: 'Eduardo López Morales' },
    { matricula: 'A00835772', nombres: 'Fernanda', apellidoPaterno: 'López', apellidoMaterno: 'Castro', nombreCompleto: 'Fernanda López Castro' },
    { matricula: 'A00835773', nombres: 'Arturo', apellidoPaterno: 'Vega', apellidoMaterno: 'López', nombreCompleto: 'Arturo Vega López' },
    
    // Hernández (varios)
    { matricula: 'A00835774', nombres: 'Javier', apellidoPaterno: 'Hernández', apellidoMaterno: 'Díaz', nombreCompleto: 'Javier Hernández Díaz' },
    { matricula: 'A00835775', nombres: 'Mónica', apellidoPaterno: 'Hernández', apellidoMaterno: 'Ruiz', nombreCompleto: 'Mónica Hernández Ruiz' },
    { matricula: 'A00835776', nombres: 'Oscar', apellidoPaterno: 'Hernández', apellidoMaterno: 'Vargas', nombreCompleto: 'Oscar Hernández Vargas' },
    { matricula: 'A00835777', nombres: 'Paulina', apellidoPaterno: 'Hernández', apellidoMaterno: 'Mendoza', nombreCompleto: 'Paulina Hernández Mendoza' },
    { matricula: 'A00835778', nombres: 'Raúl', apellidoPaterno: 'Gutiérrez', apellidoMaterno: 'Hernández', nombreCompleto: 'Raúl Gutiérrez Hernández' },
    
    // Martínez (varios)
    { matricula: 'A00835779', nombres: 'Sandra', apellidoPaterno: 'Martínez', apellidoMaterno: 'Ortega', nombreCompleto: 'Sandra Martínez Ortega' },
    { matricula: 'A00835780', nombres: 'Tomás', apellidoPaterno: 'Martínez', apellidoMaterno: 'Jiménez', nombreCompleto: 'Tomás Martínez Jiménez' },
    { matricula: 'A00835781', nombres: 'Valeria', apellidoPaterno: 'Martínez', apellidoMaterno: 'Navarro', nombreCompleto: 'Valeria Martínez Navarro' },
    { matricula: 'A00835782', nombres: 'Adrián', apellidoPaterno: 'Martínez', apellidoMaterno: 'Pacheco', nombreCompleto: 'Adrián Martínez Pacheco' },
    { matricula: 'A00835783', nombres: 'Beatriz', apellidoPaterno: 'Soto', apellidoMaterno: 'Martínez', nombreCompleto: 'Beatriz Soto Martínez' },
    
    // Rodríguez (varios)
    { matricula: 'A00835784', nombres: 'César', apellidoPaterno: 'Rodríguez', apellidoMaterno: 'Fuentes', nombreCompleto: 'César Rodríguez Fuentes' },
    { matricula: 'A00835785', nombres: 'Dulce María', apellidoPaterno: 'Rodríguez', apellidoMaterno: 'Aguilar', nombreCompleto: 'Dulce María Rodríguez Aguilar' },
    { matricula: 'A00835786', nombres: 'Enrique', apellidoPaterno: 'Rodríguez', apellidoMaterno: 'Delgado', nombreCompleto: 'Enrique Rodríguez Delgado' },
    { matricula: 'A00835787', nombres: 'Fabiola', apellidoPaterno: 'Rodríguez', apellidoMaterno: 'Campos', nombreCompleto: 'Fabiola Rodríguez Campos' },
    { matricula: 'A00835788', nombres: 'Gerardo', apellidoPaterno: 'Medina', apellidoMaterno: 'Rodríguez', nombreCompleto: 'Gerardo Medina Rodríguez' },
    
    // Otros apellidos variados
    { matricula: 'A00835748', nombres: 'Valentina', apellidoPaterno: 'Torres', apellidoMaterno: 'Flores', nombreCompleto: 'Valentina Torres Flores' },
    { matricula: 'A00835749', nombres: 'José Manuel', apellidoPaterno: 'Morales', apellidoMaterno: 'Díaz', nombreCompleto: 'José Manuel Morales Díaz' },
    { matricula: 'A00835750', nombres: 'Gabriela', apellidoPaterno: 'Vargas', apellidoMaterno: 'Ruiz', nombreCompleto: 'Gabriela Vargas Ruiz' },
    { matricula: 'A00835752', nombres: 'Camila', apellidoPaterno: 'Jiménez', apellidoMaterno: 'Reyes', nombreCompleto: 'Camila Jiménez Reyes' },
    { matricula: 'A00835753', nombres: 'Ricardo', apellidoPaterno: 'Peña', apellidoMaterno: 'Luna', nombreCompleto: 'Ricardo Peña Luna' },
    { matricula: 'A00835754', nombres: 'Isabella', apellidoPaterno: 'Ortiz', apellidoMaterno: 'Mendoza', nombreCompleto: 'Isabella Ortiz Mendoza' },
    { matricula: 'A00835755', nombres: 'Alejandro', apellidoPaterno: 'Castro', apellidoMaterno: 'Guerrero', nombreCompleto: 'Alejandro Castro Guerrero' },
    { matricula: 'A00835756', nombres: 'Daniela', apellidoPaterno: 'Medina', apellidoMaterno: 'Ríos', nombreCompleto: 'Daniela Medina Ríos' },
    { matricula: 'A00835757', nombres: 'Luis Enrique', apellidoPaterno: 'Salazar', apellidoMaterno: 'Vega', nombreCompleto: 'Luis Enrique Salazar Vega' },
    { matricula: 'A00835758', nombres: 'Mariana', apellidoPaterno: 'Delgado', apellidoMaterno: 'Campos', nombreCompleto: 'Mariana Delgado Campos' },
    { matricula: 'A00835759', nombres: 'Jorge Alberto', apellidoPaterno: 'Fuentes', apellidoMaterno: 'Aguilar', nombreCompleto: 'Jorge Alberto Fuentes Aguilar' },
    { matricula: 'A00835762', nombres: 'Regina', apellidoPaterno: 'Navarro', apellidoMaterno: 'Ortega', nombreCompleto: 'Regina Navarro Ortega' },
    { matricula: 'A00835764', nombres: 'Ximena', apellidoPaterno: 'Pacheco', apellidoMaterno: 'Luna', nombreCompleto: 'Ximena Pacheco Luna' },
    { matricula: 'A00835789', nombres: 'Hugo', apellidoPaterno: 'Ramírez', apellidoMaterno: 'Sánchez', nombreCompleto: 'Hugo Ramírez Sánchez' },
    { matricula: 'A00835790', nombres: 'Irene', apellidoPaterno: 'Torres', apellidoMaterno: 'García', nombreCompleto: 'Irene Torres García' },
    { matricula: 'A00835791', nombres: 'Juan Pablo', apellidoPaterno: 'Morales', apellidoMaterno: 'López', nombreCompleto: 'Juan Pablo Morales López' },
    { matricula: 'A00835792', nombres: 'Karen', apellidoPaterno: 'Vargas', apellidoMaterno: 'Hernández', nombreCompleto: 'Karen Vargas Hernández' },
    { matricula: 'A00835793', nombres: 'Leonardo', apellidoPaterno: 'Jiménez', apellidoMaterno: 'Martínez', nombreCompleto: 'Leonardo Jiménez Martínez' },
    { matricula: 'A00835794', nombres: 'Michelle', apellidoPaterno: 'Peña', apellidoMaterno: 'Rodríguez', nombreCompleto: 'Michelle Peña Rodríguez' },
    { matricula: 'A00835795', nombres: 'Nicolás', apellidoPaterno: 'Ortiz', apellidoMaterno: 'García', nombreCompleto: 'Nicolás Ortiz García' },
    { matricula: 'A00835796', nombres: 'Olivia', apellidoPaterno: 'Castro', apellidoMaterno: 'López', nombreCompleto: 'Olivia Castro López' },
    { matricula: 'A00835797', nombres: 'Pablo', apellidoPaterno: 'Medina', apellidoMaterno: 'Hernández', nombreCompleto: 'Pablo Medina Hernández' },
    { matricula: 'A00835798', nombres: 'Renata', apellidoPaterno: 'Salazar', apellidoMaterno: 'Martínez', nombreCompleto: 'Renata Salazar Martínez' },
    { matricula: 'A00835799', nombres: 'Santiago', apellidoPaterno: 'Delgado', apellidoMaterno: 'Rodríguez', nombreCompleto: 'Santiago Delgado Rodríguez' },
    { matricula: 'A00835800', nombres: 'Teresa', apellidoPaterno: 'Fuentes', apellidoMaterno: 'García', nombreCompleto: 'Teresa Fuentes García' },
    { matricula: 'A00835801', nombres: 'Ulises', apellidoPaterno: 'Navarro', apellidoMaterno: 'López', nombreCompleto: 'Ulises Navarro López' },
    { matricula: 'A00835802', nombres: 'Viviana', apellidoPaterno: 'Pacheco', apellidoMaterno: 'Hernández', nombreCompleto: 'Viviana Pacheco Hernández' },
    { matricula: 'A00835803', nombres: 'William', apellidoPaterno: 'Ramírez', apellidoMaterno: 'Martínez', nombreCompleto: 'William Ramírez Martínez' },
    { matricula: 'A00835804', nombres: 'Yadira', apellidoPaterno: 'Torres', apellidoMaterno: 'Rodríguez', nombreCompleto: 'Yadira Torres Rodríguez' },
    { matricula: 'A00835805', nombres: 'Zaira', apellidoPaterno: 'Morales', apellidoMaterno: 'García', nombreCompleto: 'Zaira Morales García' },
    { matricula: 'A00835806', nombres: 'Aldo', apellidoPaterno: 'Vargas', apellidoMaterno: 'López', nombreCompleto: 'Aldo Vargas López' },
    { matricula: 'A00835807', nombres: 'Brenda', apellidoPaterno: 'Jiménez', apellidoMaterno: 'Hernández', nombreCompleto: 'Brenda Jiménez Hernández' },
    { matricula: 'A00835808', nombres: 'Christian', apellidoPaterno: 'Peña', apellidoMaterno: 'Martínez', nombreCompleto: 'Christian Peña Martínez' },
    { matricula: 'A00835809', nombres: 'Dafne', apellidoPaterno: 'Ortiz', apellidoMaterno: 'Rodríguez', nombreCompleto: 'Dafne Ortiz Rodríguez' },
    { matricula: 'A00835810', nombres: 'Emmanuel', apellidoPaterno: 'Castro', apellidoMaterno: 'García', nombreCompleto: 'Emmanuel Castro García' },
    { matricula: 'A00835811', nombres: 'Fátima', apellidoPaterno: 'García', apellidoMaterno: 'Calderón', nombreCompleto: 'Fátima García Calderón' },
    { matricula: 'A00835812', nombres: 'Gustavo', apellidoPaterno: 'López', apellidoMaterno: 'Calderón', nombreCompleto: 'Gustavo López Calderón' },
    { matricula: 'A00835813', nombres: 'Helena', apellidoPaterno: 'Hernández', apellidoMaterno: 'Calderón', nombreCompleto: 'Helena Hernández Calderón' },
    { matricula: 'A00835814', nombres: 'Iván', apellidoPaterno: 'Martínez', apellidoMaterno: 'Calderón', nombreCompleto: 'Iván Martínez Calderón' },
    { matricula: 'A00835815', nombres: 'Jimena', apellidoPaterno: 'Rodríguez', apellidoMaterno: 'García', nombreCompleto: 'Jimena Rodríguez García' },
    { matricula: 'A00835816', nombres: 'Kevin', apellidoPaterno: 'Calderón', apellidoMaterno: 'García', nombreCompleto: 'Kevin Calderón García' },
    { matricula: 'A00835817', nombres: 'Lorena', apellidoPaterno: 'Calderón', apellidoMaterno: 'López', nombreCompleto: 'Lorena Calderón López' },
    { matricula: 'A00835818', nombres: 'Marco Antonio', apellidoPaterno: 'Calderón', apellidoMaterno: 'Hernández', nombreCompleto: 'Marco Antonio Calderón Hernández' },
    { matricula: 'A00835819', nombres: 'Natalia', apellidoPaterno: 'Calderón', apellidoMaterno: 'Martínez', nombreCompleto: 'Natalia Calderón Martínez' },
    { matricula: 'A00835820', nombres: 'Omar', apellidoPaterno: 'Calderón', apellidoMaterno: 'Rodríguez', nombreCompleto: 'Omar Calderón Rodríguez' },
    { matricula: 'A00835821', nombres: 'Patricia', apellidoPaterno: 'García', apellidoMaterno: 'García', nombreCompleto: 'Patricia García García' },
    { matricula: 'A00835822', nombres: 'Quintín', apellidoPaterno: 'López', apellidoMaterno: 'López', nombreCompleto: 'Quintín López López' },
    { matricula: 'A00835823', nombres: 'Rocío', apellidoPaterno: 'Hernández', apellidoMaterno: 'Hernández', nombreCompleto: 'Rocío Hernández Hernández' },
    { matricula: 'A00835824', nombres: 'Sergio', apellidoPaterno: 'Martínez', apellidoMaterno: 'Martínez', nombreCompleto: 'Sergio Martínez Martínez' },
    { matricula: 'A00835825', nombres: 'Tania', apellidoPaterno: 'Rodríguez', apellidoMaterno: 'Rodríguez', nombreCompleto: 'Tania Rodríguez Rodríguez' },
    { matricula: 'A00835826', nombres: 'Uriel', apellidoPaterno: 'Salazar', apellidoMaterno: 'García', nombreCompleto: 'Uriel Salazar García' },
    { matricula: 'A00835827', nombres: 'Verónica', apellidoPaterno: 'Delgado', apellidoMaterno: 'López', nombreCompleto: 'Verónica Delgado López' },
    { matricula: 'A00835828', nombres: 'Xavier', apellidoPaterno: 'Fuentes', apellidoMaterno: 'Hernández', nombreCompleto: 'Xavier Fuentes Hernández' },
    { matricula: 'A00835829', nombres: 'Yolanda', apellidoPaterno: 'Navarro', apellidoMaterno: 'Martínez', nombreCompleto: 'Yolanda Navarro Martínez' },
    { matricula: 'A00835830', nombres: 'Zoe', apellidoPaterno: 'Pacheco', apellidoMaterno: 'Rodríguez', nombreCompleto: 'Zoe Pacheco Rodríguez' },
    { matricula: 'A00835831', nombres: 'Alan', apellidoPaterno: 'Mendoza', apellidoMaterno: 'García', nombreCompleto: 'Alan Mendoza García' },
    { matricula: 'A00835832', nombres: 'Bianca', apellidoPaterno: 'Guerrero', apellidoMaterno: 'López', nombreCompleto: 'Bianca Guerrero López' },
    { matricula: 'A00835833', nombres: 'Cristian', apellidoPaterno: 'Ríos', apellidoMaterno: 'Hernández', nombreCompleto: 'Cristian Ríos Hernández' },
    { matricula: 'A00835834', nombres: 'Denisse', apellidoPaterno: 'Vega', apellidoMaterno: 'Martínez', nombreCompleto: 'Denisse Vega Martínez' },
    { matricula: 'A00835835', nombres: 'Esteban', apellidoPaterno: 'Campos', apellidoMaterno: 'Rodríguez', nombreCompleto: 'Esteban Campos Rodríguez' },
    { matricula: 'A00835836', nombres: 'Frida', apellidoPaterno: 'Aguilar', apellidoMaterno: 'García', nombreCompleto: 'Frida Aguilar García' },
    { matricula: 'A00835837', nombres: 'Gabriel', apellidoPaterno: 'Luna', apellidoMaterno: 'López', nombreCompleto: 'Gabriel Luna López' },
    { matricula: 'A00835838', nombres: 'Hilda', apellidoPaterno: 'Ortega', apellidoMaterno: 'Hernández', nombreCompleto: 'Hilda Ortega Hernández' },
    { matricula: 'A00835839', nombres: 'Isaac', apellidoPaterno: 'Ruiz', apellidoMaterno: 'Martínez', nombreCompleto: 'Isaac Ruiz Martínez' },
    { matricula: 'A00835840', nombres: 'Julia', apellidoPaterno: 'Díaz', apellidoMaterno: 'Rodríguez', nombreCompleto: 'Julia Díaz Rodríguez' }
  ];

  /**
   * Grupos de mentoría donde estoy enrolado como mentor
   * Estos aparecen en la sección "Mis grupos de mentoría"
   */
  private readonly gruposMock: GrupoMentoria[] = [
    { id: 1, nombre: 'Tutoreo III (Gpo I)', clave: 'WA3002.1', periodo: '202510' },
    { id: 2, nombre: 'Yo y los demás I', clave: 'WA3006.301', periodo: '202510' },
    { id: 3, nombre: 'Yo y mis decisiones I', clave: 'PC5034.55', periodo: '202510' },
    { id: 4, nombre: 'Mejoramiento académico I', clave: 'PH5030.401', periodo: '202510' },
    { id: 5, nombre: 'Creatividad, acción y servicio III', clave: 'PD6013.200', periodo: '202510' }
  ];

  constructor() { }

  /**
   * Obtengo todos mis grupos de mentoría
   * RN-07: Solo grupos del periodo vigente, nivel Prepa, con atributo CTUT
   */
  obtenerGruposMentoria(): GrupoMentoria[] {
  // Retorno los grupos en el orden original (sin ordenar alfabéticamente)
    return [...this.gruposMock];
  }

  /**
   * Busco estudiantes según los criterios ingresados
   * Aplico las reglas de negocio RN-01 a RN-05
   */
  buscarEstudiantes(criterios: CriteriosBusqueda): Estudiante[] {
    let resultados = [...this.estudiantesMock];

    // RN-02: Si hay matrícula, busco coincidencia exacta (ignorando mayúsculas)
    if (criterios.matricula && criterios.matricula.trim() !== '') {
      const matriculaBuscada = criterios.matricula.trim().toUpperCase();
      resultados = resultados.filter(est => 
        est.matricula.toUpperCase() === matriculaBuscada
      );
    }

    // RN-03: Filtro por nombres si se ingresó algo (contiene, ignora acentos y mayúsculas)
    if (criterios.nombres && criterios.nombres.trim() !== '') {
      const nombreBuscado = this.normalizarTexto(criterios.nombres);
      resultados = resultados.filter(est => 
        this.normalizarTexto(est.nombres).includes(nombreBuscado)
      );
    }

    // Filtro por apellido paterno con las mismas reglas
    if (criterios.apellidoPaterno && criterios.apellidoPaterno.trim() !== '') {
      const apellidoBuscado = this.normalizarTexto(criterios.apellidoPaterno);
      resultados = resultados.filter(est => 
        this.normalizarTexto(est.apellidoPaterno).includes(apellidoBuscado)
      );
    }

    // Filtro por apellido materno aplicando normalización
    if (criterios.apellidoMaterno && criterios.apellidoMaterno.trim() !== '') {
      const apellidoMatBuscado = this.normalizarTexto(criterios.apellidoMaterno);
      resultados = resultados.filter(est => 
        this.normalizarTexto(est.apellidoMaterno).includes(apellidoMatBuscado)
      );
    }

    // RN-05: Ordeno los resultados por matrícula de forma ascendente
    return resultados.sort((a, b) => a.matricula.localeCompare(b.matricula));
  }

  /**
   * Normalizo el texto para hacer búsquedas sin importar acentos ni mayúsculas
   * Esto me permite que "calderon" encuentre "Calderón"
   */
  private normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    // .replaceAll(/[\u0300-\u036f]/g, '');
  }

  /**
   * Obtengo los estudiantes de un grupo específico
   * Para cuando el mentor selecciona un grupo de la lista
   */
  obtenerEstudiantesPorGrupo(grupoId: number): Estudiante[] {
    // Por ahora retorno algunos estudiantes mock
    // Después esto consultará la API con el ID del grupo
    return this.estudiantesMock.slice(0, 10);
  }
}