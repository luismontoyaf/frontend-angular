export interface Client {
    id?: number;
    nombre: string;
    apellidos:string;
    tipoDocumento:string;
    numDocumento: string;
    correo: string;
    fechaNacimiento: Date;
    // contrasena: string;
    // confirmContrasena: string;
    celular: string;
    direccion: string;
    genero: string;
}
