export interface Product {
    id: number;
    nombreProducto: string;
    descripcion: string;
    codigoProducto?: string | null;
    stock: number;
    precio: number;
    imagenBase64?: string; // Imagen como Base64 (cuando se obtiene)
    imagenFile?: File;     // Imagen como File (cuando se envía)
    activo?: number;
}
