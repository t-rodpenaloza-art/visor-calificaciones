import { inject, Injectable } from '@angular/core';
import { finalize, from, map, mergeMap, Subscription } from 'rxjs';
import { ApiService } from './api.service';
// import * as moment from 'moment-timezone';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  private evaluationSubscription: Subscription | null = null;
  private apiService = inject(ApiService);

  constructor() { }

  // loadSubAccounts(): void {
  //   if (this.evaluationSubscription) {
  //     this.evaluationSubscription.unsubscribe(); // ❌ Cancela la petición anterior si hay una en proceso
  //   }


  //   let prepas = ['PREP', 'PREP-L', 'PREPA'];
  //   let subCuentas: any[] = [];

  //   // if (prepas.some((e: any) => localStorage.getItem(`subcuentas${e}`) == null) || prepas.some((e: any) => !moment(JSON.parse(localStorage.getItem(`subcuentas${e}`) ?? '[]').date).isSame(moment(), "day"))) {
  //       from(prepas).pipe(
  //         mergeMap(id =>

  //           this.api.genericRequest({
  //             url: `${environment.cursos.canvas_azure}/api/GenericFather`,
  //             type: 'post',
  //             body: {
  //               path: `/api/v1/accounts/sis_account_id:${id}/sub_accounts?recursive=true&per_page=100`,
  //               method: 'GET',
  //               audiencia: this.api.userProperties.employeeType
  //             }
  //           }).pipe(
  //             map((result: any) => {
  //               if (result.indexOf('Error') !== -1) {
  //                 return;
  //               }
  //               const allSubs = result
  //               const subs: any[] = [];|
  //               allSubs.forEach((sub: any) => {
  //                 subs.push(sub?.id);
  //               });

  //               localStorage.setItem(`subcuentas${id}`, JSON.stringify({
  //                 cuenta: id,
  //                 ids: subs,
  //                 date: moment()
  //               }))

  //               return subs;
  //             })
  //           )
  //         ),
  //         finalize(() => {
  //           this.subaccounts = subCuentas;
  //           res();
  //         })
  //       // ).subscribe((resp: any) => { subCuentas.push(...resp) }, error => subCuentas.push([]))
  //     // } else {
  //       // prepas.forEach((e: any) => {
  //       //   this.subaccounts.push(...JSON.parse(localStorage.getItem(`subcuentas${e}`) ?? '[]').ids);
  //       // })
  //       // this.subaccounts.push(5);
  //       // this.subaccounts.push(12);
  //       // res();
  //     // }

  //   // // this._loading.set(true);
  //   // this.evaluationSubscription = this.apiService
  //   //   .getStudentsFromGroup()
  //   //   .pipe(
  //   //     finalize(() => {
  //   //       console.log('Finalizando petición');
  //   //       // this._loading.set(false);
  //   //     })
  //   //   )
  //   //   .subscribe({
  //   //     next: (response) => {
  //   //       console.log('Response:', response);
  //   //       this._viewModel.set(response);

  //   //       this.clearError();
  //   //     },
  //   //     error: (err) => {
  //   //       console.log('Error en load():', err);
          
  //   //       // Validar si es un error 403 (Acceso no autorizado)
  //   //       if (err.status === 403) {
  //   //         const mensajeError = err.error?.mensaje || 'Acceso no autorizado';
  //   //         this.router.navigate(['/error'], { queryParams: { message: mensajeError } });
  //   //         return;
  //   //       }
          
  //   //       // Manejar otros errores
  //   //       if (err.errorMessage) {
  //   //         this.router.navigate(['/error'], { queryParams: { message: err.errorMessage } });
  //   //       }
  //   //     },
  //   //     complete: () => {
  //   //       console.log('Completado');
  //   //     }
  //   //   });
  // }
}
