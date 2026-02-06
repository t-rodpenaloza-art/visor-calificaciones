import { Injectable } from '@angular/core';
import { map} from 'rxjs';
import { HttpClient} from '@angular/common/http';
import { BodySubcuentas } from '../models/canvas.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  token = {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IlBjWDk4R1g0MjBUMVg2c0JEa3poUW1xZ3dNVSJ9.eyJhdWQiOiJhM2VlZTUxNS05YWNkLTQ0YzUtYWQxYy0wNGQ2YTZmNmM2YWIiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vYzY1YTNlYTYtMGY3Yy00MDBiLTg5MzQtNWE2ZGMxNzA1NjQ1L3YyLjAiLCJpYXQiOjE3NzAzMzM3MjIsIm5iZiI6MTc3MDMzMzcyMiwiZXhwIjoxNzcwMzM3NjIyLCJhaW8iOiJrMlpnWVBpd3RlNzZIOEdOWmd2bFZiKzdxOW5VSzJrOTJ5TnlTdTJzZ0NqN3RtUFowK1VBIiwiYXpwIjoiYTNlZWU1MTUtOWFjZC00NGM1LWFkMWMtMDRkNmE2ZjZjNmFiIiwiYXpwYWNyIjoiMSIsIm9pZCI6IjU5ODU3YzI2LTM5NTMtNGI2ZC05Yjg0LWEwYmI5YmVmZDlhNyIsInJoIjoiMS5BVmNBcGo1YXhud1BDMENKTkZwdHdYQldSUlhsN3FQTm1zVkVyUndFMXFiMnhxc0FBQUJYQUEuIiwicm9sZXMiOlsiT3Jpb24iLCJyZWxhY2lvbi1yb2xlcy1wZXJzb25hcy5hbGwiXSwic3ViIjoiNTk4NTdjMjYtMzk1My00YjZkLTliODQtYTBiYjliZWZkOWE3IiwidGlkIjoiYzY1YTNlYTYtMGY3Yy00MDBiLTg5MzQtNWE2ZGMxNzA1NjQ1IiwidXRpIjoiMVQwN0VHS1h6VS00UnMtR1RGNXhBQSIsInZlciI6IjIuMCIsInhtc19mdGQiOiJKVm1EcEszNzVBOE1UVTVqOGotNnF5YUc5QjZ6TzF6Qm9CZTl2NkNjWm9rQmRYTjNaWE4wTXkxa2MyMXoifQ.c9EestJpJStn-7yhKUap5fh4LnHVnMQlIy7W_RobdBEfdBLEF7ip_o4Lu8Q-rfvjEeTJSKx-P6552otNrSMnmQq380yShdIG7j_V0uMjyrB26BYbsgRKLiQv7zYf61NuEmh6dQ7xA47yCzN7T9PIBW9q8gev3zPuNuL0ZMw58cuMBf0zA39oXzWSV4I3GcLGdZ92sd2Uljhm22qUrrgUKphnwu8f5VhmlwqKlmpgjCXC67MDvgWGpL_2D9Pf5Lm1VRUj5NVFZYqwwpeImvhA-DSkwwUQFg7nzbJVlyzAvCf1IkuKE9_Se_P60TB-8lkZii868npTMlqx_LUW-57Jmg",
    "refresh": 1770337622,
    "jwt": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJMMDM1MjAwMTIiLCJzdWIiOiJhbGJpbm8uZGlhekBwcHJkLnRlYy5teCIsImF1ZCI6IkNvbGFib3JhZG9yIiwiaWF0IjoxNzcwMzM0ODI3LCJleHAiOjE3NzAzMzg0MjcsInRlYy1pZC1wZXJzb25hIjoiMDM4MzU3MzEifQ.GB6d-rAlJlv1fz1ukMiCPJTX9bhOSuQCPvYMEHVyj08"
}
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

  genericRequestGetAPI(url:string) {

    let header = {
      'Accept': "application/vnd.api+json",
      'Authorization': `Bearer ${this.token.access_token}`,
      'X-Auth-JWT': `${this.token.jwt}`
    };

    return this.http.get(url, { headers: header }).pipe(
      map(response => response as any)
    );
  }

}
