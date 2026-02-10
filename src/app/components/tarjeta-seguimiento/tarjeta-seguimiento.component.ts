import { Component, computed, inject, OnInit, signal, WritableSignal } from '@angular/core';
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
import { catchError, filter, finalize, from, mergeMap, of, Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiService } from '../../services/api.service';
import { Cursos } from '../../models/canvas.model';
import { FormControl, FormGroup } from '@angular/forms';
import { SearchGrade } from '../../models/searchGrade';

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

  stateAccordion = false;
  public listCourses: WritableSignal<Cursos[]> = signal([]);
  loadingGrade: boolean = false; 

  private serviceTutoresSubscription: Subscription | undefined;

  public BusquedaAlumno: FormGroup = new FormGroup({
    matricula: new FormControl(''),
    nombre: new FormControl(''),
    apellidoPaterno: new FormControl(''),
    apellidoMaterno: new FormControl(''),
  });

  usuario: any = {};


  constructor(
    private _router: Router,
  ) {
  }

  async ngOnInit(): Promise<void> {

    this.usuario = JSON.parse(sessionStorage.getItem('userInfo') ?? '{}');

    this.ObtenerCursos();

    this.loadingGrade = false;
  }


  ngOnDestroy(): void {
    if (this.serviceTutoresSubscription) this.serviceTutoresSubscription.unsubscribe();

  }

  async ObtenerCursos():Promise<void> {
    return new Promise((res:any) => {
      
      this.loadingGrade = true
      let tempMaterias:any = [];
      let nomina: string = "L03532317"; // Aquí deberías obtener la nómina del usuario actual, posiblemente desde el StateService o sessionStorage
      let periodo = JSON.parse(sessionStorage.getItem('term') ?? '{}').term;
      const token = JSON.parse(sessionStorage.getItem('canvas_token') ?? '{}');
      
      // Token Oauth
      // this.api.genericRequestPost({
      //     path: `/api/v1/users/sis_login_id:${nomina}/courses?enrollment_state=active&enrollment_state=complete&include[]=total_scores&state[]=active&include[]=term&include[]=concluded&include[]=teachers&per_page=100`,
      //     method: "GET",
      //     token: token.access_token
      //   },
      //   `${environment.cursos.canvas_azure}/api/Generic`
      // ).subscribe((cursos: Cursos[]) => {

      //Token Admin
      this.api.genericRequestCourses(
        {
          method: "GET",
          params: {
            matricula: nomina,
            periodo: periodo,
            audiencia: "Colaborador" 
          }
        },
        `${environment.cursos.canvas_azure}/api/GetCourses`
      ).subscribe((cursos: Cursos[]) => {

        cursos = cursos.filter((c:any) => (c?.enrollments && (c?.enrollments[0]?.enrollment_state == "active" || c?.enrollments[0]?.enrollment_state == "completed")));
        console.log('Cursos obtenidos para tutorías:', cursos);
        from(cursos).pipe(
          mergeMap((cruso: any) => {
            let urlCursos =`${environment.apiManager.baseurl}/tec/cursos-unificados/${cruso.sis_course_id}?ejercicio-academico=${periodo}`
            return this.api.genericRequestGetAPI(urlCursos).pipe(
              filter((resp: any) => resp.data[0].attributes.indicadorMateriaTutorias),
              //filter((resp: any) => resp.data[0].attributes.numeroReferenciaCurso == 6890),
              catchError(err => of([]))
            )
          }),
          finalize(() => {
            this.loadingGrade = false;
            console.log('Materias de tutoría cargadas:', tempMaterias);
            sessionStorage.setItem('tutoriaCourses', JSON.stringify(tempMaterias));
            this.listCourses.set([...tempMaterias]);
            res();
          })
        ).subscribe((resp: any) => {
          if (resp?.data) {
            let tempTutoria = cursos.find(curso => curso.sis_course_id?.split('.')[curso.sis_course_id?.split('.').length - 1] == resp.data[0].attributes.numeroReferenciaCurso)
            if (tempTutoria) {
              tempMaterias.push(tempTutoria);
            }
          }
        })

      }, error => {
        console.log("Error tutors: ",error)
        this.loadingGrade = false;
        res();
      })


    });
  }

  public goToDashboardGrades(type: string, course: any): void {

    let searchGrades: SearchGrade = new SearchGrade;
    searchGrades.type = type;

    if (type === 'searchStudents') {

      searchGrades.student = this.BusquedaAlumno.value;
      this._router.navigateByUrl('/TableroCalificaciones', {
        state: {
          data: searchGrades
        }
      })

    } else if (type == 'searchGroup') {
      searchGrades.course.id = course.id;
      searchGrades.course.course_code = course.course_code;
      searchGrades.course.name = course.name;
      searchGrades.courses = this.listCourses();
      this._router.navigateByUrl('/TableroCalificaciones', { state: { data: searchGrades } })

    }
  }

  // // Acceso a subcuentas desde el StateService
  // readonly subAccounts = computed(() => {
  //   const data = this.stateService.subaccounts();
  //   if (!data) return [];
  //   return data;
  // });

  // // Acceso a courses desde el StateService
  // readonly courses = computed(() => {
  //   const data = this.stateService.courses();
  //   console.log('Courses cargados en computed:', data);
  //   if (!data) return [];
  //   // Si es string, parsear; si ya es array, usar directamente
  //   return data.filter((c:any) => (c?.enrollments && (c?.enrollments[0]?.enrollment_state == "active" || c?.enrollments[0]?.enrollment_state == "completed")));
  // });

  // public listCourses: Cursos[] = [];

  // Controlo si la vista está expandida o colapsada
  vistaExpandida = false;

  // // Lista de grupos de mentoría del mentor
  // gruposMentoria: any[] = [];

  // // Lista de grupos de mentoría del mentor
  // subaccounts: any[] = [];

  // // Resultados de la búsqueda actual
  // estudiantesEncontrados: Estudiante[] = [];

  // // Indico si ya se realizó una búsqueda
  // busquedaRealizada = false;

  // // Guardo los criterios para persistencia
  // criteriosBusqueda: CriteriosBusqueda = {
  //   matricula: '',
  //   nombres: '',
  //   apellidoPaterno: '',
  //   apellidoMaterno: ''
  // };

  // constructor(private readonly estudiantesService: EstudiantesService, private readonly router: Router) {}

  // ngOnInit(): void {
  //   this.cargarGruposMentoria();
  // }

  // /**
  //  * Cargo los grupos de mentoría del mentor al iniciar
  //  */
  // private async cargarGruposMentoria(): Promise<void> {

  //   return new Promise((res:any) => { 

  //     let periodo = { term: '202611' };
  //     let cursos = this.courses();
  //     let tempMaterias: any[] = [];
  //     console.log('Cursos cargados:', this.courses());
  //     from(cursos).pipe(
  //           mergeMap((cruso: any) => {
  //             let urlCursos =`${environment.apiManager.baseurl}/tec/cursos-unificados/${cruso.sis_course_id}?ejercicio-academico=${periodo.term}`
  //             return this.api.genericRequestGet(urlCursos).pipe(
  //               filter((resp: any) => resp.data[0].attributes.indicadorMateriaTutorias),
  //               catchError(err => of([]))
  //             )
  //           }),
  //           finalize(() => {
  //             this.listCourses = tempMaterias;
  //             res();
  //           })
  //         ).subscribe((resp: any) => {
  //           if (resp?.data) {
  //             let tempTutoria = cursos.find(curso => curso.sis_course_id?.split('.')[curso.sis_course_id?.split('.').length - 1] == resp.data[0].attributes.numeroReferenciaCurso)
  //             tempMaterias.push(tempTutoria)
  //           }
  //         })

  //   });
  // }

  /**
   * Expando la vista para mostrar el buscador completo
   */
  expandirVista(): void {
    this._router.navigate(['/seguimiento/seguimiento-busqueda']);
  }

  /**
   * Colapso la vista y regreso al estado inicial
   */
  colapsarVista(): void {
    this._router.navigate(['/seguimiento']);
  }

  // /**
  //  * Ejecuto la búsqueda con los criterios recibidos del formulario
  //  */
  // realizarBusqueda(criterios: CriteriosBusqueda): void {
  //   this.criteriosBusqueda = { ...criterios };
  //   this.estudiantesEncontrados = this.estudiantesService.buscarEstudiantes(criterios);
  //   this.busquedaRealizada = true;
  // }

  // /**
  //  * Limpio los resultados y muestro de nuevo los grupos
  //  */
  // limpiarBusqueda(): void {
  //   this.criteriosBusqueda = {
  //     matricula: '',
  //     nombres: '',
  //     apellidoPaterno: '',
  //     apellidoMaterno: ''
  //   };
  //   this.estudiantesEncontrados = [];
  //   this.busquedaRealizada = false;
  // }

  // /**
  //  * Manejo la selección de un grupo de mentoría
  //  */
  // abrirGrupo(grupo: GrupoMentoria): void {
  //   console.log('Grupo seleccionado:', grupo);
  //   // Aquí navegarías al tablero del grupo
  // }

  // /**
  //  * Manejo la selección de un estudiante
  //  */
  // abrirEstudiante(estudiante: Estudiante): void {
  //   console.log('Estudiante seleccionado:', estudiante);
  //   // Aquí navegarías al tablero del estudiante
  // }

  // /**
  //  * Handler para acciones de iconos interactivos
  //  */
  // onIconClick(action: string): void {
  //   console.log('Acción:', action);
  // }
}