(() => {
  const $ = (selector) => document.querySelector(selector);
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[char]));

  document.body.classList.add("has-js");

  // Menú mobile
  const menu = $("#landingMenu");
  const nav = $("#landingNav");
  menu?.addEventListener("click", () => {
    const abierto = nav?.dataset.open !== "true";
    if (abierto) nav.dataset.open = "true";
    else nav?.removeAttribute("data-open");
    menu.setAttribute("aria-expanded", String(abierto));
  });
  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    nav.removeAttribute("data-open");
    menu?.setAttribute("aria-expanded", "false");
  }));

  // Carga de catálogo real para los destacados y contadores
  fetch("data/catalog.json", { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((catalog) => {
      const productos = Array.isArray(catalog.productos) ? catalog.productos : [];
      const sucursales = Array.isArray(catalog.sucursales) ? catalog.sucursales : [];
      const destacados = productos
        .filter((producto) => producto && producto.nombre && Array.isArray(producto.imagenes) && producto.imagenes[0]?.src)
        .slice(0, 8);

      const track = $("#picksTrack");
      if (track) {
        track.innerHTML = destacados.map((producto) => {
          const foto = producto.imagenes[0];
          const url = `/#p=${encodeURIComponent(producto.id)}`;
          return `<article class="pick-card">
            <a class="pick-card__image" href="${url}" aria-label="Ver ${esc(producto.nombre)}">
              <img src="${esc(foto.src)}" alt="${esc(foto.alt || producto.nombre)}" loading="lazy" width="500" height="500">
            </a>
            <div class="pick-card__body">
              <div><h3>${esc(producto.nombre)}</h3><small>${esc(producto.precio || "A consultar")}</small></div>
              <a class="pick-card__arrow" href="${url}" aria-label="Ver ${esc(producto.nombre)}">→</a>
            </div>
          </article>`;
        }).join("");
      }

      const kpiProductos = $("#kpiProducts");
      const kpiSucursales = $("#kpiBranches");
      if (kpiProductos) kpiProductos.textContent = String(productos.length);
      if (kpiSucursales) kpiSucursales.textContent = String(sucursales.length);
    })
    .catch(() => {
      const track = $("#picksTrack");
      if (track) {
        track.innerHTML = '<p class="landing-kicker">No pudimos cargar los destacados. <a href="/">Ver catálogo completo</a>.</p>';
      }
    });

  // Flechas del carrusel
  const track = $("#picksTrack");
  document.querySelectorAll("[data-picks]").forEach((boton) => {
    boton.addEventListener("click", () => {
      if (!track) return;
      track.scrollBy({ left: Number(boton.dataset.picks) * 270, behavior: "smooth" });
    });
  });

  // Aparición suave
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealables = document.querySelectorAll("[data-reveal]");
  if (reduce || !("IntersectionObserver" in window)) {
    revealables.forEach((nodo) => nodo.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    revealables.forEach((nodo) => observer.observe(nodo));
  }
})();
