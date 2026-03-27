class Usuario {
    constructor(id, rol_id, nombre, correo, password_hash, fecha_registro, activo) {
        this.id = id;
        this.rol_id = rol_id; // 1 = Admin, 2 = Cliente
        this.nombre = nombre;
        this.correo = correo;
        this.password_hash = password_hash;
        this.fecha_registro = fecha_registro;
        this.activo = activo;
    }
}
module.exports = Usuario;
