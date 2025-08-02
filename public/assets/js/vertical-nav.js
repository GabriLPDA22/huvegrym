// Vertical Navigation Script - VERSIÓN CORREGIDA

document.addEventListener("DOMContentLoaded", function () {
  // ====================================================================
  // ===== SELECTORES Y VARIABLES GLOBALES
  // ====================================================================
  const navToggle = document.querySelector(".nav-toggle");
  const verticalNav = document.querySelector(".vertical-nav");
  const navTabs = document.querySelectorAll(".nav-tab");
  const navPanels = document.querySelectorAll(".nav-panel");
  const navImages = document.querySelectorAll(".nav-images img");
  const body = document.body;
  const customCursor = document.querySelector(".custom-cursor");

  let isExpanded = false;
  let currentTab = 0;
  let dropdownOpen = false; // Variable para controlar el estado del dropdown

  // ====================================================================
  // ===== ELEMENTOS CREADOS DINÁMICAMENTE
  // ====================================================================
  const backdrop = document.createElement("div");
  backdrop.className = "nav-backdrop";
  document.body.appendChild(backdrop);

  const navBackground = document.createElement("div");
  navBackground.className = "nav-background";

  const navEffects = document.createElement("div");
  navEffects.className = "nav-effects";

  const gridOverlay = document.createElement("div");
  gridOverlay.className = "grid-overlay";
  navEffects.appendChild(gridOverlay);

  const centerLogo = document.createElement("div");
  centerLogo.className = "nav-logo-center";
  centerLogo.innerHTML = `<svg class="center-logo" viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="150" y="80" font-family="DM Sans" font-size="32" font-weight="300" text-anchor="middle" dominant-baseline="central" fill="url(#logoGradient)">FRAGMENTOS</text>
            <text x="150" y="120" font-family="DM Sans" font-size="18" font-weight="300" text-anchor="middle" dominant-baseline="central" fill="url(#logoGradient)" opacity="0.8">DE ETERNIDAD</text>
            <defs><linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#d4af37;stop-opacity:1" /><stop offset="50%" style="stop-color:#ffffff;stop-opacity:1" /><stop offset="100%" style="stop-color:#d4af37;stop-opacity:1" /></linearGradient></defs>
        </svg>`;

  verticalNav.insertBefore(navBackground, verticalNav.firstChild);
  verticalNav.insertBefore(navEffects, verticalNav.firstChild);
  verticalNav.insertBefore(centerLogo, verticalNav.firstChild);

  // ====================================================================
  // ===== LÓGICA DE NAVEGACIÓN
  // ====================================================================

  function toggleNav() {
    isExpanded = !isExpanded;
    verticalNav.setAttribute(
      "data-state",
      isExpanded ? "expanded" : "collapsed"
    );
    body.classList.toggle("nav-open", isExpanded);

    // Control del overflow del body
    if (isExpanded) {
      body.style.overflow = "hidden";
      // Ocultar el cursor personalizado cuando el nav está abierto
      if (customCursor) {
        customCursor.style.visibility = "hidden";
        customCursor.style.opacity = "0";
      }
    } else {
      body.style.overflow = "";
      // Mostrar el cursor personalizado cuando el nav está cerrado
      if (customCursor) {
        customCursor.style.visibility = "visible";
        customCursor.style.opacity = "1";
      }
    }

    if (isExpanded) {
      if (navImages.length > 0) {
        navImages.forEach((img) => img.setAttribute("data-active", "false"));
        navImages[0].setAttribute("data-active", "true");
      }
    }
  }

  // Inicialización de la primera pestaña
  if (navTabs.length > 0) {
    navTabs[0].classList.add("active");
    navPanels[0].classList.add("active");
    if (navImages[0]) navImages[0].setAttribute("data-active", "true");
  }

  // Event listeners para abrir/cerrar menú
  navToggle.addEventListener("click", toggleNav);
  backdrop.addEventListener("click", () => isExpanded && toggleNav());
  navBackground.addEventListener("click", toggleNav);
  navEffects.addEventListener("click", toggleNav);
  document.querySelector(".nav-images")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) toggleNav();
  });

  // Cambio de pestañas
  navTabs.forEach((tab, index) => {
    tab.addEventListener("mouseenter", () => {
      const categoryMap = ["obras", "artistas", "videos", "lugares"];
      const category = categoryMap[index];
      navImages.forEach((img) => img.setAttribute("data-active", "false"));
      const targetImage = document.querySelector(
        `.nav-images img[data-category="${category}"]`
      );
      if (targetImage) targetImage.setAttribute("data-active", "true");
    });

    tab.addEventListener("click", () => {
      if (currentTab === index) return;
      navTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      navPanels.forEach((p) => p.classList.remove("active"));
      navPanels[index].classList.add("active");
      currentTab = index;
      tab.dispatchEvent(new Event("mouseenter"));
    });
  });

  // Cerrar menú al hacer clic en enlaces del panel
  document.querySelectorAll(".panel-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      toggleNav();
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        setTimeout(() => {
          const target = document.querySelector(href);
          if (target)
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 600);
      }
    });
  });

  // ====================================================================
  // ===== LÓGICA DE TRADUCCIÓN REAL
  // ====================================================================

  function translatePage(targetLang) {
    document.documentElement.lang = targetLang;
    localStorage.setItem("preferredLanguage", targetLang);

    // Cambiar texto de elementos con data-lang-[es/en]
    document.querySelectorAll("[data-lang-es]").forEach((el) => {
      const text = el.getAttribute(`data-lang-${targetLang}`);
      if (text) {
        if (el.classList.contains("contact-button")) {
          const svg = el.querySelector("svg");
          el.textContent = text;
          if (svg) el.appendChild(svg);
        } else {
          el.innerHTML = text;
        }
      }
    });

    // Cambiar texto de los botones "Leer más"
    document.querySelectorAll(".read-more-btn").forEach((btn) => {
      const slide = btn.closest(".piece-slide");
      const isExpanded = slide ? slide.classList.contains("expanded") : false;
      const key = isExpanded ? `readless` : `readmore`;
      const text = btn.getAttribute(`data-lang-${targetLang}_${key}`);

      if (text) {
        const svgIconHTML = btn.querySelector("svg")?.outerHTML || "";
        btn.innerHTML = `${svgIconHTML} ${text}`;
      }
    });

    // Cambiar atributos aria-label
    document.querySelectorAll("[data-lang-es_aria-label]").forEach((el) => {
      const label = el.getAttribute(`data-lang-${targetLang}_aria-label`);
      if (label) el.setAttribute("aria-label", label);
    });
  }

  function showLanguageMenu(button) {
    const languages = { es: "Español", en: "English" };
    const currentLangCode = document.documentElement.lang || "es";

    // Si ya hay un dropdown abierto, cerrarlo
    const existingDropdown = document.querySelector(".language-dropdown");
    if (existingDropdown) {
      existingDropdown.remove();
      dropdownOpen = false;
      return; // Salir si estamos cerrando el dropdown
    }

    const dropdown = document.createElement("div");
    dropdown.className = "language-dropdown";

    Object.entries(languages).forEach(([code, name]) => {
      const langOption = document.createElement("button");
      langOption.textContent = name;
      langOption.className = "lang-option";
      if (code === currentLangCode) {
        langOption.style.color = "var(--nav-accent)";
        langOption.style.fontWeight = "600";
      }

      langOption.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelector(".lang-text").textContent = name;
        translatePage(code);
        dropdown.remove();
        dropdownOpen = false;
      });

      dropdown.appendChild(langOption);
    });

    button.parentElement.style.position = "relative";
    button.parentElement.appendChild(dropdown);
    dropdownOpen = true;

    // Cerrar dropdown al hacer clic fuera
    setTimeout(() => {
      const closeDropdown = (e) => {
        if (!dropdown.contains(e.target) && !button.contains(e.target)) {
          dropdown.remove();
          dropdownOpen = false;
          document.removeEventListener("click", closeDropdown);
        }
      };
      document.addEventListener("click", closeDropdown);
    }, 10);
  }

  // Botones de acciones (Contacto e Idioma)
  const langButton = document.querySelector(".lang-button");
  if (langButton) {
    langButton.addEventListener("click", (e) => {
      e.stopPropagation();
      showLanguageMenu(e.currentTarget);
    });
  }

  document.querySelector(".contact-button")?.addEventListener("click", () => {
    toggleNav();
    setTimeout(() => {
      const contactSection = document.querySelector("#contacto");
      if (contactSection) contactSection.scrollIntoView({ behavior: "smooth" });
    }, 600);
  });

  // Cargar idioma preferido al iniciar la página
  const preferredLanguage = localStorage.getItem("preferredLanguage");
  if (preferredLanguage && preferredLanguage !== "es") {
    translatePage(preferredLanguage);
    const langName = preferredLanguage === "en" ? "English" : "Español";
    const langTextElement = document.querySelector(".lang-text");
    if (langTextElement) langTextElement.textContent = langName;
  }

  // ====================================================================
  // ===== OTROS EFECTOS Y LISTENERS
  // ====================================================================

  // Navegación con teclado
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (dropdownOpen) {
        const dropdown = document.querySelector(".language-dropdown");
        if (dropdown) {
          dropdown.remove();
          dropdownOpen = false;
        }
      } else if (isExpanded) {
        toggleNav();
      }
    }

    if (isExpanded && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
      let nextIndex =
        (currentTab + (e.key === "ArrowDown" ? 1 : -1) + navTabs.length) %
        navTabs.length;
      navTabs[nextIndex].dispatchEvent(new Event("mouseenter"));
      navTabs[nextIndex].dispatchEvent(new Event("click"));
      navTabs[nextIndex].focus();
    }
  });

  // Efecto glitch del logo
  setInterval(() => {
    const logo = centerLogo.querySelector(".center-logo");
    if (logo && isExpanded && Math.random() > 0.8) {
      logo.style.filter =
        "drop-shadow(0 0 30px var(--glow-color)) hue-rotate(90deg)";
      setTimeout(() => {
        logo.style.filter = "drop-shadow(0 0 30px var(--glow-color))";
      }, 100);
    }
  }, 5000);

  // Asegurar que el cursor personalizado esté visible al cargar la página
  if (customCursor && !isExpanded) {
    customCursor.style.visibility = "visible";
    customCursor.style.opacity = "1";
  }
});
