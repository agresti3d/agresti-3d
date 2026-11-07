(() => {
  const dialogo = document.getElementById("giftDialog");
  if (!dialogo) return;
  const resultados = document.getElementById("giftResults");
  const abrir = () => {
    if (typeof dialogo.showModal === "function") dialogo.showModal();
    else dialogo.setAttribute("open", "");
  };
  const cerrar = () => {
    if (typeof dialogo.close === "function") dialogo.close();
    else dialogo.removeAttribute("open");
  };
  document.querySelectorAll("[data-gift-open]").forEach((boton) => {
    boton.addEventListener("click", abrir);
  });
  document.querySelectorAll("[data-gift-close]").forEach((elemento) => {
    elemento.addEventListener("click", () => cerrar());
  });
  dialogo.addEventListener("click", (evento) => {
    if (evento.target === dialogo) cerrar();
  });

  let productos = [];
  let giftKey = "";
  let giftOffset = 0;
  let giftResultados = [];
  const actualizarCatalogo = () => {
    productos = Array.isArray(window.AGRESTI_CATALOG_DATA?.productos)
      ? window.AGRESTI_CATALOG_DATA.productos
      : [];
  };
  actualizarCatalogo();
  window.addEventListener("agresti:catalog-loaded", actualizarCatalogo);

  const esc = (valor) =>
    String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const precioNumero = (texto) => {
    if (typeof texto !== "string") return null;
    const digitos = texto.replace(/[^\d]/g, "");
    return digitos ? Number(digitos) : null;
  };

  const raicesPorPersona = {
    el: ["figuras", "escritorio", "mates", "juguetes", "funko-pop", "accesorios", "llaveros", "cosplay-disfraces"],
    ella: ["deco", "floreros", "macetas", "cocina", "mates", "accesorios", "estilo-crochet", "adornos"],
    chicos: ["juguetes", "figuras", "funko-pop", "llaveros", "juegos-de-mesa", "accesorios"],
    hogar: ["hogar", "deco", "cocina", "adornos", "floreros", "macetas", "portalatas", "utensilios"],
    cualquiera: [],
  };
  const raicesPorOcasion = {
    cumple: ["figuras", "juguetes", "funko-pop", "deco", "accesorios"],
    aniversario: ["deco", "floreros", "mates", "adornos"],
    laboral: ["escritorio", "utensilios", "portalatas", "organizadores"],
    especial: ["figuras", "deco", "floreros", "adornos"],
    cualquiera: [],
  };

  const categorias = [];
  const construirCategorias = () => {
    if (categorias.length) return;
    const lista = window.AGRESTI_CATALOG_DATA?.categorias || [];
    const mapa = new Map(lista.map((c) => [c.id, c]));
    const camino = (id) => {
      const ids = [];
      let actual = mapa.get(id);
      let guard = 0;
      while (actual && guard < 20) {
        ids.unshift(actual.id);
        actual = mapa.get(actual.padre);
        guard += 1;
      }
      return ids.length ? ids : [id];
    };
    lista.forEach((c) => categorias.push({ id: c.id, camino: camino(c.id) }));
  };

  const perteneceA = (categoriaId, raices) => {
    if (!raices.length) return false;
    construirCategorias();
    const item = categorias.find((c) => c.id === categoriaId);
    return Boolean(item && item.camino.some((id) => raices.includes(id)));
  };

  const buscar = () => {
    if (!productos.length) actualizarCatalogo();
    const quien = document.getElementById("giftWho")?.value || "cualquiera";
    const ocasion = document.getElementById("giftOccasion")?.value || "cualquiera";
    const presupuesto = document.getElementById("giftBudget")?.value || "cualquiera";
    const [desde, hasta] = presupuesto === "cualquiera" ? [null, null] : presupuesto.split("-").map(Number);
    const raicesPersona = raicesPorPersona[quien] || [];
    const raicesOcasion = raicesPorOcasion[ocasion] || [];
    const clave = `${quien}|${ocasion}|${presupuesto}`;
    const cambio = clave !== giftKey;
    if (cambio) {
      giftKey = clave;
      giftOffset = 0;
    }

    const puntuados = productos.map((producto) => {
      let puntos = 0;
      const categoriasProducto = Array.isArray(producto.categorias) && producto.categorias.length
        ? producto.categorias
        : [producto.categoria];
      const publico = Array.isArray(producto.publico) ? producto.publico : [];
      const ocasiones = Array.isArray(producto.ocasiones) ? producto.ocasiones : [];
      const publicoOk =
        quien === "cualquiera" ||
        !publico.length ||
        publico.includes(quien) ||
        publico.includes("cualquiera");
      const ocasionOk =
        ocasion === "cualquiera" ||
        !ocasiones.length ||
        ocasiones.includes(ocasion);
      if (!publicoOk || !ocasionOk) return { producto, puntos: -99 };
      if (quien !== "cualquiera") {
        if (publico.length) puntos += 3;
        else if (categoriasProducto.some((id) => perteneceA(id, raicesPersona))) puntos += 3;
      }
      if (ocasion !== "cualquiera") {
        if (ocasiones.length) puntos += 2;
        else if (categoriasProducto.some((id) => perteneceA(id, raicesOcasion))) puntos += 2;
      }
      const precio = precioNumero(producto.precio);
      if (precio === null) {
        if (presupuesto === "cualquiera") puntos += 1;
      } else if (desde !== null && precio >= desde && precio <= hasta) {
        puntos += 3;
      } else if (desde !== null) {
        puntos -= 2;
      }
      return { producto, puntos };
    });

    const coincidencias = puntuados
      .filter((item) => item.puntos > 0)
      .sort((a, b) => b.puntos - a.puntos);
    const respaldo = puntuados
      .filter((item) => item.producto.precio && item.puntos <= 0)
      .sort((a, b) => (precioNumero(a.producto.precio) || 0) - (precioNumero(b.producto.precio) || 0));
    const sinCriterios =
      quien === "cualquiera" && ocasion === "cualquiera" && presupuesto === "cualquiera";
    giftResultados = sinCriterios
      ? [...productos]
      : (coincidencias.length ? coincidencias : respaldo).map((item) => item.producto);

    if (!giftResultados.length) {
      resultados.innerHTML = '<p class="gift-results__empty">No encontré una combinación exacta. Probá con otro presupuesto o pedime algo a medida.</p>';
      return;
    }

    if (!cambio && giftResultados.length > 1) {
      giftOffset += 6;
      if (giftOffset >= giftResultados.length) {
        giftOffset = 0;
        giftResultados = [...giftResultados].sort(() => Math.random() - 0.5);
      }
    }
    const pagina = giftResultados.slice(giftOffset, giftOffset + 6);
    const boton = document.getElementById("giftSearch");
    if (boton) boton.textContent = "Más ideas";
    resultados.innerHTML = `
      <p class="gift-results__count">${pagina.length} ${pagina.length === 1 ? "idea" : "ideas"} para regalar${giftResultados.length > 6 ? ` · ${giftOffset + 1}–${Math.min(giftOffset + 6, giftResultados.length)} de ${giftResultados.length}` : ""}</p>
      <div class="gift-results__grid">
        ${pagina
          .map((producto) => {
            const foto = producto.imagenes?.[0]?.src || "";
            return `<a class="gift-card" href="#p=${encodeURIComponent(producto.id)}" data-gift-result>
              ${foto ? `<img src="${esc(foto)}" alt="${esc(producto.nombre)}" loading="lazy">` : ""}
              <span class="gift-card__name">${esc(producto.nombre)}</span>
              <span class="gift-card__price">${esc(producto.precio || "A consultar")}</span>
            </a>`;
          })
          .join("")}
      </div>`;
    resultados.querySelectorAll("[data-gift-result]").forEach((enlace) => {
      enlace.addEventListener("click", () => cerrar());
    });
  };

  document.getElementById("giftSearch")?.addEventListener("click", buscar);

  ["giftWho", "giftOccasion", "giftBudget"].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", () => {
      giftKey = "";
      giftOffset = 0;
      const boton = document.getElementById("giftSearch");
      if (boton) boton.textContent = "Ver ideas";
    });
  });
})();
