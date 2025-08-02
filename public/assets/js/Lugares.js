/**
 * @file Funcionalidad específica para la sección de lugares en 2 columnas
 * @summary Manejo de nombres en grid con imágenes de fondo dinámicas
 */

// ====================================================================
// ===== SECCIÓN DE LUGARES - FUNCIONES PRINCIPALES
// ====================================================================

/**
 * Inicializa toda la funcionalidad de la sección de lugares
 */
function setupVenuesSection() {
  console.log("Inicializando sección de lugares en 2 columnas...");

  // Verificar que la sección existe
  const venuesSection = document.querySelector(".venues-section");
  if (!venuesSection) {
    console.log("Sección de lugares no encontrada");
    return;
  }

  // Inicializar funcionalidades
  initVenueInteractions();
  setupVenuesScrollAnimations();
  setupVenueImagePreloading();
  optimizeVenuesForMobile();

  console.log("Sección de lugares inicializada correctamente");
}

// ====================================================================
// ===== MAPEO DE LUGARES Y CATEGORÍAS
// ====================================================================

/**
 * Configuración de lugares con sus categorías y metadatos
 */
const VENUE_CONFIG = {
  "auditorio-zaragoza": {
    category: "teatro",
    name: {
      es: "Auditorio de Zaragoza",
      en: "Auditorio de Zaragoza",
    },
  },
  "teatro-pavon": {
    category: "teatro",
    name: {
      es: "Teatro Pavón",
      en: "Teatro Pavón",
    },
  },
  resad: {
    category: "teatro",
    name: {
      es: "RESAD (Madrid)",
      en: "RESAD (Madrid)",
    },
  },
  ifema: {
    category: "no-convencional",
    name: {
      es: "IFEMA (Aula)",
      en: "IFEMA (Aula)",
    },
  },
  "museo-gargallo": {
    category: "no-convencional",
    name: {
      es: "Museo Pablo Gargallo",
      en: "Museo Pablo Gargallo",
    },
  },
  "museo-serrano": {
    category: "no-convencional",
    name: {
      es: "Museo Pablo Serrano",
      en: "Museo Pablo Serrano",
    },
  },
  "auditorio-xior": {
    category: "no-convencional",
    name: {
      es: "Auditorio Xior",
      en: "Auditorio Xior",
    },
  },
  villafranca: {
    category: "urbano",
    name: {
      es: "Villafranca de Ebro",
      en: "Villafranca de Ebro",
    },
  },
  villanueva: {
    category: "urbano",
    name: {
      es: "Villanueva de Gállego",
      en: "Villanueva de Gállego",
    },
  },
};

let currentActiveVenue = null;
let hoverTimeout = null;

// ====================================================================
// ===== INTERACCIONES CON LUGARES
// ====================================================================

/**
 * Configura las interacciones de hover y click para los lugares
 */
function initVenueInteractions() {
  // Configurar interacciones para desktop (grid de 2 columnas)
  setupDesktopVenueInteractions();

  // Configurar interacciones para móvil (lista simple)
  setupMobileVenueInteractions();

  // Configurar indicador de lugar activo
  setupActiveVenueIndicator();
}

/**
 * Configura interacciones para vista desktop (grid)
 */
function setupDesktopVenueInteractions() {
  const venueNames = document.querySelectorAll(
    ".venues-grid .venue-name"
  );

  venueNames.forEach((venueElement) => {
    const venueId = venueElement.getAttribute("data-venue");

    // Eventos de mouse
    venueElement.addEventListener("mouseenter", () => {
      clearTimeout(hoverTimeout);
      activateVenue(venueId);
    });

    venueElement.addEventListener("mouseleave", () => {
      hoverTimeout = setTimeout(() => {
        deactivateVenue(venueId);
      }, 300); // Pequeño delay para evitar parpadeos
    });

    // Efecto de click (para feedback táctil)
    venueElement.addEventListener("click", (e) => {
      e.preventDefault();

      // Efecto visual de click
      const ripple = document.createElement("div");
      ripple.className = "venue-click-ripple";
      ripple.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 10px;
        height: 10px;
        background: rgba(201, 169, 110, 0.6);
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        animation: venueRipple 0.6s ease-out;
        pointer-events: none;
        z-index: 100;
      `;

      venueElement.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);

      // Mantener la imagen activa por más tiempo
      activateVenue(venueId, 3000);
    });

    // Accesibilidad - navegación por teclado
    venueElement.setAttribute('tabindex', '0');
    venueElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateVenue(venueId, 3000);
      }
    });
  });
}

/**
 * Configura interacciones para vista móvil
 */
function setupMobileVenueInteractions() {
  const venueItems = document.querySelectorAll(
    ".venues-mobile-list .venue-item"
  );

  venueItems.forEach((venueElement) => {
    const venueId = venueElement.getAttribute("data-venue");

    // Eventos táctiles para móvil
    venueElement.addEventListener("click", (e) => {
      e.preventDefault();

      // Activar imagen de fondo temporalmente
      activateVenue(venueId, 2000);

      // Efecto visual
      venueElement.style.transform = "translateX(15px) scale(1.02)";
      setTimeout(() => {
        venueElement.style.transform = "";
      }, 200);
    });

    // Touch feedback optimizado
    setupMobileTouchFeedback(venueElement, venueId);
  });
}

/**
 * Configura el indicador de lugar activo
 */
function setupActiveVenueIndicator() {
  // Solo crear el indicador si estamos en desktop
  if (window.innerWidth <= 767) return;

  const indicator = document.querySelector(".active-venue-indicator");
  if (!indicator) return;

  // Configurar eventos globales para mostrar/ocultar indicador
  document.addEventListener("venue-activated", (e) => {
    const venueConfig = VENUE_CONFIG[e.detail.venueId];
    if (!venueConfig) return;

    const nameLabel = indicator.querySelector(".venue-name-label");

    // Determinar idioma actual (simplificado)
    const currentLang = document.documentElement.lang || "es";
    const lang = currentLang === "en" ? "en" : "es";

    nameLabel.textContent = venueConfig.name[lang];

    indicator.classList.add("visible");
  });

  document.addEventListener("venue-deactivated", () => {
    indicator.classList.remove("visible");
  });
}

// ====================================================================
// ===== GESTIÓN DE IMÁGENES DE FONDO
// ====================================================================

/**
 * Activa la imagen de fondo de un lugar específico
 */
function activateVenue(venueId, duration = null) {
  if (currentActiveVenue === venueId) return;

  // Desactivar lugar anterior
  if (currentActiveVenue) {
    deactivateVenue(currentActiveVenue, false);
  }

  const venueImage = document.querySelector(
    `.venue-image[data-venue="${venueId}"]`
  );
  if (!venueImage) {
    console.log(`Imagen no encontrada para: ${venueId}`);
    return;
  }

  // Activar nueva imagen
  venueImage.classList.add("active");
  currentActiveVenue = venueId;

  // Disparar evento personalizado
  document.dispatchEvent(
    new CustomEvent("venue-activated", {
      detail: { venueId },
    })
  );

  // Animación GSAP si está disponible
  if (typeof gsap !== "undefined") {
    gsap.fromTo(
      venueImage,
      {
        opacity: 0,
        scale: 1.1,
      },
      {
        opacity: 0.3,
        scale: 1.02,
        duration: 1.2,
        ease: "power2.out",
      }
    );
  }

  // Auto-desactivar después de un tiempo si se especifica
  if (duration) {
    setTimeout(() => {
      deactivateVenue(venueId);
    }, duration);
  }

  console.log(`Lugar activado: ${venueId}`);
}

/**
 * Desactiva la imagen de fondo de un lugar específico
 */
function deactivateVenue(venueId, dispatchEvent = true) {
  const venueImage = document.querySelector(
    `.venue-image[data-venue="${venueId}"]`
  );
  if (!venueImage) return;

  // Animación GSAP si está disponible
  if (typeof gsap !== "undefined") {
    gsap.to(venueImage, {
      opacity: 0,
      scale: 1,
      duration: 0.8,
      ease: "power2.in",
      onComplete: () => {
        venueImage.classList.remove("active");
      },
    });
  } else {
    venueImage.classList.remove("active");
  }

  if (currentActiveVenue === venueId) {
    currentActiveVenue = null;
  }

  // Disparar evento personalizado
  if (dispatchEvent) {
    document.dispatchEvent(
      new CustomEvent("venue-deactivated", {
        detail: { venueId },
      })
    );
  }

  console.log(`Lugar desactivado: ${venueId}`);
}

// ====================================================================
// ===== ANIMACIONES DE SCROLL ESPECÍFICAS
// ====================================================================

/**
 * Configura animaciones específicas para la sección de lugares
 */
function setupVenuesScrollAnimations() {
  // Solo ejecutar si GSAP está disponible
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.log("GSAP no disponible, usando animaciones CSS fallback");
    setupVenuesFallbackAnimations();
    return;
  }

  const venuesSection = document.querySelector(".venues-section");
  if (!venuesSection) return;

  // Animación de entrada del fondo
  gsap.fromTo(
    ".venues-background",
    {
      opacity: 0,
      scale: 1.1,
    },
    {
      opacity: 1,
      scale: 1,
      duration: 2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: venuesSection,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    }
  );

  // Animación del título principal
  gsap.fromTo(
    ".venues-section .section-title",
    {
      y: 60,
      opacity: 0,
      scale: 0.9,
    },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 1.5,
      ease: "back.out(1.3)",
      scrollTrigger: {
        trigger: ".venues-section .section-title",
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    }
  );

  // Animación de grid de 2 columnas - por columnas
  gsap.fromTo(
    ".venues-column",
    {
      y: 50,
      opacity: 0,
    },
    {
      y: 0,
      opacity: 1,
      duration: 1.2,
      stagger: 0.3,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".venues-grid",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    }
  );

  // Animación individual de elementos de lugar
  gsap.fromTo(
    ".venue-name",
    {
      y: 30,
      opacity: 0,
      scale: 0.9,
    },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.8,
      stagger: {
        amount: 1,
        from: "start",
      },
      ease: "back.out(1.1)",
      scrollTrigger: {
        trigger: ".venues-grid",
        start: "top 70%",
        toggleActions: "play none none reverse",
      },
    }
  );

  // Animación de lista móvil
  gsap.fromTo(
    ".venue-item",
    {
      x: -30,
      opacity: 0,
    },
    {
      x: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".venues-mobile-list",
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    }
  );

  // Efecto parallax muy sutil en el fondo
  gsap.to(".venues-background", {
    yPercent: -10,
    ease: "none",
    scrollTrigger: {
      trigger: venuesSection,
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    },
  });

  // Animación de partículas
  gsap.fromTo(
    ".venue-particle",
    {
      opacity: 0,
      scale: 0,
    },
    {
      opacity: 0.4,
      scale: 1,
      duration: 2,
      stagger: 0.2,
      ease: "elastic.out(1, 0.3)",
      scrollTrigger: {
        trigger: venuesSection,
        start: "top 70%",
        toggleActions: "play none none reverse",
      },
    }
  );
}

/**
 * Animaciones CSS fallback cuando GSAP no está disponible
 */
function setupVenuesFallbackAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in");
      }
    });
  }, observerOptions);

  // Observar elementos para animación
  const elementsToAnimate = document.querySelectorAll(
    ".venues-section .section-title, .venue-name, .venue-item, .venues-background"
  );
  elementsToAnimate.forEach((el) => {
    animateOnScroll.observe(el);
  });

  // Añadir estilos CSS para las animaciones fallback
  injectFallbackStyles();
}

/**
 * Inyecta estilos CSS para animaciones fallback
 */
function injectFallbackStyles() {
  const fallbackStyles = `
    .venues-section .section-title,
    .venue-name,
    .venue-item,
    .venues-background {
      opacity: 0;
      transform: translateY(30px);
      transition: all 1s cubic-bezier(0.25, 1, 0.5, 1);
    }

    .venues-background {
      transform: scale(1.1);
    }

    .venue-name {
      transform: translateY(40px) scale(0.9);
    }

    .venues-section .section-title.animate-in,
    .venue-name.animate-in,
    .venue-item.animate-in {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    .venues-background.animate-in {
      opacity: 1;
      transform: scale(1);
    }

    .venue-name.animate-in {
      transition-delay: calc(var(--animation-order, 0) * 0.1s);
    }
  `;

  const styleSheet = document.createElement("style");
  styleSheet.textContent = fallbackStyles;
  document.head.appendChild(styleSheet);

  // Asignar orden de animación
  document.querySelectorAll(".venue-name").forEach((item, index) => {
    item.style.setProperty("--animation-order", index);
  });
}

// ====================================================================
// ===== PRECARGA DE IMÁGENES
// ====================================================================

/**
 * Precarga las imágenes de lugares para mejor rendimiento
 */
function setupVenueImagePreloading() {
  const venueImages = document.querySelectorAll(".venue-image img");

  venueImages.forEach((img, index) => {
    // Retrasar la carga para no bloquear el renderizado inicial
    setTimeout(() => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }

      img.addEventListener("load", () => {
        console.log(`Imagen de lugar cargada: ${img.alt}`);
      });

      img.addEventListener("error", () => {
        console.log(`Error cargando imagen: ${img.alt}`);
        // Ocultar contenedor si la imagen falla
        img.parentElement.style.display = "none";
      });
    }, index * 200);
  });
}

// ====================================================================
// ===== OPTIMIZACIONES PARA MÓVIL
// ====================================================================

/**
 * Aplica optimizaciones específicas para dispositivos móviles
 */
function optimizeVenuesForMobile() {
  const isMobile =
    window.innerWidth <= 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  if (isMobile) {
    console.log("Aplicando optimizaciones para móvil en sección lugares...");

    // Reducir efectos de partículas
    const particles = document.querySelectorAll(".venue-particle");
    particles.forEach((particle) => {
      particle.style.display = "none";
    });

    // Simplificar transiciones
    const venueImages = document.querySelectorAll(".venue-image");
    venueImages.forEach((img) => {
      img.style.transition = "opacity 0.5s ease";
    });
  }
}

/**
 * Configura feedback táctil optimizado para móvil
 */
function setupMobileTouchFeedback(venueElement, venueId) {
  let touchStartTime;
  let touchStartY;

  venueElement.addEventListener(
    "touchstart",
    (e) => {
      touchStartTime = Date.now();
      touchStartY = e.touches[0].clientY;

      // Feedback visual inmediato
      venueElement.style.transform = "translateX(5px) scale(0.98)";
      venueElement.style.backgroundColor = "rgba(201, 169, 110, 0.15)";
    },
    { passive: true }
  );

  venueElement.addEventListener(
    "touchend",
    (e) => {
      const touchEndTime = Date.now();
      const touchDuration = touchEndTime - touchStartTime;
      const touchEndY = e.changedTouches[0].clientY;
      const touchDistance = Math.abs(touchEndY - touchStartY);

      // Restaurar estilo
      venueElement.style.transform = "";
      venueElement.style.backgroundColor = "";

      // Solo activar si fue un tap rápido y no un scroll
      if (touchDuration < 300 && touchDistance < 10) {
        activateVenue(venueId, 2000);
      }
    },
    { passive: true }
  );
}

// ====================================================================
// ===== INICIALIZACIÓN Y LIMPIEZA
// ====================================================================

/**
 * Función principal de inicialización
 */
function initVenuesSectionComplete() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupVenuesSection);
  } else {
    setupVenuesSection();
  }

  // Limpiar timeouts al cambiar de página
  window.addEventListener("beforeunload", () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
  });

  // Reoptimizar en cambios de orientación/tamaño
  window.addEventListener(
    "resize",
    throttle(() => {
      optimizeVenuesForMobile();
      setupActiveVenueIndicator();
    }, 250)
  );
}

/**
 * Función throttle para optimizar eventos
 */
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ====================================================================
// ===== ESTILOS DINÁMICOS ADICIONALES
// ====================================================================

/**
 * Inyecta estilos CSS adicionales dinámicamente
 */
function injectVenuesDynamicStyles() {
  const styles = `
    @keyframes venueRipple {
      to {
        transform: translate(-50%, -50%) scale(4);
        opacity: 0;
      }
    }

    .venue-click-ripple {
      z-index: 100;
    }

    /* Mejorar la accesibilidad */
    .venue-name:focus,
    .venue-item:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 3px;
    }

    /* Animación de entrada para nombres en grid */
    .venue-name {
      animation: venueNameFloat 6s ease-in-out infinite;
    }

    .venue-name:nth-child(odd) {
      animation-delay: -3s;
    }

    @keyframes venueNameFloat {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-3px);
      }
    }

    /* Transiciones mejoradas para el grid */
    .venues-column {
      transition: transform 0.3s ease;
    }

    .venues-grid:hover .venues-column:not(:hover) {
      transform: scale(0.98);
      opacity: 0.8;
    }
  `;

  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

// Exportar funciones si se usa como módulo
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    setupVenuesSection,
    initVenuesSectionComplete,
    activateVenue,
    deactivateVenue,
  };
}

// Hacer la función global para que script.js pueda acceder a ella
window.setupVenuesSection = setupVenuesSection;

// Inyectar estilos dinámicos
injectVenuesDynamicStyles();

// Inicializar automáticamente
initVenuesSectionComplete();
