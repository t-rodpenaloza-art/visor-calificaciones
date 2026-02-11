import { inject, Injectable, signal } from '@angular/core';
import { finalize, from, map, mergeMap, Subscription } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../environments/environment';
import moment from 'moment-timezone';
import { BodySubcuentas } from '../models/canvas.model';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  private evaluationSubscription: Subscription | null = null;
  private apiService = inject(ApiService);

  private _subaccounts = signal<number[] | null>(null);

  get subaccounts() {
    return this._subaccounts.asReadonly();
  }

  private _courses = signal<any[] | null>(null);

  get courses() {
    return this._courses.asReadonly();
  }

  userProperties: any = {};
  
  constructor() {
    this.userProperties = JSON.parse(localStorage.getItem('userInfo') ?? '{}');
  }

  loadSubAccounts(): void {
    if (this.evaluationSubscription) {
      this.evaluationSubscription.unsubscribe(); // ❌ Cancela la petición anterior si hay una en proceso
    }


    let prepas = ['PREP', 'PREP-L', 'PREPA'];
    let subCuentas: any[] = [];

    if (prepas.some((e: any) => localStorage.getItem(`subcuentas${e}`) == null) || prepas.some((e: any) => !moment(JSON.parse(localStorage.getItem(`subcuentas${e}`) ?? '[]').date).isSame(moment(), "day"))) {
        from(prepas).pipe(
          mergeMap(id => {

            let obj: BodySubcuentas = {
              path : `/api/v1/accounts/sis_account_id:${id}/sub_accounts?recursive=true&per_page=100`,
              method : 'GET',
              audiencia : 'Colaborador'
            }

            return this.apiService.genericRequestPost(obj, `${environment.cursos.canvas_azure}/api/GenericFather`).pipe(
              map((result: any) => {
                if (result.indexOf('Error') !== -1) {
                  return;
                }
                const allSubs = result
                const subs: any[] = [];
                allSubs.forEach((sub: any) => {
                  subs.push(sub?.id);
                });

                localStorage.setItem(`subcuentas${id}`, JSON.stringify({
                  cuenta: id,
                  ids: subs,
                  date: moment()
                }))

                return subs;
              })
            )
          }),
          finalize(() => {
            this._subaccounts.set(subCuentas);
          })
        ).subscribe((resp: any) => { subCuentas.push(...resp) }, error => subCuentas.push([]))
      } else {
        prepas.forEach((e: any) => {
          this._subaccounts.set([...(this._subaccounts() ?? []), ...JSON.parse(localStorage.getItem(`subcuentas${e}`) ?? '[]').ids]);
        })
        this._subaccounts.set([...(this._subaccounts() ?? []), 5]);
        this._subaccounts.set([...(this._subaccounts() ?? []), 12]);
      }
  }

  loadCourses(nomina:string, token: { access_token: string }): void {

    if (this.evaluationSubscription) {
      this.evaluationSubscription.unsubscribe(); // ❌ Cancela la petición anterior si hay una en proceso
    }

    // Descomenbtar para usar token dinámico ++++>
    // let object: BodySubcuentas = {
    //   path: `/api/v1/users/sis_login_id:${nomina}/courses?enrollment_state=active&enrollment_state=complete&include[]=total_scores&state[]=active&include[]=term&include[]=concluded&include[]=teachers&per_page=100`,
    //   method: "GET",
    //   token: token.access_token
    // }

    // Código temporal con token fijo ++++>
    let object = {
      method: "GET",
      params: {
        matricula: nomina,
        periodo: "202513",
        audiencia: "Colaborador" 
      }
    }

    // Lógica para cargar cursos
    this.evaluationSubscription = this.apiService
      .genericRequestCourses(object, `${environment.cursos.canvas_azure}/api/GetCourses`)
      .pipe(
        finalize(() => {
          console.log('Finalizando petición');
          // this._loading.set(false);
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log('Response:', response);
          // Procesar la respuesta y actualizar el estado según sea necesario

          this._courses.set(response);
        },
        error: (err) => {
          console.log('Error en load():', err);
        },
        complete: () => {
          console.log('Completado');
        }
      });
  }

  loadTermsActive(): void {
    let dateTerm: any = sessionStorage.getItem('term');
    if (dateTerm && moment(JSON.parse(dateTerm).date).isSame(moment(), "day")) {
      return;
    }

    this.apiService.genericRequestPost({
        path: `/api/v1/accounts/1/terms?per_page=50`,
        method: 'GET',
        audiencia: "Colaborador"
      },
      `${environment.cursos.canvas_azure}/api/GenericFather`
    ).subscribe(resp => {
      resp?.enrollment_terms?.find((term: any) => {
        let start_at = new Date(term?.start_at).getTime();
        let end_at = new Date(term?.end_at).getTime();
        if (term.name.includes('Semestral') && new Date().getTime() >= start_at && new Date().getTime() <= end_at) {
          // term.sis_term_id
          let cacheTerm = {
            date: moment(),
            term: term.sis_term_id,
            id: term.id
          }
          sessionStorage.setItem('term', JSON.stringify(cacheTerm))
          return true;
        }
        return false;
      })
    })
  }
}
