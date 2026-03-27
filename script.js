// script.js

// Lógica de Theme/Modo Oscuro o Claro
const themeToggle = document.getElementById('theme-toggle');
const rootElement = document.documentElement;

function setTheme(theme) {
    rootElement.setAttribute('data-theme', theme);
    localStorage.setItem('techgamers-theme', theme);
}

// Cargar preferencia del guardado o default a dark (recomendado para gamers)
const savedTheme = localStorage.getItem('techgamers-theme');
if (savedTheme) {
    setTheme(savedTheme);
} else {
    setTheme('dark');
}

// Botón de Toggle
themeToggle.addEventListener('click', () => {
    const currentTheme = rootElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
});

// Botón "Volver al Inicio"
const btnBackToTop = document.getElementById('btn-back-to-top');

btnBackToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Función para generar y abrir enlace de WhatsApp
// Reemplazar este número con el real de la clínica de consolas (En Medellín, +57)
const BUSINESS_WHATSAPP_NUMBER = "573000000000"; 

function openWhatsApp(message) {
    // Codifica el mensaje para que funcione en URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Abre en nueva pestaña o ventana
    window.open(whatsappUrl, '_blank');
}

// ================================================================
// CATÁLOGO DINÁMICO PÚBLICO (GUEST MODE) Y PERSISTENCIA DE COMPRAS
// ================================================================
let productosGlobal = [];

async function inicializarCatalogoIndex() {
    const contenedor = document.getElementById('dynamic-catalog');
    if (!contenedor) return; 

    try {
        const res = await fetch('http://localhost:3000/api/productos');
        productosGlobal = await res.json();
        renderizarCatalogoHTML(productosGlobal);
    } catch {
        contenedor.innerHTML = '<p style="color:#e74c3c; text-align:center; grid-column:1/-1; font-weight:bold;">Error conectando al Servidor TechGamers.</p>';
    }
}

function renderizarCatalogoHTML(productos) {
    const contenedor = document.getElementById('dynamic-catalog');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    
    if (productos.length === 0) {
        contenedor.innerHTML = '<p style="text-align:center; grid-column:1/-1; font-size:1.1rem; opacity:0.7;">No se encontraron artículos en esta categoría.</p>';
        return;
    }

    productos.forEach(prod => {
        // Validación Lógica de E-commerce: Grayscale/Disabled para agotados
        const agotado = prod.stock === 0 || prod.activo === 0;
        const filtroVisual = agotado ? 'grayscale(100%)' : 'none';
        
        // Lazy Loading imagen genérica o Lectura Dirigida desde MySQL Backend (Node.js/uploads)
        const placeholder = 'https://img.freepik.com/vector-gratis/ilustracion-icono-vectorial-dibujos-animados-controlador-juego-lentes-vr-concepto-icono-tecnologia-juego-plano_138676-4394.jpg?w=300&loading=lazy';
        const urlImagen = (prod.url_imagen && prod.url_imagen !== 'null' && prod.url_imagen !== '') ? `http://localhost:3000${prod.url_imagen}` : placeholder;

        const card = document.createElement('div');
        card.className = 'card product-card';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.justifyContent = 'space-between';
        card.style.filter = filtroVisual;
        card.style.opacity = agotado ? '0.6' : '1';
        card.style.background = 'var(--card-bg)';
        card.style.transition = '0.3s';

        card.innerHTML = `
            <div>
                <img src="${urlImagen}" alt="Imágen de ${prod.nombre}" loading="lazy" style="width:100%; object-fit:cover; height:200px; margin-bottom:15px; border-radius:12px 12px 0 0; border-bottom:3px solid var(--primary);">
                <h3 style="font-size: 1.25rem; margin-bottom: 8px;">${prod.nombre}</h3>
                <p style="font-size: 0.9rem; opacity:0.8; margin-bottom:1rem; line-height:1.5;">${prod.descripcion || 'Producto Oficial de TechGamers.'}</p>
            </div>
            <div style="border-top: 1px solid var(--border-color); padding-top: 15px;">
                ${agotado ? 
                    `<div style="text-align:center; background:rgba(231,76,60,0.1); color:#e74c3c; font-weight:bold; padding:10px; border-radius:10px; border:1px solid #e74c3c;"><i class="fa-solid fa-ban"></i> AGOTADO</div>` 
                    : 
                    `<p class="price" style="font-size:1.4rem; color:var(--accent); margin-bottom:12px; font-weight:800; text-shadow:0 0 10px rgba(0,210,255,0.3);">$${Number(prod.precio).toLocaleString('es-CO')} <span style="font-size:0.7rem; opacity:0.6; font-weight:400; text-shadow:none;">COP</span></p>
                    <button class="btn btn-primary" style="width:100%; border-radius:12px;" onclick="intentarCompra(${prod.id}, '${prod.nombre.replace(/'/g, "\\'")}', ${prod.precio})">
                        <i class="fa-solid fa-cart-shopping"></i> Adquirir Ahora
                    </button>`
                }
            </div>
        `;
        contenedor.appendChild(card);
    });
}

window.filtrarCatalogo = (catId) => {
    document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent'; b.style.color = 'var(--text-color)';
    });
    
    event.target.classList.add('active');
    event.target.style.background = 'var(--primary)';
    event.target.style.color = 'white';

    if (catId === 'all') {
        renderizarCatalogoHTML(productosGlobal);
    } else {
        const filtrados = productosGlobal.filter(p => p.categoria_id === Number(catId));
        renderizarCatalogoHTML(filtrados);
    }
}

window.intentarCompra = async (prodId, prodNombre, prodPrecio) => {
    const token = localStorage.getItem('tg_token');
    
    // Si NO hay sesión
    if (!token) {
        // Persistencia de Intención Cautivadora
        localStorage.setItem('tg_intento_compra_id', prodId);
        localStorage.setItem('tg_intento_compra_nombre', prodNombre);
        
        // Disparar Modal con Marketing Persuasivo
        const btnLogin = document.getElementById('btnOpenAuthModal');
        if (btnLogin) btnLogin.click();
        
        const errorMsg = document.getElementById('authErrorMsg');
        if(errorMsg) {
            errorMsg.innerHTML = '<i class="fa-solid fa-gift"></i> <b>¡Inicia sesión para armar tu setup gamer!</b><br><small>Solo necesitas tu cuenta para asegurar ese ' + prodNombre + ' con nosotros.</small>';
            errorMsg.style.display = 'block';
            errorMsg.style.background = 'rgba(0, 210, 255, 0.15)';
            errorMsg.style.color = 'var(--accent)';
            errorMsg.style.border = '1px solid var(--accent)';
            
            // Auto seleccionar pestaña de log/reg dependiendo si es más probable que sean nuevos
            switchAuthTab('register'); 
        }
        return;
    }

    // SI HAY SESIÓN ACTIVA: DISPARA COMPRA HACIA EL BACKEND EXPRESS
    if (confirm(`¿Autorizar descuento por valor de $${Number(prodPrecio).toLocaleString()} COP para pre-ordenar:\n"${prodNombre}"?`)) {
        try {
            const res = await fetch('http://localhost:3000/api/pedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ producto_id: prodId, cantidad: 1 })
            });
            const data = await res.json();
            
            if (res.ok) {
                alert('🛒 ' + data.message);
                inicializarCatalogoIndex(); // Refrescar Grid vivo
            } else { alert('⛔ Venta denegada por Backend: ' + data.message); }
        } catch (e) { alert('Falla cruzando transacción con API de pagos ficticia.'); }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarCatalogoIndex();
});

// ================================================================
// GESTOR DE MODAL DE AUTENTICACIÓN (LOGIN/REGISTER LOGIC)
// ================================================================
const SERVER_API = 'http://localhost:3000/api/auth';
const authModal = document.getElementById('authModal');
const btnOpenAuth = document.getElementById('btnOpenAuthModal');
const btnCloseAuth = document.getElementById('closeAuthModal');
const authErrorMsg = document.getElementById('authErrorMsg'); // Utilizado solo para mensajes tipo 'inicia sesión para comprar'

// ----------------------------------------------------
// EVENTOS APERTURA MODAL (PARA INVITADOS)
// ----------------------------------------------------
if(btnOpenAuth) {
    btnOpenAuth.addEventListener('click', () => {
        if(authErrorMsg) authErrorMsg.style.display = 'none';
        authModal.style.display = 'flex';
    });
}

// ----------------------------------------------------
// MANEJO DE VENTANAS Y PESTAÑAS DEL MODAL
// ----------------------------------------------------
if(btnCloseAuth) {
    btnCloseAuth.onclick = () => authModal.style.display = 'none';
    window.addEventListener('click', (e) => { 
        if(e.target === authModal) authModal.style.display = 'none'; 
    });
}

window.switchAuthTab = (tabName) => {
    if(!authErrorMsg) return;
    authErrorMsg.style.display = 'none';
    const formL = document.getElementById('globalLoginForm');
    const formR = document.getElementById('globalRegisterForm');
    const btnL = document.getElementById('tabLoginBtn');
    const btnR = document.getElementById('tabRegisterBtn');

    if(tabName === 'login') {
        formL.classList.add('active'); formR.classList.remove('active');
        btnL.classList.add('active'); btnR.classList.remove('active');
    } else {
        formR.classList.add('active'); formL.classList.remove('active');
        btnR.classList.add('active'); btnL.classList.remove('active');
    }
};

window.hacerLogoutGlobal = () => {
    localStorage.removeItem('tg_token');
    localStorage.removeItem('tg_user');
    window.location.reload();
};

// ----------------------------------------------------
// POST: INICIO DE SESIÓN
// ----------------------------------------------------
const loginFormGlobal = document.getElementById('globalLoginForm');
if(loginFormGlobal) {
    loginFormGlobal.onsubmit = async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const oldText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Procesando...';
        authErrorMsg.style.display = 'none';

        try {
            const res = await fetch(`${SERVER_API}/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    correo: document.getElementById('login_email').value,
                    password: document.getElementById('login_pass').value
                })
            });
            const data = await res.json();

            if (res.ok) {
                // Inyectar JWT Secure
                localStorage.setItem('tg_token', data.token);
                localStorage.setItem('tg_user', JSON.stringify(data.user));
                
                // === LÓGICA DE INTENT PERSISTENTE ===
                const compraId = localStorage.getItem('tg_intento_compra_id');
                const compraNom = localStorage.getItem('tg_intento_compra_nombre');
                
                if (compraId) { 
                    localStorage.removeItem('tg_intento_compra_id');
                    localStorage.removeItem('tg_intento_compra_nombre');
                    
                    Swal.fire({ toast:true, position:'top-end', icon:'info', title:'Procesando tu pedido...', showConfirmButton:false, timer:1500, background: '#12141d', color: '#fff' });
                    
                    if(data.user.rol === 2) {
                        try {
                            const compraRes = await fetch('http://localhost:3000/api/pedidos', {
                                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${data.token}` },
                                body: JSON.stringify({ producto_id: Number(compraId), cantidad: 1 })
                            });
                            const dataCompra = await compraRes.json();
                            
                            if (compraRes.ok) {
                                Swal.fire({icon: 'success', title: '¡Compra Automática Exitosa!', text: `Item asegurado: ${compraNom}`, confirmButtonColor: '#2ecc71', background: '#12141d', color: '#fff'}).then(() => window.location.reload());
                            } else {
                                Swal.fire({icon: 'error', title: 'Oh no, se acaba de agotar', text: dataCompra.message, confirmButtonColor: '#e74c3c', background: '#12141d', color: '#fff'}).then(() => window.location.reload());
                            }
                        } catch { window.location.reload(); }
                    } else {
                        // Administrador
                        Swal.fire({icon: 'info', title: 'Bienvenido Jefe', text: `Se purgó una orden de testing de ${compraNom}.`, confirmButtonColor: 'var(--primary)', background: '#12141d', color: '#fff'}).then(() => window.location.replace('panel_admin.html'));
                    }
                } else {
                    // Flujo Normal sin intención previa
                    Swal.fire({
                        toast: true, position: 'top-end', icon: 'success',
                        title: `Identidad Avalada, ${data.user.nombre.split(' ')[0]}`,
                        showConfirmButton: false, timer: 1500, timerProgressBar: true, background: '#12141d', color: '#fff'
                    }).then(() => {
                        window.location.replace(data.user.rol === 1 ? 'panel_admin.html' : 'productos.html');
                    });
                }
            } else {
                Swal.fire({ icon: 'error', title: 'Acceso Denegado', text: data.message, confirmButtonColor: '#e74c3c', background: '#12141d', color: '#fff' });
                btn.innerHTML = oldText;
            }
        } catch {
            Swal.fire({ icon: 'error', title: 'Fallo de Red', text: 'El servidor principal de la API Node no responde.', confirmButtonColor: '#e74c3c', background: '#12141d', color: '#fff' });
            btn.innerHTML = oldText;
        }
    };
}

// ----------------------------------------------------
// POST: CREACIÓN DE CUENTA NUEVA (HASHING)
// ----------------------------------------------------
const regFormGlobal = document.getElementById('globalRegisterForm');
if(regFormGlobal) {
    regFormGlobal.onsubmit = async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const oldText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Asegurando DB...';
        authErrorMsg.style.display = 'none';

        try {
            const res = await fetch(`${SERVER_API}/register`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    nombre: document.getElementById('reg_nombre').value,
                    correo: document.getElementById('reg_email').value,
                    password: document.getElementById('reg_pass').value,
                    rol_id: Number(document.getElementById('reg_rol').value) // Captura rol Académico
                })
            });
            const data = await res.json();

            if (res.ok) {
                Swal.fire({ icon: 'success', title: '¡Cuenta Creada!', text: data.message, confirmButtonColor: '#2ecc71', background: '#12141d', color: '#fff' });
                document.getElementById('globalRegisterForm').reset();
                switchAuthTab('login');
                document.getElementById('login_email').value = document.getElementById('reg_email').value; // auto-completar
            } else {
                Swal.fire({ icon: 'warning', title: 'Aviso', text: data.message, confirmButtonColor: 'var(--primary)', background: '#12141d', color: '#fff' });
            }
        } catch {
            Swal.fire({ icon: 'error', title: 'Servidor Caído', text: 'Error interno al enviar datos a MySQL a través de Express.', confirmButtonColor: '#e74c3c', background: '#12141d', color: '#fff' });
        } finally {
            btn.innerHTML = oldText;
        }
    };
}

// ================================================================
// MENÚ HAMBURGUESA MÓVIL (RESPONSIVE)
// ================================================================
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mainNav = document.getElementById('main-nav');

if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        
        // Alternar icono fa-bars por fa-xmark (cruz)
        if (mainNav.classList.contains('active')) {
            icon.classList.replace('fa-bars', 'fa-xmark');
        } else {
            icon.classList.replace('fa-xmark', 'fa-bars');
        }
    });

    // Cerrar menú si tocan un enlace en móvil
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 900) {
                mainNav.classList.remove('active');
                mobileMenuBtn.querySelector('i').classList.replace('fa-xmark', 'fa-bars');
            }
        });
    });
}
