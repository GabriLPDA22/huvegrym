/**
 * @file Script final con tarjetas expandibles inline (sin modal)
 * @summary Solución elegante que expande las tarjetas en su lugar
 */

// ====================================================================
// ===== IMPORTACIONES Y CONSTANTES GLOBALES
// ====================================================================
import { logoData } from "./logo.js";

// ====================================================================
// ===== PUNTO DE ENTRADA PRINCIPAL
// ====================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Detectar en qué página estamos
  const isHomePage = document.querySelector(".hero") !== null;
  const isPortfolioPage = document.body.classList.contains("portfolio-page");

  console.log(
    `Página detectada: ${
      isHomePage ? "Home" : isPortfolioPage ? "Portfolio" : "Otra"
    }`
  );

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    initializeApp(isHomePage, isPortfolioPage);
  } else {
    console.error("GSAP o ScrollTrigger no se han cargado.");
    initializeBasicApp(isHomePage);
  }
});

// ====================================================================
// ===== FUNCIONES DE INICIALIZACIÓN
// ====================================================================

function initializeApp(isHomePage, isPortfolioPage) {
  // Funciones comunes para todas las páginas
  setupCustomCursor();
  setupProgressBar();
  setupAdditionalEffects();
  injectDynamicStyles();

  // Funciones específicas de la home
  if (isHomePage) {
    setupHero();
    setupScrollAnimations();
    setupSpectacularArtists();
    setupPiecesCarousel();
    enhanceCarouselEffects();
    setupHorizontalWheelScroll();
    setupExpandablePieces();
    preloadCriticalImages();
    setupVenuesSection();

    // ARREGLO: Verificar si la función existe antes de llamarla
    if (typeof setupCollectiveSection === "function") {
      setupCollectiveSection();
    } else if (typeof window.setupCollectiveSection === "function") {
      window.setupCollectiveSection();
    } else {
      console.log("setupCollectiveSection se cargará cuando esté disponible");
    }
  }

  // Si es página de portfolio, no ejecutar las funciones del hero
  if (isPortfolioPage) {
    // Solo las animaciones de scroll genéricas
    setupBasicScrollAnimations();
  }
}

function initializeBasicApp(isHomePage) {
  console.log("Ejecutando en modo básico sin animaciones.");

  if (isHomePage) {
    const hero = document.querySelector(".hero");
    if (hero) hero.style.opacity = "1";
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  if (isHomePage) {
    setupExpandablePieces();
  }
}

// ====================================================================
// ===== SECCIÓN: HERO Y ANIMACIÓN INICIAL
// ====================================================================

function setupHero() {
  const overlay = document.querySelector(".overlay");
  const logoMask = document.getElementById("logoMask");

  // Verificar que los elementos existen
  if (!overlay) {
    console.log("No se encontró .overlay, saltando setupHero");
    return;
  }

  if (overlay) {
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.transform = "none";
  }

  if (logoMask && logoData) {
    logoMask.setAttribute("d", logoData);
    updateLogoMask();
  }

  const initialOverlayScale = 500;
  gsap.set(".overlay", {
    transformOrigin: "50% 50%",
    scale: initialOverlayScale,
  });

  // Verificar que existe el trigger antes de crear ScrollTrigger
  const heroElement = document.querySelector(".hero");
  if (heroElement) {
    ScrollTrigger.create({
      trigger: ".hero",
      start: "top top",
      end: `+=${window.innerHeight * 5}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => animateHeroElements(self.progress),
    });
  }
}

function animateHeroElements(scrollProgress) {
  const heroImgLogo = document.querySelector(".hero-img-logo");
  const heroImgCopy = document.querySelector(".hero-img-copy");
  const heroImgContainer = document.querySelector(".hero-img-container");
  const fadeOverlay = document.querySelector(".fade-overlay");
  const svgOverlay = document.querySelector(".overlay");
  const overlayCopy = document.querySelector(".overlay-copy h1");
  const initialOverlayScale = 500;

  // Verificar que los elementos existen antes de animarlos
  if (heroImgLogo && heroImgCopy) {
    const fadeOpacity = scrollProgress <= 0.15 ? 1 - scrollProgress / 0.15 : 0;
    gsap.set([heroImgLogo, heroImgCopy], { opacity: fadeOpacity });
  }

  if (scrollProgress <= 0.85) {
    const normalizedProgress = scrollProgress / 0.85;
    const heroImgContainerScale = 1.5 - 0.5 * normalizedProgress;
    const overlayScale =
      initialOverlayScale *
      Math.pow(1 / initialOverlayScale, normalizedProgress);

    if (heroImgContainer) {
      gsap.set(heroImgContainer, { scale: heroImgContainerScale });
    }

    if (svgOverlay) {
      gsap.set(svgOverlay, {
        transformOrigin: "50% 25%",
        scale: overlayScale,
        force3D: true,
      });
    }

    if (fadeOverlay) {
      const fadeOverlayOpacity =
        scrollProgress >= 0.25 ? Math.min(1, (scrollProgress - 0.25) / 0.4) : 0;
      gsap.set(fadeOverlay, { opacity: fadeOverlayOpacity });
    }
  }

  if (scrollProgress >= 0.7 && scrollProgress <= 0.85 && overlayCopy) {
    const revealProgress = (scrollProgress - 0.7) / 0.15;
    const gradientSpread = 100;
    const gradientBottom = 240 - revealProgress * 280;
    const gradientTop = gradientBottom - gradientSpread;
    const scale = 1.25 - 0.25 * revealProgress;

    overlayCopy.style.background = `linear-gradient(to bottom, #000000 0%, #000000 ${gradientTop}%, #C9A96E ${gradientBottom}%, #C9A96E 100%)`;
    overlayCopy.style.backgroundClip = "text";
    overlayCopy.style.webkitBackgroundClip = "text";
    gsap.set(overlayCopy, { scale: scale, opacity: revealProgress });

    overlayCopy.querySelectorAll("span").forEach((span, index) => {
      gsap.set(span, {
        opacity: revealProgress,
        y: 50 * (1 - revealProgress),
        delay: index * 0.1,
      });
    });
  } else if (scrollProgress < 0.7 && overlayCopy) {
    gsap.set(overlayCopy, { opacity: 0 });
  }
}

function updateLogoMask() {
  const logoContainer = document.querySelector(".logo-container");
  const logoMask = document.getElementById("logoMask");
  if (!logoContainer || !logoMask) return;

  const logoRect = logoContainer.getBoundingClientRect();
  const maskBBox = logoMask.getBBox();

  const scaleX = logoRect.width / maskBBox.width;
  const scaleY = logoRect.height / maskBBox.height;
  const scale = Math.min(scaleX, scaleY);

  const posX =
    logoRect.left +
    (logoRect.width - maskBBox.width * scale) / 2 -
    maskBBox.x * scale;
  const posY =
    logoRect.top +
    (logoRect.height - maskBBox.height * scale) / 2 -
    maskBBox.y * scale;

  logoMask.setAttribute(
    "transform",
    `translate(${posX}, ${posY}) scale(${scale})`
  );
}

// ====================================================================
// ===== SECCIÓN: CURSOR PERSONALIZADO
// ====================================================================

function setupCustomCursor() {
  const cursor = document.querySelector(".custom-cursor");
  if (!cursor) return;

  let mouseX = 0,
    mouseY = 0;
  let currentX = 0,
    currentY = 0;
  let isOverCarousel = false;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const animateCursor = () => {
    currentX += (mouseX - currentX) * 0.12;
    currentY += (mouseY - currentY) * 0.12;
    cursor.style.transform = `translate(${currentX}px, ${currentY}px)`;
    requestAnimationFrame(animateCursor);
  };
  animateCursor();

  const carouselContainer = document.querySelector(".pieces-slider-container");
  if (carouselContainer) {
    carouselContainer.addEventListener("mouseenter", () => {
      isOverCarousel = true;
      cursor.style.pointerEvents = "none";
      cursor.style.zIndex = "1";
    });

    carouselContainer.addEventListener("mouseleave", () => {
      isOverCarousel = false;
      cursor.style.pointerEvents = "none";
      cursor.style.zIndex = "10001";
    });
  }

  document
    .querySelectorAll(
      "a:not(.pieces-slider-container a), button:not(.pieces-slider-container button), .date-card, .stat-item, .hover-glow, .split-panel, .artist-panel, .portfolio-btn"
    )
    .forEach((el) => {
      el.addEventListener("mouseenter", () => {
        if (!isOverCarousel) {
          document.body.classList.add("hover");
        }
      });
      el.addEventListener("mouseleave", () => {
        document.body.classList.remove("hover");
      });
    });

  document.addEventListener("click", (e) => {
    const clickEffect = document.createElement("div");
    clickEffect.className = "click-effect";
    clickEffect.style.left = e.clientX + "px";
    clickEffect.style.top = e.clientY + "px";
    clickEffect.style.pointerEvents = "none";
    document.body.appendChild(clickEffect);
    setTimeout(() => clickEffect.remove(), 1200);
  });
}

// ====================================================================
// ===== SECCIÓN: BARRA DE PROGRESO Y ANIMACIONES DE SCROLL
// ====================================================================

function setupProgressBar() {
  const progressBar = document.querySelector(".progress-bar");
  if (!progressBar) return;
  window.addEventListener("scroll", () => {
    const totalHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.pageYOffset / totalHeight) * 100;
    progressBar.style.width = `${progress}%`;
  });
}

function setupScrollAnimations() {
  document.querySelectorAll("[data-reveal]").forEach((element, index) => {
    ScrollTrigger.create({
      trigger: element,
      start: "top 85%",
      onEnter: () => {
        gsap.to(element, {
          opacity: 1,
          y: 0,
          duration: 1.4,
          delay: index * 0.08,
          ease: "power3.out",
          onComplete: () => element.classList.add("revealed"),
        });
      },
    });
  });

  document.querySelectorAll(".stat-number").forEach((stat) => {
    const endValue = parseInt(stat.getAttribute("data-count"));
    if (!endValue) return;

    ScrollTrigger.create({
      trigger: stat,
      start: "top 85%",
      onEnter: () => {
        gsap.to(stat, {
          textContent: endValue,
          duration: 2.8,
          ease: "power2.inOut",
          snap: { textContent: 1 },
          onUpdate: function () {
            stat.textContent = Math.ceil(this.targets()[0].textContent);
          },
        });
      },
    });
  });

  const aboutBg = document.querySelector(".about-section-v2 .parallax-bg");
  if (aboutBg) {
    gsap.to(aboutBg, {
      yPercent: -15,
      ease: "none",
      scrollTrigger: {
        trigger: ".about-section-v2",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  document.querySelectorAll(".image-wrapper img").forEach((img) => {
    gsap.to(img, {
      yPercent: -25,
      ease: "none",
      scrollTrigger: {
        trigger: img.parentElement,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5,
      },
    });
  });

  const quote = document.querySelector(".main-quote p");
  if (quote) {
    quote.innerHTML = quote.textContent
      .split(" ")
      .map((word) => `<span class="word">${word}</span>`)
      .join(" ");
    ScrollTrigger.create({
      trigger: quote,
      start: "top 85%",
      onEnter: () => {
        gsap.fromTo(
          ".word",
          { opacity: 0, y: 40, rotateX: -60 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 1.4,
            stagger: 0.06,
            ease: "back.out(1.4)",
          }
        );
      },
    });
  }
}

// Animaciones básicas para páginas de portfolio
function setupBasicScrollAnimations() {
  document.querySelectorAll("[data-reveal]").forEach((element, index) => {
    ScrollTrigger.create({
      trigger: element,
      start: "top 85%",
      onEnter: () => {
        gsap.to(element, {
          opacity: 1,
          y: 0,
          duration: 1.4,
          delay: index * 0.08,
          ease: "power3.out",
          onComplete: () => element.classList.add("revealed"),
        });
      },
    });
  });
}

// ====================================================================
// ===== SECCIÓN: EFECTOS DE ARTISTAS
// ====================================================================

function setupSpectacularArtists() {
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset;
    document.querySelectorAll(".cinema-background").forEach((element) => {
      element.style.transform = `translateY(${-(scrolled * 0.5)}px)`;
    });
  });

  document.querySelectorAll(".artist-panel").forEach((panel) => {
    panel.addEventListener("mousemove", function (e) {
      const rect = this.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      this.style.setProperty("--mouse-x", x + "%");
      this.style.setProperty("--mouse-y", y + "%");
    });
  });

  document.querySelectorAll(".portfolio-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const ripple = document.createElement("div");
      ripple.className = "ripple-effect";
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

// ====================================================================
// ===== SECCIÓN: CARRUSEL DE PIEZAS
// ====================================================================

function setupPiecesCarousel() {
  const slider = document.querySelector(".pieces-slider");
  const prevBtn = document.querySelector(".carousel-button.prev");
  const nextBtn = document.querySelector(".carousel-button.next");
  if (!slider || !prevBtn || !nextBtn) return;

  const getSlideWidth = () => {
    const firstSlide = slider.querySelector(".piece-slide");
    return firstSlide
      ? firstSlide.offsetWidth + firstSlide.offsetWidth * 0.04
      : 0;
  };

  const updateButtons = () => {
    prevBtn.disabled = slider.scrollLeft <= 10;
    nextBtn.disabled =
      slider.scrollLeft >= slider.scrollWidth - slider.clientWidth - 10;
  };

  const scrollToPos = (pos) =>
    slider.scrollTo({ left: pos, behavior: "smooth" });
  const goPrev = () =>
    scrollToPos(Math.max(0, slider.scrollLeft - getSlideWidth()));
  const goNext = () =>
    scrollToPos(
      Math.min(
        slider.scrollWidth - slider.clientWidth,
        slider.scrollLeft + getSlideWidth()
      )
    );

  prevBtn.addEventListener("click", goPrev);
  nextBtn.addEventListener("click", goNext);
  slider.addEventListener("scroll", updateButtons);

  document.addEventListener("keydown", (e) => {
    const rect = slider.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    const expandedCard = document.querySelector(".piece-slide.expanded");

    if (isVisible && !expandedCard) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    }
  });

  let touchStartX = 0;
  let touchStartY = 0;

  slider.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    },
    { passive: true }
  );

  slider.addEventListener(
    "touchend",
    (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        deltaX > 0 ? goPrev() : goNext();
      }
    },
    { passive: true }
  );

  updateButtons();
  window.addEventListener("resize", updateButtons);
}

function enhanceCarouselEffects() {
  const slider = document.querySelector(".pieces-slider");
  const slides = document.querySelectorAll(".piece-slide");
  if (!slides.length || !slider) return;

  slider.addEventListener("scroll", () => {
    slides.forEach((slide) => {
      // Solo aplicar efectos parallax a slides no expandidos
      if (!slide.classList.contains("expanded")) {
        const rect = slide.getBoundingClientRect();
        const distance = Math.abs(
          window.innerWidth / 2 - (rect.left + rect.width / 2)
        );
        const maxDist = window.innerWidth;
        const parallaxOffset = (distance / maxDist) * 20;
        slide.style.backgroundPosition = `${50 + parallaxOffset}% center`;
        slide.style.transform = `scale(${1 - (distance / maxDist) * 0.1})`;
        slide.style.opacity = 1 - (distance / maxDist) * 0.3;
        slide.classList.toggle("active", distance < rect.width / 2);
      }
    });
  });

  slides.forEach((slide) => {
    slide.addEventListener("mousemove", (e) => {
      if (!slide.classList.contains("expanded")) {
        const rect = slide.getBoundingClientRect();
        slide.style.backgroundPosition = `${
          ((e.clientX - rect.left) / rect.width) * 100
        }% ${((e.clientY - rect.top) / rect.height) * 100}%`;
        slide.style.backgroundSize = "110%";
      }
    });
    slide.addEventListener("mouseleave", () => {
      if (!slide.classList.contains("expanded")) {
        slide.style.backgroundPosition = "center";
        slide.style.backgroundSize = "cover";
      }
    });
  });

  createCarouselIndicators();
  preloadCarouselImages();
}

function createCarouselIndicators() {
  const slider = document.querySelector(".pieces-slider");
  const slides = document.querySelectorAll(".piece-slide");
  const container = document.querySelector(".pieces-slider-container");
  if (!slider || !slides.length || !container) return;

  const indicatorsContainer = document.createElement("div");
  indicatorsContainer.className = "carousel-indicators";

  slides.forEach((slide, index) => {
    const indicator = document.createElement("button");
    indicator.className = "carousel-indicator";
    indicator.setAttribute("aria-label", `Ir al slide ${index + 1}`);
    if (index === 0) indicator.classList.add("active");
    indicator.addEventListener("click", () => {
      const slideWidth = slide.offsetWidth + slide.offsetWidth * 0.04;
      slider.scrollTo({ left: slideWidth * index, behavior: "smooth" });
    });
    indicatorsContainer.appendChild(indicator);
  });
  container.appendChild(indicatorsContainer);

  slider.addEventListener("scroll", () => {
    const slideWidth = slides[0].offsetWidth + slides[0].offsetWidth * 0.04;
    const currentIndex = Math.round(slider.scrollLeft / slideWidth);
    indicatorsContainer
      .querySelectorAll(".carousel-indicator")
      .forEach((ind, i) => {
        ind.classList.toggle("active", i === currentIndex);
      });
  });
}

function setupHorizontalWheelScroll() {
  const slider = document.querySelector(".pieces-slider");
  if (!slider) return;

  slider.addEventListener("wheel", (evt) => {
    const expandedCard = document.querySelector(".piece-slide.expanded");
    if (!expandedCard) {
      evt.preventDefault();
      slider.scrollLeft += evt.deltaY;
    }
  });
}

// ====================================================================
// ===== SECCIÓN: TARJETAS EXPANDIBLES INLINE - NUEVA SOLUCIÓN
// ====================================================================

function setupExpandablePieces() {
  // Eliminar cualquier modal anterior si existe
  const oldExpander = document.querySelector(".piece-expander");
  if (oldExpander) {
    oldExpander.remove();
  }

  // Event delegation para los botones "Leer más"
  document.addEventListener("click", (e) => {
    const readMoreBtn = e.target.closest(".read-more-btn");
    if (!readMoreBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const slide = readMoreBtn.closest(".piece-slide");
    const isExpanded = slide.classList.contains("expanded");

    if (isExpanded) {
      // Contraer la tarjeta
      collapseCard(slide, readMoreBtn);
    } else {
      // Primero contraer cualquier otra tarjeta expandida
      const expandedCards = document.querySelectorAll(".piece-slide.expanded");
      expandedCards.forEach((card) => {
        if (card !== slide) {
          collapseCard(card, card.querySelector(".read-more-btn"));
        }
      });

      // Expandir esta tarjeta
      expandCard(slide, readMoreBtn);
    }
  });

  // Cerrar tarjetas expandidas con Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const expandedCards = document.querySelectorAll(".piece-slide.expanded");
      expandedCards.forEach((card) => {
        collapseCard(card, card.querySelector(".read-more-btn"));
      });
    }
  });
}

function expandCard(slide, button) {
  const content = slide.querySelector(".slide-content");
  const fullStoryElement = slide.querySelector(".full-story-content");

  if (!fullStoryElement) return;

  const fullStory = fullStoryElement.innerHTML;

  // Crear contenedor para el contenido expandido
  const expandedContent = document.createElement("div");
  expandedContent.className = "expanded-story";
  expandedContent.innerHTML = `
    <div class="story-divider"></div>
    <div class="story-text">${fullStory}</div>
  `;

  // Añadir el contenido expandido
  content.appendChild(expandedContent);

  // Marcar como expandida y cambiar texto del botón
  slide.classList.add("expanded");
  button.innerHTML = `
    <svg class="collapse-icon" viewBox="0 0 24 24" width="16" height="16">
      <path d="M18 15l-6-6-6 6" stroke="currentColor" stroke-width="2" fill="none"/>
    </svg>
    Leer Menos
  `;

  // Animar la expansión con GSAP
  if (typeof gsap !== "undefined") {
    gsap.fromTo(
      expandedContent,
      {
        opacity: 0,
        height: 0,
        y: -20,
      },
      {
        opacity: 1,
        height: "auto",
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      }
    );

    // Animar los párrafos individualmente
    const paragraphs = expandedContent.querySelectorAll("p");
    gsap.fromTo(
      paragraphs,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.1,
        delay: 0.3,
        ease: "power2.out",
      }
    );
  } else {
    // Fallback CSS animation
    expandedContent.style.animation = "slideDown 0.6s ease-out forwards";
  }

  // Scroll suave hasta la tarjeta expandida
  setTimeout(() => {
    slide.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, 300);
}

function collapseCard(slide, button) {
  const expandedContent = slide.querySelector(".expanded-story");
  if (!expandedContent || !button) return;

  // Animar la contracción
  if (typeof gsap !== "undefined") {
    gsap.to(expandedContent, {
      opacity: 0,
      height: 0,
      y: -20,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => {
        expandedContent.remove();
        slide.classList.remove("expanded");

        // Restaurar texto del botón
        button.innerHTML = `
          <svg class="expand-icon" viewBox="0 0 24 24" width="16" height="16">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
          Leer Historia Completa
        `;
      },
    });
  } else {
    // Fallback CSS animation
    expandedContent.style.animation = "slideUp 0.4s ease-in forwards";
    setTimeout(() => {
      expandedContent.remove();
      slide.classList.remove("expanded");

      button.innerHTML = `
        <svg class="expand-icon" viewBox="0 0 24 24" width="16" height="16">
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
        Leer Historia Completa
      `;
    }, 400);
  }
}

// ====================================================================
// ===== SECCIÓN: EFECTOS ADICIONALES Y GENERALES
// ====================================================================

function setupAdditionalEffects() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        const targetPosition =
          target.getBoundingClientRect().top + window.pageYOffset - 60;
        window.scrollTo({ top: targetPosition, behavior: "smooth" });
      }
    });
  });

  setInterval(() => {
    const glitchElements = document.querySelectorAll("h1, h2, .gallery-title");
    if (glitchElements.length > 0) {
      const randomEl =
        glitchElements[Math.floor(Math.random() * glitchElements.length)];
      if (Math.random() > 0.7) {
        randomEl.classList.add("glitch");
        setTimeout(() => randomEl.classList.remove("glitch"), 250);
      }
    }
  }, 8000);

  document.querySelectorAll(".hover-glow").forEach((element) => {
    element.addEventListener("mousemove", (e) => {
      const rect = element.getBoundingClientRect();
      element.style.setProperty(
        "--mouse-x",
        `${((e.clientX - rect.left) / rect.width) * 100}%`
      );
      element.style.setProperty(
        "--mouse-y",
        `${((e.clientY - rect.top) / rect.height) * 100}%`
      );
    });
  });

  createFloatingParticles();
  setupLazyLoading();

  window.addEventListener(
    "resize",
    throttle(() => {
      updateLogoMask();
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    }, 250)
  );
}

function createFloatingParticles() {
  const container = document.querySelector(".floating-particles");
  if (!container) return;
  for (let i = 0; i < 15; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.top = Math.random() * 100 + "%";
    particle.style.animationDelay = Math.random() * 8 + "s";
    particle.style.animationDuration = 6 + Math.random() * 4 + "s";
    container.appendChild(particle);
  }
}

function setupLazyLoading() {
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add("loaded");
          obs.unobserve(img);
        }
      });
    });
    document
      .querySelectorAll("img[src]")
      .forEach((img) => observer.observe(img));
  }
}

function injectDynamicStyles() {
  const styles = `
    @keyframes ripple { to { transform: scale(4); opacity: 0; } }
    @keyframes breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
    @keyframes slideDown {
      from { opacity: 0; height: 0; transform: translateY(-20px); }
      to { opacity: 1; height: auto; transform: translateY(0); }
    }
    @keyframes slideUp {
      from { opacity: 1; height: auto; transform: translateY(0); }
      to { opacity: 0; height: 0; transform: translateY(-20px); }
    }

    .artist-panel::after {
      content: ''; position: absolute; top: var(--mouse-y, 50%); left: var(--mouse-x, 50%);
      width: 200px; height: 200px;
      background: radial-gradient(circle, rgba(201, 169, 110, 0.1) 0%, transparent 70%);
      transform: translate(-50%, -50%); pointer-events: none;
      opacity: 0; transition: opacity 0.3s ease;
    }
    .artist-panel:hover::after { opacity: 1; }

    .ripple-effect {
      position: absolute; border-radius: 50%; background: rgba(201, 169, 110, 0.4);
      transform: scale(0); animation: ripple 0.6s linear;
      width: 20px; height: 20px; pointer-events: none;
    }

    /* Asegurar que los elementos del carrusel no interfieran con el scroll */
    .pieces-slider-container {
      position: relative;
      isolation: isolate;
    }

    .pieces-slider {
      pointer-events: auto;
      touch-action: pan-x;
    }

    .piece-slide {
      pointer-events: auto;
    }

    /* Mejorar la interacción del cursor en el carrusel */
    .pieces-slider-container:hover .custom-cursor {
      mix-blend-mode: normal;
    }`;
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

// ====================================================================
// ===== FUNCIONES UTILITARIAS Y DE OPTIMIZACIÓN
// ====================================================================

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

function isMobile() {
  return (
    window.innerWidth <= 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  );
}

function preloadCriticalImages() {
  [
    "/public/images/capas/hero-img-layer-1.webp",
    "/public/images/logos/Vector.svg",
    "/public/images/personas/Vega.jpg",
    "/public/images/personas/Hugo.jpg",
    "/public/images/capas/Duo.webp",
    "/public/images/piezas/Cibanal.jpg",
    "/public/images/personas/Vega.jpg",
    "/public/images/personas/Hugo.jpg",
  ].forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

function preloadCarouselImages() {
  document.querySelectorAll(".piece-slide").forEach((slide) => {
    const url = window
      .getComputedStyle(slide)
      .backgroundImage.match(/url\(["']?(.+?)["']?\)/);
    if (url && url[1]) {
      const img = new Image();
      img.src = url[1];
    }
  });
}

// ====================================================================
// ===== LISTENERS GLOBALES Y OPTIMIZACIONES
// ====================================================================

window.addEventListener("error", (e) => {
  console.error("Error en la aplicación:", e.error);
});

document.addEventListener("visibilitychange", () => {
  document.body.style.animationPlayState = document.hidden
    ? "paused"
    : "running";
});

// Optimizaciones para móvil
if (isMobile()) {
  document.body.classList.add("mobile");
  document.querySelectorAll(".particle").forEach((particle) => {
    if (Math.random() > 0.5) particle.style.display = "none";
  });

  // Desactivar cursor personalizado en móvil
  const cursor = document.querySelector(".custom-cursor");
  if (cursor) {
    cursor.style.display = "none";
  }
}

// ====================================================================
// ===== SECCIÓN: ENLACE DE CONTACTO
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {

  const contactLink = document.getElementById('contact-link');
  const body = document.body;

  if (contactLink) {
    // Cuando el ratón entra en el área del botón de contacto...
    contactLink.addEventListener('mouseenter', () => {
      // ...añadimos la clase 'contact-hover-active' al body.
      body.classList.add('contact-hover-active');
    });

    // Cuando el ratón sale del área del botón...
    contactLink.addEventListener('mouseleave', () => {
      // ...quitamos la clase para que todo vuelva a la normalidad.
      body.classList.remove('contact-hover-active');
    });
  }

});
