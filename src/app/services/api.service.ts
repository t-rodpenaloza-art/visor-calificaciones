import { Injectable } from '@angular/core';
import { map} from 'rxjs';
import { HttpClient} from '@angular/common/http';
import { BodySubcuentas } from '../models/canvas.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  token = {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IlBjWDk4R1g0MjBUMVg2c0JEa3poUW1xZ3dNVSJ9.eyJhdWQiOiJhM2VlZTUxNS05YWNkLTQ0YzUtYWQxYy0wNGQ2YTZmNmM2YWIiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vYzY1YTNlYTYtMGY3Yy00MDBiLTg5MzQtNWE2ZGMxNzA1NjQ1L3YyLjAiLCJpYXQiOjE3NzA0MTI5NDgsIm5iZiI6MTc3MDQxMjk0OCwiZXhwIjoxNzcwNDE2ODQ4LCJhaW8iOiJBU1FBMi84YkFBQUF1OFpvVXlIbFpMdmE5ZklSOUo5bVEzZ0M5akJkOU51UUNZQUJlY0NpeDVrPSIsImF6cCI6ImEzZWVlNTE1LTlhY2QtNDRjNS1hZDFjLTA0ZDZhNmY2YzZhYiIsImF6cGFjciI6IjEiLCJvaWQiOiI1OTg1N2MyNi0zOTUzLTRiNmQtOWI4NC1hMGJiOWJlZmQ5YTciLCJyaCI6IjEuQVZjQXBqNWF4bndQQzBDSk5GcHR3WEJXUlJYbDdxUE5tc1ZFclJ3RTFxYjJ4cXNBQUFCWEFBLiIsInJvbGVzIjpbIk9yaW9uIiwicmVsYWNpb24tcm9sZXMtcGVyc29uYXMuYWxsIl0sInN1YiI6IjU5ODU3YzI2LTM5NTMtNGI2ZC05Yjg0LWEwYmI5YmVmZDlhNyIsInRpZCI6ImM2NWEzZWE2LTBmN2MtNDAwYi04OTM0LTVhNmRjMTcwNTY0NSIsInV0aSI6ImtxdkZWWWFWbGtPY1E2NGZQNHAwQUEiLCJ2ZXIiOiIyLjAiLCJ4bXNfZnRkIjoiUElqbVJpNTcyNTBBczNDUHlCWjJsck9FcE9hamx5Qi1RdnR1dkRXNDdKSUJkWE56YjNWMGFDMWtjMjF6In0.V5zrvLbdtt9QpDW6LOVizwEBmdzfeS-HP3CdBWLjw0rnSpy27KD7-NuqWsRpxxx0GahHYf1QQI_i8PuIFKmd0zopvTedaMcUNAnCdDIeZozj0YdkEv-VeGvfM2aw96ql0mmPfBCuFVJFZkhSBDl0rRwJejXGrRErTIXHGLeVJUTQDNFLmdx8zUhOhvOolN4rDsKhwCxqHhhDGE6ujVXYzJ7xWa8G4r3TTEPK8VXlH-p3I-1nCtFZKvAJ5Ygyy1wDRgi1P-srkwpHtxFPvMcRqaSN8L46DN2OyYHY7pqw5ci_A1y78bjokUfJk-x1SD9gMqCYxzujp8bWzQtJ8eWBfg",
    "refresh": 1770416848,
    "jwt": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJMMDM1MjAwMTIiLCJzdWIiOiJhbGJpbm8uZGlhekBwcHJkLnRlYy5teCIsImF1ZCI6IkNvbGFib3JhZG9yIiwiaWF0IjoxNzcwNDEzNzkzLCJleHAiOjE3NzA0MTczOTMsInRlYy1pZC1wZXJzb25hIjoiMDM4MzU3MzEifQ.YAvWxGyJme4813FBysYp507V8F6DlXyxYZ8xX-JAmDA"
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
