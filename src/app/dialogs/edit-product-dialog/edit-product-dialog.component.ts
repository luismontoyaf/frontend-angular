import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { ProductsService } from '../../services/Products/products.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageServiceService } from '../services/message-service.service';
import { SuccessModalComponent } from '../shared/success-modal/success-modal.component';

interface Product {
  id: number;
  nombreProducto: string;
  descripcion: string;
  stock: number;
  precio: number;
  imagenBase64?: string; // Imagen como Base64 (cuando se obtiene)
  imagenFile?: File;     // Imagen como File (cuando se envía)
}

@Component({
  selector: 'app-edit-product-dialog',
  imports: [CommonModule, FormsModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './edit-product-dialog.component.html',
  styleUrl: './edit-product-dialog.component.css'
})
export class EditProductDialogComponent {
productForm: FormGroup;
  selectedFile: File | null = null;

  message = '';

  imagePreview: string | ArrayBuffer | null = null; 

  constructor(private dialogRef: MatDialogRef<EditProductDialogComponent>, 
    private fb: FormBuilder, 
    private productsService: ProductsService,
    private messageService: MessageServiceService,
    private dialog: MatDialog, 
    @Inject(MAT_DIALOG_DATA) public data: { product: Product }  ) {
      
    this.productForm = this.fb.group({
      name: [data.product?.nombreProducto || '', [Validators.required, Validators.minLength(3)]],
      description: [data.product?.descripcion || '', Validators.required],
      price: [data.product?.precio || '', [Validators.required, Validators.min(1)]],
      quantity: [data.product?.stock || 0, [Validators.required, Validators.min(1)]],
      image: [null]
    });

    if (data.product?.imagenBase64) {
      this.imagePreview = `data:image/jpeg;base64,${data.product.imagenBase64}`;
    }
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

  editProducts() {
    if (this.productForm.invalid) {
      this.message = 'Por favor, corrige los errores en el formulario.';
      return;
    }
  
    const cambios: Partial<Product> = {}; // Objeto para almacenar solo los cambios
  
    // Obtener valores actuales del formulario
    const formValues = this.productForm.value;
  
    // Comparar con los valores originales y agregar solo los que cambiaron
    if (formValues.name !== this.data.product.nombreProducto) {
      cambios.nombreProducto = formValues.name;
    }
    if (formValues.description !== this.data.product.descripcion) {
      cambios.descripcion = formValues.description;
    }
    if (formValues.price !== this.data.product.precio) {
      cambios.precio = formValues.price;
    }
    if (formValues.quantity !== this.data.product.stock) {
      cambios.stock = formValues.quantity;
    }
    if (this.selectedFile) {
      cambios.imagenFile = this.selectedFile;
    }
  
    // Si no hay cambios, no hacemos la petición
    if (Object.keys(cambios).length === 0) {
      this.message = 'No se detectaron cambios.';
      return;
    }

    console.log("cambios: " + JSON.stringify(cambios));
    
  
    // Enviar solo los cambios detectados en la solicitud PATCH
    this.productsService.editProduct(this.data.product.id, cambios).subscribe(
      (response) => {
        console.log('Producto actualizado:', response);
        this.message = 'El producto fue editado exitosamente';
        this.setMessage(this.message); // Llamar al servicio para mostrar el mensaje
        this.dialogRef.close(true); // Cerrar diálogo y recargar datos en la vista principal
        this.openSuccessDialog(); // Abrir el diálogo de éxito
      },
      (error) => {
        console.error('Error:', error);
        this.message = 'No se pudo editar el producto: ' + error.error.message;
      }
    );
  }

  setMessage(message: string): void {
    this.messageService.setMessageSuccess(message);
  }

  openSuccessDialog(): void {
    this.dialog.open(SuccessModalComponent, {
    });
  };

  // Método para cerrar el popup
  closeDialog(): void {
    this.dialogRef.close();
  }
}
