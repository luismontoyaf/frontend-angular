import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import saveAs from 'file-saver';
import { ProductsService } from '../../services/Products/products.service';
import { TenantService } from '../../services/Tenant/tenant.service';
import { TitleService } from '../../shared/services/title.service';

interface BulkProductImportError {
  row?: number;
  field?: string;
  message: string;
}

interface BulkProductValidation {
  isValid: boolean;
  totalRows?: number;
  errors: BulkProductImportError[];
  message?: string;
}

@Component({
  selector: 'app-bulk-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bulk-products.component.html',
})
export default class BulkProductsComponent implements OnInit {
  selectedFile: File | null = null;
  validation: BulkProductValidation | null = null;
  isDownloading = false;
  isValidating = false;
  isSaving = false;
  isDraggingFile = false;
  errorMessage = '';

  constructor(
    private productsService: ProductsService,
    private titleService: TitleService,
    private tenantService: TenantService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Carga masiva de productos');
  }

  async showImportInstructions(): Promise<void> {
    await Swal.fire({
      icon: 'question',
      title: '¿Cómo llenar la plantilla?',
      html: `
        <div style="text-align:left">
          <p>Completa una fila por producto y conserva los encabezados de la plantilla.</p>
          <p style="margin-top:16px"><strong>Campos obligatorios</strong></p>
          <ul style="padding-left:20px;list-style:disc">
            <li><strong>Nombre:</strong> nombre del producto.</li>
            <li><strong>Stock:</strong> solo números enteros.</li>
            <li><strong>Precio:</strong> ingresa el valor sin puntos ni comas.</li>
          </ul>
          <p style="margin-top:16px"><strong>Campos opcionales</strong></p>
          <ul style="padding-left:20px;list-style:disc">
            <li><strong>Código:</strong> puede contener letras y números.</li>
            <li><strong>Descripción:</strong> detalle adicional del producto.</li>
          </ul>
        </div>
      `,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#0c4a6e',
    });
  }

  async downloadTemplate(): Promise<void> {
    this.errorMessage = '';
    this.isDownloading = true;

    try {
      const file = await firstValueFrom(this.productsService.downloadBulkTemplate());
      saveAs(file, 'plantilla_productos.xls');
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error, 'No se pudo descargar la plantilla.');
    } finally {
      this.isDownloading = false;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.setSelectedFile(file, input);
  }

  onFileDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.isValidating && !this.isSaving) {
      this.isDraggingFile = true;
    }
  }

  onFileDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingFile = false;
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingFile = false;
    this.setSelectedFile(event.dataTransfer?.files[0] ?? null);
  }

  private setSelectedFile(file: File | null, input?: HTMLInputElement): void {
    this.errorMessage = '';
    this.validation = null;
    this.selectedFile = null;

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.xls')) {
      this.errorMessage = 'Selecciona un archivo Excel con extensión .xls.';
      if (input) {
        input.value = '';
      }
      return;
    }

    this.selectedFile = file;
  }

  async validateFile(): Promise<void> {
    if (!this.selectedFile || this.isValidating || this.isSaving) {
      return;
    }

    this.errorMessage = '';
    this.validation = null;
    this.isValidating = true;

    try {
      const response = await firstValueFrom(
        this.productsService.validateBulkProducts(this.selectedFile)
      );
      this.validation = this.normalizeValidation(response);
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error, 'No se pudo validar el archivo.');
    } finally {
      this.isValidating = false;
    }
  }

  async confirmSave(): Promise<void> {
    if (!this.selectedFile || !this.validation?.isValid || this.isSaving) {
      return;
    }

    const confirmation = await Swal.fire({
      icon: 'warning',
      title: '¿Guardar estos productos?',
      text: `Se agregarán ${this.validation.totalRows ?? 'los'} productos del archivo. Todos quedarán con la imagen predeterminada que carga el sistema. Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar productos',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0c4a6e',
      cancelButtonColor: '#64748b',
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    this.errorMessage = '';
    this.isSaving = true;

    try {
      const result = await firstValueFrom(
        this.productsService.saveBulkProducts(this.selectedFile)
      );
      const total = result.total ?? result.Total;
      const message = result.message ?? result.Message;
      await Swal.fire({
        icon: 'success',
        title: 'Productos guardados',
        text: total != null
          ? `Se guardaron ${total} productos correctamente.`
          : message ?? 'Los productos se guardaron correctamente.',
        color: '#15803d',
        confirmButtonText: 'Aceptar',
      });

      const tenant = this.tenantService.getTenantOrThrow();
      await this.router.navigate([`/${tenant}/dashboard/products`]);
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error, 'No se pudieron guardar los productos.');
    } finally {
      this.isSaving = false;
    }
  }

  private normalizeValidation(response: unknown): BulkProductValidation {
    if (!response || typeof response !== 'object') {
      throw new Error('El servidor devolvió una respuesta de validación no reconocida.');
    }

    const record = response as Record<string, unknown>;
    const valueFor = (...names: string[]): unknown => {
      const key = Object.keys(record).find(
        candidate => names.includes(candidate.toLowerCase())
      );
      return key ? record[key] : undefined;
    };

    const rawErrors = valueFor('errors', 'errores', 'validationerrors', 'erroresvalidacion');
    const errors = this.normalizeErrors(rawErrors);
    const rawValidity = valueFor('isvalid', 'valid', 'esvalido', 'valido', 'success', 'successfully');
    const isValid = typeof rawValidity === 'boolean'
      ? rawValidity && errors.length === 0
      : errors.length === 0 && rawErrors !== undefined;
    const rawTotal = valueFor('totalrows', 'total', 'totalproductos', 'cantidadproductos', 'filas');
    const totalRows = typeof rawTotal === 'number' && Number.isFinite(rawTotal)
      ? rawTotal
      : undefined;
    const rawMessage = valueFor('message', 'mensaje', 'summary', 'resumen');

    return {
      isValid,
      totalRows,
      errors,
      message: typeof rawMessage === 'string' ? rawMessage : undefined,
    };
  }

  private normalizeErrors(rawErrors: unknown): BulkProductImportError[] {
    if (rawErrors == null) {
      return [];
    }

    if (Array.isArray(rawErrors)) {
      return rawErrors.flatMap(error => this.toImportErrors(error));
    }

    if (typeof rawErrors === 'string') {
      return rawErrors ? [{ message: rawErrors }] : [];
    }

    if (typeof rawErrors === 'object') {
      return Object.entries(rawErrors as Record<string, unknown>)
        .flatMap(([key, value]) => this.toImportErrors(value, key));
    }

    throw new Error('El servidor devolvió una lista de errores de validación no reconocida.');
  }

  private toImportErrors(value: unknown, fallbackKey?: string): BulkProductImportError[] {
    if (typeof value === 'string') {
      return value ? [{ message: fallbackKey ? `${fallbackKey}: ${value}` : value }] : [];
    }

    if (Array.isArray(value)) {
      return value.flatMap(item => this.toImportErrors(item, fallbackKey));
    }

    if (!value || typeof value !== 'object') {
      return [];
    }

    const record = value as Record<string, unknown>;
    const property = (name: string): unknown => {
      const key = Object.keys(record).find(candidate => candidate.toLowerCase() === name);
      return key ? record[key] : undefined;
    };
    const rawMessage = property('message') ?? property('mensaje') ?? property('error') ?? property('description');
    const rawRow = property('row') ?? property('fila') ?? property('rownumber') ?? property('line');
    const rawField = property('field') ?? property('campo') ?? property('column');

    if (typeof rawMessage === 'string') {
      return [{
        row: typeof rawRow === 'number' ? rawRow : undefined,
        field: typeof rawField === 'string' ? rawField : undefined,
        message: rawMessage,
      }];
    }

    return Object.entries(record)
      .flatMap(([key, nestedValue]) => this.toImportErrors(nestedValue, key));
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error;
      if (typeof body === 'string') {
        return body;
      }

      if (body && typeof body === 'object') {
        const message = body.message ?? body.Message ?? body.title;
        if (typeof message === 'string') {
          return message;
        }
      }
    }

    return error instanceof Error ? error.message : fallback;
  }

  routerBack(): void {
    const tenant = this.tenantService.getTenantOrThrow();
    this.router.navigate([`/${tenant}/dashboard/products`]);
  }
}
