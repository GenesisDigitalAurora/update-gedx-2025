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

// Crear rombos iniciales
createDiamonds();

// Optimizar el evento resize usando debounce
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(createDiamonds, 250);
});

// Recrear rombos cada 15 segundos
setInterval(createDiamonds, 15000);

// Función para el efecto parallax
function initParallaxEffect() {
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

        // Agregar event listeners
        slide.addEventListener('mousemove', handleMouseMove);
        slide.addEventListener('mouseleave', resetPosition);
    });
}
