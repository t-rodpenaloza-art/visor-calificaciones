import { Injectable } from '@angular/core';
import { map} from 'rxjs';
import { HttpClient} from '@angular/common/http';
import { BodySubcuentas } from '../models/canvas.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  access_token = {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IlBjWDk4R1g0MjBUMVg2c0JEa3poUW1xZ3dNVSJ9.eyJhdWQiOiJhM2VlZTUxNS05YWNkLTQ0YzUtYWQxYy0wNGQ2YTZmNmM2YWIiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vYzY1YTNlYTYtMGY3Yy00MDBiLTg5MzQtNWE2ZGMxNzA1NjQ1L3YyLjAiLCJpYXQiOjE3NzA3NDc4NTEsIm5iZiI6MTc3MDc0Nzg1MSwiZXhwIjoxNzcwNzUxNzUxLCJhaW8iOiJrMlpnWUpDWU9JdGh4NjFyZ2luMTF2b214WFc1T1Y2cU1hc1ZhcTZjLzY1dCtTKzNKQndBIiwiYXpwIjoiYTNlZWU1MTUtOWFjZC00NGM1LWFkMWMtMDRkNmE2ZjZjNmFiIiwiYXpwYWNyIjoiMSIsIm9pZCI6IjU5ODU3YzI2LTM5NTMtNGI2ZC05Yjg0LWEwYmI5YmVmZDlhNyIsInJoIjoiMS5BVmNBcGo1YXhud1BDMENKTkZwdHdYQldSUlhsN3FQTm1zVkVyUndFMXFiMnhxc0FBQUJYQUEuIiwicm9sZXMiOlsiT3Jpb24iLCJyZWxhY2lvbi1yb2xlcy1wZXJzb25hcy5hbGwiXSwic3ViIjoiNTk4NTdjMjYtMzk1My00YjZkLTliODQtYTBiYjliZWZkOWE3IiwidGlkIjoiYzY1YTNlYTYtMGY3Yy00MDBiLTg5MzQtNWE2ZGMxNzA1NjQ1IiwidXRpIjoibFNyd1lEbENEMEtQTU01MU9jck9BQSIsInZlciI6IjIuMCIsInhtc19mdGQiOiJ2MEFDYjRnS0JDVXJ6WjVUZXkxak5YZk1EYU9vZVFXUmc3eUUyaGRhV1owQmRYTnViM0owYUMxa2MyMXoifQ.XIwRZ8HggA9E7L3QHT-SjJ8ghFVJYfaq0ICGdFCP5KQWKwH4i6BF6_0A3H4sOsRx422yoDhhzb5ZdlgGfOBxrzh2pX0LmLKkAuv3UdrITdJHQ2Ovxt9jXQbg7gfj9hE13DhR23joLalaIFBkTUbJ0xx0QfE97OjV_y4hppX8bOeFTcu2BCqvn_61ZUGEJYk0lB-ECZ4MGTksyHcVY87oGaAM0G5nyhIP8_DFtyqhNePM7rEZmw5dXf7qqNAUTyqWliUna61c_SaQGHHs0lsgpmtf1QAdwiX0NVMCla1A5E5QqnwRprzDHW_nhmUYx5TBj9yJY0IvCWKexYrjgAs-pQ",
    "refresh": 1770751751,
    "jwt": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJMMDM1MjAwMTIiLCJzdWIiOiJhbGJpbm8uZGlhekBwcHJkLnRlYy5teCIsImF1ZCI6IkNvbGFib3JhZG9yIiwiaWF0IjoxNzcwNzQ5MTIwLCJleHAiOjE3NzA3NTI3MjAsInRlYy1pZC1wZXJzb25hIjoiMDM4MzU3MzEifQ.akU1sZBrcR4fNliLTaf8Qg-AvTjWJnau71NSEFDAHUc"
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
      'Authorization': `Bearer ${this.access_token.token}`,
      'X-Auth-JWT': `${this.access_token.jwt}`
    };

    return this.http.get(url, { headers: header }).pipe(
      map(response => response as any)
    );
  }

}
