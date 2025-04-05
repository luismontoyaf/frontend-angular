import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageServiceService {

  private messageSubject = new BehaviorSubject<string>('');
  private processSubject = new BehaviorSubject<string>('');

    message$ = this.messageSubject.asObservable();
    proccess$ = this.processSubject.asObservable();
  
    setMessageSuccess(message: string): void {
      this.messageSubject.next(message);
    }

    setDeleteMessage(message: string): void {
      this.messageSubject.next(message);
    }

    setProcess(proccess: string): void {
      this.processSubject.next(proccess);
    }
}
