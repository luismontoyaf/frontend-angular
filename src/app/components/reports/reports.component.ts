import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleService } from '../../shared/services/title.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportsService } from '../../services/Reports/reports.service';
import { ColumnMode, DatatableComponent, NgxDatatableModule   } from '@siemens/ngx-datatable';

import * as XLSX from 'xlsx';
import saveAs from 'file-saver';

@Component({
  selector: 'app-reports',
  imports: [ReactiveFormsModule, CommonModule, DatatableComponent, NgxDatatableModule ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export default class ReportsComponent implements OnInit{

  reportParamsForm!: FormGroup;

  reportResult: boolean = false;
  reportResults: any;

  pageNumber = 0;
perPage = 10;
  tableCount = 0;       // total registros
  tableOffset = 0; 
  tableRows: any[] = [];
  tableColumns: any[] = [];
  tableLoadingIndicator: boolean = false;
  tableColumnMode = ColumnMode;
  tableMessage = {
    emptyMessage: "No hay registros"
  }
  ngZone: any;

  constructor(private titleService: TitleService,
  private reportsService: ReportsService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ){
    
  }

  ngOnInit(): void {
    this.setTitle('Descargar Reportes');

    this.buildForm();
  }

  buildForm() {
    this.reportParamsForm = this.fb.group({
      tipoReporte: ['00', Validators.required],
      fechaInicio: '',
      fechaFinal: ''
    })
  }

  setTitle(title: string): void {
    this.titleService.setTitle(title);
  }

  consultarReporte(){
    let Id = parseInt(this.reportParamsForm.get('tipoReporte')?.value);
    
    let startDate = (this.reportParamsForm.get('fechaInicio')?.value ==null || this.reportParamsForm.get('fechaInicio')?.value =="")?
                    "" : this.reportParamsForm.get('fechaInicio')?.value;

    let endDate = (this.reportParamsForm.get('fechaFinal')?.value ==null || this.reportParamsForm.get('fechaFinal')?.value =="")?
                    "" : this.reportParamsForm.get('fechaFinal')?.value;

    this.tableLoadingIndicator = true;

    this.reportsService.getReport(Id, startDate, endDate, true).subscribe (response => {
      
      const result = response;

      const claves = Object.keys(result[0]);

      if (response && response.length > 0) {
        this.tableColumns = claves;
        this.reportResults = [...response]; // copia segura
        this.tableRows = [...response];     // copia para la tabla
        this.reportResult = true;
      }

      this.tableLoadingIndicator = false;
    }
    , error => {
      this.tableColumns = [];
        this.tableRows = [];
        this.reportResult = false;
        this.reportResults = [];
    });
    
  }

  descargarExcel() {
    if (!this.reportResults || this.reportResults.length === 0) {
      console.warn("No hay datos para exportar");
      return;
    }

    let Id = parseInt(this.reportParamsForm.get('tipoReporte')?.value);
    var nombreReporte = ""
    switch (Id) {
      case 1:
        nombreReporte = "Todos los Productos"
        break;
      case 2:
        nombreReporte = "Ventas Dia Actual"
        break;
      case 3:
        nombreReporte = "Ventas Rango de Fechas"
        break;
      case 4:
        nombreReporte = "Productos Agotados"
        break;
      case 5:
        nombreReporte = "Devoluciones"
        break;
      case 6:
        nombreReporte = "Productos Próximos a Agotarse"
        break;
      default:
        break;
    }

    const safeData = JSON.parse(JSON.stringify(this.reportResults));
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(safeData);

    // Crear libro
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Reporte': worksheet },
      SheetNames: ['Reporte']
    };

    // Generar buffer
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Guardar con file-saver
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
    saveAs(blob, `Reporte_${nombreReporte}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  
    this.ngZone.runOutsideAngular(() => {
    setTimeout(() => {
      this.ngZone.run(() => {
        this.cdr.detectChanges();
      });
    }, 100); // 100ms es generalmente suficiente
  });
  }

  onPage(event: any) {
    this.pageNumber = event.page;
    this.perPage = event.perPage;
  }
}
