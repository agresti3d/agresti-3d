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
    el: ["figuras", "escritorio", "mates", "juguetes"],
    ella: ["deco", "floreros", "macetas", "cocina", "mates"],
    chicos: ["juguetes", "figuras", "escritorio"],
    hogar: ["hogar", "deco", "cocina"],
    cualquiera: [],
  };
  const raicesPorOcasion = {
    cumple: ["figuras", "juguetes", "deco"],
    aniversario: ["deco", "floreros", "mates"],
    laboral: ["escritorio", "utensilios", "organizadores"],
    especial: ["figuras", "deco"],
    cualquiera: [],
  };

  const categorias = [];
  const construirCategorias = () => {
    if (categorias.length) return;
    const lista = window.AGRESTI_CATALOG_DATA?.categorias || [];
    const mapa = new Map(lista.map((c) => [c.id, c]));
    const raiz = (id) => {
      let actual = mapa.get(id);
      let guard = 0;
      while (actual?.padre && guard < 20) {
        actual = mapa.get(actual.padre);
        guard += 1;
      }
      return actual?.id || id;
    };
    lista.forEach((c) => categorias.push({ id: c.id, raiz: raiz(c.id) }));
  };

  const perteneceA = (categoriaId, raices) => {
    if (!raices.length) return false;
    construirCategorias();
    const item = categorias.find((c) => c.id === categoriaId);
    return Boolean(item && raices.includes(item.raiz));
  };

  const buscar = () => {
    if (!productos.length) actualizarCatalogo();
    const quien = document.getElementById("giftWho")?.value || "cualquiera";
    const ocasion = document.getElementById("giftOccasion")?.value || "cualquiera";
    const presupuesto = document.getElementById("giftBudget")?.value || "cualquiera";
    const [desde, hasta] = presupuesto === "cualquiera" ? [null, null] : presupuesto.split("-").map(Number);
    const raicesPersona = raicesPorPersona[quien] || [];
    const raicesOcasion = raicesPorOcasion[ocasion] || [];

    const puntuados = productos.map((producto) => {
      let puntos = 0;
      const categoriasProducto = Array.isArray(producto.categorias) && producto.categorias.length
        ? producto.categorias
        : [producto.categoria];
      if (categoriasProducto.some((id) => perteneceA(id, raicesPersona))) puntos += 3;
      if (categoriasProducto.some((id) => perteneceA(id, raicesOcasion))) puntos += 2;
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

    let elegidos = puntuados.filter((item) => item.puntos > 0).sort((a, b) => b.puntos - a.puntos).slice(0, 6);
    if (!elegidos.length) {
      elegidos = puntuados
        .filter((item) => item.producto.precio)
        .sort((a, b) => (precioNumero(a.producto.precio) || 0) - (precioNumero(b.producto.precio) || 0))
        .slice(0, 3);
    }

    if (!elegidos.length) {
      resultados.innerHTML = '<p class="gift-results__empty">No encontré una combinación exacta. Probá con otro presupuesto o pedime algo a medida.</p>';
      return;
    }

    resultados.innerHTML = `
      <p class="gift-results__count">${elegidos.length} ${elegidos.length === 1 ? "idea" : "ideas"} para regalar</p>
      <div class="gift-results__grid">
        ${elegidos
          .map(({ producto }) => {
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
})();
