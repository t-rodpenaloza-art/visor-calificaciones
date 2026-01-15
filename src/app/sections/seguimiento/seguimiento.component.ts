import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BmbCardComponent, BmbCardContentComponent, BmbCardHeaderComponent, BmbContainerButtonComponent, BmbInteractiveIconComponent } from '@ti-tecnologico-de-monterrey-oficial/ds-ng';
import { BuscadorEstudiantesComponent } from "../../components/buscador-estudiantes/buscador-estudiantes.component";
import { ResultadosBusquedaComponent } from "../../components/resultados-busqueda/resultados-busqueda.component";
import { CriteriosBusqueda, Estudiante, GrupoMentoria } from '../../models/estudiante.model';
import { EstudiantesService } from '../../services/estudiantes.service';
import { ListGroupsComponent } from "../../components/list-groups/list-groups.component";

@Component({
  selector: 'app-seguimiento',
  imports: [
    // Angular Common Module para directivas como ngFor
    CommonModule,
    // Componentes Bamboo según documentación
    BmbContainerButtonComponent,
    BmbInteractiveIconComponent,
    BmbCardComponent,
    BmbCardHeaderComponent,
    BmbCardContentComponent,
    BuscadorEstudiantesComponent,
    ResultadosBusquedaComponent,
    ListGroupsComponent
],
  templateUrl: './seguimiento.component.html',
  styleUrl: './seguimiento.component.scss'
})
export class SeguimientoComponent {

  // Controlo si la vista está expandida o colapsada
    vistaExpandida = false;
  
    // Lista de grupos de mentoría del mentor
    gruposMentoria: GrupoMentoria[] = [];
  
    // Resultados de la búsqueda actual
    estudiantesEncontrados: Estudiante[] = [];
  
    // Indico si ya se realizó una búsqueda
    busquedaRealizada = false;
  
    // Guardo los criterios para persistencia
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
      // Aquí navegarías al tablero del grupo
    }
  
    /**
     * Manejo la selección de un estudiante
     */
    abrirEstudiante(estudiante: Estudiante): void {
      console.log('Estudiante seleccionado:', estudiante);
      // Aquí navegarías al tablero del estudiante
    }
  
    /**
     * Handler para acciones de iconos interactivos
     */
    onIconClick(action: string): void {
      console.log('Acción:', action);
    }
}
