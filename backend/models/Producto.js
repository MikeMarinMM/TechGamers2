/**
 * EL MODELO (Model / Entidad)
 * Esta clase mapea de forma exacta la tabla 'productos' de tu base de datos.
 * Su único trabajo es representar los datos crudos de SQL como un Objeto en el código.
 */
class Producto {
    constructor(
        id, 
        categoria_id, 
        nombre, 
        descripcion, 
        precio, 
        tipo_articulo, 
        stock, 
        estado_articulo, 
        url_imagen, 
        activo, 
        fecha_creacion, 
        fecha_actualizacion
    ) {
        this.id = id;
        this.categoria_id = categoria_id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio; 
        this.tipo_articulo = tipo_articulo;
        this.stock = stock;
        this.estado_articulo = estado_articulo;
        this.url_imagen = url_imagen;
        this.activo = activo; // Usado para ocultar productos sin eliminarlos físicamente (Soft Delete)
        this.fecha_creacion = fecha_creacion;
        this.fecha_actualizacion = fecha_actualizacion;
    }

    /**
     * Lógica de dominio. 
     * Verifica si el producto puede venderse comparando su stock,
     * o si es un servicio y siempre tiene disponibilidad libre.
     */
    estaDisponibleParaCompra() {
        if (this.tipo_articulo === 'SERVICIO_REPARACION') return true; 
        return this.stock > 0 && this.activo === 1; 
    }
}

module.exports = Producto;
