import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import {jwtDecode} from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl; // URL de la API

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { username, password };
    return this.http.post(`${this.apiUrl}/auth/login`, body, { headers });
  }

  logout(refreshToken: string): Observable<any> {
    
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { refreshToken};
    return this.http.post(`${this.apiUrl}/auth/logout`, body, { headers });
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token && !this.isTokenExpired(token);
  }

  isTokenExpired(token: string): boolean {
  try {
    const decoded: any = jwtDecode(token);  
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch (e) {
    return true; // token inválido o no es JWT
  }
}

refreshToken(): Observable<string> {
  const refreshToken = localStorage.getItem('refreshToken');
  return this.http.post<any>('/auth/refresh', { refreshToken }).pipe(
    switchMap(response => {
      return new Observable<string>((observer) => {
        observer.next(response.accessToken);
        observer.complete();
      });
    })
  );
}

startTokenMonitor() {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  if (!token) return;
  if (!refreshToken) return;

  const decoded: any = jwtDecode(token);
  const now = Date.now();
  const exp = decoded.exp * 1000;
  const timeout = exp - now;

  if (timeout > 0) {
    setTimeout(() => {
      this.logout(refreshToken); // forzar logout al expirar
    }, timeout);
  } else {
    this.logout(refreshToken);
  }
}


}
