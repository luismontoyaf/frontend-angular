import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { User } from '../../interfaces/user';
import { Client } from '../../interfaces/client';
import { TenantService } from '../Tenant/tenant.service';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private apiUrl = environment.apiUrl; // URL de la API
  
    constructor(private http: HttpClient, private tenantService: TenantService) {}
  
    register(nombre: string, apellidos: string, tipoDocumento: string, numDocumento: string, correo: string, fechaNacimiento: Date, contrasena: string, celular: string, direccion: string, genero: string): Observable<any> {
      const body = { nombre, apellidos, tipoDocumento, numDocumento, correo, fechaNacimiento, contrasena, celular, direccion, genero };
      return this.http.post(`${this.apiUrl}/users/register`, body);
    }

    registerUser(nombre: string, apellidos: string, tipoDocumento: string, numDocumento: string, correo: string, fechaNacimiento: Date, fechaIngreso: Date,  rol: string, contrasena: string, celular: string, direccion: string, genero: string): Observable<any> {
      const body = { nombre, apellidos, tipoDocumento, numDocumento, correo, fechaNacimiento: fechaNacimiento ? fechaNacimiento: null, fechaIngreso, rol, contrasena, celular, direccion, genero };
      return this.http.post(`${this.apiUrl}/users/registerEmploye`, body);
    }

    updateUser(data: User): Observable<any> {
      const tenant = this.tenantService.getTenantOrThrow();

      const body = {
        data: {
          ...data,
          TenantIdentifier: tenant
        }
      };

      return this.http.put(`${this.apiUrl}/users/updateUser`, body);
    }

    updateClient(data: Client): Observable<any> {
      const tenant = this.tenantService.getTenantOrThrow();

      const body = {
        data: {
          ...data,
          TenantIdentifier: tenant
        }
      };

      return this.http.put(`${this.apiUrl}/users/updateClient`, body);
    }

    getUsers(): Observable<any> {
      return this.http.get(`${this.apiUrl}/users/getUsers`, {
      });
    }

    getClients(): Observable<any> {
      return this.http.get(`${this.apiUrl}/users/getClients`, {
      });
    }

  changeStatusUser(userId: number, typeUser: string): Observable<any> {
      const body = {userId, typeUser}
      return this.http.put(`${this.apiUrl}/users/changeStatusUser`, body, {
      });
  }
}