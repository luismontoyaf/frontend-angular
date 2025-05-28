import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { User } from '../../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private apiUrl = environment.apiUrl; // URL de la API
  
    constructor(private http: HttpClient) {}
  
    register(nombre: string, apellidos: string, tipoDocumento: string, numDocumento: string, correo: string, fechaNacimiento: Date, contrasena: string, celular: string, direccion: string, genero: string): Observable<any> {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      const body = { nombre, apellidos, tipoDocumento, numDocumento, correo, fechaNacimiento, contrasena, celular, direccion, genero };
      return this.http.post(`${this.apiUrl}/users/register`, body, { headers });
    }

    registerUser(nombre: string, apellidos: string, tipoDocumento: string, numDocumento: string, correo: string, fechaNacimiento: Date, fechaIngreso: Date,  rol: string, contrasena: string, celular: string, direccion: string, genero: string): Observable<any> {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      const body = { nombre, apellidos, tipoDocumento, numDocumento, correo, fechaNacimiento: fechaNacimiento ? fechaNacimiento: null, fechaIngreso, rol, contrasena, celular, direccion, genero };
      return this.http.post(`${this.apiUrl}/users/registerEmploye`, body, { headers });
    }

    updateUser(data: User): Observable<any> {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      const body = { data };
      return this.http.put(`${this.apiUrl}/users/updateUser`, body, { headers });
    }

    getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/getUsers`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
  }

  changeStatusUser(userId: number): Observable<any> {
      return this.http.put(`${this.apiUrl}/users/changeStatusUser/${userId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
  }
}