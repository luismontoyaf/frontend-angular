export interface ExpenseRequest {
  tipoEgresoId: number;
  valor: number;
  descripcion?: string;
  referencia?: string;
}