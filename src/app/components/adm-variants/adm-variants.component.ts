import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormArray, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TitleService } from '../../shared/services/title.service';
import { VariantsService } from '../../services/Variants/variants.service';
import { MessageService } from '../../dialogs/services/message-service.service';
import { SuccessModalComponent } from '../../dialogs/shared/success-modal/success-modal.component';

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
export default class AdmVariantsComponent implements OnInit {
  variantsForm: FormGroup;

  atributes: FormArray;

  message: string = '';

  isEditMode = false;
  variantId!: number;

  constructor(
    private titleService: TitleService,
    private variantsService: VariantsService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {
    this.variantsForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      atributes: this.fb.array([]),
    });

    this.atributes = this.variantsForm.get('atributes') as FormArray;
  }

  ngOnInit(): void {
    this.setTitle('Administrar Variantes');

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (id) {
        this.isEditMode = true;
        this.variantId = +id;
        this.loadVariant(this.variantId);
      } else {
        this.addVariantValue();
      }
    });
  }

  loadVariant(id: number): void {
    this.variantsService.getVariantById(id).subscribe({
      next: (variant) => {
        this.variantsForm.patchValue({
          name: variant.name
        });

        this.atributes.clear();

        const parsedAtributes =
          typeof variant.jsonValues === 'string'
            ? JSON.parse(variant.jsonValues)
            : variant.jsonValues;

        parsedAtributes.forEach((a: any) => {
          this.atributes.push(
            this.fb.group({
              value: [a.Value || a.value, Validators.required]
            })
          );
        });
      },
      error: () => {
        console.error('Error al cargar la variante');
      }
    });
  }

  addVariantValue() {
    if (!this.validVariantsInputs()) {
      this.message = 'Debe ingresar el valor';
      return;
    }
    const atributeGroup = this.fb.group({
      value: ['', Validators.required],
    });
    this.atributes.push(atributeGroup);
  }

  onSubmit(){

    if (this.variantsForm.invalid) {
      this.variantsForm.markAllAsTouched();
      return;
    }

    const formData = this.variantsForm.value;

    if (this.isEditMode) {
      this.updateVariant(formData);
    } else {
      this.createVariant(formData);
    }
  }

  createVariant(formData: any) {

    this.variantsService.createVariant(formData).subscribe({
      next: (response) => {
        this.handleSuccess();
      },
      error(err) {
        console.error('No se pudo guardar la variante, intente nuevamente.');
      },
    });
  }

  updateVariant(formData: any): void {
  this.variantsService.updateVariant(this.variantId, formData).subscribe({
    next: () => {
      this.message = 'La variante fue actualizada correctamente';
      this.handleSuccess();
    },
    error: () => {
      console.error('Error al actualizar la variante');
    }
  });
}

  handleSuccess() {
    this.message =
      'La variante ha sido agregada exitosamente';
    this.setMessage(this.message);
    this.setProccess(''); 
    this.openSuccessDialog();
  }

  validVariantsInputs(): boolean {
    for (let i = 0; i < this.atributes.length; i++) {
      const atribute = this.atributes.at(i) as FormGroup;

      if (!atribute.get('value')?.value) return false;
    }

    return true;
  }

  removeVariant(index: number) {
    this.atributes.removeAt(index);
  }

  setTitle(title: string): void {
    this.titleService.setTitle(title);
  }

  setMessage(message: string): void {
    this.messageService.setMessageSuccess(message);
  }

  setProccess(proccess: string): void {
    this.messageService.setProcess(proccess);
  }

  openSuccessDialog(): void {
    this.dialog.open(SuccessModalComponent, {});
  }

  // Método para cerrar el popup
  closeDialog(): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/products']); // Recarga la vista actual
    });
  }
}
