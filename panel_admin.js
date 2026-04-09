/**
 * SCRIPT FRONTAL DE PANEL ADMINISTRATIVO
 * Validaciones JWT y Operaciones de Inyección de Tokens a MySQL
 */
const API_URL = 'http://localhost:9151/api/productos';

// ------------------------------------------------------------------
// 1. CAPA MEDIA FRONTEND: LECTURA DEL TOKEN JWT 
// ------------------------------------------------------------------
// Buscamos las credenciales dejadas hipotéticamente por el AuthController /login en el localStorage
const tokenJwt = localStorage.getItem('tg_token') || 'SimulacionAdmin'; 
// (Nota: para probar fluidamente ahorita, ponemos 'SimulacionAdmin' o puedes des-comentarla)
// pero lo correcto en JWT real es forzar expulsión:

/* --- DESCOMENTA ESTO PARA VERDADERA PROTECCIÓN JWT EN PRODUCCIÓN ---
const userDataStr = localStorage.getItem('tg_user');
if (!tokenJwt || !userDataStr) {
    alert('🔐 PROTECCIÓN DE RUTA\nTechGamers: Acceso Denegado. Solo personal logueado.');
    window.location.replace('index.html');
} else {
    try {
        const user = JSON.parse(userDataStr);
        if (user.rol !== 1) { // ROL 1 = Admin, ROL 2 = Cliente
            alert('🔐 PROTECCIÓN DE ROL\nDenegado: Tu perfil es de Cliente, no tienes jerarquía para editar el inventario.');
            window.location.replace('index.html');
        } else {
            // Pasó todas las barreras. Revelar Panel Oculto.
            document.body.style.display = 'block';
            document.getElementById('adminName').innerText = user.nombre;
            iniciarDashboardSeguro();
        }
    } catch {
        localStorage.clear();
        window.location.replace('index.html');
    }
}
----------------------------------------------------------------------*/

// MODO DESARROLLO (Bypass temporal simulando tener la credencial, para que pruebes tu Frontend cómodamente):
document.body.style.display = 'block';
document.getElementById('adminName').innerText = 'Jefe de Tienda (Modo Pruebas)';
iniciarDashboardSeguro();


// ------------------------------------------------------------------
// 2. LÓGICA CORE JWT + RENDERING (CRUD)
// ------------------------------------------------------------------
function iniciarDashboardSeguro() {
    const tabla = document.getElementById('tabla-productos');
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    
    // Controles Modal
    document.getElementById('btnNuevoProducto').onclick = () => {
        document.getElementById('modalTitle').innerText = 'Nuevo Producto';
        form.reset();
        document.getElementById('prod_id').value = '';
        modal.style.display = 'flex';
    };

    document.getElementById('closeModal').onclick = () => {
        modal.style.display = 'none';
        document.getElementById('preview_imagen').style.display = 'none';
        document.getElementById('preview_imagen').src = '';
    };

    // Lógica FileReader para Previsualización Estética Instantánea
    const imgInput = document.getElementById('prod_imagen');
    const imgPreview = document.getElementById('preview_imagen');
    
    imgInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imgPreview.src = e.target.result;
                imgPreview.style.display = 'inline-block';
            }
            reader.readAsDataURL(file);
        } else {
            imgPreview.style.display = 'none';
            imgPreview.src = "";
        }
    });

    // Desconectar Administrador
    window.cerrarSesion = () => {
        if(confirm('¿Cerrar sesión de forma segura y destruir tu Token JWT?')){
            localStorage.removeItem('tg_token');
            localStorage.removeItem('tg_user');
            window.location.replace('index.html'); // Salida a público
        }
    };

    // A) (READ) - Renderizado de Tabla E-commerce Real-Time
    window.cargarTabla = async () => {
        try {
            const res = await fetch(API_URL);
            const productos = await res.json();
            
            tabla.innerHTML = '';
            if(productos.length === 0) {
                tabla.innerHTML = '<tr><td colspan="6" style="text-align:center;">📦 Bodega Vacía. Añade mercancías.</td></tr>';
                return;
            }

            productos.forEach(prod => {
                const fila = document.createElement('tr');
                const pDesc = prod.descripcion ? prod.descripcion : 'Sin ficha técnica ingresada.'; // Lee el text-area
                
                fila.innerHTML = `
                    <td style="color:var(--primary); font-weight:800;">#${prod.id}</td>
                    <td>
                        <div style="font-weight: 600; font-size:1.05rem;">${prod.nombre}</div>
                        <div style="font-size: 0.85rem; opacity: 0.7; margin-top: 4px; max-width: 350px;">${pDesc}</div>
                    </td>
                    <td><span style="background: ${prod.stock > 3 ? '#2ecc71' : '#e74c3c'}; color:white; padding: 4px 10px; border-radius:12px; font-weight:bold;">${prod.stock}</span></td>
                    <td style="font-family: monospace; font-size:1.1rem; letra-spacing: -1px;">$${Number(prod.precio).toLocaleString('es-CO')}</td>
                    <td><i class="fa-solid fa-layer-group" style="opacity:0.5; margin-right:5px;"></i>${prod.categoria_id}</td>
                    <td>
                        <button class="btn-sm edit-row" onclick="editarRegistro(${prod.id}, '${prod.nombre.replace(/'/g, "\\'")}', '${pDesc.replace(/'/g, "\\'")}', ${prod.precio}, ${prod.categoria_id}, ${prod.stock}, '${prod.urlImagen || prod.url_imagen}')">
                            <i class="fa-solid fa-pen"></i> Actualizar
                        </button>
                        <button class="btn-sm delete-row" onclick="eliminarRegistro(${prod.id})">
                            <i class="fa-solid fa-trash"></i> Eliminar
                        </button>
                    </td>
                `;
                tabla.appendChild(fila);
            });

        } catch (error) {
            tabla.innerHTML = '<tr><td colspan="6" style="color:#e74c3c;"><i class="fa-solid fa-triangle-exclamation"></i> Enlace interrumpido con el API Java. Levanta Spring Boot en el puerto 9151.</td></tr>';
        }
    };

    // B) (POST/PUT) - Subida / Muta mediante JWT y Formularios FormData (Multer-Ready)
    form.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('prod_id').value;
        const btnGuardar = form.querySelector('button[type="submit"]');
        btnGuardar.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Subiendo...';
        btnGuardar.disabled = true;
        
        // Empaquetado Automático Multipar 
        const formData = new FormData();
        formData.append('nombre', document.getElementById('prod_nombre').value);
        formData.append('descripcion', document.getElementById('prod_desc').value);
        formData.append('precio', document.getElementById('prod_precio').value);
        formData.append('categoria_id', document.getElementById('prod_categoria').value);
        formData.append('stock', document.getElementById('prod_stock').value);
        
        // Adjunto de Archivo Seguro si existe
        if(imgInput.files[0]) {
            formData.append('imagen', imgInput.files[0]);
        }

        try {
            const tokenHeader = localStorage.getItem('tg_token') || 'TokenSimuladoValido';

            // ATENCIÓN: Al enviar FormData, JAMÁS debemos fijar manualmente el 'Content-Type'. 
            // El navegador generará un Header Multiparte con los LÍMITES BOUNDARY correctos automáticamente.
            const opcionesRequest = {
                method: id ? 'PUT' : 'POST',
                headers: { 
                    'Authorization': `Bearer ${tokenHeader}` // <<< LLAVE JWT >>>
                },
                body: formData
            };

            const endpoint = id ? `${API_URL}/${id}` : API_URL;
            const res = await fetch(endpoint, opcionesRequest);
            
            // Si nuestro Request sin Token o con Token Falso rebota, dirá "Prohibido".
            if(res.ok) {
                alert(`Mercancía ${id ? 'editada' : 'inscripta en Base de Datos'} de Forma Segura ✨`);
                modal.style.display = 'none';
                imgInput.value = '';
                imgPreview.src = '';
                imgPreview.style.display = 'none';
                cargarTabla();
            } else {
                const eData = await res.json();
                alert('🛑 Error Procesando API: ' + eData.message);
            }
        } catch (error) {
            alert('Falló el envío de red.');
        } finally {
            btnGuardar.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Ejecutar Guardado Seguro';
            btnGuardar.disabled = false;
        }
    };

    // Pre-Cargar Modal
    window.editarRegistro = (id, nom, desc, pre, cat, stk, url_img) => {
        document.getElementById('modalTitle').innerText = 'Ajuste de Variables DB';
        document.getElementById('prod_id').value = id;
        document.getElementById('prod_nombre').value = nom;
        document.getElementById('prod_desc').value = desc === 'Sin ficha técnica ingresada.' ? '' : desc; // Limpia si era default
        document.getElementById('prod_precio').value = pre;
        document.getElementById('prod_categoria').value = cat;
        document.getElementById('prod_stock').value = stk;
        
        // Reset Inputs Visuales
        imgInput.value = '';
        if(url_img && url_img !== 'null' && url_img !== 'undefined' && url_img !== '') {
            imgPreview.src = url_img.startsWith('http') ? url_img : `http://localhost:9151${url_img.startsWith('/') ? url_img : '/' + url_img}`;
            imgPreview.style.display = 'inline-block';
        } else {
            imgPreview.style.display = 'none';
            imgPreview.src = '';
        }

        modal.style.display = 'flex';
    };

    // C) (DELETE) - Disparo Crítico con Token JWT
    window.eliminarRegistro = async (id) => {
        if(confirm(`⚠️ ALERTA INTERNA: ¿Quieres aplicar HARD DELETE al registro ID[${id}] del inventario general?\nEsta acción es irreversible y requiere privilegios de Administrador.`)) {
            try {
                const tokenHeader = localStorage.getItem('tg_token') || 'TokenSimuladoValido';
                
                const res = await fetch(`${API_URL}/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${tokenHeader}` }
                });
                
                if(res.ok) {
                    cargarTabla();
                } else {
                    const errorBackend = await res.json();
                    alert('🛑 Acción Bloqueada por Middleware: ' + errorBackend.message);
                }
            } catch (x) {
                alert('Fallo de red al solicitar eliminación a la API.');
            }
        }
    };

    // Boot Up Automático del Dashboard Grid
    cargarTabla();
}
