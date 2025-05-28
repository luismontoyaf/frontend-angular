export interface User {
    id?: number;
    nombre: string;
    apellidos:string;
    tipoDocumento:string;
    numDocumento: string;
    correo: string;
    fechaNacimiento: Date;
    fechaIngreso: Date;
    rol: string;
    contrasena: string;
    confirmContrasena: string;
    celular: string;
    direccion: string;
    genero: string;
}
