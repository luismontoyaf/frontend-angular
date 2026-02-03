import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, map, Observable, switchMap, take, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  private monitorTimeout: any = null; // referencia al timeout
  private inactivityTimeout: any = null; 
  private inactivityLimit = 30 * 60 * 1000;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { username, password };
    return this.http.post(`${this.apiUrl}/auth/login`, body, { headers });
  }

  logout(): Observable<any> {
  const refreshToken = sessionStorage.getItem('refreshToken');
  return this.http.post(`${this.apiUrl}/auth/logout`, { refreshToken }).pipe(
    tap(() => {
      sessionStorage.clear();
      if (this.monitorTimeout) {
        clearTimeout(this.monitorTimeout);
        this.monitorTimeout = null;
      }
      if (this.inactivityTimeout) {
        clearTimeout(this.inactivityTimeout);
        this.inactivityTimeout = null;
      }
    })
  );
}


  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('token');
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp < now;
    } catch {
      return true;
    }
  }

  refreshToken(): Observable<string> {
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1)
      );
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    const refreshToken = sessionStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.logout().subscribe();
      return throwError(() => new Error('No refresh token'));
    }

    return this.http.post<any>(`${this.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap(response => {
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('refreshToken', response.refreshToken);
        this.isRefreshing = false;
        this.refreshTokenSubject.next(response.token);
      }),
      map(res => res.token),
      catchError(err => {
        this.isRefreshing = false;
        this.logout().subscribe();
        return throwError(() => err);
      })
    );
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  startTokenMonitor(): void {
    const token = this.getToken();
    if (!token) return;

    let decoded: any;
    try {
      decoded = jwtDecode(token);
    } catch {
      this.logout().subscribe();
      return;
    }

    const exp = decoded.exp * 1000; // en ms
    const timeout = exp - Date.now() - (60 * 1000); // refrescar 1 min antes

    if (timeout > 0) {
      if (this.monitorTimeout) {
        clearTimeout(this.monitorTimeout);
      }
      this.monitorTimeout = setTimeout(() => {
        this.refreshToken().subscribe({
          next: () => this.startTokenMonitor(), // reinicia el monitor
          error: () => this.logout().subscribe()
        });
      }, timeout);
    }
  }

  initInactivityMonitor(): void {
  if (this.inactivityTimeout) {
    clearTimeout(this.inactivityTimeout);
  }

  const reset = () => {
    clearTimeout(this.inactivityTimeout);
    this.inactivityTimeout = setTimeout(() => this.logout().subscribe(), this.inactivityLimit);
  };

  // Escuchar solo eventos dentro de la app
  document.addEventListener('click', reset);
  document.addEventListener('keydown', reset);
  document.addEventListener('mousemove', reset);

  reset(); // inicializa el contador
}

private resetInactivityTimer(): void { 
  if (this.inactivityTimeout) { 
    clearTimeout(this.inactivityTimeout); 
  } 
  
  this.inactivityTimeout = setTimeout(() => { 
    this.logout().subscribe(); 
  }, this.inactivityLimit); 
}

}
