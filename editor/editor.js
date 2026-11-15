(() => {
  "use strict";

  const CONFIG = window.AGRESTI_CLOUD || {};
  const FIREBASE_CONFIG = CONFIG.firebase || {};
  const ADMIN_PRINCIPAL_EMAIL = String(CONFIG.adminEmail || "").trim().toLowerCase();
  const LEGACY_EDITORES = CONFIG.legacyEditors || {};
  const SECCIONES_EDITOR = [
    { id: "productos", etiqueta: "Productos" },
    { id: "categorias", etiqueta: "Categorías" },
    { id: "sucursales", etiqueta: "Sucursales" },
    { id: "pedidos", etiqueta: "Pedidos" },
    { id: "instagram", etiqueta: "Instagram" },
    { id: "etiquetas", etiqueta: "Etiquetas" },
    { id: "herramientas", etiqueta: "Herramientas" },
  ];
  const CLOUDINARY = CONFIG.cloudinary || {};
  const CATALOG_DOC = "catalogo";
  const DRAFT_DOC = "borrador";
  const PUBLISHED_DOC = "publicado";

  const $ = (selector) => document.querySelector(selector);
  const els = {
    loginView: $("#loginView"),
    loginForm: $("#loginForm"),
    loginEmail: $("#loginEmail"),
    loginPassword: $("#loginPassword"),
    loginButton: $("#loginButton"),
    loginStatus: $("#loginStatus"),
    resetPassword: $("#resetPassword"),
    appView: $("#appView"),
    userEmail: $("#userEmail"),
    logoutButton: $("#logoutButton"),
    productCount: $("#productCount"),
    searchProducts: $("#searchProducts"),
    productList: $("#productList"),
    newProduct: $("#newProduct"),
    emptyNewProduct: $("#emptyNewProduct"),
    emptyState: $("#emptyState"),
    productForm: $("#productForm"),
    formEyebrow: $("#formEyebrow"),
    formTitle: $("#formTitle"),
    deleteProduct: $("#deleteProduct"),
    productName: $("#productName"),
    productId: $("#productId"),
    productCategories: $("#productCategories"),
    productAudience: $("#productAudience"),
    productOccasions: $("#productOccasions"),
    productPrice: $("#productPrice"),
    productPriceNote: $("#productPriceNote"),
    productBranches: $("#productBranches"),
    productDescription: $("#productDescription"),
    productLongDescription: $("#productLongDescription"),
    productHeight: $("#productHeight"),
    productWidth: $("#productWidth"),
    productLength: $("#productLength"),
    productWeight: $("#productWeight"),
    productMaterial: $("#productMaterial"),
    productColors: $("#productColors"),
    productCapacity: $("#productCapacity"),
    productOptions: $("#productOptions"),
    productContents: $("#productContents"),
    productCare: $("#productCare"),
    duplicateProduct: $("#duplicateProduct"),
    categoryFilter: $("#categoryFilter"),
    variantList: $("#variantList"),
    addVariant: $("#addVariant"),
    reviewList: $("#reviewList"),
    addReview: $("#addReview"),
    reviewStatus: $("#reviewStatus"),
    pendingReviewsList: $("#pendingReviewsList"),
    pendingReviewsStatus: $("#pendingReviewsStatus"),
    reloadPendingReviews: $("#reloadPendingReviews"),
    pedidosList: $("#pedidosList"),
    pedidosStatus: $("#pedidosStatus"),
    reloadPedidos: $("#reloadPedidos"),
    branchList: $("#branchList"),
    addBranch: $("#addBranch"),
    saveBranches: $("#saveBranches"),
    branchStatus: $("#branchStatus"),
    imageFiles: $("#imageFiles"),
    imageCutoutQuality: $("#imageCutoutQuality"),
    imageList: $("#imageList"),
    imageStatus: $("#imageStatus"),
    imageProgress: $("#imageProgress"),
    imageProgressTitle: $("#imageProgressTitle"),
    imageProgressDetail: $("#imageProgressDetail"),
    imageProgressBar: $("#imageProgressBar"),
    imageEditorDialog: $("#imageEditorDialog"),
    imageEditorCanvas: $("#imageEditorCanvas"),
    imageEditorStage: $("#imageEditorStage"),
    imageBrushCursor: $("#imageBrushCursor"),
    imageEditorTitle: $("#imageEditorTitle"),
    imageEditorHelp: $("#imageEditorHelp"),
    imageEditorClose: $("#imageEditorClose"),
    imageEditorCancel: $("#imageEditorCancel"),
    imageEditorAccept: $("#imageEditorAccept"),
    imageEditorUndo: $("#imageEditorUndo"),
    imageEditorTools: $("#imageEditorTools"),
    imageBrushSize: $("#imageBrushSize"),
    imageLightbox: $("#imageLightbox"),
    imageLightboxImg: $("#imageLightboxImg"),
    imageLightboxCaption: $("#imageLightboxCaption"),
    imageLightboxClose: $("#imageLightboxClose"),
    imageFrameDialog: $("#imageFrameDialog"),
    imageFrameCanvas: $("#imageFrameCanvas"),
    imageFrameZoom: $("#imageFrameZoom"),
    imageFrameZoomValue: $("#imageFrameZoomValue"),
    imageFrameCenter: $("#imageFrameCenter"),
    imageFrameReset: $("#imageFrameReset"),
    imageFrameClose: $("#imageFrameClose"),
    imageFrameCancel: $("#imageFrameCancel"),
    imageFrameAccept: $("#imageFrameAccept"),
    exportCatalogName: $("#exportCatalogName"),
    exportCatalogBackup: $("#exportCatalogBackup"),
    exportCatalogMeta: $("#exportCatalogMeta"),
    exportCatalogStatus: $("#exportCatalogStatus"),
    importCatalogFile: $("#importCatalogFile"),
    importCatalogPreview: $("#importCatalogPreview"),
    importCatalogName: $("#importCatalogName"),
    importCatalogMeta: $("#importCatalogMeta"),
    importCatalogStatus: $("#importCatalogStatus"),
    confirmImportCatalog: $("#confirmImportCatalog"),
    cancelImportCatalog: $("#cancelImportCatalog"),
    catalogHistoryList: $("#catalogHistoryList"),
    catalogHistoryStatus: $("#catalogHistoryStatus"),
    refreshCatalogHistory: $("#refreshCatalogHistory"),
    compareCatalog: $("#compareCatalog"),
    compareCatalogResult: $("#compareCatalogResult"),
    compareCatalogStatus: $("#compareCatalogStatus"),
    auditCatalog: $("#auditCatalog"),
    auditCatalogResult: $("#auditCatalogResult"),
    auditCatalogStatus: $("#auditCatalogStatus"),
    scanHeavyImages: $("#scanHeavyImages"),
    optimizeHeavyImages: $("#optimizeHeavyImages"),
    heavyImagesResult: $("#heavyImagesResult"),
    heavyImagesStatus: $("#heavyImagesStatus"),
    restoreLastPublication: $("#restoreLastPublication"),
    restoreLastPublicationMeta: $("#restoreLastPublicationMeta"),
    restoreLastPublicationStatus: $("#restoreLastPublicationStatus"),
    editorUsersCard: $("#editorUsersCard"),
    editorUsersList: $("#editorUsersList"),
    editorUserForm: $("#editorUserForm"),
    editorUserFormSummary: $("#editorUserFormSummary"),
    editorUserEmail: $("#editorUserEmail"),
    editorUserName: $("#editorUserName"),
    editorUserPassword: $("#editorUserPassword"),
    editorUserPasswordField: $("#editorUserPasswordField"),
    editorUserPublish: $("#editorUserPublish"),
    editorUserActive: $("#editorUserActive"),
    editorUserSendReset: $("#editorUserSendReset"),
    editorUserSave: $("#editorUserSave"),
    editorUserCancel: $("#editorUserCancel"),
    editorUserStatus: $("#editorUserStatus"),
    videoFiles: $("#videoFiles"),
    videoList: $("#videoList"),
    videoStatus: $("#videoStatus"),
    saveDraft: $("#saveDraft"),
    publishCatalog: $("#publishCatalog"),
    saveStatus: $("#saveStatus"),
    categoryList: $("#categoryList"),
    categoryForm: $("#categoryForm"),
    categoryName: $("#categoryName"),
    categoryParent: $("#categoryParent"),
    categoryCoverDialog: $("#categoryCoverDialog"),
    categoryCoverClose: $("#categoryCoverClose"),
    categoryCoverGrid: $("#categoryCoverGrid"),
    categoryCoverTitle: $("#categoryCoverTitle"),
    categoryCoverCount: $("#categoryCoverCount"),
    toast: $("#toast"),
    importCatalog: $("#importCatalog"),
    importStatus: $("#importStatus"),
  };

  let auth = null;
  let db = null;
  let currentUser = null;
  let currentAccess = null;
  let usuarioEditando = null;
  let editoresCache = [];
  let catalog = null;
  let selectedId = null;
  let creating = false;
  let query = "";
  let filterCategory = "";
  let dirty = false;
  let saving = false;
  let removeBackgroundPromise = null;
  let procesandoFotos = false;
  let editorRecorteState = null;
  let editorEncuadreState = null;
  let categoriasAbiertas = new Set();
  let categoriasAbiertasInicializadas = false;
  let arrastrandoCategoria = null;
  let dropCategoria = null;
  let dropPosicion = null;
  let dropRaiz = false;
  let importacionPendiente = null;
  let ultimaHuellaHistorial = "";
  let ultimoTiempoHistorial = 0;
  let imagenesPesadas = [];
  let publicacionAnterior = null;
  let toastTimer = null;
  let loginNotice = "";
  let importing = false;
  let autosaveTimer = null;

  const programarAutoguardado = () => {
    window.clearTimeout(autosaveTimer);
    if (!auth?.currentUser || saving || importing) return;
    if (!puedeEditarCatalogo()) return;
    if (creating && !els.productName?.value.trim()) return;
    autosaveTimer = window.setTimeout(() => {
      if (dirty && !saving) guardarBorrador(null, { silencioso: true });
    }, 1500);
  };

  const escapeHTML = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const slugify = (value) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70);

  const clone = (value) => JSON.parse(JSON.stringify(value));

  const setStatus = (element, message, state = "") => {
    if (!element) return;
    element.textContent = message || "";
    element.dataset.state = state;
  };

  const toast = (message, state = "") => {
    if (!els.toast) return;
    window.clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.dataset.state = state;
    els.toast.hidden = false;
    toastTimer = window.setTimeout(() => {
      els.toast.hidden = true;
    }, 6000);
  };

  const imageURL = (src) => {
    if (!src) return "";
    if (/^(?:https?:|data:|blob:)/i.test(src)) return src;
    const path = String(src).split("?")[0].replace(/^\/+/, "");
    return new URL(`../${path}`, location.href).href;
  };

  const categoryPath = (id) => {
    const partes = [];
    let actual = catalog?.categorias?.find((categoria) => categoria.id === id);
    let guard = 0;
    while (actual && guard < 20) {
      partes.unshift(actual.nombre);
      actual = catalog.categorias.find((categoria) => categoria.id === actual.padre);
      guard += 1;
    }
    return partes.join(" / ");
  };

  const categoryOptions = (incluirTodas = false) => {
    const items = (catalog?.categorias || [])
      .map((categoria) => ({ ...categoria, ruta: categoryPath(categoria.id) }))
      .sort((a, b) => a.ruta.localeCompare(b.ruta, "es"));
    return (incluirTodas ? [{ id: "", ruta: "Todas las categorías" }] : []).concat(items);
  };

  const esIdProvisional = (id) => /^producto-sin-titulo(?:-\d+)?$/.test(String(id || ""));

  const generarIdProducto = (nombre, ignorarId = null, catalogo = catalog) => {
    const base = slugify(nombre) || "producto";
    let candidato = base;
    let sufijo = 2;
    while ((catalogo?.productos || []).some((producto) => producto.id === candidato && producto.id !== ignorarId)) {
      candidato = `${base}-${sufijo++}`;
    }
    return candidato;
  };

  const migrarIdsProductos = (data) => {
    let cambios = 0;
    (data?.productos || []).forEach((producto) => {
      if (!esIdProvisional(producto.id)) return;
      const nombre = String(producto.nombre || "").trim();
      if (!nombre || /^producto sin t[ií]tulo$/i.test(nombre)) return;
      const nuevoId = generarIdProducto(nombre, producto.id, data);
      if (nuevoId === producto.id) return;
      producto.idsAnteriores = [...new Set([...(producto.idsAnteriores || []), producto.id])];
      producto.id = nuevoId;
      cambios += 1;
    });
    return cambios;
  };

  const categoriasProducto = (producto) => {
    const ids = Array.isArray(producto?.categorias) ? producto.categorias : [];
    if (!ids.length && producto?.categoria) ids.push(producto.categoria);
    return [...new Set(ids)];
  };

  const categoriasDeRama = (categoriaId) => {
    const ids = new Set([categoriaId]);
    let cambio = true;
    while (cambio) {
      cambio = false;
      (catalog?.categorias || []).forEach((categoria) => {
        if (categoria.padre && ids.has(categoria.padre) && !ids.has(categoria.id)) {
          ids.add(categoria.id);
          cambio = true;
        }
      });
    }
    return ids;
  };

  const opcionesPortada = (categoria) => {
    const rama = categoriasDeRama(categoria.id);
    const productos = (catalog?.productos || []).filter((producto) =>
      categoriasProducto(producto).some((id) => rama.has(id))
    );
    const opciones = [];
    productos.forEach((producto) => {
      (producto.imagenes || []).forEach((imagen, indice) => {
        if (imagen?.src) opciones.push({ valor: imagen.src, etiqueta: `${producto.nombre} · Foto ${indice + 1}` });
      });
    });
    return opciones;
  };

  const portadaAuto = (categoria) => {
    const rama = categoriasDeRama(categoria.id);
    const productos = (catalog?.productos || []).filter((producto) =>
      categoriasProducto(producto).some((id) => rama.has(id)) && producto.imagenes?.length
    );
    const ultimo = [...productos].sort((a, b) => String(b.creado || "").localeCompare(String(a.creado || "")))[0] || productos[0];
    return ultimo?.imagenes?.[0]?.src || "";
  };

  const portadaPreview = (categoria) =>
    categoria.portada && categoria.portada !== "auto" ? categoria.portada : portadaAuto(categoria);

  let portadaCategoriaId = null;
  const abrirPortada = (id) => {
    const categoria = catalog?.categorias?.find((item) => item.id === id);
    if (!categoria || !els.categoryCoverDialog) return;
    portadaCategoriaId = id;
    const opciones = opcionesPortada(categoria);
    const auto = portadaAuto(categoria);
    const esAuto = !categoria.portada || categoria.portada === "auto";
    if (els.categoryCoverTitle) els.categoryCoverTitle.textContent = `Portada de ${categoria.nombre}`;
    if (els.categoryCoverCount) {
      els.categoryCoverCount.textContent = opciones.length
        ? `${opciones.length} fotos disponibles en esta categoría.`
        : "Esta categoría todavía no tiene fotos de productos.";
    }
    els.categoryCoverGrid.innerHTML = `
      <button type="button" class="cloud-cover-option${esAuto ? " is-selected" : ""}" data-cover-value="__auto__">
        ${auto ? `<img src="${escapeHTML(imageURL(auto))}" alt="" loading="lazy">` : '<span class="cloud-cover-option__empty">AUTO</span>'}
        <strong>Último artículo subido</strong>
        <span>Automática</span>
      </button>
      ${opciones
        .map(
          (opcion) => `<button type="button" class="cloud-cover-option${opcion.valor === categoria.portada ? " is-selected" : ""}" data-cover-value="${escapeHTML(opcion.valor)}">
            <img src="${escapeHTML(imageURL(opcion.valor))}" alt="" loading="lazy">
            <strong>${escapeHTML(opcion.etiqueta)}</strong>
          </button>`
        )
        .join("")}`;
    if (typeof els.categoryCoverDialog.showModal === "function") els.categoryCoverDialog.showModal();
    else els.categoryCoverDialog.setAttribute("open", "");
  };

  const renderCategoriaChecks = (seleccionadas = null) => {
    if (!els.productCategories) return;
    const actuales = seleccionadas
      ? new Set(seleccionadas)
      : new Set(
          [...els.productCategories.querySelectorAll("input:checked")].map((input) => input.value)
        );
    const opciones = categoryOptions();
    els.productCategories.innerHTML = opciones
      .map(
        (categoria) => `<label><input type="checkbox" value="${escapeHTML(categoria.id)}" ${actuales.has(categoria.id) ? "checked" : ""}><span>${escapeHTML(categoria.ruta)}</span></label>`
      )
      .join("");
  };

  const marcarCategorias = (ids) => {
    if (!els.productCategories) return;
    const set = new Set(ids);
    els.productCategories.querySelectorAll("input[type=checkbox]").forEach((input) => {
      input.checked = set.has(input.value);
    });
  };

  const leerChecks = (contenedor) =>
    [...(contenedor?.querySelectorAll("input:checked") || [])].map((input) => input.value);

  const marcarChecks = (contenedor, valores = []) => {
    if (!contenedor) return;
    const set = new Set(valores);
    contenedor.querySelectorAll("input[type=checkbox]").forEach((input) => {
      input.checked = set.has(input.value);
    });
  };

  const parseDetails = (texto) => {
    const detalles = {};
    String(texto || "")
      .split("\n")
      .map((linea) => linea.trim())
      .filter(Boolean)
      .forEach((linea) => {
        const indice = linea.indexOf(":");
        if (indice < 1) return;
        const clave = linea.slice(0, indice).trim();
        const valor = linea.slice(indice + 1).trim();
        if (clave && valor) detalles[clave] = valor;
      });
    return detalles;
  };

  const formatDetails = (detalles) =>
    Object.entries(detalles || {})
      .map(([clave, valor]) => `${clave}: ${valor}`)
      .join("\n");

  const mostrarLogin = (mensaje = "", error = false) => {
    if (els.appView) els.appView.hidden = true;
    if (els.loginView) els.loginView.hidden = false;
    if (mensaje) setStatus(els.loginStatus, mensaje, error ? "error" : "");
  };

  const mostrarApp = () => {
    if (els.loginView) els.loginView.hidden = true;
    if (els.appView) els.appView.hidden = false;
  };

  const firebaseErrorMessage = (error) => {
    const code = String(error?.code || "");
    const map = {
      "auth/invalid-email": "El email no es válido.",
      "auth/missing-password": "Escribí la contraseña.",
      "auth/wrong-password": "La contraseña no es correcta.",
      "auth/invalid-credential": "Email o contraseña incorrectos.",
      "auth/user-not-found": "No existe una cuenta con ese email.",
      "auth/too-many-requests": "Demasiados intentos. Probá de nuevo en unos minutos.",
      "auth/network-request-failed": "No hay conexión. Revisá internet.",
      "auth/operation-not-allowed": "Falta habilitar Email/Password en Firebase Authentication.",
      "auth/configuration-not-found": "Firebase Authentication todavía no está configurado.",
      "auth/unauthorized-domain": "Este dominio no está autorizado en Firebase Authentication.",
      "auth/timeout": "La conexión con Firebase tardó demasiado. Revisá internet e intentá de nuevo.",
      "permission-denied": "No tenés permiso para esta operación. Revisá las reglas de Firestore.",
    };
    return map[code] || error?.message || "Ocurrió un error inesperado.";
  };

  const initFirebase = () => {
    if (!window.firebase) {
      mostrarLogin("No se pudo cargar Firebase. Revisá la conexión e intentá de nuevo.", true);
      return false;
    }
    try {
      firebase.initializeApp(FIREBASE_CONFIG);
      auth = firebase.auth();
      db = firebase.firestore();
    } catch (error) {
      mostrarLogin(`No se pudo iniciar Firebase: ${error.message}`, true);
      return false;
    }
    return true;
  };

  const permisosCompletos = () => Object.fromEntries(SECCIONES_EDITOR.map((seccion) => [seccion.id, true]));

  const normalizarPermisos = (permisos) =>
    Object.fromEntries(SECCIONES_EDITOR.map((seccion) => [seccion.id, Boolean(permisos?.[seccion.id])]));

  const puede = (seccion) => Boolean(currentAccess?.principal || currentAccess?.permisos?.[seccion]);
  const puedeEditarCatalogo = () => Boolean(currentAccess?.principal || ["productos", "categorias", "sucursales"].some((seccion) => puede(seccion)));
  const puedePublicarCambios = () => Boolean(currentAccess?.principal || currentAccess?.puedePublicar);

  const primerTabPermitida = () => SECCIONES_EDITOR.find((seccion) => puede(seccion.id))?.id || "";
  const tabPermitida = (nombre) => puede(nombre);

  const aplicarPermisosUI = () => {
    document.querySelectorAll("[data-cloud-tab]").forEach((tab) => {
      const permitida = tabPermitida(tab.dataset.cloudTab);
      tab.hidden = !permitida;
      tab.disabled = !permitida;
    });
    if (els.saveDraft) els.saveDraft.hidden = !puedeEditarCatalogo();
    if (els.publishCatalog) els.publishCatalog.hidden = !puedePublicarCambios();
    if (els.editorUsersCard) els.editorUsersCard.hidden = !currentAccess?.principal;
    if (els.userEmail) {
      const rol = currentAccess?.principal ? "Administrador principal" : currentAccess?.nombre || "Editor";
      els.userEmail.textContent = `${currentUser?.email || ""} · ${rol}`;
    }
    const activa = document.querySelector("[data-cloud-tab][aria-selected='true']")?.dataset.cloudTab;
    if (!activa || !tabPermitida(activa)) {
      const primera = primerTabPermitida();
      if (primera) activarCloudTab(primera);
    }
    if (currentAccess?.principal) cargarEditores();
  };

  const cargarAcceso = async (user) => {
    const email = String(user?.email || "").trim().toLowerCase();
    if (!email) throw Object.assign(new Error("La cuenta no tiene un email válido."), { code: "editor/sin-email" });
    if (email === ADMIN_PRINCIPAL_EMAIL) {
      return {
        principal: true,
        email,
        nombre: "Administrador principal",
        activo: true,
        permisos: permisosCompletos(),
        puedePublicar: true,
      };
    }
    let datos = null;
    if (db) {
      const snap = await db.collection("editores").doc(email).get();
      if (snap.exists) datos = snap.data();
    }
    if (!datos && LEGACY_EDITORES[email]) datos = LEGACY_EDITORES[email];
    if (!datos) {
      throw Object.assign(new Error("Esta cuenta todavía no tiene permisos. Pedile al administrador principal que la habilite."), { code: "editor/sin-acceso" });
    }
    if (datos.activo === false) {
      throw Object.assign(new Error("Esta cuenta está desactivada."), { code: "editor/desactivado" });
    }
    const permisos = normalizarPermisos(datos.permisos);
    if (!Object.values(permisos).some(Boolean)) {
      throw Object.assign(new Error("Esta cuenta no tiene ninguna sección habilitada."), { code: "editor/sin-secciones" });
    }
    return {
      principal: false,
      email,
      nombre: datos.nombre || email,
      activo: true,
      permisos,
      puedePublicar: Boolean(datos.puedePublicar),
    };
  };

  const manejarSesion = async (user) => {
    currentUser = user;
    if (!user) {
      currentAccess = null;
      mostrarLogin(loginNotice, Boolean(loginNotice));
      loginNotice = "";
      return;
    }
    try {
      currentAccess = await cargarAcceso(user);
    } catch (error) {
      loginNotice = error.message || "Esta cuenta no tiene permisos para entrar al editor.";
      await auth.signOut().catch(() => {});
      mostrarLogin(loginNotice, true);
      return;
    }
    aplicarPermisosUI();
    mostrarApp();
    try {
      await cargarCatalogo();
    } catch (error) {
      toast(`No se pudo cargar el catálogo: ${firebaseErrorMessage(error)}`, "error");
    }
  };

  const generarPasswordTemporal = () => `Agresti-${Math.random().toString(36).slice(2, 10)}!`;

  const crearCuentaAuthEditor = async (email, password) => {
    const nombreApp = `editor-usuario-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const app = firebase.initializeApp(FIREBASE_CONFIG, nombreApp);
    try {
      const authSecundaria = app.auth();
      await authSecundaria.createUserWithEmailAndPassword(email, password);
      await authSecundaria.signOut();
    } finally {
      await app.delete().catch(() => {});
    }
  };

  const etiquetasPermisosEditor = (permisos) =>
    SECCIONES_EDITOR.filter((seccion) => permisos?.[seccion.id]).map((seccion) => seccion.etiqueta).join(", ") || "Sin secciones";

  const cargarEditores = async () => {
    if (!currentAccess?.principal || !db || !els.editorUsersList) return;
    if (els.editorUsersCard) els.editorUsersCard.hidden = false;
    try {
      const snap = await db.collection("editores").orderBy("email").get();
      editoresCache = snap.docs.map((doc) => ({ email: doc.id, ...doc.data() }));
      const conocidos = new Set(editoresCache.map((editor) => editor.email));
      const heredados = Object.keys(LEGACY_EDITORES)
        .filter((email) => !conocidos.has(email))
        .map((email) => ({ email, ...LEGACY_EDITORES[email], heredado: true }));
      const todos = [...editoresCache, ...heredados];
      const filaPrincipal = `<li class="cloud-user-row"><span><strong>${escapeHTML(ADMIN_PRINCIPAL_EMAIL)}</strong><br><small>Administrador principal · todas las secciones y usuarios</small></span><span class="cloud-user-badge">Principal</span></li>`;
      const filas = todos.map((editor) => {
        const activo = editor.activo !== false;
        return `<li class="cloud-user-row">
          <span><strong>${escapeHTML(editor.email)}</strong><br><small>${escapeHTML(editor.nombre || "Sin nombre")} · ${escapeHTML(etiquetasPermisosEditor(editor.permisos))}${editor.heredado ? " · acceso heredado sin configurar" : ""}</small></span>
          <span class="cloud-user-row__actions">
            <span class="cloud-user-badge ${activo ? "is-active" : "is-off"}">${activo ? "Activo" : "Inactivo"}</span>
            <button type="button" data-edit-editor="${escapeHTML(editor.email)}">Editar</button>
            ${editor.heredado ? "" : `<button type="button" data-toggle-editor="${escapeHTML(editor.email)}" data-next-active="${activo ? "false" : "true"}">${activo ? "Desactivar" : "Activar"}</button>`}
          </span>
        </li>`;
      }).join("");
      els.editorUsersList.innerHTML = `<h4>Usuarios del editor</h4><ul>${filaPrincipal}${filas}</ul>`;
    } catch (error) {
      els.editorUsersList.innerHTML = `<p class="cloud-tool-empty">No se pudieron cargar los usuarios: ${escapeHTML(error.message)}</p>`;
    }
  };

  const editarEditor = async (email) => {
    if (!currentAccess?.principal) return;
    let editor = editoresCache.find((item) => item.email === email);
    if (!editor) editor = { email, ...(LEGACY_EDITORES[email] || {}) };
    if (!editor) return;
    usuarioEditando = email;
    els.editorUserEmail.value = email;
    els.editorUserEmail.disabled = true;
    els.editorUserName.value = editor.nombre || "";
    els.editorUserPassword.value = "";
    if (els.editorUserPasswordField) els.editorUserPasswordField.hidden = true;
    els.editorUserActive.checked = editor.activo !== false;
    els.editorUserPublish.checked = Boolean(editor.puedePublicar);
    els.editorUserSendReset.checked = true;
    document.querySelectorAll("[data-editor-permission]").forEach((input) => {
      input.checked = Boolean(editor.permisos?.[input.dataset.editorPermission]);
    });
    if (els.editorUserFormSummary) els.editorUserFormSummary.textContent = `Editar ${email}`;
    if (els.editorUserSave) els.editorUserSave.textContent = "Guardar permisos";
    if (els.editorUserCancel) els.editorUserCancel.hidden = false;
    els.editorUserForm.closest("details")?.setAttribute("open", "");
    setStatus(els.editorUserStatus, "Editando permisos. El email no se puede cambiar.");
  };

  const limpiarFormularioEditor = () => {
    usuarioEditando = null;
    els.editorUserForm?.reset();
    if (els.editorUserEmail) {
      els.editorUserEmail.value = "";
      els.editorUserEmail.disabled = false;
    }
    if (els.editorUserPasswordField) els.editorUserPasswordField.hidden = false;
    if (els.editorUserFormSummary) els.editorUserFormSummary.textContent = "Crear usuario";
    if (els.editorUserSave) els.editorUserSave.textContent = "Crear usuario";
    if (els.editorUserCancel) els.editorUserCancel.hidden = true;
    if (els.editorUserStatus) setStatus(els.editorUserStatus, "");
  };

  const guardarEditor = async (event) => {
    event?.preventDefault();
    if (!currentAccess?.principal) return;
    const email = String(els.editorUserEmail?.value || "").trim().toLowerCase();
    const nombre = String(els.editorUserName?.value || "").trim();
    const esNuevo = !usuarioEditando;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setStatus(els.editorUserStatus, "Ingresá un email válido.", "error");
      return;
    }
    if (email === ADMIN_PRINCIPAL_EMAIL) {
      setStatus(els.editorUserStatus, "La cuenta principal no se puede editar desde acá.", "error");
      return;
    }
    const permisos = Object.fromEntries(
      [...document.querySelectorAll("[data-editor-permission]")].map((input) => [input.dataset.editorPermission, input.checked])
    );
    const activo = Boolean(els.editorUserActive?.checked);
    const puedePublicar = Boolean(els.editorUserPublish?.checked);
    if (activo && !Object.values(permisos).some(Boolean)) {
      setStatus(els.editorUserStatus, "Marcá al menos una sección para una cuenta activa.", "error");
      return;
    }
    let passwordTemporal = String(els.editorUserPassword?.value || "").trim();
    const enviarReset = Boolean(els.editorUserSendReset?.checked);
    let cuentaExistente = false;
    try {
      if (esNuevo) {
        if (!passwordTemporal) passwordTemporal = generarPasswordTemporal();
        if (passwordTemporal.length < 6) {
          setStatus(els.editorUserStatus, "La contraseña debe tener al menos 6 caracteres.", "error");
          return;
        }
        try {
          await crearCuentaAuthEditor(email, passwordTemporal);
        } catch (error) {
          if (error.code === "auth/email-already-in-use") cuentaExistente = true;
          else throw error;
        }
      }
      const doc = {
        email,
        nombre: nombre || email,
        activo,
        permisos,
        puedePublicar,
        actualizado: firebase.firestore.FieldValue.serverTimestamp(),
        actualizadoPor: currentUser?.email || "",
      };
      if (esNuevo) doc.creado = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection("editores").doc(email).set(doc, { merge: true });
      let resetEnviado = false;
      if (enviarReset) {
        try {
          await auth.sendPasswordResetEmail(email);
          resetEnviado = true;
        } catch (error) {
          resetEnviado = false;
        }
      }
      await cargarEditores();
      limpiarFormularioEditor();
      const partes = [esNuevo ? (cuentaExistente ? "La cuenta ya existía; permisos guardados." : "Usuario creado.") : "Permisos actualizados."];
      if (resetEnviado) partes.push("Se envió un email para que elija su contraseña.");
      else if (esNuevo && passwordTemporal && !cuentaExistente) partes.push(`Contraseña temporal: ${passwordTemporal}`);
      setStatus(els.editorUserStatus, partes.join(" "), "success");
    } catch (error) {
      setStatus(els.editorUserStatus, `No se pudo guardar el usuario: ${firebaseErrorMessage(error)}`, "error");
    }
  };

  const cambiarActivoEditor = async (email, activo) => {
    if (!currentAccess?.principal) return;
    if (!window.confirm(`${activo ? "Activar" : "Desactivar"} a ${email}?`)) return;
    try {
      await db.collection("editores").doc(email).set({
        activo,
        actualizado: firebase.firestore.FieldValue.serverTimestamp(),
        actualizadoPor: currentUser?.email || "",
      }, { merge: true });
      await cargarEditores();
      setStatus(els.editorUserStatus, `Cuenta ${activo ? "activada" : "desactivada"}.`, "success");
    } catch (error) {
      setStatus(els.editorUserStatus, `No se pudo cambiar el estado: ${firebaseErrorMessage(error)}`, "error");
    }
  };

  const conTiempoMaximo = (promesa, ms = 15000) =>
    Promise.race([
      promesa,
      new Promise((_, rechazar) => {
        window.setTimeout(() => rechazar(Object.assign(new Error("Tiempo de espera agotado."), { code: "auth/timeout" })), ms);
      }),
    ]);

  const login = async (event) => {
    event.preventDefault();
    const email = els.loginEmail.value.trim();
    const password = els.loginPassword.value;
    if (!email || !password) {
      setStatus(els.loginStatus, "Completá email y contraseña.", "error");
      return;
    }
    setStatus(els.loginStatus, "Ingresando…");
    try {
      await conTiempoMaximo(auth.signInWithEmailAndPassword(email, password));
      setStatus(els.loginStatus, "");
    } catch (error) {
      setStatus(els.loginStatus, firebaseErrorMessage(error), "error");
    }
  };

  const resetPassword = async () => {
    const email = els.loginEmail.value.trim();
    if (!email) {
      setStatus(els.loginStatus, "Escribí tu email para enviarte el enlace.", "error");
      return;
    }
    try {
      await auth.sendPasswordResetEmail(email);
      setStatus(els.loginStatus, "Te enviamos un email para restablecer la contraseña.");
    } catch (error) {
      setStatus(els.loginStatus, firebaseErrorMessage(error), "error");
    }
  };

  const iniciarSesionUI = () => {
    if (els.loginForm) els.loginForm.addEventListener("submit", login);
    if (els.resetPassword) els.resetPassword.addEventListener("click", resetPassword);
    if (els.logoutButton) {
      els.logoutButton.addEventListener("click", async () => {
        if (dirty && !window.confirm("Hay cambios sin guardar. ¿Salir igual?")) return;
        loginNotice = "";
        await auth.signOut();
      });
    }
    if (els.newProduct) els.newProduct.addEventListener("click", nuevoProducto);
    if (els.emptyNewProduct) els.emptyNewProduct.addEventListener("click", nuevoProducto);
    if (els.searchProducts) {
      els.searchProducts.addEventListener("input", () => {
        query = els.searchProducts.value;
        renderProductos();
      });
    }
    if (els.categoryFilter) {
      els.categoryFilter.addEventListener("change", () => {
        filterCategory = els.categoryFilter.value;
        renderProductos();
      });
    }
    document.querySelectorAll("[data-form-tab]").forEach((tab) => {
      tab.addEventListener("click", () => activarFormTab(tab.dataset.formTab));
    });
    if (els.duplicateProduct) els.duplicateProduct.addEventListener("click", duplicarProducto);
    if (els.productList) {
      els.productList.addEventListener("click", (event) => {
        const boton = event.target.closest("[data-id]");
        if (boton) editarProducto(boton.dataset.id);
      });
    }
    if (els.productForm) {
      els.productForm.addEventListener("submit", guardarBorrador);
      els.productForm.addEventListener("input", () => {
        dirty = true;
        programarAutoguardado();
      });
    }
    if (els.publishCatalog) els.publishCatalog.addEventListener("click", publicar);
    if (els.editorUserForm) els.editorUserForm.addEventListener("submit", guardarEditor);
    if (els.editorUserCancel) els.editorUserCancel.addEventListener("click", limpiarFormularioEditor);
    if (els.editorUsersList) els.editorUsersList.addEventListener("click", (event) => {
      const editar = event.target.closest("[data-edit-editor]");
      if (editar) {
        editarEditor(editar.dataset.editEditor);
        return;
      }
      const alternar = event.target.closest("[data-toggle-editor]");
      if (alternar) cambiarActivoEditor(alternar.dataset.toggleEditor, alternar.dataset.nextActive === "true");
    });
    if (els.deleteProduct) els.deleteProduct.addEventListener("click", eliminarProducto);
    if (els.categoryForm) els.categoryForm.addEventListener("submit", agregarCategoria);
    if (els.categoryCoverClose) els.categoryCoverClose.addEventListener("click", () => els.categoryCoverDialog?.close());
    els.categoryCoverDialog?.addEventListener("click", (event) => {
      if (event.target === els.categoryCoverDialog) els.categoryCoverDialog.close();
    });
    els.categoryCoverGrid?.addEventListener("click", (event) => {
      const opcion = event.target.closest("[data-cover-value]");
      if (!opcion) return;
      const categoria = catalog?.categorias?.find((item) => item.id === portadaCategoriaId);
      if (!categoria) return;
      categoria.portada = opcion.dataset.coverValue === "__auto__" ? "auto" : opcion.dataset.coverValue;
      dirty = true;
      els.categoryCoverDialog?.close();
      renderCategorias();
      programarAutoguardado();
      setStatus(els.saveStatus, "Portada de categoría actualizada. Guardá el borrador para confirmarla.");
    });
    if (els.importCatalog) els.importCatalog.addEventListener("click", importarCatalogo);
    if (els.addVariant) els.addVariant.addEventListener("click", agregarVariante);
    if (els.productAudience) {
      els.productAudience.addEventListener("change", (evento) => {
        if (!evento.target.matches("input[type=checkbox]")) return;
        if (evento.target.value === "cualquiera" && evento.target.checked) {
          els.productAudience.querySelectorAll("input:not([value=cualquiera])").forEach((input) => {
            input.checked = false;
          });
        }
        if (evento.target.value !== "cualquiera" && evento.target.checked) {
          const universal = els.productAudience.querySelector('input[value="cualquiera"]');
          if (universal) universal.checked = false;
        }
      });
    }
    if (els.addReview) els.addReview.addEventListener("click", agregarResena);
    if (els.reloadPedidos) els.reloadPedidos.addEventListener("click", cargarPedidos);
    if (els.pedidosList) {
      els.pedidosList.addEventListener("click", (event) => {
        const boton = event.target.closest("[data-save-order]");
        if (boton) guardarEstadoPedido(boton);
      });
    }
    if (els.reloadPendingReviews) {
      els.reloadPendingReviews.addEventListener("click", cargarResenasPendientes);
    }
    if (els.pendingReviewsList) {
      els.pendingReviewsList.addEventListener("click", (event) => {
        const aprobar = event.target.closest("[data-approve]");
        if (aprobar) {
          aprobarResena(aprobar.dataset.approve);
          return;
        }
        const rechazar = event.target.closest("[data-reject]");
        if (rechazar) rechazarResena(rechazar.dataset.reject);
      });
    }
    if (els.reviewList) {
      els.reviewList.addEventListener("click", (event) => {
        const quitar = event.target.closest("[data-remove-review]");
        if (quitar) {
          quitar.closest("[data-review-row]")?.remove();
          if (!els.reviewList.querySelector("[data-review-row]")) {
            els.reviewList.innerHTML = '<p class="cloud-muted">Sin reseñas todavía.</p>';
          }
          dirty = true;
          programarAutoguardado();
          return;
        }
        const quitarFoto = event.target.closest("[data-remove-review-photo]");
        if (quitarFoto) {
          const fila = quitarFoto.closest("[data-review-row]");
          if (!fila) return;
          fila.dataset.foto = "";
          fila.querySelector(".cloud-review__photo img")?.remove();
          quitarFoto.hidden = true;
          dirty = true;
          programarAutoguardado();
        }
      });
      els.reviewList.addEventListener("change", (event) => {
        const input = event.target.closest("[data-review-photo]");
        if (input) subirFotoResena(input);
      });
    }
    if (els.addBranch) els.addBranch.addEventListener("click", agregarSucursal);
    if (els.saveBranches) els.saveBranches.addEventListener("click", guardarSucursales);
    if (els.branchList) {
      els.branchList.addEventListener("click", (event) => {
        const boton = event.target.closest("[data-remove-branch]");
        if (!boton) return;
        const indice = Number(boton.dataset.removeBranch);
        const [quitada] = catalog.sucursales.splice(indice, 1);
        if (quitada) {
          catalog.productos.forEach((producto) => {
            producto.sucursalesDisponibles = (producto.sucursalesDisponibles || []).filter(
              (id) => id !== quitada.id
            );
            if (producto.stockPorSucursal) delete producto.stockPorSucursal[quitada.id];
          });
          dirty = true;
          renderSucursales();
          renderProductos();
          programarAutoguardado();
          setStatus(els.branchStatus, "Sucursal quitada. Guardá los cambios.");
        }
      });
    }
    document.querySelectorAll("[data-cloud-tab]").forEach((tab) => {
      tab.addEventListener("click", () => activarCloudTab(tab.dataset.cloudTab));
    });
    if (els.variantList) {
      els.variantList.addEventListener("click", (event) => {
        const boton = event.target.closest("[data-remove-variant]");
        if (!boton) return;
        const filas = [...els.variantList.querySelectorAll("[data-variant-row]")];
        const valores = filas.map((fila, indice) => ({
          nombre: fila.querySelector(`[data-variant-name="${indice}"]`)?.value.trim() || "",
          precio: fila.querySelector(`[data-variant-price="${indice}"]`)?.value.trim() || "",
        }));
        valores.splice(Number(boton.dataset.removeVariant), 1);
        const producto = catalog?.productos?.find((item) => item.id === selectedId);
        if (producto) {
          producto.variantes = valores;
          dirty = true;
          renderVariantes(producto);
          programarAutoguardado();
        } else {
          renderVariantes({ variantes: valores });
        }
      });
    }
    if (els.productBranches) {
      els.productBranches.addEventListener("change", (event) => {
        const checkbox = event.target.closest('input[type="checkbox"]');
        if (!checkbox) return;
        const stock = checkbox.closest("label")?.querySelector("[data-stock]");
        if (stock) {
          stock.disabled = !checkbox.checked;
          if (!checkbox.checked) stock.value = "";
        }
        const estado = checkbox.closest("label")?.querySelector(".cloud-branch__state");
        if (estado) estado.textContent = checkbox.checked ? "Disponible" : "No disponible";
        dirty = true;
      });
    }
    if (els.categoryList) {
      els.categoryList.addEventListener("click", (event) => {
        const toggle = event.target.closest("[data-tree-toggle]");
        if (toggle) {
          const id = toggle.dataset.treeToggle;
          if (categoriasAbiertas.has(id)) categoriasAbiertas.delete(id);
          else categoriasAbiertas.add(id);
          renderCategorias();
          return;
        }
        const portadaBoton = event.target.closest("[data-category-cover-open]");
        if (portadaBoton) {
          abrirPortada(portadaBoton.dataset.categoryCoverOpen);
          return;
        }
        const boton = event.target.closest("[data-delete-category]");
        if (boton) eliminarCategoria(boton.dataset.deleteCategory);
      });
      els.categoryList.addEventListener("change", (event) => {
        const nombreInput = event.target.closest("[data-category-name]");
        if (nombreInput) {
          const categoria = catalog.categorias.find((item) => item.id === nombreInput.dataset.categoryName);
          if (!categoria) return;
          const nombre = nombreInput.value.trim();
          if (!nombre) {
            nombreInput.value = categoria.nombre;
            return;
          }
          categoria.nombre = nombre;
          dirty = true;
          renderCategorias();
          renderProductos();
          programarAutoguardado();
          setStatus(els.saveStatus, "Categoría renombrada. Guardá el borrador para confirmarlo.");
          return;
        }
        const select = event.target.closest("[data-parent-category]");
        if (!select) return;
        const categoria = catalog.categorias.find((item) => item.id === select.dataset.parentCategory);
        if (!categoria) return;
        categoria.padre = select.value || null;
        dirty = true;
        renderCategorias();
        renderProductos();
        programarAutoguardado();
        setStatus(els.saveStatus, "Categoría movida. Guardá el borrador para confirmarlo.");
      });
    }
    if (els.exportCatalogBackup) els.exportCatalogBackup.addEventListener("click", exportarCopiaCatalogo);
    if (els.refreshCatalogHistory) els.refreshCatalogHistory.addEventListener("click", cargarHistorialVersiones);
    if (els.catalogHistoryList) els.catalogHistoryList.addEventListener("click", (event) => {
      const boton = event.target.closest("[data-history-restore]");
      if (boton) restaurarVersionHistorial(boton.dataset.historyRestore);
    });
    if (els.restoreLastPublication) els.restoreLastPublication.addEventListener("click", restaurarPublicacionAnterior);
    if (els.compareCatalog) els.compareCatalog.addEventListener("click", compararBorradorPublicado);
    if (els.auditCatalog) els.auditCatalog.addEventListener("click", auditarCatalogo);
    if (els.auditCatalogResult) els.auditCatalogResult.addEventListener("click", (event) => {
      const boton = event.target.closest("[data-audit-edit]");
      if (!boton) return;
      activarCloudTab("productos");
      editarProducto(boton.dataset.auditEdit);
    });
    if (els.scanHeavyImages) els.scanHeavyImages.addEventListener("click", escanearImagenesPesadas);
    if (els.optimizeHeavyImages) els.optimizeHeavyImages.addEventListener("click", optimizarImagenesPesadas);
    if (els.importCatalogFile) els.importCatalogFile.addEventListener("change", () => prepararImportacion(els.importCatalogFile.files?.[0]));
    if (els.confirmImportCatalog) els.confirmImportCatalog.addEventListener("click", confirmarImportacion);
    if (els.cancelImportCatalog) els.cancelImportCatalog.addEventListener("click", cancelarImportacion);
    if (els.imageFiles) {
      els.imageFiles.addEventListener("change", () => procesarImagenes(els.imageFiles.files));
    }
    if (els.categoryList) {
      els.categoryList.addEventListener("dragstart", (event) => {
        const handle = event.target.closest("[data-drag-handle]");
        if (!handle) {
          event.preventDefault();
          return;
        }
        arrastrandoCategoria = handle.dataset.dragHandle;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", arrastrandoCategoria);
        els.categoryList.classList.add("is-dragging");
        handle.closest(".cloud-tree-row")?.classList.add("is-dragging-row");
      });
      els.categoryList.addEventListener("dragover", (event) => {
        if (!arrastrandoCategoria) return;
        els.categoryList.querySelectorAll(".cloud-tree-row").forEach((item) => item.classList.remove("drop-before", "drop-after", "drop-inside"));
        els.categoryList.querySelector("[data-root-drop]")?.classList.remove("is-over");
        dropCategoria = null;
        dropPosicion = null;
        dropRaiz = false;
        const fila = event.target.closest("[data-drop-row]");
        const raizDrop = event.target.closest("[data-root-drop]");
        if (raizDrop) {
          event.preventDefault();
          els.categoryList.querySelectorAll(".cloud-tree-row").forEach((item) => item.classList.remove("drop-before", "drop-after", "drop-inside"));
          dropCategoria = null;
          dropPosicion = null;
          dropRaiz = true;
          raizDrop.classList.add("is-over");
          return;
        }
        if (!fila) return;
        const targetId = fila.dataset.dropRow;
        if (targetId === arrastrandoCategoria) return;
        const rect = fila.getBoundingClientRect();
        const relativo = (event.clientY - rect.top) / rect.height;
        const posicion = relativo < 0.28 ? "before" : relativo > 0.72 ? "after" : "inside";
        const padre = posicion === "inside" ? targetId : (catalog.categorias.find((categoria) => categoria.id === targetId)?.padre || null);
        if (padre && (padre === arrastrandoCategoria || esDescendienteCategoria(arrastrandoCategoria, padre))) return;
        event.preventDefault();
        els.categoryList.querySelectorAll(".cloud-tree-row").forEach((item) => item.classList.remove("drop-before", "drop-after", "drop-inside"));
        els.categoryList.querySelector("[data-root-drop]")?.classList.remove("is-over");
        dropCategoria = targetId;
        dropPosicion = posicion;
        dropRaiz = false;
        fila.classList.add(`drop-${posicion}`);
      });
      els.categoryList.addEventListener("dragleave", (event) => {
        if (event.relatedTarget && els.categoryList.contains(event.relatedTarget)) return;
        if (!event.relatedTarget) {
          const fila = event.target.closest(".cloud-tree-row");
          fila?.classList.remove("drop-before", "drop-after", "drop-inside");
        }
      });
      els.categoryList.addEventListener("drop", (event) => {
        if (!arrastrandoCategoria) return;
        event.preventDefault();
        if (dropRaiz) {
          moverCategoria(arrastrandoCategoria, null);
        } else if (dropCategoria) {
          const target = catalog.categorias.find((categoria) => categoria.id === dropCategoria);
          if (target) {
            if (dropPosicion === "inside") moverCategoria(arrastrandoCategoria, target.id);
            else moverCategoria(arrastrandoCategoria, target.padre || null, target.id, dropPosicion);
          }
        }
        arrastrandoCategoria = null;
        limpiarDropCategoria();
      });
      els.categoryList.addEventListener("dragend", () => {
        els.categoryList.querySelectorAll(".is-dragging-row").forEach((fila) => fila.classList.remove("is-dragging-row"));
        arrastrandoCategoria = null;
        limpiarDropCategoria();
      });
    }


    const configurarDropzone = (id, procesar) => {
      const zona = document.getElementById(id);
      if (!zona) return;
      ["dragenter", "dragover"].forEach((evento) => {
        zona.addEventListener(evento, (event) => {
          event.preventDefault();
          event.stopPropagation();
          zona.classList.add("is-dragover");
        });
      });
      ["dragleave", "dragend"].forEach((evento) => {
        zona.addEventListener(evento, () => zona.classList.remove("is-dragover"));
      });
      zona.addEventListener("drop", (event) => {
        event.preventDefault();
        event.stopPropagation();
        zona.classList.remove("is-dragover");
        const archivos = [...(event.dataTransfer?.files || [])];
        if (archivos.length) procesar(archivos);
      });
      zona.addEventListener("click", () => {
        if (id === "imageDropzone") els.imageFiles?.click();
        else els.videoFiles?.click();
      });
    };

    configurarDropzone("imageDropzone", (archivos) => procesarImagenes(archivos));
    configurarDropzone("videoDropzone", (archivos) => procesarVideo(archivos));

    document.addEventListener("paste", (event) => {
      const items = [...(event.clipboardData?.items || [])];
      const archivos = items
        .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
        .map((item) => item.getAsFile())
        .filter(Boolean);
      if (!archivos.length) return;
      event.preventDefault();
      procesarImagenes(archivos);
    });

    if (els.imageList) {
      els.imageList.addEventListener("click", manejarClickImagenes);
      els.imageList.addEventListener("input", manejarAltImagen);
    }
    if (els.imageEditorCanvas) {
      const canvas = els.imageEditorCanvas;
      canvas.addEventListener("pointerenter", (event) => mostrarCursorBrocha(event));
      canvas.addEventListener("pointerdown", (event) => {
        if (!editorRecorteState) return;
        event.preventDefault();
        canvas.setPointerCapture?.(event.pointerId);
        editorRecorteState.drawing = true;
        editorRecorteState.undo.push(new ImageData(new Uint8ClampedArray(editorRecorteState.data.data), canvas.width, canvas.height));
        if (editorRecorteState.undo.length > 12) editorRecorteState.undo.shift();
        mostrarCursorBrocha(event);
        pintarRecorte(event.clientX, event.clientY);
      });
      canvas.addEventListener("pointermove", (event) => {
        mostrarCursorBrocha(event);
        if (editorRecorteState?.drawing) pintarRecorte(event.clientX, event.clientY);
      });
      const terminarTrazo = () => { if (editorRecorteState) editorRecorteState.drawing = false; };
      canvas.addEventListener("pointerup", terminarTrazo);
      canvas.addEventListener("pointercancel", terminarTrazo);
      canvas.addEventListener("pointerleave", () => { terminarTrazo(); ocultarCursorBrocha(); });
    }
    if (els.imageEditorTools) {
      els.imageEditorTools.addEventListener("click", (event) => {
        const boton = event.target.closest("[data-brush]");
        if (!boton || !editorRecorteState) return;
        editorRecorteState.brushMode = boton.dataset.brush === "erase" ? "erase" : "restore";
        if (els.imageBrushCursor) els.imageBrushCursor.dataset.mode = editorRecorteState.brushMode;
        els.imageEditorTools.querySelectorAll("[data-brush]").forEach((item) => item.classList.toggle("is-active", item === boton));
      });
    }
    if (els.imageBrushSize) els.imageBrushSize.addEventListener("input", actualizarCursorBrocha);
    if (els.imageEditorUndo) {
      els.imageEditorUndo.addEventListener("click", () => {
        const estado = editorRecorteState;
        if (!estado) return;
        const anterior = estado.undo.pop();
        if (!anterior) return;
        estado.data.data.set(anterior.data);
        estado.ctx.putImageData(estado.data, 0, 0);
      });
    }
    if (els.imageEditorAccept) {
      els.imageEditorAccept.addEventListener("click", () => {
        const estado = editorRecorteState;
        if (!estado) return;
        estado.canvas.toBlob((blob) => {
          if (blob) finalizarEditorRecorte(blob);
        }, "image/png");
      });
    }
    const cancelarRecorte = () => finalizarEditorRecorte(null);
    els.imageEditorClose?.addEventListener("click", cancelarRecorte);
    els.imageEditorCancel?.addEventListener("click", cancelarRecorte);
    els.imageEditorDialog?.addEventListener("close", () => {
      if (!editorRecorteState) return;
      if (!editorRecorteState.finalizado) finalizarEditorRecorte(null);
    });
    els.imageEditorDialog?.addEventListener("click", (event) => {
      if (event.target === els.imageEditorDialog) cancelarRecorte();
    });
    const cerrarLightbox = () => els.imageLightbox?.close();
    els.imageLightboxClose?.addEventListener("click", cerrarLightbox);
    els.imageLightbox?.addEventListener("click", (event) => {
      if (event.target === els.imageLightbox) cerrarLightbox();
    });
    if (els.imageFrameCanvas) {
      const canvas = els.imageFrameCanvas;
      canvas.addEventListener("pointerdown", (event) => {
        if (!editorEncuadreState) return;
        event.preventDefault();
        canvas.setPointerCapture?.(event.pointerId);
        editorEncuadreState.drawing = true;
        editorEncuadreState.drag = { x: event.clientX, y: event.clientY, offsetX: editorEncuadreState.offsetX, offsetY: editorEncuadreState.offsetY };
        canvas.style.cursor = "grabbing";
      });
      canvas.addEventListener("pointermove", (event) => {
        const estado = editorEncuadreState;
        if (!estado?.drawing || !estado.drag) return;
        const rect = canvas.getBoundingClientRect();
        estado.offsetX = estado.drag.offsetX + (event.clientX - estado.drag.x) * (canvas.width / rect.width);
        estado.offsetY = estado.drag.offsetY + (event.clientY - estado.drag.y) * (canvas.height / rect.height);
        renderizarEncuadre();
      });
      const soltarEncuadre = () => {
        if (!editorEncuadreState) return;
        editorEncuadreState.drawing = false;
        editorEncuadreState.drag = null;
        canvas.style.cursor = "grab";
      };
      canvas.addEventListener("pointerup", soltarEncuadre);
      canvas.addEventListener("pointercancel", soltarEncuadre);
      canvas.addEventListener("pointerleave", soltarEncuadre);
    }
    if (els.imageFrameZoom) {
      els.imageFrameZoom.addEventListener("input", () => {
        if (!editorEncuadreState) return;
        editorEncuadreState.zoom = Math.max(0.5, Math.min(1.5, Number(els.imageFrameZoom.value) / 100));
        if (els.imageFrameZoomValue) els.imageFrameZoomValue.textContent = `${els.imageFrameZoom.value}%`;
        renderizarEncuadre();
      });
    }
    els.imageFrameCenter?.addEventListener("click", () => {
      if (!editorEncuadreState) return;
      editorEncuadreState.offsetX = 0;
      editorEncuadreState.offsetY = 0;
      renderizarEncuadre();
    });
    els.imageFrameReset?.addEventListener("click", () => {
      if (!editorEncuadreState) return;
      editorEncuadreState.zoom = 1;
      editorEncuadreState.offsetX = 0;
      editorEncuadreState.offsetY = 0;
      if (els.imageFrameZoom) els.imageFrameZoom.value = "100";
      if (els.imageFrameZoomValue) els.imageFrameZoomValue.textContent = "100%";
      renderizarEncuadre();
    });
    if (els.imageFrameAccept) {
      els.imageFrameAccept.addEventListener("click", () => {
        const estado = editorEncuadreState;
        if (!estado) return;
        estado.ctx.canvas.toBlob(async (primerBlob) => {
          if (!primerBlob) return;
          const canvas = estado.ctx.canvas;
          let blob = primerBlob;
          if (blob.size > 300 * 1024) {
            const reducido = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.8));
            if (reducido) blob = reducido;
          }
          finalizarEditorEncuadre(blob);
        }, "image/webp", 0.9);
      });
    }
    const cancelarEncuadre = () => finalizarEditorEncuadre(null);
    els.imageFrameClose?.addEventListener("click", cancelarEncuadre);
    els.imageFrameCancel?.addEventListener("click", cancelarEncuadre);
    els.imageFrameDialog?.addEventListener("close", () => {
      if (!editorEncuadreState) return;
      if (!editorEncuadreState.finalizado) finalizarEditorEncuadre(null);
    });
    els.imageFrameDialog?.addEventListener("click", (event) => {
      if (event.target === els.imageFrameDialog) cancelarEncuadre();
    });

    if (els.videoFiles) {
      els.videoFiles.addEventListener("change", () => procesarVideo(els.videoFiles.files));
    }
    if (els.videoList) {
      els.videoList.addEventListener("click", (event) => {
        const boton = event.target.closest("[data-remove-video]");
        if (!boton) return;
        const producto = catalog?.productos?.find((item) => item.id === selectedId);
        if (!producto) return;
        producto.videos.splice(Number(boton.dataset.removeVideo), 1);
        dirty = true;
        renderVideos(producto);
      });
    }
    document.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        guardarBorrador();
      }
    });
    window.addEventListener("beforeunload", (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    });
  };

  const iniciar = () => {
    iniciarSesionUI();
    if (!initFirebase()) return;
    auth.onAuthStateChanged((user) => {
      manejarSesion(user).catch((error) => {
        mostrarLogin(firebaseErrorMessage(error), true);
      });
    });
  };

  iniciar();
})();
