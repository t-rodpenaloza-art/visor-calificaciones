import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BodySubcuentas } from '../models/canvas.model';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private accessToken: string = '';
  private userId: string = '';
  private userName: string = '';

  // URL del backend proxy
  private backendUrl = environment.backendUrl; // http://localhost:7071/api o https://visor.azurewebsites.net/api

  constructor(private http: HttpClient, private router: Router) {
    this.loadTokenFromStorage();
  }

  /**
   * Inicializa el servicio leyendo los parámetros del URL (después del OAuth callback)
   * Llamar desde el componente que recibe el redirect: /seguimiento?access_token=xxx&user_id=xxx
   */
  initFromOAuthCallback(params: { [key: string]: string }): void {
    const token = params['access_token'];
    const userId = params['user_id'];
    const userName = params['user_name'];
    const expiresIn = params['expires_in'];

    if (token) {
      this.accessToken = token;
      this.userId = userId || '';
      this.userName = userName || '';

      // Guardar en sessionStorage
      sessionStorage.setItem('canvas_access_token', token);
      sessionStorage.setItem('canvas_user_id', userId || '');
      sessionStorage.setItem('canvas_user_name', userName || '');

      if (expiresIn) {
        const expiresAt = Date.now() + (parseInt(expiresIn, 10) * 1000);
        sessionStorage.setItem('canvas_token_expires_at', expiresAt.toString());
      }
    }
  }

  /**
   * Carga el token desde sessionStorage (para navegaciones posteriores)
   */
  private loadTokenFromStorage(): void {
    this.accessToken = sessionStorage.getItem('canvas_access_token') || '';
    this.userId = sessionStorage.getItem('canvas_user_id') || '';
    this.userName = sessionStorage.getItem('canvas_user_name') || '';
  }

  /**
   * Verifica si hay un token válido
   */
  isAuthenticated(): boolean {
    if (!this.accessToken) return false;

    const expiresAt = sessionStorage.getItem('canvas_token_expires_at');
    if (expiresAt && Date.now() > parseInt(expiresAt, 10)) {
      this.clearToken();
      return false;
    }

    return true;
  }

  /**
   * Redirige al flujo OAuth para obtener un nuevo token
   */
  redirectToOAuth(): void {
    const userId = this.userId || 'anonymous';
    window.location.href = `${this.backendUrl}/oauth/authorize?userId=${userId}`;
  }

  /**
   * Intenta renovar el token usando el refresh_token almacenado en Table Storage
   */
  renewToken() {
    if (!this.userId) return;

    return this.http.get<any>(`${this.backendUrl}/oauth/token/validate?userId=${this.userId}`).pipe(
      map(response => {
        if (response.authenticated && response.accessToken) {
          this.accessToken = response.accessToken;
          sessionStorage.setItem('canvas_access_token', response.accessToken);

          if (response.expiresIn) {
            const expiresAt = Date.now() + (response.expiresIn * 1000);
            sessionStorage.setItem('canvas_token_expires_at', expiresAt.toString());
          }
        }
        return response;
      })
    );
  }

  /**
   * Limpia el token y datos de sesión
   */
  clearToken(): void {
    this.accessToken = '';
    this.userId = '';
    this.userName = '';
    sessionStorage.removeItem('canvas_access_token');
    sessionStorage.removeItem('canvas_user_id');
    sessionStorage.removeItem('canvas_user_name');
    sessionStorage.removeItem('canvas_token_expires_at');
  }

  /**
   * Obtiene el userId del usuario autenticado
   */
  getUserId(): string {
    return this.userId;
  }

  /**
   * Obtiene el nombre del usuario autenticado
   */
  getUserName(): string {
    return this.userName;
  }

  /**
   * Headers con el Bearer token para el proxy
   */
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`,
      'Accept': 'application/json'
    });
  }

  // ============================================================
  // Peticiones via Proxy Backend (/api/canvas/...)
  // El proxy reenvía a Canvas, maneja paginación y rate limiting
  // ============================================================

  /**
   * GET genérico via proxy
   * Ejemplo: canvasGet('/courses', { per_page: 50 })
   *   → GET http://localhost:7071/api/canvas/courses?per_page=50
   */
  canvasGet(path: string, params?: { [key: string]: string }) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.http.get<any>(
      `${this.backendUrl}/canvas${path}${queryString}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ============================================================
  // Métodos específicos para Canvas API
  // ============================================================

  /** Obtener cursos del usuario autenticado */
  getCourses(perPage: number = 50) {
    return this.canvasGet('/courses', {
      per_page: perPage.toString(),
      'include[]': 'teachers,term,total_scores'
    });
  }

  /** Obtener detalle de un curso */
  getCourseById(courseId: string) {
    return this.canvasGet(`/courses/${courseId}`, {
      'include[]': 'teachers,term,total_scores'
    });
  }

  /** Obtener assignments de un curso */
  getAssignments(courseId: string, perPage: number = 50) {
    return this.canvasGet(`/courses/${courseId}/assignments`, {
      per_page: perPage.toString(),
      order_by: 'due_at'
    });
  }

  /** Obtener detalle de un assignment */
  getAssignmentById(courseId: string, assignmentId: string) {
    return this.canvasGet(`/courses/${courseId}/assignments/${assignmentId}`);
  }

  /** Obtener usuarios/estudiantes de un curso */
  getCourseUsers(courseId: string, perPage: number = 50) {
    return this.canvasGet(`/courses/${courseId}/users`, {
      per_page: perPage.toString(),
      'include[]': 'enrollments,email'
    });
  }

  /** Obtener todas las submissions de un curso */
  getCourseSubmissions(courseId: string, perPage: number = 50) {
    return this.canvasGet(`/courses/${courseId}/students/submissions`, {
      per_page: perPage.toString(),
      'student_ids[]': 'all',
      'include[]': 'assignment,total_scores'
    });
  }

  /** Obtener submission de un estudiante en un assignment */
  getStudentSubmission(courseId: string, assignmentId: string, userId: string) {
    return this.canvasGet(`/courses/${courseId}/assignments/${assignmentId}/submissions/${userId}`);
  }

  /** Obtener cursos favoritos */
  getFavoriteCourses() {
    return this.canvasGet('/users/self/favorites/courses', {
      'include[]': 'teachers,term'
    });
  }

  /** Obtener cursos de un usuario específico */
  getUserCourses(userId: string, perPage: number = 50) {
    return this.canvasGet(`/users/${userId}/courses`, {
      per_page: perPage.toString(),
      'include[]': 'term,teachers'
    });
  }

  /** Obtener información de un usuario */
  getUserInfo(userId: string) {
    return this.canvasGet(`/users/${userId}`);
  }

  /** Obtener todo items de un curso */
  getCourseTodo(courseId: string) {
    return this.canvasGet(`/courses/${courseId}/todo`);
  }

  /** Obtener carpetas de un curso */
  getCourseFolders(courseId: string) {
    return this.canvasGet(`/courses/${courseId}/folders`);
  }

  /** Obtener anuncios */
  getAnnouncements(courseId: string, perPage: number = 10) {
    return this.canvasGet('/announcements', {
      'context_codes[]': `course_${courseId}`,
      per_page: perPage.toString()
    });
  }

  /** Obtener sub-cuentas */
  getSubAccounts(accountId: string, perPage: number = 50) {
    return this.canvasGet(`/accounts/${accountId}/sub_accounts`, {
      per_page: perPage.toString()
    });
  }

  /** Obtener scopes de una cuenta */
  getAccountScopes(accountId: string) {
    return this.canvasGet(`/accounts/${accountId}/scopes`);
  }

  // ============================================================
  // Métodos legacy (compatibilidad con componentes existentes)
  // ============================================================

  genericRequestPost(body: BodySubcuentas, url: string) {
    return this.http.post(url, body).pipe(
      map(response => response as any)
    );
  }

  genericRequestCourses(body: any, url: string) {
    return this.http.post(url, body).pipe(
      map(response => response as any)
    );
  }

  genericRequestGet(url: string) {
    return this.http.get(url, {
      headers: { 'Accept': 'application/vnd.api+json' }
    }).pipe(
      map(response => response as any)
    );
  }

  genericRequestGetAPI(url: string) {
    return this.http.get(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response as any)
    );
  }
}
