import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  BmbContainerButtonComponent,
  BmbInteractiveIconComponent,
  BmbCardComponent,
  BmbCardHeaderComponent,
  BmbCardContentComponent
} from '@ti-tecnologico-de-monterrey-oficial/ds-ng';
import { BuscadorEstudiantesComponent } from '../buscador-estudiantes/buscador-estudiantes.component';
import { ResultadosBusquedaComponent } from '../resultados-busqueda/resultados-busqueda.component';
import { EstudiantesService } from '../../services/estudiantes.service';
import { Estudiante, GrupoMentoria, CriteriosBusqueda } from '../../models/estudiante.model';
import { Router } from '@angular/router';
import { ListGroupsComponent } from "../list-groups/list-groups.component";
import { StateService } from '../../services/state.service';
import { catchError, filter, finalize, from, mergeMap, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiService } from '../../services/api.service';
import { Cursos } from '../../models/canvas.model';

@Component({
  selector: 'app-tarjeta-seguimiento',
  standalone: true,
  imports: [
    CommonModule,
    // Componentes Bamboo según documentación
    BmbContainerButtonComponent,
    BmbInteractiveIconComponent,
    BmbCardComponent,
    BmbCardHeaderComponent,
    BmbCardContentComponent,
    // Componentes propios
    BuscadorEstudiantesComponent,
    ResultadosBusquedaComponent,
    ListGroupsComponent
],
  templateUrl: './tarjeta-seguimiento.component.html',
  styleUrl: './tarjeta-seguimiento.component.scss'
})
export class TarjetaSeguimientoComponent implements OnInit {

  private readonly stateService = inject(StateService);
  private readonly api = inject(ApiService);

  // Acceso a subcuentas desde el StateService
  readonly subAccounts = computed(() => {
    const data = this.stateService.subaccounts();
    if (!data) return [];
    return data;
  });

  // Acceso a courses desde el StateService
  readonly courses = computed(() => {
    const data = this.stateService.courses();
    if (!data) return [];
    // Si es string, parsear; si ya es array, usar directamente
    return data.filter((c:any) => (c?.enrollments && (c?.enrollments[0]?.enrollment_state == "active" || c?.enrollments[0]?.enrollment_state == "completed")));
  });

  public listCourses: Cursos[] = [];

  // Controlo si la vista está expandida o colapsada
  vistaExpandida = false;

  // Lista de grupos de mentoría del mentor
  gruposMentoria: any[] = [];

  // Lista de grupos de mentoría del mentor
  subaccounts: any[] = [];

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

  constructor(private readonly estudiantesService: EstudiantesService, private readonly router: Router) {}

  ngOnInit(): void {
    this.cargarGruposMentoria();
  }

  /**
   * Cargo los grupos de mentoría del mentor al iniciar
   */
  private async cargarGruposMentoria(): Promise<void> {

    return new Promise((res:any) => { 

      let periodo = { term: '202611' };
      let cursos = this.courses();
      let tempMaterias: any[] = [];

      from(this.courses()).pipe(
            mergeMap((cruso: any) => {
              let urlCursos =`${environment.apiManager.baseurl}/tec/cursos-unificados/${cruso.sis_course_id}?ejercicio-academico=${periodo.term}`
              return this.api.genericRequestGet(urlCursos).pipe(
                filter((resp: any) => resp.data[0].attributes.indicadorMateriaTutorias),
                catchError(err => of([]))
              )
            }),
            finalize(() => {
              this.listCourses = tempMaterias;
              res();
            })
          ).subscribe((resp: any) => {
            if (resp?.data) {
              let tempTutoria = cursos.find(curso => curso.sis_course_id?.split('.')[curso.sis_course_id?.split('.').length - 1] == resp.data[0].attributes.numeroReferenciaCurso)
              tempMaterias.push(tempTutoria)
            }
          })

    });
  }

  /**
   * Expando la vista para mostrar el buscador completo
   */
  expandirVista(): void {
    this.router.navigate(['/seguimiento-busqueda']);
  }

  /**
   * Colapso la vista y regreso al estado inicial
   */
  colapsarVista(): void {
    this.router.navigate(['/seguimiento']);
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