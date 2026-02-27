/**
 * Language switcher (EN / ES) - AutoWorks Pro
 * Uses data-i18n attribute and localStorage
 */
(function () {
  "use strict";

  const LANG_KEY = "workshop-lang";
  const translations = {
    en: {
      "nav.home": "Home",
      "nav.about": "About",
      "nav.services": "Services",
      "nav.products": "Products",
      "nav.machinery": "Machinery",
      "nav.team": "Team",
      "nav.checklist": "Checklist",
      "nav.contact": "Contact",
      "footer.tagline": "Professional automotive repair services.",
      "footer.copyright": "© 2025 AutoWorks Pro. All rights reserved.",
      "btn.book": "Book Appointment",
      "btn.getQuote": "Get Free Quote",
      "btn.ourServices": "Our Services",
      "btn.contact": "Contact Us",
      "btn.learnMore": "Learn more",
      "btn.requestQuote": "Request Quote",
      "btn.sendMessage": "Send Message",
    },
    es: {
      "nav.home": "Inicio",
      "nav.about": "Nosotros",
      "nav.services": "Servicios",
      "nav.products": "Productos",
      "nav.machinery": "Maquinaria",
      "nav.team": "Equipo",
      "nav.checklist": "Lista de revisión",
      "nav.contact": "Contacto",
      "footer.tagline": "Servicios profesionales de reparación automotriz.",
      "footer.copyright": "© 2025 AutoWorks Pro. Todos los derechos reservados.",
      "btn.book": "Reservar cita",
      "btn.getQuote": "Obtener cotización gratis",
      "btn.ourServices": "Nuestros servicios",
      "btn.contact": "Contáctenos",
      "btn.learnMore": "Saber más",
      "btn.requestQuote": "Solicitar cotización",
      "btn.sendMessage": "Enviar mensaje",
    },
  };

  function getLang() {
    return localStorage.getItem(LANG_KEY) || "en";
  }

  function setLang(lang) {
    if (!translations[lang]) lang = "en";
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.setAttribute("lang", lang);
    applyTranslations(lang);
    updateLangDropdown(lang);
  }

  function applyTranslations(lang) {
    var t = translations[lang] || translations.en;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (t[key] !== undefined) el.textContent = t[key];
    });
  }

  function init() {
    var lang = getLang();
    document.documentElement.setAttribute("lang", lang);
    applyTranslations(lang);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
