import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment.development';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ProductsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('includes an optional product code when creating a product', () => {
    const image = new File(['image'], 'product.png', { type: 'image/png' });

    service.addProduct('Iphone 14', 'Teléfono', '1000', 2, image, 'IP14-ROSA').subscribe();

    const request = httpTestingController.expectOne(`${environment.apiUrl}/products`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.get('codigoProducto')).toBe('IP14-ROSA');
    request.flush({});
  });

  it('downloads the bulk product template as a blob', () => {
    const template = new Blob(['Excel template'], { type: 'application/vnd.ms-excel' });

    service.downloadBulkTemplate().subscribe(response => {
      expect(response).toBe(template);
    });

    const request = httpTestingController.expectOne(`${environment.apiUrl}/products/bulk/template`);
    expect(request.request.method).toBe('GET');
    expect(request.request.responseType).toBe('blob');
    request.flush(template);
  });

  it('validates the selected Excel file using the archivo form field', () => {
    const file = new File(['product data'], 'products.xls', { type: 'application/vnd.ms-excel' });

    service.validateBulkProducts(file).subscribe();

    const request = httpTestingController.expectOne(`${environment.apiUrl}/products/bulk/validate`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.get('archivo')).toBe(file);
    request.flush({ isValid: true, errors: [] });
  });

  it('saves the validated Excel file using the archivo form field', () => {
    const file = new File(['product data'], 'products.xls', { type: 'application/vnd.ms-excel' });

    service.saveBulkProducts(file).subscribe();

    const request = httpTestingController.expectOne(`${environment.apiUrl}/products/bulk/save`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.get('archivo')).toBe(file);
    request.flush({ Message: 'Productos guardados correctamente.', Total: 1 });
  });
});
