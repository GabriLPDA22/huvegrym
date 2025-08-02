/**
 * @file Funcionalidad específica para la sección del colectivo (Video único con alternancia)
 * @summary Manejo de un solo video que alterna entre 3 videos diferentes con velocidades variables
 */

// ====================================================================
// ===== SECCIÓN DEL COLECTIVO - FUNCIONES PRINCIPALES
// ====================================================================

/**
 * Inicializa toda la funcionalidad de la sección del colectivo
 */
function setupCollectiveSection() {
  console.log(
    "Inicializando sección del colectivo (video único alternante)..."
  );

  // Verificar que la sección existe
  const collectiveSection = document.querySelector(".collective-section");
  if (!collectiveSection) {
    console.log("Sección del colectivo no encontrada");
    return;
  }

  // Inicializar funcionalidades
  initCollectiveVideo();
  setupCollectiveScrollAnimations();
  setupVideoIntersectionObserver();
  optimizeForMobile();

  console.log("Sección del colectivo inicializada correctamente");
}

// ====================================================================
// ===== MANEJO DEL VIDEO ÚNICO CON ALTERNANCIA
// ====================================================================

/**
 * Lista de videos disponibles - por ahora solo Cibanal, pero preparado para más
 */
const VIDEO_SOURCES = [
  "/public/videos/Cibanal_trailer.mp4",
  "/public/videos/Teaser_pas_de_trois.mp4", // Mismo video por ahora
  "/public/videos/Cibanal_trailer.mp4", // Cuando tengas más videos, cambiar estas rutas
];

/**
 * Velocidades posibles para el video
 */
const PLAYBACK_SPEEDS = [0.5, 0.7, 0.8, 1.0, 1.2];

let currentVideoIndex = 0;
let speedChangeInterval;
let videoSwitchInterval;

/**
 * Inicializa y configura el video principal con alternancia
 */
function initCollectiveVideo() {
  const video = document.getElementById("collective-main-video");
  const videoBackground = document.querySelector(
    ".collective-video-background"
  );

  if (!video || !videoBackground) {
    console.log("Video principal no encontrado");
    return;
  }

  // Configurar video inicial
  setupVideoElement(video);

  // Iniciar video
  startVideo(video);

  // Configurar alternancia de velocidades (cada 8-15 segundos)
  setupSpeedVariation(video);

  // Configurar cambio de videos (cada 30-45 segundos) - para cuando tengas más videos
  // setupVideoSwitching(video, videoBackground);

  console.log("Video principal configurado correctamente");
}

/**
 * Configura las propiedades básicas del elemento video
 */
function setupVideoElement(video) {
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.volume = 0;
  video.defaultMuted = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");

  // Eventos para mantener el video sin audio
  video.addEventListener("volumechange", () => {
    if (video.volume > 0) {
      video.volume = 0;
      video.muted = true;
    }
  });

  video.addEventListener("loadeddata", () => {
    console.log("Video cargado correctamente");
  });

  video.addEventListener("error", (e) => {
    console.log("Error en video:", e);
    // Fallback: ocultar video y mostrar fondo oscuro
    video.style.opacity = "0";
    video.parentElement.style.backgroundColor = "#1a1a1a";
  });
}

/**
 * Inicia la reproducción del video
 */
function startVideo(video) {
  const playPromise = video.play();

  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        console.log("Video reproduciéndose correctamente");
        video.style.opacity = "0.2"; // Hacer visible cuando esté reproduciéndose
      })
      .catch((error) => {
        console.log("Autoplay bloqueado, esperando interacción del usuario");

        // Esperar interacción del usuario
        const startOnInteraction = () => {
          video
            .play()
            .then(() => {
              console.log("Video iniciado tras interacción del usuario");
              video.style.opacity = "0.2";
            })
            .catch(() => {
              console.log("No se pudo iniciar el video");
            });
        };

        // Escuchar varios tipos de interacción
        document.addEventListener("click", startOnInteraction, { once: true });
        document.addEventListener("touchstart", startOnInteraction, {
          once: true,
        });
        document.addEventListener("scroll", startOnInteraction, { once: true });
      });
  }
}

/**
 * Configura la variación de velocidades
 */
function setupSpeedVariation(video) {
  if (!video) return;

  // Función para cambiar la velocidad aleatoriamente
  function changeSpeed() {
    if (video.paused) return;

    // Elegir velocidad aleatoria
    const randomSpeed =
      PLAYBACK_SPEEDS[Math.floor(Math.random() * PLAYBACK_SPEEDS.length)];

    // Aplicar la nueva velocidad
    video.playbackRate = randomSpeed;

    // Cambiar clases CSS para efectos visuales
    video.classList.remove("slow-motion", "normal-speed");

    if (randomSpeed <= 0.8) {
      video.classList.add("slow-motion");
      console.log(`Video en cámara lenta: ${randomSpeed}x`);
    } else {
      video.classList.add("normal-speed");
      console.log(`Video a velocidad: ${randomSpeed}x`);
    }

    // Programar próximo cambio (entre 8 y 15 segundos)
    const nextChange = Math.random() * (15000 - 8000) + 8000;
    speedChangeInterval = setTimeout(changeSpeed, nextChange);
  }

  // Iniciar el primer cambio después de 5 segundos
  speedChangeInterval = setTimeout(changeSpeed, 5000);
}

/**
 * Configura el cambio entre diferentes videos (para cuando tengas más videos)
 */
function setupVideoSwitching(video, videoBackground) {
  function switchVideo() {
    if (video.paused) return;

    // Efecto de transición
    videoBackground.classList.add("transitioning");

    setTimeout(() => {
      // Cambiar al siguiente video
      currentVideoIndex = (currentVideoIndex + 1) % VIDEO_SOURCES.length;
      const newSource = VIDEO_SOURCES[currentVideoIndex];

      // Cambiar el src del video
      video.src = newSource;
      video.load();

      // Reproducir el nuevo video
      video
        .play()
        .then(() => {
          console.log(`Cambiado al video ${currentVideoIndex + 1}`);
          videoBackground.classList.remove("transitioning");
        })
        .catch((error) => {
          console.log("Error al cambiar video:", error);
          videoBackground.classList.remove("transitioning");
        });
    }, 1000); // Tiempo de transición

    // Programar próximo cambio (entre 30 y 45 segundos)
    const nextSwitch = Math.random() * (45000 - 30000) + 30000;
    videoSwitchInterval = setTimeout(switchVideo, nextSwitch);
  }

  // Iniciar el primer cambio después de 30 segundos
  videoSwitchInterval = setTimeout(switchVideo, 30000);
}

/**
 * Pausa todos los intervalos (útil para limpieza)
 */
function pauseVideoEffects() {
  if (speedChangeInterval) {
    clearTimeout(speedChangeInterval);
  }
  if (videoSwitchInterval) {
    clearTimeout(videoSwitchInterval);
  }
}

/**
 * Reanuda los efectos del video
 */
function resumeVideoEffects(video, videoBackground) {
  pauseVideoEffects();
  setupSpeedVariation(video);
  // setupVideoSwitching(video, videoBackground); // Descomentar cuando tengas más videos
}

// ====================================================================
// ===== MANEJO DE VISIBILIDAD E INTERSECCIÓN
// ====================================================================

/**
 * Configura el observer para gestionar la reproducción según visibilidad
 */
function setupVideoIntersectionObserver() {
  if (!("IntersectionObserver" in window)) return;

  const collectiveSection = document.querySelector(".collective-section");
  if (!collectiveSection) return;

  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target.querySelector("#collective-main-video");
        const videoBackground = entry.target.querySelector(
          ".collective-video-background"
        );

        if (!video) return;

        if (entry.isIntersecting) {
          // Sección visible - reproducir video y reanudar efectos
          if (video.paused && video.src) {
            video.muted = true;
            video.volume = 0;
            video
              .play()
              .then(() => {
                resumeVideoEffects(video, videoBackground);
              })
              .catch(() => {
                console.log("No se pudo reanudar el video");
              });
          } else if (!video.paused) {
            resumeVideoEffects(video, videoBackground);
          }
        } else {
          // Sección no visible - pausar video y efectos
          pauseVideoEffects();
          if (!video.paused) {
            video.pause();
          }
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "50px",
    }
  );

  videoObserver.observe(collectiveSection);
}

// ====================================================================
// ===== ANIMACIONES DE SCROLL ESPECÍFICAS
// ====================================================================

/**
 * Configura animaciones específicas para la sección del colectivo
 */
function setupCollectiveScrollAnimations() {
  // Solo ejecutar si GSAP está disponible
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.log("GSAP no disponible, usando animaciones CSS fallback");
    setupFallbackAnimations();
    return;
  }

  const collectiveSection = document.querySelector(".collective-section");
  if (!collectiveSection) return;

  // Animación de entrada del video de fondo
  gsap.fromTo(
    ".collective-video-background",
    {
      scale: 1.1,
      opacity: 0,
    },
    {
      scale: 1,
      opacity: 1,
      duration: 3,
      ease: "power2.out",
      scrollTrigger: {
        trigger: collectiveSection,
        start: "top 90%",
        end: "top 40%",
        toggleActions: "play none none reverse",
      },
    }
  );

  // Animación del video con zoom sutil
  gsap.fromTo(
    "#collective-main-video",
    {
      scale: 1.2,
      opacity: 0,
    },
    {
      scale: 1,
      opacity: 0.2,
      duration: 4,
      delay: 0.5,
      ease: "power3.out",
      scrollTrigger: {
        trigger: collectiveSection,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    }
  );

  // Animación del título principal
  gsap.fromTo(
    ".collective-section .section-title",
    {
      y: 60,
      opacity: 0,
      scale: 0.9,
    },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 1.8,
      ease: "back.out(1.4)",
      scrollTrigger: {
        trigger: ".collective-section .section-title",
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    }
  );

  // Animación de los párrafos de texto con efecto cascada
  gsap.fromTo(
    ".collective-intro, .collective-philosophy",
    {
      y: 50,
      opacity: 0,
      rotateX: -10,
    },
    {
      y: 0,
      opacity: 1,
      rotateX: 0,
      duration: 1.5,
      stagger: 0.4,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".collective-description",
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    }
  );

  // Efecto parallax muy sutil en el video
  gsap.to("#collective-main-video", {
    scale: 1.05,
    ease: "none",
    scrollTrigger: {
      trigger: collectiveSection,
      start: "top bottom",
      end: "bottom top",
      scrub: 2,
    },
  });

  // Animación de la línea decorativa con efecto de escritura
  ScrollTrigger.create({
    trigger: ".collective-intro",
    start: "top 75%",
    onEnter: () => {
      gsap.fromTo(
        ".collective-intro::after",
        {
          scaleX: 0,
          opacity: 0,
          transformOrigin: "left center",
        },
        {
          scaleX: 1,
          opacity: 1,
          duration: 1.2,
          ease: "power2.out",
          delay: 0.3,
        }
      );
    },
  });
}

/**
 * Animaciones CSS fallback cuando GSAP no está disponible
 */
function setupFallbackAnimations() {
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
    ".collective-section .section-title, .collective-intro, .collective-philosophy, .collective-video-background"
  );
  elementsToAnimate.forEach((el) => {
    animateOnScroll.observe(el);
  });

  // Añadir estilos CSS para las animaciones fallback
  const fallbackStyles = `
    .collective-section .section-title,
    .collective-intro,
    .collective-philosophy,
    .collective-video-background {
      opacity: 0;
      transform: translateY(30px);
      transition: all 1s cubic-bezier(0.25, 1, 0.5, 1);
    }

    .collective-video-background {
      transform: scale(1.1);
    }

    .collective-section .section-title.animate-in,
    .collective-intro.animate-in,
    .collective-philosophy.animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .collective-video-background.animate-in {
      opacity: 1;
      transform: scale(1);
    }

    .collective-intro.animate-in {
      transition-delay: 0.3s;
    }

    .collective-philosophy.animate-in {
      transition-delay: 0.6s;
    }
  `;

  const styleSheet = document.createElement("style");
  styleSheet.textContent = fallbackStyles;
  document.head.appendChild(styleSheet);
}

// ====================================================================
// ===== OPTIMIZACIONES PARA MÓVIL
// ====================================================================

/**
 * Aplica optimizaciones específicas para dispositivos móviles
 */
function optimizeForMobile() {
  const isMobile =
    window.innerWidth <= 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  if (isMobile) {
    console.log("Aplicando optimizaciones para móvil...");

    const video = document.getElementById("collective-main-video");
    if (video) {
      // Configuraciones específicas para móvil
      video.preload = "none";
      video.muted = true;
      video.volume = 0;

      // Reducir cambios de velocidad en móvil
      PLAYBACK_SPEEDS.splice(0, 2); // Eliminar velocidades muy lentas

      // Pausar inicialmente para ahorrar batería
      video.pause();

      // Solo reproducir tras interacción
      const mobileInteractionHandler = () => {
        if (video.paused && video.src) {
          video.muted = true;
          video.volume = 0;
          video
            .play()
            .then(() => {
              setupSpeedVariation(video);
            })
            .catch(() => {
              console.log("No se pudo iniciar video en móvil");
            });
        }
      };

      document.addEventListener("touchstart", mobileInteractionHandler, {
        once: true,
        passive: true,
      });
      document.addEventListener("scroll", mobileInteractionHandler, {
        once: true,
        passive: true,
      });
    }
  }
}

// ====================================================================
// ===== INICIALIZACIÓN Y LIMPIEZA
// ====================================================================

/**
 * Función principal de inicialización
 */
function initCollectiveSectionComplete() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupCollectiveSection);
  } else {
    setupCollectiveSection();
  }

  // Limpieza al salir de la página
  window.addEventListener("beforeunload", () => {
    pauseVideoEffects();
    const video = document.getElementById("collective-main-video");
    if (video) {
      video.pause();
      video.muted = true;
      video.volume = 0;
      video.src = "";
    }
  });

  // Reoptimizar en cambios de orientación/tamaño
  window.addEventListener(
    "resize",
    throttle(() => {
      optimizeForMobile();
    }, 250)
  );
}

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

// Exportar funciones si se usa como módulo
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    setupCollectiveSection,
    initCollectiveSectionComplete,
  };
}

// Inicializar automáticamente si no se usa como módulo
if (typeof module === "undefined") {
  initCollectiveSectionComplete();
}
