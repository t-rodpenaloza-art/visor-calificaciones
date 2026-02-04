import { Injectable } from '@angular/core';
import { map} from 'rxjs';
import { HttpClient} from '@angular/common/http';
import { BodySubcuentas } from '../models/canvas.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  genericRequestPost(body: BodySubcuentas, url:string) {
    return this.http.post(url, body).pipe(
      map(response => response as any)
    );
  }

  genericRequestCourses(body: any, url:string) {
    return this.http.post(url, body).pipe(
      map(response => response as any)
    );
  }

  genericRequestGet(url:string) {

    let header = {
      'Accept': "application/vnd.api+json"
    };

    return this.http.get(url, { headers: header }).pipe(
      map(response => response as any)
    );
  }

}
