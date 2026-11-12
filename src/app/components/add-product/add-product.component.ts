import { Component, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';
import {
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { ProductsService } from '../../services/Products/products.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MessageService } from '../../dialogs/services/message-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { VariantsService } from '../../services/Variants/variants.service';
import { Variants } from '../../interfaces/variants';
import { SuccessSavedProductComponent } from '../../dialogs/shared/success-saved-product/success-saved-product.component';
import { Product} from '../../interfaces/product';
import { SuccessModalComponent } from '../../dialogs/shared/success-modal/success-modal.component';
import { DisableRowDirective } from "@siemens/ngx-datatable";

@Component({
  selector: 'app-add-product',
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule
],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css',
})
export default class AddProductComponent implements OnInit {
  productForm: FormGroup;
  selectedFile: File | null = null;
  hasVariants: boolean = false;
  content: boolean = false;

  message = '';
  messageType: 'error' | 'success' | 'info' = 'info';

  imagePreview: string | ArrayBuffer = 'assets/images/noProductImage.png';

  variantsAvailable = signal<Variants[]>([]);
  selectedVariant: any = null;
  selectedVariants = new Set<number>();

  idEditProduct: number | null = null;
  isEditMode = false;
  productSelected!: Product;

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private messageService: MessageService,
    private variantSerivce: VariantsService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      codigoProducto: [''],
      price: ['', [Validators.required, Validators.min(1)]],
      image: [null],
      stock: [0],
      hasVariants: [false],
      variants: this.fb.array([]),
    });

    this.idEditProduct = Number(this.route.snapshot.paramMap.get('id'));

    if (this.idEditProduct) {
      this.isEditMode = true;
    }
  }

  async ngOnInit() {
    await this.getVariants();


    if (this.isEditMode) {
      await this.loadProductForEdit();
    }else{
      await this.setDefaultImageAsFile();
    }

  }

  addProducts() {
    this.message = '';
    if (this.productForm.invalid) {
      this.setStatusMessage('Por favor, corrige los errores en el formulario.', 'error');
      return;
    }

    if (this.isEditMode) {
      const productData = {
        ...this.productForm.value,
        image: this.selectedFile
      };

      this.updateProduct(productData);
    } else {
      this.createProduct();
    }

  }

  createProduct(){
    this.message = '';
    this.hasVariants = this.productForm.get('hasVariants')?.value;
    if (this.hasVariants && this.variants.length == 0) {
      this.setStatusMessage('Debes agregar al menos una variante', 'error');
      return;
    }
    
    if (!this.hasVariants && this.productForm.get('stock')?.value < 1) {
      this.setStatusMessage('La cantidad mínima es de 1', 'error');
      return;
    }

    const { name, description, price, stock, codigoProducto } = this.productForm.value;

    var file = this.selectedFile as File;

    //  Si NO hay variantes, se envía un solo producto
    if (!this.hasVariants) {
      this.productsService
        .addProduct(name, description, price, stock, file, codigoProducto)
        .subscribe(
          (response) => {
            this.handleSuccess();
          },
          (error) => {
            this.setStatusMessage(this.getProductErrorMessage(
              error,
              'No se pudo agregar el producto.'
            ), 'error');
          }
        );
      return;
    }

    // Si hay variantes, dispersa los productos
    const variants = this.variants.value;
    const requests = variants.map((variant: any) => {
      const variantName = `${name} (${variant.value})`;
      return this.productsService.addProduct(
        variantName,
        description,
        price,
        variant.stock,
        file,
        variant.codigoProducto
      );
    });

    // Ejecutar todas las peticiones
    forkJoin(requests).subscribe(
      (responses) => {
        this.handleSuccess();
      },
      (error) => {
        this.setStatusMessage(this.getProductErrorMessage(
          error,
          'No se pudieron agregar los productos.'
        ), 'error');
      }
    );
  }

  updateProduct(data: any){
    this.message = '';

    const cambios: Partial<Product> = {}; // Objeto para almacenar solo los cambios
  
    // Obtener valores actuales del formulario
    const formValues = this.productForm.value;
  
    // Comparar con los valores originales y agregar solo los que cambiaron
    if (formValues.name !== this.productSelected.nombreProducto) {
      cambios.nombreProducto = formValues.name;
    }
    if (formValues.description !== this.productSelected.descripcion) {
      cambios.descripcion = formValues.description;
    }
    const codigoProducto = formValues.codigoProducto.trim();
    if (codigoProducto !== (this.productSelected.codigoProducto ?? '')) {
      cambios.codigoProducto = codigoProducto || null;
    }
    if (formValues.price !== this.productSelected.precio) {
      cambios.precio = Number(formValues.price.replace(/\./g, ''));
    }
    if (formValues.stock !== this.productSelected.stock) {
      cambios.stock = formValues.stock;
    }
  
    // Si no hay cambios, no hacemos la petición
    if (Object.keys(cambios).length === 0) {
      this.setStatusMessage('No se detectaron cambios.', 'info');
      return;
    }
      this.productsService.editProduct(this.idEditProduct!, cambios).subscribe({
        next: () => {
          if (this.selectedFile) {
            this.updateProductImage();
          } else {
            this.handleSuccess();
          }
        },
        error: (error) => {
          this.setStatusMessage(this.getProductErrorMessage(
            error,
            'No se pudo editar el producto.'
          ), 'error');
        }
      });
    }

    updateProductImage() {
      this.productsService.updateProductImage(this.idEditProduct!, this.selectedFile!)
        .subscribe({
          next: () => this.handleSuccess(),
          error: (error) => {
            this.setStatusMessage(this.getProductErrorMessage(
              error,
              'No se pudo actualizar la imagen del producto.'
            ), 'error');
          }
        });
    }

    private getProductErrorMessage(error: unknown, fallback: string): string {
      if (!(error instanceof HttpErrorResponse)) {
        return error instanceof Error ? error.message : fallback;
      }

      const body = error.error;
      const responseMessage = this.extractResponseMessage(body);
      const duplicateCodeMessage =
        'El código ingresado ya está asignado a otro producto. Ingresa un código diferente.';
      const duplicateCodePattern =
        /(c[oó]digo|code).*(duplic|existe|unique|asignad|registrad)|(duplic|unique).*(c[oó]digo|code)/i;

      if (error.status === 409 || (responseMessage && duplicateCodePattern.test(responseMessage))) {
        return responseMessage && duplicateCodePattern.test(responseMessage)
          ? responseMessage
          : duplicateCodeMessage;
      }

      return responseMessage ?? fallback;
    }

    private extractResponseMessage(body: unknown): string | null {
      if (typeof body === 'string') {
        return body;
      }

      if (!body || typeof body !== 'object') {
        return null;
      }

      const response = body as Record<string, unknown>;
      const directMessage =
        response['message'] ??
        response['Message'] ??
        response['detail'] ??
        response['title'] ??
        response['error'];

      if (typeof directMessage === 'string') {
        return directMessage;
      }

      const errors = response['errors'];
      if (errors && typeof errors === 'object') {
        const messages = Object.values(errors)
          .flatMap(value => Array.isArray(value) ? value : [value])
          .filter((value): value is string => typeof value === 'string');
        return messages.join(' ');
      }

      return null;
    }

  handleSuccess() {
    const config = this.isEditMode
      ? {
          message: 'El producto ha sido editado exitosamente.',
          process: 'closeModalFromEditProduct',
          action: () => this.openSuccessModal()
        }
      : {
          message: 'El producto ha sido agregado exitosamente ¿Desea agregar otro producto?',
          process: 'openAddProductDialog',
          action: () => this.openSuccessSavedProductDialog()
        };

    this.setStatusMessage(config.message, 'success');
    this.setMessage(config.message);
    this.setProccess(config.process);
    config.action();
  }

  setStatusMessage(message: string, type: 'error' | 'success' | 'info'): void {
    this.message = message;
    this.messageType = type;
  }
  

  async getVariants() {
    this.variantSerivce.getVariants().subscribe({
      next: (response: Variants) => {
        const variantsParsed = Array.isArray(response) ? response : [response];

        this.variantsAvailable.set(variantsParsed);
      },
      error: (err) => {
        this.content = true;
      },
    });
  }

  isVariantSelected(id: number): boolean {
    return this.selectedVariants.has(id);
  }

  toggleVariant(variant: any) {
    const isSelected = this.selectedVariants.has(variant.id);

    if (isSelected) {
      this.removeVariantValues(variant.name);
      this.selectedVariants.delete(variant.id);
    } else {
      this.addVariantValues(variant);
      this.selectedVariants.add(variant.id);
    }
  }

  addVariantValues(variant: any) {
    const values =
      typeof variant.jsonValues === 'string'
        ? JSON.parse(variant.jsonValues)
        : variant.jsonValues;

    values.forEach((v: any) => {
      this.variants.push(
        this.fb.group({
          name: [variant.name, Validators.required],
          value: [v.Value, Validators.required],
          stock: [0, [Validators.required, Validators.min(0)]],
          codigoProducto: [''],
        })
      );
    });
  }

  private loadProductForEdit(): void {
    this.productsService.getProductById(this.idEditProduct!).subscribe({
      next: (product) => {
        this.productSelected = product;

        this.productForm.patchValue({
          name: product.nombreProducto,
          description: product.descripcion,
          codigoProducto: product.codigoProducto ?? '',
          price: product.precio,
          stock: product.stock,
          hasVariants: false
        });

        if (product.imagenBase64) {
          this.imagePreview = `data:image/png;base64,${product.imagenBase64}`;
        }
      },
      error: (err) => {
        console.error('Error al cargar producto', err);
      }
    });
  }

  removeVariantValues(variantName: string) {
    for (let i = this.variants.length - 1; i >= 0; i--) {
      const group = this.variants.at(i) as FormGroup;
      if (group.get('name')?.value === variantName) {
        this.variants.removeAt(i);
      }
    }
  }

  getSelectedVariantsText(): string {
    return this.variantsAvailable()
      .filter((v) => this.selectedVariants.has(v.id))
      .map((v) => v.name)
      .join(', ');
  }

  addVariant() {
    if (this.validVariantsInputs()) {
    }
    const variantGroup = this.fb.group({
      name: ['', Validators.required],
      value: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(1)]],
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
        this.imagePreview = reader.result!; // Almacenamos la URL de la imagen
      };
      reader.readAsDataURL(this.selectedFile); // Leemos la imagen como una URL de datos
    }
  }

  async setDefaultImageAsFile() {
    if (this.selectedFile) return;

    const response = await fetch(this.imagePreview as string);
    const blob = await response.blob();

    const file = new File([blob], 'noProduct.png', {
      type: blob.type
    });

    this.selectedFile = file;
  }

  setHasVariants() {
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

  openSuccessSavedProductDialog(): void {
    this.dialog.open(SuccessSavedProductComponent, {});
  }

  openSuccessModal(): void {
    this.dialog.open(SuccessModalComponent, {});
  }

  closeDialog(): void {
    const tenant = sessionStorage.getItem('tenantId');

    if (!tenant) {
      window.location.href = '/invalid-tenant';
      return;
    }

    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${tenant}/dashboard/products`]);
    });
  }
}
