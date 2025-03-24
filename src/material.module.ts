import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon'; // Importa el módulo de iconos
import { MatMenuModule } from '@angular/material/menu';
import {MatDividerModule} from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule  } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  imports: [
    MatIconModule, 
    MatMenuModule, 
    MatDividerModule, 
    MatProgressSpinnerModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule], 
  exports: [
    MatIconModule, 
    MatMenuModule, 
    MatDividerModule, 
    MatProgressSpinnerModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule],  
})
export class MaterialModule {}
