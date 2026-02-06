import { Component, EventEmitter, Input, Output, OnChanges, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BmbContainerButtonComponent, BmbPaginatorComponent } from '@ti-tecnologico-de-monterrey-oficial/ds-ng';
import { Estudiante } from '../../models/estudiante.model';

@Component({
  selector: 'app-resultados-busqueda',
  standalone: true,
  imports: [
    CommonModule,
    BmbContainerButtonComponent,
    BmbPaginatorComponent
  ],
  templateUrl: './resultados-busqueda.component.html',
  styleUrl: './resultados-busqueda.component.scss'
})
export class ResultadosBusquedaComponent implements OnChanges {

  // Lista completa de estudiantes encontrados
  estudiantes = input<any[]>([]);
  
  // Indica si ya se realizó una búsqueda (para mostrar mensaje de sin resultados)
  @Input() busquedaRealizada = false;

  // Notifico al padre cuando seleccionan un estudiante
  @Output() estudianteSeleccionado = new EventEmitter<Estudiante>();

  // Notifico al padre cuando quieren volver a ver los grupos
  @Output() volver = new EventEmitter<void>();

  // RN-05: Paginación de 10 en 10
  readonly resultadosPorPagina = 10;
  paginaActual = 1;

  /**
   * Calculo el total de páginas según los resultados
   */
  get totalPaginas(): number {
    return Math.ceil(this.estudiantes().length / this.resultadosPorPagina);
  }

  /**
   * Obtengo solo los estudiantes de la página actual
   */
  get estudiantesPaginados(): Estudiante[] {
    const inicio = (this.paginaActual - 1) * this.resultadosPorPagina;
    const fin = inicio + this.resultadosPorPagina;
    return this.estudiantes().slice(inicio, fin);
  }

  /**
   * Calculo el índice inicial para mostrar "1-10 de 24"
   */
  get indiceInicio(): number {
    return (this.paginaActual - 1) * this.resultadosPorPagina + 1;
  }

  /**
   * Calculo el índice final para el indicador de paginación
   */
  get indiceFin(): number {
    const fin = this.paginaActual * this.resultadosPorPagina;
    return Math.min(fin, this.estudiantes().length);
  }

  /**
   * Manejo cambio de página desde el paginador de Bamboo
   */
  onPageChange(page: number): void {
    this.paginaActual = page;
  }

  /**
   * Manejo la selección de un estudiante
   * RN-05: Al seleccionar, se abre su tablero integral
   */
  seleccionarEstudiante(estudiante: Estudiante): void {
    this.estudianteSeleccionado.emit(estudiante);
  }

  /**
   * Vuelvo a mostrar los grupos de mentoría
   */
  volverAGrupos(): void {
    this.volver.emit();
  }

  /**
   * Reinicio la paginación cuando cambian los resultados
   */
  ngOnChanges(): void {
    this.paginaActual = 1;
  }
}