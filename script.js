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
