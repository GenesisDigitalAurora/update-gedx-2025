// SLIDER MAIN BANNER
function initMainBannerSlider() {
    const slides = document.querySelectorAll('.main-banner-slider .slide');
    const dots = document.querySelectorAll('.main-banner-slider .dot');
    const prevBtn = document.querySelector('.main-banner-slider .slider-prev');
    const nextBtn = document.querySelector('.main-banner-slider .slider-next');
    let current = 0;
    let timer = null;
    const interval = 15000; // 10 segundos

    function showSlide(idx) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === idx);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === idx);
        });
        current = idx;
        
        // Inicializar efecto parallax en el slide activo
        initParallaxEffect();
    }

    function nextSlide() {
        let next = (current + 1) % slides.length;
        showSlide(next);
        resetTimer();
    }

    function goToSlide(idx) {
        showSlide(idx);
        resetTimer();
    }

    function resetTimer() {
        if (timer) clearInterval(timer);
        timer = setInterval(nextSlide, interval);
    }

    // Eventos
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => goToSlide(i));
    });

    // Iniciar
    showSlide(0);
    timer = setInterval(nextSlide, interval);
}

document.addEventListener('DOMContentLoaded', () => {
    // ...código existente...
    initMainBannerSlider();
});

// Función para crear rombos dinámicos
function createDiamonds() {
    // Verificar si es dispositivo móvil
    if (window.innerWidth <= 768) {
        return;
    }

    const background = document.getElementById('techBackground');
    const numberOfLargeDiamonds = 6; // Reducido de 8
    const numberOfSmallDiamonds = 10; // Reducido de 15

    // Crear un nuevo contenedor para los rombos
    const newContainer = document.createElement('div');
    newContainer.className = 'diamonds-container';
    newContainer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;opacity:0;transition:opacity 2s ease-in-out';

    // Función para crear un rombo con parámetros específicos
    function createDiamond(size, isLarge) {
        const diamond = document.createElement('div');
        diamond.className = `diamond ${isLarge ? 'diamond-large' : 'diamond-small'}`;

        // Posición aleatoria con preferencia a los costados para los grandes
        let posX;
        if (isLarge) {
            if (Math.random() < 0.7) {
                posX = Math.random() < 0.5 ? Math.random() * 15 : 85 + Math.random() * 15;
            } else {
                posX = 30 + Math.random() * 40;
            }
        } else {
            posX = Math.random() * 100;
        }
        const posY = Math.random() * 100;

        // Retraso aleatorio para la animación
        const delay = isLarge ? Math.random() * 10 : Math.random() * 8;

        // Aplicar estilos usando cssText para mejor rendimiento
        diamond.style.cssText = `
            left: ${posX}%;
            top: ${posY}%;
            width: ${size}px;
            height: ${size}px;
            animation-delay: ${delay}s;
        `;

        newContainer.appendChild(diamond);
    }

    // Crear rombos grandes
    for (let i = 0; i < numberOfLargeDiamonds; i++) {
        const size = Math.random() * 200 + 150; // 150px a 350px (antes 200-500px)
        createDiamond(size, true);
    }

    // Crear rombos pequeños
    for (let i = 0; i < numberOfSmallDiamonds; i++) {
        const size = Math.random() * 30 + 15; // 15px a 45px (antes 20-70px)
        createDiamond(size, false);
    }

    // Agregar el nuevo contenedor al fondo
    background.appendChild(newContainer);

    // Fade in del nuevo contenedor
    requestAnimationFrame(() => {
        newContainer.style.opacity = '1';
    });

    // Limpiar contenedores antiguos
    const oldContainers = background.querySelectorAll('.diamonds-container');
    if (oldContainers.length > 1) {
        oldContainers[0].style.opacity = '0';
        setTimeout(() => oldContainers[0].remove(), 2000);
    }
}

// Crear rombos iniciales solo si no es móvil
if (window.innerWidth > 768) {
    createDiamonds();
}

// Optimizar el evento resize usando debounce
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (window.innerWidth > 768) {
            createDiamonds();
        }
    }, 250);
});

// Recrear rombos cada 15 segundos solo si no es móvil
if (window.innerWidth > 768) {
    setInterval(createDiamonds, 15000);
}

// Función para el efecto parallax
function initParallaxEffect() {
    // Verificar si es dispositivo móvil
    if (window.innerWidth <= 768) {
        return;
    }

    const slides = document.querySelectorAll('.slide.active');
    
    slides.forEach(slide => {
        const elements = {
            background: slide.querySelector('.slide-background'),
            title: slide.querySelector('.parallax-title'),
            cta: slide.querySelector('.slide-ctas'),
            image: slide.querySelector('.slide-col-img img'),
            buttons: slide.querySelectorAll('.slide-ctas .btn')
        };

        // Valores de movimiento para cada elemento con diferentes direcciones y velocidades
        const movementValues = {
            background: { x: 15, y: 10 },    // Movimiento suave y sutil
            title: { x: -35, y: -25 },       // Movimiento opuesto y más rápido
            cta: { x: -20, y: 30 },          // Movimiento opuesto en X y más rápido en Y
            image: { x: 40, y: -20 },        // Movimiento más rápido en X y opuesto en Y
            buttons: { x: -15, y: -15 }      // Movimiento opuesto y más suave
        };

        // Función para manejar el movimiento del mouse
        function handleMouseMove(e) {
            const rect = slide.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            // Aplicar transformación a cada elemento
            Object.keys(elements).forEach(key => {
                if (elements[key]) {
                    if (key === 'buttons') {
                        // Manejar los botones individualmente
                        elements[key].forEach(button => {
                            const moveX = x * movementValues[key].x;
                            const moveY = y * movementValues[key].y;
                            button.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
                        });
                    } else {
                        const moveX = x * movementValues[key].x;
                        const moveY = y * movementValues[key].y;
                        elements[key].style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
                    }
                }
            });
        }

        // Función para resetear la posición
        function resetPosition() {
            Object.keys(elements).forEach(key => {
                if (elements[key]) {
                    if (key === 'buttons') {
                        elements[key].forEach(button => {
                            button.style.transform = 'translate3d(0, 0, 0)';
                        });
                    } else {
                        elements[key].style.transform = 'translate3d(0, 0, 0)';
                    }
                }
            });
        }

        // Agregar event listeners solo si no es móvil
        if (window.innerWidth > 768) {
            slide.addEventListener('mousemove', handleMouseMove);
            slide.addEventListener('mouseleave', resetPosition);
        }
    });
}

// Agregar event listener para resize
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
        // Remover event listeners de parallax en móvil
        const slides = document.querySelectorAll('.slide');
        slides.forEach(slide => {
            slide.removeEventListener('mousemove', handleMouseMove);
            slide.removeEventListener('mouseleave', resetPosition);
        });
    } else {
        // Reinicializar parallax en desktop
        initParallaxEffect();
    }
});

// Control del menú de seguimiento
const scrollNav = document.querySelector('.scroll-nav');
const scrollNavItems = document.querySelectorAll('.scroll-nav__item');
let lastScrollTop = 0;
const headerHeight = document.querySelector('.header').offsetHeight;

// Función para mostrar/ocultar el menú de seguimiento
function toggleScrollNav() {
    // Verificar si es dispositivo móvil
    if (window.innerWidth <= 768) {
        scrollNav.classList.remove('visible');
        return;
    }

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Mostrar el menú cuando el header está fuera de vista
    if (scrollTop > headerHeight) {
        scrollNav.classList.add('visible');
    } else {
        scrollNav.classList.remove('visible');
    }
    
    // Actualizar el ítem activo
    updateActiveNavItem();
    
    lastScrollTop = scrollTop;
}

// Función para actualizar el ítem activo
function updateActiveNavItem() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.pageYOffset + headerHeight + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            scrollNavItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('data-section') === sectionId) {
                    item.classList.add('active');
                }
            });
        }
    });
}

// Event listeners
window.addEventListener('scroll', toggleScrollNav);
window.addEventListener('load', toggleScrollNav);
window.addEventListener('resize', () => {
    // Verificar si es dispositivo móvil
    if (window.innerWidth <= 768) {
        scrollNav.classList.remove('visible');
    } else {
        toggleScrollNav();
    }
});

// Smooth scroll para los enlaces del menú de seguimiento
scrollNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = item.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        const targetPosition = targetSection.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    });
});

// Sanitización del formulario de contacto
function sanitizeForm() {
    const form = document.getElementById('contacto');
    
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Obtener los valores del formulario
        const nombre = form.querySelector('input[name="nombre"]').value.trim();
        const telefono = form.querySelector('input[name="telefono"]').value.trim();
        const email = form.querySelector('input[name="email"]').value.trim();
        const mensaje = form.querySelector('textarea[name="mensaje"]').value.trim();
        
        // Sanitización básica
        const sanitizeText = (text) => {
            return text
                .replace(/[<>]/g, '') // Remover < y >
                .replace(/javascript:/gi, '') // Remover javascript:
                .replace(/on\w+=/gi, '') // Remover event handlers
                .substring(0, 1000); // Limitar longitud
        };
        
        const sanitizeEmail = (email) => {
            return email
                .replace(/[<>]/g, '')
                .replace(/javascript:/gi, '')
                .toLowerCase()
                .trim();
        };
        
        // Aplicar sanitización
        const cleanNombre = sanitizeText(nombre);
        const cleanTelefono = sanitizeText(telefono);
        const cleanEmail = sanitizeEmail(email);
        const cleanMensaje = sanitizeText(mensaje);
        
        // Validación básica
        if (!cleanNombre || !cleanTelefono || !cleanEmail || !cleanMensaje) {
            alert('Por favor completa todos los campos');
            return;
        }
        
        if (cleanNombre.length < 2) {
            alert('El nombre debe tener al menos 2 caracteres');
            return;
        }
        
        if (cleanTelefono.length < 8) {
            alert('El teléfono debe tener al menos 8 dígitos');
            return;
        }
        
        if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
            alert('Por favor ingresa un email válido');
            return;
        }
        
        // Mostrar spinner y ocultar formulario
        showSpinner();
        
        try {
            // Datos a enviar
            const formData = {
                nombre: cleanNombre,
                telefono: cleanTelefono,
                email: cleanEmail,
                mensaje: cleanMensaje
            };
            
            // Enviar datos por POST
            const response = await fetch('https://tu-servicio-api.com/contacto', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            // Ocultar spinner
            hideSpinner();
            
            if (response.ok) {
                // Mostrar mensaje de éxito
                showSuccessMessage();
            } else {
                // Mostrar mensaje de error
                showErrorMessage();
            }
            
        } catch (error) {
            console.error('Error al enviar formulario:', error);
            hideSpinner();
            showErrorMessage();
        }
    });
}

// Función para mostrar spinner
function showSpinner() {
    const form = document.getElementById('contacto');
    const formContainer = form.parentElement;
    
    // Crear spinner
    const spinnerHTML = `
        <div class="form-spinner" style="text-align: center; padding: 2rem;">
            <div class="spinner" style="
                width: 50px;
                height: 50px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid var(--color-primary);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            "></div>
            <p style="color: var(--color-primary); font-size: 1.2rem; margin: 0;">Enviando...</p>
        </div>
    `;
    
    // Ocultar formulario y mostrar spinner
    form.style.display = 'none';
    formContainer.insertAdjacentHTML('beforeend', spinnerHTML);
    
    // Agregar estilos de animación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// Función para ocultar spinner
function hideSpinner() {
    const spinner = document.querySelector('.form-spinner');
    if (spinner) {
        spinner.remove();
    }
}

// Función para mostrar mensaje de éxito
function showSuccessMessage() {
    const form = document.getElementById('contacto');
    const formContainer = form.parentElement;
    
    const successHTML = `
        <div class="form-success" style="
            text-align: center;
            padding: 2rem;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            border-radius: 10px;
            margin-top: 1rem;
        ">
            <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <h3 style="margin: 0 0 1rem 0; font-size: 1.5rem;">¡Gracias por contactarnos!</h3>
            <p style="margin: 0; font-size: 1.1rem; line-height: 1.5;">
                Hemos recibido tu mensaje correctamente. Un ejecutivo se pondrá en contacto contigo inmediatamente.
            </p>
        </div>
    `;
    
    formContainer.insertAdjacentHTML('beforeend', successHTML);
}

// Función para mostrar mensaje de error
function showErrorMessage() {
    const form = document.getElementById('contacto');
    const formContainer = form.parentElement;
    
    const errorHTML = `
        <div class="form-error" style="
            text-align: center;
            padding: 2rem;
            background: linear-gradient(135deg, #f44336, #d32f2f);
            color: white;
            border-radius: 10px;
            margin-top: 1rem;
        ">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <h3 style="margin: 0 0 1rem 0; font-size: 1.5rem;">Error al enviar</h3>
            <p style="margin: 0; font-size: 1.1rem; line-height: 1.5;">
                Hubo un problema al enviar tu mensaje. Por favor, intenta nuevamente o contáctanos directamente.
            </p>
            <button onclick="location.reload()" style="
                margin-top: 1rem;
                padding: 0.5rem 1rem;
                background: white;
                color: #f44336;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
            ">Intentar nuevamente</button>
        </div>
    `;
    
    formContainer.insertAdjacentHTML('beforeend', errorHTML);
}

// Inicializar sanitización del formulario
document.addEventListener('DOMContentLoaded', () => {
    sanitizeForm();
});

