import { Injectable } from '@angular/core';
import { AsyncSubject, catchError, lastValueFrom, map, Observable, of, retry, tap, timer } from 'rxjs';
import { IListSubsitio, RequestData } from './../models/RequestData.model';
import { HttpClient, HttpContext, HttpContextToken, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // cache: any = {}
  // IT_HAS_TOKEN_ORION = new HttpContextToken<'Perfil' | 'Hijo' | ''>(() => '')
  // DEFAULT_HEADERS = {
  //   'Accept': 'application/json; odata=verbose',
  //   'Content-Type': 'application/json',
  // }

  // constructor(private http: HttpClient) { }

  // /**
  //  * @param url: string;
  //  * @param headers?: any;
  //  * @param saveInCache?: boolean;
  //  * @param responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
  //  * @param isMock?: boolean;
  //  * @param type?: 'get' | 'post';
  //  * @param body?: any;
  //  * @param tokenOrion?: 'Perfil' | 'Hijo';
  //  * @param listSubSite?: IListSubsitio
  //  * @returns observable con la respues de la petición
  //  * @returns
  //  */
  // genericRequest(RequestData: RequestData): Observable<any> {
  //   let petition: Observable<any>;
  //   RequestData.url = (RequestData.listSubSite != undefined && !RequestData.isMock) ? this.formatUlr(RequestData.listSubSite) : RequestData.url

  //   if (RequestData.saveInCache && !this.cache[RequestData.url]) {
  //     petition = this.getPetition(RequestData)
  //     this.cache[RequestData.url] = new AsyncSubject();


  //     lastValueFrom(petition).then(response => {
  //       if (this.isJsonString(response))
  //         response = typeof response === 'string' ? JSON.parse(response || '{}') : response;

  //       this.cache[RequestData.url].next(response);
  //       this.cache[RequestData.url].complete();
  //     }).catch(e => {
  //       console.log("Hubo un error en la peticion", e, petition);
  //     })
  //   } else if (!RequestData.saveInCache) {
  //     return this.getPetition(RequestData).pipe(
  //       map(response => {
  //         if (this.isJsonString(response))
  //           response = typeof response === 'string' ? JSON.parse(response || '{}') : response
  //         return response
  //       })
  //     )
  //   }

  //   return this.cache[RequestData.url].asObservable()
  // }

  // isJsonString(str: any): boolean {
  //   try {
  //     const parsed = JSON.parse(str);
  //     return (typeof parsed === 'object' && parsed !== null);

  //   } catch (e) {
  //     return false;
  //   }
  // }

  // /**
  //  * @param infoSubsitio objeto que contiene la informacion del subsitio a consultar
  //  * @returns retorna la url del subsitio con los parametros de las columnas consultadas
  //  */
  // private formatUlr(infoSubsitio: IListSubsitio): string {
  //   let url = infoSubsitio.type == 'sitio' ? environment.sharedPoint.obtenerLista : environment.sharedPoint.obtenerListaSubsitio;
  //   url = url.replace('[LISTA]', infoSubsitio.nameList).replace('[COLUMNAS]', infoSubsitio.columns)
  //   return url
  // }

  // getPetition(RequestData: RequestData) {
  //   let petition: Observable<any>;
  //   let headers = RequestData.headers ? RequestData.headers : this.DEFAULT_HEADERS

  //   let options: any = {
  //     headers: headers,
  //     context: new HttpContext().set(this.IT_HAS_TOKEN_ORION, RequestData.tokenOrion),
  //   }

  //   if (RequestData.responseType) options['responseType'] = RequestData.responseType;


  //   if (RequestData.isMock) {

  //     petition = this.http.get(RequestData.url)

  //   } else if (RequestData.type == 'post') {
  //     petition = this.http.post<any>(RequestData.url, RequestData.body, options)
  //   } else {
  //     petition = this.http.get<any>(RequestData.url, options)
  //   }

  //   if (RequestData.url.includes('GenericFather')) {
  //     return petition
  //   }

  //   return petition.pipe(
  //     retry({
  //       count: 1,
  //       delay: (error, retryCount) => {
  //         if (error.status == 401) this.getTokenJWT().subscribe()
  //         if (error.status == 401 && this.userProperties.employeeType == 'PersonaRel') {
  //           let PersonaId = JSON.parse(sessionStorage.getItem('childSelected') || '{}')
  //           this.getTokenChild(PersonaId.Persona).subscribe()
  //         }
  //         return timer(3000)
  //       },
  //     })
  //   )
  // }

  // /**
  //  * @returns retorna el token de orion del perfil logeado
  //  */
  // getTokenJWT(matricula?: string) {
  //   return this.http.get(
  //     `${environment.apiManager.tokenOrion}`
  //   ).pipe(
  //     tap((resp: any) => {
  //       resp = {
  //         JWT: resp.jwt,
  //         Refresh: resp.refresh,
  //         Token: resp.token
  //       }
  //       sessionStorage.setItem('tokenOrion', JSON.stringify(resp))
  //     }),
  //     catchError((e: HttpErrorResponse) => {
  //       console.log(e);
  //       return of({
  //         JWT: '',
  //         Refresh: '',
  //         Token: ''
  //       })
  //     })
  //   )
  // }
}
