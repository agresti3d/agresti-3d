// ==========================================================================
// Agresti.3D — catálogo dinámico y favoritos
// ==========================================================================
// Las categorías y los productos viven en data/catalog.json.
// Este archivo los dibuja, resuelve la navegación por ramas y guarda favoritos
// en el navegador (sin cuentas, sin servidor).
// Guía para editar el catálogo: docs/catalogo.md
// ==========================================================================

(() => {
  "use strict";

  const FAV_KEY = "agresti:favoritos";
  const PAGE_SIZE = 9;
  const HISTORY_RETURN_KEY = "agrestiCatalogReturn";
  const HISTORY_PRODUCT_KEY = "agrestiProductEntry";

  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const el = {
    filters: document.getElementById("filters"),
    catalogNav: document.getElementById("catalogNav"),
    sectionHead: document.querySelector("#productos .section__head"),
    crumbs: document.getElementById("breadcrumbs"),
    categoryOverview: document.getElementById("categoryOverview"),
    categoryGrid: document.getElementById("categoryGrid"),
    detail: document.getElementById("productDetail"),
    productsNote: document.querySelector("#productos .products__note"),
    status: document.getElementById("filterStatus"),
    pagination: document.getElementById("catalogPagination"),
    paginationStatus: document.getElementById("paginationStatus"),
    favToggle: document.getElementById("favToggle"),
    favCount: document.getElementById("favCount"),
    actions: document.getElementById("catalogActions"),
    favOrder: document.getElementById("favOrder"),
    search: document.getElementById("catalogSearch"),
    searchClear: document.getElementById("catalogSearchClear"),
    suggestions: document.getElementById("catalogSuggestions"),
    priceFilter: document.getElementById("catalogPriceFilter"),
    availabilityFilter: document.getElementById("catalogAvailabilityFilter"),
    filtersClear: document.getElementById("catalogFiltersClear"),
  };

  let categorias = [];
  let productos = [];
  let sucursales = [];
  let catPorId = new Map();
  let hijosDe = new Map();
  let conProductos = new Map();
  let fotosTemporada = [];
  let ruta = [];
  let paginaActual = 0;
  let ordenCatalogo = "relevancia";
  let busqueda = "";
  let filtroPrecio = "";
  let filtroDisponibilidad = "";
  let verFavoritos = false;
  let favoritos = new Set();

  // ---------- Utilidades ----------
  const esc = (valor) =>
    String(valor).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));

  const normalizar = (texto) =>
    String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const coincideBusqueda = (producto, termino) => {
    const categoria = catPorId.get(producto.categoria);
    return normalizar(
      [producto.nombre, producto.descripcion, producto.descripcionLarga, categoria?.nombre].join(" ")
    ).includes(termino);
  };

  const tieneStock = (producto) => {
    const stock = producto.stockPorSucursal;
    if (!stock || typeof stock !== "object" || Array.isArray(stock)) return false;
    return Object.values(stock).some((cantidad) => Number.isInteger(cantidad) && cantidad > 0);
  };

  const estaSinStock = (producto) => {
    const stock = producto.stockPorSucursal;
    if (!stock || typeof stock !== "object" || Array.isArray(stock)) return false;
    const cantidades = Object.values(stock).filter((cantidad) => Number.isInteger(cantidad));
    return cantidades.length > 0 && cantidades.every((cantidad) => cantidad === 0);
  };

  const hayFiltrosActivos = () => Boolean(filtroPrecio || filtroDisponibilidad);

  const copiarEstadoActual = () =>
    history.state && typeof history.state === "object" ? { ...history.state } : {};

  const desplazarA = (posicion) => {
    window.scrollTo({
      top: Math.max(0, posicion),
      left: 0,
      behavior: "instant",
    });
  };

  const iconoCorazon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1l8.8 8.8 8.8-8.8a5 5 0 0 0 0-7.1Z"/></svg>`;

  const iconoFlecha = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>`;

  const iconoCarrito = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;

  const hijos = (id) => hijosDe.get(id) || [];

  const nombresDeRuta = (ids) =>
    ids.map((id) => (catPorId.get(id) || {}).nombre || id).join(" › ");

  const sucursalesDe = (producto) => {
    const ids = Array.isArray(producto.sucursalesDisponibles)
      ? new Set(producto.sucursalesDisponibles)
      : null;
    return sucursales.filter((sucursal) => !ids || ids.has(sucursal.id));
  };

  const etiquetaSucursal = (sucursal) => {
    const nombre = String(sucursal.nombre || "").trim();
    const localidad = String(sucursal.localidad || "").trim();
    return localidad && localidad.toLowerCase() !== nombre.toLowerCase()
      ? `${nombre} — ${localidad}`
      : nombre;
  };

  const atributosSucursalesWA = (producto) =>
    Array.isArray(producto.sucursalesDisponibles)
      ? `data-wa-branches="${esc(producto.sucursalesDisponibles.join(","))}" data-wa-empty-message="Este producto no está disponible en ninguna sucursal con WhatsApp configurado."`
      : "";

  // Conjunto de una rama y todo lo que cuelga de ella.
  const ramaCompleta = (id) => {
    const conjunto = new Set();
    const recorrer = (actual) => {
      if (conjunto.has(actual)) return;
      conjunto.add(actual);
      hijos(actual).forEach((h) => recorrer(h.id));
    };
    recorrer(id);
    return conjunto;
  };

  // ---------- Favoritos (localStorage) ----------
  const leerFavoritos = () => {
    try {
      const crudo = localStorage.getItem(FAV_KEY);
      const lista = crudo ? JSON.parse(crudo) : [];
      return new Set(Array.isArray(lista) ? lista.filter((x) => typeof x === "string") : []);
    } catch {
      return new Set();
    }
  };

  const guardarFavoritos = () => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify([...favoritos]));
    } catch {
      /* modo privado o almacenamiento lleno: se pierde al recargar, no rompe nada */
    }
  };

  // ---------- Ruta en la URL (#cat=hogar/cocina) ----------
  const leerRuta = () => {
    if (!location.hash.startsWith("#cat=")) return [];
    const crudo = decodeURIComponent(location.hash.slice(5));
    return crudo.split("/").filter(Boolean);
  };

  // ---------- Un producto puntual en la URL (#p=id) ----------
  // Sirve para el link que viaja en el mensaje de WhatsApp: abre el catálogo
  // en la rama del producto y lo marca para encontrarlo de un vistazo.
  const leerProducto = () =>
    new URLSearchParams(location.hash.replace(/^#/, "")).get("p");

  const urlDe = (producto) => {
    if (location.protocol.startsWith("http")) {
      return new URL(`/productos/${encodeURIComponent(producto.id)}/`, location.href).href;
    }
    const u = new URL(location.href);
    u.pathname = u.pathname.replace(/index\.html$/, "");
    u.search = "";
    u.hash = `p=${encodeURIComponent(producto.id)}`;
    return u.href;
  };

  // Camino desde la raíz del catálogo hasta la categoría del producto.
  const rutaDe = (catId) => {
    const camino = [];
    let actual = catId;
    while (actual && catPorId.has(actual) && !camino.includes(actual)) {
      camino.unshift(actual);
      actual = catPorId.get(actual).padre;
    }
    return camino;
  };

  const irA = (ids) => {
    const base = location.pathname + location.search;
    const destino = ids.length
      ? `${base}#cat=${ids.map(encodeURIComponent).join("/")}`
      : base;

    try {
      history.pushState(null, "", destino);
    } catch {
      location.hash = ids.length ? `cat=${ids.join("/")}` : "";
    }

    ruta = ids.filter((id) => catPorId.has(id));
    verFavoritos = false;
    paginaActual = 0;
    render();
  };

  // ---------- Render ----------
  const render = () => {
    const detalle = productos.find((producto) => producto.id === leerProducto());
    document.body.classList.toggle("is-product-detail", Boolean(detalle));
    if (detalle) {
      if (el.sectionHead) el.sectionHead.hidden = true;
      if (el.catalogNav) el.catalogNav.hidden = true;
      if (el.categoryOverview) el.categoryOverview.hidden = true;
      if (el.pagination) el.pagination.hidden = true;
      if (el.actions) el.actions.hidden = true;
      if (el.productsNote) el.productsNote.hidden = true;
      if (el.detail) {
        el.detail.hidden = false;
        renderDetalle(detalle);
      }
      grid.hidden = true;
      renderFavoritos();
      return;
    }

    if (el.sectionHead) el.sectionHead.hidden = false;
    if (el.catalogNav) el.catalogNav.hidden = false;
    if (el.productsNote) el.productsNote.hidden = false;
    if (el.detail) el.detail.hidden = true;
    renderMigas();
    renderChips();
    const categoriasRaiz = renderCategorias();
    renderProductos(categoriasRaiz);
    renderFavoritos();
  };

  const renderMigas = () => {
    if (!el.crumbs) return;

    if (verFavoritos || ruta.length === 0) {
      el.crumbs.innerHTML = "";
      el.crumbs.hidden = true;
      return;
    }

    const items = ['<li><button type="button" data-crumb="">Todo</button></li>'];

    ruta.forEach((id, i) => {
      const nombre = esc((catPorId.get(id) || {}).nombre || id);
      const esUltima = i === ruta.length - 1;
      const destino = ruta.slice(0, i + 1).join("/");

      items.push(
        esUltima
          ? `<li><span aria-current="page" tabindex="-1">${nombre}</span></li>`
          : `<li><button type="button" data-crumb="${destino}">${nombre}</button></li>`
      );
    });

    el.crumbs.innerHTML = `<ol>${items.join("")}</ol>`;
    el.crumbs.hidden = false;
  };

  const renderChips = () => {
    if (!el.filters) return;

    el.filters.hidden = !verFavoritos && ruta.length === 0;

    const actual = ruta.length ? ruta[ruta.length - 1] : "";
    const nivelDe = (padre) =>
      padre && catPorId.has(padre)
        ? hijos(padre)
        : categorias.filter((c) => !c.padre || !catPorId.has(c.padre));

    let nivel = nivelDe(actual);
    // En una categoría que no tiene subcategorías propias (Mates, Milkshakes…)
    // la tira de filtros quedaría vacía. En ese caso se muestran las hermanas,
    // así se puede seguir filtrando sin volver con la miga de pan.
    if (actual && !nivel.some((c) => conProductos.get(c.id))) {
      nivel = nivelDe((catPorId.get(actual) || {}).padre);
    }

    const opciones = [];

    if (!actual) opciones.push({ id: "", nombre: "Todos" });

    nivel.forEach((c) => {
      if (conProductos.get(c.id)) opciones.push(c);
    });

    const activa = actual;

    el.filters.innerHTML = opciones
      .map((c) => {
        const esActivo = !verFavoritos && c.id === activa;
        return `<button class="chip${esActivo ? " is-active" : ""}" type="button" data-cat="${esc(c.id)}" aria-pressed="${esActivo}">${esc(c.nombre)}</button>`;
      })
      .join("");
  };

  const renderCategorias = () => {
    if (!el.categoryOverview || !el.categoryGrid) return [];

    const raices = categorias
      .filter((c) => !c.padre || !catPorId.has(c.padre))
      .filter((c) => conProductos.get(c.id));

    el.categoryOverview.hidden = verFavoritos || ruta.length > 0 || raices.length === 0 || Boolean(normalizar(busqueda)) || hayFiltrosActivos();
    el.categoryGrid.innerHTML = raices
      .map((categoria) => {
        const ids = ramaCompleta(categoria.id);
        const lista = productos.filter((p) => ids.has(p.categoria));
        const primero = lista[0];
        const foto = primero && fotosDe(primero, productos.indexOf(primero))[0];
        const imagen = foto
          ? `<span class="category-link__visual"><img src="${esc(foto.src)}" alt="" loading="lazy" decoding="async" width="600" height="600"></span>`
          : "";
        const cantidad = `${lista.length} ${lista.length === 1 ? "producto" : "productos"}`;

        return `
          <a class="category-link" href="#cat=${encodeURIComponent(categoria.id)}" data-category-link="${esc(categoria.id)}">
            ${imagen}
            <span class="category-link__content">
              <span class="category-link__title">${esc(categoria.nombre)}</span>
              <span class="category-link__count">${cantidad}</span>
              <span class="category-link__action">Explorar categoría ${iconoFlecha}</span>
            </span>
          </a>`;
      })
      .join("");

    return raices;
  };

  // Todas las fotos del producto, en orden. La de temporada es solo respaldo
  // para el producto que todavía no tiene foto propia.
  const fotosDe = (producto, indice) => {
    const propias = Array.isArray(producto.imagenes) ? producto.imagenes : [];
    const fotos = propias
      .map((f) => (typeof f === "string" ? { src: f, alt: producto.nombre } : f))
      .filter((f) => f && f.src)
      .map((f) => ({ src: f.src, alt: f.alt || producto.nombre }));

    if (fotos.length === 0 && fotosTemporada[indice]) {
      fotos.push({ src: fotosTemporada[indice], alt: producto.nombre });
    }
    return fotos;
  };

  // Videos del producto: MP4, WEBM o MOV guardados desde el editor local.
  const videosDe = (producto) =>
    (Array.isArray(producto.videos) ? producto.videos : [])
      .map((video) =>
        typeof video === "string"
          ? { src: video, title: producto.nombre }
          : video && video.src
            ? { src: video.src, title: video.title || producto.nombre }
            : null
      )
      .filter(Boolean);

  const tarjeta = (producto) => {
    const indice = productos.indexOf(producto);
    const fotos = fotosDe(producto, indice);
    const videos = videosDe(producto);
    const hayGaleria = fotos.length > 1;
    const categoria = catPorId.get(producto.categoria);
    const esFavorito = favoritos.has(producto.id);
    const precio = producto.precio ? esc(producto.precio) : "A consultar";
    const nota = producto.notaPrecio ? `<small>${esc(producto.notaPrecio)}</small>` : "";
    const mensaje =
      `¡Hola Agresti.3D! Me interesa "${producto.nombre}".\n` +
      `${urlDe(producto)}\n\n` +
      `¿Me pasás precio, colores disponibles y plazo?`;
    // Si el nombre ya arranca con el de la categoría ("Despertando a la mañana - Oso"),
    // la etiqueta sobra: repetiría lo mismo dos veces en la misma ficha.
    const tagRepetido =
      categoria &&
      producto.nombre.toLowerCase().startsWith(categoria.nombre.toLowerCase());
    const etiquetaFav = esFavorito
      ? `Quitar ${producto.nombre} de favoritos`
      : `Guardar ${producto.nombre} en favoritos`;
    // La etiqueta de categoría es un botón: al tocarla se abre esa rama del
    // catálogo, como si fuera un filtro. Si el nombre del producto ya arranca
    // con el de la categoría, la etiqueta sobra: repetiría lo mismo.
    const etiqueta =
      categoria && !tagRepetido
        ? `<button class="product__tag" type="button" data-filtro="${esc(categoria.id)}" aria-label="Ver todo lo de ${esc(categoria.nombre)}">${esc(categoria.nombre)}</button>`
        : "";
    const enlaceDetalle = `#p=${encodeURIComponent(producto.id)}`;

    const fotosHtml = fotos
      .map(
        (f, i) =>
          `<img src="${esc(f.src)}" alt="${esc(f.alt)}" loading="lazy" width="600" height="600" data-slide="foto" class="${i === 0 ? "is-activa" : ""}">`
      )
      .join("");

    const galeria = hayGaleria
      ? `
          <button class="product__flecha product__flecha--prev" type="button" data-flecha="-1" aria-label="Foto anterior de ${esc(producto.nombre)}">${iconoFlecha}</button>
          <button class="product__flecha product__flecha--next" type="button" data-flecha="1" aria-label="Foto siguiente de ${esc(producto.nombre)}">${iconoFlecha}</button>
          <span class="product__puntos" aria-hidden="true">${fotos.map((_, i) => `<i class="${i === 0 ? "is-activa" : ""}"></i>`).join("")}</span>
          <span class="sr-only" aria-live="polite" data-contador>Foto 1 de ${fotos.length}</span>`
      : "";

    return `
      <article class="product" data-id="${esc(producto.id)}" data-reveal tabindex="-1">
        <a class="product__detail-hitarea" href="${enlaceDetalle}" aria-label="Ver detalles de ${esc(producto.nombre)}"></a>
        <div class="product__media${hayGaleria ? " product__media--galeria" : ""}" data-galeria>
          <div class="product__fotos">${fotosHtml}</div>
          ${etiqueta}
          <button class="product__fav" type="button" data-fav="${esc(producto.id)}" aria-pressed="${esFavorito}" aria-label="${esc(etiquetaFav)}">${iconoCorazon}</button>
          ${galeria}
          ${videos.length ? '<span class="product__video-tag" aria-hidden="true">▶ Video</span>' : ""}
          <span class="product__marca" aria-hidden="true">AGRESTI.3D</span>
        </div>
        <div class="product__body">
          <h3>${esc(producto.nombre)}</h3>
          <p>${esc(producto.descripcion || "")}</p>
          <div class="product__foot">
            <span class="product__price">${precio}${nota}</span>
            <div class="product__actions">
              <button class="product__cart" type="button" data-add-cart="${esc(producto.id)}" aria-label="Agregar ${esc(producto.nombre)} al carrito" title="Agregar al carrito">${iconoCarrito}</button>
              <a class="btn btn--ghost product__btn" href="#pedido" data-wa-message="${esc(mensaje)}" ${atributosSucursalesWA(producto)} aria-label="Pedir ${esc(producto.nombre)} por WhatsApp">Pedir</a>
            </div>
          </div>
        </div>
      </article>`;
  };


  const VISTOS_KEY = "agresti:vistos";

  const leerVistos = () => {
    try {
      const crudo = localStorage.getItem(VISTOS_KEY);
      const lista = crudo ? JSON.parse(crudo) : [];
      return Array.isArray(lista) ? lista.filter((id) => typeof id === "string") : [];
    } catch {
      return [];
    }
  };

  const registrarVisto = (id) => {
    try {
      const lista = [id, ...leerVistos().filter((otro) => otro !== id)].slice(0, 8);
      localStorage.setItem(VISTOS_KEY, JSON.stringify(lista));
    } catch {
      /* modo privado: no se guarda, no rompe */
    }
  };

  const miniProducto = (producto) => {
    const foto = fotosDe(producto, productos.indexOf(producto))[0];
    const categoria = catPorId.get(producto.categoria);
    return `<a class="mini-product" href="#p=${encodeURIComponent(producto.id)}">
      ${foto ? `<img src="${esc(foto.src)}" alt="${esc(foto.alt || producto.nombre)}" loading="lazy" width="300" height="300">` : ""}
      <span>${esc(producto.nombre)}</span>
      <small>${esc(producto.precio || "A consultar")}${categoria ? ` · ${esc(categoria.nombre)}` : ""}</small>
    </a>`;
  };

  const sugerenciasProducto = (producto) => {
    const raiz = rutaDe(producto.categoria)[0] || producto.categoria;
    const otros = productos.filter((item) => item.id !== producto.id);
    const mismaCategoria = otros.filter((item) => item.categoria === producto.categoria);
    const mismaRaiz = otros.filter(
      (item) => item.categoria !== producto.categoria && (rutaDe(item.categoria)[0] || item.categoria) === raiz
    );
    const resto = otros.filter(
      (item) => !mismaCategoria.includes(item) && !mismaRaiz.includes(item)
    );
    const vistos = leerVistos()
      .map((id) => productos.find((item) => item.id === id))
      .filter((item) => item && item.id !== producto.id)
      .slice(0, 4);
    return {
      relacionados: [...mismaCategoria, ...mismaRaiz, ...resto].slice(0, 3),
      vistos,
    };
  };

  const renderDetalle = (producto) => {
    if (!el.detail) return;
    const indice = productos.indexOf(producto);
    const fotos = fotosDe(producto, indice);
    const videos = videosDe(producto);
    const totalSlides = fotos.length + videos.length;
    const hayGaleria = totalSlides > 1;
    const categoria = catPorId.get(producto.categoria);
    const precio = producto.precio ? esc(producto.precio) : "A consultar";
    const nota = producto.notaPrecio ? `<small>${esc(producto.notaPrecio)}</small>` : "";
    const descripcion =
      producto.descripcionLarga ||
      producto.descripcion ||
      "Todavía no cargamos una descripción ampliada de este producto. Escribinos por WhatsApp y te ayudamos.";
    const detalles = producto.detalles && typeof producto.detalles === "object"
      ? producto.detalles
      : {};
    const especificaciones = [
      ["Altura", detalles.altura],
      ["Ancho", detalles.ancho],
      ["Largo", detalles.largo],
      ["Dimensiones", detalles.dimensiones],
      ["Peso", detalles.peso],
      ["Material", detalles.material],
      ["Colores disponibles", detalles.colores],
      ["Capacidad o tamaño", detalles.capacidad],
      ["Opciones y personalización", detalles.personalizacion],
      ["Contenido", detalles.contenido],
      ["Cuidados y uso", detalles.cuidados],
    ].filter(([, valor]) => typeof valor === "string" && valor.trim());
    const specsHtml = especificaciones.length
      ? `<dl class="product-detail__specs">${especificaciones
          .map(([nombre, valor]) => `<div><dt>${nombre}</dt><dd>${esc(valor.trim())}</dd></div>`)
          .join("")}</dl>`
      : "";
    const sucursalesDisponibles = sucursalesDe(producto);
    const stockPorSucursal =
      producto.stockPorSucursal &&
      typeof producto.stockPorSucursal === "object" &&
      !Array.isArray(producto.stockPorSucursal)
        ? producto.stockPorSucursal
        : {};
    const etiquetaConStock = (sucursal) => {
      const base = etiquetaSucursal(sucursal);
      const cantidad = stockPorSucursal[sucursal.id];
      if (!Number.isInteger(cantidad)) return base;
      if (cantidad === 0) return `${base} (sin stock)`;
      return `${base} (${cantidad} ${cantidad === 1 ? "disponible" : "disponibles"})`;
    };
    const disponibilidadHtml = `
      <p class="product-detail__availability"><strong>Sucursales disponibles:</strong> ${
        sucursalesDisponibles.length
          ? sucursalesDisponibles.map(etiquetaConStock).filter(Boolean).map(esc).join(", ")
          : "Ninguna por el momento."
      }</p>`;
    const resenas = Array.isArray(producto.resenas)
      ? producto.resenas.filter((resena) => resena && (resena.nombre || resena.texto))
      : [];
    const estrellas = (rating) => {
      const valor = Math.max(1, Math.min(5, Number(rating) || 5));
      return "★".repeat(valor) + "☆".repeat(5 - valor);
    };
    const resenasHtml = resenas.length
      ? `<section class="product-detail__reviews" aria-labelledby="reviewsTitle-${esc(producto.id)}">
          <h3 id="reviewsTitle-${esc(producto.id)}">Reseñas de clientes <span>(${resenas.length})</span></h3>
          <ul>${resenas
            .map(
              (resena) => `<li class="product-review">
                ${resena.foto ? `<img src="${esc(resena.foto)}" alt="Foto de la reseña de ${esc(resena.nombre || "un cliente")}" loading="lazy">` : ""}
                <div>
                  <strong>${esc(resena.nombre || "Cliente")}</strong>
                  <span class="product-review__stars" aria-label="${Number(resena.rating) || 5} de 5 estrellas">${estrellas(resena.rating)}</span>
                  ${resena.texto ? `<p>${esc(resena.texto)}</p>` : ""}
                  ${resena.fecha ? `<small>${esc(resena.fecha)}</small>` : ""}
                </div>
              </li>`
            )
            .join("")}</ul>
        </section>`
      : "";
    const formResenaHtml = `
      <details class="product-review-form">
        <summary>Dejá tu reseña</summary>
        <form data-review-form data-producto-id="${esc(producto.id)}" novalidate>
          <p class="product-review-form__intro">¿Ya lo tenés? Contanos cómo te fue. La revisamos antes de publicarla.</p>
          <div class="product-review-form__row">
            <label>Nombre<input name="nombre" type="text" maxlength="80" required autocomplete="name"></label>
            <label>Calificación
              <select name="rating">${[5,4,3,2,1].map((n) => `<option value="${n}">${"★".repeat(n)}${"☆".repeat(5 - n)}</option>`).join("")}</select>
            </label>
          </div>
          <label>Tu experiencia<textarea name="texto" rows="3" maxlength="600" required placeholder="Qué te gustó, cómo llegó, cómo lo usás…"></textarea></label>
          <label>Foto (opcional)<input name="foto" type="file" accept="image/jpeg,image/png,image/webp,image/heic"></label>
          <p class="product-review-form__status" data-review-status role="status" aria-live="polite"></p>
          <button class="btn btn--ghost" type="submit">Enviar reseña</button>
        </form>
      </details>`;
    const variantes = Array.isArray(producto.variantes)
      ? producto.variantes.filter((variante) => variante && variante.nombre)
      : [];
    const variantesHtml = variantes.length
      ? `<div class="product-detail__variants"><strong>Opciones disponibles:</strong><ul>${variantes
          .map(
            (variante) =>
              `<li>${esc(variante.nombre)}${
                variante.precio ? ` · ${esc(variante.precio)}` : ""
              }</li>`
          )
          .join("")}</ul></div>`
      : "";

    const poster = fotos.length ? ` poster="${esc(fotos[0].src)}"` : "";
    const slidesHtml = [
      ...fotos.map(
        (foto, i) =>
          `<img src="${esc(foto.src)}" alt="${esc(foto.alt)}" loading="${i === 0 ? "eager" : "lazy"}" width="600" height="600" data-slide="foto" class="${i === 0 ? "is-activa" : ""}">`
      ),
      ...videos.map(
        (video, i) => `
          <div class="product__video-slide${fotos.length === 0 && i === 0 ? " is-activa" : ""}" data-slide="video">
            <video src="${esc(video.src)}" controls playsinline preload="metadata"${poster} aria-label="${esc(video.title)}"></video>
          </div>`
      ),
    ].join("");
    const galeria = hayGaleria
      ? `
          <button class="product__flecha product__flecha--prev" type="button" data-flecha="-1" aria-label="Foto o video anterior de ${esc(producto.nombre)}">${iconoFlecha}</button>
          <button class="product__flecha product__flecha--next" type="button" data-flecha="1" aria-label="Foto o video siguiente de ${esc(producto.nombre)}">${iconoFlecha}</button>
          <span class="product__puntos" aria-hidden="true">${Array.from({ length: totalSlides }, (_, i) => `<i class="${i === 0 ? "is-activa" : ""}"></i>`).join("")}</span>
          <span class="sr-only" aria-live="polite" data-contador>${
            fotos.length ? `Foto 1 de ${fotos.length}` : `Video 1 de ${videos.length}`
          }</span>`
      : "";
    const esFavorito = favoritos.has(producto.id);
    const etiquetaFav = esFavorito
      ? `Quitar ${producto.nombre} de favoritos`
      : `Guardar ${producto.nombre} en favoritos`;
    const mensaje =
      `¡Hola Agresti.3D! Me interesa "${producto.nombre}".\n` +
      `${urlDe(producto)}\n\n` +
      `¿Me pasás precio, colores disponibles y plazo?`;
    const rutaCategoria = rutaDe(producto.categoria)
      .map(encodeURIComponent)
      .join("/");
    const { relacionados, vistos } = sugerenciasProducto(producto);
    const sinStock = estaSinStock(producto);
    const alertaStockHtml = sinStock
      ? `<section class="stock-alert" id="stockAlert" aria-labelledby="stockAlertTitle">
          <h3 id="stockAlertTitle">Sin stock por ahora</h3>
          <p>Dejanos tu email o WhatsApp y te avisamos cuando lo repongamos.</p>
          <form data-stock-form data-producto-id="${esc(producto.id)}" novalidate>
            <label class="sr-only" for="stockContact">Email o WhatsApp</label>
            <input id="stockContact" name="contacto" type="text" autocomplete="email" placeholder="tu@email.com o 11 5555-5555" required>
            <button class="btn btn--ghost" type="submit">Avísame</button>
            <p class="stock-alert__status" data-stock-status role="status" aria-live="polite"></p>
          </form>
        </section>`
      : "";
    const stickyHtml = `<div class="product-sticky" aria-label="Compra rápida">
      <div class="product-sticky__price">${precio}${nota}</div>
      <div class="product-sticky__actions">
        ${sinStock
          ? `<a class="btn btn--primary" href="#stockAlert">Avísame</a>`
          : `<button class="btn btn--ghost" type="button" data-add-cart="${esc(producto.id)}" aria-label="Agregar ${esc(producto.nombre)} al carrito">${iconoCarrito} Carrito</button>
             <a class="btn btn--primary" href="#pedido" data-wa-message="${esc(mensaje)}" ${atributosSucursalesWA(producto)}>WhatsApp</a>`}
      </div>
    </div>`;
    const relacionadosHtml = relacionados.length
      ? `<section class="product-suggestions" aria-labelledby="relacionadosTitle">
          <h3 id="relacionadosTitle">También te puede gustar</h3>
          <div class="product-suggestions__grid">${relacionados.map(miniProducto).join("")}</div>
        </section>`
      : "";
    const vistosHtml = vistos.length
      ? `<section class="product-suggestions" aria-labelledby="vistosTitle">
          <h3 id="vistosTitle">Vistos recientemente</h3>
          <div class="product-suggestions__grid">${vistos.map(miniProducto).join("")}</div>
        </section>`
      : "";

    el.detail.innerHTML = `
      <a class="product-detail__back" href="#cat=${rutaCategoria}" data-detail-back>← Volver al catálogo</a>
      <div class="product-detail__layout">
        <div class="product__media product-detail__media${hayGaleria ? " product__media--galeria" : ""}${fotos.length === 0 ? " is-video" : ""}" data-galeria data-product-id="${esc(producto.id)}">
          <div class="product__fotos">${slidesHtml}</div>
          <button class="product__fav" type="button" data-fav="${esc(producto.id)}" aria-pressed="${esFavorito}" aria-label="${esc(etiquetaFav)}">${iconoCorazon}</button>
          ${galeria}
          <span class="product__marca" aria-hidden="true">AGRESTI.3D</span>
        </div>
        <div class="product-detail__copy">
          ${categoria ? `<span class="product-detail__category">${esc(categoria.nombre)}</span>` : ""}
          <div class="product-detail__heading">
            <h2 id="productDetailTitle" tabindex="-1">${esc(producto.nombre)}</h2>
            <button class="product-share" type="button" data-share-product="${esc(producto.id)}" aria-label="Compartir ${esc(producto.nombre)}">Compartir</button>
          </div>
          <p class="product-detail__description">${esc(descripcion)}</p>
          ${disponibilidadHtml}
          ${alertaStockHtml}
          ${variantesHtml}
          ${specsHtml}
          ${resenasHtml}
          ${formResenaHtml}
          <div class="product-detail__purchase">
            <span class="product__price">${precio}${nota}</span>
            <div class="product-detail__purchase-actions">
              <button class="btn btn--ghost" type="button" data-add-cart="${esc(producto.id)}" aria-label="Agregar ${esc(producto.nombre)} al carrito">${iconoCarrito} Agregar al carrito</button>
              <a class="btn btn--primary" href="#pedido" data-wa-message="${esc(mensaje)}" ${atributosSucursalesWA(producto)} aria-label="Consultar por ${esc(producto.nombre)} por WhatsApp">Consultar por WhatsApp</a>
            </div>
          </div>
        </div>
      </div>
      ${stickyHtml}
      ${relacionadosHtml}
      ${vistosHtml}`;
  };

  // ---------- Visor de fotos en grande ----------
  let lightbox = null;
  let lightboxFotos = [];
  let lightboxIndice = 0;
  let lightboxDisparador = null;

  const crearLightbox = () => {
    if (lightbox) return lightbox;
    lightbox = document.createElement("dialog");
    lightbox.className = "lightbox";
    lightbox.id = "lightbox";
    lightbox.setAttribute("aria-label", "Fotos del producto en grande");
    lightbox.innerHTML = `
      <div class="lightbox__stage">
        <button class="lightbox__close" type="button" data-lightbox-close aria-label="Cerrar visor">✕</button>
        <button class="lightbox__nav lightbox__nav--prev" type="button" data-lightbox-prev aria-label="Foto anterior">${iconoFlecha}</button>
        <img class="lightbox__img" alt="">
        <button class="lightbox__nav lightbox__nav--next" type="button" data-lightbox-next aria-label="Foto siguiente">${iconoFlecha}</button>
        <p class="lightbox__counter" aria-live="polite"></p>
      </div>`;
    document.body.appendChild(lightbox);

    lightbox.addEventListener("click", (evento) => {
      if (evento.target === lightbox) cerrarLightbox();
    });
    lightbox.querySelector("[data-lightbox-close]").addEventListener("click", cerrarLightbox);
    lightbox.querySelector("[data-lightbox-prev]").addEventListener("click", () => moverLightbox(-1));
    lightbox.querySelector("[data-lightbox-next]").addEventListener("click", () => moverLightbox(1));
    lightbox.addEventListener("cancel", (evento) => {
      evento.preventDefault();
      cerrarLightbox();
    });
    lightbox.addEventListener("keydown", (evento) => {
      if (evento.key === "ArrowLeft") {
        evento.preventDefault();
        moverLightbox(-1);
      }
      if (evento.key === "ArrowRight") {
        evento.preventDefault();
        moverLightbox(1);
      }
    });

    let inicioX = null;
    lightbox.addEventListener(
      "touchstart",
      (evento) => {
        if (evento.touches.length === 1) inicioX = evento.touches[0].clientX;
      },
      { passive: true }
    );
    lightbox.addEventListener(
      "touchend",
      (evento) => {
        if (inicioX === null || !evento.changedTouches.length) return;
        const delta = evento.changedTouches[0].clientX - inicioX;
        inicioX = null;
        if (Math.abs(delta) > 40) moverLightbox(delta > 0 ? -1 : 1);
      },
      { passive: true }
    );

    return lightbox;
  };

  const pintarLightbox = () => {
    if (!lightbox) return;
    const foto = lightboxFotos[lightboxIndice];
    if (!foto) return;
    const imagen = lightbox.querySelector(".lightbox__img");
    imagen.src = foto.src;
    imagen.alt = foto.alt || "";
    const hayVarias = lightboxFotos.length > 1;
    lightbox.querySelector(".lightbox__counter").textContent = hayVarias
      ? `${lightboxIndice + 1} de ${lightboxFotos.length}`
      : "";
    lightbox.querySelector("[data-lightbox-prev]").hidden = !hayVarias;
    lightbox.querySelector("[data-lightbox-next]").hidden = !hayVarias;
  };

  const abrirLightbox = (producto, indice, disparador) => {
    const fotos = fotosDe(producto, productos.indexOf(producto));
    if (!fotos.length) return;
    crearLightbox();
    lightboxFotos = fotos;
    lightboxIndice = Math.max(0, Math.min(indice, fotos.length - 1));
    lightboxDisparador = disparador || null;
    pintarLightbox();
    document.body.classList.add("is-lightbox-open");
    if (typeof lightbox.showModal === "function") lightbox.showModal();
    else lightbox.setAttribute("open", "");
    lightbox.querySelector("[data-lightbox-close]").focus();
  };

  const cerrarLightbox = () => {
    if (!lightbox) return;
    if (typeof lightbox.close === "function") lightbox.close();
    else lightbox.removeAttribute("open");
    document.body.classList.remove("is-lightbox-open");
    if (lightboxDisparador) lightboxDisparador.focus();
  };

  const moverLightbox = (paso) => {
    if (lightboxFotos.length < 2) return;
    lightboxIndice = (lightboxIndice + paso + lightboxFotos.length) % lightboxFotos.length;
    pintarLightbox();
  };

  const indiceFotoActiva = (media) => {
    const imagenes = [...media.querySelectorAll(".product__fotos img")];
    const activa = imagenes.findIndex((imagen) => imagen.classList.contains("is-activa"));
    return activa < 0 ? 0 : activa;
  };

  const mensajeVacio = () =>
    verFavoritos
      ? "Todavía no guardaste ningún favorito. Tocá el corazón de un producto para tenerlo a mano."
      : normalizar(busqueda)
        ? `No encontramos productos para “${busqueda.trim()}”. Probá con otra palabra o pedinos algo a medida.`
        : hayFiltrosActivos()
          ? "No hay productos con esos filtros. Probá quitando alguno."
          : "Todavía no hay productos en esta categoría.";

  const renderProductos = (categoriasRaiz) => {
    const termino = normalizar(busqueda);
    const mostrarCategorias =
      !verFavoritos && ruta.length === 0 && categoriasRaiz.length > 0 && !termino && !hayFiltrosActivos();
    grid.hidden = mostrarCategorias;

    if (mostrarCategorias) {
      if (el.pagination) el.pagination.hidden = true;
      if (el.status) {
        el.status.textContent = `${categoriasRaiz.length} ${categoriasRaiz.length === 1 ? "categoría disponible" : "categorías disponibles"} para explorar.`;
      }
      return;
    }

    let lista;

    if (verFavoritos) {
      lista = productos.filter((p) => favoritos.has(p.id));
    } else {
      const alcance = ruta.length ? ramaCompleta(ruta[ruta.length - 1]) : null;
      lista = productos.filter((p) => !alcance || alcance.has(p.categoria));
    }

    if (termino) lista = lista.filter((producto) => coincideBusqueda(producto, termino));

    if (filtroPrecio) {
      lista = lista.filter((producto) => {
        const precio = precioNumero(producto.precio);
        if (filtroPrecio === "consultar") return precio === null;
        if (precio === null) return false;
        const [desde, hasta] = filtroPrecio.split("-").map(Number);
        return precio >= desde && precio <= hasta;
      });
    }

    if (filtroDisponibilidad === "con-stock") lista = lista.filter(tieneStock);
    if (filtroDisponibilidad === "sin-stock") lista = lista.filter(estaSinStock);

    if (termino && el.status) {
      el.status.textContent = `${lista.length} ${lista.length === 1 ? "producto encontrado" : "productos encontrados"} para “${busqueda.trim()}”.`;
    }

    if (ordenCatalogo !== "relevancia") {
      const precio = (producto) => {
        const numero = parseInt(String(producto.precio || "").replace(/[^\d]/g, ""), 10);
        return Number.isFinite(numero) ? numero : null;
      };
      lista = [...lista];
      if (ordenCatalogo === "novedades") lista.reverse();
      if (ordenCatalogo === "nombre") lista.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
      if (ordenCatalogo === "precio-asc" || ordenCatalogo === "precio-desc") {
        lista.sort((a, b) => {
          const pa = precio(a);
          const pb = precio(b);
          if (pa === null && pb === null) return 0;
          if (pa === null) return 1;
          if (pb === null) return -1;
          return ordenCatalogo === "precio-asc" ? pa - pb : pb - pa;
        });
      }
    }

    const totalPaginas = Math.ceil(lista.length / PAGE_SIZE);
    paginaActual = Math.min(paginaActual, Math.max(0, totalPaginas - 1));
    const inicio = paginaActual * PAGE_SIZE;
    const fin = Math.min(inicio + PAGE_SIZE, lista.length);
    const pagina = lista.slice(inicio, fin);

    grid.innerHTML = pagina.length
      ? pagina.map(tarjeta).join("")
      : `<p class="products__empty">${mensajeVacio()}</p>`;

    grid.querySelectorAll("[data-reveal]").forEach((nodo) => {
      if (window.AGRESTI && typeof AGRESTI.reveal === "function") AGRESTI.reveal(nodo);
      else nodo.classList.add("is-visible");
    });

    if (el.pagination) {
      el.pagination.hidden = lista.length <= PAGE_SIZE;
      const anterior = el.pagination.querySelector('[data-page="-1"]');
      const siguiente = el.pagination.querySelector('[data-page="1"]');
      if (anterior) anterior.disabled = paginaActual === 0;
      if (siguiente) siguiente.disabled = paginaActual >= totalPaginas - 1;
      if (el.paginationStatus) {
        el.paginationStatus.textContent =
          `Página ${paginaActual + 1} de ${totalPaginas} · ${inicio + 1}–${fin} de ${lista.length} productos`;
      }
    }

    if (el.status) {
      const donde = verFavoritos
        ? "en favoritos"
        : ruta.length
        ? `en ${nombresDeRuta(ruta)}`
        : "";
      el.status.textContent = lista.length
        ? `Mostrando productos ${inicio + 1} a ${fin} de ${lista.length} ${donde}`.trim()
        : `Sin productos ${donde}`.trim();
    }
  };

  const renderFavoritos = () => {
    const total = favoritos.size;

    if (el.favCount) el.favCount.textContent = String(total);

    if (el.favToggle) {
      el.favToggle.hidden = total === 0 && !verFavoritos;
      el.favToggle.setAttribute("aria-pressed", String(verFavoritos));
      el.favToggle.classList.toggle("is-active", verFavoritos);
    }

    if (el.actions && el.favOrder) {
      const mostrar = verFavoritos && total > 0;
      el.actions.hidden = !mostrar;

      if (mostrar) {
        const productosFavoritos = productos
          .filter((p) => favoritos.has(p.id));
        const nombres = productosFavoritos
          .map((p) => `• ${p.nombre}\n${urlDe(p)}`);
        el.favOrder.dataset.waMessage =
          `¡Hola Agresti.3D! Quiero pedir estos favoritos:\n${nombres.join("\n")}\n\n¿Me pasás precio y colores disponibles?`;
        if (productosFavoritos.some((producto) => Array.isArray(producto.sucursalesDisponibles))) {
          const disponibles = new Set(sucursales.map((sucursal) => sucursal.id).filter(Boolean));
          productosFavoritos.forEach((producto) => {
            const ids = Array.isArray(producto.sucursalesDisponibles)
              ? producto.sucursalesDisponibles
              : sucursales.map((sucursal) => sucursal.id);
            [...disponibles].forEach((id) => {
              if (!ids.includes(id)) disponibles.delete(id);
            });
          });
          el.favOrder.dataset.waBranches = [...disponibles].join(",");
          el.favOrder.dataset.waEmptyMessage =
            "No hay una sucursal con WhatsApp configurado que tenga disponibles todos estos productos.";
        } else {
          delete el.favOrder.dataset.waBranches;
          delete el.favOrder.dataset.waEmptyMessage;
        }
      }
    }
  };

  // ---------- Interacción ----------
  if (el.filters) {
    el.filters.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-cat]");
      if (!chip) return;
      const id = chip.dataset.cat;
      // La tira puede mostrar hijas de la categoría actual o —cuando esa
      // categoría no tiene hijas— sus hermanas. En los dos casos el destino es
      // el camino completo desde la raíz: si se concatenara siempre, elegir una
      // hermana dejaba una ruta imposible (mates/milkshakes).
      irA(id ? rutaDe(id) : []);
    });
  }

  if (el.crumbs) {
    el.crumbs.addEventListener("click", (e) => {
      const boton = e.target.closest("[data-crumb]");
      if (!boton) return;
      const valor = boton.dataset.crumb;
      irA(valor ? valor.split("/") : []);
    });
  }

  if (el.categoryGrid) {
    el.categoryGrid.addEventListener("click", (e) => {
      const link = e.target.closest("[data-category-link]");
      if (!link) return;
      const id = link.dataset.categoryLink;
      if (!catPorId.has(id)) return;

      e.preventDefault();
      irA(rutaDe(id));
      const seccion = document.getElementById("productos");
      if (seccion) seccion.scrollIntoView({ block: "start" });

      if (e.detail === 0) {
        const actual = el.crumbs && el.crumbs.querySelector('[aria-current="page"]');
        if (actual) actual.focus({ preventScroll: true });
      }
    });
  }

  if (el.pagination) {
    el.pagination.addEventListener("click", (e) => {
      const boton = e.target.closest("[data-page]");
      if (!boton || boton.disabled) return;

      paginaActual += Number(boton.dataset.page);
      render();

      const primeraTarjeta = grid.querySelector(".product");
      if (primeraTarjeta) {
        const seccion = document.getElementById("productos");
        if (seccion) seccion.scrollIntoView({ block: "start" });
        primeraTarjeta.focus({ preventScroll: true });
      }
    });
  }

  // Cambia de foto dentro de una ficha y deja el contador al día.
  // Da la vuelta: en la última vuelve a la primera, así nunca queda un
  // botón que no hace nada.
  const moverFoto = (media, paso) => {
    const slides = [...media.querySelectorAll("[data-slide]")];
    if (slides.length < 2) return;

    const actual = Math.max(
      0,
      slides.findIndex((slide) => slide.classList.contains("is-activa"))
    );
    const siguiente = (actual + paso + slides.length) % slides.length;

    slides.forEach((slide, i) => slide.classList.toggle("is-activa", i === siguiente));
    media
      .querySelectorAll(".product__puntos i")
      .forEach((punto, i) => punto.classList.toggle("is-activa", i === siguiente));

    const esVideo = slides[siguiente].dataset.slide === "video";
    media.classList.toggle("is-video", esVideo);

    const totalFotos = slides.filter((slide) => slide.dataset.slide === "foto").length;
    const contador = media.querySelector("[data-contador]");
    if (contador) {
      contador.textContent = esVideo
        ? `Video ${siguiente - totalFotos + 1} de ${slides.length - totalFotos}`
        : `Foto ${siguiente + 1} de ${totalFotos}`;
    }

    // Al salir de un video, se pausa para que no siga sonando de fondo.
    slides.forEach((slide, i) => {
      if (slide.dataset.slide !== "video" || i === siguiente) return;
      const video = slide.querySelector("video");
      if (video) video.pause();
    });
  };

  const alternarFavorito = (id) => {
    const producto = productos.find((p) => p.id === id);
    if (!producto) return;

    if (favoritos.has(id)) favoritos.delete(id);
    else favoritos.add(id);

    guardarFavoritos();
    render();

    const contenedor = el.detail && !el.detail.hidden ? el.detail : grid;
    const botonNuevo = contenedor.querySelector(`[data-fav="${id}"]`);
    if (botonNuevo) botonNuevo.focus();
  };

  if (el.detail) {
    el.detail.addEventListener("click", async (e) => {
      const compartir = e.target.closest("[data-share-product]");
      if (compartir) {
        const producto = productos.find((item) => item.id === compartir.dataset.shareProduct);
        if (producto) {
          const url = urlDe(producto);
          try {
            if (navigator.share) {
              await navigator.share({ title: `${producto.nombre} — Agresti.3D`, text: producto.nombre, url });
            } else if (navigator.clipboard) {
              await navigator.clipboard.writeText(url);
              mostrarToast("Link copiado para compartir.");
            }
          } catch (error) {
            /* el usuario canceló el diálogo de compartir */
          }
        }
        return;
      }
      const agregar = e.target.closest("[data-add-cart]");
      if (agregar) {
        e.preventDefault();
        agregarAlCarrito(agregar.dataset.addCart);
        return;
      }

      const volver = e.target.closest("[data-detail-back]");
      if (volver) {
        e.preventDefault();
        if (history.state && history.state[HISTORY_PRODUCT_KEY]) history.back();
        else volverAListaDesdeFicha();
        return;
      }

      const foto = e.target.closest(".product-detail__media .product__fotos img");
      if (foto) {
        const media = foto.closest("[data-galeria]");
        const producto = productos.find((item) => item.id === media?.dataset.productId);
        if (producto) abrirLightbox(producto, indiceFotoActiva(media), foto);
        return;
      }

      const flecha = e.target.closest("[data-flecha]");
      if (flecha) {
        const media = flecha.closest("[data-galeria]");
        if (media) moverFoto(media, Number(flecha.dataset.flecha));
        return;
      }

      const boton = e.target.closest("[data-fav]");
      if (boton) alternarFavorito(boton.dataset.fav);
    });

    el.detail.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const media = e.target.closest("[data-galeria]");
      if (!media || !media.classList.contains("product__media--galeria")) return;

      e.preventDefault();
      moverFoto(media, e.key === "ArrowRight" ? 1 : -1);
    });
  }

  grid.addEventListener("click", (e) => {
    const agregar = e.target.closest("[data-add-cart]");
    if (agregar) {
      e.preventDefault();
      agregarAlCarrito(agregar.dataset.addCart);
      return;
    }

    const enlaceDetalle = e.target.closest(".product__detail-hitarea");
    if (
      enlaceDetalle &&
      e.button === 0 &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.shiftKey &&
      !e.altKey
    ) {
      const productoId = enlaceDetalle.closest(".product")?.dataset.id;
      if (productoId) {
        e.preventDefault();
        abrirDesdeTarjeta(productoId);
      }
      return;
    }

    // Etiqueta de la ficha (“Mates”, “Milkshakes”…): filtra por esa rama y
    // vuelve al inicio de la lista, para no quedar mirando el pie de página
    // después de que la grilla se acorta.
    const filtro = e.target.closest("[data-filtro]");
    if (filtro) {
      const catId = filtro.dataset.filtro;
      if (catPorId.has(catId)) {
        irA(rutaDe(catId));
        const seccion = document.getElementById("productos");
        if (seccion) seccion.scrollIntoView({ block: "start" });
        // Si se activó con el teclado, el foco pasa al filtro que quedó
        // aplicado; con el mouse no se mueve, para no alterar el scroll.
        if (e.detail === 0) {
          const activo = el.filters && el.filters.querySelector(".chip.is-active");
          if (activo) activo.focus({ preventScroll: true });
        }
      }
      return;
    }

    const flecha = e.target.closest("[data-flecha]");
    if (flecha) {
      const media = flecha.closest("[data-galeria]");
      if (media) moverFoto(media, Number(flecha.dataset.flecha));
      return;
    }

    const boton = e.target.closest("[data-fav]");
    if (!boton) return;

    alternarFavorito(boton.dataset.fav);
  });

  // Con el teclado: izquierda y derecha mueven la galería de la ficha
  // donde esté parado el foco.
  grid.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const media = e.target.closest("[data-galeria]");
    if (!media || !media.classList.contains("product__media--galeria")) return;

    e.preventDefault();
    moverFoto(media, e.key === "ArrowRight" ? 1 : -1);
  });

  if (el.favToggle) {
    el.favToggle.addEventListener("click", () => {
      verFavoritos = !verFavoritos;
      paginaActual = 0;
      render();
    });
  }

  // El mismo hash que se comparte por WhatsApp abre la ficha individual.
  const abrirProducto = (id) => {
    const producto = productos.find((p) => p.id === id);
    if (!producto) return false;

    verFavoritos = false;
    ruta = rutaDe(producto.categoria);
    if (location.hash !== `#p=${encodeURIComponent(id)}`) {
      history.replaceState(history.state, "", `#p=${encodeURIComponent(id)}`);
    }
    render();

    const titulo = document.getElementById("productDetailTitle");
    const ficha = el.detail || document.getElementById("productos");
    if (ficha) {
      const raiz = document.documentElement;
      const comportamientoAnterior = raiz.style.scrollBehavior;
      raiz.style.scrollBehavior = "auto";
      ficha.scrollIntoView({ block: "start" });
      raiz.style.scrollBehavior = comportamientoAnterior;
    }
    if (titulo) titulo.focus({ preventScroll: true });
    return true;
  };

  const abrirDesdeTarjeta = (id) => {
    const tarjeta = [...grid.querySelectorAll(".product")].find(
      (producto) => producto.dataset.id === id
    );
    const contexto = {
      ruta: [...ruta],
      pagina: paginaActual,
      verFavoritos,
      productoId: id,
      scrollY: window.scrollY,
      tarjetaTop: tarjeta ? tarjeta.getBoundingClientRect().top : null,
      scrollRestoration: history.scrollRestoration,
    };
    const estadoAnterior = copiarEstadoActual();
    estadoAnterior[HISTORY_RETURN_KEY] = contexto;
    history.replaceState(estadoAnterior, "", location.href);
    history.scrollRestoration = "manual";

    const estadoFicha = copiarEstadoActual();
    delete estadoFicha[HISTORY_RETURN_KEY];
    estadoFicha[HISTORY_PRODUCT_KEY] = true;
    history.pushState(
      estadoFicha,
      "",
      `${location.pathname}${location.search}#p=${encodeURIComponent(id)}`
    );
    abrirProducto(id);
  };

  const restaurarCatalogo = (contexto) => {
    ruta = Array.isArray(contexto.ruta)
      ? contexto.ruta.filter((id) => catPorId.has(id))
      : [];
    paginaActual = Number.isInteger(contexto.pagina) ? Math.max(0, contexto.pagina) : 0;
    verFavoritos = Boolean(contexto.verFavoritos);
    render();

    const tarjeta = [...grid.querySelectorAll(".product")].find(
      (producto) => producto.dataset.id === contexto.productoId
    );
    if (tarjeta && Number.isFinite(contexto.tarjetaTop)) {
      desplazarA(
        window.scrollY + tarjeta.getBoundingClientRect().top - contexto.tarjetaTop
      );
      tarjeta.querySelector(".product__detail-hitarea")?.focus({ preventScroll: true });
    } else if (Number.isFinite(contexto.scrollY)) {
      desplazarA(contexto.scrollY);
    }

    history.scrollRestoration =
      contexto.scrollRestoration === "manual" ? "manual" : "auto";
  };

  const volverAListaDesdeFicha = () => {
    const producto = productos.find((item) => item.id === leerProducto());
    ruta = producto ? rutaDe(producto.categoria) : [];
    verFavoritos = false;
    paginaActual = 0;

    const base = location.pathname + location.search;
    const destino = ruta.length
      ? `${base}#cat=${ruta.map(encodeURIComponent).join("/")}`
      : base;
    history.replaceState(null, "", destino);
    render();

    const seccion = document.getElementById("productos");
    if (seccion) {
      const raiz = document.documentElement;
      const comportamientoAnterior = raiz.style.scrollBehavior;
      raiz.style.scrollBehavior = "auto";
      seccion.scrollIntoView({ block: "start" });
      raiz.style.scrollBehavior = comportamientoAnterior;
    }
  };

  const volverALeer = () => {
    const estabaEnDetalle = el.detail && !el.detail.hidden;
    const idProducto = leerProducto();
    if (idProducto && abrirProducto(idProducto)) return;

    const contexto = history.state && history.state[HISTORY_RETURN_KEY];
    if (contexto && typeof contexto === "object") {
      restaurarCatalogo(contexto);
      return;
    }

    ruta = leerRuta().filter((id) => catPorId.has(id));
    verFavoritos = false;
    paginaActual = 0;
    render();
    if (estabaEnDetalle) {
      document.getElementById("productos").scrollIntoView({ block: "start" });
    }
  };

  let urlPopstate = null;
  window.addEventListener("popstate", () => {
    urlPopstate = location.href;
    volverALeer();
    window.setTimeout(() => {
      urlPopstate = null;
    }, 0);
  });
  window.addEventListener("hashchange", () => {
    if (urlPopstate === location.href) {
      urlPopstate = null;
      return;
    }
    // Los enlaces del menú (#productos, #materiales, #pedido, etc.) no son
    // rutas del catálogo: el navegador ya hizo el scroll. Si veníamos de una
    // ficha, primero cerramos la ficha y después llevamos al destino.
    if (!location.hash.startsWith("#cat=") && !location.hash.startsWith("#p=")) {
      if (document.body.classList.contains("is-product-detail")) {
        const destino = location.hash;
        ruta = [];
        verFavoritos = false;
        paginaActual = 0;
        render();
        const seccion = document.getElementById(destino.slice(1));
        if (seccion) {
          const raiz = document.documentElement;
          const anterior = raiz.style.scrollBehavior;
          raiz.style.scrollBehavior = "auto";
          seccion.scrollIntoView({ block: "start" });
          raiz.style.scrollBehavior = anterior;
        }
      }
      return;
    }
    volverALeer();
  });

  // ---------- Carrito ----------
  const CART_KEY = "agresti:carrito";
  const cartEl = {
    toggle: document.getElementById("cartToggle"),
    badge: document.getElementById("cartBadge"),
    dialog: document.getElementById("cartDialog"),
    body: document.getElementById("cartBody"),
    foot: document.getElementById("cartFoot"),
    total: document.getElementById("cartTotal"),
    subtitle: document.getElementById("cartSubtitle"),
    order: document.getElementById("cartOrderButton"),
    clear: document.getElementById("cartClearButton"),
    toast: document.getElementById("cartToast"),
  };
  let carrito = [];
  let toastTimer = null;

  const leerCarrito = () => {
    try {
      const crudo = localStorage.getItem(CART_KEY);
      const lista = crudo ? JSON.parse(crudo) : [];
      if (!Array.isArray(lista)) return [];
      return lista
        .filter((item) => item && typeof item.id === "string")
        .map((item) => ({
          id: item.id,
          cantidad: Math.min(99, Math.max(1, Math.round(Number(item.cantidad) || 1))),
        }));
    } catch {
      return [];
    }
  };

  const guardarCarrito = () => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(carrito));
    } catch {
      /* modo privado o almacenamiento lleno: no rompe la página */
    }
  };

  const unidadesCarrito = () =>
    carrito.reduce((total, item) => total + item.cantidad, 0);

  const productoDe = (id) => productos.find((producto) => producto.id === id);

  const precioNumero = (texto) => {
    const limpio = String(texto || "").replace(/[^\d]/g, "");
    return limpio ? Number(limpio) : null;
  };

  const precioFormateado = (numero) => `$${numero.toLocaleString("es-AR")}`;

  const actualizarBadge = () => {
    if (!cartEl.badge) return;
    const unidades = unidadesCarrito();
    cartEl.badge.textContent = String(unidades);
    cartEl.badge.hidden = unidades === 0;
  };

  const mostrarToast = (mensaje) => {
    if (!cartEl.toast) return;
    cartEl.toast.textContent = mensaje;
    cartEl.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      cartEl.toast.hidden = true;
    }, 2600);
  };

  const guardarYRefrescar = () => {
    guardarCarrito();
    actualizarBadge();
    if (cartEl.dialog?.open) renderCarrito();
  };

  const agregarAlCarrito = (id, cantidad = 1) => {
    const producto = productoDe(id);
    if (!producto) return;
    const existente = carrito.find((item) => item.id === id);
    if (existente) existente.cantidad = Math.min(99, existente.cantidad + cantidad);
    else carrito.push({ id, cantidad: Math.min(99, Math.max(1, cantidad)) });
    guardarYRefrescar();
    mostrarToast(`«${producto.nombre}» se agregó al carrito.`);
  };

  const quitarDelCarrito = (id) => {
    carrito = carrito.filter((item) => item.id !== id);
    guardarYRefrescar();
  };

  const cambiarCantidad = (id, delta) => {
    const item = carrito.find((entrada) => entrada.id === id);
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) {
      quitarDelCarrito(id);
      return;
    }
    item.cantidad = Math.min(99, item.cantidad);
    guardarYRefrescar();
  };

  const renderCarrito = () => {
    if (!cartEl.body || !cartEl.dialog) return;
    const items = carrito
      .map((item) => {
        const producto = productoDe(item.id);
        if (!producto) return null;
        return {
          ...item,
          producto,
          foto: fotosDe(producto, productos.indexOf(producto))[0],
          precio: precioNumero(producto.precio),
        };
      })
      .filter(Boolean);

    const unidades = items.reduce((total, item) => total + item.cantidad, 0);
    if (cartEl.subtitle) {
      cartEl.subtitle.textContent = unidades
        ? `${unidades} ${unidades === 1 ? "unidad" : "unidades"} en el carrito`
        : "0 productos seleccionados";
    }

    if (!items.length) {
      cartEl.body.innerHTML = `
        <div class="cart-empty">
          <p>Todavía no agregaste productos.</p>
          <a class="btn btn--ghost" href="#productos" data-cart-close>Ver el catálogo</a>
        </div>`;
      if (cartEl.foot) cartEl.foot.hidden = true;
      return;
    }

    cartEl.body.innerHTML = items
      .map(
        ({ producto, foto, precio, cantidad }) => `
        <article class="cart-item" data-cart-id="${esc(producto.id)}">
          ${foto ? `<img class="cart-item__img" src="${esc(foto.src)}" alt="${esc(foto.alt)}" width="88" height="88">` : ""}
          <div class="cart-item__info">
            <a class="cart-item__name" href="#p=${encodeURIComponent(producto.id)}" data-cart-close>${esc(producto.nombre)}</a>
            <span class="cart-item__price">${precio === null ? "A consultar" : precioFormateado(precio)}</span>
            <div class="cart-item__qty" role="group" aria-label="Cantidad de ${esc(producto.nombre)}">
              <button class="cart-item__qty-btn" type="button" data-cart-minus="${esc(producto.id)}" aria-label="Quitar una unidad de ${esc(producto.nombre)}">−</button>
              <span class="cart-item__count" aria-live="polite">${cantidad}</span>
              <button class="cart-item__qty-btn" type="button" data-cart-plus="${esc(producto.id)}" aria-label="Agregar una unidad de ${esc(producto.nombre)}">+</button>
            </div>
          </div>
          <button class="cart-item__remove" type="button" data-cart-remove="${esc(producto.id)}" aria-label="Quitar ${esc(producto.nombre)} del carrito">×</button>
        </article>`
      )
      .join("");

    const conPrecio = items.filter((item) => item.precio !== null);
    const sinPrecio = items.filter((item) => item.precio === null);
    const total = conPrecio.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
    if (cartEl.foot) cartEl.foot.hidden = false;
    if (cartEl.total) {
      cartEl.total.textContent = conPrecio.length ? precioFormateado(total) : "A consultar";
    }
    const nota = cartEl.foot?.querySelector("[data-cart-note]");
    if (nota) {
      nota.textContent = sinPrecio.length
        ? "Los productos sin precio se confirman por WhatsApp."
        : "";
      nota.hidden = sinPrecio.length === 0;
    }
  };


  const PEDIDOS_API = "https://firestore.googleapis.com/v1/projects/agresti-3d/databases/(default)/documents/pedidos";
  const PEDIDOS_KEY = "AIzaSyCjBR_K_Wk4Kiy7HBMnt0_bfFup45R8na0";

  const generarCodigoPedido = () => {
    const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = new Uint8Array(6);
    if (window.crypto?.getRandomValues) window.crypto.getRandomValues(bytes);
    else for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
    return `AG-${[...bytes].map((byte) => letras[byte % letras.length]).join("")}`;
  };

  const crearPedido = async (items, total) => {
    const codigo = generarCodigoPedido();
    const campos = {
      codigo: { stringValue: codigo },
      estado: { stringValue: "pendiente" },
      total: { integerValue: String(total) },
      creado: { timestampValue: new Date().toISOString() },
      actualizado: { timestampValue: new Date().toISOString() },
      items: {
        arrayValue: {
          values: items.map(({ producto, cantidad }) => ({
            mapValue: {
              fields: {
                productoId: { stringValue: producto.id },
                nombre: { stringValue: producto.nombre },
                cantidad: { integerValue: String(cantidad) },
                precio: { integerValue: String(precioNumero(producto.precio) || 0) },
              },
            },
          })),
        },
      },
    };
    try {
      const respuesta = await fetch(`${PEDIDOS_API}?documentId=${encodeURIComponent(codigo)}&key=${PEDIDOS_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: campos }),
      });
      if (!respuesta.ok) return null;
      window.agrestiTrack?.("order_created", { codigo });
      return codigo;
    } catch (error) {
      return null;
    }
  };

  const pedirCarrito = async () => {
    const items = carrito
      .map((item) => ({ ...item, producto: productoDe(item.id) }))
      .filter((item) => item.producto);
    if (!items.length) return;
    const total = items.reduce(
      (suma, { producto, cantidad }) => suma + (precioNumero(producto.precio) || 0) * cantidad,
      0
    );
    const codigo = await crearPedido(items, total);
    const lineas = items.map(
      ({ producto, cantidad }) => `• ${producto.nombre} ×${cantidad}\n${urlDe(producto)}`
    );
    const mensaje =
      `¡Hola Agresti.3D! Quiero pedir estos productos:\n\n` +
      `${lineas.join("\n\n")}\n\n` +
      `¿Me confirmás precio, colores disponibles y plazo?` +
      (codigo
        ? `\n\n*Código de seguimiento:* ${codigo}\nhttps://agresti3d.web.app/seguimiento.html?codigo=${codigo}`
        : "");
    if (cartEl.dialog?.open) cartEl.dialog.close();
    if (typeof requestWhatsApp === "function") requestWhatsApp(mensaje);
    else window.location.href = "#pedido";
  };

  const inicializarCarrito = () => {
    carrito = leerCarrito().filter((item) => productoDe(item.id));
    guardarCarrito();
    actualizarBadge();

    cartEl.toggle?.addEventListener("click", () => {
      if (!cartEl.dialog) return;
      renderCarrito();
      cartEl.dialog.showModal();
    });
    cartEl.order?.addEventListener("click", pedirCarrito);
    cartEl.clear?.addEventListener("click", () => {
      if (!carrito.length) return;
      if (!window.confirm("¿Vaciar el carrito?")) return;
      carrito = [];
      guardarYRefrescar();
    });
    cartEl.dialog?.addEventListener("click", (evento) => {
      if (evento.target === cartEl.dialog) {
        cartEl.dialog.close();
        return;
      }
      if (evento.target.closest("[data-cart-close]")) {
        cartEl.dialog.close();
        return;
      }
      const menos = evento.target.closest("[data-cart-minus]");
      if (menos) {
        cambiarCantidad(menos.dataset.cartMinus, -1);
        return;
      }
      const mas = evento.target.closest("[data-cart-plus]");
      if (mas) {
        cambiarCantidad(mas.dataset.cartPlus, 1);
        return;
      }
      const quitar = evento.target.closest("[data-cart-remove]");
      if (quitar) quitarDelCarrito(quitar.dataset.cartRemove);
    });

    window.addEventListener("storage", (evento) => {
      if (evento.key !== CART_KEY) return;
      carrito = leerCarrito().filter((item) => productoDe(item.id));
      actualizarBadge();
      if (cartEl.dialog?.open) renderCarrito();
    });
  };

  // ---------- Arranque ----------
  const fotos = window.AGRESTI_SEASON_PHOTOS
    ? Promise.resolve(window.AGRESTI_SEASON_PHOTOS).catch(() => [])
    : Promise.resolve([]);

  const fetchConTiempo = async (url, opciones = {}, milisegundos = 2500) => {
    const control = new AbortController();
    const temporizador = window.setTimeout(() => control.abort(), milisegundos);
    try {
      return await fetch(url, { ...opciones, signal: control.signal });
    } finally {
      window.clearTimeout(temporizador);
    }
  };

  const cargarCatalogoPublicado = async () => {
    try {
      const config = await fetchConTiempo("/__/firebase/init.json", { cache: "no-cache" }).then(
        (r) => (r.ok ? r.json() : null)
      );
      if (!config?.apiKey || !config?.projectId) return null;
      const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
        config.projectId
      )}/databases/(default)/documents/catalogo/publicado?key=${encodeURIComponent(config.apiKey)}`;
      const respuesta = await fetchConTiempo(url, { cache: "no-cache" });
      if (!respuesta.ok) return null;
      const documento = await respuesta.json();
      const json = documento?.fields?.json?.stringValue;
      if (!json) return null;
      const nube = JSON.parse(json);
      return Array.isArray(nube?.productos) ? nube : null;
    } catch (error) {
      console.warn("[catálogo] no se pudo leer Firestore; se usa el catálogo estático.", error);
      return null;
    }
  };

  const catalogoPromise = cargarCatalogoPublicado().then((nube) => {
    if (nube) return nube;
    return fetch("data/catalog.json", { cache: "no-cache" }).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
  });

  Promise.all([catalogoPromise, fotos])
    .then(([datos, fotosEncontradas]) => {
      categorias = Array.isArray(datos.categorias) ? datos.categorias : [];
      productos = Array.isArray(datos.productos) ? datos.productos : [];
      sucursales = Array.isArray(datos.sucursales) ? datos.sucursales : [];
      fotosTemporada = Array.isArray(fotosEncontradas) ? fotosEncontradas : [];
      window.AGRESTI_CATALOG_DATA = { productos, sucursales, categorias };
      window.dispatchEvent(new Event("agresti:catalog-loaded"));
      inicializarCarrito();

      catPorId = new Map();
      hijosDe = new Map();
      conProductos = new Map();

      categorias.forEach((c) => catPorId.set(c.id, c));
      categorias.forEach((c) => {
        if (!c.padre || !catPorId.has(c.padre)) return;
        if (!hijosDe.has(c.padre)) hijosDe.set(c.padre, []);
        hijosDe.get(c.padre).push(c);
      });

      // Una rama se muestra solo si tiene productos propios o en sus nietas.
      const calcular = (id, visitados) => {
        if (conProductos.has(id)) return conProductos.get(id);
        if (visitados.has(id)) return false;
        visitados.add(id);

        const propios = productos.some((p) => p.categoria === id);
        const enHijos = hijos(id).some((h) => calcular(h.id, visitados));
        const resultado = propios || enHijos;

        conProductos.set(id, resultado);
        return resultado;
      };
      categorias.forEach((c) => calcular(c.id, new Set()));

      // Si un producto se dio de baja, su id queda dando vueltas en los
      // favoritos guardados y descuadra el contador: se descarta al leer.
      const idsDelCatalogo = new Set(productos.map((p) => p.id));
      favoritos = new Set(
        [...leerFavoritos()].filter((id) => idsDelCatalogo.has(id))
      );
      ruta = leerRuta().filter((id) => catPorId.has(id));

      render();

      const idProducto =
        leerProducto() || window.__AGRESTI_PRODUCTO_INICIAL__ || "";
      if (idProducto) abrirProducto(idProducto);
    })
    .catch((error) => {
      console.error("[catálogo] no se pudo cargar data/catalog.json", error);
      grid.innerHTML =
        '<p class="products__empty">No pudimos cargar el catálogo. Escribinos por WhatsApp y te pasamos la lista completa.</p>';
    });


  let sugerenciasActuales = [];
  let sugerenciaActiva = -1;

  const ocultarSugerencias = () => {
    if (!el.suggestions) return;
    el.suggestions.hidden = true;
    el.suggestions.innerHTML = "";
    el.search?.setAttribute("aria-expanded", "false");
    sugerenciaActiva = -1;
  };

  const construirSugerencias = (termino) => {
    if (!termino) return [];
    const resultados = [];
    const vistos = new Set();
    const agregar = (tipo, id, label, detalle) => {
      const clave = `${tipo}:${id}`;
      if (vistos.has(clave)) return;
      vistos.add(clave);
      resultados.push({ tipo, id, label, detalle });
    };
    categorias
      .filter((categoria) => normalizar(categoria.nombre).includes(termino))
      .slice(0, 3)
      .forEach((categoria) => agregar("categoria", categoria.id, categoria.nombre, "Categoría"));
    productos
      .filter((producto) => normalizar(producto.nombre).includes(termino))
      .slice(0, 5)
      .forEach((producto) => {
        const categoria = catPorId.get(producto.categoria);
        agregar("producto", producto.id, producto.nombre, categoria?.nombre || "Producto");
      });
    return resultados.slice(0, 6);
  };

  const pintarSugerencias = (sugerencias) => {
    if (!el.suggestions) return;
    sugerenciasActuales = sugerencias;
    sugerenciaActiva = -1;
    if (!sugerencias.length) {
      ocultarSugerencias();
      return;
    }
    el.suggestions.innerHTML = sugerencias
      .map(
        (sugerencia, indice) =>
          `<button class="catalog-suggestion" type="button" role="option" id="catalogSuggestion${indice}" data-sugerencia-tipo="${sugerencia.tipo}" data-sugerencia-id="${esc(sugerencia.id)}">
            <span>${esc(sugerencia.label)}</span><small>${esc(sugerencia.detalle)}</small>
          </button>`
      )
      .join("");
    el.suggestions.hidden = false;
    el.search?.setAttribute("aria-expanded", "true");
  };

  const activarSugerencia = (indice) => {
    const botones = [...(el.suggestions?.querySelectorAll(".catalog-suggestion") || [])];
    if (!botones.length) return;
    sugerenciaActiva = (indice + botones.length) % botones.length;
    botones.forEach((boton, i) => boton.classList.toggle("is-active", i === sugerenciaActiva));
    el.search?.setAttribute("aria-activedescendant", `catalogSuggestion${sugerenciaActiva}`);
  };

  const elegirSugerencia = (indice) => {
    const sugerencia = sugerenciasActuales[indice];
    if (!sugerencia) return;
    if (sugerencia.tipo === "producto") {
      ocultarSugerencias();
      abrirProducto(sugerencia.id);
      return;
    }
    busqueda = "";
    if (el.search) el.search.value = "";
    if (el.searchClear) el.searchClear.hidden = true;
    ocultarSugerencias();
    location.hash = `cat=${encodeURIComponent(sugerencia.id)}`;
  };

  const actualizarFiltros = () => {
    filtroPrecio = el.priceFilter?.value || "";
    filtroDisponibilidad = el.availabilityFilter?.value || "";
    if (el.filtersClear) el.filtersClear.hidden = !hayFiltrosActivos();
    paginaActual = 0;
    renderProductos(renderCategorias());
  };

  el.priceFilter?.addEventListener("change", actualizarFiltros);
  el.availabilityFilter?.addEventListener("change", actualizarFiltros);
  el.filtersClear?.addEventListener("click", () => {
    filtroPrecio = "";
    filtroDisponibilidad = "";
    if (el.priceFilter) el.priceFilter.value = "";
    if (el.availabilityFilter) el.availabilityFilter.value = "";
    if (el.filtersClear) el.filtersClear.hidden = true;
    paginaActual = 0;
    renderProductos(renderCategorias());
  });

  el.search?.addEventListener("input", () => {
    busqueda = el.search.value;
    if (el.searchClear) el.searchClear.hidden = !busqueda.trim();
    paginaActual = 0;
    renderProductos(renderCategorias());
    pintarSugerencias(construirSugerencias(normalizar(busqueda)));
  });

  el.search?.addEventListener("focus", () => {
    if (normalizar(busqueda)) {
      pintarSugerencias(construirSugerencias(normalizar(busqueda)));
    }
  });

  el.search?.addEventListener("keydown", (evento) => {
    if (el.suggestions?.hidden) return;
    if (evento.key === "ArrowDown") {
      evento.preventDefault();
      activarSugerencia(sugerenciaActiva + 1);
    }
    if (evento.key === "ArrowUp") {
      evento.preventDefault();
      activarSugerencia(sugerenciaActiva - 1);
    }
    if (evento.key === "Enter" && sugerenciaActiva >= 0) {
      evento.preventDefault();
      elegirSugerencia(sugerenciaActiva);
    }
    if (evento.key === "Escape") ocultarSugerencias();
  });

  el.suggestions?.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-sugerencia-tipo]");
    if (!boton) return;
    const indice = sugerenciasActuales.findIndex(
      (sugerencia) =>
        sugerencia.tipo === boton.dataset.sugerenciaTipo &&
        sugerencia.id === boton.dataset.sugerenciaId
    );
    elegirSugerencia(indice);
  });

  document.addEventListener("pointerdown", (evento) => {
    if (!evento.target.closest(".catalog-search")) ocultarSugerencias();
  });

  el.searchClear?.addEventListener("click", () => {
    busqueda = "";
    if (el.search) {
      el.search.value = "";
      el.search.focus();
    }
    el.searchClear.hidden = true;
    ocultarSugerencias();
    paginaActual = 0;
    renderProductos(renderCategorias());
  });

  document.getElementById("catalogSort")?.addEventListener("change", (evento) => {
    ordenCatalogo = evento.target.value;
    paginaActual = 0;
    renderProductos(renderCategorias());
  });
})();
