/**
 * ARCHIVO JS DE COMUNICACIÓN FRONTEND -> BACKEND
 * Implementa fetch() para consumir la API REST MVC en Express.
 */

// URL del servidor local de Node.js donde configuramos nuestros endpoints CRUD
const API_BASE_URL = 'http://localhost:9151';
const API_URL = `${API_BASE_URL}/api/productos`;

// Captura de Nodos del DOM (Modal, Grilla y Formulario)
const grid = document.getElementById('productos-grid');
const modal = document.getElementById('productModal');
const btnNuevo = document.getElementById('btnNuevoProducto');
const btnClose = document.getElementById('closeModal');
const form = document.getElementById('productForm');

// Eventos de Apertura/Cierre del Modal
btnNuevo.onclick = () => {
    document.getElementById('modalTitle').innerText = 'Nuevo Producto / Servicio';
    form.reset(); // Limpia campos viejos
    document.getElementById('prod_id').value = ''; // ID vacío significa "Crear"
    modal.style.display = 'flex';
}

btnClose.onclick = () => modal.style.display = 'none';

// Cierra el modal si el usuario hace clic afuera del cajón
window.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
}

// ----------------------------------------------------
// READ: Obtener Lista de Productos desde MySQL
// ----------------------------------------------------
async function cargarProductos() {
    try {
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) throw new Error('Servidor no respondió con 200 OK');
        
        const productos = await respuesta.json(); // Array de objetos "Producto" mapeados por el Backend
        
        grid.innerHTML = ''; // Limpiar grilla de "Cargando"
        
        if (productos.length === 0) {
            grid.innerHTML = '<p>El inventario está vacío. Añade un nuevo recibo.</p>';
            return;
        }

        // Renderizado del DOM dinámico por cada producto
        productos.forEach(prod => {
            // Un pequeño bloque lógico de front-end visual:
            const card = document.createElement('div');
            card.className = 'card product-card';
            card.innerHTML = `
                <div class="prod-img" style="font-size: 3rem; overflow:hidden; display:flex; justify-content:center; align-items:center; height:120px; background:#f4f4f4;">
                    ${prod.urlImagen ? `<img src="${API_BASE_URL}${prod.urlImagen}" alt="${prod.nombre}" style="max-height:100%; max-width:100%; object-fit:cover;">` : `<i class="fa-solid fa-box"></i>`}
                </div>
                <h3 style="font-size: 1.1rem; line-height: 1.3;">${prod.nombre}</h3>
                <p class="price" style="margin: 8px 0;">$${Number(prod.precio).toLocaleString('es-CO')} COP</p>
                <div style="font-size: 0.9rem; margin-bottom: 10px; opacity: 0.8;">
                    <span>Stock: ${prod.stock}</span> | <span>Categoría ID: ${prod.categoria_id}</span>
                </div>
                ${(typeof perfilEnLinea !== 'undefined' && perfilEnLinea && perfilEnLinea.role === 'ROLE_ADMIN') ? `
                <div class="card-actions">
                    <button class="btn-edit" onclick="abrirModoEdicion(${prod.id}, '${prod.nombre.replace(/'/g, "\\'")}', ${prod.precio}, ${prod.categoria_id}, ${prod.stock})">
                        <i class="fa-solid fa-pen"></i> Editar
                    </button>
                    <button class="btn-delete" onclick="eliminarProducto(${prod.id})">
                        <i class="fa-solid fa-trash"></i> Eliminar
                    </button>
                </div>
                ` : ''}
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; background: rgba(231, 76, 60, 0.1); padding: 20px; border-left: 5px solid #e74c3c;">
                <h3 style="color: #e74c3c;"><i class="fa-solid fa-triangle-exclamation"></i> Backend Desconectado</h3>
                <p>No pudimos cargar los productos. Asegúrate de iniciar tu servidor Java arrancándolo desde el proyecto <b>backend-java/</b> estipulado.</p>
            </div>
        `;
        console.error('Fetch Error:', error);
    }
}

// ----------------------------------------------------
// CREATE & UPDATE: Enviado de Formulario para Guardar BD
// ----------------------------------------------------
form.onsubmit = async (e) => {
    e.preventDefault(); // Evitamos que la página se recargue tradicionalmente
    
    const id = document.getElementById('prod_id').value;
    
    // Objeto Payload armado simulando JSON standard para nuestras APIS
    const payloadData = {
        nombre: document.getElementById('prod_nombre').value,
        precio: document.getElementById('prod_precio').value,
        categoria_id: document.getElementById('prod_categoria').value,
        stock: document.getElementById('prod_stock').value
    };

    try {
        if (id) {
            // Flujo UPDATE (Verbo HTTP PUT modificado)
            await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadData)
            });
            alert('Producto actualizado exitosamente en Base de Datos.');
        } else {
            // Flujo CREATE (Verbo HTTP POST modificado)
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadData)
            });
            alert('¡Nuevo producto registrado en el inventario real!');
        }
        
        modal.style.display = 'none'; // Desaparece modal
        cargarProductos(); // Vuelve a refrescar todo de la Base de Datos para mantener coherencia pura
        
    } catch (error) {
        console.error('Submit Error:', error);
        alert('Hubo un error de red intentando guardar. Revisa tu consola.');
    }
};

// ----------------------------------------------------
// INYECCIÓN DE DATOS: Lógica Frontend para Edición Rápida
// ----------------------------------------------------
window.abrirModoEdicion = (id, nombre, precio, catId, stock) => {
    document.getElementById('modalTitle').innerText = 'Modificar Entrada de Inventario';
    
    // Pinta los datos actuales en el DOM
    document.getElementById('prod_id').value = id;
    document.getElementById('prod_nombre').value = nombre;
    document.getElementById('prod_precio').value = precio;
    document.getElementById('prod_categoria').value = catId;
    document.getElementById('prod_stock').value = stock;
    
    modal.style.display = 'flex';
};

// ----------------------------------------------------
// DELETE: Borrado permanente en Servidor REST
// ----------------------------------------------------
window.eliminarProducto = async (id) => {
    if (confirm('ALERTA: Vas a borrar este producto definitivamente de MySQL. ¿Continuar?')) {
        try {
            await fetch(`${API_URL}/${id}`, {
                method: 'DELETE' // Verbo HTTP DELETE estándar
            });
            alert('Registro eliminado local y en base de datos.');
            cargarProductos(); // Refrescamos vista
        } catch (error) {
            console.error('Delete Error:', error);
            alert('Error eliminando producto.');
        }
    }
};

// AutoEjecutable: Arrancamos pidiendo los datos al entrar a la página (Read automático)
cargarProductos();
