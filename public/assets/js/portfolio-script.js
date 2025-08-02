// portfolio-script.js

// Carrusel de fotos/proyectos (funciona para ambos)
class PortfolioCarousel {
  constructor() {
    this.currentSlide = 0;
    // Buscar tanto slides de proyectos como de fotos
    this.slides = document.querySelectorAll(".project-slide, .photo-slide");
    this.prevBtn = document.querySelector(".nav-btn.prev-btn");
    this.nextBtn = document.querySelector(".nav-btn.next-btn");

    if (this.slides.length === 0) {
      console.log("No se encontraron slides del carrusel");
      return;
    }

    console.log(`Carrusel iniciado con ${this.slides.length} slides`);
    this.init();
  }

  init() {
    // Obtener indicadores después de inicializar
    this.indicators = document.querySelectorAll(".indicator");

    // Event listeners para botones
    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.prevSlide();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.nextSlide();
      });
    }

    // Event listeners para indicadores
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener("click", (e) => {
        e.preventDefault();
        this.goToSlide(index);
      });
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") this.prevSlide();
      if (e.key === "ArrowRight") this.nextSlide();
    });

    // Auto-play (opcional)
    this.startAutoPlay();

    // Pausar en hover
    const carousel = document.querySelector(
      ".projects-carousel, .photos-carousel"
    );
    if (carousel) {
      carousel.addEventListener("mouseenter", () => this.stopAutoPlay());
      carousel.addEventListener("mouseleave", () => this.startAutoPlay());
    }

    // Touch support
    this.addTouchSupport();
  }

  updateSlides() {
    this.slides.forEach((slide, index) => {
      slide.classList.remove("active", "prev", "next");

      if (index === this.currentSlide) {
        slide.classList.add("active");
      } else if (index < this.currentSlide) {
        slide.classList.add("prev");
      } else {
        slide.classList.add("next");
      }
    });

    // Actualizar indicadores
    this.indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === this.currentSlide);
    });
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.updateSlides();
    console.log(`Slide actual: ${this.currentSlide}`);
  }

  prevSlide() {
    this.currentSlide =
      (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.updateSlides();
    console.log(`Slide actual: ${this.currentSlide}`);
  }

  goToSlide(index) {
    this.currentSlide = index;
    this.updateSlides();
    console.log(`Saltando al slide: ${this.currentSlide}`);
  }

  startAutoPlay() {
    this.stopAutoPlay(); // Limpiar cualquier intervalo anterior
    this.autoPlayInterval = setInterval(() => this.nextSlide(), 5000);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  addTouchSupport() {
    let touchStartX = 0;
    let touchEndX = 0;

    const carousel = document.querySelector(
      ".projects-carousel, .photos-carousel"
    );
    if (!carousel) return;

    carousel.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    carousel.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    });

    const handleSwipe = () => {
      if (touchEndX < touchStartX - 50) {
        this.nextSlide();
      }
      if (touchEndX > touchStartX + 50) {
        this.prevSlide();
      }
    };

    this.handleSwipe = handleSwipe;
  }
}

// Animaciones con Intersection Observer
class ScrollAnimations {
  constructor() {
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    this.init();
  }

  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");

          // Animar elementos hijos con delay
          const children = entry.target.querySelectorAll("[data-delay]");
          children.forEach((child) => {
            const delay = child.dataset.delay;
            setTimeout(() => {
              child.classList.add("animated");
            }, delay);
          });
        }
      });
    }, this.observerOptions);

    // Observar elementos
    const elements = document.querySelectorAll(
      ".bio-content, .philosophy-quote, .stats-row, .showcase-header"
    );
    elements.forEach((el) => observer.observe(el));
  }
}

// Efectos de partículas mejorados
class ParticleEffects {
  constructor() {
    this.particleContainer = document.querySelector(".particle-system");
    if (!this.particleContainer) return;

    this.createDynamicParticles();
  }

  createDynamicParticles() {
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "dynamic-particle";

      // Posición aleatoria
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;

      // Tamaño aleatorio
      const size = Math.random() * 3 + 1;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      // Animación aleatoria
      particle.style.animationDelay = `${Math.random() * 20}s`;
      particle.style.animationDuration = `${Math.random() * 20 + 20}s`;

      this.particleContainer.appendChild(particle);
    }
  }
}

// Efecto parallax en el retrato
class PortraitParallax {
  constructor() {
    this.portrait = document.querySelector(".character-portrait");
    this.glowEffect = document.querySelector(".glow-pulse");

    if (!this.portrait) return;

    this.init();
  }

  init() {
    window.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;

      this.portrait.style.transform = `translateY(${
        -20 + y
      }px) translateX(${x}px)`;

      if (this.glowEffect) {
        this.glowEffect.style.transform = `scale(${
          1 + Math.abs(x) * 0.01
        }) translateX(${-x}px)`;
      }
    });
  }
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  // Verificar que estamos en una página de portfolio
  if (!document.body.classList.contains("portfolio-page")) {
    console.log("No es una página de portfolio, saliendo...");
    return;
  }

  // Inicializar carrusel (funciona tanto para proyectos como fotos)
  new PortfolioCarousel();

  // Inicializar animaciones de scroll
  new ScrollAnimations();

  // Inicializar partículas
  new ParticleEffects();

  // Inicializar parallax del retrato
  new PortraitParallax();

  // Verificar si GSAP está disponible antes de usarlo
  if (typeof gsap !== "undefined") {
    // Animación del título principal
    gsap.from(".character-name", {
      y: 100,
      opacity: 0,
      duration: 1.2,
      ease: "power4.out",
    });

    // Animación escalonada de elementos
    gsap.from(".bio-content > *", {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      delay: 0.5,
      ease: "power3.out",
    });
  }

  // Efecto de glitch ocasional en el título
  const glitchTitle = () => {
    const title = document.querySelector(".character-name");
    if (!title) return;

    title.style.animation = "glitch 0.3s ease-in-out";

    setTimeout(() => {
      title.style.animation = "";
    }, 300);
  };

  // Glitch aleatorio cada 10-20 segundos
  setInterval(glitchTitle, Math.random() * 10000 + 10000);
});
