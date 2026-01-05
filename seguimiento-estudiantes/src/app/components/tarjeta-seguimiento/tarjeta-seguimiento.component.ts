import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuscadorEstudiantesComponent } from '../buscador-estudiantes/buscador-estudiantes.component';
import { ResultadosBusquedaComponent } from '../resultados-busqueda/resultados-busqueda.component';
import { EstudiantesService } from '../../services/estudiantes.service';
import { Estudiante, GrupoMentoria, CriteriosBusqueda } from '../../models/estudiante.model';

@Component({
  selector: 'app-tarjeta-seguimiento',
  standalone: true,
  imports: [
    CommonModule,
    BuscadorEstudiantesComponent,
    ResultadosBusquedaComponent
  ],
  templateUrl: './tarjeta-seguimiento.component.html',
  styleUrl: './tarjeta-seguimiento.component.scss'
})
export class TarjetaSeguimientoComponent implements OnInit {

  // Controlo si la vista está expandida o colapsada
  vistaExpandida = false;

  // Lista de grupos de mentoría del mentor
  gruposMentoria: GrupoMentoria[] = [];

  // Resultados de la búsqueda actual
  estudiantesEncontrados: Estudiante[] = [];

  // Indico si ya se realizó una búsqueda
  busquedaRealizada = false;

  // Guardo los criterios para persistencia (RN-06)
  criteriosBusqueda: CriteriosBusqueda = {
    matricula: '',
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: ''
  };

  constructor(private readonly estudiantesService: EstudiantesService) {}

  ngOnInit(): void {
    this.cargarGruposMentoria();
  }

  /**
   * Cargo los grupos de mentoría del mentor al iniciar
   */
  private cargarGruposMentoria(): void {
    this.gruposMentoria = this.estudiantesService.obtenerGruposMentoria();
  }

  /**
   * Expando la vista para mostrar el buscador completo
   */
  expandirVista(): void {
    this.vistaExpandida = true;
  }

  /**
   * Colapso la vista y regreso al estado inicial
   */
  colapsarVista(): void {
    this.vistaExpandida = false;
    this.limpiarBusqueda();
  }

  /**
   * Ejecuto la búsqueda con los criterios recibidos del formulario
   */
  realizarBusqueda(criterios: CriteriosBusqueda): void {
    this.criteriosBusqueda = { ...criterios };
    this.estudiantesEncontrados = this.estudiantesService.buscarEstudiantes(criterios);
    this.busquedaRealizada = true;
  }

  /**
   * Limpio los resultados y muestro de nuevo los grupos
   */
  limpiarBusqueda(): void {
    this.criteriosBusqueda = {
      matricula: '',
      nombres: '',
      apellidoPaterno: '',
      apellidoMaterno: ''
    };
    this.estudiantesEncontrados = [];
    this.busquedaRealizada = false;
  }

  /**
   * Manejo la selección de un grupo de mentoría
   */
  abrirGrupo(grupo: GrupoMentoria): void {
    console.log('Grupo seleccionado:', grupo);
    alert(`Navegando al tablero del grupo: ${grupo.nombre}`);
  }

  /**
   * Manejo la selección de un estudiante
   */
  abrirEstudiante(estudiante: Estudiante): void {
    console.log('Estudiante seleccionado:', estudiante);
    alert(`Navegando al tablero de: ${estudiante.nombreCompleto}`);
  }
}