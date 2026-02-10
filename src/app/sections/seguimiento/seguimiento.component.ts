import { Component, output, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BmbCardComponent, BmbCardContentComponent, BmbCardHeaderComponent, BmbContainerButtonComponent, BmbHomeCardComponent, BmbInteractiveIconComponent, IBmbActionHeader } from '@ti-tecnologico-de-monterrey-oficial/ds-ng';
import { BuscadorEstudiantesComponent } from "../../components/buscador-estudiantes/buscador-estudiantes.component";
import { ResultadosBusquedaComponent } from "../../components/resultados-busqueda/resultados-busqueda.component";
import { CriteriosBusqueda, Estudiante, GrupoMentoria } from '../../models/estudiante.model';
import { EstudiantesService } from '../../services/estudiantes.service';
import { ListGroupsComponent } from "../../components/list-groups/list-groups.component";
import { BehaviorSubject, concatMap, finalize, from, map, mergeMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { StudentsByCourse } from '../../models/studentsbyCourses';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SearchGrade } from '../../models/searchGrade';
import { CoursesByStudent } from '../../models/coursesByStudent';
import { Calificacion, ICalificacion } from '../../models/calificacion';
import { Falta } from '../../models/canvas.model';
import { HtmlcanvasService } from '../../services/htmlcanvas.service';
import { Curso } from '../../models/curso';
import moment from 'moment';

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
    ListGroupsComponent,
    BmbHomeCardComponent
  ],
  templateUrl: './seguimiento.component.html',
  styleUrl: './seguimiento.component.scss'
})
export class SeguimientoComponent {


  actionsHeader: IBmbActionHeader[] = [
      {
      icon: 'mood',
      action: () => alert('Información sobre el seguimiento de estudiantes')
    },
    {
      icon: 'info',
      action: () => alert('Información sobre el seguimiento de estudiantes')
    }
  ]

  public returnToHome = output<void>() // nueva version

  banderaSubcuentas: boolean = false;
  subaccountsPrepa: any[] = []
  subaccountsPrepa$: BehaviorSubject<any> = new BehaviorSubject([]);
  ratingStudent: any;

  private term: string | null = null; 
  private routeState: any | null = null;
  public fuenteInfo: string = '';
  canvasUrl = environment.cursos.canvas;
  public nombre = '';

  public alumnoSeleccionado: any = {
    cursos: []
  };

  loadingInfo: boolean = false;

  public alunmosList: WritableSignal<any[]> = signal([]);
  public searchGrades: any;
  public loadingGrade: boolean = false;
  public loadingStudent: boolean = false;
  public infoStudent: StudentsByCourse = new StudentsByCourse;
  mostrarMas = true;
  permisosCanvas: boolean = false;

  public DatosAlumnos = new FormGroup({
    matricula: new FormControl(''),
    nombre: new FormControl(''),
    apellidoPaterno: new FormControl(''),
    apellidoMaterno: new FormControl('')
  });

  userProperties: any = {};

  constructor(
    private _router: Router,
    private api: ApiService,
    // private readonly redirect_canvas: RedirecCanvasService,
    private pdf: HtmlcanvasService,
    private readonly estudiantesService: EstudiantesService
  ) {
    
    this.userProperties = JSON.parse(sessionStorage.getItem('userInfo') ?? '{}');

    this.getSubAccounts();

    if (this._router.getCurrentNavigation()?.extras.state) {

      this.routeState = this._router.getCurrentNavigation()?.extras.state;
      this.searchGrades = this.routeState.data;
      this.fuenteInfo = this.searchGrades.type;

    }

    // this.redirect_canvas.validateRToken();
    // this.redirect_canvas.tokenObserve$.subscribe(async (resp) => {
      this.permisosCanvas = true
      if (this.permisosCanvas && this.searchGrades) {
        if (this.searchGrades.type === 'searchStudents') {
          this.nombre = `${this.searchGrades.student.matricula} ${this.searchGrades.student.nombre} ${this.searchGrades.student.apellidoPaterno} ${this.searchGrades.student.apellidoMaterno}`;
          this.InitFormGroupStudent();
          this.GetStudentsByFilter();
        } else if (this.searchGrades.type === 'searchGroup') {
          this.GetStudentsByGroup();
        }
      }
    // })
  }

  async getSubAccounts(): Promise<void> {

    let prepas = ['PREP', 'PREP-L', 'PREPA'];
    let subCuentas: any[] = [];

    if (prepas.some((e:any) => localStorage.getItem(`subcuentas${e}`) == null) || prepas.some((e:any) => !moment(JSON.parse(localStorage.getItem(`subcuentas${e}`) ?? '[]').date).isSame(moment(), "day"))) {
      
      this.banderaSubcuentas = true;

      from(prepas).pipe(
        mergeMap((id: any) =>

          this.api.genericRequestPost(
            {
              path: `/api/v1/accounts/sis_account_id:${id}/sub_accounts?recursive=true&per_page=100`,
              method: 'GET',
              audiencia: this.userProperties.employeeType
            },
            `${environment.cursos.canvas_azure}/api/GenericFather`
          ).pipe(map((result: any) => {
            if (result.indexOf('Error') !== -1) {
              return;
            }

            const allSubs = result;
            const subs: any[] = [];
            allSubs.forEach((sub: any) => {
              subs.push(sub.id);
            });

            localStorage.setItem(`subcuentas${id}`, JSON.stringify({
              cuenta: id,
              ids: subs,
              date: moment()
            }))

            return subs;

          }))
        ),
        finalize(() => {
          // comentar
          this.subaccountsPrepa = subCuentas;
          //this.subaccountsPrepa = subCuentas;
          this.subaccountsPrepa.push(5);
          this.subaccountsPrepa.push(12);
          this.subaccountsPrepa.push(310);
          this.subaccountsPrepa$.next(subCuentas)
          // console.log("finalizo las 2 peticiones");
        })
      ).subscribe((resp: any) => { subCuentas.push(...resp); })
    } else {
      prepas.forEach((e:any) => {
        this.subaccountsPrepa.push(...JSON.parse(localStorage.getItem(`subcuentas${e}`)  ?? '[]').ids);
      })
      this.subaccountsPrepa.push(5);
      this.subaccountsPrepa.push(12);
      this.subaccountsPrepa$.next(this.subaccountsPrepa)
    }

  }

  private GetStudentsByGroup(): void {
    const token = JSON.parse(sessionStorage.getItem('canvas_token') ?? '{}');
    // console.log(this.searchGrades)
    this.loadingGrade = true;
    // this._tutorService.GetStudentsByCourse(this.searchGrades.course.id).subscribe((students: StudentsByCourse[]) => {
    this.api.genericRequestPost(
      {
        "path": `/api/v1/courses/${this.searchGrades.course.id}/users?enrollment_state[]=active&enrollment_state[]=completed&per_page=100`,
        "method": "GET",
        "audiencia": "Colaborador"
      },`${environment.cursos.canvas_azure}/api/GenericFather`
    ).subscribe((students: any[]) => {

      this.term = JSON.parse(sessionStorage.getItem('term') || '{}').term;

      this.alunmosList.set(students.filter(resp => resp.login_id.startsWith('A') && resp.login_id.length === 9));
      if (this.alunmosList() && this.alunmosList().length == 0) {
        this.loadingGrade = false;
        this.alunmosList.set([]);
      } else {
        // console.log(students)
        // console.log(this.alunmosList)
        this.MostrarInfoAlumno(this.alunmosList()[0])
      }

    }, err => {
      this.loadingGrade = false;
    });

  }

  private InitFormGroupStudent() {
    this.DatosAlumnos.get("matricula")?.setValue(this.searchGrades.student.matricula);
    this.DatosAlumnos.get("nombre")?.setValue(this.searchGrades.student.nombre);
    this.DatosAlumnos.get("apellidoPaterno")?.setValue(this.searchGrades.student.apellidoPaterno);
    this.DatosAlumnos.get("apellidoMaterno")?.setValue(this.searchGrades.student.apellidoMaterno);
  }

  private GetStudentsByFilter(): void {
    this.loadingGrade = true;
    this.loadingStudent = true;
    this.term = JSON.parse(sessionStorage.getItem('term') || '{}').term;
    // console.log(this.term)


    let apellidoPaterno: string = this.searchGrades.student.apellidoPaterno === '' ? '' : `apellidoPaterno=${this.searchGrades.student.apellidoPaterno}&`;
    let apellidoMaterno: string = this.searchGrades.student.apellidoMaterno === '' ? '' : `apellidoMaterno=${this.searchGrades.student.apellidoMaterno}&`;
    let lastname: string = (apellidoPaterno + apellidoMaterno).trim();
    let name: string = this.searchGrades.student.nombre === '' ? '' : `nombre=${this.searchGrades.student.nombre}&`;
    let matricula: string = this.searchGrades.student.matricula === '' ? '' : `numeroMatricula=${this.searchGrades.student.matricula}&`;
    let periodo: string = `ejercicio-academico=${this.term}&`

    // this._tutorService.SearchStudents(this.searchGrades.student, this.term).subscribe((resultStudents: any) => {

    let urlSearch: any = environment.production ? `${environment.apiManager.baseurl}/tec/alumnos?${name}${lastname}${matricula}${periodo}nivel-academico=03&fields[alumnos]=nombre,apellidos,campus,region,nivel-academico,programa-academico,semestre` :
      "https://run.mocky.io/v3/44045f72-8451-4895-9796-0545bce55aaf";
    this.api.genericRequestGetAPI(urlSearch).subscribe((resultStudents: any) => {

      let estudiantes = resultStudents.data.map((student: any) => {
        student.nombrePrograma = resultStudents.included.find((programa: any) => programa.id === student.relationships['programa-academico'].data.id)
        student.name = student.attributes.nombre + ' ' + student.attributes.apellidos
        student.login_id = student.id;
        student.campus = resultStudents.included.find((campus: any) => campus.id === student.relationships.campus.data.id)
        student.semestre = student.relationships.semestre.data.id + " semestre"
        return student;
      })
      this.alunmosList.set(estudiantes);
      this.loadingGrade = false;
      this.loadingStudent = false;
      console.log(this.alunmosList())
      if (this.alunmosList().length != 0) this.MostrarInfoAlumno(this.alunmosList()[0])
    }, err => {
      this.loadingStudent = false;
      this.loadingGrade = false;
    })
  }

  public SearchStudents(): void {

    this.searchGrades = new SearchGrade();
    this.alunmosList.set([])
    this.alumnoSeleccionado = { cursos: [] };

    this.fuenteInfo = 'searchStudents';
    this.searchGrades.student = { ...this.DatosAlumnos.value }
    this.nombre = `${this.searchGrades.student.matricula} ${this.searchGrades.student.nombre} ${this.searchGrades.student.apellidoPaterno} ${this.searchGrades.student.apellidoMaterno}`;
    this.GetStudentsByFilter();
  }

  public InfoGrupo(course: CoursesByStudent): void {
    this.searchGrades.course = course;
    this.GetStudentsByGroup();
  }

  public MostrarInfoAlumno(student: any): void {

    this.loadingInfo = true;
    this.loadingGrade = true;
    this.alumnoSeleccionado.cursos = [];
    let listGroupByStudent: any[] = [];
    let subcuentas: any[] = [];
    let periodo = JSON.parse(sessionStorage.getItem('term') || '{}').term;

    this.subaccountsPrepa$.pipe(
      concatMap((resp:any): any => {
        if (resp.lenght === 0) return;
        subcuentas = resp
        const token = JSON.parse(sessionStorage.getItem('canvas_token') ?? '{}');
        return this.api.genericRequestCourses(
          {
            method: "GET",
            params: {
              matricula: student.login_id,
              periodo: periodo,
              audiencia: "Alumno TecMty"
            }
          },
          `${environment.cursos.canvas_azure}/api/GetCourses`
          )
      })).subscribe(async (courses: any) => {

        courses = courses.filter((c: any) => c.enrollments[0].enrollment_state == "active" || c.enrollments[0].enrollment_state == "completed");
        
        let tipoConsulta: string = '';
        let tipoConsultaPROD: string = 'limiteFaltas,faltasAlumno,faltasPrimerParcial,faltasSegundoParcial,faltasTercerParcial,faltasFinal,faltasCursosFIT,calificacionPrimerParcial,calificacionSegundoParcial,calificacionTercerParcial,promedioAcumulado,calificacionFinal'
        tipoConsulta = 'limiteFaltas,faltasAlumno,faltasPrimerParcial,faltasSegundoParcial,faltasTercerParcial,faltasFinal,faltasCursosFIT,calificacionPrimerParcial,calificacionSegundoParcial,calificacionTercerParcial,promedioAcumulado,calificacionFinal,indicadorMateriaTutorias,curso-unificado';


        let _url: string = environment.production ? `${environment.apiManager.baseurl}/tec/alumnos/${student.login_id}/cursos-unificados?ejercicio-academico=${this.term}&fields[cursos]=${tipoConsulta}` :
          "https://run.mocky.io/v3/79e1b18a-e5b6-49f9-b7af-fd40b2abc1b5";

        this.api.genericRequestGet(_url).subscribe(async (resp: any) => {
          this.ratingStudent = resp
          if (this.fuenteInfo === 'searchGroup') {
            this.searchGrades.student.matricula = student.login_id;
            let apellidoPaterno: string = this.searchGrades.student.apellidoPaterno === '' ? '' : `apellidoPaterno=${this.searchGrades.student.apellidoPaterno}&`;
            let apellidoMaterno: string = this.searchGrades.student.apellidoMaterno === '' ? '' : `apellidoMaterno=${this.searchGrades.student.apellidoMaterno}&`;
            let lastname: string = (apellidoPaterno + apellidoMaterno).trim();
            let name: string = this.searchGrades.student.nombre === '' ? '' : `nombre=${this.searchGrades.student.nombre}&`;
            let matricula: string = this.searchGrades.student.matricula === '' ? '' : `numeroMatricula=${this.searchGrades.student.matricula}&`;
            let periodo: string = `ejercicio-academico=${this.term}&`

            let _url: string = environment.production ? `${environment.apiManager.baseurl}/tec/alumnos?${name}${lastname}${matricula}${periodo}nivel-academico=03&fields[alumnos]=nombre,apellidos,campus,region,nivel-academico,programa-academico,semestre` :
              "https://run.mocky.io/v3/44045f72-8451-4895-9796-0545bce55aaf";

            this.api.genericRequestGet(_url).subscribe((infoAlumno: any) => {
              if (infoAlumno?.data.length !== 0) {
                this.alumnoSeleccionado.nombrePrograma = infoAlumno.included.find((programa: any) => programa.id === infoAlumno.data[0].relationships['programa-academico'].data.id)
                this.alumnoSeleccionado.name = `${infoAlumno.data[0]?.attributes?.nombre} ${infoAlumno.data[0]?.attributes?.apellidos}`
                this.alumnoSeleccionado.campus = infoAlumno.included.find((campus: any) => campus.id === infoAlumno.data[0].relationships.campus.data.id)
                this.alumnoSeleccionado.semestre = infoAlumno.data[0].relationships.semestre.data.id + " semestre"
                this.loadingInfo = false;
              } else {
                this.loadingInfo = false;
              }
            }, error => {
              this.loadingInfo = false;
              console.log("error al obtener info alumno", error)
            })
          } else {
            this.loadingInfo = false;
          }

          let _term = JSON.parse(sessionStorage.getItem('term') || '{}').term;
          await courses
            .filter((c: any) => c.term.sis_term_id == _term)
            .filter((c: any) => subcuentas.includes(c.account_id))
            .forEach((course: any) => {
              let cursoObj: Curso = {
                nombreCurso: course.name,
                claveCurso: _term + "-" + course.sis_course_id?.split('.')[course.sis_course_id?.split('.').length - 1],
                numeroReferenciaCurso: course.sis_course_id?.split('.')[course.sis_course_id?.split('.').length - 1],
                id: course.id,
                limiteFaltasMock: 0,
                calificaciones: new Calificacion(),
                faltas: {} as Falta,
                nFaltasMock: 0,
                user_id: course.enrollments[0].user_id,
                course_code: course.course_code,
                sis_course_id: course.sis_course_id,
                enrollments: course.enrollments,
                term: course.term
              };

              this.getRatingCourse(cursoObj);
              listGroupByStudent.push(cursoObj);
            });
          this.alumnoSeleccionado = student;
          this.alumnoSeleccionado.cursos = listGroupByStudent;
          this.loadingGrade = false;

        });



      }, error => {
        this.loadingGrade = false;
      });
  }

  async getRatingCourse(curso: Curso) {

    let rating = this.ratingStudent?.data.filter((infoStudent: any) => {

      if (infoStudent.relationships) {

        return infoStudent.attributes.numeroReferenciaCurso == curso.numeroReferenciaCurso || infoStudent.relationships['curso-unificado'].data.id === curso.sis_course_id

      } else if (infoStudent.attributes.numeroReferenciaCurso == curso.numeroReferenciaCurso) {

        return true;

      }
      return false;
    })

    let setData = (curso: any, response: any) => {

      // calificaciones
      let temp: ICalificacion = {
        ...response?.attributes
      }

      curso.calificaciones = {
        ... new Calificacion(),
        ...response?.attributes
      } as Calificacion
      // faltas
      curso.faltas.faltasPrimerParcial = response?.attributes?.faltasPrimerParcial || 0;
      curso.faltas.faltasSegundoParcial = response?.attributes?.faltasSegundoParcial || 0;
      curso.faltas.faltasFinal = response?.attributes?.faltasFinal || 0;
      curso.faltas.faltasAlumno = (response?.attributes?.faltasAlumno || response?.attributes?.faltasAlumno == 0) ? response?.attributes?.faltasAlumno : '-';
      curso.limiteFaltasMock = response?.attributes?.limiteFaltas || 0;
      curso.tutorias = response?.attributes?.indicadorMateriaTutorias;
    }

    if (rating) {
      setData(curso, rating[0]);
    } else {
      let term = (this.userProperties.employeeType == 'PersonaRel') ? JSON.parse(sessionStorage.getItem('childSelected') || '{}').EjercicioAcademicoID : this.userProperties.ejercicioAcademicoId;
      let matricula = (this.userProperties.employeeType == 'PersonaRel') ? JSON.parse(sessionStorage.getItem('childSelected') || '{}').Identificador : this.userProperties.cn;
      let tipoConsulta = 'limiteFaltas,faltasAlumno,faltasPrimerParcial,faltasSegundoParcial,faltasTercerParcial,faltasFinal,faltasCursosFIT,calificacionPrimerParcial,calificacionSegundoParcial,calificacionTercerParcial,promedioAcumulado,calificacionFinal';
      let isFather = this.userProperties.employeeType == 'PersonaRel';

      // this.getRatingsByCourseId(matricula, term, curso.sis_course_id).subscribe((resp:any) => setData(curso, resp?.data[0]), (error:any) => {
      this.api.genericRequestGet(
        `${environment.apiManager.baseurl}/tec/canvas/alumnos/${matricula}/cursos-unificados?ejercicio-academico=${term}&fields[cursos]=${tipoConsulta}&curso-unificado=${curso.sis_course_id}`,
       ).subscribe((resp: any) => setData(curso, resp?.data[0]), error => {
        curso.calificaciones.calificacionPrimerParcial = '-';
        curso.calificaciones.calificacionSegundoParcial = '-';
        curso.calificaciones.calificacionFinal = '-';
        curso.calificaciones.promedioAcumulado = '-';

        curso.faltas.faltasPrimerParcial = '-';
        curso.faltas.faltasFinal = 0;
        curso.faltas.faltasAlumno = '-';
        curso.faltas.error = true;
        curso.limiteFaltasMock = 1;
      })
    }
  }


  imprimirPdf(tipo: string) {
    this.pdf.printTutoriaCourse(this.alumnoSeleccionado);
  }


  // // Controlo si la vista está expandida o colapsada
  vistaExpandida = false;

  // // Lista de grupos de mentoría del mentor
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

  // constructor() { }

  ngOnInit(): void {
    this.cargarGruposMentoria();
  }

  /**
   * Cargo los grupos de mentoría del mentor al iniciar
   */
  private cargarGruposMentoria(): void {
    this.gruposMentoria = sessionStorage.getItem('tutoriaCourses') ? JSON.parse(sessionStorage.getItem('tutoriaCourses') ?? '[]') : [];
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
    this.searchGrades = {
      student: {
        matricula: criterios.matricula,
        nombre: criterios.nombres,
        apellidoPaterno: criterios.apellidoPaterno,
        apellidoMaterno: criterios.apellidoMaterno
      }
    };
    this.GetStudentsByFilter();
    // this.estudiantesEncontrados = this.estudiantesService.buscarEstudiantes(criterios);
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
