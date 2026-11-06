// ==========================================================================
// Agresti.3D — interacción del sitio
// ==========================================================================

const whatsappDialog = document.getElementById("whatsappDialog");
const whatsappChoices = document.getElementById("whatsappChoices");
const whatsappStatus = document.getElementById("whatsappStatus");
let whatsappCatalogPromise;

const escapeHTML = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));

const loadWhatsAppBranches = () => {
  if (!whatsappCatalogPromise) {
    whatsappCatalogPromise = fetch("data/catalog.json", { cache: "no-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((catalog) => {
        if (Array.isArray(catalog.sucursales)) return catalog.sucursales;
        if (
          catalog &&
          typeof catalog === "object" &&
          !Array.isArray(catalog) &&
          !("sucursales" in catalog) &&
          typeof SHOP !== "undefined" &&
          SHOP.whatsapp
        ) {
          return [{
            nombre: "Buenos Aires",
            localidad: "Buenos Aires",
            telefono: SHOP.whatsapp,
          }];
        }
        throw new Error("El catálogo no incluye sucursales de WhatsApp.");
      })
      .catch((error) => {
        whatsappCatalogPromise = null;
        throw error;
      });
  }
  return whatsappCatalogPromise;
};

const renderWhatsAppChoices = (branches, message, allowedBranchIds, emptyMessage) => {
  const readyBranches = branches
    .filter((branch) => branch && typeof branch === "object")
    .map((branch) => ({
      id: String(branch.id || ""),
      nombre: String(branch.nombre || "").trim(),
      localidad: String(branch.localidad || "").trim(),
      telefono: String(branch.telefono || "").replace(/\D/g, ""),
    }))
    .filter((branch) =>
      branch.nombre &&
      branch.localidad &&
      /^\d{8,15}$/.test(branch.telefono)
    )
    .filter((branch) => !allowedBranchIds || allowedBranchIds.has(branch.id));

  if (!readyBranches.length) {
    whatsappStatus.textContent = allowedBranchIds
      ? emptyMessage
      : "Todavía no hay sucursales completas. Agregá nombre, localidad y WhatsApp desde el editor del catálogo.";
    return;
  }

  whatsappStatus.textContent = "";
  whatsappChoices.innerHTML = readyBranches.map((branch) => `
    <a class="wa-choice" href="https://wa.me/${branch.telefono}?text=${encodeURIComponent(message)}" target="_blank" rel="noopener">
      <span class="wa-choice__meta">
        <strong>${escapeHTML(branch.nombre)}</strong>
        <small>${escapeHTML(branch.localidad)}</small>
      </span>
      <span class="wa-choice__action">
        Escribir
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </span>
    </a>
  `).join("");
};

const requestWhatsApp = (message, allowedBranchIds = null, emptyMessage = "") => {
  if (!whatsappDialog || !whatsappChoices || !whatsappStatus) {
    console.error("[WhatsApp] No se encontró el selector de sucursal.");
    return;
  }

  whatsappChoices.replaceChildren();
  whatsappStatus.textContent = "Cargando sucursales…";
  if (!whatsappDialog.open) whatsappDialog.showModal();

  loadWhatsAppBranches()
    .then((branches) => renderWhatsAppChoices(branches, message, allowedBranchIds, emptyMessage))
    .catch((error) => {
      console.error("[WhatsApp] No se pudieron cargar las sucursales.", error);
      whatsappStatus.textContent =
        "No pudimos cargar las sucursales. Revisá tu conexión e intentá de nuevo.";
    });
};

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !whatsappDialog?.open) return;
  event.preventDefault();
  whatsappDialog.close();
});

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-wa-message]");
  if (!trigger) return;
  event.preventDefault();
  event.stopPropagation();
  const allowedBranchIds = trigger.hasAttribute("data-wa-branches")
    ? new Set(trigger.dataset.waBranches.split(",").filter(Boolean))
    : null;
  requestWhatsApp(
    trigger.dataset.waMessage || "¡Hola Agresti.3D! Quiero hacer una consulta.",
    allowedBranchIds,
    trigger.dataset.waEmptyMessage || "Este producto no está disponible en ninguna sucursal con WhatsApp configurado."
  );
});

// ---------- 1. Header con borde al hacer scroll ----------
const header = document.getElementById("header");

if (header) {
  const onScroll = () => {
    header.dataset.stuck = window.scrollY > 8 ? "true" : "false";
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

// ---------- 2. Menú móvil ----------
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");

if (nav && navToggle) {
  navToggle.addEventListener("click", () => {
    const open = nav.dataset.open === "true";
    nav.dataset.open = String(!open);
    navToggle.setAttribute("aria-expanded", String(!open));
    navToggle.setAttribute("aria-label", open ? "Abrir menú" : "Cerrar menú");
  });

  // Cerrar al tocar un link
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      nav.dataset.open = "false";
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  // Cerrar con Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.dataset.open === "true") {
      nav.dataset.open = "false";
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.focus();
    }
  });
}

// ---------- 3. Aparición al hacer scroll ----------
const revealables = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );
  revealables.forEach((el) => io.observe(el));

  // El catálogo dibuja las fichas después de cargar: les da la misma animación.
  window.AGRESTI = { reveal: (nodo) => io.observe(nodo) };
} else {
  revealables.forEach((el) => el.classList.add("is-visible"));
}

// ---------- 4. Link activo según la sección visible ----------
const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".nav__link")];

if ("IntersectionObserver" in window && sections.length) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const matches = link.getAttribute("href") === `#${entry.target.id}`;
          if (matches) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));
}

// ---------- 5. Formulario → WhatsApp ----------
const form = document.getElementById("quoteForm");

if (form) {
  const fields = ["name", "contact", "kind", "details"]
    .map((id) => form.querySelector(`#${id}`))
    .filter(Boolean);

  const messages = {
    name: "Poné tu nombre.",
    contact: "Dejanos un email o WhatsApp.",
    kind: "Elegí qué querés.",
    details: "Contanos un poco más.",
  };

  const clearError = (field) => {
    field.removeAttribute("aria-invalid");
    const error = document.getElementById(`${field.id}-error`);
    if (error) error.textContent = "";
  };

  fields.forEach((field) => {
    field.addEventListener("input", () => clearError(field));
    field.addEventListener("change", () => clearError(field));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(form);
    let firstInvalid = null;

    fields.forEach((field) => {
      const value = (data.get(field.name) || "").toString().trim();

      if (!value) {
        field.setAttribute("aria-invalid", "true");
        const error = document.getElementById(`${field.id}-error`);
        if (error) error.textContent = messages[field.id];
        if (!firstInvalid) firstInvalid = field;
      } else {
        clearError(field);
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const nombre = (data.get("name") || "").toString().trim();
    const contacto = (data.get("contact") || "").toString().trim();
    const tipo = (data.get("kind") || "").toString().trim();
    const detalle = (data.get("details") || "").toString().trim();

    const mensaje = [
      "¡Hola Agresti.3D! Quiero hacer un pedido.",
      "",
      `*Nombre:* ${nombre}`,
      `*Contacto:* ${contacto}`,
      `*Qué quiere:* ${tipo}`,
      "",
      `*Detalle:* ${detalle}`,
    ].join("\n");

    requestWhatsApp(mensaje);
  });
}

// ---------- 6. Año del footer ----------
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// ---------- 7. Ocultar el flotante cuando el formulario está a la vista ----------
const quoteSection = document.getElementById("pedido");

if (quoteSection && "IntersectionObserver" in window) {
  const quoteObserver = new IntersectionObserver(
    ([entry]) => {
      document.body.classList.toggle("is-quote-visible", entry.isIntersecting);
    },
    { threshold: 0.2 }
  );
  quoteObserver.observe(quoteSection);
}

// ---------- 8. Sin zoom por pellizco (Safari iOS) ----------
// El viewport y touch-action cubren el resto de los navegadores; Safari en iOS
// sigue escuchando estos gestos aunque user-scalable esté en no.
["gesturestart", "gesturechange", "gestureend"].forEach((gesto) => {
  document.addEventListener(gesto, (evento) => evento.preventDefault(), { passive: false });
});
