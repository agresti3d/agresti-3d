"use strict";

(() => {
  const $ = (selector) => document.querySelector(selector);
  const els = {
    badge: $("#connectionBadge"),
    localWarning: $("#localWarning"),
    connect: $("#connectButton"),
    saveCatalog: $("#saveCatalogButton"),
    publish: $("#publishButton"),
    panel: $("#connectionPanel"),
    hint: $("#browserHint"),
    fallbackImport: $("#importFallback"),
    fallbackExport: $("#exportFallbackButton"),
    file: $("#catalogFile"),
    status: $("#statusMessage"),
    search: $("#searchInput"),
    categoryFilter: $("#categoryFilter"),
    list: $("#productList"),
    total: $("#productTotal"),
    add: $("#addProductButton"),
    fields: $("#productFields"),
    form: $("#productForm"),
    formTitle: $("#formTitle"),
    placeholder: $("#formPlaceholder"),
    delete: $("#deleteProductButton"),
    duplicate: $("#duplicateProductButton"),
    name: $("#productName"),
    id: $("#productId"),
    category: $("#productCategory"),
    description: $("#productDescription"),
    longDescription: $("#productLongDescription"),
    productBranches: $("#productBranches"),
    price: $("#productPrice"),
    priceNote: $("#productPriceNote"),
    addVariant: $("#addVariantButton"),
    variantsList: $("#variantsList"),
    imageDropzone: $("#imageDropzone"),
    imageFiles: $("#imageFiles"),
    uploadLabel: $("#uploadLabel"),
    imageList: $("#imageList"),
    videoFiles: $("#videoFiles"),
    uploadVideoLabel: $("#uploadVideoLabel"),
    videoList: $("#videoList"),
    cancelForm: $("#cancelFormButton"),
    categoryManager: $("#categoryManager"),
    categoryForm: $("#categoryForm"),
    categoryList: $("#categoryList"),
    newCategoryName: $("#newCategoryName"),
    newCategoryParent: $("#newCategoryParent"),
    branchManager: $("#branchManager"),
    branchList: $("#branchList"),
    addBranch: $("#addBranchButton"),
    saveBranches: $("#saveBranchesButton"),
    instagramSelect: $("#instagramProduct"),
    instagramSearch: $("#instagramProductSearch"),
    instagramProductCount: $("#instagramProductCount"),
    instagramCanvas: $("#instagramCanvas"),
    instagramCaption: $("#instagramCaption"),
    instagramHashtags: $("#instagramHashtags"),
    instagramCaptionCount: $("#instagramCaptionCount"),
    instagramDownload: $("#instagramDownload"),
    instagramCopy: $("#instagramCopy"),
    instagramStatus: $("#instagramStatus"),
    instagramFormat: $("#instagramFormat"),
    instagramBackground: $("#instagramBackground"),
    instagramSlides: $("#instagramSlides"),
    instagramDownloadAll: $("#instagramDownloadAll"),
    instagramHint: $("#instagramHint"),
    instagramFecha: $("#instagramFecha"),
    instagramPlan: $("#instagramPlan"),
    instagramMarkPublished: $("#instagramMarkPublished"),
    instagramForget: $("#instagramForget"),
    instagramExportCalendar: $("#instagramExportCalendar"),
    instagramRecordStatus: $("#instagramRecordStatus"),
    instagramPrevMonth: $("#instagramPrevMonth"),
    instagramNextMonth: $("#instagramNextMonth"),
    instagramMonthLabel: $("#instagramMonthLabel"),
    instagramCalendar: $("#instagramCalendar"),
    instagramHistoryList: $("#instagramHistoryList"),
    etiquetaAncho: $("#etiquetaAncho"),
    etiquetaAlto: $("#etiquetaAlto"),
    etiquetaCopias: $("#etiquetaCopias"),
    etiquetaModo: $("#etiquetaModo"),
    etiquetaDetalleInput: $("#etiquetaDetalleInput"),
    etiquetaLoteInput: $("#etiquetaLoteInput"),
    etiquetaQrToggle: $("#etiquetaQrToggle"),
    etiquetaInstagramToggle: $("#etiquetaInstagramToggle"),
    etiquetaPlaToggle: $("#etiquetaPlaToggle"),
    etiquetaCuidadoToggle: $("#etiquetaCuidadoToggle"),
    etiquetaImprimir: $("#etiquetaImprimir"),
    etiquetaPreviewWrap: $("#etiquetaPreviewWrap"),
    etiquetaStage: $("#etiquetaStage"),
    etiquetaPreview: $("#etiquetaPreview"),
    etiquetaFormato: $("#etiquetaFormato"),
    etiquetaFormatoCaption: $("#etiquetaFormatoCaption"),
    etiquetaMeta: $("#etiquetaMeta"),
    etiquetaDetalleBloque: $("#etiquetaDetalleBloque"),
    etiquetaDetalleLinea: $("#etiquetaDetalleLinea"),
    etiquetaLoteLinea: $("#etiquetaLoteLinea"),
    etiquetaCuidadoLinea: $("#etiquetaCuidadoLinea"),
    etiquetaQrBloque: $("#etiquetaQrBloque"),
    etiquetaPrintArea: $("#etiquetaPrintArea"),
    etiquetaMaxA4Boton: $("#etiquetaMaxA4Boton"),
    etiquetaMaxA4: $("#etiquetaMaxA4"),
    etiquetaPdf: $("#etiquetaPdf"),
    etiquetaPdfStatus: $("#etiquetaPdfStatus"),
  };

  const supportsDirectoryAccess = typeof window.showDirectoryPicker === "function";
  let projectHandle = null;
  let catalog = null;
  let originalCatalogText = "";
  let selectedId = null;
  let creating = false;
  let formDirty = false;
  let catalogDirty = false;
  let catalogSavedForPublish = false;
  let publishing = false;
  let formImages = [];
  let formVideos = [];
  let formVariants = [];
  let pendingFiles = new Map();
  let pendingVideos = new Set();
  let filterCategory = "";
  let query = "";
  const detailFields = {
    altura: $("#productHeight"),
    ancho: $("#productWidth"),
    largo: $("#productLength"),
    peso: $("#productWeight"),
    material: $("#productMaterial"),
    colores: $("#productColors"),
    capacidad: $("#productCapacity"),
    personalizacion: $("#productOptions"),
    contenido: $("#productContents"),
    cuidados: $("#productCare"),
  };

  const esc = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char]));

  const slugify = (value) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const branchBaseId = (branch, index) =>
    slugify([branch.nombre, branch.localidad].filter(Boolean).join("-")) || `sucursal-${index + 1}`;

  const ensureBranchIds = (data) => {
    const used = new Set();
    const reserved = new Set(
      data.sucursales
        .filter((branch) => branch && typeof branch === "object" && branch.id)
        .map((branch) => branch.id)
    );
    data.sucursales.forEach((branch, index) => {
      if (!branch || typeof branch !== "object" || Array.isArray(branch)) return;
      if (!branch.id) {
        const baseId = branchBaseId(branch, index);
        let id = baseId;
        let suffix = 2;
        while (used.has(id) || reserved.has(id)) id = `${baseId}-${suffix++}`;
        branch.id = id;
      }
      used.add(branch.id);
    });
  };

  const newBranchId = (index) => {
    const baseId = `sucursal-${index + 1}`;
    const used = new Set((catalog?.sucursales || []).map((branch) => branch.id));
    let id = baseId;
    let suffix = 2;
    while (used.has(id)) id = `${baseId}-${suffix++}`;
    return id;
  };

  const report = (message, kind = "") => {
    els.status.textContent = message;
    els.status.dataset.kind = kind;
  };

  const setConnected = (connected) => {
    els.badge.dataset.state = connected ? "connected" : "offline";
    els.badge.textContent = projectHandle ? "Carpeta conectada" : connected ? "Catálogo cargado" : "Sin conectar";
    els.connect.textContent = projectHandle ? "Cambiar carpeta" : "Elegir carpeta del sitio";
    els.search.disabled = !connected;
    els.categoryFilter.disabled = !connected;
    els.add.disabled = !connected;
    els.panel.hidden = connected && supportsDirectoryAccess;
    els.categoryManager.hidden = !connected;
    els.branchManager.hidden = !connected;
    updatePublishButton();
  };

  // Pestañas de la página: Productos, Categorías y Sucursales.
  const editorPanels = {
    productos: document.getElementById("panelProductos"),
    categorias: document.getElementById("panelCategorias"),
    sucursales: document.getElementById("panelSucursales"),
    instagram: document.getElementById("panelInstagram"),
    etiquetas: document.getElementById("panelEtiquetas"),
  };

  const activarEditorTab = (nombre, focus = false) => {
    document.querySelectorAll("[data-editor-tab]").forEach((tab) => {
      const activo = tab.dataset.editorTab === nombre;
      tab.setAttribute("aria-selected", String(activo));
      tab.tabIndex = activo ? 0 : -1;
    });
    Object.entries(editorPanels).forEach(([clave, panel]) => {
      if (panel) panel.hidden = clave !== nombre;
    });
    if (nombre === "categorias" && catalog) renderCategoryList();
    if (nombre === "instagram") prepararInstagram();
    if (nombre === "etiquetas") actualizarEtiqueta();
    if (focus) document.querySelector(`[data-editor-tab="${nombre}"]`)?.focus();
  };

  const conectarTabs = (contenedorSelector, atributo, activar) => {
    const contenedor = document.querySelector(contenedorSelector);
    if (!contenedor) return;
    contenedor.addEventListener("click", (event) => {
      const tab = event.target.closest(`[${atributo}]`);
      if (tab) activar(tab.getAttribute(atributo));
    });
    contenedor.addEventListener("keydown", (event) => {
      const tab = event.target.closest(`[${atributo}]`);
      if (!tab) return;
      const tabs = [...contenedor.querySelectorAll(`[${atributo}]`)];
      const indice = tabs.indexOf(tab);
      let destino = null;
      if (event.key === "ArrowRight") destino = tabs[(indice + 1) % tabs.length];
      if (event.key === "ArrowLeft") destino = tabs[(indice - 1 + tabs.length) % tabs.length];
      if (event.key === "Home") destino = tabs[0];
      if (event.key === "End") destino = tabs[tabs.length - 1];
      if (!destino) return;
      event.preventDefault();
      activar(destino.getAttribute(atributo), true);
    });
  };

  // Pestañas internas de la ficha del producto.
  const formPanels = {
    medios: document.getElementById("formPanelMedios"),
    datos: document.getElementById("formPanelDatos"),
    precio: document.getElementById("formPanelPrecio"),
    detalles: document.getElementById("formPanelDetalles"),
    variantes: document.getElementById("formPanelVariantes"),
  };

  const activarFormTab = (nombre, focus = false) => {
    document.querySelectorAll("[data-form-tab]").forEach((tab) => {
      const activo = tab.dataset.formTab === nombre;
      tab.setAttribute("aria-selected", String(activo));
      tab.tabIndex = activo ? 0 : -1;
    });
    Object.entries(formPanels).forEach(([clave, panel]) => {
      if (panel) panel.hidden = clave !== nombre;
    });
    if (focus) document.querySelector(`[data-form-tab="${nombre}"]`)?.focus();
  };

  const updatePublishButton = () => {
    const hayCambios = Boolean(catalog) && (catalogDirty || formDirty);
    if (catalog) {
      els.badge.dataset.state = hayCambios ? "dirty" : "connected";
      els.badge.textContent = hayCambios
        ? "Cambios sin guardar"
        : projectHandle
          ? "Carpeta conectada"
          : "Catálogo cargado";
      document.title = `${hayCambios ? "• " : ""}Editor de catálogo — Agresti.3D`;
    }
    els.publish.disabled =
      !catalog ||
      !catalogSavedForPublish ||
      catalogDirty ||
      formDirty ||
      publishing;
  };

  const markCatalogDirty = () => {
    catalogDirty = true;
    catalogSavedForPublish = false;
    els.saveCatalog.disabled = false;
    els.saveCatalog.textContent = "Guardar catálogo en esta computadora";
    updatePublishButton();
  };

  const categoryPath = (categoryId) => {
    const names = [];
    const seen = new Set();
    let current = catalog?.categorias.find((category) => category.id === categoryId);

    while (current && !seen.has(current.id)) {
      seen.add(current.id);
      names.unshift(current.nombre);
      current = catalog.categorias.find((category) => category.id === current.padre);
    }

    return names.join(" / ") || "Sin categoría";
  };

  const sortedCategories = () => {
    if (!catalog) return [];
    const categories = [];
    const visit = (parentId, depth, ancestors) => {
      catalog.categorias
        .filter((category) => (category.padre || null) === parentId)
        .forEach((category) => {
          if (ancestors.has(category.id)) return;
          categories.push({ ...category, depth });
          const nextAncestors = new Set(ancestors);
          nextAncestors.add(category.id);
          visit(category.id, depth + 1, nextAncestors);
        });
    };
    visit(null, 0, new Set());
    catalog.categorias.forEach((category) => {
      if (!categories.some((item) => item.id === category.id)) {
        categories.push({ ...category, depth: 0 });
      }
    });
    return categories;
  };

  const categoryOptions = (selected = "") =>
    sortedCategories()
      .map((category) => {
        const label = `${"— ".repeat(category.depth)}${category.nombre}`;
        return `<option value="${esc(category.id)}"${category.id === selected ? " selected" : ""}>${esc(label)}</option>`;
      })
      .join("");

  const updateCategoryControls = () => {
    if (!catalog) return;
    els.categoryFilter.innerHTML =
      '<option value="">Todas las categorías</option>' +
      sortedCategories()
        .map((category) => `<option value="${esc(category.id)}">${esc(categoryPath(category.id))}</option>`)
        .join("");
    els.categoryFilter.value = filterCategory;
    els.category.innerHTML = categoryOptions(els.category.value);
    els.newCategoryParent.innerHTML =
      '<option value="">Nivel principal</option>' +
      sortedCategories()
        .map((category) => `<option value="${esc(category.id)}">${esc(categoryPath(category.id))}</option>`)
        .join("");
    renderCategoryList();
  };

  const descendantsOf = (id) => {
    const descendants = new Set();
    const visit = (parentId) => {
      catalog.categorias
        .filter((categoria) => (categoria.padre || null) === parentId)
        .forEach((categoria) => {
          if (descendants.has(categoria.id)) return;
          descendants.add(categoria.id);
          visit(categoria.id);
        });
    };
    visit(id);
    return descendants;
  };

  const renderCategoryList = () => {
    if (!catalog || !els.categoryList) return;
    const sorted = sortedCategories();
    if (!sorted.length) {
      els.categoryList.innerHTML = '<p class="empty-list">No hay categorías cargadas.</p>';
      return;
    }
    els.categoryList.innerHTML = sorted
      .map((cat) => {
        const productCount = catalog.productos.filter((p) => p.categoria === cat.id).length;
        const path = categoryPath(cat.id);
        const hermanas = catalog.categorias
          .filter((categoria) => (categoria.padre || null) === (cat.padre || null))
          .map((categoria) => categoria.id);
        const posicion = hermanas.indexOf(cat.id);
        const bloqueadas = descendantsOf(cat.id);
        const opcionesPadre = sortedCategories()
          .filter((categoria) => categoria.id !== cat.id && !bloqueadas.has(categoria.id))
          .map(
            (categoria) =>
              `<option value="${esc(categoria.id)}"${cat.padre === categoria.id ? " selected" : ""}>${"— ".repeat(categoria.depth)}${esc(categoria.nombre)}</option>`
          )
          .join("");
        return `
          <div class="category-item" data-category-item="${esc(cat.id)}">
            <div class="category-item__info">
              <span class="category-item__name">${esc(cat.nombre)}</span>
              <span class="category-item__path">${esc(path)}</span>
            </div>
            <div class="category-item__actions">
              <span class="category-item__count">${productCount} ${productCount === 1 ? "producto" : "productos"}</span>
              <div class="category-item__move" role="group" aria-label="Mover ${esc(cat.nombre)} dentro de su nivel">
                <button class="category-item__btn" type="button" data-move-category="${esc(cat.id)}" data-dir="-1" aria-label="Subir ${esc(cat.nombre)}" title="Subir"${posicion === 0 ? " disabled" : ""}>↑</button>
                <button class="category-item__btn" type="button" data-move-category="${esc(cat.id)}" data-dir="1" aria-label="Bajar ${esc(cat.nombre)}" title="Bajar"${posicion === hermanas.length - 1 ? " disabled" : ""}>↓</button>
              </div>
              <label class="category-item__parent">
                <span>Mover a</span>
                <select data-parent-category="${esc(cat.id)}" aria-label="Elegir la categoría principal de ${esc(cat.nombre)}">
                  <option value=""${cat.padre ? "" : " selected"}>Nivel principal</option>
                  ${opcionesPadre}
                </select>
              </label>
              <button class="category-item__btn" type="button" data-rename-category="${esc(cat.id)}">Renombrar</button>
              <button class="category-item__btn category-item__btn--danger" type="button" data-delete-category="${esc(cat.id)}">Eliminar</button>
            </div>
          </div>
        `;
      })
      .join("");
  };

  // Reordena el array de categorías en profundidad para que la tienda y el
  // editor muestren el mismo orden de hermanas.
  const childOrder = () => {
    const map = new Map();
    catalog.categorias.forEach((categoria) => {
      const padre = categoria.padre || null;
      if (!map.has(padre)) map.set(padre, []);
      map.get(padre).push(categoria.id);
    });
    return map;
  };

  const applyCategoryOrder = (map) => {
    const porId = new Map(catalog.categorias.map((categoria) => [categoria.id, categoria]));
    const ordenadas = [];
    const visitar = (padre, ancestros) => {
      (map.get(padre) || []).forEach((id) => {
        const categoria = porId.get(id);
        if (!categoria || ancestros.has(id)) return;
        ordenadas.push(categoria);
        const siguientes = new Set(ancestros);
        siguientes.add(id);
        visitar(id, siguientes);
      });
    };
    visitar(null, new Set());
    catalog.categorias.forEach((categoria) => {
      if (!ordenadas.includes(categoria)) ordenadas.push(categoria);
    });
    catalog.categorias = ordenadas;
  };

  const moveCategory = (id, direction) => {
    const categoria = catalog?.categorias.find((item) => item.id === id);
    if (!categoria) return;
    const map = childOrder();
    const hermanas = map.get(categoria.padre || null) || [];
    const posicion = hermanas.indexOf(id);
    const destino = posicion + direction;
    if (posicion < 0 || destino < 0 || destino >= hermanas.length) return;
    [hermanas[posicion], hermanas[destino]] = [hermanas[destino], hermanas[posicion]];
    applyCategoryOrder(map);
    markCatalogDirty();
    updateCategoryControls();
    renderList();
    report(
      `«${categoria.nombre}» se movió ${direction < 0 ? "arriba" : "abajo"}. Guardá el catálogo para confirmar.`,
      "success"
    );
  };

  const changeCategoryParent = (id, nuevoPadre) => {
    const categoria = catalog?.categorias.find((item) => item.id === id);
    if (!categoria) return;
    if (nuevoPadre === id) {
      report("Una categoría no puede ser su propia categoría principal.", "error");
      renderCategoryList();
      return;
    }
    if (nuevoPadre) {
      const destino = catalog.categorias.find((item) => item.id === nuevoPadre);
      if (!destino) {
        report("La categoría de destino no existe.", "error");
        renderCategoryList();
        return;
      }
      const bloqueadas = descendantsOf(id);
      if (bloqueadas.has(nuevoPadre)) {
        report("No se puede mover una categoría dentro de una de sus subcategorías.", "error");
        renderCategoryList();
        return;
      }
    }

    const map = childOrder();
    const anteriores = map.get(categoria.padre || null) || [];
    const indice = anteriores.indexOf(id);
    if (indice >= 0) anteriores.splice(indice, 1);
    categoria.padre = nuevoPadre || null;
    if (!map.has(categoria.padre)) map.set(categoria.padre, []);
    map.get(categoria.padre).push(id);
    applyCategoryOrder(map);
    markCatalogDirty();
    updateCategoryControls();
    renderList();
    report(
      `«${categoria.nombre}» se movió a ${nuevoPadre ? `«${categoryPath(nuevoPadre)}»` : "Nivel principal"}. Guardá el catálogo para confirmar.`,
      "success"
    );
  };

  const renameCategory = (id) => {
    const cat = catalog?.categorias.find((c) => c.id === id);
    if (!cat) return;
    const nuevo = window.prompt(`Nuevo nombre para la categoría «${cat.nombre}»:`, cat.nombre);
    if (nuevo === null) return;
    const clean = nuevo.trim();
    if (!clean) {
      report("El nombre de la categoría no puede estar vacío.", "warning");
      return;
    }
    cat.nombre = clean;
    markCatalogDirty();
    updateCategoryControls();
    renderList();
    report(`Categoría renombrada a «${clean}». Guardá el catálogo para confirmar.`, "success");
  };

  const deleteCategory = (id) => {
    const cat = catalog?.categorias.find((c) => c.id === id);
    if (!cat) return;
    const subcats = catalog.categorias.filter((c) => c.padre === id);
    if (subcats.length > 0) {
      window.alert(`No se puede eliminar «${cat.nombre}» porque tiene ${subcats.length} subcategoría(s). Primero eliminalas o reasígnalas.`);
      return;
    }
    const productsInCat = catalog.productos.filter((p) => p.categoria === id);
    let msg = `¿Eliminar la categoría «${cat.nombre}»?`;
    if (productsInCat.length > 0) {
      msg += `\n\nAtención: Hay ${productsInCat.length} producto(s) asignado(s) a esta categoría. Si la eliminás, tendrás que asignarles otra categoría.`;
    }
    if (!window.confirm(msg)) return;

    catalog.categorias = catalog.categorias.filter((c) => c.id !== id);
    markCatalogDirty();
    updateCategoryControls();
    renderList();
    report(`Categoría «${cat.nombre}» eliminada. Guardá el catálogo para confirmar.`, "warning");
  };

  const phoneDigits = (value) => String(value || "").replace(/\D/g, "");
  const validPhone = (value) => /^\d{8,15}$/.test(phoneDigits(value));

  const branchStatus = (branch) => {
    const phone = phoneDigits(branch.telefono);
    if (phone && !/^\d{8,15}$/.test(phone)) {
      return "El teléfono debe tener entre 8 y 15 cifras.";
    }
    if (phone && (!branch.nombre.trim() || !branch.localidad.trim())) {
      return "Completá el nombre y la localidad para habilitarla.";
    }
    if (branch.nombre.trim() && branch.localidad.trim() && validPhone(phone)) {
      return "Lista para aparecer en el selector de la tienda.";
    }
    return "Todavía no aparece en la tienda. Completá los tres datos.";
  };

  const renderBranches = () => {
    if (!catalog) return;
    const branches = catalog.sucursales || [];
    els.branchList.innerHTML = branches.length
      ? branches.map((branch, index) => `
          <article class="branch-card" data-branch-index="${index}">
            <div class="branch-card__head">
              <p class="branch-card__title">${esc(branch.nombre || `Sucursal ${index + 1}`)}</p>
              <button class="text-button" type="button" data-remove-branch="${index}" aria-label="Quitar sucursal ${esc(branch.nombre || index + 1)}">Quitar</button>
            </div>
            <div class="branch-card__fields">
              <label class="field">
                <span>Nombre de la sucursal</span>
                <input type="text" maxlength="60" data-contact-index="${index}" data-contact-field="nombre" value="${esc(branch.nombre)}" placeholder="Ej.: Buenos Aires">
              </label>
              <label class="field">
                <span>Localidad o provincia</span>
                <input type="text" maxlength="80" data-contact-index="${index}" data-contact-field="localidad" value="${esc(branch.localidad)}" placeholder="Ej.: La Rioja">
              </label>
              <label class="field">
                <span>WhatsApp en formato internacional</span>
                <input type="tel" inputmode="tel" maxlength="24" data-contact-index="${index}" data-contact-field="telefono" value="${esc(branch.telefono)}" placeholder="Ej.: +54 9 3804 44-9624">
                <small>Podés escribirlo con espacios y +; al guardar se normaliza.</small>
              </label>
            </div>
            <p class="branch-card__status" data-branch-status>${esc(branchStatus(branch))}</p>
          </article>
        `).join("")
      : '<p class="empty-list">Todavía no agregaste sucursales de WhatsApp.</p>';
  };

  const selectedBranchIds = () =>
    [...els.productBranches.querySelectorAll('input[name="sucursalesDisponibles"]:checked')]
      .map((input) => input.value);

  const currentStock = () => {
    const stock = {};
    els.productBranches.querySelectorAll(".branch-availability__stock").forEach((input) => {
      const id = input.name.replace(/^stock_/, "");
      const valor = input.value.trim();
      if (valor === "") return;
      const cantidad = Number(valor);
      if (Number.isInteger(cantidad) && cantidad >= 0) stock[id] = cantidad;
    });
    return stock;
  };

  const renderProductBranches = (selectedIds = [], stock = null) => {
    if (!catalog) return;
    const stockMap = stock || currentStock();
    const branches = catalog.sucursales || [];
    els.productBranches.innerHTML = branches.length
      ? branches.map((branch, index) => {
          const label = [branch.nombre.trim(), branch.localidad.trim()]
            .filter(Boolean)
            .filter((value, position, values) => position === 0 || value.toLowerCase() !== values[0].toLowerCase())
            .join(" — ") || `Sucursal ${index + 1}`;
          const disponible = selectedIds.includes(branch.id);
          const unidades = Number.isInteger(stock?.[branch.id]) ? stock[branch.id] : "";
          return `
            <label class="branch-availability__option">
              <input type="checkbox" name="sucursalesDisponibles" value="${esc(branch.id)}"${disponible ? " checked" : ""}>
              <span data-availability-branch-name="${esc(branch.id)}">${esc(label)}</span>
              <input class="branch-availability__stock" type="number" min="0" step="1" inputmode="numeric" name="stock_${esc(branch.id)}" value="${unidades}" placeholder="u." aria-label="Unidades disponibles en ${esc(label)}"${disponible ? "" : " disabled"}>
            </label>`;
        }).join("")
      : '<p class="branch-availability__empty">Primero agregá sucursales en la sección de abajo.</p>';
  };

  const updateProductBranchLabel = (branch) => {
    const label = [branch.nombre.trim(), branch.localidad.trim()]
      .filter(Boolean)
      .filter((value, position, values) => position === 0 || value.toLowerCase() !== values[0].toLowerCase())
      .join(" — ");
    const option = [...els.productBranches.querySelectorAll("[data-availability-branch-name]")]
      .find((item) => item.dataset.availabilityBranchName === branch.id);
    if (option) option.textContent = label || "Sucursal sin nombre";
  };

  const updateBranchStatus = (index) => {
    const branch = catalog?.sucursales[index];
    const row = els.branchList.querySelector(`[data-branch-index="${index}"]`);
    const status = row?.querySelector("[data-branch-status]");
    const title = row?.querySelector(".branch-card__title");
    const remove = row?.querySelector("[data-remove-branch]");
    if (!branch || !status) return;
    status.textContent = branchStatus(branch);
    if (title) title.textContent = branch.nombre.trim() || `Sucursal ${index + 1}`;
    if (remove) remove.setAttribute("aria-label", `Quitar sucursal ${branch.nombre.trim() || index + 1}`);
  };

  const imageURL = (src) => {
    if (!src) return "";
    if (/^(?:https?:|data:|blob:)/i.test(src)) return src;
    const path = src.split("?")[0].replace(/^\/+/, "");
    return new URL(`../../${path}`, location.href).href;
  };

  const imageFor = (product) => {
    const image = (product.imagenes || [])[0];
    return typeof image === "string" ? { src: image, alt: product.nombre } : image;
  };

  const visibleProducts = () => {
    if (!catalog) return [];
    const normalizedQuery = query.trim().toLocaleLowerCase("es-AR");
    return catalog.productos.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        `${product.nombre} ${product.id} ${product.descripcion || ""} ${product.descripcionLarga || ""}`
          .toLocaleLowerCase("es-AR")
          .includes(normalizedQuery);
      const matchesCategory =
        !filterCategory ||
        product.categoria === filterCategory ||
        categoryPath(product.categoria).startsWith(categoryPath(filterCategory));
      return matchesQuery && matchesCategory;
    });
  };

  const renderList = () => {
    if (!catalog) return;
    const products = visibleProducts();
    els.total.textContent = catalog.productos.length;
    els.list.innerHTML = products.length
      ? products
          .map((product) => {
            const image = imageFor(product);
            const active = product.id === selectedId;
            const pending = product.imagenes?.some((item) => item.pendingFileKey);
            return `
              <button class="product-item" type="button" role="listitem" data-product-id="${esc(product.id)}" aria-current="${active}">
                ${
                  image?.src
                    ? `<img src="${esc(imageURL(image.src))}" alt="" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="product-item__placeholder" hidden>${esc(product.nombre.slice(0, 1).toUpperCase())}</span>`
                    : `<span class="product-item__placeholder">${esc(product.nombre.slice(0, 1).toUpperCase())}</span>`
                }
                <span class="product-item__copy">
                  <span class="product-item__name">${esc(product.nombre)}</span>
                  <span class="product-item__category">${esc(categoryPath(product.categoria))}</span>
                </span>
                ${pending ? '<span class="draft-mark" aria-label="Foto pendiente de guardar">Foto nueva</span>' : ""}
                ${
                  instagramRegistro(product.id)
                    ? `<span class="draft-mark draft-mark--ig" title="Instagram: ${esc(instagramRegistro(product.id).estado)}">IG</span>`
                    : ""
                }
              </button>`;
          })
          .join("")
      : '<p class="empty-list">No hay productos con esa búsqueda.</p>';
  };

  const cleanupPendingFiles = (images = formImages) => {
    images.forEach((image) => {
      if (!image.pendingFileKey) return;
      const referencedByDraft = catalog?.productos.some((product) =>
        product.imagenes?.some((item) => item.pendingFileKey === image.pendingFileKey)
      );
      if (referencedByDraft) return;
      const pending = pendingFiles.get(image.pendingFileKey);
      if (pending) {
        new Set([pending.previewUrl, pending.sourcePreviewUrl]).forEach((url) => {
          if (url) URL.revokeObjectURL(url);
        });
      }
      pendingFiles.delete(image.pendingFileKey);
    });
  };

  const setFormEnabled = (enabled) => {
    els.fields.disabled = !enabled;
    els.placeholder.hidden = enabled;
    els.form.hidden = !enabled;
  };

  const renderVariants = () => {
    if (!els.variantsList) return;
    if (!formVariants.length) {
      els.variantsList.innerHTML = '<p class="image-guidance">No hay variantes agregadas (usa el precio general del producto).</p>';
      return;
    }
    els.variantsList.innerHTML = formVariants
      .map(
        (variant, index) => `
        <div class="variant-row" data-variant-index="${index}">
          <div class="field">
            <label>Tamaño / Opción <span aria-hidden="true">*</span></label>
            <input type="text" data-variant-field="nombre" data-variant-index="${index}" value="${esc(variant.nombre)}" placeholder="Ej.: 10 cm, 15 cm..." maxlength="80">
          </div>
          <div class="field">
            <label>Precio de esta opción</label>
            <input type="text" data-variant-field="precio" data-variant-index="${index}" value="${esc(variant.precio)}" placeholder="Ej.: $15.000" maxlength="40">
          </div>
          <button class="variant-row__remove" type="button" data-remove-variant="${index}" aria-label="Quitar variante">Quitar</button>
        </div>`
      )
      .join("");
  };

  const resetForm = () => {
    cleanupPendingFiles();
    formImages = [];
    formVideos = [];
    formVariants = [];
    formDirty = false;
    creating = false;
    selectedId = null;
    els.form.reset();
    renderProductBranches([]);
    updateDescriptionCounts();
    els.id.readOnly = false;
    els.delete.hidden = true;
    if (els.duplicate) els.duplicate.hidden = true;
    els.formTitle.textContent = "Elegí un producto";
    activarFormTab("medios");
    els.imageList.innerHTML = "";
    renderVideos();
    renderVariants();
    setFormEnabled(false);
    updatePublishButton();
    renderList();
  };

  const askBeforeLeavingForm = () => {
    if (!formDirty) return true;
    return window.confirm("Tenés cambios en la ficha que todavía no guardaste como borrador. ¿Descartarlos?");
  };

  const startNewProduct = () => {
    if (!askBeforeLeavingForm()) return;
    cleanupPendingFiles();
    formImages = [];
    formVideos = [];
    formVariants = [];
    formDirty = false;
    selectedId = null;
    creating = true;
    els.form.reset();
    updateDescriptionCounts();
    delete els.id.dataset.edited;
    els.formTitle.textContent = "Nuevo producto";
    els.id.readOnly = false;
    els.delete.hidden = true;
    if (els.duplicate) els.duplicate.hidden = true;
    els.imageList.innerHTML = "";
    renderVideos();
    renderVariants();
    setFormEnabled(true);
    updatePublishButton();
    updateCategoryControls();
    els.category.selectedIndex = catalog.categorias.length ? 0 : -1;
    renderProductBranches((catalog.sucursales || []).map((branch) => branch.id));
    renderList();
    activarFormTab("medios", true);
  };

  const duplicateProduct = () => {
    if (!selectedId || !catalog) return;
    const original = catalog.productos.find((item) => item.id === selectedId);
    if (!original) return;
    if (!askBeforeLeavingForm()) return;

    cleanupPendingFiles();
    creating = true;
    selectedId = null;
    els.form.reset();

    let newId = `${original.id}-copia`;
    let suffix = 2;
    const existingIds = new Set(catalog.productos.map((p) => p.id));
    while (existingIds.has(newId)) {
      newId = `${original.id}-copia-${suffix++}`;
    }

    els.name.value = `${original.nombre} (Copia)`;
    els.id.value = newId;
    els.id.readOnly = false;
    delete els.id.dataset.edited;
    updateCategoryControls();
    els.category.value = original.categoria || "";
    els.description.value = original.descripcion || "";
    els.longDescription.value = original.descripcionLarga || "";
    Object.entries(detailFields).forEach(([key, field]) => {
      field.value = original.detalles?.[key] || "";
    });
    els.price.value = original.precio || "";
    els.priceNote.value = original.notaPrecio || "";
    renderProductBranches(
      Array.isArray(original.sucursalesDisponibles)
        ? original.sucursalesDisponibles
        : (catalog.sucursales || []).map((branch) => branch.id),
      original.stockPorSucursal || {}
    );

    formImages = (original.imagenes || []).map((img) => ({ ...img }));
    formVideos = (original.videos || []).map((video) =>
      typeof video === "string" ? { src: video, title: "" } : { ...video }
    );
    formVariants = (original.variantes || []).map((v) => ({ ...v }));
    els.formTitle.textContent = `Nueva copia de ${original.nombre}`;
    els.delete.hidden = true;
    if (els.duplicate) els.duplicate.hidden = true;
    setFormEnabled(true);
    formDirty = true;
    updatePublishButton();
    renderImages();
    renderVideos();
    renderVariants();
    updateDescriptionCounts();
    renderList();
    activarFormTab("datos");
    els.name.focus();
    els.name.select();
    report(`Ficha duplicada como «${newId}». Modificá los datos y guardala como borrador.`, "success");
  };

  const editProduct = (id) => {
    if (!askBeforeLeavingForm()) return;
    cleanupPendingFiles();
    const product = catalog.productos.find((item) => item.id === id);
    if (!product) return;

    creating = false;
    selectedId = id;
    formDirty = false;
    formImages = (product.imagenes || []).map((image) =>
      typeof image === "string"
        ? { src: image, alt: product.nombre }
        : {
            ...(image.src ? { src: image.src } : {}),
            alt: image.alt || product.nombre,
            ...(image.pendingFileKey ? { pendingFileKey: image.pendingFileKey } : {}),
          }
    );
    formVideos = (product.videos || []).map((video) =>
      typeof video === "string" ? { src: video, title: "" } : { ...video }
    );
    formVariants = (product.variantes || []).map((v) => ({ ...v }));
    els.form.reset();
    els.name.value = product.nombre || "";
    els.id.value = product.id;
    els.id.readOnly = true;
    updateCategoryControls();
    els.category.value = product.categoria || "";
    els.description.value = product.descripcion || "";
    els.longDescription.value = product.descripcionLarga || "";
    Object.entries(detailFields).forEach(([key, field]) => {
      field.value = product.detalles?.[key] || "";
    });
    els.price.value = product.precio || "";
    els.priceNote.value = product.notaPrecio || "";
    renderProductBranches(
      Array.isArray(product.sucursalesDisponibles)
        ? product.sucursalesDisponibles
        : (catalog.sucursales || []).map((branch) => branch.id),
      product.stockPorSucursal || {}
    );
    els.formTitle.textContent = product.nombre;
    els.delete.hidden = false;
    if (els.duplicate) els.duplicate.hidden = false;
    setFormEnabled(true);
    updatePublishButton();
    renderImages();
    renderVideos();
    renderVariants();
    updateDescriptionCounts();
    renderList();
  };

  const renderVideos = () => {
    if (!els.videoList) return;
    if (!formVideos.length) {
      els.videoList.innerHTML =
        '<p class="image-guidance">Todavía no hay videos. Podés agregar uno para mostrar la fabricación o el producto en uso.</p>';
      return;
    }
    els.videoList.innerHTML = formVideos
      .map((video, index) => {
        const label = video.title || "Video del producto";
        return `
          <article class="image-card image-card--video" data-video-index="${index}">
            <div class="image-card__preview${video.src ? "" : " image-card__preview--missing"}">
              ${
                video.src
                  ? `<video src="${esc(video.src)}" controls playsinline preload="metadata" aria-label="${esc(label)}"></video>`
                  : video.uploading
                    ? "Subiendo video…"
                    : video.error
                      ? "No se pudo guardar el video."
                      : "El video se agrega cuando guardes el catálogo."
              }
            </div>
            <div class="image-card__meta">
              <span class="image-card__filename" title="${esc(video.src || label)}">${esc(video.src?.split("?")[0].split("/").pop() || label)}</span>
              <label>
                Título del video
                <input type="text" data-video-title="${index}" value="${esc(video.title || "")}" maxlength="120" placeholder="Ej.: Fabricación capa por capa">
              </label>
              ${video.error ? `<p class="image-card__error" role="alert">${esc(video.error)}</p>` : ""}
              ${video.error && video.file ? `<button class="image-card__toggle" type="button" data-retry-video="${index}">Reintentar subida</button>` : ""}
              <button class="image-card__remove" type="button" data-remove-video="${index}"${video.uploading ? " disabled" : ""}>Quitar este video</button>
            </div>
          </article>`;
      })
      .join("");
  };

  const renderImages = () => {
    const totalImages = formImages.length;
    els.imageList.innerHTML = formImages
      .map((image, index) => {
        const pending = image.pendingFileKey && pendingFiles.get(image.pendingFileKey);
        const preview = pending?.processing
          ? pending.sourcePreviewUrl
          : pending?.showOriginal
            ? pending.sourcePreviewUrl
            : pending?.previewUrl || imageURL(image.src);
        const label = pending?.file?.name || pending?.sourceFile?.name || image.src?.split("?")[0].split("/").pop() || "Foto nueva";
        const isCover = index === 0;
        return `
          <article class="image-card" data-image-index="${index}">
            <div class="image-card__order-bar">
              <div class="image-card__order-btns">
                <button class="image-card__order-btn" type="button" data-move-image="${index}" data-dir="-1" title="Mover a la izquierda"${index === 0 ? " disabled" : ""}>←</button>
                <button class="image-card__order-btn" type="button" data-move-image="${index}" data-dir="1" title="Mover a la derecha"${index === totalImages - 1 ? " disabled" : ""}>→</button>
              </div>
              <span class="image-card__order-num">${index + 1} de ${totalImages}</span>
              ${isCover
                ? '<span class="image-card__cover-tag">★ Portada</span>'
                : `<button class="image-card__cover-btn" type="button" data-set-cover="${index}">Hacer portada</button>`}
            </div>
            <div class="image-card__preview${preview ? "" : " image-card__preview--missing"}">
              ${preview ? `<img src="${esc(preview)}" alt="">` : pending?.processing ? "Preparando foto…" : "La foto se agrega cuando guardes el catálogo."}
            </div>
            <div class="image-card__meta">
              <span class="image-card__filename" title="${esc(label)}">${esc(label)}</span>
              ${pending?.processing ? '<span class="image-card__processing">Quitando el fondo…</span>' : ""}
              ${
                pending && !pending.processing
                  ? `<button class="image-card__toggle" type="button" data-toggle-original="${index}" aria-pressed="${pending.showOriginal}">${pending.showOriginal ? "Ver recorte listo" : "Ver foto original"}</button>`
                  : ""
              }
              <label>
                Texto para lectores de pantalla
                <input type="text" data-image-alt="${index}" value="${esc(image.alt || "")}" maxlength="160" placeholder="Qué se ve en la foto">
              </label>
              <button class="image-card__remove" type="button" data-remove-image="${index}">Quitar esta foto</button>
            </div>
          </article>`;
      })
      .join("");
  };

  const validateCatalog = (data) => {
    if (!data || !Array.isArray(data.categorias) || !Array.isArray(data.productos)) {
      throw new Error("El archivo tiene que incluir las listas «categorias» y «productos».");
    }
    if (data.sucursales !== undefined && !Array.isArray(data.sucursales)) {
      throw new Error("La lista «sucursales» tiene un formato inválido.");
    }
    (data.sucursales || []).forEach((branch, index) => {
      if (
        !branch ||
        typeof branch.nombre !== "string" ||
        typeof branch.localidad !== "string" ||
        typeof branch.telefono !== "string"
      ) {
        throw new Error(`La sucursal ${index + 1} necesita nombre, localidad y teléfono.`);
      }
      const phone = phoneDigits(branch.telefono);
      if (phone && !/^\d{8,15}$/.test(phone)) {
        throw new Error(`El WhatsApp de «${branch.nombre || `la sucursal ${index + 1}`}» debe tener entre 8 y 15 cifras.`);
      }
      if (phone && (!branch.nombre.trim() || !branch.localidad.trim())) {
        throw new Error(`Completá el nombre y la localidad de «${branch.nombre || `la sucursal ${index + 1}`}».`);
      }
      if (typeof branch.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(branch.id)) {
        throw new Error(`La sucursal ${index + 1} necesita un ID válido.`);
      }
    });
    const branchIds = (data.sucursales || []).map((branch) => branch.id);
    if (new Set(branchIds).size !== branchIds.length) {
      throw new Error("Cada sucursal necesita un ID distinto.");
    }

    const categoryIds = new Set();
    data.categorias.forEach((category, index) => {
      if (!category || typeof category.id !== "string" || !category.id || typeof category.nombre !== "string" || !category.nombre.trim()) {
        throw new Error(`La categoría ${index + 1} necesita un ID y un nombre.`);
      }
      if (categoryIds.has(category.id)) throw new Error(`El ID de categoría «${category.id}» está repetido.`);
      categoryIds.add(category.id);
    });

    const productIds = new Set();
    data.productos.forEach((product, index) => {
      if (!product || typeof product.id !== "string" || !product.id || typeof product.nombre !== "string" || !product.nombre.trim()) {
        throw new Error(`El producto ${index + 1} necesita un ID y un nombre.`);
      }
      if (productIds.has(product.id)) throw new Error(`El ID de producto «${product.id}» está repetido.`);
      productIds.add(product.id);
      if (!categoryIds.has(product.categoria)) {
        throw new Error(`«${product.nombre}» tiene una categoría que no existe.`);
      }
      if (typeof product.descripcion === "string" && product.descripcion.length > 300) {
        throw new Error(`La descripción corta de «${product.nombre}» supera los 300 caracteres.`);
      }
      if (typeof product.descripcionLarga === "string" && product.descripcionLarga.length > 2000) {
        throw new Error(`La descripción completa de «${product.nombre}» supera los 2000 caracteres.`);
      }
      if (
        product.sucursalesDisponibles !== undefined &&
        (!Array.isArray(product.sucursalesDisponibles) ||
          product.sucursalesDisponibles.some((id) => typeof id !== "string" || !branchIds.includes(id)))
      ) {
        throw new Error(`Las sucursales disponibles de «${product.nombre}» tienen un formato inválido.`);
      }
      if (product.detalles != null && (typeof product.detalles !== "object" || Array.isArray(product.detalles))) {
        throw new Error(`Los detalles de «${product.nombre}» tienen un formato inválido.`);
      }
      Object.entries(product.detalles || {}).forEach(([key, value]) => {
        if (typeof value !== "string") {
          throw new Error(`El detalle «${key}» de «${product.nombre}» debe ser texto.`);
        }
      });
      if (product.imagenes && !Array.isArray(product.imagenes)) {
        throw new Error(`Las fotos de «${product.nombre}» tienen un formato inválido.`);
      }
      if (product.videos !== undefined) {
        if (!Array.isArray(product.videos)) {
          throw new Error(`Los videos de «${product.nombre}» tienen un formato inválido.`);
        }
        product.videos.forEach((video, videoIndex) => {
          if (!video || typeof video.src !== "string" || !/\.(mp4|webm|mov)(\?|$)/i.test(video.src)) {
            throw new Error(`El video ${videoIndex + 1} de «${product.nombre}» necesita un archivo MP4, WEBM o MOV.`);
          }
          if (video.title !== undefined && typeof video.title !== "string") {
            throw new Error(`El título del video ${videoIndex + 1} de «${product.nombre}» debe ser texto.`);
          }
        });
      }
      if (product.variantes !== undefined) {
        if (!Array.isArray(product.variantes)) {
          throw new Error(`Las variantes de «${product.nombre}» tienen un formato inválido.`);
        }
        product.variantes.forEach((v, vIndex) => {
          if (!v || typeof v.nombre !== "string" || !v.nombre.trim()) {
            throw new Error(`La variante ${vIndex + 1} de «${product.nombre}» necesita un nombre.`);
          }
        });
      }
    });
  };

  const parseCatalog = (text) => {
    const data = JSON.parse(text);
    if (data && typeof data === "object" && !Array.isArray(data) && !("sucursales" in data)) {
      data.sucursales = [{
        nombre: "Buenos Aires",
        localidad: "Buenos Aires",
        telefono: SHOP.whatsapp,
      }];
    }
    if (data && Array.isArray(data.sucursales)) ensureBranchIds(data);
    validateCatalog(data);
    return data;
  };

  const hasPermission = async (handle, request = false) => {
    const options = { mode: "readwrite" };
    const current = await handle.queryPermission(options);
    if (current === "granted") return true;
    if (!request) return false;
    return (await handle.requestPermission(options)) === "granted";
  };

  const loadFromHandle = async (handle) => {
    if (!(await hasPermission(handle, true))) {
      throw new Error("No se concedió permiso para leer y guardar en esa carpeta.");
    }
    const dataDirectory = await handle.getDirectoryHandle("data");
    const catalogFile = await dataDirectory.getFileHandle("catalog.json");
    const text = await (await catalogFile.getFile()).text();
    const parsed = parseCatalog(text);

    projectHandle = handle;
    catalog = parsed;
    originalCatalogText = text;
    catalogDirty = false;
    catalogSavedForPublish = false;
    filterCategory = "";
    query = "";
    els.search.value = "";
    updateCategoryControls();
    renderBranches();
    renderList();
    resetForm();
    setConnected(true);
    els.saveCatalog.disabled = true;
    report(`Catálogo cargado: ${catalog.productos.length} productos.`, "success");
  };

  const selectProjectFolder = async () => {
    if (typeof window.showDirectoryPicker !== "function") {
      els.connect.hidden = true;
      els.fallbackImport.hidden = false;
      report(
        "Este navegador no permite elegir la carpeta del sitio. Abrí el editor desde la app Agresti.3D — Editor (o con python3 tools/catalogo/servidor.py) y, si hace falta, cargá data/catalog.json desde el panel de abajo.",
        "warning"
      );
      return;
    }
    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      await loadFromHandle(handle);
    } catch (error) {
      if (error.name === "AbortError") return;
      if (error instanceof TypeError || /showDirectoryPicker/i.test(error.message)) {
        els.connect.hidden = true;
        els.fallbackImport.hidden = false;
        report(
          "Este navegador no permite elegir la carpeta del sitio. Abrí el editor desde la app Agresti.3D — Editor (o con python3 tools/catalogo/servidor.py) y, si hace falta, cargá data/catalog.json desde el panel de abajo.",
          "warning"
        );
        return;
      }
      report(`No se pudo abrir la carpeta: ${error.message}`, "error");
    }
  };

  const timestamp = () => {
    const date = new Date();
    const part = (number) => String(number).padStart(2, "0");
    return `${date.getFullYear()}${part(date.getMonth() + 1)}${part(date.getDate())}-${part(date.getHours())}${part(date.getMinutes())}${part(date.getSeconds())}`;
  };

  const writeFile = async (directoryHandle, name, contents) => {
    const fileHandle = await directoryHandle.getFileHandle(name, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(contents);
    await writable.close();
  };

  const createBackup = async () => {
    const tools = await projectHandle.getDirectoryHandle("tools", { create: true });
    const editor = await tools.getDirectoryHandle("catalogo", { create: true });
    const backups = await editor.getDirectoryHandle("backups", { create: true });
    const name = `catalog-${timestamp()}-${Math.random().toString(36).slice(2, 6)}.json`;
    await writeFile(backups, name, originalCatalogText);
    return `tools/catalogo/backups/${name}`;
  };

  const hasPendingPhotos = (products) =>
    products.some((product) => product.imagenes?.some((image) => image.pendingFileKey));

  const writePendingPhotos = async (products) => {
    if (!hasPendingPhotos(products)) return;
    if (!projectHandle) {
      for (const product of products) {
        for (const image of product.imagenes || []) {
          if (!image.pendingFileKey) continue;
          const pending = pendingFiles.get(image.pendingFileKey);
          if (!pending || pending.processing || !pending.file) {
            throw new Error("Se perdió una foto procesada. Volvé a cargarla.");
          }
          const response = await fetch("/__local/save-photo", {
            method: "POST",
            headers: {
              "Content-Type": "image/webp",
              "X-Product-Id": product.id,
            },
            body: pending.file,
          });
          const path = (await response.text()).trim();
          if (!response.ok) throw new Error(path || `No se pudo guardar la foto (${response.status}).`);
          image.src = `${path}?v=1`;
          delete image.pendingFileKey;
        }
      }
      return;
    }

    const imageDirectory = await projectHandle
      .getDirectoryHandle("img")
      .then((directory) => directory.getDirectoryHandle("productos"));
    const now = timestamp();
    let sequence = 1;
    const fileNames = new Set();

    for (const product of products) {
      for (const image of product.imagenes || []) {
        if (!image.pendingFileKey) continue;
        const pending = pendingFiles.get(image.pendingFileKey);
        if (!pending || pending.processing || !pending.file) {
          throw new Error("Se perdió una foto procesada. Volvé a cargarla.");
        }
        const extension = pending.file.name.toLowerCase().split(".").pop();
        if (extension !== "webp" || (pending.file.type && pending.file.type !== "image/webp")) {
          throw new Error(`«${pending.file.name}» no es WEBP. Convertí la foto a WEBP antes de agregarla.`);
        }

        let filename;
        do {
          filename = `${product.id}-nueva-${now}-${String(sequence++).padStart(2, "0")}.webp`;
        } while (fileNames.has(filename) || (await exists(imageDirectory, filename)));
        fileNames.add(filename);
        await writeFile(imageDirectory, filename, pending.file);
        image.src = `img/productos/${filename}?v=1`;
        delete image.pendingFileKey;
      }
    }
  };

  const exists = async (directory, name) => {
    try {
      await directory.getFileHandle(name);
      return true;
    } catch (error) {
      if (error.name === "NotFoundError") return false;
      throw error;
    }
  };

  const cleanCatalog = (data) => ({
    sucursales: (data.sucursales || []).map((branch) => ({
      id: branch.id,
      nombre: branch.nombre.trim(),
      localidad: branch.localidad.trim(),
      telefono: phoneDigits(branch.telefono),
    })),
    categorias: data.categorias.map((category) => ({
      id: category.id,
      nombre: category.nombre,
      padre: category.padre || null,
    })),
    productos: data.productos.map((product) => ({
      ...product,
      ...(Array.isArray(product.variantes) && product.variantes.length
        ? {
            variantes: product.variantes
              .map((v) => ({
                nombre: String(v.nombre || "").trim(),
                precio: String(v.precio || "").trim(),
              }))
              .filter((v) => v.nombre.length > 0),
          }
        : {}),
      imagenes: (product.imagenes || []).map((image) => ({
        src: image.src,
        alt: image.alt || product.nombre,
      })),
    })),
  });

  const downloadText = (contents, filename, type) => {
    const blob = new Blob([contents], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const releasePendingFiles = () => {
    pendingFiles.forEach((pending) => {
      new Set([pending.previewUrl, pending.sourcePreviewUrl]).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    });
    pendingFiles.clear();
  };

  const exportCatalog = () => {
    if (!catalog) return;
    if (hasPendingPhotos(catalog.productos)) {
      report("Guardá el catálogo antes de descargar una copia: hay fotos nuevas sin guardar.", "warning");
      return;
    }
    const cleaned = cleanCatalog(catalog);
    validateCatalog(cleaned);
    downloadText(`${JSON.stringify(cleaned, null, 2)}\n`, "catalog.json", "application/json");
    report("Descargamos una copia de catalog.json.", "success");
  };

  const commitCurrentForm = (silent = false) => {
    if (!catalog) return false;
    const formData = new FormData(els.form);
    const name = String(formData.get("nombre") || "").trim();
    const id = String(formData.get("id") || slugify(name)).trim();
    const category = String(formData.get("categoria") || "");

    if (!name) {
      activarFormTab("datos");
      els.name.focus();
      report("Escribí el nombre del producto.", "error");
      return false;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
      activarFormTab("datos");
      els.id.focus();
      report("El ID debe tener minúsculas, números y guiones, sin espacios.", "error");
      return false;
    }
    const duplicate = catalog.productos.some((product) => product.id === id && (creating || product.id !== selectedId));
    if (duplicate) {
      activarFormTab("datos");
      els.id.focus();
      report(`Ya existe un producto con el ID «${id}».`, "error");
      return false;
    }
    if (!catalog.categorias.some((item) => item.id === category)) {
      activarFormTab("datos");
      els.category.focus();
      report("Elegí una categoría válida.", "error");
      return false;
    }
    if (formImages.some((image) => {
      if (!image.pendingFileKey) return false;
      const pending = pendingFiles.get(image.pendingFileKey);
      return !pending || pending.processing || !pending.file;
    })) {
      report("Esperá a que termine el recorte de las fotos antes de guardar.", "warning");
      return false;
    }
    if (formVideos.some((video) => video.uploading)) {
      report("Esperá a que termine de subir el video antes de guardar.", "warning");
      return false;
    }

    const previousProduct = !creating
      ? catalog.productos.find((item) => item.id === selectedId)
      : null;
    const product = {
      ...(previousProduct || {}),
      id,
      nombre: name,
      categoria: category,
      descripcion: String(formData.get("descripcion") || "").trim(),
      descripcionLarga: String(formData.get("descripcionLarga") || "").trim(),
      sucursalesDisponibles: selectedBranchIds(),
      imagenes: formImages.map((image) => ({
        ...(image.src ? { src: image.src } : {}),
        alt: image.alt || name,
        ...(image.pendingFileKey ? { pendingFileKey: image.pendingFileKey } : {}),
      })),
      precio: String(formData.get("precio") || "").trim(),
      notaPrecio: String(formData.get("notaPrecio") || "").trim(),
    };
    if (!product.descripcion) delete product.descripcion;
    if (!product.descripcionLarga) delete product.descripcionLarga;

    // Stock real por sucursal: solo se guardan las sucursales elegidas y con
    // una cantidad entera. Si no se cargó ninguna, el campo queda afuera.
    const stockCargado = currentStock();
    const stockPorSucursal = {};
    product.sucursalesDisponibles.forEach((id) => {
      if (Number.isInteger(stockCargado[id])) stockPorSucursal[id] = stockCargado[id];
    });
    if (Object.keys(stockPorSucursal).length) product.stockPorSucursal = stockPorSucursal;
    else delete product.stockPorSucursal;
    const videosFallidos = formVideos.filter((video) => video.error).length;
    product.videos = formVideos
      .map((video) => ({
        src: video.src,
        title: String(video.title || "").trim(),
      }))
      .filter((video) => video.src);
    if (!product.videos.length) delete product.videos;
    const detalles = { ...(previousProduct?.detalles || {}) };
    Object.entries(detailFields).forEach(([key, field]) => {
      const value = String(formData.get(`detalle_${key}`) || "").trim();
      if (value) detalles[key] = value;
      else delete detalles[key];
    });
    if (Object.keys(detalles).length) product.detalles = detalles;
    else delete product.detalles;
    if (!product.precio) product.precio = "";
    if (!product.notaPrecio) delete product.notaPrecio;
    const cleanVariants = formVariants
      .map((v) => ({
        nombre: String(v.nombre || "").trim(),
        precio: String(v.precio || "").trim(),
      }))
      .filter((v) => v.nombre.length > 0);
    if (cleanVariants.length) product.variantes = cleanVariants;
    else delete product.variantes;

    product.imagenes = product.imagenes.map((image) => {
      if (image.pendingFileKey) return image;
      return { src: image.src, alt: image.alt };
    });

    if (creating) {
      catalog.productos.push(product);
      creating = false;
      selectedId = id;
    } else {
      const index = catalog.productos.findIndex((item) => item.id === selectedId);
      if (index < 0) return false;
      catalog.productos[index] = product;
      if (id !== selectedId) selectedId = id;
    }

    formImages = product.imagenes.map((image) => ({ ...image }));
    formVideos = (product.videos || []).map((video) => ({ ...video }));
    formDirty = false;
    catalogDirty = true;
    markCatalogDirty();
    els.id.value = id;
    els.id.readOnly = true;
    els.formTitle.textContent = name;
    els.delete.hidden = false;
    if (els.duplicate) els.duplicate.hidden = false;
    if (!silent) {
      report("Ficha guardada como borrador. Guardá el catálogo en esta computadora para confirmar.", "success");
    }
    if (videosFallidos) {
      report(
        `La ficha se guardó sin ${videosFallidos === 1 ? "el video que no se pudo subir" : `${videosFallidos} videos que no se pudieron subir`}. Reintentá o volvé a agregarlos.`,
        "warning"
      );
    }
    updateCategoryControls();
    renderList();
    renderImages();
    renderVideos();
    return true;
  };

  const saveCatalog = async () => {
    if (!catalog) return;
    if (formDirty) {
      const saved = commitCurrentForm(true);
      if (!saved) return;
    }
    if (!catalogDirty) {
      report("No hay cambios pendientes para guardar en el catálogo.", "info");
      return;
    }

    try {
      const cleaned = cleanCatalog(catalog);
      validateCatalog(cleaned);

      if (!projectHandle) {
        await writePendingPhotos(catalog.productos);
        const finalCatalog = cleanCatalog(catalog);
        validateCatalog(finalCatalog);
        const contents = `${JSON.stringify(finalCatalog, null, 2)}\n`;
        const response = await fetch("/__local/save-catalog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: contents,
        });
        const message = (await response.text()).trim();
        if (!response.ok) throw new Error(message || `No se pudo guardar el catálogo (${response.status}).`);

        catalog = finalCatalog;
        originalCatalogText = contents;
        releasePendingFiles();
        catalogDirty = false;
        formDirty = false;
        catalogSavedForPublish = true;
        els.saveCatalog.disabled = true;
        els.saveCatalog.textContent = "Catálogo guardado en esta computadora";
        updatePublishButton();
        report(message, "success");
        renderBranches();
        if (selectedId) editProduct(selectedId);
        renderList();
        return;
      }

      if (!(await hasPermission(projectHandle, true))) {
        throw new Error("No se concedió permiso para guardar en la carpeta del proyecto.");
      }

      els.badge.dataset.state = "saving";
      els.badge.textContent = "Guardando…";
      els.saveCatalog.disabled = true;
      await createBackup();
      await writePendingPhotos(catalog.productos);
      const finalCatalog = cleanCatalog(catalog);
      validateCatalog(finalCatalog);
      const dataDirectory = await projectHandle.getDirectoryHandle("data");
      await writeFile(dataDirectory, "catalog.json", `${JSON.stringify(finalCatalog, null, 2)}\n`);
      // Copia embebida para poder abrir el editor como archivo local.
      await writeFile(
        dataDirectory,
        "catalog.js",
        `window.__AGRESTI_CATALOG__ = ${JSON.stringify(finalCatalog, null, 2)};\n`
      );

      catalog = finalCatalog;
      originalCatalogText = `${JSON.stringify(finalCatalog, null, 2)}\n`;
      releasePendingFiles();
      catalogDirty = false;
      formDirty = false;
      catalogSavedForPublish = true;
      els.badge.dataset.state = "connected";
      els.badge.textContent = "Carpeta conectada";
      els.saveCatalog.disabled = true;
      els.saveCatalog.textContent = "Catálogo guardado en esta computadora";
      updatePublishButton();
      report(`Catálogo guardado en esta computadora con ${catalog.productos.length} productos. Ya podés publicarlo en la web.`, "success");
      renderBranches();
      if (selectedId) editProduct(selectedId);
      renderList();
    } catch (error) {
      els.badge.dataset.state = catalog ? "connected" : "offline";
      els.badge.textContent = projectHandle ? "Carpeta conectada" : catalog ? "Catálogo cargado" : "Sin conectar";
      els.saveCatalog.disabled = false;
      updatePublishButton();
      report(`No se guardó el catálogo: ${error.message}`, "error");
    }
  };

  const handleFallbackImport = async (file) => {
    try {
      const text = await file.text();
      catalog = parseCatalog(text);
      originalCatalogText = text;
      projectHandle = null;
      catalogDirty = false;
      catalogSavedForPublish = false;
      filterCategory = "";
      query = "";
      updateCategoryControls();
      renderBranches();
      renderList();
      resetForm();
      setConnected(true);
      els.fallbackExport.hidden = false;
      report(`Catálogo cargado: ${catalog.productos.length} productos. Al guardar, el editor actualiza el archivo del proyecto.`, "success");
    } catch (error) {
      report(`No se pudo leer el catálogo: ${error.message}`, "error");
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    commitCurrentForm(false);
  };

  const saveBranches = async () => {
    if (!catalog) return;
    if (formDirty) {
      const ok = commitCurrentForm(true);
      if (!ok) return;
    }
    catalogDirty = true;
    await saveCatalog();
    report("Sucursales de WhatsApp guardadas en esta computadora.", "success");
  };

  const removeProduct = () => {
    if (!selectedId) return;
    const product = catalog.productos.find((item) => item.id === selectedId);
    if (!product || !window.confirm(`¿Eliminar «${product.nombre}» del catálogo? La foto original no se borra.`)) return;
    const removed = catalog.productos.filter((item) => item.id === selectedId);
    removed.forEach((item) => cleanupPendingFiles(item.imagenes || []));
    catalog.productos = catalog.productos.filter((item) => item.id !== selectedId);
    markCatalogDirty();
    resetForm();
    report(`«${product.nombre}» se quitó del borrador. Guardá el catálogo para confirmar.`, "warning");
  };

  const processImage = async (file) => {
    let response;
    try {
      response = await fetch("/__local/process-photo", {
        method: "POST",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
          "X-File-Name": encodeURIComponent(file.name),
        },
        body: file,
      });
    } catch (error) {
      throw new Error("No se encontró el procesador local. Iniciá el editor con python3 tools/catalogo/servidor.py.");
    }

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `El procesador respondió con el código ${response.status}.`);
    }
    return response.blob();
  };

  const addImages = async (files) => {
    if (!files.length) return;
    const supportedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".tif", ".tiff"];
    for (const file of Array.from(files)) {
      const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
      if (!supportedExtensions.includes(extension)) {
        report(`«${file.name}» no es un formato compatible. Usá JPG, PNG, WEBP, HEIC o TIFF.`, "warning");
        continue;
      }
      if (file.size > 25 * 1024 * 1024) {
        report(`«${file.name}» supera 25 MB. Elegí una versión más liviana.`, "warning");
        continue;
      }

      const key = crypto.randomUUID();
      const sourcePreviewUrl = URL.createObjectURL(file);
      pendingFiles.set(key, {
        sourceFile: file,
        sourcePreviewUrl,
        previewUrl: sourcePreviewUrl,
        processing: true,
        showOriginal: true,
      });
      const nombreProducto = els.name.value.trim();
      formImages.push({
        alt: nombreProducto ? `${nombreProducto} impreso en 3D` : "Producto impreso en 3D",
        pendingFileKey: key,
      });
      formDirty = true;
      renderImages();
      report(`Procesando «${file.name}» en esta computadora…`, "success");

      try {
        const blob = await processImage(file);
        if (!pendingFiles.has(key)) continue;
        if (blob.type !== "image/webp" || blob.size > 300 * 1024) {
          throw new Error("El recorte no quedó en WEBP o supera 300 KB.");
        }
        const processedFile = new File(
          [blob],
          `${file.name.replace(/\.[^.]+$/, "")}.webp`,
          { type: "image/webp" }
        );
        const pending = pendingFiles.get(key);
        pending.file = processedFile;
        pending.previewUrl = URL.createObjectURL(blob);
        pending.processing = false;
        pending.showOriginal = false;
        renderImages();
        report(`Fondo eliminado de «${file.name}». Revisá el recorte antes de guardar.`, "success");
      } catch (error) {
        const pending = pendingFiles.get(key);
        if (pending) {
          new Set([pending.previewUrl, pending.sourcePreviewUrl]).forEach((url) => {
            if (url) URL.revokeObjectURL(url);
          });
          pendingFiles.delete(key);
          formImages = formImages.filter((image) => image.pendingFileKey !== key);
        }
        renderImages();
        report(`No se pudo procesar «${file.name}»: ${error.message}`, "error");
      }
    }

    els.imageFiles.value = "";
    renderImages();
  };

  const storeVideo = async (file) => {
    const productId = String(els.id.value || "").trim() || slugify(els.name.value);
    if (!catalog || !productId || (!selectedId && !creating)) {
      throw new Error("Completá el nombre del producto antes de agregar el video.");
    }
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (![".mp4", ".webm", ".mov"].includes(extension)) {
      throw new Error("El video debe ser MP4 (recomendado), WEBM o MOV.");
    }
    if (file.size > 50 * 1024 * 1024) {
      throw new Error("El video supera 50 MB. Elegí una versión más liviana.");
    }

    if (projectHandle) {
      if (!(await hasPermission(projectHandle, true))) {
        throw new Error("No se concedió permiso para guardar en la carpeta del proyecto.");
      }
      const imageDirectory = await projectHandle
        .getDirectoryHandle("img")
        .then((directory) => directory.getDirectoryHandle("productos"));
      const filename = `${productId}-video-${Date.now()}${extension}`;
      await writeFile(imageDirectory, filename, file);
      return `img/productos/${filename}`;
    }

    const response = await fetch("/__local/save-video", {
      method: "POST",
      headers: {
        "Content-Type": file.type || "video/mp4",
        "X-Product-Id": productId,
      },
      body: file,
    });
    const path = (await response.text()).trim();
    if (!response.ok) throw new Error(path || `No se pudo guardar el video (${response.status}).`);
    return path;
  };

  const addVideos = async (files) => {
    if (!files.length) return;
    if (!catalog || (!selectedId && !creating)) {
      report("Elegí un producto de la lista antes de agregar un video.", "warning");
      return;
    }
    for (const file of Array.from(files)) {
      const entry = {
        title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim(),
        uploading: true,
      };
      formVideos.push(entry);
      formDirty = true;
      pendingVideos.add(entry);
      renderVideos();
      report(`Guardando «${file.name}»…`, "info");
      try {
        entry.src = await storeVideo(file);
        entry.uploading = false;
        delete entry.file;
        delete entry.error;
        report(`Video «${file.name}» listo. Guardá el catálogo para confirmarlo.`, "success");
      } catch (error) {
        entry.uploading = false;
        entry.error = error.message;
        entry.file = file;
        report(`No se pudo guardar «${file.name}»: ${error.message}`, "error");
      } finally {
        pendingVideos.delete(entry);
      }
      renderVideos();
      updatePublishButton();
    }
    els.videoFiles.value = "";
  };


  // ---------- Instagram (fase 1: imagen + caption) ----------
  const IG_SITE = "https://agresti3d.web.app";
  const IG_HASHTAGS_BASE = [
    "#Agresti3D",
    "#Impresion3D",
    "#ImpresoEn3D",
    "#HechoEnArgentina",
    "#3DPrinting",
    "#Regalos",
    "#RegalosPersonalizados",
  ];
  const IG_HASHTAGS_CATEGORIA = {
    mates: ["#Mates", "#Mate", "#MatesArgentinos"],
    milkshakes: ["#Milkshakes", "#VasosPersonalizados"],
    deco: ["#Deco", "#Decoracion", "#Hogar"],
    navidenos: ["#Navidad", "#DecoracionNavideña", "#RegalosNavideños"],
    juguetes: ["#Juguetes", "#Figuras", "#Coleccionables"],
    figuras: ["#Figuras", "#Coleccionables"],
    llaveros: ["#Llaveros", "#Regalos"],
    accesorios: ["#Accesorios", "#3D"],
    adornos: ["#Adornos", "#Deco"],
    macetas: ["#Macetas", "#Plantas"],
    floreros: ["#Floreros", "#Deco"],
    portalatas: ["#PortaLatas", "#Cocina"],
    utensilios: ["#Utensilios", "#Cocina"],
  };
  let instagramProductoId = "";
  let instagramPreparado = false;
  let instagramFormato = "feed";
  let instagramFondo = "noche";
  try { instagramFondo = localStorage.getItem("agresti:ig-fondo") || "noche"; } catch (_) {}
  let instagramSlide = 1;

  const igStatus = (mensaje, error = false) => {
    if (!els.instagramStatus) return;
    els.instagramStatus.textContent = mensaje;
    els.instagramStatus.dataset.state = error ? "error" : "";
  };

  const igProducto = () =>
    catalog?.productos.find((producto) => producto.id === instagramProductoId) || null;

  const igCaption = (producto) => {
    const detalles = producto.detalles || {};
    const bloques = [producto.nombre];
    if (producto.descripcion) bloques.push(producto.descripcion);
    const datos = [];
    if (detalles.material) datos.push(`🧵 Material: ${detalles.material}`);
    const medidas = [detalles.altura, detalles.ancho, detalles.largo].filter(Boolean);
    if (medidas.length) datos.push(`📏 Medidas: ${medidas.join(" × ")}`);
    if (detalles.colores) datos.push(`🎨 Colores: ${detalles.colores}`);
    if (datos.length) bloques.push(datos.join("\n"));
    bloques.push(`Pedilo por WhatsApp o mirá la ficha:\n${IG_SITE}/#p=${encodeURIComponent(producto.id)}`);
    return bloques.join("\n\n").trim();
  };

  const igHashtags = (producto) => {
    const set = new Set(IG_HASHTAGS_BASE);
    let actual = catalog?.categorias.find((categoria) => categoria.id === producto.categoria);
    const vistos = new Set();
    while (actual && !vistos.has(actual.id)) {
      vistos.add(actual.id);
      (IG_HASHTAGS_CATEGORIA[actual.id] || []).forEach((tag) => set.add(tag));
      actual = catalog.categorias.find((categoria) => categoria.id === actual.padre);
    }
    return [...set].slice(0, 14).join(" ");
  };

  const igCargarImagen = (src) =>
    new Promise((resolve) => {
      const imagen = new Image();
      if (/^https?:/i.test(src)) imagen.crossOrigin = "anonymous";
      imagen.onload = () => resolve(imagen);
      imagen.onerror = () => resolve(null);
      imagen.src = src;
    });

  const igCacheRecortes = new Map();
  let igLogo = null;
  let igQr = null;

  const igCargarLogo = async () => {
    if (igLogo) return igLogo;
    try {
      igLogo = await igCargarImagen(imageURL("assets/logo/agresti-a-claro.svg"));
    } catch {
      igLogo = null;
    }
    return igLogo;
  };

  const igCargarQr = async () => {
    if (igQr) return igQr;
    try {
      igQr = await igCargarImagen(imageURL("branding/etiquetas/catalogo-qr.png"));
    } catch {
      igQr = null;
    }
    return igQr;
  };

  // Recorta los márgenes transparentes para que cada figura use el espacio
  // disponible del post, sin importar cuánto aire tenga la foto original.
  const igRecortarImagen = (imagen) => {
    if (!imagen) return null;
    const clave = imagen.src;
    if (igCacheRecortes.has(clave)) return igCacheRecortes.get(clave);
    try {
      const lienzo = document.createElement("canvas");
      lienzo.width = imagen.naturalWidth || imagen.width;
      lienzo.height = imagen.naturalHeight || imagen.height;
      const ctx = lienzo.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(imagen, 0, 0);
      const datos = ctx.getImageData(0, 0, lienzo.width, lienzo.height).data;
      let minX = lienzo.width;
      let minY = lienzo.height;
      let maxX = 0;
      let maxY = 0;
      let encontrado = false;
      for (let y = 0; y < lienzo.height; y += 1) {
        for (let x = 0; x < lienzo.width; x += 1) {
          if (datos[(y * lienzo.width + x) * 4 + 3] > 12) {
            encontrado = true;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (!encontrado) {
        igCacheRecortes.set(clave, imagen);
        return imagen;
      }
      const margenX = Math.round((maxX - minX) * 0.02);
      const margenY = Math.round((maxY - minY) * 0.02);
      minX = Math.max(0, minX - margenX);
      minY = Math.max(0, minY - margenY);
      maxX = Math.min(lienzo.width - 1, maxX + margenX);
      maxY = Math.min(lienzo.height - 1, maxY + margenY);
      const ancho = maxX - minX + 1;
      const alto = maxY - minY + 1;
      const recorte = document.createElement("canvas");
      recorte.width = ancho;
      recorte.height = alto;
      recorte.getContext("2d").drawImage(lienzo, minX, minY, ancho, alto, 0, 0, ancho, alto);
      igCacheRecortes.set(clave, recorte);
      return recorte;
    } catch {
      igCacheRecortes.set(clave, imagen);
      return imagen;
    }
  };

  const igFuentesListas = async () => {
    if (!document.fonts?.ready) return;
    await Promise.race([
      document.fonts.ready,
      new Promise((resolve) => window.setTimeout(resolve, 1500)),
    ]);
  };

  const igEnvolver = (ctx, texto, x, y, anchoMax, altoLinea, maxLineas) => {
    const palabras = String(texto).split(/\s+/).filter(Boolean);
    const lineas = [];
    let linea = "";
    let truncado = false;
    for (const palabra of palabras) {
      const prueba = linea ? `${linea} ${palabra}` : palabra;
      if (ctx.measureText(prueba).width <= anchoMax) {
        linea = prueba;
        continue;
      }
      if (linea) lineas.push(linea);
      if (lineas.length === maxLineas) {
        truncado = true;
        break;
      }
      linea = palabra;
    }
    if (!truncado && linea && lineas.length < maxLineas) lineas.push(linea);
    if (truncado && lineas.length) {
      let ultima = lineas[lineas.length - 1];
      while (ultima.length > 1 && ctx.measureText(`${ultima}…`).width > anchoMax) {
        ultima = ultima.slice(0, -1);
      }
      lineas[lineas.length - 1] = `${ultima}…`;
    }
    lineas.forEach((textoLinea, indice) => ctx.fillText(textoLinea, x, y + indice * altoLinea));
    return lineas.length;
  };

  const igUrlVisible = () => IG_SITE.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const IG_FONDOS = {
    noche: {
      stops: ["#070f1f", "#0a1528", "#0d1a30"],
      glow: "rgba(255,106,61,.18)",
      glow2: "rgba(255,106,61,.05)",
      grid: "rgba(255,255,255,.04)",
      ribbon: "rgba(255,106,61,.035)",
    },
    indigo: {
      stops: ["#312e81", "#1e3a8a", "#070f1f"],
      glow: "rgba(99,102,241,.28)",
      glow2: "rgba(99,102,241,.07)",
      grid: "rgba(200,210,255,.055)",
      ribbon: "rgba(129,140,248,.055)",
    },
    violeta: {
      stops: ["#4c1d95", "#6d28d9", "#0b1020"],
      glow: "rgba(168,85,247,.28)",
      glow2: "rgba(168,85,247,.07)",
      grid: "rgba(235,220,255,.055)",
      ribbon: "rgba(192,132,252,.055)",
    },
    cian: {
      stops: ["#083344", "#0e7490", "#061a2b"],
      glow: "rgba(34,211,238,.22)",
      glow2: "rgba(34,211,238,.05)",
      grid: "rgba(210,250,255,.055)",
      ribbon: "rgba(34,211,238,.05)",
    },
    azul: {
      stops: ["#172554", "#1d4ed8", "#050d1a"],
      glow: "rgba(96,165,250,.28)",
      glow2: "rgba(96,165,250,.06)",
      grid: "rgba(220,235,255,.055)",
      ribbon: "rgba(147,197,253,.055)",
    },
    teal: {
      stops: ["#134e4a", "#0f766e", "#042f2e"],
      glow: "rgba(45,212,191,.20)",
      glow2: "rgba(45,212,191,.05)",
      grid: "rgba(210,255,250,.05)",
      ribbon: "rgba(94,234,212,.05)",
    },
  };

  const igFondo = (ctx, ancho, alto) => {
    ctx.clearRect(0, 0, ancho, alto);
    const estilo = IG_FONDOS[instagramFondo] || IG_FONDOS.noche;
    const fondo = ctx.createLinearGradient(0, 0, ancho, alto);
    fondo.addColorStop(0, estilo.stops[0]);
    fondo.addColorStop(0.58, estilo.stops[1]);
    fondo.addColorStop(1, estilo.stops[2]);
    ctx.fillStyle = fondo;
    ctx.fillRect(0, 0, ancho, alto);

    // Bandas verticales suaves: recuerdan la paleta de referencia sin competir con el producto.
    for (let i = 0; i < 7; i += 1) {
      const x = (ancho / 7) * i;
      ctx.fillStyle = estilo.ribbon;
      ctx.fillRect(x + 18, 0, ancho / 7 - 36, alto);
    }

    const halo = ctx.createRadialGradient(
      ancho * 0.72,
      alto * 0.16,
      0,
      ancho * 0.72,
      alto * 0.16,
      ancho * 0.85
    );
    halo.addColorStop(0, estilo.glow);
    halo.addColorStop(0.55, estilo.glow2);
    halo.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, ancho, alto);

    ctx.strokeStyle = estilo.grid;
    ctx.lineWidth = 1;
    for (let x = 64; x < ancho; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, alto);
      ctx.stroke();
    }
    for (let y = 64; y < alto; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ancho, y);
      ctx.stroke();
    }
  };

  const igMarca = (ctx, x = 80, y = 122) => {
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    let textoX = x;
    if (igLogo) {
      const tamano = 55;
      ctx.drawImage(igLogo, x, y - 45, tamano, tamano);
      textoX = x + tamano + 14;
    }
    ctx.fillStyle = "#f0f4fc";
    ctx.font = '600 36px "Space Grotesk", sans-serif';
    ctx.fillText("AGRESTI", textoX, y);
    const anchoMarca = ctx.measureText("AGRESTI").width;
    ctx.fillStyle = "#ff6a3d";
    ctx.fillText(".3D", textoX + anchoMarca, y);
    ctx.fillRect(x, y + 28, 64, 4);
  };

  const igDibujarProducto = (ctx, foto, ancho, y, maximo) => {
    if (!foto) {
      ctx.strokeStyle = "rgba(255,255,255,.18)";
      ctx.setLineDash([10, 10]);
      ctx.strokeRect(ancho / 2 - maximo / 2 + 30, y + 30, maximo - 60, maximo - 60);
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(240,244,252,.55)";
      ctx.font = '400 28px "Inter", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText("Sin foto", ancho / 2, y + maximo / 2 + 10);
      ctx.textAlign = "left";
      return;
    }
    const escala = Math.min(maximo / foto.width, maximo / foto.height);
    const anchoFoto = foto.width * escala;
    const altoFoto = foto.height * escala;
    ctx.drawImage(
      foto,
      (ancho - anchoFoto) / 2,
      y + (maximo - altoFoto) / 2,
      anchoFoto,
      altoFoto
    );
  };

  const igPieUrl = (ctx, ancho, y) => {
    ctx.fillStyle = "rgba(240,244,252,.45)";
    ctx.font = '400 22px "Inter", sans-serif';
    ctx.textAlign = "right";
    ctx.fillText(igUrlVisible(), ancho - 80, y);
    ctx.textAlign = "left";
  };

  const igDibujarFeed = (ctx, ancho, alto, producto, foto) => {
    igMarca(ctx);
    igDibujarProducto(ctx, foto, ancho, 250, 580);
    ctx.fillStyle = "#f0f4fc";
    ctx.font = '600 62px "Space Grotesk", sans-serif';
    igEnvolver(ctx, producto?.nombre || "Elegí un producto", 80, 850, 920, 64, 2);
    ctx.fillStyle = "#9bb0d1";
    ctx.font = '400 26px "Inter", sans-serif';
    ctx.fillText(producto ? categoryPath(producto.categoria) : "", 80, 965);
    if (producto) {
      ctx.fillStyle = "#ff6a3d";
      ctx.font = '600 34px "Space Grotesk", sans-serif';
      ctx.fillText(producto.precio || "A consultar", 80, 1020);
    }
    igPieUrl(ctx, ancho, 1055);
  };

  const igDibujarStory = (ctx, ancho, alto, producto, foto) => {
    igMarca(ctx, 80, 140);
    igDibujarProducto(ctx, foto, ancho, 280, 900);
    ctx.fillStyle = "#f0f4fc";
    ctx.font = '600 70px "Space Grotesk", sans-serif';
    igEnvolver(ctx, producto?.nombre || "Elegí un producto", 80, 1330, 920, 76, 2);
    ctx.fillStyle = "#9bb0d1";
    ctx.font = '400 30px "Inter", sans-serif';
    ctx.fillText(producto ? categoryPath(producto.categoria) : "", 80, 1500);
    if (producto) {
      ctx.fillStyle = "#ff6a3d";
      ctx.font = '600 46px "Space Grotesk", sans-serif';
      ctx.fillText(producto.precio || "A consultar", 80, 1585);
    }
    ctx.fillStyle = "rgba(240,244,252,.45)";
    ctx.font = '400 26px "Inter", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText(igUrlVisible(), ancho / 2, 1810);
    ctx.textAlign = "left";
  };

  const igDibujarCarrusel = (ctx, ancho, alto, producto, foto, slide) => {
    if (slide === 1) {
      igDibujarFeed(ctx, ancho, alto, producto, foto);
      return;
    }
    igMarca(ctx);
    if (slide === 2) {
      igDibujarProducto(ctx, foto, ancho, 220, 600);
      ctx.fillStyle = "#f0f4fc";
      ctx.font = '600 46px "Space Grotesk", sans-serif';
      igEnvolver(ctx, producto?.nombre || "Elegí un producto", 80, 850, 920, 48, 1);
      const detalles = producto?.detalles || {};
      const medidas = [detalles.altura, detalles.ancho, detalles.largo].filter(Boolean).join(" × ");
      const linea = [detalles.material, medidas, detalles.colores].filter(Boolean).join(" · ");
      if (linea) {
        ctx.fillStyle = "#9bb0d1";
        ctx.font = '400 26px "Inter", sans-serif';
        igEnvolver(ctx, linea, 80, 925, 920, 34, 1);
      }
      ctx.fillStyle = "#9bb0d1";
      ctx.font = '400 26px "Inter", sans-serif';
      ctx.fillText(producto ? categoryPath(producto.categoria) : "", 80, 985);
      igPieUrl(ctx, ancho, 1040);
      return;
    }
    ctx.fillStyle = "#f0f4fc";
    ctx.font = '600 74px "Space Grotesk", sans-serif';
    ctx.fillText("Pedilo por", 80, 560);
    ctx.fillStyle = "#ff6a3d";
    ctx.fillText("WhatsApp", 80, 650);
    ctx.fillStyle = "#9bb0d1";
    ctx.font = '400 32px "Inter", sans-serif';
    igEnvolver(ctx, producto?.nombre || "", 80, 760, 660, 40, 1);
    ctx.fillStyle = "#ff6a3d";
    ctx.font = '600 34px "Space Grotesk", sans-serif';
    ctx.fillText(igUrlVisible(), 80, 880);
    ctx.fillStyle = "rgba(240,244,252,.45)";
    ctx.font = '400 22px "Inter", sans-serif';
    ctx.fillText(igQr ? "Escaneá o entrá al catálogo" : "Entrá al catálogo", 80, 930);

    if (igQr) {
      const qrX = 790;
      const qrY = 742;
      const qrTamano = 236;
      ctx.fillStyle = "#f0f4fc";
      if (typeof ctx.roundRect === "function") {
        ctx.beginPath();
        ctx.roundRect(qrX, qrY, qrTamano, qrTamano, 18);
        ctx.fill();
      } else {
        ctx.fillRect(qrX, qrY, qrTamano, qrTamano);
      }
      ctx.drawImage(igQr, qrX + 14, qrY + 14, qrTamano - 28, qrTamano - 28);
      ctx.fillStyle = "#9bb0d1";
      ctx.font = '600 20px "Inter", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText("CATÁLOGO", qrX + qrTamano / 2, qrY + qrTamano + 30);
      ctx.textAlign = "left";
    }
  };

  const igDibujar = async () => {
    const canvas = els.instagramCanvas;
    if (!canvas) return;
    const producto = igProducto();
    const esStory = instagramFormato === "story";
    const ancho = 1080;
    const alto = esStory ? 1920 : 1080;
    canvas.classList.toggle("is-story", esStory);
    if (canvas.width !== ancho || canvas.height !== alto) {
      canvas.width = ancho;
      canvas.height = alto;
    }
    const ctx = canvas.getContext("2d");
    await igCargarLogo();
    await igCargarQr();
    igFondo(ctx, ancho, alto);

    const fotoOriginal = producto?.imagenes?.[0]?.src
      ? await igCargarImagen(imageURL(producto.imagenes[0].src))
      : null;
    const foto = fotoOriginal ? igRecortarImagen(fotoOriginal) : null;

    if (instagramFormato === "story") {
      igDibujarStory(ctx, ancho, alto, producto, foto);
    } else if (instagramFormato === "carousel") {
      igDibujarCarrusel(ctx, ancho, alto, producto, foto, instagramSlide);
    } else {
      igDibujarFeed(ctx, ancho, alto, producto, foto);
    }
  };

  const igActualizarTexto = () => {
    const producto = igProducto();
    if (!producto) return;
    const caption = igCaption(producto);
    if (els.instagramCaption) els.instagramCaption.value = caption;
    if (els.instagramHashtags) els.instagramHashtags.value = igHashtags(producto);
    if (els.instagramCaptionCount) els.instagramCaptionCount.textContent = String(caption.length);
  };

  const igActualizar = async () => {
    const producto = igProducto();
    if (!producto) {
      igStatus("Elegí un producto del catálogo.", true);
      return;
    }
    const tieneFoto = Boolean(producto.imagenes?.[0]?.src);
    const esCarrusel = instagramFormato === "carousel";
    const esStory = instagramFormato === "story";

    if (els.instagramSlides) els.instagramSlides.hidden = !esCarrusel;
    if (els.instagramDownloadAll) els.instagramDownloadAll.hidden = !esCarrusel;
    if (els.instagramDownload) {
      els.instagramDownload.disabled = !tieneFoto;
      els.instagramDownload.textContent = esCarrusel
        ? "Descargar slide"
        : esStory
          ? "Descargar story"
          : "Descargar imagen";
    }
    if (els.instagramDownloadAll) els.instagramDownloadAll.disabled = !tieneFoto;
    if (els.instagramHint) {
      els.instagramHint.textContent = esStory
        ? "Vista previa 1080 × 1920"
        : esCarrusel
          ? `Carrusel 1080 × 1080 · slide ${instagramSlide} de 3`
          : "Vista previa 1080 × 1080";
    }
    document.querySelectorAll("[data-ig-slide]").forEach((boton) => {
      boton.setAttribute("aria-pressed", String(Number(boton.dataset.igSlide) === instagramSlide));
    });

    await igFuentesListas();
    await igDibujar();
    igStatus(
      tieneFoto
        ? "Listo para descargar y publicar."
        : "Este producto no tiene fotos: agregá una antes de generar el post.",
      !tieneFoto
    );
  };


  const igNormalizar = (texto) =>
    String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const filtrarInstagramProductos = () => {
    if (!els.instagramSelect || !catalog) return;
    const termino = igNormalizar(els.instagramSearch?.value || "");
    const categoriaDe = (producto) =>
      catalog.categorias.find((categoria) => categoria.id === producto.categoria)?.nombre || "";
    let productos = catalog.productos.filter(
      (producto) =>
        !termino ||
        igNormalizar(producto.nombre).includes(termino) ||
        igNormalizar(categoriaDe(producto)).includes(termino)
    );
    const actual = instagramProductoId || els.instagramSelect.value;
    const seleccionado = catalog.productos.find((producto) => producto.id === actual);
    if (seleccionado && !productos.some((producto) => producto.id === actual)) {
      productos = [seleccionado, ...productos];
    }
    els.instagramSelect.innerHTML = productos.length
      ? productos
          .map(
            (producto) =>
              `<option value="${esc(producto.id)}">${esc(producto.nombre)}${producto.id === actual ? " · seleccionado" : ""}</option>`
          )
          .join("")
      : '<option value="" disabled>Sin resultados</option>';
    if (actual && productos.some((producto) => producto.id === actual)) {
      els.instagramSelect.value = actual;
    }
    if (els.instagramProductCount) {
      els.instagramProductCount.textContent = `${productos.length} de ${catalog.productos.length} productos`;
    }
  };

  const prepararInstagram = () => {
    if (!els.instagramSelect) return;
    if (!catalog) {
      igStatus("Cargá el catálogo del proyecto para generar el post.", true);
      return;
    }
    const anterior = instagramProductoId;
    const candidatos = [selectedId, anterior, catalog.productos[0]?.id];
    instagramProductoId =
      candidatos.find((id) => id && catalog.productos.some((producto) => producto.id === id)) || "";
    filtrarInstagramProductos();
    els.instagramSelect.value = instagramProductoId;
    if (els.instagramFormat) els.instagramFormat.value = instagramFormato;
    if (els.instagramBackground) els.instagramBackground.value = instagramFondo;
    const cambioProducto = !instagramPreparado || anterior !== instagramProductoId;
    instagramPreparado = true;
    if (els.instagramFecha && !els.instagramFecha.value) {
      els.instagramFecha.value = fechaLocalISO();
    }
    if (cambioProducto) igActualizarTexto();
    renderInstagramHistorial();
    igActualizar();
  };

  const igCanvasBlob = () =>
    new Promise((resolve) => els.instagramCanvas.toBlob(resolve, "image/jpeg", 0.92));

  const igDescargarArchivo = (blob, nombre) => {
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombre;
    enlace.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const igDescargar = async () => {
    const producto = igProducto();
    if (!producto) return;
    try {
      await igDibujar();
      const blob = await igCanvasBlob();
      if (!blob) throw new Error("sin imagen");
      const sufijo =
        instagramFormato === "carousel"
          ? `carrusel-${instagramSlide}`
          : instagramFormato;
      igDescargarArchivo(blob, `agresti-${producto.id}-instagram-${sufijo}.jpg`);
      igStatus("Imagen descargada. Acordate de copiar el caption.");
    } catch {
      igStatus(
        "No se pudo descargar la imagen. Abrí el editor desde el servidor local e intentá de nuevo.",
        true
      );
    }
  };

  const igDescargarTodo = async () => {
    const producto = igProducto();
    if (!producto) return;
    const anterior = instagramSlide;
    try {
      for (let slide = 1; slide <= 3; slide += 1) {
        instagramSlide = slide;
        await igDibujar();
        const blob = await igCanvasBlob();
        if (!blob) throw new Error("sin imagen");
        igDescargarArchivo(blob, `agresti-${producto.id}-carrusel-${slide}.jpg`);
        await new Promise((resolve) => window.setTimeout(resolve, 500));
      }
      igStatus(
        "Se descargaron las 3 imágenes. Si el navegador pidió permiso para varias descargas, aceptalo."
      );
    } catch {
      igStatus("No se pudieron descargar todas las imágenes del carrusel.", true);
    } finally {
      instagramSlide = anterior;
      await igActualizar();
    }
  };

  const igCopiar = async () => {
    const caption = els.instagramCaption?.value.trim() || "";
    const hashtags = els.instagramHashtags?.value.trim() || "";
    const texto = `${caption}\n\n${hashtags}`.trim();
    if (!texto) return;
    try {
      await navigator.clipboard.writeText(texto);
      igStatus("Caption y hashtags copiados.");
    } catch {
      const area = document.createElement("textarea");
      area.value = texto;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      igStatus("Caption y hashtags copiados.");
    }
  };

  // ---------- Calendario e historial de Instagram ----------
  const IG_RECORDS_KEY = "agresti:instagram";
  let instagramMes = new Date();
  instagramMes.setDate(1);

  const fechaLocalISO = (fecha = new Date()) => {
    const dos = (numero) => String(numero).padStart(2, "0");
    return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
  };

  const leerInstagramRegistros = () => {
    try {
      const crudo = localStorage.getItem(IG_RECORDS_KEY);
      const datos = crudo ? JSON.parse(crudo) : {};
      return datos && typeof datos === "object" && !Array.isArray(datos) ? datos : {};
    } catch {
      return {};
    }
  };

  let instagramRegistros = leerInstagramRegistros();

  const guardarInstagramRegistros = () => {
    try {
      localStorage.setItem(IG_RECORDS_KEY, JSON.stringify(instagramRegistros));
    } catch {
      /* modo privado: no rompe la página */
    }
  };

  const instagramRegistro = (id) => instagramRegistros[id] || null;

  const igRecordStatus = (mensaje, error = false) => {
    if (!els.instagramRecordStatus) return;
    els.instagramRecordStatus.textContent = mensaje;
    els.instagramRecordStatus.dataset.state = error ? "error" : "";
  };

  const renderInstagramHistorial = () => {
    if (!els.instagramCalendar) return;
    const etiquetaMes = instagramMes.toLocaleDateString("es-AR", {
      month: "long",
      year: "numeric",
    });
    if (els.instagramMonthLabel) {
      els.instagramMonthLabel.textContent =
        etiquetaMes.charAt(0).toUpperCase() + etiquetaMes.slice(1);
    }

    const anio = instagramMes.getFullYear();
    const mes = instagramMes.getMonth();
    const primerDia = new Date(anio, mes, 1);
    const offset = (primerDia.getDay() + 6) % 7;
    const diasDelMes = new Date(anio, mes + 1, 0).getDate();
    const dos = (numero) => String(numero).padStart(2, "0");
    const hoy = fechaLocalISO();
    const celdas = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(
      (dia) => `<span class="instagram-calendar__weekday">${dia}</span>`
    );

    for (let i = 0; i < offset; i += 1) {
      celdas.push('<div class="instagram-calendar__day instagram-calendar__day--empty"></div>');
    }

    for (let dia = 1; dia <= diasDelMes; dia += 1) {
      const fecha = `${anio}-${dos(mes + 1)}-${dos(dia)}`;
      const registros = Object.entries(instagramRegistros).filter(
        ([, registro]) => registro.fecha === fecha
      );
      const items = registros
        .slice(0, 3)
        .map(([id, registro]) => {
          const producto = catalog?.productos.find((item) => item.id === id);
          return `<span class="instagram-calendar__item instagram-calendar__item--${esc(registro.estado)}" title="${esc(producto?.nombre || id)} (${esc(registro.estado)})">${esc(producto?.nombre || id)}</span>`;
        })
        .join("");
      const extra =
        registros.length > 3
          ? `<span class="instagram-calendar__more">+${registros.length - 3}</span>`
          : "";
      celdas.push(`
        <div class="instagram-calendar__day${fecha === hoy ? " instagram-calendar__day--today" : ""}" data-ig-date="${fecha}">
          <span class="instagram-calendar__num">${dia}</span>
          ${items}${extra}
        </div>`);
    }
    els.instagramCalendar.innerHTML = celdas.join("");

    if (!els.instagramHistoryList) return;
    const entradas = Object.entries(instagramRegistros)
      .map(([id, registro]) => ({
        id,
        ...registro,
        producto: catalog?.productos.find((item) => item.id === id),
      }))
      .filter((entrada) => entrada.producto)
      .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));

    els.instagramHistoryList.innerHTML = entradas.length
      ? entradas
          .map(
            (entrada) => `
        <div class="instagram-history-item">
          <span class="instagram-history-item__date">${esc(entrada.fecha)}</span>
          <span class="instagram-history-item__name">${esc(entrada.producto.nombre)}</span>
          <span class="instagram-history-item__state instagram-history-item__state--${esc(entrada.estado)}">${esc(entrada.estado)}</span>
          <button class="instagram-history-item__btn" type="button" data-ig-open="${esc(entrada.id)}">Ver</button>
          <button class="instagram-history-item__btn instagram-history-item__btn--danger" type="button" data-ig-remove="${esc(entrada.id)}">Quitar</button>
        </div>`
          )
          .join("")
      : '<p class="image-guidance">Todavía no hay publicaciones registradas.</p>';
  };

  const registrarInstagram = (estado) => {
    const producto = igProducto();
    if (!producto) {
      igRecordStatus("Elegí un producto antes de registrarlo.", true);
      return;
    }
    const fecha =
      estado === "planificado"
        ? els.instagramFecha?.value || fechaLocalISO()
        : fechaLocalISO();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      igRecordStatus("Elegí una fecha válida.", true);
      return;
    }
    instagramRegistros[producto.id] = {
      estado,
      fecha,
      formato: instagramFormato,
      actualizado: new Date().toISOString(),
    };
    guardarInstagramRegistros();
    renderInstagramHistorial();
    renderList();
    igRecordStatus(
      `«${producto.nombre}» quedó ${estado === "publicado" ? "publicado" : "planificado"} para el ${fecha}.`
    );
  };

  const quitarRegistroInstagram = (id = null) => {
    const productoId = id || igProducto()?.id;
    if (!productoId || !instagramRegistros[productoId]) {
      igRecordStatus("No hay un registro para quitar.", true);
      return;
    }
    delete instagramRegistros[productoId];
    guardarInstagramRegistros();
    renderInstagramHistorial();
    renderList();
    igRecordStatus("Registro eliminado.");
  };

  const exportarCalendarioInstagram = () => {
    const filas = [["fecha", "producto", "estado", "formato"]];
    Object.entries(instagramRegistros)
      .map(([id, registro]) => ({
        ...registro,
        producto: catalog?.productos.find((item) => item.id === id),
      }))
      .filter((registro) => registro.producto)
      .sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)))
      .forEach((registro) => {
        filas.push([registro.fecha, registro.producto.nombre, registro.estado, registro.formato || ""]);
      });
    const csv = filas
      .map((fila) => fila.map((valor) => `"${String(valor).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "agresti-instagram-calendario.csv";
    enlace.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    igRecordStatus("Calendario descargado como CSV.");
  };

  els.instagramSelect?.addEventListener("change", () => {
    instagramProductoId = els.instagramSelect.value;
    igActualizarTexto();
    igActualizar();
  });
  els.instagramSearch?.addEventListener("input", filtrarInstagramProductos);
  els.instagramFormat?.addEventListener("change", () => {
    instagramFormato = els.instagramFormat.value;
    instagramSlide = 1;
    igActualizar();
  });
  els.instagramBackground?.addEventListener("change", () => {
    instagramFondo = els.instagramBackground.value || "noche";
    try { localStorage.setItem("agresti:ig-fondo", instagramFondo); } catch (_) {}
    igActualizar();
  });
  els.instagramSlides?.addEventListener("click", (event) => {
    const boton = event.target.closest("[data-ig-slide]");
    if (!boton) return;
    instagramSlide = Number(boton.dataset.igSlide);
    igActualizar();
  });
  els.instagramCaption?.addEventListener("input", () => {
    if (els.instagramCaptionCount) {
      els.instagramCaptionCount.textContent = String(els.instagramCaption.value.length);
    }
  });
  els.instagramDownload?.addEventListener("click", igDescargar);
  els.instagramDownloadAll?.addEventListener("click", igDescargarTodo);
  els.instagramCopy?.addEventListener("click", igCopiar);
  els.instagramPlan?.addEventListener("click", () => registrarInstagram("planificado"));
  els.instagramMarkPublished?.addEventListener("click", () => registrarInstagram("publicado"));
  els.instagramForget?.addEventListener("click", () => quitarRegistroInstagram());
  els.instagramExportCalendar?.addEventListener("click", exportarCalendarioInstagram);
  els.instagramPrevMonth?.addEventListener("click", () => {
    instagramMes.setMonth(instagramMes.getMonth() - 1);
    renderInstagramHistorial();
  });
  els.instagramNextMonth?.addEventListener("click", () => {
    instagramMes.setMonth(instagramMes.getMonth() + 1);
    renderInstagramHistorial();
  });
  els.instagramCalendar?.addEventListener("click", (event) => {
    const celda = event.target.closest("[data-ig-date]");
    if (!celda) return;
    if (els.instagramFecha) els.instagramFecha.value = celda.dataset.igDate;
    igRecordStatus(`Fecha elegida: ${celda.dataset.igDate}.`);
  });
  els.instagramHistoryList?.addEventListener("click", (event) => {
    const abrir = event.target.closest("[data-ig-open]");
    if (abrir) {
      instagramProductoId = abrir.dataset.igOpen;
      if (els.instagramSearch) els.instagramSearch.value = "";
      filtrarInstagramProductos();
      if (els.instagramSelect) els.instagramSelect.value = instagramProductoId;
      igActualizarTexto();
      igActualizar();
      return;
    }
    const quitar = event.target.closest("[data-ig-remove]");
    if (quitar) quitarRegistroInstagram(quitar.dataset.igRemove);
  });

  // ---------- Etiquetas para bolsas ----------
  const ETIQUETA_KEY = "agresti:etiquetas";
  const ETIQUETA_A4 = { ancho: 210, alto: 297, margen: 8, gap: 4 };
  let etiquetaPageStyle = null;

  const etiquetaNumero = (valor, minimo, maximo, defecto) => {
    const numero = Number.parseFloat(valor);
    if (!Number.isFinite(numero)) return defecto;
    return Math.min(maximo, Math.max(minimo, numero));
  };

  const leerConfigEtiqueta = () => {
    try {
      const crudo = localStorage.getItem(ETIQUETA_KEY);
      const datos = crudo ? JSON.parse(crudo) : {};
      return datos && typeof datos === "object" && !Array.isArray(datos) ? datos : {};
    } catch {
      return {};
    }
  };

  const guardarConfigEtiqueta = () => {
    try {
      localStorage.setItem(
        ETIQUETA_KEY,
        JSON.stringify({
          ancho: els.etiquetaAncho?.value || "15",
          alto: els.etiquetaAlto?.value || "3",
          copias: els.etiquetaCopias?.value || "1",
          modo: els.etiquetaModo?.value || "individual",
          detalle: els.etiquetaDetalleInput?.value || "",
          lote: els.etiquetaLoteInput?.value || "",
          qr: Boolean(els.etiquetaQrToggle?.checked),
          instagram: Boolean(els.etiquetaInstagramToggle?.checked),
          pla: Boolean(els.etiquetaPlaToggle?.checked),
          cuidado: Boolean(els.etiquetaCuidadoToggle?.checked),
        })
      );
    } catch {
      /* modo privado */
    }
  };

  const etiquetaMedidasActuales = () => {
    const anchoCm = etiquetaNumero(els.etiquetaAncho?.value, 7, 20, 15);
    const altoCm = etiquetaNumero(els.etiquetaAlto?.value, 2, 6, 3);
    const copias = Math.round(etiquetaNumero(els.etiquetaCopias?.value, 1, 100, 1));
    return { anchoCm, altoCm, copias, anchoMm: anchoCm * 10, altoMm: altoCm * 10 };
  };

  const maxEtiquetasA4 = (anchoMm, altoMm) => {
    const utilAncho = ETIQUETA_A4.ancho - ETIQUETA_A4.margen * 2;
    const utilAlto = ETIQUETA_A4.alto - ETIQUETA_A4.margen * 2;
    const columnas = Math.floor(
      (utilAncho + ETIQUETA_A4.gap) / (anchoMm + ETIQUETA_A4.gap)
    );
    const filas = Math.floor(
      (utilAlto + ETIQUETA_A4.gap) / (altoMm + ETIQUETA_A4.gap)
    );
    return Math.max(0, columnas * filas);
  };

  const actualizarPaginaImpresion = (anchoMm, altoMm, modo) => {
    if (!etiquetaPageStyle) {
      etiquetaPageStyle = document.createElement("style");
      etiquetaPageStyle.id = "etiquetaPageStyle";
      document.head.appendChild(etiquetaPageStyle);
    }
    etiquetaPageStyle.textContent =
      modo === "a4"
        ? "@page { size: A4; margin: 0; }"
        : `@page { size: ${anchoMm}mm ${altoMm}mm; margin: 0; }`;
  };

  const escalarEtiqueta = (anchoMm, altoMm) => {
    const wrap = els.etiquetaPreviewWrap;
    const stage = els.etiquetaStage;
    const label = els.etiquetaPreview;
    if (!wrap || !stage || !label) return;
    const disponible = wrap.clientWidth - 32;
    if (disponible <= 0) return;
    const pxAncho = (anchoMm * 96) / 25.4;
    const pxAlto = (altoMm * 96) / 25.4;
    const escala = Math.min(1, disponible / pxAncho);
    stage.style.width = `${pxAncho * escala}px`;
    stage.style.height = `${pxAlto * escala}px`;
    label.style.transform = `scale(${escala})`;
  };

  const actualizarEtiqueta = () => {
    if (!els.etiquetaPreview) return;
    const { anchoCm, altoCm, copias, anchoMm, altoMm } = etiquetaMedidasActuales();
    if (els.etiquetaAncho) els.etiquetaAncho.value = String(anchoCm);
    if (els.etiquetaAlto) els.etiquetaAlto.value = String(altoCm);
    if (els.etiquetaCopias) els.etiquetaCopias.value = String(copias);

    els.etiquetaPreview.style.setProperty("--label-w", `${anchoMm}mm`);
    els.etiquetaPreview.style.setProperty("--label-h", `${altoMm}mm`);
    els.etiquetaPreview.classList.toggle("etiqueta--angosta", anchoMm < 100);

    const detalle = els.etiquetaDetalleInput?.value.trim() || "";
    const lote = els.etiquetaLoteInput?.value.trim() || "";
    const cuidado = Boolean(els.etiquetaCuidadoToggle?.checked);
    const mostrarDetalle = Boolean(detalle || lote || cuidado) && anchoMm >= 125;
    if (els.etiquetaDetalleBloque) els.etiquetaDetalleBloque.hidden = !mostrarDetalle;
    if (els.etiquetaDetalleLinea) {
      els.etiquetaDetalleLinea.textContent = detalle ? `Producto: ${detalle}` : "";
      els.etiquetaDetalleLinea.hidden = !detalle;
    }
    if (els.etiquetaLoteLinea) {
      els.etiquetaLoteLinea.textContent = lote ? `Lote: ${lote}` : "";
      els.etiquetaLoteLinea.hidden = !lote;
    }
    if (els.etiquetaCuidadoLinea) els.etiquetaCuidadoLinea.hidden = !cuidado;

    const metaPartes = [];
    if (els.etiquetaPlaToggle?.checked) metaPartes.push("Impreso en 3D · PLA");
    if (els.etiquetaInstagramToggle?.checked) metaPartes.push("@agresti.3d");
    if (els.etiquetaMeta) {
      els.etiquetaMeta.textContent = metaPartes.join(" · ");
      els.etiquetaMeta.hidden = metaPartes.length === 0;
    }
    if (els.etiquetaQrBloque) els.etiquetaQrBloque.hidden = !els.etiquetaQrToggle?.checked;

    const maxA4 = maxEtiquetasA4(anchoMm, altoMm);
    if (els.etiquetaMaxA4) {
      els.etiquetaMaxA4.textContent =
        maxA4 > 0 ? `Entran ${maxA4} por hoja A4.` : "Este tamaño no entra en una hoja A4.";
    }
    if (els.etiquetaMaxA4Boton) els.etiquetaMaxA4Boton.disabled = maxA4 < 1;

    const texto = `${anchoCm} × ${altoCm} cm`;
    if (els.etiquetaFormato) els.etiquetaFormato.textContent = texto;
    if (els.etiquetaFormatoCaption) {
      els.etiquetaFormatoCaption.textContent = `Vista previa · ${texto}`;
    }
    document.querySelectorAll("[data-etiqueta-ancho]").forEach((boton) => {
      boton.setAttribute(
        "aria-pressed",
        String(Number(boton.dataset.etiquetaAncho) === anchoCm)
      );
    });

    escalarEtiqueta(anchoMm, altoMm);
    guardarConfigEtiqueta();
  };

  const prepararImpresion = () => {
    actualizarEtiqueta();
    const { anchoMm, altoMm, copias } = etiquetaMedidasActuales();
    const modo = els.etiquetaModo?.value || "individual";
    const area = els.etiquetaPrintArea;
    if (!area || !els.etiquetaPreview) return null;

    area.innerHTML = "";
    area.className = `etiquetas-print ${modo === "a4" ? "etiquetas-print--a4" : "etiquetas-print--individual"}`;
    for (let indice = 0; indice < copias; indice += 1) {
      const clon = els.etiquetaPreview.cloneNode(true);
      clon.removeAttribute("id");
      clon.querySelectorAll("[id]").forEach((nodo) => nodo.removeAttribute("id"));
      clon.style.setProperty("--label-w", `${anchoMm}mm`);
      clon.style.setProperty("--label-h", `${altoMm}mm`);
      clon.style.transform = "none";
      clon.classList.add(modo === "a4" ? "etiqueta--guia" : "etiqueta--pagina");
      area.appendChild(clon);
    }
    actualizarPaginaImpresion(anchoMm, altoMm, modo);
    return { area, anchoMm, altoMm, copias, modo };
  };

  const esperarImagenes = (area) => {
    const imagenes = [...area.querySelectorAll("img")];
    return Promise.all(
      imagenes.map(
        (imagen) =>
          new Promise((resolve) => {
            if (imagen.complete) resolve();
            else {
              imagen.onload = resolve;
              imagen.onerror = resolve;
            }
          })
      )
    );
  };

  const imprimirEtiqueta = async () => {
    const datos = prepararImpresion();
    if (!datos) return;
    await esperarImagenes(datos.area);
    const tituloAnterior = document.title;
    document.title = "Etiquetas — Agresti.3D";
    window.print();
    document.title = tituloAnterior;
  };

  const blobADataURL = (blob) =>
    new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.onload = () => resolve(String(lector.result));
      lector.onerror = () => reject(new Error("No se pudo leer la imagen."));
      lector.readAsDataURL(blob);
    });

  const descargarPdfEtiqueta = async () => {
    const datos = prepararImpresion();
    if (!datos) return;
    const { area, anchoMm, altoMm, modo } = datos;
    const boton = els.etiquetaPdf;
    const status = els.etiquetaPdfStatus;
    if (boton) {
      boton.disabled = true;
      boton.textContent = "Generando PDF…";
    }
    if (status) status.textContent = "Generando PDF sin encabezados…";
    try {
      await esperarImagenes(area);
      await Promise.all(
        [...area.querySelectorAll("img")].map(async (imagen) => {
          if (!imagen.src || imagen.src.startsWith("data:")) return;
          try {
            const respuesta = await fetch(imagen.src);
            if (!respuesta.ok) return;
            imagen.src = await blobADataURL(await respuesta.blob());
          } catch {
            /* si falla, se intenta con la ruta original */
          }
        })
      );
      const css = await (await fetch(new URL("editor.css", location.href))).text();
      const pageStyle =
        modo === "a4"
          ? "@page { size: A4; margin: 0; }"
          : `@page { size: ${anchoMm}mm ${altoMm}mm; margin: 0; }`;
      const html = `<!doctype html>
<html class="theme-noche" lang="es">
<head>
<meta charset="utf-8">
<title>Etiquetas — Agresti.3D</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<style>${css}</style>
<style>${pageStyle}</style>
</head>
<body>${area.outerHTML}</body>
</html>`;

      const respuesta = await fetch("/__local/etiquetas/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });
      if (!respuesta.ok) {
        const mensaje = (await respuesta.text()).trim();
        throw new Error(mensaje || `El servidor respondió ${respuesta.status}.`);
      }
      const pdf = await respuesta.blob();
      if (pdf.size < 500) throw new Error("El PDF salió vacío.");
      const url = URL.createObjectURL(pdf);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = "agresti-etiquetas.pdf";
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
      if (status) {
        status.textContent =
          "PDF descargado. Abrilo con Vista Previa e imprimí desde ahí: no lleva encabezados ni pies.";
      }
    } catch (error) {
      if (status) status.textContent = `No se pudo generar el PDF: ${error.message}`;
    } finally {
      if (boton) {
        boton.disabled = false;
        boton.textContent = "Descargar PDF sin encabezados";
      }
    }
  };

  const inicializarEtiquetas = () => {
    if (!els.etiquetaPreview) return;
    const config = leerConfigEtiqueta();
    if (config.ancho != null) els.etiquetaAncho.value = String(config.ancho);
    if (config.alto != null) els.etiquetaAlto.value = String(config.alto);
    if (config.copias != null) els.etiquetaCopias.value = String(config.copias);
    if (config.modo) els.etiquetaModo.value = config.modo;
    if (typeof config.detalle === "string") els.etiquetaDetalleInput.value = config.detalle;
    if (typeof config.lote === "string") els.etiquetaLoteInput.value = config.lote;
    if (typeof config.qr === "boolean") els.etiquetaQrToggle.checked = config.qr;
    if (typeof config.instagram === "boolean") els.etiquetaInstagramToggle.checked = config.instagram;
    if (typeof config.pla === "boolean") els.etiquetaPlaToggle.checked = config.pla;
    if (typeof config.cuidado === "boolean") els.etiquetaCuidadoToggle.checked = config.cuidado;

    [els.etiquetaAncho, els.etiquetaAlto, els.etiquetaCopias].forEach((input) => {
      input?.addEventListener("change", actualizarEtiqueta);
    });
    [els.etiquetaDetalleInput, els.etiquetaLoteInput].forEach((input) => {
      input?.addEventListener("input", actualizarEtiqueta);
    });
    [els.etiquetaModo, els.etiquetaQrToggle, els.etiquetaInstagramToggle, els.etiquetaPlaToggle, els.etiquetaCuidadoToggle].forEach(
      (elemento) => elemento?.addEventListener("change", actualizarEtiqueta)
    );
    document.querySelectorAll("[data-etiqueta-ancho]").forEach((boton) => {
      boton.addEventListener("click", () => {
        els.etiquetaAncho.value = boton.dataset.etiquetaAncho;
        actualizarEtiqueta();
      });
    });
    els.etiquetaImprimir?.addEventListener("click", imprimirEtiqueta);
    els.etiquetaPdf?.addEventListener("click", descargarPdfEtiqueta);
    els.etiquetaMaxA4Boton?.addEventListener("click", () => {
      const { anchoMm, altoMm } = etiquetaMedidasActuales();
      const maximo = maxEtiquetasA4(anchoMm, altoMm);
      if (maximo < 1) return;
      els.etiquetaModo.value = "a4";
      els.etiquetaCopias.value = String(Math.min(maximo, 100));
      actualizarEtiqueta();
    });
    window.addEventListener("afterprint", () => {
      if (els.etiquetaPrintArea) {
        els.etiquetaPrintArea.innerHTML = "";
        els.etiquetaPrintArea.className = "etiquetas-print";
      }
      if (etiquetaPageStyle) etiquetaPageStyle.textContent = "";
    });
    window.addEventListener("resize", actualizarEtiqueta);
    actualizarEtiqueta();
  };

  const addCategory = (event) => {
    event.preventDefault();
    if (!catalog) return;
    const name = els.newCategoryName.value.trim();
    const parent = els.newCategoryParent.value || null;
    if (!name) return;
    const baseId = slugify(name);
    if (!baseId) {
      report("El nombre debe incluir letras o números para crear el ID.", "error");
      return;
    }
    if (parent && !catalog.categorias.some((category) => category.id === parent)) {
      report("La categoría principal no es válida.", "error");
      return;
    }
    const existingIds = new Set(catalog.categorias.map((category) => category.id));
    const scopedId = existingIds.has(baseId) && parent ? `${parent}-${baseId}` : baseId;
    let id = scopedId;
    let suffix = 2;
    while (existingIds.has(id)) id = `${scopedId}-${suffix++}`;

    catalog.categorias.push({ id, nombre: name, padre: parent });
    els.categoryForm.reset();
    markCatalogDirty();
    updateCategoryControls();
    if (creating) {
      els.category.value = id;
      formDirty = true;
      updatePublishButton();
    }
    filterCategory = "";
    renderList();
    report(`Categoría «${name}» agregada. Guardá el catálogo para conservarla.`, "success");
  };

  const publishCatalog = async () => {
    if (els.publish.disabled) return;
    if (!window.confirm("Vas a publicar los archivos guardados en esta computadora en el sitio real https://agresti3d.web.app. ¿Querés continuar?")) return;

    publishing = true;
    updatePublishButton();
    report("Publicando el sitio. No cierres el editor…", "warning");
    try {
      const response = await fetch("/__local/publish", { method: "POST" });
      const message = (await response.text()).trim();
      if (!response.ok) throw new Error(message || `Firebase respondió con el estado ${response.status}.`);
      catalogSavedForPublish = false;
      report(message, "success");
    } catch (error) {
      report(`No se pudo publicar: ${error.message}`, "error");
    } finally {
      publishing = false;
      updatePublishButton();
    }
  };

  conectarTabs(".editor-tabs", "data-editor-tab", activarEditorTab);
  conectarTabs(".form-tabs", "data-form-tab", activarFormTab);
  els.connect.addEventListener("click", selectProjectFolder);
  els.saveCatalog.addEventListener("click", saveCatalog);
  els.publish.addEventListener("click", publishCatalog);
  els.add.addEventListener("click", startNewProduct);
  const syncFormMediaFields = (event) => {
    if (event.target.matches("[data-image-alt]")) {
      const index = Number(event.target.dataset.imageAlt);
      if (formImages[index]) formImages[index].alt = event.target.value;
    }
    if (event.target.matches("[data-video-title]")) {
      const index = Number(event.target.dataset.videoTitle);
      if (formVideos[index]) formVideos[index].title = event.target.value;
    }
    updateDescriptionCounts();
    formDirty = true;
    updatePublishButton();
  };
  els.form.addEventListener("input", syncFormMediaFields);
  els.form.addEventListener("change", syncFormMediaFields);
  els.form.addEventListener("submit", handleFormSubmit);
  els.productBranches.addEventListener("change", (event) => {
    const checkbox = event.target.closest('input[name="sucursalesDisponibles"]');
    if (!checkbox) return;
    const stock = checkbox
      .closest(".branch-availability__option")
      ?.querySelector(".branch-availability__stock");
    if (stock) {
      stock.disabled = !checkbox.checked;
      if (!checkbox.checked) stock.value = "";
    }
    formDirty = true;
    updatePublishButton();
  });
  els.cancelForm.addEventListener("click", () => {
    if (!askBeforeLeavingForm()) return;
    if (creating) resetForm();
    else if (selectedId) {
      formDirty = false;
      editProduct(selectedId);
    }
  });
  els.delete.addEventListener("click", removeProduct);
  if (els.duplicate) els.duplicate.addEventListener("click", duplicateProduct);
  els.imageFiles.addEventListener("change", () => addImages(els.imageFiles.files));
  els.videoFiles.addEventListener("change", () => addVideos(els.videoFiles.files));
  els.videoList.addEventListener("click", async (event) => {
    const retryBtn = event.target.closest("[data-retry-video]");
    if (retryBtn) {
      const index = Number(retryBtn.dataset.retryVideo);
      const video = formVideos[index];
      if (!video || !video.file || video.uploading) return;
      video.uploading = true;
      delete video.error;
      renderVideos();
      try {
        video.src = await storeVideo(video.file);
        delete video.error;
        delete video.file;
        report("Video guardado. Guardá el catálogo para confirmarlo.", "success");
      } catch (error) {
        video.error = error.message;
        report(`No se pudo guardar el video: ${error.message}`, "error");
      } finally {
        video.uploading = false;
        formDirty = true;
        renderVideos();
        updatePublishButton();
      }
      return;
    }

    const removeBtn = event.target.closest("[data-remove-video]");
    if (!removeBtn) return;
    const index = Number(removeBtn.dataset.removeVideo);
    if (!(index >= 0 && index < formVideos.length)) return;
    const [removed] = formVideos.splice(index, 1);
    if (removed) pendingVideos.delete(removed);
    formDirty = true;
    updatePublishButton();
    renderVideos();
    report("Video quitado del borrador. Guardá el catálogo para confirmar.", "warning");
  });
  els.imageList.addEventListener("click", (event) => {
    const moveBtn = event.target.closest("[data-move-image]");
    if (moveBtn) {
      const index = Number(moveBtn.dataset.moveImage);
      const dir = Number(moveBtn.dataset.dir);
      const target = index + dir;
      if (target >= 0 && target < formImages.length) {
        const temp = formImages[index];
        formImages[index] = formImages[target];
        formImages[target] = temp;
        formDirty = true;
        updatePublishButton();
        renderImages();
      }
      return;
    }
    const coverBtn = event.target.closest("[data-set-cover]");
    if (coverBtn) {
      const index = Number(coverBtn.dataset.setCover);
      if (index > 0 && index < formImages.length) {
        const [selected] = formImages.splice(index, 1);
        formImages.unshift(selected);
        formDirty = true;
        updatePublishButton();
        renderImages();
        report("Foto establecida como portada principal.", "success");
      }
      return;
    }
    const toggle = event.target.closest("[data-toggle-original]");
    if (toggle) {
      const index = Number(toggle.dataset.toggleOriginal);
      const key = formImages[index]?.pendingFileKey;
      const pending = key && pendingFiles.get(key);
      if (pending) {
        pending.showOriginal = !pending.showOriginal;
        renderImages();
      }
      return;
    }
    const button = event.target.closest("[data-remove-image]");
    if (!button) return;
    const index = Number(button.dataset.removeImage);
    const [removed] = formImages.splice(index, 1);
    cleanupPendingFiles(removed ? [removed] : []);
    formDirty = true;
    updatePublishButton();
    renderImages();
  });
  if (els.categoryList) {
    els.categoryList.addEventListener("click", (event) => {
      const moveBtn = event.target.closest("[data-move-category]");
      if (moveBtn) {
        moveCategory(moveBtn.dataset.moveCategory, Number(moveBtn.dataset.dir));
        return;
      }
      const renameBtn = event.target.closest("[data-rename-category]");
      if (renameBtn) {
        renameCategory(renameBtn.dataset.renameCategory);
        return;
      }
      const deleteBtn = event.target.closest("[data-delete-category]");
      if (deleteBtn) {
        deleteCategory(deleteBtn.dataset.deleteCategory);
        return;
      }
    });
    els.categoryList.addEventListener("change", (event) => {
      const parentSelect = event.target.closest("[data-parent-category]");
      if (parentSelect) {
        changeCategoryParent(parentSelect.dataset.parentCategory, parentSelect.value || null);
      }
    });
  }

  // Atajos: Cmd/Ctrl+S guarda el catálogo; Cmd/Ctrl+Enter guarda la ficha.
  document.addEventListener("keydown", (event) => {
    if (!(event.metaKey || event.ctrlKey)) return;
    if (event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (els.saveCatalog.disabled) {
        report("No hay cambios pendientes para guardar en el catálogo.", "info");
        return;
      }
      saveCatalog();
      return;
    }
    if (event.key === "Enter" && !els.form.hidden) {
      event.preventDefault();
      els.form.requestSubmit();
    }
  });
  if (els.saveBranches) {
    els.saveBranches.addEventListener("click", saveBranches);
  }

  if (els.addVariant) {
    els.addVariant.addEventListener("click", () => {
      formVariants.push({ nombre: "", precio: els.price.value || "" });
      renderVariants();
      formDirty = true;
      updatePublishButton();
      const lastInput = els.variantsList?.querySelector(`.variant-row[data-variant-index="${formVariants.length - 1}"] input`);
      if (lastInput) lastInput.focus();
    });
  }
  if (els.variantsList) {
    els.variantsList.addEventListener("input", (event) => {
      const input = event.target.closest("[data-variant-field]");
      if (!input) return;
      const index = Number(input.dataset.variantIndex);
      const field = input.dataset.variantField;
      if (formVariants[index]) {
        formVariants[index][field] = input.value;
        formDirty = true;
        updatePublishButton();
      }
    });
    els.variantsList.addEventListener("click", (event) => {
      const removeBtn = event.target.closest("[data-remove-variant]");
      if (!removeBtn) return;
      const index = Number(removeBtn.dataset.removeVariant);
      formVariants.splice(index, 1);
      renderVariants();
      formDirty = true;
      updatePublishButton();
    });
  }

  if (els.imageDropzone) {
    els.imageDropzone.addEventListener("click", () => {
      if (!els.fields.disabled) els.imageFiles.click();
    });
    ["dragenter", "dragover"].forEach((eventName) => {
      els.imageDropzone.addEventListener(eventName, (e) => {
        if (!els.fields.disabled) {
          e.preventDefault();
          e.stopPropagation();
          els.imageDropzone.classList.add("is-dragover");
        }
      });
    });
    ["dragleave", "dragend"].forEach((eventName) => {
      els.imageDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        els.imageDropzone.classList.remove("is-dragover");
      });
    });
    els.imageDropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      els.imageDropzone.classList.remove("is-dragover");
      if (els.fields.disabled) return;
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        addImages(files);
      }
    });
  }

  window.addEventListener("paste", (e) => {
    if (els.fields.disabled) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageFiles = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type && item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        if (blob) {
          const extension = item.type.split("/")[1] || "png";
          const file = new File(
            [blob],
            `foto-pegada-${Date.now()}.${extension}`,
            { type: blob.type }
          );
          imageFiles.push(file);
        }
      }
    }
    if (imageFiles.length > 0) {
      e.preventDefault();
      addImages(imageFiles);
      report(`Se pegó ${imageFiles.length === 1 ? "una imagen" : `${imageFiles.length} imágenes`} desde el portapapeles. Quitando fondo con macOS Vision…`, "success");
    }
  });
  els.list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-product-id]");
    if (button) editProduct(button.dataset.productId);
  });
  els.search.addEventListener("input", () => {
    query = els.search.value;
    renderList();
  });
  els.categoryFilter.addEventListener("change", () => {
    filterCategory = els.categoryFilter.value;
    renderList();
  });
  els.name.addEventListener("input", () => {
    if (creating && !els.id.dataset.edited) els.id.value = slugify(els.name.value);
  });
  els.id.addEventListener("input", () => {
    els.id.dataset.edited = "true";
  });
  els.categoryForm.addEventListener("submit", addCategory);
  els.addBranch.addEventListener("click", () => {
    if (!catalog) return;
    const selectedIds = selectedBranchIds();
    const allSelected = (catalog.sucursales || []).every((branch) => selectedIds.includes(branch.id));
    catalog.sucursales.push({ nombre: "", localidad: "", telefono: "" });
    catalog.sucursales[catalog.sucursales.length - 1].id = newBranchId(catalog.sucursales.length - 1);
    if (allSelected) selectedIds.push(catalog.sucursales[catalog.sucursales.length - 1].id);
    renderBranches();
    renderProductBranches(selectedIds);
    markCatalogDirty();
    els.branchList.querySelector(`[data-contact-index="${catalog.sucursales.length - 1}"][data-contact-field="nombre"]`)?.focus();
  });
  els.branchList.addEventListener("input", (event) => {
    const input = event.target.closest("[data-contact-field]");
    if (!input || !catalog) return;
    const index = Number(input.dataset.contactIndex);
    const field = input.dataset.contactField;
    const branch = catalog.sucursales[index];
    if (!branch || !["nombre", "localidad", "telefono"].includes(field)) return;
    branch[field] = input.value;
    updateBranchStatus(index);
    updateProductBranchLabel(branch);
    markCatalogDirty();
  });
  els.branchList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-branch]");
    if (!button || !catalog) return;
    const [removedBranch] = catalog.sucursales.splice(Number(button.dataset.removeBranch), 1);
    const selectedIds = selectedBranchIds().filter((id) => id !== removedBranch?.id);
    catalog.productos.forEach((product) => {
      if (Array.isArray(product.sucursalesDisponibles)) {
        product.sucursalesDisponibles = product.sucursalesDisponibles.filter((id) => id !== removedBranch?.id);
      }
    });
    renderBranches();
    renderProductBranches(selectedIds);
    markCatalogDirty();
  });
  els.file.addEventListener("change", () => {
    const file = els.file.files?.[0];
    if (file) handleFallbackImport(file);
  });
  els.fallbackExport.addEventListener("click", exportCatalog);
  window.addEventListener("beforeunload", (event) => {
    if (catalogDirty || formDirty) {
      event.preventDefault();
      event.returnValue = "";
    }
  });

  const mostrarAvisoLocal = () => {
    if (!els.localWarning) return;
    els.localWarning.innerHTML =
      '<p><strong>Estás viendo el catálogo como archivo local.</strong> Se cargó una copia desde <code>data/catalog.js</code>. Para guardar los cambios en el proyecto, abrí el editor desde la app <strong>Agresti.3D — Editor</strong> o con <code>python3 tools/catalogo/servidor.py</code>. <a href="http://127.0.0.1:8766/tools/catalogo/">Abrir el editor local</a>.</p>';
    els.localWarning.hidden = false;
  };

  const cargarCatalogo = (text, { avisarLocal = false } = {}) => {
    catalog = parseCatalog(text);
    originalCatalogText = text;
    projectHandle = null;
    catalogDirty = false;
    catalogSavedForPublish = false;
    filterCategory = "";
    query = "";
    if (els.search) els.search.value = "";
    updateCategoryControls();
    renderBranches();
    renderList();
    resetForm();
    setConnected(true);
    if (els.panel) els.panel.hidden = true;
    // Servido por el servidor local: ya está conectado, no hace falta elegir
    // carpeta (y así no aparece un botón que el navegador puede rechazar).
    if (location.protocol.startsWith("http") && els.connect) els.connect.hidden = true;
    els.saveCatalog.disabled = true;
    report(`Catálogo cargado automáticamente (${catalog.productos.length} productos).`, "success");
    if (avisarLocal) mostrarAvisoLocal();
  };

  const servidorLocalActivo = () =>
    new Promise((resolve) => {
      const sonda = new Image();
      const limite = setTimeout(() => resolve(false), 900);
      sonda.onload = () => {
        clearTimeout(limite);
        resolve(true);
      };
      sonda.onerror = () => {
        clearTimeout(limite);
        resolve(false);
      };
      sonda.src = `http://127.0.0.1:8766/assets/icons/favicon.svg?ping=${Date.now()}`;
    });

  const autoConnect = async () => {
    let text = null;

    // Si se abrió el archivo a mano pero el servidor local está corriendo,
    // conviene pasar al modo completo (guarda y publica) sin que el usuario
    // tenga que copiar la dirección.
    if (location.protocol.startsWith("http")) {
      try {
        const config = await fetch("/__/firebase/init.json", { cache: "no-cache" }).then(
          (r) => (r.ok ? r.json() : null)
        );
        if (config?.apiKey) {
          const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
            config.projectId
          )}/databases/(default)/documents/catalogo/publicado?key=${encodeURIComponent(
            config.apiKey
          )}`;
          const nube = await fetch(url, { cache: "no-cache" });
          if (nube.ok) {
            const documento = await nube.json();
            const json = documento?.fields?.json?.stringValue;
            if (json) text = json;
          }
        }
      } catch (error) {
        console.warn("No se pudo leer Firestore:", error);
      }
      if (!text) {
        try {
          const response = await fetch(`../../data/catalog.json?v=${Date.now()}`);
          if (response.ok) text = await response.text();
        } catch (error) {
          console.warn("No se pudo leer catalog.json:", error);
        }
      }
    }

    // Copia embebida: permite abrir el editor con doble clic, sin servidor.
    if (!text && window.__AGRESTI_CATALOG__) {
      text = JSON.stringify(window.__AGRESTI_CATALOG__);
    }

    if (!text) {
      report("No se pudo cargar el catálogo automáticamente. Abrí el editor desde la app Agresti.3D — Editor o cargá data/catalog.json desde el panel de abajo.", "warning");
      return;
    }

    try {
      cargarCatalogo(text, { avisarLocal: !location.protocol.startsWith("http") });
    } catch (error) {
      console.warn("No se pudo auto-conectar:", error);
      report(`No se pudo cargar el catálogo: ${error.message}`, "error");
    }
  };

  if (!supportsDirectoryAccess) {
    els.connect.hidden = true;
    els.fallbackImport.hidden = false;
    els.hint.textContent = "En Safari, el catálogo se conecta automáticamente desde el servidor local.";
  }

  inicializarEtiquetas();
  setConnected(false);
  autoConnect();

  function updateDescriptionCounts() {
    const shortCount = $("#descriptionShortCount");
    const longCount = $("#descriptionLongCount");
    if (shortCount) shortCount.textContent = String(els.description.value.length);
    if (longCount) longCount.textContent = String(els.longDescription.value.length);
  }
})();
