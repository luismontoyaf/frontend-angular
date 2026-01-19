import { Component, OnInit, signal } from '@angular/core';
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
    if (this.productForm.invalid) {
      this.message = 'Por favor, corrige los errores en el formulario.';
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
    this.hasVariants = this.productForm.get('hasVariants')?.value;
    if (this.hasVariants && this.variants.length == 0) {
      this.message = 'Debes agregar al menos una variante';
      return;
    }
    
    if (!this.hasVariants && this.productForm.get('stock')?.value < 1) {
      this.message = "La cantidad minima es de 1";
      return;
    }

    const { name, description, price, stock } = this.productForm.value;

    var file = this.selectedFile as File;

    //  Si NO hay variantes, se envía un solo producto
    if (!this.hasVariants) {
      this.productsService
        .addProduct(name, description, price, stock, file)
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
    const variants = this.variants.value;
    const requests = variants.map((variant: any) => {
      const variantName = `${name} (${variant.value})`;
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
        this.message = 'No se pudieron agregar los productos';
      }
    );
  }

  updateProduct(data: any){

    const cambios: Partial<Product> = {}; // Objeto para almacenar solo los cambios
  
    // Obtener valores actuales del formulario
    const formValues = this.productForm.value;
  
    // Comparar con los valores originales y agregar solo los que cambiaron
    if (formValues.name !== data.nombreProducto) {
      cambios.nombreProducto = formValues.name;
    }
    if (formValues.description !== data.descripcion) {
      cambios.descripcion = formValues.description;
    }
    if (formValues.price !== data.precio) {
      cambios.precio = formValues.price;
    }
    if (formValues.quantity !== data.stock) {
      cambios.stock = formValues.quantity;
    }
  
    // Si no hay cambios, no hacemos la petición
    if (Object.keys(cambios).length === 0) {
      this.message = 'No se detectaron cambios.';
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
        error: (err) => console.error(err)
      });
    }

    updateProductImage() {
      const formData = new FormData();
      formData.append('imagen', this.selectedFile!);

      this.productsService.updateProductImage(this.idEditProduct!, formData)
        .subscribe({
          next: () =>{ this.handleSuccess()},
          error: err => console.error(err)
        });
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

    this.message = config.message;
    this.setMessage(config.message);
    this.setProccess(config.process);
    config.action();
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

  // Método para cerrar el popup
  closeDialog(): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/products']); // Recarga la vista actual
    });
  }
}
