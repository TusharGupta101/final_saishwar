/**
* Automotive Workshop - Main JavaScript
* Form validation, smooth scroll, dark mode, navbar behavior
*/

(function () {
  "use strict";


  // ========== Navbar (sticky + active link) ==========
  function initNavbar() {
    const navbar = document.querySelector(".navbar-custom");
    if (!navbar) return;

    window.addEventListener("scroll", function () {
      if (window.scrollY > 50) {
        navbar.classList.add("shadow");
      } else {
        navbar.classList.remove("shadow");
      }
    });

    // Set active nav link based on current page
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".navbar-custom .nav-link").forEach(function (link) {
      const href = link.getAttribute("href") || "";
      if (href === currentPath || (currentPath === "" && href === "index.html")) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  // ========== Smooth scroll for anchor links ==========
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (targetId === "#") return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  // ========== Quick Quote pre-fill (from index.html GET params) ==========
  function initQuickQuotePreFill() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("quick") !== "1") return;

    const name = params.get("name") || "";
    const phone = params.get("phone") || "";
    const vehicle = params.get("vehicle") || "";
    const serviceType = params.get("serviceType") || "";

    const nameEl = form.querySelector("#name");
    const phoneEl = form.querySelector("#phone");
    const serviceEl = form.querySelector("#serviceType");
    const messageEl = form.querySelector("#message");

    if (nameEl) nameEl.value = name;
    if (phoneEl) phoneEl.value = phone;
    if (serviceEl) serviceEl.value = serviceType;
    if (messageEl && vehicle) {
      const serviceLabels = { engine: "Engine Repair", oil: "Oil Change", brake: "Brake Service", diagnostics: "Diagnostics", tire: "Tire Service", ac: "AC Repair", other: "Other" };
      const serviceLabel = serviceLabels[serviceType] || serviceType;
      messageEl.value = "Vehicle: " + vehicle + "\nService: " + serviceLabel + "\n\nI would like a free quote.";
    }

    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ========== Contact Form Validation ==========
  function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    initQuickQuotePreFill();

    const fields = {
      name: { min: 2, max: 100 },
      email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      phone: { min: 10, max: 15 },
      serviceType: { required: true },
      message: { min: 10, max: 1000 },
    };

    function showError(input, message) {
      const feedback = input.parentNode.querySelector(".invalid-feedback");
      input.classList.add("is-invalid");
      if (feedback) feedback.textContent = message;
    }

    function clearError(input) {
      input.classList.remove("is-invalid");
    }

    function validateField(name, value) {
      const rules = fields[name];
      if (!rules) return true;

      if (rules.required && !value.trim()) return "This field is required.";
      if (rules.min && value.length < rules.min) return `Minimum ${rules.min} characters.`;
      if (rules.max && value.length > rules.max) return `Maximum ${rules.max} characters.`;
      if (rules.pattern && !rules.pattern.test(value)) return "Please enter a valid value.";

      return null;
    }

    form.querySelectorAll("input, select, textarea").forEach(function (input) {
      input.addEventListener("blur", function () {
        const name = this.name;
        const value = this.value.trim();
        const error = validateField(name, value);
        if (error) showError(this, error);
        else clearError(this);
      });
    });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      let valid = true;
      form.querySelectorAll("input, select, textarea").forEach(function (input) {
        const name = input.name;
        const value = (input.value || "").trim();
        const error = validateField(name, value);
        if (error) {
          showError(input, error);
          valid = false;
        } else {
          clearError(input);
        }
      });

      if (!valid) return;

      const successEl = document.getElementById("formSuccess");
      const errorEl = document.getElementById("formError");
      const submitBtn = form.querySelector('button[type="submit"]');
      const btnText = submitBtn ? submitBtn.textContent : "";

      if (successEl) successEl.classList.add("d-none");
      if (errorEl) errorEl.classList.add("d-none");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }

      const payload = {
        name: (form.querySelector("#name") || {}).value || "",
        email: (form.querySelector("#email") || {}).value || "",
        phone: (form.querySelector("#phone") || {}).value || "",
        serviceType: (form.querySelector("#serviceType") || {}).value || "",
        message: (form.querySelector("#message") || {}).value || "",
      };

      try {
        const apiBase = window.CONTACT_API_BASE || "http://localhost:8620";
        const res = await fetch(apiBase + "/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(function () { return {}; });

        if (res.ok && data.success) {
          if (successEl) {
            successEl.classList.remove("d-none");
            successEl.focus();
          }
          form.reset();
          form.querySelectorAll(".is-invalid").forEach(function (i) {
            i.classList.remove("is-invalid");
          });
        } else {
          if (errorEl) {
            errorEl.textContent = (data && data.error) || "Something went wrong. Please try again or contact us by phone.";
            errorEl.classList.remove("d-none");
            errorEl.focus();
          }
        }
      } catch (err) {
        if (errorEl) {
          errorEl.textContent = "Unable to send. Check your connection or contact us by phone.";
          errorEl.classList.remove("d-none");
          errorEl.focus();
        }
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = btnText;
      }
    });
  }

  // ========== Cookie consent ==========
  const COOKIE_CONSENT_KEY = "workshop-cookie-consent";

  function initCookieConsent() {
    if (localStorage.getItem(COOKIE_CONSENT_KEY)) return;

    var banner = document.getElementById("cookieConsent");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "cookieConsent";
      banner.className = "cookie-consent-banner";
      banner.setAttribute("role", "dialog");
      banner.setAttribute("aria-label", "Cookie consent");
      banner.innerHTML =
        '<div class="container d-flex flex-wrap align-items-center justify-content-between gap-2">' +
        '<p class="mb-0">We use cookies to improve your experience and analyze site traffic. By continuing, you accept our use of cookies.</p>' +
        '<div class="d-flex gap-2">' +
        '<button type="button" class="btn btn-outline-secondary btn-sm" id="cookieDecline">Decline</button>' +
        '<button type="button" class="btn btn-primary-custom btn-sm" id="cookieAccept">Accept</button>' +
        "</div></div>";
      document.body.appendChild(banner);
    }

    function hideBanner(choice) {
      localStorage.setItem(COOKIE_CONSENT_KEY, choice);
      banner.classList.add("hide");
    }

    document.getElementById("cookieAccept")?.addEventListener("click", function () {
      hideBanner("accept");
    });
    document.getElementById("cookieDecline")?.addEventListener("click", function () {
      hideBanner("decline");
    });
  }

  // ========== Toast notifications ==========
  window.showToast = function (message, type, duration) {
    type = type || "info";
    duration = duration === undefined ? 4000 : duration;
    var container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    var toast = document.createElement("div");
    toast.className = "toast toast-" + type;
    toast.setAttribute("role", "alert");
    var icon = type === "success" ? "check-circle-fill" : type === "error" ? "exclamation-circle-fill" : type === "warning" ? "exclamation-triangle-fill" : "info-circle-fill";
    toast.innerHTML = "<i class=\"bi bi-" + icon + " me-2\"></i><span>" + (message || "") + "</span>";
    container.appendChild(toast);
    if (duration > 0) {
      setTimeout(function () {
        toast.classList.add("toast--hiding");
        setTimeout(function () {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
      }, duration);
    }
    return toast;
  };

  // ========== Reading progress bar ==========
  function initReadingProgress() {
    var bar = document.getElementById("readingProgressBar");
    if (!bar) {
      var wrap = document.createElement("div");
      wrap.id = "readingProgress";
      wrap.className = "reading-progress";
      wrap.setAttribute("aria-hidden", "true");
      wrap.innerHTML = '<div class="reading-progress__bar" id="readingProgressBar"></div>';
      document.body.appendChild(wrap);
      bar = document.getElementById("readingProgressBar");
    }
    function update() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
      bar.style.width = pct + "%";
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  // ========== Lazy loading for images ==========
  function initLazyImages() {
    var imgs = document.querySelectorAll("img:not([loading])");
    imgs.forEach(function (img) {
      img.setAttribute("loading", "lazy");
      if (img.complete) {
        img.classList.add("lazy-loaded");
      } else {
        img.addEventListener("load", function () { img.classList.add("lazy-loaded"); });
      }
    });
  }

  // ========== Animate on scroll ==========
  function initAos() {
    var els = document.querySelectorAll("[data-aos]");
    if (!els.length) return;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("aos-visible");
          }
        });
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0.1 }
    );
    els.forEach(function (el) { observer.observe(el); });
  }

  // ========== Scroll-to-top button ==========
  function initScrollToTop() {
    var btn = document.getElementById("scrollToTop");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "scrollToTop";
      btn.className = "scroll-to-top";
      btn.setAttribute("aria-label", "Scroll to top");
      btn.innerHTML = "<i class=\"bi bi-chevron-double-up\"></i>";
      btn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      document.body.appendChild(btn);
    }
    function toggle() {
      if (window.scrollY > 400) btn.classList.add("visible");
      else btn.classList.remove("visible");
    }
    window.addEventListener("scroll", toggle, { passive: true });
    toggle();
  }

  // ========== Page Loader ==========
  function initPageLoader() {
    const loader = document.getElementById("page-loader");
    if (!loader) return;
    function hide() {
      loader.classList.add("hidden");
      setTimeout(function () {
        loader.remove();
      }, 600);
    }
    if (document.readyState === "complete") {
      setTimeout(hide, 150);
    } else {
      window.addEventListener("load", function () { setTimeout(hide, 150); });
    }
  }

  // ========== Init on DOM ready ==========
  function init() {
    initPageLoader();
    initNavbar();
    initSmoothScroll();
    initScrollToTop();
    initReadingProgress();
    initAos();
    initLazyImages();
    initContactForm();
    initCookieConsent();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
