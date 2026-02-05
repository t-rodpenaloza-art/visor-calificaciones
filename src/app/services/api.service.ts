import { Injectable } from '@angular/core';
import { map} from 'rxjs';
import { HttpClient} from '@angular/common/http';
import { BodySubcuentas } from '../models/canvas.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  token = {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IlBjWDk4R1g0MjBUMVg2c0JEa3poUW1xZ3dNVSJ9.eyJhdWQiOiJhM2VlZTUxNS05YWNkLTQ0YzUtYWQxYy0wNGQ2YTZmNmM2YWIiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vYzY1YTNlYTYtMGY3Yy00MDBiLTg5MzQtNWE2ZGMxNzA1NjQ1L3YyLjAiLCJpYXQiOjE3NzAzMjc3MTksIm5iZiI6MTc3MDMyNzcxOSwiZXhwIjoxNzcwMzMxNjE5LCJhaW8iOiJrMlpnWUdqNDBXcnp6WWVKN2U1RHA0NE02ZmpjK0pBNUNaVzlWKzlvS0wwODBXNDFVdzRBIiwiYXpwIjoiYTNlZWU1MTUtOWFjZC00NGM1LWFkMWMtMDRkNmE2ZjZjNmFiIiwiYXpwYWNyIjoiMSIsIm9pZCI6IjU5ODU3YzI2LTM5NTMtNGI2ZC05Yjg0LWEwYmI5YmVmZDlhNyIsInJoIjoiMS5BVmNBcGo1YXhud1BDMENKTkZwdHdYQldSUlhsN3FQTm1zVkVyUndFMXFiMnhxc0FBQUJYQUEuIiwicm9sZXMiOlsiT3Jpb24iLCJyZWxhY2lvbi1yb2xlcy1wZXJzb25hcy5hbGwiXSwic3ViIjoiNTk4NTdjMjYtMzk1My00YjZkLTliODQtYTBiYjliZWZkOWE3IiwidGlkIjoiYzY1YTNlYTYtMGY3Yy00MDBiLTg5MzQtNWE2ZGMxNzA1NjQ1IiwidXRpIjoiR21jM1ZpcWdXVXFVZmpyeTFucHBBQSIsInZlciI6IjIuMCIsInhtc19mdGQiOiJxbGd4ai1kODdoNjluMlN0ZkhueWdNMzJTaUFreUI4dHc5X0pDbzRwSmM4QmRYTjNaWE4wTXkxa2MyMXoifQ.PXnGQBbZtXQmhA0hyMIGMKgvmUZo5Y30pOJL9Ujl5-OEtagYnDStlFoAD0kP2u3hfhXhe0IX1KzADiueS_o9RmkRZvYcHgNZHcY01FkT7WpKW0GOKRxhqItbwbSCnb-z99EYEBuKVjm0fxkbOwCDLJ-ov3yDd6Q-yHJYT9gaYNfR0S0a82rGWt_4YI6rOBqpgV_KblBD16ho_kIW7AdTBNf6u2zkisgKpsbswjc5jdSwtPFrJ2tgj1zvEeRt8STfX-V7srSDhW0yYxWGLgCl_iBTUV2c_7GXPN-F4unNlMms1uKPAHhWNeom9Vd3xcKX-_kais5A_ff668UEJAiB_w",
    "refresh": 1770331619,
    "jwt": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJMMDM1MjAwMTIiLCJzdWIiOiJhbGJpbm8uZGlhekBwcHJkLnRlYy5teCIsImF1ZCI6IkNvbGFib3JhZG9yIiwiaWF0IjoxNzcwMzI4MjE4LCJleHAiOjE3NzAzMzE4MTgsInRlYy1pZC1wZXJzb25hIjoiMDM4MzU3MzEifQ.zqY-FuqDIHhfBC4gixlqDrQENc3zIKlogWVrjbp_xvo"
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
