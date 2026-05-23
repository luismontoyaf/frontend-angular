import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpensesService } from '../../services/Expenses/expenses.service';
import { TitleService } from '../../shared/services/title.service';
import { ExpenseRequest } from '../../interfaces/expenses.request';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css']
})
export default class ExpensesComponent implements OnInit {

  private expensesService = inject(ExpensesService);
  private titleService = inject(TitleService);

  expenses: any[] = [];
  expensesTypes: any[] = [];
  vista: 'lista' | 'formulario' = 'lista';

  loading = false;
  errorMessage = '';

  form: ExpenseRequest = {
    tipoEgresoId: 0,
    valor: 0,
    descripcion: '',
    referencia: ''
  };

  ngOnInit(): void {
    this.setTitle('Egresos');
    this.getExpenses();
    this.getExpensesTypes();
  }

  getExpenses(): void {
    this.loading = true;

    this.expensesService.getExpenses().subscribe({
      next: (response) => {
        console.log('response ', response);
        
        this.expenses = response;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Error al cargar los egresos';
        this.loading = false;
      }
    });
  }

  getExpensesTypes(): void {
    this.expensesService.getExpensesTypes().subscribe({
      next: (response) => {
        this.expensesTypes = response;
      }
    });
  }

  saveExpense(): void {

    this.errorMessage = '';

    if (!this.form.tipoEgresoId || this.form.valor <= 0) {
      this.errorMessage = 'Debe completar los campos obligatorios';
      return;
    }

    this.loading = true;

    const payload: ExpenseRequest = {
      tipoEgresoId: this.form.tipoEgresoId,
      valor: this.form.valor,
      descripcion: this.form.descripcion?.trim(),
      referencia: this.form.referencia?.trim()
    };

    this.expensesService.createExpense(payload).subscribe({
      next: () => {

        this.resetForm();
        this.vista = 'lista';
        this.getExpenses();

        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Error al registrar el egreso';
        this.loading = false;
      }
    });
  }

  resetForm(): void {
    this.form = {
      tipoEgresoId: 0,
      valor: 0,
      descripcion: '',
      referencia: ''
    };
  }

  getTotalExpenses(): number {
    return this.expenses.reduce((sum, e) => sum + (e.valor || 0), 0);
  }

  setTitle(title: string): void {
    this.titleService.setTitle(title);
  }
}