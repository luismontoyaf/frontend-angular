import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { ProductsService } from '../../services/Products/products.service';

@Component({
  selector: 'app-add-product-dialog',
  standalone: true,
  templateUrl: './add-product-dialog.component.html',
  styleUrls: ['./add-product-dialog.component.css'],
  imports: [CommonModule, FormsModule, MaterialModule, ReactiveFormsModule],
})
export class AddProductDialogComponent {
  productForm: FormGroup;
  selectedFile: File | null = null;

  message = '';

  imagePreview: string | ArrayBuffer | null = null; 

  constructor(private dialogRef: MatDialogRef<AddProductDialogComponent>, private fb: FormBuilder, private productsService: ProductsService ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      quantity: [0, [Validators.required, Validators.min(1)]],
      image: [null] // Este campo almacenará el archivo seleccionado
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
    console.log('ingresa a la funcion addProducts');
    if (this.productForm.invalid || !this.selectedFile) {
      this.message = 'Por favor, corrige los errores en el formulario y selecciona una imagen.';
      return;
    }

    const { name, description, price, quantity } = this.productForm.value;

    this.productsService.addProduct(name, description, price, quantity, this.selectedFile).subscribe(
      (response) => {
        console.log('Producto Registrado');
        this.message = 'Producto agregado exitosamente';
      },
      (error) => {
        console.error('Error:', error);
        this.message = 'No se pudo crear agregar el producto';
      }
    );
  }

  // Método para cerrar el popup
  closeDialog(): void {
    this.dialogRef.close();
  }
}
