/**
 * GUARDIA DE SEGURIDAD GLOBAL (AUTH GUARD)
 * Este archivo debe importarse en el <head> de todas las páginas HTML protegidas.
 * Se encarga de evaluar el LocalStorage y ejecutar redirecciones antes de renderizar el DOM.
 */

// 1. EXTRACTOR / DECODIFICADOR JWT
// Matemáticamente descifra el Payload Real Base64 de nuestro Servidor Node (Token Header.Payload.Signature)
window.decodificarTokenReal = (tokenString) => {
    if (!tokenString) return null;
    try {
        const base64Url = tokenString.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch(e) { return null; }
};

// 2. RECUPERACIÓN VIVA DE SESIÓN
const TOKEN_ACTUAL = localStorage.getItem('tg_token');
const DATA_USUARIO = localStorage.getItem('tg_user');
let perfilEnLinea = null;

if (TOKEN_ACTUAL) {
    // Usamos el extractor avanzado matemático por si acaso el Servidor nos lo mandó codificado.
    // También validamos usando nuestro backup de JSON stringify.
    const tryDecode = decodificarTokenReal(TOKEN_ACTUAL);
    if(tryDecode) {
        perfilEnLinea = tryDecode;
    } else if (DATA_USUARIO) {
        try { perfilEnLinea = JSON.parse(DATA_USUARIO); } catch (e) { localStorage.clear(); }
    }
}

// 3. PROTECCIÓN CIBERNÉTICA DE RUTAS Y VISTAS (MIDDLEWARE FRONTEND)
// Bloqueamos agresivamente si el archivo actual no coincide con los permisos.
const pathArchivo = window.location.pathname.toLowerCase();

if (pathArchivo.includes('panel_admin.html')) {
    // REGLA: Exclusivo Administradores
    if (!perfilEnLinea || perfilEnLinea.rol !== 1) { // 1 = Admin
        alert('🛑 Violación de Permisos: Esta ruta te ha Denegado el Acceso por falta de Jerarquía.');
        window.location.replace('index.html');
    }
} 
else if (pathArchivo.includes('productos.html') || pathArchivo.includes('tienda_cliente.html')) {
    // REGLA: Exclusivo Usuarios Autenticados (Clientes que quieren ver Historial / Catálogo)
    if (!perfilEnLinea) {
        alert('✨ Área restinguida.\nPor favor autentícate antes de ingresar al catálogo detallado o tu historial.');
        window.location.replace('index.html'); // Expulsión de no registrados
    }
}

// 4. INYECCIÓN DINÁMICA DE BOTONES (NAVBAR AUTÓNOMO)
// Tan pronto cargue el HTML, adaptamos cualquier menú superior.
document.addEventListener('DOMContentLoaded', () => {
    const authNavContainer = document.getElementById('authNavContainer');
    
    if (perfilEnLinea && authNavContainer) {
        const nombreCorto = perfilEnLinea.nombre ? perfilEnLinea.nombre.split(' ')[0] : 'Usuario';
        
        if (perfilEnLinea.rol === 1) {
            // Interfaz de Administrador
            authNavContainer.innerHTML = `
                <div style="display:flex; align-items:center; gap:15px;">
                    <a href="panel_admin.html" class="btn btn-outline" style="border-radius:20px; font-size:0.85rem; border-color:var(--primary); color:var(--primary);">
                        <i class="fa-solid fa-shield"></i> Tablero Maestro
                    </a>
                    <button class="btn btn-primary" onclick="cerrarSesionGlobal()" style="border-radius:20px; padding:6px 15px; font-size:0.85rem;">
                        <i class="fa-solid fa-power-off"></i> Abandonar Sesión
                    </button>
                </div>
            `;
        } else {
            // Interfaz de Cliente
            authNavContainer.innerHTML = `
                <div style="display:flex; align-items:center; gap:15px;">
                    <span style="font-weight:600; opacity:0.9; color:var(--accent);">
                        <i class="fa-solid fa-circle-user"></i> Hola, ${nombreCorto}
                    </span>
                    <button class="btn btn-outline" onclick="cerrarSesionGlobal()" style="border-radius:20px; padding:6px 15px; font-size:0.85rem; border-color:#e74c3c; color:#e74c3c;">
                        <i class="fa-solid fa-right-from-bracket"></i> Desconectar
                    </button>
                </div>
            `;
        }
    }
});

// 5. FUNCIÓN CENTRAL DE DESCONEXIÓN
window.cerrarSesionGlobal = () => {
    localStorage.removeItem('tg_token');
    localStorage.removeItem('tg_user');
    window.location.replace('index.html'); // Lo arrojamos a la portada pública purgada.
};
