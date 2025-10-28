import { Component } from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { ProductsService } from '../../services/Products/products.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MessageService } from '../../dialogs/services/message-service.service';
import { Router } from '@angular/router';
import { SuccessEditModalComponent } from '../../dialogs/shared/success-edit-modal/success-edit-modal.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-add-product',
  imports: [CommonModule, FormsModule, MaterialModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export default class AddProductComponent {

  productForm: FormGroup;
  selectedFile: File | null = null;
  hasVariants: boolean = false;
  
    message = '';
  
    imagePreview: string | ArrayBuffer | null = null; 
  
    constructor(
      private fb: FormBuilder, 
      private productsService: ProductsService,
    private messageService: MessageService,
    private router: Router,
      private dialog: MatDialog) {
      this.productForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', Validators.required],
        price: ['', [Validators.required, Validators.min(1)]],
        image: [null],
        hasVariants: [false],
        variants: this.fb.array([])
      });
    }
  
    formatPrice(event: Event): void {
      const inputElement = event.target as HTMLInputElement;
      let value = inputElement.value.replace(/[^0-9]/g, '');
  
      if (value) {
        value = new Intl.NumberFormat('es-CO').format(parseInt(value, 10));
        inputElement.value = value;
      }
  
      this.productForm.get('price')?.setValue(inputElement.value);
      this.productForm.get('price')?.markAsDirty(); 
    }
  
      get variants(): FormArray {
      return this.productForm.get('variants') as FormArray;
    }
  
    onFileSelected(event: Event): void {
      const input = event.target as HTMLInputElement;
      if (input?.files?.length) {
        this.selectedFile = input.files[0];
        this.productForm.patchValue({ image: this.selectedFile });
  
        // Usamos FileReader para mostrar la previsualización
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result; // Almacenamos la URL de la imagen
        };
        reader.readAsDataURL(this.selectedFile); // Leemos la imagen como una URL de datos
      }
    }
  
  addProducts() {
      if (this.productForm.invalid) {
        this.message = 'Por favor, corrige los errores en el formulario.';
        return;
      }
      
      this.hasVariants = this.productForm.get('hasVariants')?.value;
      if (this.hasVariants && this.variants.length == 0) {
        this.message = 'Debes agregar al menos una variante';
        return;
      }

      const { name, description, price, quantity } = this.productForm.value;
      
      const file = this.selectedFile as File;
  
      //  Si NO hay variantes, se envía un solo producto
      if (!this.hasVariants) {
        const stock = 0; // O podrías añadir un campo "stock" en el form principal
        this.productsService.addProduct(name, description, price, stock, file)
          .subscribe(
            (response) => {
              this.handleSuccess();
            },
            (error) => {
              console.error('Error:', error);
              this.message = 'No se pudo agregar el producto';
            }
          );
        return;
      }

      // Si hay variantes, dispersa los productos
      const variants = this.variants.value; // del FormArray
      const requests = variants.map((variant: any) => {
        const variantName = `${name} (${variant.value})`; // Ej: Camiseta (Negro)
        return this.productsService.addProduct(
          variantName,
          description,
          price,
          variant.stock,
          file
        );
      });

    // Ejecutar todas las peticiones
    forkJoin(requests).subscribe(
      (responses) => {
        this.handleSuccess();
      },
      (error) => {
        console.error('Error al crear variantes:', error);
        this.message = 'No se pudieron crear las variantes';
      }
    );
  }
  
  handleSuccess() {
    this.message = 'El producto ha sido agregado exitosamente ¿Desea agregar otro producto?';
    this.setMessage(this.message); // Llamar al servicio para mostrar el mensaje
    this.setProccess('openAddProductDialog'); 
    this.openSuccessEditDialog();
  }

    addVariant() {
    
    if (this.validVariantsInputs()) {
      
    }
    const variantGroup = this.fb.group({
      name: ['', Validators.required],
      value: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(1)]]
    });
    this.variants.push(variantGroup);
  }

  validVariantsInputs(): boolean {
    const variants = this.productForm.get('variants') as FormArray;

    for (let i = 0; i < variants.length; i++) {
      const variant = variants.at(i) as FormGroup;

      if (
        !variant.get('name')?.value ||
        !variant.get('value')?.value ||
        variant.get('stock')?.value <= 0
      ) {
        return false;
      }
    }

    return true;
  }

  setHasVariants(){
    this.hasVariants = !this.hasVariants;
  }
  
  removeVariant(index: number) {
    this.variants.removeAt(index);
  }
  
    setMessage(message: string): void {
      this.messageService.setMessageSuccess(message);
    }
  
    setProccess(proccess: string): void {
      this.messageService.setProcess(proccess);
    }
  
    openSuccessEditDialog(): void {
        this.dialog.open(SuccessEditModalComponent, {
        });
      };
  
    // Método para cerrar el popup
    closeDialog(): void {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/dashboard/products']); // Recarga la vista actual
      });
    }
}
