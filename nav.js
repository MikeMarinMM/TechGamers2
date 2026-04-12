/**
 * MÓDULO GLOBAL DE NAVEGACIÓN - TECH GAMERS
 * Inyecta un Botón Flotante con estética Gamer Neón para retornar al Inicio.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Remover condicional temporalmente: Mostrar en todas las páginas según lo pedido
    const d = document.createElement('div');
        d.innerHTML = `
            <button id="tg-floating-nav" onclick="window.location.href='index.html'"
                    style="position: fixed; bottom: 30px; left: 30px; z-index: 1000;
                           background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
                           color: #0d1117; padding: 12px 25px; border-radius: 30px; font-weight: 800; font-size: 1rem;
                           border: 2px solid rgba(255,255,255,0.4); box-shadow: 0 0 15px rgba(0,242,254,0.5);
                           cursor: pointer; display: flex; align-items: center; gap: 10px;
                           font-family: 'Outfit', sans-serif; transition: all 0.3s ease;">
                <i class="fa-solid fa-arrow-left"></i> REGRESAR AL INICIO
            </button>
        `;
        document.body.appendChild(d.firstElementChild);
        
        // Animaciones Micro-Interactivas Hover "Gamer"
        const btn = document.getElementById('tg-floating-nav');
        btn.addEventListener('mouseover', () => {
            btn.style.transform = 'translateY(-5px) scale(1.05)';
            btn.style.boxShadow = '0 10px 25px rgba(0,242,254,0.8)';
            btn.style.letterSpacing = '1px';
        });
        btn.addEventListener('mouseout', () => {
            btn.style.transform = 'translateY(0) scale(1)';
            btn.style.boxShadow = '0 0 15px rgba(0,242,254,0.5)';
            btn.style.letterSpacing = 'normal';
        });
    // Efecto de sonido omitido, termina el append
});
