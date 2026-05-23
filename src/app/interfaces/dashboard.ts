export interface DashboardResponse {
  ventasHoy: number;
  totalVentas: number;
  totalClientes: number;
  stockBajo: number;
  ventasSemana: VentaSemana[];
}

export interface VentaSemana {
  dia: string;
  total: number;
  valor?: number;
}