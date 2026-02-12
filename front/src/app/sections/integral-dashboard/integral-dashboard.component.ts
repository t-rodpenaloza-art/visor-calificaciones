import { Component } from '@angular/core';
import { StudentListComponent } from '../../components/student-list/student-list.component';
import { BmbCardContentComponent } from '@ti-tecnologico-de-monterrey-oficial/ds-ng';
import { TableCoursesComponent } from '../../components/table-courses/table-courses.component';

@Component({
  selector: 'app-integral-dashboard',
  imports: [
    StudentListComponent,
    BmbCardContentComponent,
    TableCoursesComponent
  ],
  templateUrl: './integral-dashboard.component.html',
  styleUrl: './integral-dashboard.component.scss',
})
export class IntegralDashboardComponent {

  alumnoSeleccionado: any = null;

  alumnos: any[] = [
    { matricula: 'A01212345', nombre: 'Juan Pérez', p1: 85, p2: 90, promedio: 87.5, calificacionFinal: 'A', faltasP1: 2, faltasP2: 1, faltasPF: 3, totalFaltas: 6 },
    { matricula: 'A01267890', nombre: 'María López', p1: 78, p2: null, promedio: 80.0, calificacionFinal: 'B', faltasP1: 3, faltasP2: 2, faltasPF: 4, totalFaltas: 9 },
    { matricula: 'A01254321', nombre: 'Carlos García', p1: 92, p2: 88, promedio: 90.0, calificacionFinal: 'A', faltasP1: 1, faltasP2: 0, faltasPF: 2, totalFaltas: 3 },
    { matricula: 'A01298765', nombre: 'Ana Martínez', p1: 70, p2: 75, promedio: 72.5, calificacionFinal: 'C', faltasP1: 4, faltasP2: 3, faltasPF: 5, totalFaltas: 12 },
    { matricula: 'A01224680', nombre: 'Luis Rodríguez', p1: 88, p2: 91, promedio: 89.5, calificacionFinal: 'A', faltasP1: 2, faltasP2: 1, faltasPF: 3, totalFaltas: 6 }
  ];

  courses: any[] = [
    { grupo: 'CS101', materia: 'Introducción a la Programación', calificacionParcial1: 85, calificacionParcial2: 90, promedioAcumulado: 87.5, calificacionFinal: 'A', faltasP1: 2, faltasP2: 1, faltasPF: 3, totalFaltas: 6 },
    { grupo: 'CS102', materia: 'Estructuras de Datos', calificacionParcial1: 78, calificacionParcial2: null, promedioAcumulado: 80.0, calificacionFinal: 'B', faltasP1: 3, faltasP2: 2, faltasPF: 4, totalFaltas: 9 },
    { grupo: 'CS103', materia: 'Algoritmos', calificacionParcial1: 92, calificacionParcial2: 88, promedioAcumulado: 90.0, calificacionFinal: 'A', faltasP1: 1, faltasP2: 0, faltasPF: 2, totalFaltas: 3 },
    { grupo: 'CS104', materia: 'Bases de Datos', calificacionParcial1: 70, calificacionParcial2: 75, promedioAcumulado: 72.5, calificacionFinal: 'C', faltasP1: 4, faltasP2: 3, faltasPF: 5, totalFaltas: 12 },
    { grupo: 'CS105', materia: 'Sistemas Operativos', calificacionParcial1: 60, calificacionParcial2: 60, promedioAcumulado: null, calificacionFinal: 'A', faltasP1: 2, faltasP2: 1, faltasPF: 3, totalFaltas: 6 }
  ]

  onAlumnoSeleccionado(alumno: any): void {
    this.alumnoSeleccionado = alumno;
    console.log('Alumno seleccionado en dashboard:', this.alumnoSeleccionado);
  }

}
