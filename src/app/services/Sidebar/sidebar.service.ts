import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  // Usamos un BehaviorSubject para gestionar el estado del menú
  private isOpenSubject = new BehaviorSubject<boolean>(false); // inicializamos como cerrado
  isOpen$ = this.isOpenSubject.asObservable();

  // Método para cambiar el estado del menú
  toggleMenu() {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }
}
