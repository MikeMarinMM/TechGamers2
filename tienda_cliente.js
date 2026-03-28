/**
 * SCRIPT DE LÓGICA DE TIENDA (CLIENTE FINAL)
 * Maneja el UX Retail, ocultamiento JWT basado y transaccionalidad
 */

const API_URL = 'http://localhost:8080/api';

// Captura de Nodos de Identidad y Sesión
const tokenJWT = localStorage.getItem('tg_token');
const userStr = localStorage.getItem('tg_user');
const btnAuth = document.getElementById('btnAuth');
const lblIdentidad = document.getElementById('identidadCliente');

// 1. GESTOR DE IDENTIDAD NAV
if (tokenJWT && userStr) {
    try {
        const usuario = JSON.parse(userStr);
        lblIdentidad.innerText = `¡Hola, ${usuario.nombre}!`;
        
        // Mutación Contextual del Botón
        if (usuario.rol === 1) { // Privilegios DB de Administrador
            btnAuth.innerHTML = '<i class="fa-solid fa-shield"></i> Ir al Panel Admin';
            btnAuth.href = 'panel_admin.html';
        } else { // 2 = Cliente Standard
            btnAuth.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i> Salir de mi Cuenta';
            btnAuth.onclick = (e) => {
                e.preventDefault();
                localStorage.removeItem('tg_token');
                localStorage.removeItem('tg_user');
                alert('Cerraste tu sesión privada con éxito.');
                window.location.reload();
            };
        }
    } catch (e) { 
        localStorage.clear(); 
    }
}

// 2. RECUPERACIÓN ASINCRONA DEL CATÁLOGO PÚBLICO
async function renderizarTienda() {
    try {
        // Obtenemos todos los registros RAW
        const peticion = await fetch(`${API_URL}/productos`);
        const todos = await peticion.json();
        
        // REGLA DE NEGOCIO DB: Filtrar para que la tienda Frontend no muestre Agotados (Stock 0) o Suspendidos (Activo 0)
        const mercanciaDisponible = todos.filter(p => p.stock > 0 && p.activo === 1);
        
        const grid = document.getElementById('tienda-grid');
        grid.innerHTML = '';
        
        if (mercanciaDisponible.length === 0) {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center;"><i style="font-size:3rem; opacity:0.5" class="fa-solid fa-box-open"></i><p style="font-size:1.3rem; margin-top:10px;">En este momento nuestro almacén está totalmente vacío o en mantenimiento continuo.</p></div>';
            return;
        }

        // Renderizado del Componente
        mercanciaDisponible.forEach(prod => {
            const card = document.createElement('div');
            card.className = 'card product-card';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.justifyContent = 'space-between';
            card.style.background = 'var(--card-bg)';
            
            // Iconografía condicional a tipo de DB
            const ico = prod.tipo_articulo === 'SERVICIO_REPARACION' ? 'fa-screwdriver-wrench' : (prod.categoria_id === 1 ? 'fa-gamepad' : 'fa-laptop');
            
            card.innerHTML = `
                <div>
                    <div class="prod-img" style="font-size:4.5rem; color:var(--primary); background:rgba(92,60,252,0.05); padding: 2rem 0; border-radius:12px;">
                        <i class="fa-solid ${ico}"></i>
                    </div>
                    <h3 style="font-size: 1.3rem; margin-top: 15px; margin-bottom: 8px;">${prod.nombre}</h3>
                    <p style="font-size: 0.95rem; opacity: 0.7; line-height: 1.5; margin-bottom: 1.5rem; white-space: pre-wrap;">${prod.descripcion || 'Producto importado oficial para clientes de TechGamers.'}</p>
                </div>
                <div style="border-top: 1px solid var(--border-color); padding-top: 15px;">
                    <p class="price" style="font-size: 1.5rem; color:var(--text-color); font-weight:800; margin-bottom:1rem;">$${Number(prod.precio).toLocaleString('es-CO')} <span style="font-size:0.8rem;opacity:0.6;font-weight:400;">COP</span></p>
                    
                    <button class="btn btn-primary" style="width: 100%; border-radius:12px; font-size:1.05rem;" onclick="ejecutarCompra(${prod.id}, '${prod.nombre.replace(/'/g, "\\'")}')">
                        <i class="fa-solid fa-cart-shopping"></i> Comprar Ahora
                    </button>
                    <div style="text-align:center; font-size:0.85rem; margin-top:12px; font-weight:600;">
                        <i class="fa-solid fa-truck-fast" style="color:#2ecc71;"></i> Envíos Seguros Locales
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (e) {
        document.getElementById('tienda-grid').innerHTML = '<p style="color:#e74c3c; grid-column:1/-1; text-align:center; font-weight:bold;">Interrupción Fatal Backend. El Servidor MVC MySQL ha denegado la señalización de red.</p>';
    }
}

// 3. ENVÍO DE COMPRAS SEGURAMENTE HACIA MIDDLEWARE /pedidos
window.ejecutarCompra = async (id_producto, nombre_producto) => {
    // PROTECCIÓN DE COMPRA ANÓNIMA: Si no tiene el hash JWT local, al login.
    if (!tokenJWT) {
        alert('✨ ¡Hola visitante!\nNecesitas crear gratuitamente una cuenta o Iniciar Sesión para validar operaciones en TechGamers y adjuntar facturación a tu correo.');
        window.location.href = 'login.html';
        return; // Break
    }

    if (confirm(`¿Autorizar descuento y facturación final del modelo: "${nombre_producto}"?\n\nAl presionar ACETAR certificamos el cobro de la tarjeta predeterminada.`)) {
        try {
            // Mapeamos la petición contra nuestro ENDPOINT protegido que exige un bearer
            const res = await fetch(`${API_URL}/pedidos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenJWT}` // El JWT va en la cabecera, nuestro Controller confía ciegamente en él.
                },
                body: JSON.stringify({
                    producto_id: id_producto,
                    cantidad: 1 // Por simplicidad asumimos venta Unificada Express
                })
            });

            // Node responde un JSON
            const dataBackend = await res.json();
            
            if (res.ok) { // Status 201 Created
                alert(dataBackend.message + '\nSe te asignó facturación a tu historial y descontamos físicamente la unidad del almacén.');
                renderizarTienda(); // Recarga reactiva los cajones (Si compramos la ultima unidad, este método la desaparecerá frente a tus ojos sin cargar página).
            } else {
                // Status 409 Conflict o 400 Bad Request
                alert('🛑 Venta Declinada: ' + dataBackend.message);
            }
        } catch (error) {
            alert('Falla temporal en el Bridge Transaccional (API).');
        }
    }
};

// Arranque Global
renderizarTienda();
