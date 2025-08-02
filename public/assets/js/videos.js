/**
 * @file Videos Section Controller with Fullscreen Support
 * @description Controla el carousel de videos con autoplay, navegación, accesibilidad y fullscreen
 * @author Tu Nombre
 * @version 2.0.0
 */

class VideosSection {
  constructor() {
    this.currentSlide = 0;
    this.totalSlides = 2;
    this.isAutoplayActive = false;
    this.isMobile = this.detectMobile();
    this.isIntersecting = false;
    this.autoplayInterval = null;
    this.slideChangeTimeout = null;
    this.isFullscreen = false;
    this.fullscreenContainer = null;

    // Elementos DOM
    this.section = document.querySelector('.videos-section');
    this.carousel = document.querySelector('.video-carousel');
    this.slides = document.querySelectorAll('.video-slide');
    this.videos = document.querySelectorAll('.video-player');
    this.videoContainers = document.querySelectorAll('.video-container');
    this.playPauseBtns = document.querySelectorAll('.play-pause-btn');
    this.prevBtn = document.querySelector('.prev-btn');
    this.nextBtn = document.querySelector('.next-btn');
    this.indicators = document.querySelectorAll('.video-indicator');

    // Verificar que los elementos existen
    if (!this.section || !this.carousel || !this.slides.length) {
      console.warn('Videos section: Elementos DOM no encontrados');
      return;
    }

    // Actualizar totalSlides basado en elementos encontrados
    this.totalSlides = this.slides.length;

    this.init();
  }

  /**
   * Inicializa la sección de videos
   */
  init() {
    console.log('Inicializando sección de videos con fullscreen...');

    this.setupEventListeners();
    this.setupIntersectionObserver();
    this.setupVideosForAutoplay();
    this.addFullscreenButtons();
    this.setupFullscreenEventListeners();
    this.updateUI();

    // Precargar videos si no es móvil
    if (!this.isMobile) {
      this.preloadVideos();
    }

    // Inicializar primer video como pausado
    this.setVideoContainerState(0, 'paused');

    console.log('Sección de videos inicializada correctamente');
  }

  /**
   * Añade botones de fullscreen a cada contenedor de video
   */
  addFullscreenButtons() {
    this.videoContainers.forEach((container, index) => {
      // Crear botón de fullscreen
      const fullscreenBtn = document.createElement('button');
      fullscreenBtn.className = 'fullscreen-btn';
      fullscreenBtn.setAttribute('aria-label', 'Pantalla completa');
      fullscreenBtn.setAttribute('data-video-index', index);

      // SVG para el icono de fullscreen
      fullscreenBtn.innerHTML = `
        <svg class="fullscreen-expand-icon" viewBox="0 0 24 24" fill="none">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="2"/>
        </svg>
        <svg class="fullscreen-compress-icon" viewBox="0 0 24 24" fill="none" style="display: none;">
          <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" stroke="currentColor" stroke-width="2"/>
        </svg>
      `;

      // Crear hint de ESC para fullscreen
      const escHint = document.createElement('div');
      escHint.className = 'fullscreen-esc-hint';
      escHint.textContent = 'Presiona ESC para salir';

      container.appendChild(fullscreenBtn);
      container.appendChild(escHint);
    });
  }

  /**
   * Configura event listeners para fullscreen
   */
  setupFullscreenEventListeners() {
    // Eventos de botones fullscreen
    const fullscreenBtns = document.querySelectorAll('.fullscreen-btn');
    fullscreenBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const videoIndex = parseInt(btn.getAttribute('data-video-index'));
        this.toggleFullscreen(videoIndex);
      });
    });

    // Evento para cambios de fullscreen del navegador
    document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
    document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
    document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
    document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());

    // Evento para errores de fullscreen
    document.addEventListener('fullscreenerror', (e) => this.handleFullscreenError(e));
    document.addEventListener('webkitfullscreenerror', (e) => this.handleFullscreenError(e));
    document.addEventListener('mozfullscreenerror', (e) => this.handleFullscreenError(e));
    document.addEventListener('MSFullscreenError', (e) => this.handleFullscreenError(e));
  }

  /**
   * Toggle fullscreen para un video específico
   * @param {number} videoIndex - Índice del video
   */
  async toggleFullscreen(videoIndex) {
    const container = this.videoContainers[videoIndex];
    if (!container) return;

    try {
      if (!this.isFullscreen) {
        await this.enterFullscreen(videoIndex);
      } else {
        await this.exitFullscreen();
      }
    } catch (error) {
      console.warn('Error al cambiar modo fullscreen:', error);
      this.showFullscreenNotification('Error al acceder a pantalla completa');
    }
  }

  /**
   * Entra en modo fullscreen
   * @param {number} videoIndex - Índice del video
   */
  async enterFullscreen(videoIndex) {
    const container = this.videoContainers[videoIndex];
    const video = this.videos[videoIndex];

    if (!container || !video) return;

    // Cambiar al slide del video si no está activo
    if (videoIndex !== this.currentSlide) {
      this.goToSlide(videoIndex);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Intentar fullscreen API del navegador
    try {
      if (container.requestFullscreen) {
        await container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        await container.webkitRequestFullscreen();
      } else if (container.mozRequestFullScreen) {
        await container.mozRequestFullScreen();
      } else if (container.msRequestFullscreen) {
        await container.msRequestFullscreen();
      } else {
        // Fallback: fullscreen simulado
        this.simulateFullscreen(videoIndex);
      }
    } catch (error) {
      console.warn('API fullscreen no disponible, usando simulación:', error);
      this.simulateFullscreen(videoIndex);
    }
  }

  /**
   * Simula fullscreen cuando la API no está disponible
   * @param {number} videoIndex - Índice del video
   */
  simulateFullscreen(videoIndex) {
    const container = this.videoContainers[videoIndex];
    const video = this.videos[videoIndex];

    if (!container || !video) return;

    // Añadir clase de fullscreen
    container.classList.add('fullscreen', 'entering-fullscreen');
    document.body.style.overflow = 'hidden';

    // Actualizar estado
    this.isFullscreen = true;
    this.fullscreenContainer = container;

    // Actualizar UI
    this.updateFullscreenUI(videoIndex, true);

    // Reproducir video en fullscreen
    this.playVideoInFullscreen(video);

    // Animar entrada
    setTimeout(() => {
      container.classList.remove('entering-fullscreen');
    }, 600);

    // Anunciar para screen readers
    this.announceToScreenReader('Modo pantalla completa activado. Presiona ESC para salir.');
  }

  /**
   * Sale del modo fullscreen
   */
  async exitFullscreen() {
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement ||
          document.mozFullScreenElement || document.msFullscreenElement) {
        // Usar API del navegador
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
      } else if (this.fullscreenContainer) {
        // Fullscreen simulado
        this.exitSimulatedFullscreen();
      }
    } catch (error) {
      console.warn('Error al salir de fullscreen:', error);
      // Forzar salida
      this.exitSimulatedFullscreen();
    }
  }

  /**
   * Sale del fullscreen simulado
   */
  exitSimulatedFullscreen() {
    if (!this.fullscreenContainer) return;

    const container = this.fullscreenContainer;

    // Añadir animación de salida
    container.classList.add('exiting-fullscreen');

    setTimeout(() => {
      // Remover clases y estilos
      container.classList.remove('fullscreen', 'exiting-fullscreen');
      document.body.style.overflow = '';

      // Actualizar estado
      this.isFullscreen = false;
      const videoIndex = Array.from(this.videoContainers).indexOf(container);
      this.fullscreenContainer = null;

      // Actualizar UI
      this.updateFullscreenUI(videoIndex, false);

      // Anunciar para screen readers
      this.announceToScreenReader('Modo pantalla completa desactivado');
    }, 600);
  }

  /**
   * Maneja cambios de fullscreen del navegador
   */
  handleFullscreenChange() {
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );

    if (!isCurrentlyFullscreen && this.isFullscreen) {
      // El usuario salió de fullscreen (probablemente con ESC)
      this.isFullscreen = false;

      if (this.fullscreenContainer) {
        const videoIndex = Array.from(this.videoContainers).indexOf(this.fullscreenContainer);
        this.updateFullscreenUI(videoIndex, false);
        this.fullscreenContainer = null;
      }

      // Restaurar scroll
      document.body.style.overflow = '';

      console.log('Salió de fullscreen');
    } else if (isCurrentlyFullscreen && !this.isFullscreen) {
      // Entró en fullscreen
      this.isFullscreen = true;
      this.fullscreenContainer = document.fullscreenElement ||
                                 document.webkitFullscreenElement ||
                                 document.mozFullScreenElement ||
                                 document.msFullscreenElement;

      if (this.fullscreenContainer) {
        const videoIndex = Array.from(this.videoContainers).indexOf(this.fullscreenContainer);
        this.updateFullscreenUI(videoIndex, true);

        // Reproducir video
        const video = this.videos[videoIndex];
        if (video) {
          this.playVideoInFullscreen(video);
        }
      }

      console.log('Entró en fullscreen');
    }
  }

  /**
   * Maneja errores de fullscreen
   * @param {Event} e - Evento de error
   */
  handleFullscreenError(e) {
    console.error('Error de fullscreen:', e);
    this.showFullscreenNotification('Error al acceder a pantalla completa');

    // Resetear estado si hay error
    this.isFullscreen = false;
    this.fullscreenContainer = null;
    document.body.style.overflow = '';
  }

  /**
   * Actualiza la UI para modo fullscreen
   * @param {number} videoIndex - Índice del video
   * @param {boolean} isEntering - Si está entrando o saliendo
   */
  updateFullscreenUI(videoIndex, isEntering) {
    const container = this.videoContainers[videoIndex];
    const fullscreenBtn = container?.querySelector('.fullscreen-btn');

    if (!fullscreenBtn) return;

    const expandIcon = fullscreenBtn.querySelector('.fullscreen-expand-icon');
    const compressIcon = fullscreenBtn.querySelector('.fullscreen-compress-icon');

    if (isEntering) {
      // Cambiar a icono de salir de fullscreen
      expandIcon.style.display = 'none';
      compressIcon.style.display = 'block';
      fullscreenBtn.setAttribute('aria-label', 'Salir de pantalla completa');
    } else {
      // Cambiar a icono de entrar en fullscreen
      expandIcon.style.display = 'block';
      compressIcon.style.display = 'none';
      fullscreenBtn.setAttribute('aria-label', 'Pantalla completa');
    }
  }

  /**
   * Reproduce video optimizado para fullscreen
   * @param {HTMLVideoElement} video - Elemento de video
   */
  async playVideoInFullscreen(video) {
    if (!video) return;

    try {
      // Pausar otros videos
      this.pauseAllVideos();

      // Configurar para fullscreen
      video.muted = false; // Permitir sonido en fullscreen

      // Reproducir
      await video.play();

      console.log('Video reproduciendo en fullscreen con sonido');
    } catch (error) {
      console.warn('Error al reproducir video en fullscreen:', error);
      // Fallback: reproducir muted
      try {
        video.muted = true;
        await video.play();
      } catch (fallbackError) {
        console.error('Error en fallback de reproducción:', fallbackError);
      }
    }
  }

  /**
   * Muestra notificación temporal de fullscreen
   * @param {string} message - Mensaje a mostrar
   */
  showFullscreenNotification(message) {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = 'fullscreen-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 1rem 2rem;
      border-radius: 25px;
      border: 1px solid var(--color-primary);
      z-index: 10005;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
      font-size: 0.9rem;
    `;

    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 100);

    // Remover después de 3 segundos
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  /**
   * Configura todos los event listeners
   */
  setupEventListeners() {
    // Navegación con botones
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.goToPrevSlide());
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.goToNextSlide());
    }

    // Indicadores
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index));

      // Accesibilidad
      indicator.setAttribute('role', 'button');
      indicator.setAttribute('aria-label', `Ir al video ${index + 1}`);
      indicator.setAttribute('tabindex', '0');

      // Navegación con teclado en indicadores
      indicator.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.goToSlide(index);
        }
      });
    });

    // Botones de play/pause
    this.playPauseBtns.forEach((btn, index) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleVideoPlayback(index);
      });

      // Accesibilidad
      btn.setAttribute('aria-label', 'Reproducir/Pausar video');
    });

    // Eventos de contenedor de video (click para toggle)
    this.videoContainers.forEach((container, index) => {
      container.addEventListener('click', () => {
        // No hacer toggle si se hizo click en botón de fullscreen
        if (event.target.closest('.fullscreen-btn')) return;

        this.toggleVideoPlayback(index);
        // Marcar como interactuado por el usuario
        container.classList.add('user-interacted');
      });
    });

    // Eventos de video
    this.videos.forEach((video, index) => {
      video.addEventListener('loadstart', () => this.onVideoLoadStart(index));
      video.addEventListener('canplay', () => this.onVideoCanPlay(index));
      video.addEventListener('error', () => this.onVideoError(index));
      video.addEventListener('ended', () => this.onVideoEnded(index));
      video.addEventListener('play', () => this.onVideoPlay(index));
      video.addEventListener('pause', () => this.onVideoPause(index));

      // Prevenir menú contextual
      video.addEventListener('contextmenu', (e) => e.preventDefault());
    });

    // Navegación con teclado
    document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));

    // Cambio de visibilidad de la página
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());

    // Responsive: actualizar en resize
    window.addEventListener('resize', this.debounce(() => {
      this.isMobile = this.detectMobile();
      this.handleResponsiveChanges();
    }, 250));

    // Touch/Swipe support para móviles
    if (this.isMobile) {
      this.setupTouchControls();
    }
  }

  /**
   * Maneja la navegación con teclado (incluyendo ESC para fullscreen)
   * @param {KeyboardEvent} e - Evento de teclado
   */
  handleKeyboardNavigation(e) {
    // ESC para salir de fullscreen
    if (e.key === 'Escape' && this.isFullscreen) {
      e.preventDefault();
      this.exitFullscreen();
      return;
    }

    // Solo actuar si la sección está visible y en foco
    if (!this.isIntersecting && !this.isFullscreen) return;

    // No interferir si hay un elemento de formulario activo
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      return;
    }

    switch (e.key) {
      case 'ArrowLeft':
        if (!this.isFullscreen) {
          e.preventDefault();
          this.goToPrevSlide();
        }
        break;

      case 'ArrowRight':
        if (!this.isFullscreen) {
          e.preventDefault();
          this.goToNextSlide();
        }
        break;

      case ' ':
      case 'Enter':
        // Solo si no hay elemento activo o es un botón de video
        if (!activeElement || activeElement.classList.contains('play-pause-btn') ||
            activeElement.classList.contains('video-indicator') ||
            activeElement.classList.contains('fullscreen-btn')) {
          e.preventDefault();
          this.toggleVideoPlayback(this.currentSlide);
        }
        break;

      case 'f':
      case 'F':
        // F para fullscreen
        if (!this.isFullscreen) {
          e.preventDefault();
          this.toggleFullscreen(this.currentSlide);
        }
        break;

      case 'Home':
        if (!this.isFullscreen) {
          e.preventDefault();
          this.goToSlide(0);
        }
        break;

      case 'End':
        if (!this.isFullscreen) {
          e.preventDefault();
          this.goToSlide(this.totalSlides - 1);
        }
        break;
    }
  }

  /**
   * Configura controles táctiles para móviles
   */
  setupTouchControls() {
    let startX = 0;
    let endX = 0;

    this.carousel.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    this.carousel.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      this.handleSwipe();
    }, { passive: true });

    const handleSwipe = () => {
      // No hacer swipe en fullscreen
      if (this.isFullscreen) return;

      const difference = startX - endX;
      const threshold = 50; // Mínimo desplazamiento para activar swipe

      if (Math.abs(difference) > threshold) {
        if (difference > 0) {
          // Swipe left - siguiente
          this.goToNextSlide();
        } else {
          // Swipe right - anterior
          this.goToPrevSlide();
        }
      }
    };

    this.handleSwipe = handleSwipe;
  }

  /**
   * Configura el IntersectionObserver para autoplay
   */
  setupIntersectionObserver() {
    const options = {
      threshold: 0.5, // El 50% de la sección debe ser visible
      rootMargin: '0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isIntersecting = entry.isIntersecting;

        if (entry.isIntersecting) {
          console.log('Videos section visible - iniciando autoplay');
          this.startAutoplay();
        } else {
          console.log('Videos section no visible - pausando videos');
          this.stopAutoplay();
          this.pauseAllVideos();
        }
      });
    }, options);

    if (this.section) {
      this.observer.observe(this.section);
    }
  }

  /**
   * Configura los videos para autoplay (muted)
   */
  setupVideosForAutoplay() {
    this.videos.forEach((video, index) => {
      video.muted = true;
      video.playsInline = true;
      video.loop = true;
      video.preload = 'metadata';

      // Configurar atributos para autoplay
      if (index === 0) {
        video.setAttribute('autoplay', '');
        video.setAttribute('muted', '');
      }
    });
  }

  /**
   * Navega al slide anterior
   */
  goToPrevSlide() {
    if (this.isFullscreen) return; // No cambiar slide en fullscreen

    const newSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
    this.goToSlide(newSlide);
  }

  /**
   * Navega al slide siguiente
   */
  goToNextSlide() {
    if (this.isFullscreen) return; // No cambiar slide en fullscreen

    const newSlide = this.currentSlide === this.totalSlides - 1 ? 0 : this.currentSlide + 1;
    this.goToSlide(newSlide);
  }

  /**
   * Navega a un slide específico
   * @param {number} slideIndex - Índice del slide
   */
  goToSlide(slideIndex) {
    if (this.isFullscreen) return; // No cambiar slide en fullscreen

    if (slideIndex === this.currentSlide || slideIndex < 0 || slideIndex >= this.totalSlides) {
      return;
    }

    console.log(`Cambiando a slide ${slideIndex}`);

    // Pausar video actual
    const currentVideo = this.videos[this.currentSlide];
    if (currentVideo) {
      currentVideo.pause();
    }

    // Actualizar slide actual
    this.currentSlide = slideIndex;

    // Actualizar UI
    this.updateCarouselPosition();
    this.updateUI();

    // Reproducir nuevo video si autoplay está activo
    if (this.isAutoplayActive && this.isIntersecting) {
      // Limpiar timeout anterior si existe
      if (this.slideChangeTimeout) {
        clearTimeout(this.slideChangeTimeout);
      }

      this.slideChangeTimeout = setTimeout(() => {
        this.playCurrentVideo();
      }, 800); // Esperar a que termine la transición
    }

    // Anunciar cambio para screen readers
    this.announceSlideChange();
  }

  /**
   * Actualiza la posición del carousel
   */
  updateCarouselPosition() {
    const translateX = -this.currentSlide * 50; // 50% por slide
    this.carousel.style.transform = `translateX(${translateX}%)`;
  }

  /**
   * Actualiza la interfaz de usuario
   */
  updateUI() {
    // Actualizar slides activos
    this.slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === this.currentSlide);
    });

    // Actualizar indicadores
    this.indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.currentSlide);
      indicator.setAttribute('aria-pressed', index === this.currentSlide);
    });

    // Actualizar botones de navegación
    this.updateNavigationButtons();
  }

  /**
   * Actualiza el estado de los botones de navegación
   */
  updateNavigationButtons() {
    if (this.prevBtn) {
      this.prevBtn.setAttribute('aria-label',
        this.currentSlide === 0 ? 'Ir al último video' : 'Video anterior'
      );
    }

    if (this.nextBtn) {
      this.nextBtn.setAttribute('aria-label',
        this.currentSlide === this.totalSlides - 1 ? 'Ir al primer video' : 'Video siguiente'
      );
    }
  }

  /**
   * Inicia el autoplay
   */
  startAutoplay() {
    if (this.isAutoplayActive || this.isFullscreen) return;

    this.isAutoplayActive = true;
    console.log('Autoplay iniciado');

    // Reproducir video actual
    this.playCurrentVideo();
  }

  /**
   * Detiene el autoplay
   */
  stopAutoplay() {
    this.isAutoplayActive = false;

    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }

    if (this.slideChangeTimeout) {
      clearTimeout(this.slideChangeTimeout);
      this.slideChangeTimeout = null;
    }

    console.log('Autoplay detenido');
  }

  /**
   * Reproduce el video actual
   */
  async playCurrentVideo() {
    const currentVideo = this.videos[this.currentSlide];
    if (!currentVideo) return;

    try {
      this.setVideoContainerState(this.currentSlide, 'loading');

      // Asegurar que está muted para autoplay (excepto en fullscreen)
      if (!this.isFullscreen) {
        currentVideo.muted = true;
      }

      await currentVideo.play();

      console.log(`Video ${this.currentSlide} reproduciendo`);

    } catch (error) {
      console.warn(`Error al reproducir video ${this.currentSlide}:`, error);
      this.setVideoContainerState(this.currentSlide, 'error');
    }
  }

  /**
   * Pausa todos los videos
   */
  pauseAllVideos() {
    this.videos.forEach((video, index) => {
      video.pause();
      this.setVideoContainerState(index, 'paused');
    });
  }

  /**
   * Toggle de reproducción de un video específico
   * @param {number} videoIndex - Índice del video
   */
  async toggleVideoPlayback(videoIndex) {
    const video = this.videos[videoIndex];
    if (!video) return;

    try {
      if (video.paused) {
        // Pausar otros videos
        this.pauseAllVideos();

        // Cambiar al slide del video si no está activo
        if (videoIndex !== this.currentSlide && !this.isFullscreen) {
          this.goToSlide(videoIndex);
          return; // El video se reproducirá automáticamente
        }

        // Reproducir video
        if (!this.isFullscreen) {
          video.muted = true; // Mantener muted para evitar problemas de autoplay
        }
        await video.play();
        this.isAutoplayActive = true;

      } else {
        video.pause();
        this.isAutoplayActive = false;
      }
    } catch (error) {
      console.warn(`Error al cambiar reproducción del video ${videoIndex}:`, error);
      this.setVideoContainerState(videoIndex, 'error');
    }
  }

  /**
   * Establece el estado visual del contenedor de video
   * @param {number} videoIndex - Índice del video
   * @param {string} state - Estado: 'loading', 'playing', 'paused', 'error'
   */
  setVideoContainerState(videoIndex, state) {
    const container = this.videos[videoIndex]?.closest('.video-container');
    if (!container) return;

    // Limpiar estados anteriores
    container.classList.remove('loading', 'playing', 'paused', 'error');

    // Añadir nuevo estado
    container.classList.add(state);

    // Actualizar aria-label del botón play/pause
    const playPauseBtn = container.querySelector('.play-pause-btn');
    if (playPauseBtn) {
      const isPlaying = state === 'playing';
      playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pausar video' : 'Reproducir video');
    }
  }

  /**
   * Maneja el cambio de visibilidad de la página
   */
  handleVisibilityChange() {
    if (document.hidden) {
      this.pauseAllVideos();
      this.stopAutoplay();
    } else if (this.isIntersecting && !this.isFullscreen) {
      // Esperar un poco antes de reanudar para evitar problemas
      setTimeout(() => {
        this.startAutoplay();
      }, 500);
    }
  }

  /**
   * Maneja cambios responsive
   */
  handleResponsiveChanges() {
    console.log(`Modo: ${this.isMobile ? 'móvil' : 'desktop'}`);

    // Reconfigurar controles táctiles si es necesario
    if (this.isMobile && !this.handleSwipe) {
      this.setupTouchControls();
    }

    // Ajustar comportamiento según dispositivo
    if (this.isMobile) {
      // En móvil, ser más conservador con el autoplay
      this.pauseAllVideos();
    } else if (this.isIntersecting && !this.isFullscreen) {
      // En desktop, reanudar autoplay
      this.startAutoplay();
    }
  }

  /**
   * Precarga los videos (solo en desktop)
   */
  preloadVideos() {
    this.videos.forEach((video, index) => {
      if (video.readyState < 2) { // HAVE_CURRENT_DATA
        video.load();
        console.log(`Precargando video ${index}`);
      }
    });
  }

  /**
   * Anuncia cambios de slide para screen readers
   */
  announceSlideChange() {
    const videoTitle = this.slides[this.currentSlide]?.querySelector('.video-title')?.textContent;
    if (videoTitle) {
      this.announceToScreenReader(`Ahora mostrando: ${videoTitle}. Video ${this.currentSlide + 1} de ${this.totalSlides}`);
    }
  }

  /**
   * Anuncia texto para screen readers
   * @param {string} text - Texto a anunciar
   */
  announceToScreenReader(text) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';

    document.body.appendChild(announcement);
    announcement.textContent = text;

    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }

  /**
   * Detecta si es dispositivo móvil
   * @returns {boolean}
   */
  detectMobile() {
    return window.innerWidth <= 768 ||
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Función debounce para optimizar eventos
   * @param {Function} func - Función a ejecutar
   * @param {number} wait - Tiempo de espera
   * @returns {Function}
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Event handlers para videos
  onVideoLoadStart(index) {
    console.log(`Video ${index}: Iniciando carga`);
    this.setVideoContainerState(index, 'loading');
  }

  onVideoCanPlay(index) {
    console.log(`Video ${index}: Listo para reproducir`);
    this.setVideoContainerState(index, 'paused');
  }

  onVideoError(index) {
    console.error(`Video ${index}: Error de carga`);
    this.setVideoContainerState(index, 'error');

    // Anunciar error para usuarios de screen reader
    this.announceToScreenReader(`Error al cargar video ${index + 1}`);
  }

  onVideoEnded(index) {
    console.log(`Video ${index}: Reproducción terminada`);
    this.setVideoContainerState(index, 'paused');

    // Auto-avanzar al siguiente video si autoplay está activo y no en fullscreen
    if (this.isAutoplayActive && index === this.currentSlide && !this.isFullscreen) {
      setTimeout(() => {
        this.goToNextSlide();
      }, 1000);
    }
  }

  onVideoPlay(index) {
    console.log(`Video ${index}: Iniciado`);
    this.setVideoContainerState(index, 'playing');
  }

  onVideoPause(index) {
    console.log(`Video ${index}: Pausado`);
    this.setVideoContainerState(index, 'paused');
  }

  /**
   * Activa/desactiva el sonido de los videos
   * @param {boolean} muted - Si debe estar muted
   */
  toggleMute(muted = null) {
    this.videos.forEach(video => {
      if (muted !== null) {
        video.muted = muted;
      } else {
        video.muted = !video.muted;
      }
    });

    console.log(`Videos ${this.videos[0]?.muted ? 'silenciados' : 'con sonido'}`);
  }

  /**
   * Obtiene información del estado actual
   * @returns {Object}
   */
  getState() {
    return {
      currentSlide: this.currentSlide,
      totalSlides: this.totalSlides,
      isAutoplayActive: this.isAutoplayActive,
      isIntersecting: this.isIntersecting,
      isMobile: this.isMobile,
      isFullscreen: this.isFullscreen,
      fullscreenContainer: this.fullscreenContainer,
      videosState: Array.from(this.videos).map((video, index) => ({
        index,
        paused: video.paused,
        muted: video.muted,
        readyState: video.readyState,
        currentTime: video.currentTime,
        duration: video.duration
      }))
    };
  }

  /**
   * Destruye la instancia y limpia event listeners
   */
  destroy() {
    // Salir de fullscreen si está activo
    if (this.isFullscreen) {
      this.exitFullscreen();
    }

    // Detener autoplay
    this.stopAutoplay();

    // Pausar todos los videos
    this.pauseAllVideos();

    // Desconectar observer
    if (this.observer) {
      this.observer.disconnect();
    }

    // Limpiar timeouts
    if (this.slideChangeTimeout) {
      clearTimeout(this.slideChangeTimeout);
    }

    // Remover event listeners principales
    if (this.prevBtn) {
      this.prevBtn.removeEventListener('click', this.goToPrevSlide);
    }
    if (this.nextBtn) {
      this.nextBtn.removeEventListener('click', this.goToNextSlide);
    }

    // Limpiar referencias
    this.section = null;
    this.carousel = null;
    this.slides = null;
    this.videos = null;
    this.videoContainers = null;
    this.playPauseBtns = null;
    this.indicators = null;
    this.fullscreenContainer = null;

    console.log('Videos section destruida');
  }
}

// ============================================================
// INICIALIZACIÓN
// ============================================================

let videosSection;

/**
 * Inicializa la sección de videos cuando el DOM está listo
 */
function initVideosSection() {
  // Verificar que GSAP esté disponible para las animaciones reveal
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    // Configurar animación de reveal para el título de la sección
    const videosSectionTitle = document.querySelector('.videos-section .section-title');
    if (videosSectionTitle) {
      ScrollTrigger.create({
        trigger: videosSectionTitle,
        start: "top 85%",
        onEnter: () => {
          gsap.to(videosSectionTitle, {
            opacity: 1,
            y: 0,
            duration: 1.4,
            ease: "power3.out",
            onComplete: () => videosSectionTitle.classList.add('revealed')
          });
        }
      });
    }

    // Animación para los slides de video
    const videoSlides = document.querySelectorAll('.video-slide');
    videoSlides.forEach((slide, index) => {
      ScrollTrigger.create({
        trigger: slide,
        start: "top 90%",
        onEnter: () => {
          gsap.to(slide, {
            opacity: index === 0 ? 1 : 0.7,
            scale: index === 0 ? 1 : 0.95,
            duration: 0.8,
            delay: index * 0.2,
            ease: "power2.out"
          });
        }
      });
    });
  }

  // Inicializar el controlador de videos
  videosSection = new VideosSection();
}

/**
 * Función de setup para ser llamada desde el script principal
 */
function setupVideosSection() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideosSection);
  } else {
    initVideosSection();
  }
}

// ============================================================
// EXPORTAR FUNCIONES
// ============================================================

// Para compatibilidad con el script principal
window.setupVideosSection = setupVideosSection;

// Auto-inicialización si el script se carga independientemente
if (document.querySelector('.videos-section')) {
  setupVideosSection();
}

// ============================================================
// FUNCIONES DE UTILIDAD GLOBAL
// ============================================================

/**
 * Pausa todos los videos de la sección (útil para otros scripts)
 */
window.pauseAllVideosSection = function() {
  if (videosSection) {
    videosSection.pauseAllVideos();
  }
};

/**
 * Reproduce el video actual (útil para otros scripts)
 */
window.playCurrentVideoSection = function() {
  if (videosSection && videosSection.isIntersecting) {
    videosSection.playCurrentVideo();
  }
};

/**
 * Navega a un video específico
 */
window.goToVideoSlide = function(index) {
  if (videosSection) {
    videosSection.goToSlide(index);
  }
};

/**
 * Toggle mute de todos los videos
 */
window.toggleVideosMute = function(muted) {
  if (videosSection) {
    videosSection.toggleMute(muted);
  }
};

/**
 * Entra en fullscreen para un video específico
 */
window.enterVideoFullscreen = function(index) {
  if (videosSection) {
    videosSection.toggleFullscreen(index);
  }
};

/**
 * Sale de fullscreen
 */
window.exitVideoFullscreen = function() {
  if (videosSection && videosSection.isFullscreen) {
    videosSection.exitFullscreen();
  }
};

/**
 * Obtiene el estado actual de la sección de videos
 */
window.getVideosSectionState = function() {
  return videosSection ? videosSection.getState() : null;
};

// ============================================================
// DEBUGGING (solo en desarrollo)
// ============================================================

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('Videos Section Script con Fullscreen cargado en modo desarrollo');

  // Exponer instancia para debugging
  window.debugVideosSection = () => videosSection;

  // Funciones de debugging
  window.debugVideoState = (index) => {
    if (videosSection && videosSection.videos[index]) {
      const video = videosSection.videos[index];
      console.log(`Video ${index} state:`, {
        paused: video.paused,
        muted: video.muted,
        readyState: video.readyState,
        currentTime: video.currentTime,
        duration: video.duration,
        src: video.src
      });
    }
  };

  // Testing de fullscreen
  window.testFullscreen = (index = 0) => {
    if (videosSection) {
      videosSection.toggleFullscreen(index);
    }
  };
}
