import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TitleService } from '../../shared/services/title.service';

@Component({
  selector: 'app-adm-variants',
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
  ],
  templateUrl: './adm-variants.component.html',
  styleUrl: './adm-variants.component.css',
})
export default class AdmVariantsComponent implements OnInit{
  variantsForm: FormGroup;

  atributes: FormArray;

  message: string = "";

  ngOnInit(): void{
    this.setTitle('Facturación de Productos');

    this.addVariant();
  }

  constructor(
    private titleService: TitleService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.variantsForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      atributes: this.fb.array([]),
    });

    this.atributes = this.variantsForm.get('atributes') as FormArray;
  }

  addVariant() {
    if (!this.validVariantsInputs()) {
      this.message = "Debe ingresar el valor"
      return;
    }
    const atributeGroup = this.fb.group({
      value: ['', Validators.required],
    });
    this.atributes.push(atributeGroup);
  }

  validVariantsInputs(): boolean {

    for (let i = 0; i < this.atributes.length; i++) {
      const atribute = this.atributes.at(i) as FormGroup;

      if (!atribute.get('value')?.value)  return false;
      
    }

    return true;
  }

  removeVariant(index: number) {
    this.atributes.removeAt(index);
  }

  setTitle(title: string): void {
    this.titleService.setTitle(title);
  }
}
