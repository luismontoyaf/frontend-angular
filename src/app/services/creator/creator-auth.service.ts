import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';

interface CreatorLoginResponse {
  token: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class CreatorAuthService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string): Observable<CreatorLoginResponse> {
    return this.http.post<CreatorLoginResponse>(`${this.apiUrl}/platform-auth/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        sessionStorage.setItem('creatorToken', response.token);
        sessionStorage.setItem('creatorEmail', response.email);
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem('creatorToken');
    sessionStorage.removeItem('creatorEmail');
  }
}
