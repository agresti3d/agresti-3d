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
    panelProductos: $("#panelProductos"),
    backToProducts: $("#backToProducts"),
    newProductMobile: $("#newProductMobile"),
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
    variantPhotoFile: $("#variantPhotoFile"),
    variantImageDialog: $("#variantImageDialog"),
    variantImageChoices: $("#variantImageChoices"),
    variantImageUpload: $("#variantImageUpload"),
    variantImageRemove: $("#variantImageRemove"),
    variantImageClose: $("#variantImageClose"),
    variantImageCancel: $("#variantImageCancel"),
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
    imageBrushZoom: $("#imageBrushZoom"),
    imageBrushZoomValue: $("#imageBrushZoomValue"),
    imageEditorPanToggle: $("#imageEditorPanToggle"),
    imageEditorViewReset: $("#imageEditorViewReset"),
    imageLightbox: $("#imageLightbox"),
    imageLightboxImg: $("#imageLightboxImg"),
    imageLightboxCaption: $("#imageLightboxCaption"),
    imageLightboxClose: $("#imageLightboxClose"),
    imageFrameDialog: $("#imageFrameDialog"),
    imageFrameCanvas: $("#imageFrameCanvas"),
    imageFrameZoom: $("#imageFrameZoom"),
    imageFrameZoomValue: $("#imageFrameZoomValue"),
    imageFrameRotate: $("#imageFrameRotate"),
    imageFrameRotateValue: $("#imageFrameRotateValue"),
    imageFrameCenter: $("#imageFrameCenter"),
    imageFrameReset: $("#imageFrameReset"),
    imageFrameClose: $("#imageFrameClose"),
    imageFrameCancel: $("#imageFrameCancel"),
    imageFrameAccept: $("#imageFrameAccept"),
    imageFrameBack: $("#imageFrameBack"),
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
  let varianteFotoPendiente = null;
  let varianteImagenIndice = null;
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

  const conTiempoMaximo = (promesa, milisegundos = 20000) =>
    Promise.race([
      promesa,
      new Promise((_, rechazar) =>
        window.setTimeout(
          () => rechazar(Object.assign(new Error("Tiempo de espera agotado."), { code: "auth/timeout" })),
          milisegundos
        )
      ),
    ]);

  const login = async (event) => {
    event.preventDefault();
    const email = els.loginEmail.value.trim();
    const password = els.loginPassword.value;
    if (!email || !password) {
      setStatus(els.loginStatus, "Completá email y contraseña.", "error");
      return;
    }
    els.loginButton.disabled = true;
    setStatus(els.loginStatus, "Ingresando…");
    try {
      await conTiempoMaximo(auth.signInWithEmailAndPassword(email, password));
    } catch (error) {
      setStatus(els.loginStatus, firebaseErrorMessage(error), "error");
    } finally {
      els.loginButton.disabled = false;
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

  const leerDocumento = async (id) => {
    const snap = await db.collection(CATALOG_DOC).doc(id).get();
    if (!snap.exists) return null;
    const json = snap.data()?.json;
    if (typeof json !== "string") return null;
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  const normalizarCatalogo = (data) => ({
    sucursales: Array.isArray(data?.sucursales) ? data.sucursales : [],
    categorias: Array.isArray(data?.categorias) ? data.categorias : [],
    productos: (Array.isArray(data?.productos) ? data.productos : []).map((producto) => {
      const categorias = categoriasProducto(producto);
      return { ...producto, categoria: categorias[0] || "", categorias };
    }),
  });

  const cargarCatalogo = async () => {
    setStatus(els.saveStatus, "Cargando catálogo…");
    let data = await leerDocumento(DRAFT_DOC);
    let origen = "borrador";
    if (!data) {
      data = await leerDocumento(PUBLISHED_DOC);
      origen = "publicado";
    }
    if (!data) {
      const respuesta = await fetch("../data/catalog.json", { cache: "no-store" });
      if (!respuesta.ok) throw new Error("No se encontró el catálogo inicial.");
      data = await respuesta.json();
      origen = "catálogo inicial";
    }
    catalog = normalizarCatalogo(data);
    const idsMigrados = migrarIdsProductos(catalog);
    ultimaHuellaHistorial = huellaTexto(JSON.stringify(catalog));
    ultimoTiempoHistorial = Date.now();
    selectedId = null;
    creating = false;
    query = "";
    if (els.searchProducts) els.searchProducts.value = "";
    renderCategorias();
    renderSucursales();
    renderProductos();
    actualizarMetaExportacion();
    mostrarFormulario(false);
    activarFormTab("medios");
    activarCloudTab("productos");
    if (idsMigrados) {
      dirty = true;
      programarAutoguardado();
      setStatus(els.saveStatus, `Catálogo cargado desde ${origen}. Se corrigieron ${idsMigrados} ID provisorios; guardá el borrador para confirmarlo.`, "success");
    } else {
      setStatus(els.saveStatus, `Catálogo cargado desde ${origen}.`);
      dirty = false;
    }
    advertirCloudinary();
  };

  const advertirCloudinary = () => {
    if (!els.appView || CLOUDINARY.cloudName) return;
    if ($("#cloudinaryWarning")) return;
    const banner = document.createElement("div");
    banner.id = "cloudinaryWarning";
    banner.className = "cloud-banner";
    banner.style.margin = "1rem";
    banner.innerHTML =
      "<span><strong>Cloudinary no está configurado.</strong> Completá <code>cloudName</code> en <code>editor/cloud-config.js</code> para subir fotos y videos.</span>";
    const shell = $(".cloud-shell");
    if (shell?.parentNode) shell.parentNode.insertBefore(banner, shell);
  };

  const renderProductos = () => {
    if (!els.productList) return;
    const termino = query.trim().toLocaleLowerCase("es-AR");
    const categoriasFiltro = filterCategory
      ? (() => {
          const ids = new Set();
          const agregar = (id) => {
            ids.add(id);
            (catalog?.categorias || [])
              .filter((categoria) => categoria.padre === id)
              .forEach((categoria) => agregar(categoria.id));
          };
          agregar(filterCategory);
          return ids;
        })()
      : null;
    const productos = (catalog?.productos || []).filter((producto) => {
      const coincideTexto = termino
        ? producto.nombre.toLocaleLowerCase("es-AR").includes(termino)
        : true;
      const coincideCategoria = categoriasFiltro
        ? categoriasProducto(producto).some((id) => categoriasFiltro.has(id))
        : true;
      return coincideTexto && coincideCategoria;
    });
    if (els.productCount) {
      const total = catalog?.productos?.length || 0;
      els.productCount.textContent = `${total} ${total === 1 ? "producto" : "productos"}`;
    }
    els.productList.innerHTML = productos.length
      ? productos
          .map((producto) => {
            const imagen = producto.imagenes?.[0]?.src;
            return `
              <button class="cloud-product" type="button" data-id="${escapeHTML(producto.id)}" aria-current="${producto.id === selectedId}">
                ${
                  imagen
                    ? `<img src="${escapeHTML(imageURL(imagen))}" alt="" loading="lazy">`
                    : '<span class="cloud-product__placeholder" aria-hidden="true"></span>'
                }
                <span>
                  <span class="cloud-product__name">${escapeHTML(producto.nombre)}</span>
                  <span class="cloud-product__meta">${escapeHTML(categoriasProducto(producto).map(categoryPath).filter(Boolean).join(" · ") || "Sin categoría")}</span>
                </span>
              </button>`;
          })
          .join("")
      : '<p class="cloud-muted">No hay productos con ese nombre.</p>';
  };

  const esDescendienteCategoria = (id, posiblePadre) => {
    let actual = posiblePadre;
    let guard = 0;
    while (actual && guard < 30) {
      if (actual === id) return true;
      actual = catalog?.categorias?.find((categoria) => categoria.id === actual)?.padre;
      guard += 1;
    }
    return false;
  };

  const renderCategorias = () => {
    if (!catalog) return;
    const opciones = categoryOptions();
    renderCategoriaChecks();
    if (els.categoryFilter) {
      const valor = filterCategory;
      els.categoryFilter.innerHTML =
        '<option value="">Todas las categorías</option>' +
        opciones
          .map((categoria) => `<option value="${escapeHTML(categoria.id)}">${escapeHTML(categoria.ruta)}</option>`)
          .join("");
      els.categoryFilter.value = opciones.some((categoria) => categoria.id === valor) ? valor : "";
      filterCategory = els.categoryFilter.value;
    }
    if (els.categoryParent) {
      els.categoryParent.innerHTML =
        '<option value="">Nivel principal</option>' +
        opciones
          .map((categoria) => `<option value="${escapeHTML(categoria.id)}">${escapeHTML(categoria.ruta)}</option>`)
          .join("");
    }
    if (!categoriasAbiertasInicializadas && catalog.categorias.length) {
      catalog.categorias.forEach((categoria) => categoriasAbiertas.add(categoria.id));
      categoriasAbiertasInicializadas = true;
    }
    if (els.categoryList) {
      const raiz = catalog.categorias.filter((categoria) => !categoria.padre);
      const hijasDe = (padre) => catalog.categorias.filter((categoria) => (categoria.padre || null) === (padre || null));
      const renderNodo = (categoria) => {
        const hijas = hijasDe(categoria.id);
        const abierta = categoriasAbiertas.has(categoria.id);
        const productos = catalog.productos.filter((producto) => categoriasProducto(producto).includes(categoria.id)).length;
        return `
          <div class="cloud-tree-node" data-category-node="${escapeHTML(categoria.id)}">
            <div class="cloud-tree-row" data-category-id="${escapeHTML(categoria.id)}" data-drop-row="${escapeHTML(categoria.id)}">
              <span class="cloud-tree-drag" draggable="true" data-drag-handle="${escapeHTML(categoria.id)}" role="button" tabindex="0" aria-label="Mover ${escapeHTML(categoria.nombre)}">⠿</span>
              <button class="cloud-tree-toggle" type="button" data-tree-toggle="${escapeHTML(categoria.id)}" aria-expanded="${hijas.length ? abierta : false}" aria-label="${hijas.length ? (abierta ? "Plegar" : "Desplegar") : "Sin subcategorías"} ${escapeHTML(categoria.nombre)}">${hijas.length ? (abierta ? "▾" : "▸") : '<span class="cloud-tree-leaf">•</span>'}</button>
              <input class="cloud-category__name" type="text" data-category-name="${escapeHTML(categoria.id)}" value="${escapeHTML(categoria.nombre)}" maxlength="60" aria-label="Nombre de la categoría">
              <span class="cloud-tree-count" title="${productos} producto(s)">${productos}</span>
              <button type="button" class="cloud-category__cover-button" data-category-cover-open="${escapeHTML(categoria.id)}" aria-label="Cambiar portada de ${escapeHTML(categoria.nombre)}">
                ${portadaPreview(categoria) ? `<img src="${escapeHTML(imageURL(portadaPreview(categoria)))}" alt="" loading="lazy">` : '<span class="cloud-category__cover-empty">Sin foto</span>'}
                <span>Portada</span>
              </button>
              <button type="button" class="cloud-tree-delete" data-delete-category="${escapeHTML(categoria.id)}" aria-label="Eliminar ${escapeHTML(categoria.nombre)}" ${productos ? "disabled title='Tiene productos'" : ""}>×</button>
            </div>
            ${hijas.length && abierta ? `<div class="cloud-tree-children" role="group">${hijas.map(renderNodo).join("")}</div>` : ""}
          </div>`;
      };
      els.categoryList.innerHTML = raiz.length
        ? `<div class="cloud-category-tree">${raiz.map(renderNodo).join("")}</div><div class="cloud-tree-root-drop" data-root-drop>Soltá acá para mover a nivel principal</div>`
        : '<p class="cloud-muted">Todavía no hay categorías.</p>';
    }
  };

  const moverCategoria = (id, padre, referenciaId = null, posicion = null) => {
    if (!catalog) return;
    if (padre === id || esDescendienteCategoria(id, padre)) {
      toast("No se puede mover una categoría dentro de sí misma.", "error");
      return;
    }
    const origen = catalog.categorias.findIndex((categoria) => categoria.id === id);
    if (origen < 0) return;
    const [categoria] = catalog.categorias.splice(origen, 1);
    categoria.padre = padre || null;
    if (referenciaId) {
      const indiceReferencia = catalog.categorias.findIndex((item) => item.id === referenciaId);
      if (indiceReferencia >= 0) {
        catalog.categorias.splice(indiceReferencia + (posicion === "after" ? 1 : 0), 0, categoria);
      } else {
        catalog.categorias.push(categoria);
      }
    } else {
      catalog.categorias.push(categoria);
    }
    if (padre) categoriasAbiertas.add(padre);
    categoriasAbiertas.add(id);
    dirty = true;
    renderCategorias();
    renderProductos();
    programarAutoguardado();
    setStatus(els.saveStatus, "Categoría movida. Guardá el borrador para confirmarlo.");
  };

  const limpiarDropCategoria = () => {
    dropCategoria = null;
    dropPosicion = null;
    dropRaiz = false;
    els.categoryList?.querySelectorAll(".cloud-tree-row").forEach((fila) => fila.classList.remove("drop-before", "drop-after", "drop-inside"));
    els.categoryList?.querySelector(".cloud-tree-root-drop")?.classList.remove("is-over");
    els.categoryList?.classList.remove("is-dragging");
  };

  const renderBranches = (producto = null) => {
    if (!els.productBranches) return;
    const disponibles = new Set(producto?.sucursalesDisponibles || catalog?.sucursales?.map((s) => s.id) || []);
    const stock = producto?.stockPorSucursal || {};
    els.productBranches.innerHTML = (catalog?.sucursales || [])
      .map((sucursal) => {
        const activa = disponibles.has(sucursal.id);
        const cantidad = Number.isInteger(stock[sucursal.id]) ? stock[sucursal.id] : "";
        return `
        <label class="cloud-branch">
          <input type="checkbox" value="${escapeHTML(sucursal.id)}" ${activa ? "checked" : ""}>
          <span>${escapeHTML(sucursal.nombre)} <span class="cloud-muted">${escapeHTML(sucursal.localidad || "")}</span> <span class="cloud-branch__state">${activa ? "Disponible" : "No disponible"}</span></span>
          <input type="number" data-stock="${escapeHTML(sucursal.id)}" min="0" step="1" inputmode="numeric" value="${cantidad}" placeholder="u." aria-label="Unidades en ${escapeHTML(sucursal.nombre)}" ${activa ? "" : "disabled"}>
        </label>`;
      })
      .join("");
  };

  const mostrarFormulario = (visible) => {
    if (els.emptyState) els.emptyState.hidden = visible;
    if (els.productForm) els.productForm.hidden = !visible;
    els.panelProductos?.classList.toggle("cloud-shell--editing", Boolean(visible));
    if (visible && window.matchMedia("(max-width: 900px)").matches) {
      window.requestAnimationFrame(() => els.productForm?.scrollIntoView({ block: "start", behavior: "auto" }));
    }
  };

  const volverListaProductos = () => {
    if (!els.productForm || els.productForm.hidden) return;
    const hayCambios = dirty || (creating && Boolean(els.productName?.value.trim()));
    if (hayCambios && !window.confirm("¿Volver a la lista de productos? Los cambios sin guardar se perderán.")) return;
    selectedId = null;
    creating = false;
    mostrarFormulario(false);
    window.requestAnimationFrame(() => els.searchProducts?.scrollIntoView({ block: "start", behavior: "auto" }));
  };

  const editarProducto = (id) => {
    const producto = catalog?.productos?.find((item) => item.id === id);
    if (!producto) return;
    selectedId = id;
    creating = false;
    mostrarFormulario(true);
    if (els.formEyebrow) els.formEyebrow.textContent = "Editando producto";
    if (els.formTitle) els.formTitle.textContent = producto.nombre || "Producto";
    els.productName.value = producto.nombre || "";
    if (els.productId) els.productId.value = producto.id || "";
    renderCategorias();
    marcarCategorias(categoriasProducto(producto));
    marcarChecks(els.productAudience, Array.isArray(producto.publico) ? producto.publico : []);
    marcarChecks(els.productOccasions, Array.isArray(producto.ocasiones) ? producto.ocasiones : []);
    els.productPrice.value = producto.precio || "";
    if (els.productPriceNote) els.productPriceNote.value = producto.notaPrecio || "";
    els.productDescription.value = producto.descripcion || "";
    els.productLongDescription.value = producto.descripcionLarga || "";
    const detalles = producto.detalles || {};
    if (els.productHeight) els.productHeight.value = detalles.altura || "";
    if (els.productWidth) els.productWidth.value = detalles.ancho || "";
    if (els.productLength) els.productLength.value = detalles.largo || "";
    if (els.productWeight) els.productWeight.value = detalles.peso || "";
    if (els.productMaterial) els.productMaterial.value = detalles.material || "";
    if (els.productColors) els.productColors.value = detalles.colores || "";
    if (els.productCapacity) els.productCapacity.value = detalles.capacidad || "";
    if (els.productOptions) els.productOptions.value = detalles.personalizacion || "";
    if (els.productContents) els.productContents.value = detalles.contenido || "";
    if (els.productCare) els.productCare.value = detalles.cuidados || "";
    activarFormTab("medios");
    renderBranches(producto);
    renderVariantes(producto);
    renderResenas(producto);
    renderImagenes(producto);
    renderVideos(producto);
    setStatus(els.saveStatus, "");
    renderProductos();
  };

  const nuevoProducto = () => {
    selectedId = null;
    creating = true;
    mostrarFormulario(true);
    if (els.formEyebrow) els.formEyebrow.textContent = "Nuevo producto";
    if (els.formTitle) els.formTitle.textContent = "Nuevo producto";
    els.productForm.reset();
    renderCategorias();
    marcarCategorias([]);
    marcarChecks(els.productAudience, []);
    marcarChecks(els.productOccasions, []);
    if (els.productId) els.productId.value = "";
    activarFormTab("medios");
    renderBranches({ sucursalesDisponibles: catalog?.sucursales?.map((s) => s.id) || [] });
    renderVariantes({ variantes: [] });
    renderResenas({ resenas: [] });
    renderImagenes({ imagenes: [] });
    renderVideos({ videos: [] });
    setStatus(els.imageStatus, "");
    setStatus(els.videoStatus, "");
    setStatus(els.saveStatus, "Completá los datos y guardá el borrador.");
    renderProductos();
    els.productName.focus();
  };

  const leerFormulario = () => {
    const nombre = els.productName.value.trim();
    if (!nombre) throw new Error("El nombre es obligatorio.");
    const categoriasSeleccionadas = [...els.productCategories.querySelectorAll("input:checked")].map((input) => input.value);
    if (!categoriasSeleccionadas.length) throw new Error("Elegí al menos una categoría.");
    const base = selectedId
      ? catalog.productos.find((producto) => producto.id === selectedId)
      : null;
    const imagenes = base?.imagenes || [];
    const videos = base?.videos || [];
    const sucursalesDisponibles = [...els.productBranches.querySelectorAll("input:checked")].map(
      (input) => input.value
    );
    const stockPorSucursal = {};
    sucursalesDisponibles.forEach((id) => {
      const input = els.productBranches.querySelector(`[data-stock="${CSS.escape(id)}"]`);
      const cantidad = Number.parseInt(input?.value, 10);
      if (Number.isInteger(cantidad) && cantidad >= 0) stockPorSucursal[id] = cantidad;
    });
    const variantes = [...els.variantList.querySelectorAll("[data-variant-row]")]
      .map((fila, indice) => {
        const imagen = fila.dataset.variantImage || "";
        const stockTexto = fila.querySelector(`[data-variant-stock="${indice}"]`)?.value.trim() || "";
        const stock = Number.parseInt(stockTexto, 10);
        return {
          nombre: fila.querySelector(`[data-variant-name="${indice}"]`)?.value.trim() || "",
          precio: fila.querySelector(`[data-variant-price="${indice}"]`)?.value.trim() || "",
          ...(imagen ? { imagen } : {}),
          ...(Number.isInteger(stock) && stock >= 0 ? { stock } : {}),
        };
      })
      .filter((variante) => variante.nombre);
    const id = selectedId || generarIdProducto(nombre);
    const mapaDetalles = {
      altura: els.productHeight,
      ancho: els.productWidth,
      largo: els.productLength,
      peso: els.productWeight,
      material: els.productMaterial,
      colores: els.productColors,
      capacidad: els.productCapacity,
      personalizacion: els.productOptions,
      contenido: els.productContents,
      cuidados: els.productCare,
    };
    const detalles = { ...(base?.detalles || {}) };
    Object.entries(mapaDetalles).forEach(([clave, input]) => {
      const valor = input?.value.trim() || "";
      if (valor) detalles[clave] = valor;
      else delete detalles[clave];
    });
    const principal =
      base?.categoria && categoriasSeleccionadas.includes(base.categoria)
        ? base.categoria
        : categoriasSeleccionadas[0];
    const producto = {
      ...(base || {}),
      ...(creating ? { creado: new Date().toISOString() } : {}),
      id,
      nombre,
      categoria: principal,
      categorias: categoriasSeleccionadas,
      publico: leerChecks(els.productAudience),
      ocasiones: leerChecks(els.productOccasions),
      precio: els.productPrice.value.trim(),
      notaPrecio: els.productPriceNote?.value.trim() || "",
      descripcion: els.productDescription.value.trim(),
      descripcionLarga: els.productLongDescription.value.trim(),
      detalles,
      imagenes,
      videos,
      sucursalesDisponibles,
    };
    const resenas = [...els.reviewList.querySelectorAll("[data-review-row]")]
      .map((fila) => {
        const indice = fila.dataset.reviewRow;
        return {
          nombre: fila.querySelector(`[data-review-name="${indice}"]`)?.value.trim() || "",
          rating: Number(fila.querySelector(`[data-review-rating="${indice}"]`)?.value) || 5,
          texto: fila.querySelector(`[data-review-text="${indice}"]`)?.value.trim() || "",
          foto: fila.dataset.foto || "",
          fecha: fila.dataset.fecha || new Date().toISOString().slice(0, 10),
        };
      })
      .filter((resena) => resena.nombre || resena.texto);
    if (resenas.length) producto.resenas = resenas;
    else delete producto.resenas;
    if (Object.keys(stockPorSucursal).length) producto.stockPorSucursal = stockPorSucursal;
    else delete producto.stockPorSucursal;
    if (variantes.length) producto.variantes = variantes;
    else delete producto.variantes;
    if (!producto.notaPrecio) delete producto.notaPrecio;
    if (!producto.publico.length) delete producto.publico;
    if (!producto.ocasiones.length) delete producto.ocasiones;
    if (!Object.keys(detalles).length) delete producto.detalles;
    return producto;
  };

  const commitFormulario = () => {
    if (els.productForm.hidden) return;
    const producto = leerFormulario();
    if (creating) {
      catalog.productos.unshift(producto);
      selectedId = producto.id;
      creating = false;
    } else {
      const indice = catalog.productos.findIndex((item) => item.id === selectedId);
      if (indice < 0) throw new Error("No se encontró el producto.");
      const original = catalog.productos[indice];
      if (esIdProvisional(original.id) && !/^producto sin t[ií]tulo$/i.test(producto.nombre)) {
        const nuevoId = generarIdProducto(producto.nombre, original.id);
        producto.idsAnteriores = [...new Set([...(original.idsAnteriores || []), original.id])];
        producto.id = nuevoId;
        selectedId = nuevoId;
      }
      catalog.productos[indice] = producto;
    }
    if (els.formTitle) els.formTitle.textContent = producto.nombre;
    if (els.productId) els.productId.value = producto.id;
    setStatus(els.saveStatus, "");
    dirty = true;
    renderProductos();
    return producto;
  };

  const guardarBorrador = async (event, opciones = {}) => {
    event?.preventDefault();
    if (!puedeEditarCatalogo()) {
      setStatus(els.saveStatus, "No tenés permiso para guardar cambios del catálogo.", "error");
      return false;
    }
    if (saving) return;
    try {
      commitFormulario();
      const limpio = normalizarCatalogo(clone(catalog));
      const json = JSON.stringify(limpio);
      if (json.length > 900000) {
        throw new Error("El catálogo es demasiado grande para un documento de Firestore.");
      }
      saving = true;
      if (els.saveDraft) els.saveDraft.disabled = true;
      setStatus(els.saveStatus, "Guardando borrador…");
      await db.collection(CATALOG_DOC).doc(DRAFT_DOC).set({
        json,
        actualizado: firebase.firestore.FieldValue.serverTimestamp(),
        actualizadoPor: currentUser?.email || "",
      });
      catalog = limpio;
      dirty = false;
      registrarVersionCatalogo(opciones.silencioso ? "Autoguardado" : "Borrador guardado", !opciones.silencioso).catch(() => {});
      setStatus(
        els.saveStatus,
        opciones.silencioso ? "Borrador guardado automáticamente." : "Borrador guardado en la nube.",
        "success"
      );
      if (!opciones.silencioso) toast("Borrador guardado. Todavía no está publicado.");
      return true;
    } catch (error) {
      setStatus(els.saveStatus, `No se guardó: ${firebaseErrorMessage(error)}`, "error");
      if (!opciones.silencioso) toast(`No se guardó: ${firebaseErrorMessage(error)}`, "error");
      return false;
    } finally {
      saving = false;
      if (els.saveDraft) els.saveDraft.disabled = false;
    }
  };


  const dispararSeo = async () => {
    try {
      const config = await db.collection("config").doc("github").get();
      const token = config.exists ? String(config.data().token || "") : "";
      if (!token) {
        setStatus(
          els.saveStatus,
          "Catálogo publicado. Falta configurar el token de GitHub para regenerar el SEO automáticamente.",
          "success"
        );
        return;
      }
      const respuesta = await fetch(
        "https://api.github.com/repos/agresti3d/agresti-3d/actions/workflows/deploy.yml/dispatches",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ref: "main" }),
        }
      );
      if (!respuesta.ok) throw new Error(`GitHub respondió ${respuesta.status}`);
      setStatus(
        els.saveStatus,
        "Catálogo publicado. Actualizando páginas SEO en segundo plano…",
        "success"
      );
    } catch (error) {
      setStatus(
        els.saveStatus,
        "Catálogo publicado. No se pudo iniciar la actualización SEO; el sitio ya muestra los cambios.",
        "success"
      );
    }
  };

  const publicar = async () => {
    if (!puedePublicarCambios()) {
      toast("No tenés permiso para publicar en la web.", "error");
      return;
    }
    if (saving) return;
    if (!window.confirm("¿Publicar el catálogo en la web? Los cambios se verán en el sitio.")) return;
    try {
      commitFormulario();
      const limpio = normalizarCatalogo(clone(catalog));
      const json = JSON.stringify(limpio);
      if (json.length > 900000) {
        throw new Error("El catálogo es demasiado grande para un documento de Firestore.");
      }
      saving = true;
      if (els.publishCatalog) els.publishCatalog.disabled = true;
      setStatus(els.saveStatus, "Publicando…");
      const basePayload = { json, actualizadoPor: currentUser?.email || "" };
      const publicadoActual = await leerDocumento(PUBLISHED_DOC);
      if (publicadoActual) {
        await db.collection(CATALOG_DOC).doc("publicado_anterior").set({
          json: JSON.stringify(normalizarCatalogo(publicadoActual)),
          actualizado: firebase.firestore.FieldValue.serverTimestamp(),
          actualizadoPor: currentUser?.email || "",
        });
      }
      await db.collection(CATALOG_DOC).doc(DRAFT_DOC).set({
        ...basePayload,
        actualizado: firebase.firestore.FieldValue.serverTimestamp(),
      });
      await db.collection(CATALOG_DOC).doc(PUBLISHED_DOC).set({
        ...basePayload,
        actualizado: firebase.firestore.FieldValue.serverTimestamp(),
      });
      catalog = limpio;
      dirty = false;
      registrarVersionCatalogo("Publicación", true).catch(() => {});
      cargarPublicacionAnterior();
      setStatus(els.saveStatus, "Catálogo publicado en la web.", "success");
      toast("Catálogo publicado. El sitio ya muestra los cambios.");
      dispararSeo();
    } catch (error) {
      setStatus(els.saveStatus, `No se publicó: ${firebaseErrorMessage(error)}`, "error");
      toast(`No se publicó: ${firebaseErrorMessage(error)}`, "error");
    } finally {
      saving = false;
      if (els.publishCatalog) els.publishCatalog.disabled = false;
    }
  };

  const eliminarProducto = async () => {
    if (!selectedId) return;
    const producto = catalog.productos.find((item) => item.id === selectedId);
    if (!producto) return;
    if (!window.confirm(`¿Eliminar «${producto.nombre}»?`)) return;
    catalog.productos = catalog.productos.filter((item) => item.id !== selectedId);
    selectedId = null;
    creating = false;
    mostrarFormulario(false);
    dirty = true;
    renderProductos();
    await guardarBorrador();
  };

  const cerrarSelectorFotoVariante = () => {
    varianteImagenIndice = null;
    els.variantImageDialog?.close();
  };

  const abrirSelectorFotoVariante = (indice) => {
    if (!catalog || !els.variantImageDialog) return;
    if (!asegurarProductoParaMedios()) return;
    try {
      commitFormulario();
    } catch (error) {
      setStatus(els.saveStatus, error.message, "error");
      return;
    }
    const producto = catalog.productos.find((item) => item.id === selectedId);
    const variante = producto?.variantes?.[indice];
    if (!variante) return;
    varianteImagenIndice = indice;
    const imagenes = (producto.imagenes || []).filter((imagen) => imagen?.src);
    els.variantImageChoices.innerHTML = imagenes.length
      ? imagenes.map((imagen) => `<button type="button" data-variant-image-choice="${escapeHTML(imagen.src)}" aria-label="Usar esta foto"><img src="${escapeHTML(imageURL(imagen.src))}" alt="${escapeHTML(imagen.alt || "Foto del producto")}" loading="lazy"></button>`).join("")
      : '<p class="cloud-variant-picker__empty">Este producto todavía no tiene fotos cargadas. Subí una nueva para asignarla a la opción.</p>';
    if (els.variantImageRemove) els.variantImageRemove.hidden = !variante.imagen;
    if (typeof els.variantImageDialog.showModal === "function") els.variantImageDialog.showModal();
    else els.variantImageDialog.setAttribute("open", "");
  };

  const asignarImagenVariante = (src) => {
    const producto = catalog?.productos?.find((item) => item.id === selectedId);
    const variante = producto?.variantes?.[varianteImagenIndice];
    if (!producto || !variante || !src) return;
    variante.imagen = src;
    dirty = true;
    renderVariantes(producto);
    renderProductos();
    programarAutoguardado();
    cerrarSelectorFotoVariante();
    setStatus(els.saveStatus, "Foto de la opción asignada. Guardá el borrador para confirmar.", "success");
  };

  const quitarImagenVariante = () => {
    const producto = catalog?.productos?.find((item) => item.id === selectedId);
    const variante = producto?.variantes?.[varianteImagenIndice];
    if (!producto || !variante) return;
    delete variante.imagen;
    dirty = true;
    renderVariantes(producto);
    renderProductos();
    programarAutoguardado();
    cerrarSelectorFotoVariante();
    setStatus(els.saveStatus, "Foto de la opción quitada.", "success");
  };

  const procesarFotoVariante = async (file, indice) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus(els.saveStatus, "El archivo no es una imagen.", "error");
      return;
    }
    if (procesandoFotos) {
      setStatus(els.saveStatus, "Ya hay una foto procesándose. Esperá a que termine.", "error");
      return;
    }
    if (!asegurarProductoParaMedios()) return;
    try {
      commitFormulario();
    } catch (error) {
      setStatus(els.saveStatus, error.message, "error");
      return;
    }
    const producto = catalog?.productos?.find((item) => item.id === selectedId);
    if (!producto?.variantes?.[indice]) return;
    procesandoFotos = true;
    try {
      setStatus(els.saveStatus, `Quitando el fondo de «${file.name}»…`);
      mostrarProgresoImagen("Procesando foto…", `Quitando el fondo de «${file.name}».`);
      const recorte = await quitarFondo(file);
      ocultarProgresoImagen();
      setStatus(els.saveStatus, "Revisá el recorte de la foto de la opción.");
      ocultarProgresoImagen();
      const procesada = await editarFotoConBrochaYEncuadre(file, recorte);
      if (!procesada) return;
      setStatus(els.saveStatus, `Subiendo la foto de la opción «${file.name}»…`);
      mostrarProgresoImagen("Subiendo la foto…", "Guardando la foto de la opción en Cloudinary.");
      const url = await subirCloudinary(procesada, "image");
      const actual = catalog.productos.find((item) => item.id === selectedId);
      const variante = actual?.variantes?.[indice];
      if (!variante) throw new Error("La opción se cerró mientras se procesaba la foto.");
      variante.imagen = url;
      dirty = true;
      renderVariantes(actual);
      renderProductos();
      programarAutoguardado();
      setStatus(els.saveStatus, "Foto de la opción lista. Guardá el borrador para confirmar.", "success");
    } catch (error) {
      setStatus(els.saveStatus, `No se pudo cargar la foto de la opción: ${error.message}`, "error");
    } finally {
      procesandoFotos = false;
      ocultarProgresoImagen();
      if (els.variantPhotoFile) els.variantPhotoFile.value = "";
    }
  };

  const renderVariantes = (producto) => {
    if (!els.variantList) return;
    const variantes = producto?.variantes || [];
    els.variantList.innerHTML = variantes.length
      ? variantes
          .map(
            (variante, indice) => `
            <div class="cloud-variant" data-variant-row="${indice}" data-variant-image="${escapeHTML(variante.imagen || "")}">
              <div class="cloud-variant__photo">
                <div class="cloud-variant__thumb">${variante.imagen ? `<img src="${escapeHTML(imageURL(variante.imagen))}" alt="" loading="lazy">` : "<span>Sin foto</span>"}</div>
                <div class="cloud-variant__photo-actions">
                  <button type="button" data-variant-photo="${indice}">${variante.imagen ? "Cambiar" : "Foto"}</button>
                  ${variante.imagen ? `<button type="button" data-remove-variant-photo="${indice}" aria-label="Quitar foto de la opción">×</button>` : ""}
                </div>
              </div>
              <label class="field">
                <span>Opción</span>
                <input type="text" data-variant-name="${indice}" value="${escapeHTML(variante.nombre || "")}" placeholder="Ej.: Azul / 10 cm" maxlength="80">
              </label>
              <label class="field">
                <span>Precio</span>
                <input type="text" data-variant-price="${indice}" value="${escapeHTML(variante.precio || "")}" placeholder="Ej.: $15.000" maxlength="40">
              </label>
              <label class="field">
                <span>Stock</span>
                <input type="number" data-variant-stock="${indice}" min="0" step="1" inputmode="numeric" value="${variante.stock !== undefined && variante.stock !== null ? escapeHTML(variante.stock) : ""}" placeholder="u.">
              </label>
              <button type="button" class="cloud-danger" data-remove-variant="${indice}">Quitar</button>
            </div>`
          )
          .join("")
      : '<p class="cloud-muted">Sin variantes: se usa el precio general.</p>';
  };

  const agregarVariante = () => {
    const producto = catalog?.productos?.find((item) => item.id === selectedId);
    const base = producto || { variantes: [] };
    base.variantes = base.variantes || [];
    base.variantes.push({ nombre: "", precio: "" });
    if (producto) dirty = true;
    renderVariantes(base);
    programarAutoguardado();
  };


  const htmlEstrellas = (rating) => {
    const valor = Math.max(1, Math.min(5, Number(rating) || 5));
    return "★".repeat(valor) + "☆".repeat(5 - valor);
  };

  const htmlResena = (resena = {}, indice = 0) => `
    <div class="cloud-review" data-review-row="${indice}" data-foto="${escapeHTML(resena.foto || "")}" data-fecha="${escapeHTML(resena.fecha || new Date().toISOString().slice(0, 10))}">
      <div class="cloud-review__head">
        <label class="field"><span>Nombre del cliente</span><input type="text" data-review-name="${indice}" value="${escapeHTML(resena.nombre || "")}" maxlength="80" placeholder="Ej.: Martina"></label>
        <label class="field"><span>Calificación</span>
          <select data-review-rating="${indice}">
            ${[5,4,3,2,1].map((n) => `<option value="${n}" ${Number(resena.rating || 5) === n ? "selected" : ""}>${htmlEstrellas(n)}</option>`).join("")}
          </select>
        </label>
      </div>
      <label class="field"><span>Reseña</span><textarea rows="2" data-review-text="${indice}" maxlength="600" placeholder="Qué dijo el cliente…">${escapeHTML(resena.texto || "")}</textarea></label>
      <div class="cloud-review__photo">
        ${resena.foto ? `<img src="${escapeHTML(resena.foto)}" alt="">` : ""}
        <label class="btn btn--ghost cloud-file-btn">Foto de la reseña<input type="file" accept="image/*" data-review-photo="${indice}"></label>
        <button type="button" class="cloud-danger" data-remove-review-photo="${indice}" ${resena.foto ? "" : "hidden"}>Quitar foto</button>
        <button type="button" class="cloud-danger" data-remove-review="${indice}">Quitar reseña</button>
      </div>
    </div>`;

  const renderResenas = (producto) => {
    if (!els.reviewList) return;
    const resenas = Array.isArray(producto?.resenas) ? producto.resenas : [];
    els.reviewList.innerHTML = resenas.length
      ? resenas.map((resena, indice) => htmlResena(resena, indice)).join("")
      : '<p class="cloud-muted">Sin reseñas todavía. Agregá la primera cuando tengas una opinión real de un cliente.</p>';
    setStatus(els.reviewStatus, "");
  };

  const agregarResena = () => {
    if (!els.reviewList) return;
    const vacias = els.reviewList.querySelector(".cloud-muted");
    if (vacias) vacias.remove();
    const indice = els.reviewList.querySelectorAll("[data-review-row]").length;
    els.reviewList.insertAdjacentHTML("beforeend", htmlResena({}, indice));
    dirty = true;
    programarAutoguardado();
  };

  const subirFotoResena = async (input) => {
    const file = input.files?.[0];
    if (!file) return;
    const fila = input.closest("[data-review-row]");
    if (!fila) return;
    try {
      setStatus(els.reviewStatus, "Subiendo foto de la reseña…");
      const url = await subirCloudinary(file, "image");
      fila.dataset.foto = url;
      let imagen = fila.querySelector(".cloud-review__photo img");
      if (!imagen) {
        imagen = document.createElement("img");
        fila.querySelector(".cloud-review__photo")?.prepend(imagen);
      }
      imagen.src = url;
      const quitar = fila.querySelector("[data-remove-review-photo]");
      if (quitar) quitar.hidden = false;
      dirty = true;
      programarAutoguardado();
      setStatus(els.reviewStatus, "Foto lista.", "success");
    } catch (error) {
      setStatus(els.reviewStatus, `No se pudo subir la foto: ${error.message}`, "error");
    } finally {
      input.value = "";
    }
  };


  const fechaResena = (fecha) => {
    try {
      if (fecha?.toDate) return fecha.toDate().toISOString().slice(0, 10);
      if (typeof fecha === "string") return fecha.slice(0, 10);
    } catch (error) {}
    return new Date().toISOString().slice(0, 10);
  };

  const renderPendientes = (docs) => {
    if (!els.pendingReviewsList) return;
    if (!docs.length) {
      els.pendingReviewsList.innerHTML = '<p class="cloud-muted">No hay reseñas pendientes.</p>';
      return;
    }
    els.pendingReviewsList.innerHTML = docs
      .map(({ id, data }) => {
        const producto = catalog?.productos?.find((item) => item.id === data.productoId);
        return `<article class="cloud-pending" data-pending-id="${escapeHTML(id)}">
          ${data.foto ? `<img src="${escapeHTML(data.foto)}" alt="Foto de la reseña">` : ""}
          <strong>${escapeHTML(data.nombre || "Cliente")} · ${"★".repeat(Math.max(1, Math.min(5, Number(data.rating) || 5)))}</strong>
          <small>${escapeHTML(producto?.nombre || data.productoId || "Producto")} · ${fechaResena(data.fecha)}</small>
          <p>${escapeHTML(data.texto || "")}</p>
          <div class="cloud-pending__actions">
            <button class="btn btn--primary" type="button" data-approve="${escapeHTML(id)}">Aprobar</button>
            <button class="cloud-danger" type="button" data-reject="${escapeHTML(id)}">Descartar</button>
          </div>
        </article>`;
      })
      .join("");
  };

  const cargarResenasPendientes = async () => {
    if (!db || !els.pendingReviewsList) return;
    try {
      setStatus(els.pendingReviewsStatus, "Buscando reseñas pendientes…");
      const snap = await db.collection("resenas").where("estado", "==", "pendiente").limit(30).get();
      const docs = snap.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
      renderPendientes(docs);
      setStatus(els.pendingReviewsStatus, docs.length ? `${docs.length} pendiente(s).` : "No hay reseñas pendientes.", "success");
    } catch (error) {
      setStatus(els.pendingReviewsStatus, `No se pudieron cargar: ${firebaseErrorMessage(error)}`, "error");
    }
  };

  const aprobarResena = async (id) => {
    if (!db) return;
    try {
      const ref = db.collection("resenas").doc(id);
      const snap = await ref.get();
      if (!snap.exists) throw new Error("La reseña ya no existe.");
      const data = snap.data();
      const producto = catalog?.productos?.find((item) => item.id === data.productoId);
      if (!producto) throw new Error("No encuentro el producto de esta reseña.");
      const resena = {
        nombre: data.nombre || "Cliente",
        rating: Number(data.rating) || 5,
        texto: data.texto || "",
        foto: data.foto || "",
        fecha: fechaResena(data.fecha),
      };
      producto.resenas = [...(Array.isArray(producto.resenas) ? producto.resenas : []), resena];
      await ref.update({ estado: "aprobada" });
      if (selectedId === producto.id) renderResenas(producto);
      dirty = true;
      await guardarBorrador(null, { silencioso: true });
      await cargarResenasPendientes();
      toast("Reseña aprobada. Guardá y publicá para que aparezca en la web.");
    } catch (error) {
      setStatus(els.pendingReviewsStatus, `No se aprobó: ${error.message}`, "error");
    }
  };

  const rechazarResena = async (id) => {
    if (!db) return;
    try {
      await db.collection("resenas").doc(id).update({ estado: "rechazada" });
      await cargarResenasPendientes();
    } catch (error) {
      setStatus(els.pendingReviewsStatus, `No se descartó: ${error.message}`, "error");
    }
  };

  const renderImagenes = (producto) => {
    if (!els.imageList) return;
    const imagenes = producto?.imagenes || [];
    els.imageList.innerHTML = imagenes.length
      ? imagenes
          .map(
            (imagen, indice) => `
            <div class="cloud-image" data-index="${indice}">
              <button class="cloud-image__preview" type="button" data-view-image="${indice}" aria-label="Ver foto ${indice + 1} en grande">
                <img src="${escapeHTML(imageURL(imagen.src))}" alt="${escapeHTML(imagen.alt || "")}" loading="lazy">
              </button>
              <label class="field">
                <span class="sr-only">Texto alternativo</span>
                <input type="text" data-alt="${indice}" value="${escapeHTML(imagen.alt || "")}" placeholder="Texto alternativo" maxlength="160">
              </label>
              <div class="cloud-image__tools">
                <button type="button" data-edit-image="${indice}" aria-label="Volver a editar la foto">Editar</button>
                <button type="button" data-move="${indice}" data-dir="-1" ${indice === 0 ? "disabled" : ""} aria-label="Mover antes">←</button>
                <button type="button" data-move="${indice}" data-dir="1" ${indice === imagenes.length - 1 ? "disabled" : ""} aria-label="Mover después">→</button>
                <button type="button" data-remove="${indice}" aria-label="Quitar foto">Quitar</button>
              </div>
            </div>`
          )
          .join("")
      : '<p class="cloud-muted">Todavía no hay fotos.</p>';
  };

  const renderVideos = (producto) => {
    if (!els.videoList) return;
    const videos = producto?.videos || [];
    els.videoList.innerHTML = videos.length
      ? videos
          .map(
            (video, indice) => `
            <div class="cloud-video">
              <span>${escapeHTML(video.title || `Video ${indice + 1}`)}</span>
              <button type="button" data-remove-video="${indice}">Quitar</button>
            </div>`
          )
          .join("")
      : '<p class="cloud-muted">Todavía no hay videos.</p>';
  };

  const cargarImagen = (blob) =>
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const imagen = new Image();
      imagen.onload = () => {
        URL.revokeObjectURL(url);
        resolve(imagen);
      };
      imagen.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("No se pudo leer la imagen."));
      };
      imagen.src = url;
    });

  const canvasABlob = (canvas, tipo = "image/webp", calidad = 0.9) =>
    new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo generar la imagen."))),
        tipo,
        calidad
      );
    });

  const mostrarProgresoImagen = (titulo, detalle = "", avance = null) => {
    if (!els.imageProgress) return;
    els.imageProgress.hidden = false;
    if (els.imageProgressTitle) els.imageProgressTitle.textContent = titulo;
    if (els.imageProgressDetail) els.imageProgressDetail.textContent = detalle;
    if (els.imageProgressBar) {
      els.imageProgressBar.classList.toggle("is-indeterminate", avance === null);
      els.imageProgressBar.style.width = avance === null ? "" : `${Math.max(0, Math.min(100, avance))}%`;
    }
  };
  const ocultarProgresoImagen = () => {
    if (els.imageProgress) els.imageProgress.hidden = true;
  };

  const mostrarCursorBrocha = (event) => {
    if (!editorRecorteState || editorRecorteState.panMode || !els.imageBrushCursor || !els.imageEditorStage) return;
    const escenario = els.imageEditorStage.getBoundingClientRect();
    const tamano = Number(els.imageBrushSize?.value || 36) * 2;
    els.imageBrushCursor.hidden = false;
    els.imageBrushCursor.dataset.mode = editorRecorteState.brushMode;
    els.imageBrushCursor.style.width = `${tamano}px`;
    els.imageBrushCursor.style.height = `${tamano}px`;
    els.imageBrushCursor.style.left = `${event.clientX - escenario.left}px`;
    els.imageBrushCursor.style.top = `${event.clientY - escenario.top}px`;
  };
  const actualizarCursorBrocha = () => {
    if (!els.imageBrushCursor || els.imageBrushCursor.hidden) return;
    const tamano = Number(els.imageBrushSize?.value || 36) * 2;
    els.imageBrushCursor.style.width = `${tamano}px`;
    els.imageBrushCursor.style.height = `${tamano}px`;
  };
  const ocultarCursorBrocha = () => {
    if (els.imageBrushCursor) els.imageBrushCursor.hidden = true;
  };

  const aplicarVistaRecorte = () => {
    const estado = editorRecorteState;
    if (!estado) return;
    estado.canvas.style.transform = `translate(${estado.panX}px, ${estado.panY}px) scale(${estado.zoom})`;
    if (els.imageBrushZoom) els.imageBrushZoom.value = String(Math.round(estado.zoom * 100));
    if (els.imageBrushZoomValue) els.imageBrushZoomValue.textContent = `${Math.round(estado.zoom * 100)}%`;
  };

  const limpiarAlfa = (imageData, ancho, alto, erosion = 0) => {
    const datos = imageData.data;
    const total = ancho * alto;
    const mascara = new Uint8Array(total);
    for (let i = 0; i < total; i += 1) {
      const p = i * 4;
      const alfa = datos[p + 3];
      if (alfa < 12) continue;
      const r = datos[p];
      const g = datos[p + 1];
      const b = datos[p + 2];
      // Halos claros semitransparentes que deja el modelo en fondos blancos.
      if (alfa < 220 && r > 235 && g > 235 && b > 235) continue;
      mascara[i] = 1;
    }
    // Si el borde exterior es blanco (fondo que sobrevivió), lo quitamos
    // aunque el modelo le haya dado alfa alto.
    for (let pasada = 0; pasada < 3; pasada += 1) {
      const siguiente = new Uint8Array(mascara);
      for (let y = 1; y < alto - 1; y += 1) {
        for (let x = 1; x < ancho - 1; x += 1) {
          const i = y * ancho + x;
          if (!mascara[i]) continue;
          const esBorde = !mascara[i - 1] || !mascara[i + 1] || !mascara[i - ancho] || !mascara[i + ancho];
          if (!esBorde) continue;
          const p = i * 4;
          if (datos[p] > 210 && datos[p + 1] > 210 && datos[p + 2] > 210) siguiente[i] = 0;
        }
      }
      mascara.set(siguiente);
    }
    if (erosion > 0) {
      let actual = mascara;
      for (let vuelta = 0; vuelta < erosion; vuelta += 1) {
        const siguiente = new Uint8Array(actual);
        for (let y = 1; y < alto - 1; y += 1) {
          for (let x = 1; x < ancho - 1; x += 1) {
            const i = y * ancho + x;
            if (!actual[i]) continue;
            if (!actual[i - 1] || !actual[i + 1] || !actual[i - ancho] || !actual[i + ancho]) siguiente[i] = 0;
          }
        }
        actual = siguiente;
      }
      mascara.set(actual);
    }
    for (let i = 0; i < total; i += 1) {
      datos[i * 4 + 3] = mascara[i] ? 255 : 0;
    }
  };

  const pintarRecorte = (clientX, clientY) => {
    const estado = editorRecorteState;
    if (!estado) return;
    const { canvas, ctx, data, originalPixels, brushMode } = estado;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.round((clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.round((clientY - rect.top) * (canvas.height / rect.height));
    const radioPantalla = Number(els.imageBrushSize?.value || 36);
    const radio = Math.max(2, Math.round(radioPantalla * (canvas.width / rect.width)));
    const desdeX = Math.max(0, x - radio);
    const hastaX = Math.min(canvas.width - 1, x + radio);
    const desdeY = Math.max(0, y - radio);
    const hastaY = Math.min(canvas.height - 1, y + radio);
    const r2 = radio * radio;
    for (let py = desdeY; py <= hastaY; py += 1) {
      for (let px = desdeX; px <= hastaX; px += 1) {
        const dx = px - x;
        const dy = py - y;
        if (dx * dx + dy * dy > r2) continue;
        const i = (py * canvas.width + px) * 4;
        if (brushMode === "erase") {
          data.data[i + 3] = 0;
        } else {
          data.data[i] = originalPixels[i];
          data.data[i + 1] = originalPixels[i + 1];
          data.data[i + 2] = originalPixels[i + 2];
          data.data[i + 3] = 255;
        }
      }
    }
    ctx.putImageData(data, 0, 0);
  };

  const abrirEditorRecorte = async (file, recorteBlob, opciones = {}) => {
    if (!els.imageEditorDialog || !els.imageEditorCanvas) return recorteBlob;
    const [original, corte] = await Promise.all([cargarImagen(file), cargarImagen(recorteBlob)]);
    const anchoOriginal = corte.naturalWidth || corte.width;
    const altoOriginal = corte.naturalHeight || corte.height;
    const maximo = 1600;
    const escala = Math.min(1, maximo / Math.max(anchoOriginal, altoOriginal));
    const ancho = Math.max(1, Math.round(anchoOriginal * escala));
    const alto = Math.max(1, Math.round(altoOriginal * escala));
    const canvas = els.imageEditorCanvas;
    canvas.width = ancho;
    canvas.height = alto;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(original, 0, 0, ancho, alto);
    const originalData = ctx.getImageData(0, 0, ancho, alto);
    const originalPixels = new Uint8ClampedArray(originalData.data);
    const capa = document.createElement("canvas");
    capa.width = ancho;
    capa.height = alto;
    const capaCtx = capa.getContext("2d", { willReadFrequently: true });
    capaCtx.drawImage(corte, 0, 0, ancho, alto);
    const corteData = capaCtx.getImageData(0, 0, ancho, alto);
    for (let i = 0; i < corteData.data.length; i += 4) {
      // El modelo devuelve alfa parcial en cuerpos oscuros: lo normalizamos
      // para que el producto quede opaco y el fondo realmente transparente.
      // Conservamos el alfa original para poder detectar y quitar halos claros.
      originalData.data[i + 3] = corteData.data[i + 3];
    }
    if (opciones.limpiar !== false) limpiarAlfa(originalData, ancho, alto, 2);
    ctx.putImageData(originalData, 0, 0);
    editorRecorteState = {
      canvas, ctx, data: originalData, originalPixels,
      brushMode: "restore", drawing: false, undo: [], finalizado: false, resolve: null,
      zoom: 1, panX: 0, panY: 0, panMode: false, panning: false, panStart: null,
    };
    if (els.imageEditorTitle) els.imageEditorTitle.textContent = opciones.reabrir ? `Seguir editando «${file.name}»` : `Revisar «${file.name}»`;
    if (els.imageEditorHelp) els.imageEditorHelp.textContent = opciones.reabrir
      ? "Seguí corrigiendo el fondo o los detalles con la brocha. Después podés volver a ajustar el encuadre."
      : "Revisá el recorte. Con «Restaurar» recuperás la foto original en las zonas que falten; con «Borrar fondo» quitás restos de fondo.";
    els.imageEditorTools?.querySelectorAll("[data-brush]").forEach((boton) => boton.classList.toggle("is-active", boton.dataset.brush === "restore"));
    if (els.imageBrushSize) els.imageBrushSize.value = "36";
    if (els.imageEditorPanToggle) els.imageEditorPanToggle.classList.remove("is-active");
    canvas.style.cursor = "none";
    aplicarVistaRecorte();
    ocultarCursorBrocha();
    if (typeof els.imageEditorDialog.showModal === "function") els.imageEditorDialog.showModal();
    else els.imageEditorDialog.setAttribute("open", "");
    return new Promise((resolve) => {
      if (editorRecorteState) editorRecorteState.resolve = resolve;
    });
  };

  const renderizarEncuadre = () => {
    const estado = editorEncuadreState;
    if (!estado) return;
    const { ctx, imagen, ancho, alto, bbox, baseScale, zoom, rotation, offsetX, offsetY } = estado;
    ctx.clearRect(0, 0, ancho, alto);
    const escala = baseScale * zoom;
    const anchoDibujo = bbox.ancho * escala;
    const altoDibujo = bbox.alto * escala;
    const x = (ancho - anchoDibujo) / 2 + offsetX;
    const y = 1010 - altoDibujo + offsetY;
    ctx.imageSmoothingQuality = "high";
    ctx.save();
    ctx.translate(x + anchoDibujo / 2, y + altoDibujo / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(imagen, bbox.x, bbox.y, bbox.ancho, bbox.alto, -anchoDibujo / 2, -altoDibujo / 2, anchoDibujo, altoDibujo);
    ctx.restore();
  };

  const finalizarEditorEncuadre = (blob) => {
    const estado = editorEncuadreState;
    if (!estado) return;
    estado.finalizado = true;
    const resolver = estado.resolve;
    estado.resolve = null;
    els.imageFrameDialog?.close();
    editorEncuadreState = null;
    if (resolver) resolver(blob);
  };

  const abrirEditorEncuadre = async (blob) => {
    if (!els.imageFrameDialog || !els.imageFrameCanvas) return blob;
    const imagen = await cargarImagen(blob);
    const anchoNatural = imagen.naturalWidth || imagen.width;
    const altoNatural = imagen.naturalHeight || imagen.height;
    const temporal = document.createElement("canvas");
    temporal.width = anchoNatural;
    temporal.height = altoNatural;
    const ctxTemporal = temporal.getContext("2d", { willReadFrequently: true });
    ctxTemporal.drawImage(imagen, 0, 0);
    const datos = ctxTemporal.getImageData(0, 0, anchoNatural, altoNatural).data;
    let minX = anchoNatural;
    let minY = altoNatural;
    let maxX = 0;
    let maxY = 0;
    let encontrado = false;
    for (let y = 0; y < altoNatural; y += 1) {
      for (let x = 0; x < anchoNatural; x += 1) {
        if (datos[(y * anchoNatural + x) * 4 + 3] > 0) {
          encontrado = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (!encontrado) return blob;
    const bbox = { x: minX, y: minY, ancho: maxX - minX + 1, alto: maxY - minY + 1 };
    const ancho = 1200;
    const alto = 1200;
    const canvas = els.imageFrameCanvas;
    canvas.width = ancho;
    canvas.height = alto;
    const ctx = canvas.getContext("2d");
    const baseScale = Math.min(900 / bbox.ancho, 900 / bbox.alto);
    editorEncuadreState = {
      ctx, imagen, ancho, alto, bbox, baseScale,
      zoom: 1, rotation: 0, offsetX: 0, offsetY: 0, drawing: false, drag: null, finalizado: false, resolve: null,
    };
    if (els.imageFrameZoom) els.imageFrameZoom.value = "100";
    if (els.imageFrameZoomValue) els.imageFrameZoomValue.textContent = "100%";
    if (els.imageFrameRotate) els.imageFrameRotate.value = "0";
    if (els.imageFrameRotateValue) els.imageFrameRotateValue.textContent = "0°";
    renderizarEncuadre();
    if (typeof els.imageFrameDialog.showModal === "function") els.imageFrameDialog.showModal();
    else els.imageFrameDialog.setAttribute("open", "");
    return new Promise((resolve) => {
      if (editorEncuadreState) editorEncuadreState.resolve = resolve;
    });
  };

  const editarFotoConBrochaYEncuadre = async (file, recorte, opciones = {}) => {
    let editado = await abrirEditorRecorte(file, recorte, opciones);
    while (editado) {
      const resultado = await abrirEditorEncuadre(editado);
      if (resultado === "volver") {
        editado = await abrirEditorRecorte(file, editado, { ...opciones, limpiar: false, reabrir: true });
        continue;
      }
      return resultado;
    }
    return null;
  };

  const finalizarEditorRecorte = (blob) => {
    const estado = editorRecorteState;
    if (!estado) return;
    estado.finalizado = true;
    const resolver = estado.resolve;
    estado.resolve = null;
    ocultarCursorBrocha();
    els.imageEditorDialog?.close();
    editorRecorteState = null;
    if (resolver) resolver(blob);
  };

  const abrirLightbox = (src, alt) => {
    if (!els.imageLightbox || !els.imageLightboxImg) return;
    els.imageLightboxImg.src = imageURL(src);
    els.imageLightboxImg.alt = alt || "Foto del producto";
    if (els.imageLightboxCaption) els.imageLightboxCaption.textContent = alt || "";
    if (typeof els.imageLightbox.showModal === "function") els.imageLightbox.showModal();
    else els.imageLightbox.setAttribute("open", "");
  };

  const recortarSujeto = async (blob, originalFile = null) => {
    const imagen = await cargarImagen(blob);
    const lienzo = document.createElement("canvas");
    lienzo.width = imagen.naturalWidth || imagen.width;
    lienzo.height = imagen.naturalHeight || imagen.height;
    const ctx = lienzo.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(imagen, 0, 0);
    if (originalFile) {
      try {
        const original = await cargarImagen(originalFile);
        const lienzoOriginal = document.createElement("canvas");
        lienzoOriginal.width = lienzo.width;
        lienzoOriginal.height = lienzo.height;
        const ctxOriginal = lienzoOriginal.getContext("2d", { willReadFrequently: true });
        ctxOriginal.drawImage(original, 0, 0, lienzo.width, lienzo.height);
        const originalData = ctxOriginal.getImageData(0, 0, lienzo.width, lienzo.height).data;
        const recorteData = ctx.getImageData(0, 0, lienzo.width, lienzo.height);
        for (let i = 0; i < recorteData.data.length; i += 4) {
          if (recorteData.data[i + 3] > 0) {
            recorteData.data[i] = originalData[i];
            recorteData.data[i + 1] = originalData[i + 1];
            recorteData.data[i + 2] = originalData[i + 2];
          }
        }
        ctx.putImageData(recorteData, 0, 0);
      } catch (error) {}
    }
    const datosImagen = ctx.getImageData(0, 0, lienzo.width, lienzo.height);
    limpiarAlfa(datosImagen, lienzo.width, lienzo.height, 1);
    ctx.putImageData(datosImagen, 0, 0);
    const datos = datosImagen.data;
    let minX = lienzo.width;
    let minY = lienzo.height;
    let maxX = 0;
    let maxY = 0;
    let encontrado = false;
    for (let y = 0; y < lienzo.height; y += 1) {
      for (let x = 0; x < lienzo.width; x += 1) {
        if (datos[(y * lienzo.width + x) * 4 + 3] > 0) {
          encontrado = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    const caja = encontrado ? { minX, minY, maxX, maxY } : null;
    if (!caja) throw new Error("La imagen quedó vacía después de quitar el fondo.");

    const margen = Math.round(Math.max(maxX - minX, maxY - minY) * 0.04);
    minX = Math.max(0, minX - margen);
    minY = Math.max(0, minY - margen);
    maxX = Math.min(lienzo.width - 1, maxX + margen);
    maxY = Math.min(lienzo.height - 1, maxY + margen);
    const ancho = maxX - minX + 1;
    const alto = maxY - minY + 1;

    const salida = document.createElement("canvas");
    salida.width = 1200;
    salida.height = 1200;
    const ctxSalida = salida.getContext("2d");
    const maximo = 900;
    const escala = Math.min(maximo / ancho, maximo / alto);
    const anchoFinal = Math.round(ancho * escala);
    const altoFinal = Math.round(alto * escala);
    const x = Math.round((salida.width - anchoFinal) / 2);
    const y = Math.round(1010 - altoFinal);
    ctxSalida.imageSmoothingQuality = "high";
    ctxSalida.drawImage(lienzo, minX, minY, ancho, alto, x, y, anchoFinal, altoFinal);

    // Cuerpo opaco, fondo transparente: evitamos el efecto "fantasma" gris.
    const pixelesSalida = ctxSalida.getImageData(0, 0, salida.width, salida.height);
    for (let i = 3; i < pixelesSalida.data.length; i += 4) {
      pixelesSalida.data[i] = pixelesSalida.data[i] >= 12 ? 255 : 0;
    }
    ctxSalida.putImageData(pixelesSalida, 0, 0);

    let resultado = await canvasABlob(salida, "image/webp", 0.9);
    if (resultado.size > 300 * 1024) {
      resultado = await canvasABlob(salida, "image/webp", 0.8);
    }
    if (resultado.size > 300 * 1024) {
      resultado = await canvasABlob(salida, "image/webp", 0.7);
    }
    return resultado;
  };

  const quitarFondo = async (file) => {
    if (!removeBackgroundPromise) {
      removeBackgroundPromise = import(
        "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/+esm"
      );
    }
    const modulo = await removeBackgroundPromise;
    if (typeof modulo.removeBackground !== "function") {
      throw new Error("El modelo de recorte no se cargó.");
    }
    const calidad = els.imageCutoutQuality?.value || "alta";
    const modelos = calidad === "rapida"
      ? ["isnet_quint8"]
      : calidad === "equilibrada"
        ? ["isnet_fp16", "isnet_quint8"]
        : ["isnet", "isnet_fp16", "isnet_quint8"];
    let ultimoError = null;
    for (const modelo of modelos) {
      try {
        setStatus(els.imageStatus, `Preparando recorte ${modelo === "isnet" ? "de alta calidad" : modelo}…`);
        mostrarProgresoImagen("Quitando el fondo…", `Modelo ${modelo}. La primera vez puede tardar mientras se descarga.`);
        await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
        return await modulo.removeBackground(file, {
          model: modelo,
          proxyToWorker: true,
          output: { format: "image/png" },
          progress: (clave, actual, total) => {
            const avance = total ? Math.round((actual / total) * 100) : null;
            const detalle = avance === null ? `Preparando ${clave}…` : `Descargando modelo ${clave}: ${avance}%`;
            setStatus(els.imageStatus, detalle);
            mostrarProgresoImagen("Preparando el recorte…", detalle, avance);
          },
        });
      } catch (error) {
        ultimoError = error;
        mostrarProgresoImagen("Reintentando recorte…", "El modelo anterior no pudo procesar esta foto.");
      }
    }
    throw new Error(ultimoError?.message || "El modelo de recorte no pudo procesar la foto.");
  };

  const subirCloudinary = async (file, tipo = "image") => {
    const { cloudName, uploadPreset, folder } = CLOUDINARY;
    if (!cloudName) {
      throw new Error("Cloudinary no está configurado. Completá cloudName en editor/cloud-config.js.");
    }
    if (!uploadPreset) {
      throw new Error("Falta el upload preset de Cloudinary.");
    }
    const datos = new FormData();
    datos.append("file", file);
    datos.append("upload_preset", uploadPreset);
    if (folder) datos.append("folder", folder);
    const respuesta = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/${tipo}/upload`,
      { method: "POST", body: datos }
    );
    const resultado = await respuesta.json();
    if (!respuesta.ok) {
      throw new Error(resultado?.error?.message || `Cloudinary respondió ${respuesta.status}.`);
    }
    if (!resultado.secure_url) throw new Error("Cloudinary no devolvió la URL.");
    return resultado.secure_url;
  };


  const asegurarProductoParaMedios = () => {
    if (!catalog) return false;
    if (!creating) return Boolean(selectedId);
    if (!els.productName.value.trim()) {
      els.productName.value = "Producto sin título";
      if (!els.productCategories.querySelector("input:checked")) {
        const primera = catalog.categorias?.[0]?.id;
        if (primera) {
          const check = els.productCategories.querySelector(`input[value="${primera}"]`);
          if (check) check.checked = true;
        }
      }
      try {
        commitFormulario();
      } catch (error) {
        setStatus(els.saveStatus, error.message, "error");
        return false;
      }
      setStatus(
        els.saveStatus,
        "Foto preparada. Podés seguir cargando fotos; cuando termines, cambiá «Producto sin título» por el nombre real en la pestaña Datos.",
        ""
      );
      return true;
    }
    try {
      commitFormulario();
      return true;
    } catch (error) {
      setStatus(els.saveStatus, error.message, "error");
      return false;
    }
  };

  const procesarImagenes = async (files) => {
    if (!catalog) return;
    if (!asegurarProductoParaMedios()) return;
    const producto = catalog?.productos?.find((item) => item.id === selectedId) || null;
    if (!producto) {
      setStatus(els.imageStatus, "Elegí o creá un producto antes de agregar fotos.", "error");
      return;
    }
    if (procesandoFotos) {
      setStatus(els.imageStatus, "Ya hay una foto procesándose. Esperá a que termine.", "error");
      return;
    }
    procesandoFotos = true;
    els.imageFiles.disabled = true;
    try {
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setStatus(els.imageStatus, `«${file.name}» no es una imagen.`, "error");
        continue;
      }
      if (file.size > 25 * 1024 * 1024) {
        setStatus(els.imageStatus, `«${file.name}» supera 25 MB.`, "error");
        continue;
      }
      try {
        setStatus(els.imageStatus, `Quitando el fondo de «${file.name}»…`);
        mostrarProgresoImagen("Procesando foto…", `Quitando el fondo de «${file.name}».`);
        const recorte = await quitarFondo(file);
        ocultarProgresoImagen();
        setStatus(els.imageStatus, "Revisá el recorte y corregilo con la brocha si hace falta.");
        ocultarProgresoImagen();
        const procesada = await editarFotoConBrochaYEncuadre(file, recorte);
        if (!procesada) {
          setStatus(els.imageStatus, `«${file.name}» descartada. La foto no se subió.`);
          continue;
        }
        setStatus(els.imageStatus, `Subiendo «${file.name}»…`);
        mostrarProgresoImagen("Subiendo la foto…", "Guardando la imagen recortada en Cloudinary.");
        const url = await subirCloudinary(procesada, "image");
        const actual = catalog.productos.find((item) => item.id === selectedId);
        if (!actual) throw new Error("El producto se cerró mientras se procesaba la foto.");
        const nombre = actual.nombre || "Producto impreso en 3D";
        actual.imagenes = actual.imagenes || [];
        actual.imagenes.push({ src: url, alt: `${nombre} impreso en 3D` });
        dirty = true;
        renderImagenes(actual);
        setStatus(els.imageStatus, `«${file.name}» lista.`, "success");
      } catch (error) {
        setStatus(els.imageStatus, `No se pudo procesar «${file.name}»: ${error.message}`, "error");
      } finally {
        ocultarProgresoImagen();
      }
    }
    } finally {
      procesandoFotos = false;
      els.imageFiles.disabled = false;
      els.imageFiles.value = "";
      ocultarProgresoImagen();
    }
  };

  const procesarVideo = async (files) => {
    if (!catalog) return;
    if (!asegurarProductoParaMedios()) return;
    const producto = catalog?.productos?.find((item) => item.id === selectedId) || null;
    if (!producto) {
      setStatus(els.videoStatus, "Elegí o creá un producto antes de agregar un video.", "error");
      return;
    }
    for (const file of Array.from(files)) {
      if (!["video/mp4", "video/webm", "video/quicktime"].includes(file.type)) {
        setStatus(els.videoStatus, `«${file.name}» no es MP4, WEBM o MOV.`, "error");
        continue;
      }
      if (file.size > 50 * 1024 * 1024) {
        setStatus(els.videoStatus, `«${file.name}» supera 50 MB.`, "error");
        continue;
      }
      try {
        setStatus(els.videoStatus, `Subiendo «${file.name}»…`);
        const url = await subirCloudinary(file, "video");
        const actual = catalog.productos.find((item) => item.id === selectedId);
        if (!actual) throw new Error("El producto se cerró mientras se subía el video.");
        actual.videos = actual.videos || [];
        actual.videos.push({ src: url, title: file.name.replace(/\.[^.]+$/, "") });
        dirty = true;
        renderVideos(actual);
        setStatus(els.videoStatus, `«${file.name}» listo.`, "success");
      } catch (error) {
        setStatus(els.videoStatus, `No se pudo subir «${file.name}»: ${error.message}`, "error");
      }
    }
    els.videoFiles.value = "";
  };

  const agregarCategoria = (event) => {
    event.preventDefault();
    const nombre = els.categoryName.value.trim();
    if (!nombre) return;
    const base = slugify(nombre) || "categoria";
    let id = base;
    let sufijo = 2;
    while (catalog.categorias.some((categoria) => categoria.id === id)) {
      id = `${base}-${sufijo++}`;
    }
    const padre = els.categoryParent.value || null;
    catalog.categorias.push({ id, nombre, padre });
    categoriasAbiertas.add(id);
    if (padre) categoriasAbiertas.add(padre);
    dirty = true;
    els.categoryForm.reset();
    renderCategorias();
    programarAutoguardado();
    const nuevoCheck = els.productCategories.querySelector(`input[value="${id}"]`);
    if (nuevoCheck) nuevoCheck.checked = true;
    setStatus(els.saveStatus, "Categoría agregada. Guardá el borrador para confirmarla.");
  };

  const eliminarCategoria = (id) => {
    const usada = catalog.productos.some((producto) => categoriasProducto(producto).includes(id));
    const tieneHijas = catalog.categorias.some((categoria) => categoria.padre === id);
    if (usada || tieneHijas) {
      toast("No se puede eliminar: tiene productos o subcategorías.", "error");
      return;
    }
    catalog.categorias = catalog.categorias.filter((categoria) => categoria.id !== id);
    categoriasAbiertas.delete(id);
    dirty = true;
    renderCategorias();
    programarAutoguardado();
    setStatus(els.saveStatus, "Categoría eliminada. Guardá el borrador para confirmarlo.");
  };

  const editarImagenProducto = async (indice) => {
    if (procesandoFotos) {
      setStatus(els.imageStatus, "Ya hay una foto procesándose. Esperá a que termine.", "error");
      return;
    }
    const producto = catalog?.productos?.find((item) => item.id === selectedId);
    const imagen = producto?.imagenes?.[indice];
    if (!producto || !imagen?.src) return;
    procesandoFotos = true;
    try {
      setStatus(els.imageStatus, "Abriendo la foto para volver a editarla…");
      const respuesta = await fetch(imageURL(imagen.src), { cache: "no-store" });
      if (!respuesta.ok) throw new Error("No se pudo descargar la foto.");
      const blob = await respuesta.blob();
      const archivo = new File([blob], `foto-${indice + 1}.webp`, { type: blob.type || "image/webp" });
      const editada = await editarFotoConBrochaYEncuadre(archivo, blob, { limpiar: false });
      if (!editada) {
        setStatus(els.imageStatus, "Edición cancelada. La foto no cambió.", "");
        return;
      }
      mostrarProgresoImagen("Guardando la foto editada…", "Subiendo la nueva versión a Cloudinary.");
      const nuevaUrl = await subirCloudinary(editada, "image");
      const actual = catalog.productos.find((item) => item.id === selectedId);
      const actualImagen = actual?.imagenes?.[indice];
      if (!actual || !actualImagen) throw new Error("La foto se cerró mientras se editaba.");
      const urlAnterior = actualImagen.src;
      actualImagen.src = nuevaUrl;
      (actual.variantes || []).forEach((variante) => {
        if (variante.imagen === urlAnterior) variante.imagen = nuevaUrl;
      });
      (catalog.categorias || []).forEach((categoria) => {
        if (categoria.portada === urlAnterior) categoria.portada = nuevaUrl;
      });
      dirty = true;
      renderImagenes(actual);
      renderVariantes(actual);
      renderProductos();
      programarAutoguardado();
      setStatus(els.imageStatus, "Foto actualizada. Guardá el borrador para confirmar.", "success");
    } catch (error) {
      setStatus(els.imageStatus, `No se pudo editar la foto: ${error.message}`, "error");
    } finally {
      procesandoFotos = false;
      ocultarProgresoImagen();
    }
  };

  const manejarClickImagenes = (event) => {
    const producto = catalog?.productos?.find((item) => item.id === selectedId);
    if (!producto) return;
    const editar = event.target.closest("[data-edit-image]");
    if (editar) {
      editarImagenProducto(Number(editar.dataset.editImage));
      return;
    }
    const ver = event.target.closest("[data-view-image]");
    if (ver) {
      const imagen = producto.imagenes[Number(ver.dataset.viewImage)];
      if (imagen) abrirLightbox(imagen.src, imagen.alt || producto.nombre);
      return;
    }
    const quitar = event.target.closest("[data-remove]");
    if (quitar) {
      producto.imagenes.splice(Number(quitar.dataset.remove), 1);
      dirty = true;
      renderImagenes(producto);
      return;
    }
    const mover = event.target.closest("[data-move]");
    if (mover) {
      const indice = Number(mover.dataset.move);
      const destino = indice + Number(mover.dataset.dir);
      if (destino < 0 || destino >= producto.imagenes.length) return;
      const [imagen] = producto.imagenes.splice(indice, 1);
      producto.imagenes.splice(destino, 0, imagen);
      dirty = true;
      renderImagenes(producto);
    }
  };

  const manejarAltImagen = (event) => {
    const input = event.target.closest("[data-alt]");
    if (!input) return;
    const producto = catalog?.productos?.find((item) => item.id === selectedId);
    if (!producto) return;
    const indice = Number(input.dataset.alt);
    if (producto.imagenes[indice]) {
      producto.imagenes[indice].alt = input.value;
      dirty = true;
    }
  };


  const importarCatalogo = async () => {
    if (importing) return;
    if (!CLOUDINARY.cloudName) {
      setStatus(els.importStatus, "Configurá Cloudinary antes de importar las imágenes.", "error");
      return;
    }
    if (!window.confirm("Se van a subir las fotos y videos del catálogo que tenés abierto a Cloudinary. No se eliminan productos. ¿Continuar?")) return;
    importing = true;
    if (els.importCatalog) els.importCatalog.disabled = true;
    try {
      setStatus(els.importStatus, "Preparando el catálogo actual…");
      let base = normalizarCatalogo(clone(catalog || {}));
      if (!base.productos.length) {
        const respuesta = await fetch("../data/catalog.json", { cache: "no-store" });
        if (!respuesta.ok) throw new Error("No se encontró data/catalog.json.");
        base = normalizarCatalogo(await respuesta.json());
      }

      // Si las imágenes ya fueron migradas a Cloudinary, aplicar el mapa
      // sin volver a subirlas. El mapa se genera con tools de administración.
      let mapa = null;
      try {
        const respuestaMapa = await fetch("../data/cloudinary-map.json", { cache: "no-store" });
        if (respuestaMapa.ok) mapa = await respuestaMapa.json();
      } catch {
        mapa = null;
      }
      if (mapa && typeof mapa === "object") {
        let reemplazadas = 0;
        base.productos.forEach((producto) => {
          (producto.imagenes || []).forEach((imagen) => {
            const clave = String(imagen.src || "").split("?")[0].replace(/^\/+/, "");
            if (mapa[clave]) {
              imagen.src = mapa[clave];
              reemplazadas += 1;
            }
          });
          (producto.videos || []).forEach((video) => {
            const clave = String(video.src || "").split("?")[0].replace(/^\/+/, "");
            if (mapa[clave]) {
              video.src = mapa[clave];
              reemplazadas += 1;
            }
          });
        });
        const jsonMapa = JSON.stringify(base);
        const payloadMapa = { json: jsonMapa, actualizadoPor: currentUser?.email || "" };
        await db.collection(CATALOG_DOC).doc(DRAFT_DOC).set({
          ...payloadMapa,
          actualizado: firebase.firestore.FieldValue.serverTimestamp(),
        });
        await db.collection(CATALOG_DOC).doc(PUBLISHED_DOC).set({
          ...payloadMapa,
          actualizado: firebase.firestore.FieldValue.serverTimestamp(),
        });
        catalog = base;
        selectedId = null;
        creating = false;
        dirty = false;
        renderCategorias();
        renderSucursales();
        renderProductos();
        mostrarFormulario(false);
        setStatus(
          els.importStatus,
          `Imágenes aplicadas: ${reemplazadas} rutas ahora usan Cloudinary.`,
          "success"
        );
        toast("Imágenes migradas aplicadas y catálogo publicado.");
        return;
      }
      const mapaImagenes = new Map();
      const mapaVideos = new Map();
      const imagenes = [];
      const videos = [];

      base.productos.forEach((producto) => {
        (producto.imagenes || []).forEach((imagen) => {
          if (imagen?.src && !/^https?:/i.test(imagen.src)) imagenes.push(imagen.src);
        });
        (producto.videos || []).forEach((video) => {
          if (video?.src && !/^https?:/i.test(video.src)) videos.push(video.src);
        });
      });

      const unicas = [...new Set(imagenes)];
      let subidas = 0;
      for (const src of unicas) {
        subidas += 1;
        setStatus(els.importStatus, `Subiendo foto ${subidas}/${unicas.length}…`);
        try {
          const origen = await fetch(imageURL(src), { cache: "no-store" });
          if (!origen.ok) throw new Error(`HTTP ${origen.status}`);
          const blob = await origen.blob();
          const url = await subirCloudinary(blob, "image");
          mapaImagenes.set(src, url);
        } catch (error) {
          throw new Error(`No se pudo subir ${src}: ${error.message}`);
        }
      }

      const videosUnicos = [...new Set(videos)];
      let videosSubidos = 0;
      for (const src of videosUnicos) {
        videosSubidos += 1;
        setStatus(els.importStatus, `Subiendo video ${videosSubidos}/${videosUnicos.length}…`);
        try {
          const origen = await fetch(imageURL(src), { cache: "no-store" });
          if (!origen.ok) throw new Error(`HTTP ${origen.status}`);
          const blob = await origen.blob();
          const url = await subirCloudinary(blob, "video");
          mapaVideos.set(src, url);
        } catch (error) {
          throw new Error(`No se pudo subir ${src}: ${error.message}`);
        }
      }

      base.productos.forEach((producto) => {
        (producto.imagenes || []).forEach((imagen) => {
          if (mapaImagenes.has(imagen.src)) imagen.src = mapaImagenes.get(imagen.src);
        });
        (producto.videos || []).forEach((video) => {
          if (mapaVideos.has(video.src)) video.src = mapaVideos.get(video.src);
        });
      });

      setStatus(els.importStatus, "Guardando catálogo migrado…");
      const json = JSON.stringify(base);
      const payload = { json, actualizadoPor: currentUser?.email || "" };
      await db.collection(CATALOG_DOC).doc(DRAFT_DOC).set({
        ...payload,
        actualizado: firebase.firestore.FieldValue.serverTimestamp(),
      });
      await db.collection(CATALOG_DOC).doc(PUBLISHED_DOC).set({
        ...payload,
        actualizado: firebase.firestore.FieldValue.serverTimestamp(),
      });
      catalog = base;
      selectedId = null;
      creating = false;
      dirty = false;
      renderCategorias();
      renderProductos();
      mostrarFormulario(false);
      setStatus(els.importStatus, `Catálogo importado: ${unicas.length} fotos y ${videosUnicos.length} videos.`, "success");
      toast("Catálogo migrado y publicado en la nube.");
    } catch (error) {
      setStatus(els.importStatus, `No se pudo importar: ${error.message}`, "error");
    } finally {
      importing = false;
      if (els.importCatalog) els.importCatalog.disabled = false;
    }
  };

  const extraerCoordenadasMapa = (texto) => {
    const valor = decodeURIComponent(String(texto || ""));
    const patrones = [
      /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
      /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
      /[?&]q=(-?\d+(?:\.\d+)?),\+?(-?\d+(?:\.\d+)?)/,
      /search\/(-?\d+(?:\.\d+)?),\+?(-?\d+(?:\.\d+)?)/,
      /place\/(-?\d+(?:\.\d+)?),\+?(-?\d+(?:\.\d+)?)/,
    ];
    for (const patron of patrones) {
      const coincidencia = valor.match(patron);
      if (!coincidencia) continue;
      const lat = Number.parseFloat(coincidencia[1]);
      const lng = Number.parseFloat(coincidencia[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
    }
    return null;
  };

  const resolverCoordenadasMapa = async (link) => {
    const texto = String(link || "").trim();
    if (!texto) throw new Error("Pegá un link de Google Maps.");
    const normalizado = /^https?:\/\//i.test(texto) ? texto : `https://${texto}`;
    const directas = extraerCoordenadasMapa(normalizado);
    if (directas) return directas;
    if (!/maps\.app\.goo\.gl|goo\.gl\/maps/i.test(normalizado)) {
      throw new Error("No encontramos coordenadas en ese link. Usá un link de Google Maps.");
    }
    const respuesta = await fetch(`https://r.jina.ai/http://${normalizado.replace(/^https?:\/\//i, "")}`, { cache: "no-store" });
    if (!respuesta.ok) throw new Error("No se pudo resolver el link corto. Abrí el link y pegá la URL completa de la barra.");
    const contenido = await respuesta.text();
    const final = contenido.match(/Final URL:\s*(\S+)/i)?.[1] || "";
    const coords = extraerCoordenadasMapa(final) || extraerCoordenadasMapa(contenido);
    if (!coords) throw new Error("El link no contiene coordenadas. Abrí Google Maps y copiá la URL completa de la barra.");
    return coords;
  };

  const detectarUbicacionSucursal = async (indice) => {
    leerSucursales();
    const sucursal = catalog?.sucursales?.[indice];
    if (!sucursal) return;
    try {
      setStatus(els.branchStatus, "Detectando ubicación desde el link…");
      const coords = await resolverCoordenadasMapa(sucursal.mapLink);
      sucursal.lat = coords.lat;
      sucursal.lng = coords.lng;
      dirty = true;
      renderSucursales();
      programarAutoguardado();
      setStatus(els.branchStatus, `Ubicación detectada: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}. Guardá los cambios.`, "success");
    } catch (error) {
      setStatus(els.branchStatus, error.message, "error");
    }
  };

  const renderSucursales = () => {
    if (!els.branchList || !catalog) return;
    els.branchList.innerHTML = (catalog.sucursales || []).length
      ? catalog.sucursales
          .map(
            (sucursal, indice) => `
            <div class="cloud-branch-row" data-branch-row="${indice}">
              <label class="field">
                <span>Nombre</span>
                <input type="text" data-branch-name="${indice}" value="${escapeHTML(sucursal.nombre || "")}" maxlength="80" required>
              </label>
              <label class="field">
                <span>Localidad</span>
                <input type="text" data-branch-locality="${indice}" value="${escapeHTML(sucursal.localidad || "")}" maxlength="100" placeholder="Ciudad, zona">
              </label>
              <label class="field">
                <span>WhatsApp</span>
                <input type="tel" data-branch-phone="${indice}" value="${escapeHTML(sucursal.telefono || "")}" maxlength="30" placeholder="54911...">
              </label>
              <label class="field cloud-branch-map">
                <span>Link de Google Maps</span>
                <input type="url" data-branch-map="${indice}" value="${escapeHTML(sucursal.mapLink || "")}" placeholder="https://maps.app.goo.gl/...">
              </label>
              <div class="cloud-branch-coords">
                <button type="button" data-branch-detect="${indice}">Detectar</button>
                <span>${sucursal.lat !== undefined && sucursal.lat !== null ? "Ubicación lista" : "Sin ubicación"}</span>
              </div>
              <button class="cloud-danger" type="button" data-remove-branch="${indice}">Quitar</button>
            </div>`
          )
          .join("")
      : '<p class="cloud-muted">Todavía no hay sucursales.</p>';
  };

  const leerSucursales = () => {
    if (!els.branchList) return;
    const filas = [...els.branchList.querySelectorAll("[data-branch-row]")];
    catalog.sucursales = filas.map((fila, indice) => {
      const base = catalog.sucursales[indice] || {};
      return {
        ...base,
        nombre: fila.querySelector(`[data-branch-name="${indice}"]`)?.value.trim() || "",
        localidad: fila.querySelector(`[data-branch-locality="${indice}"]`)?.value.trim() || "",
        telefono: fila.querySelector(`[data-branch-phone="${indice}"]`)?.value.trim() || "",
        mapLink: fila.querySelector(`[data-branch-map="${indice}"]`)?.value.trim() || "",
      };
    });
  };

  const agregarSucursal = () => {
    if (!catalog) return;
    const base = "sucursal";
    let id = base;
    let sufijo = 2;
    while (catalog.sucursales.some((sucursal) => sucursal.id === id)) {
      id = `${base}-${sufijo++}`;
    }
    catalog.sucursales.push({ id, nombre: "Nueva sucursal", localidad: "", telefono: "" });
    dirty = true;
    renderSucursales();
    programarAutoguardado();
    setStatus(els.branchStatus, "Completá los datos y guardá los cambios.");
  };

  const guardarSucursales = async () => {
    if (!catalog) return;
    leerSucursales();
    const vacias = catalog.sucursales.filter((sucursal) => !sucursal.nombre);
    if (vacias.length) {
      setStatus(els.branchStatus, "Cada sucursal necesita un nombre.", "error");
      return;
    }
    setStatus(els.branchStatus, "Guardando sucursales…");
    const ok = await guardarBorrador();
    setStatus(
      els.branchStatus,
      ok ? "Sucursales guardadas en el borrador." : "No se pudieron guardar las sucursales.",
      ok ? "success" : "error"
    );
  };

  const descargarJSON = (nombre, payload) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const construirCopiaCatalogo = () => {
    const limpio = normalizarCatalogo(clone(catalog || {}));
    return {
      formato: "agresti-catalogo-backup",
      version: 1,
      exportadoEn: new Date().toISOString(),
      exportadoPor: currentUser?.email || "",
      resumen: {
        productos: limpio.productos.length,
        categorias: limpio.categorias.length,
        sucursales: limpio.sucursales.length,
      },
      catalogo: limpio,
    };
  };

  const fechaArchivoLocal = () => {
    const partes = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Argentina/Buenos_Aires",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date()).reduce((acc, parte) => {
      acc[parte.type] = parte.value;
      return acc;
    }, {});
    return `${partes.year}-${partes.month}-${partes.day}`;
  };

  const limpiarNombreCopia = (nombre) => {
    const limpio = String(nombre || "catalogo")
      .replace(/\.json$/i, "")
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);
    return limpio || "catalogo";
  };

  const nombreArchivoCopia = (nombre = "catalogo") =>
    `${fechaArchivoLocal()} - ${limpiarNombreCopia(nombre)}.json`;

  const actualizarMetaExportacion = () => {
    if (!els.exportCatalogMeta) return;
    if (!catalog) {
      els.exportCatalogMeta.textContent = "Cargando catálogo…";
      return;
    }
    els.exportCatalogMeta.textContent = `${catalog.productos.length} productos · ${catalog.categorias.length} categorías · ${catalog.sucursales.length} sucursales`;
  };

  const exportarCopiaCatalogo = () => {
    if (!catalog) return;
    try { commitFormulario(); } catch (error) {}
    const copia = construirCopiaCatalogo();
    descargarJSON(nombreArchivoCopia(els.exportCatalogName?.value || "catalogo"), copia);
    actualizarMetaExportacion();
    setStatus(els.exportCatalogStatus, `Copia descargada: ${copia.resumen.productos} productos y ${copia.resumen.categorias} categorías.`, "success");
    toast("Copia de seguridad descargada.");
  };

  const huellaTexto = (texto) => {
    let hash = 2166136261;
    for (let i = 0; i < texto.length; i += 1) {
      hash ^= texto.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return `${texto.length}-${hash >>> 0}`;
  };

  const formatearFechaHora = (valor) => {
    const fecha = valor?.toDate ? valor.toDate() : valor ? new Date(valor) : null;
    if (!fecha || Number.isNaN(fecha.getTime())) return "Sin fecha";
    return fecha.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
  };

  const registrarVersionCatalogo = async (motivo, forzar = false) => {
    if (!db || !catalog || !puede("herramientas")) return false;
    const limpio = normalizarCatalogo(clone(catalog));
    const json = JSON.stringify(limpio);
    const huella = huellaTexto(json);
    if (!forzar && huella === ultimaHuellaHistorial) return false;
    if (!forzar && Date.now() - ultimoTiempoHistorial < 5 * 60 * 1000) return false;
    try {
      await db.collection("catalogo_historial").add({
        json,
        fecha: firebase.firestore.FieldValue.serverTimestamp(),
        autor: currentUser?.email || "",
        motivo,
        resumen: {
          productos: limpio.productos.length,
          categorias: limpio.categorias.length,
          sucursales: limpio.sucursales.length,
        },
      });
      ultimaHuellaHistorial = huella;
      ultimoTiempoHistorial = Date.now();
      if (els.panelHerramientas && !els.panelHerramientas.hidden) cargarHistorialVersiones();
      return true;
    } catch (error) {
      return false;
    }
  };

  const cargarHistorialVersiones = async () => {
    if (!db || !els.catalogHistoryList) return;
    setStatus(els.catalogHistoryStatus, "Cargando historial…");
    try {
      const snap = await db.collection("catalogo_historial").orderBy("fecha", "desc").limit(12).get();
      const versiones = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      if (!versiones.length) {
        els.catalogHistoryList.innerHTML = '<p class="cloud-tool-empty">Todavía no hay versiones guardadas. Se crearán automáticamente al guardar o publicar.</p>';
        setStatus(els.catalogHistoryStatus, "Sin versiones todavía.");
        return;
      }
      els.catalogHistoryList.innerHTML = `
        <h4>Últimas versiones</h4>
        <ul>${versiones.map((version) => `
          <li>
            <span><strong>${escapeHTML(formatearFechaHora(version.fecha))}</strong><br>${escapeHTML(version.motivo || "Cambios")} · ${escapeHTML(version.autor || "admin")} · ${Number(version.resumen?.productos) || 0} productos</span>
            <button type="button" data-history-restore="${escapeHTML(version.id)}">Restaurar</button>
          </li>`).join("")}</ul>`;
      setStatus(els.catalogHistoryStatus, `${versiones.length} versión(es) más recientes.`);
    } catch (error) {
      els.catalogHistoryList.innerHTML = `<p class="cloud-tool-empty">No se pudo leer el historial: ${escapeHTML(error.message)}</p>`;
      setStatus(els.catalogHistoryStatus, "Error al cargar el historial.", "error");
    }
  };

  const aplicarCatalogoEnBorrador = async (catalogoImportado, statusEl) => {
    try {
      try { localStorage.setItem("agresti:catalogo-import-safety", JSON.stringify(construirCopiaCatalogo())); } catch (error) {}
      descargarJSON(nombreArchivoCopia("antes-de-restaurar"), construirCopiaCatalogo());
      catalog = catalogoImportado;
      selectedId = null;
      creating = false;
      query = "";
      filterCategory = "";
      categoriasAbiertas.clear();
      categoriasAbiertasInicializadas = false;
      if (els.searchProducts) els.searchProducts.value = "";
      if (els.categoryFilter) els.categoryFilter.value = "";
      mostrarFormulario(false);
      renderCategorias();
      renderSucursales();
      renderProductos();
      actualizarMetaExportacion();
      dirty = true;
      const guardado = await guardarBorrador(null, { silencioso: true });
      setStatus(
        statusEl,
        guardado ? "Versión restaurada y guardada en el borrador. Revisá y publicá cuando estés listo." : "Versión cargada en memoria, pero no se pudo guardar automáticamente.",
        guardado ? "success" : "error"
      );
      return guardado;
    } catch (error) {
      setStatus(statusEl, `No se pudo restaurar: ${error.message}`, "error");
      return false;
    }
  };

  const restaurarVersionHistorial = async (id) => {
    if (!db) return;
    try {
      const snap = await db.collection("catalogo_historial").doc(id).get();
      if (!snap.exists) throw new Error("La versión ya no existe.");
      const datos = JSON.parse(snap.data()?.json || "null");
      const importado = validarCopiaCatalogo(datos);
      if (!window.confirm(`¿Restaurar la versión del ${formatearFechaHora(snap.data().fecha)}? Reemplazará el borrador actual; antes se descargará una copia de seguridad.`)) return;
      await aplicarCatalogoEnBorrador(importado, els.catalogHistoryStatus);
      await cargarHistorialVersiones();
    } catch (error) {
      setStatus(els.catalogHistoryStatus, `No se pudo restaurar: ${error.message}`, "error");
    }
  };

  const cargarPublicacionAnterior = async () => {
    if (!db) return;
    if (els.restoreLastPublicationStatus) els.restoreLastPublicationStatus.textContent = "";
    try {
      const snap = await db.collection(CATALOG_DOC).doc("publicado_anterior").get();
      if (!snap.exists) {
        publicacionAnterior = null;
        if (els.restoreLastPublicationMeta) els.restoreLastPublicationMeta.textContent = "No hay una publicación anterior guardada.";
        if (els.restoreLastPublication) els.restoreLastPublication.disabled = true;
        return;
      }
      const datos = JSON.parse(snap.data()?.json || "null");
      publicacionAnterior = validarCopiaCatalogo(datos);
      if (els.restoreLastPublicationMeta) {
        els.restoreLastPublicationMeta.textContent = `${formatearFechaHora(snap.data().actualizado)} · ${publicacionAnterior.productos.length} productos · ${publicacionAnterior.categorias.length} categorías`;
      }
      if (els.restoreLastPublication) els.restoreLastPublication.disabled = false;
    } catch (error) {
      publicacionAnterior = null;
      if (els.restoreLastPublicationMeta) els.restoreLastPublicationMeta.textContent = `No se pudo leer la publicación anterior: ${error.message}`;
      if (els.restoreLastPublication) els.restoreLastPublication.disabled = true;
    }
  };

  const restaurarPublicacionAnterior = async () => {
    if (!publicacionAnterior || !db) return;
    if (!window.confirm("¿Restaurar la publicación anterior? Se reemplazará la web publicada y el borrador actual. Antes se descargará una copia de seguridad.")) return;
    try {
      if (els.restoreLastPublication) els.restoreLastPublication.disabled = true;
      const json = JSON.stringify(publicacionAnterior);
      const payload = { json, actualizadoPor: currentUser?.email || "" };
      await db.collection(CATALOG_DOC).doc(DRAFT_DOC).set({
        ...payload,
        actualizado: firebase.firestore.FieldValue.serverTimestamp(),
      });
      await db.collection(CATALOG_DOC).doc(PUBLISHED_DOC).set({
        ...payload,
        actualizado: firebase.firestore.FieldValue.serverTimestamp(),
      });
      try { localStorage.setItem("agresti:catalogo-import-safety", JSON.stringify(construirCopiaCatalogo())); } catch (error) {}
      descargarJSON(nombreArchivoCopia("antes-de-restaurar-publicacion"), construirCopiaCatalogo());
      catalog = publicacionAnterior;
      selectedId = null;
      creating = false;
      query = "";
      filterCategory = "";
      categoriasAbiertas.clear();
      categoriasAbiertasInicializadas = false;
      if (els.searchProducts) els.searchProducts.value = "";
      if (els.categoryFilter) els.categoryFilter.value = "";
      mostrarFormulario(false);
      renderCategorias();
      renderSucursales();
      renderProductos();
      actualizarMetaExportacion();
      dirty = false;
      registrarVersionCatalogo("Restauración de publicación anterior", true).catch(() => {});
      await cargarPublicacionAnterior();
      setStatus(els.restoreLastPublicationStatus, "Publicación anterior restaurada en la web y en el borrador.", "success");
      toast("Publicación anterior restaurada.");
    } catch (error) {
      setStatus(els.restoreLastPublicationStatus, `No se pudo restaurar: ${firebaseErrorMessage(error)}`, "error");
    } finally {
      if (els.restoreLastPublication) els.restoreLastPublication.disabled = !publicacionAnterior;
    }
  };

  const compararBorradorPublicado = async () => {
    if (!catalog) return;
    setStatus(els.compareCatalogStatus, "Leyendo la versión publicada…");
    try {
      const publicado = await leerDocumento(PUBLISHED_DOC);
      if (!publicado) throw new Error("Todavía no hay una versión publicada.");
      const borrador = normalizarCatalogo(clone(catalog));
      const publicadoNormal = normalizarCatalogo(publicado);
      const comparar = (a, b, etiqueta) => {
        const mapaA = new Map(a.map((item) => [item.id, item]));
        const mapaB = new Map(b.map((item) => [item.id, item]));
        const agregados = [...mapaA.values()].filter((item) => !mapaB.has(item.id));
        const eliminados = [...mapaB.values()].filter((item) => !mapaA.has(item.id));
        const modificados = [...mapaA.values()].filter((item) => mapaB.has(item.id) && JSON.stringify(item) !== JSON.stringify(mapaB.get(item.id)));
        return { etiqueta, agregados, eliminados, modificados };
      };
      const grupos = [
        comparar(borrador.productos, publicadoNormal.productos, "Productos"),
        comparar(borrador.categorias, publicadoNormal.categorias, "Categorías"),
        comparar(borrador.sucursales, publicadoNormal.sucursales, "Sucursales"),
      ];
      const total = grupos.reduce((n, grupo) => n + grupo.agregados.length + grupo.eliminados.length + grupo.modificados.length, 0);
      if (!total) {
        els.compareCatalogResult.innerHTML = '<p class="cloud-tool-empty">El borrador es idéntico a la versión publicada.</p>';
        setStatus(els.compareCatalogStatus, "Sin diferencias.", "success");
        return;
      }
      const html = grupos.map((grupo) => {
        const items = [];
        grupo.agregados.slice(0, 10).forEach((item) => items.push(`<li><span><span class="cloud-tool-add">+</span> ${escapeHTML(item.nombre || item.id)}</span><small>Nuevo</small></li>`));
        grupo.eliminados.slice(0, 10).forEach((item) => items.push(`<li><span><span class="cloud-tool-del">−</span> ${escapeHTML(item.nombre || item.id)}</span><small>Se quitaría</small></li>`));
        grupo.modificados.slice(0, 10).forEach((item) => items.push(`<li><span><span class="cloud-tool-bad">~</span> ${escapeHTML(item.nombre || item.id)}</span><small>Modificado</small></li>`));
        const restantes = Math.max(0, grupo.agregados.length + grupo.eliminados.length + grupo.modificados.length - items.length);
        return items.length ? `<h4>${grupo.etiqueta}</h4><ul>${items.join("")}${restantes ? `<li class="cloud-tool-empty">+${restantes} cambios más…</li>` : ""}</ul>` : "";
      }).join("");
      els.compareCatalogResult.innerHTML = html;
      setStatus(els.compareCatalogStatus, `${total} diferencia(s) entre el borrador y lo publicado.`);
    } catch (error) {
      els.compareCatalogResult.innerHTML = `<p class="cloud-tool-empty">${escapeHTML(error.message)}</p>`;
      setStatus(els.compareCatalogStatus, "No se pudo comparar.", "error");
    }
  };

  const comprobarImagen = (src) => new Promise((resolve) => {
    const imagen = new Image();
    let terminado = false;
    const terminar = (ok) => {
      if (terminado) return;
      terminado = true;
      imagen.onload = null;
      imagen.onerror = null;
      resolve(ok);
    };
    const timer = window.setTimeout(() => terminar(false), 8000);
    imagen.onload = () => { window.clearTimeout(timer); terminar(true); };
    imagen.onerror = () => { window.clearTimeout(timer); terminar(false); };
    imagen.src = imageURL(src);
  });

  const auditarCatalogo = async () => {
    if (!catalog) return;
    setStatus(els.auditCatalogStatus, "Revisando catálogo e imágenes…");
    const sinFoto = [];
    const sinPrecio = [];
    const sinCategoria = [];
    const idsCategorias = new Set(catalog.categorias.map((categoria) => categoria.id));
    const imagenes = [];
    catalog.productos.forEach((producto) => {
      if (!(producto.imagenes || []).some((imagen) => imagen?.src)) sinFoto.push(producto);
      if (!producto.precio || /consultar/i.test(String(producto.precio))) sinPrecio.push(producto);
      if (!producto.categoria || !idsCategorias.has(producto.categoria)) sinCategoria.push(producto);
      (producto.imagenes || []).forEach((imagen) => { if (imagen?.src) imagenes.push({ producto, src: imagen.src }); });
    });
    const unicas = [...new Map(imagenes.map((item) => [item.src, item])).values()].slice(0, 100);
    const rotas = [];
    let siguiente = 0;
    const trabajadores = Array.from({ length: 6 }, async () => {
      while (siguiente < unicas.length) {
        const actual = unicas[siguiente++];
        const ok = await comprobarImagen(actual.src);
        if (!ok) rotas.push(actual);
      }
    });
    await Promise.all(trabajadores);
    const renderGrupo = (titulo, productos, tipo = "warning") => {
      if (!productos.length) return "";
      const items = productos.slice(0, 20).map((producto) => `<li><span><strong>${escapeHTML(producto.nombre || producto.id)}</strong><br><small>${escapeHTML(producto.id)}</small></span><button type="button" data-audit-edit="${escapeHTML(producto.id)}">Editar</button></li>`).join("");
      return `<h4>${titulo} (${productos.length})</h4><ul>${items}${productos.length > 20 ? `<li class="cloud-tool-empty">+${productos.length - 20} más…</li>` : ""}</ul>`;
    };
    const html = [
      renderGrupo("Sin foto", sinFoto),
      renderGrupo("Sin precio", sinPrecio),
      renderGrupo("Sin categoría válida", sinCategoria),
      renderGrupo("Imágenes rotas", [...new Map(rotas.map((item) => [item.producto.id, item.producto])).values()]),
    ].filter(Boolean).join("");
    els.auditCatalogResult.innerHTML = html || '<p class="cloud-tool-empty">No se encontraron problemas.</p>';
    const total = sinFoto.length + sinPrecio.length + sinCategoria.length + rotas.length;
    setStatus(els.auditCatalogStatus, total ? `${total} problema(s) encontrados.` : "Catálogo sin problemas detectados.", total ? "error" : "success");
  };

  const recolectarImagenesCatalogo = () => {
    const registros = [];
    catalog.productos.forEach((producto) => {
      (producto.imagenes || []).forEach((imagen) => { if (imagen?.src) registros.push({ tipo: "producto", producto, imagen, src: imagen.src }); });
    });
    (catalog.categorias || []).forEach((categoria) => { if (categoria.portada && categoria.portada !== "auto") registros.push({ tipo: "categoria", categoria, src: categoria.portada }); });
    return registros;
  };

  const medirImagen = async (src) => {
    try {
      const respuesta = await fetch(imageURL(src), { method: "HEAD", cache: "no-store" });
      if (respuesta.ok) {
        const tamano = Number(respuesta.headers.get("content-length") || 0);
        if (tamano > 0) return tamano;
      }
      const completa = await fetch(imageURL(src), { cache: "no-store" });
      if (!completa.ok) return null;
      return (await completa.blob()).size;
    } catch (error) {
      return null;
    }
  };

  const transformarCloudinary = (src) => {
    const url = imageURL(src);
    if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return null;
    const [base, resto] = url.split("/upload/");
    if (!/^v\d+\//.test(resto)) return null;
    return `${base}/upload/f_auto,q_auto,w_1400,c_limit/${resto}`;
  };

  const escanearImagenesPesadas = async () => {
    if (!catalog) return;
    setStatus(els.heavyImagesStatus, "Midiendo imágenes…");
    imagenesPesadas = [];
    const registros = recolectarImagenesCatalogo();
    const unicos = [...new Map(registros.map((item) => [item.src, item])).values()].slice(0, 90);
    let siguiente = 0;
    const trabajadores = Array.from({ length: 6 }, async () => {
      while (siguiente < unicos.length) {
        const actual = unicos[siguiente++];
        const tamano = await medirImagen(actual.src);
        if (tamano && tamano > 300 * 1024) imagenesPesadas.push({ ...actual, tamano });
      }
    });
    await Promise.all(trabajadores);
    imagenesPesadas.sort((a, b) => b.tamano - a.tamano);
    if (!imagenesPesadas.length) {
      els.heavyImagesResult.innerHTML = '<p class="cloud-tool-empty">No se detectaron fotos de más de 300 KB.</p>';
      if (els.optimizeHeavyImages) els.optimizeHeavyImages.hidden = true;
      setStatus(els.heavyImagesStatus, "Todas las fotos están por debajo de 300 KB.", "success");
      return;
    }
    els.heavyImagesResult.innerHTML = `<h4>Fotos pesadas (${imagenesPesadas.length})</h4><ul>${imagenesPesadas.slice(0, 20).map((item) => {
      const nombre = item.tipo === "producto" ? item.producto.nombre : item.categoria.nombre;
      return `<li><span><strong>${escapeHTML(nombre || "Sin nombre")}</strong><br><small>${Math.round(item.tamano / 1024)} KB</small></span></li>`;
    }).join("")}</ul>`;
    if (els.optimizeHeavyImages) els.optimizeHeavyImages.hidden = false;
    setStatus(els.heavyImagesStatus, `${imagenesPesadas.length} foto(s) pesada(s) detectada(s).`);
  };

  const optimizarImagenesPesadas = async () => {
    if (!imagenesPesadas.length) return;
    if (!window.confirm(`¿Optimizar ${imagenesPesadas.length} foto(s) pesada(s)? Se modificarán las URLs del catálogo; no se publica automáticamente.`)) return;
    setStatus(els.heavyImagesStatus, "Optimizando imágenes…");
    let optimizadas = 0;
    const cambios = new Map();
    try {
      for (const item of imagenesPesadas) {
        const nueva = transformarCloudinary(item.src);
        if (nueva) cambios.set(item.src, nueva);
      }
      if (!cambios.size) {
        setStatus(els.heavyImagesStatus, "Las fotos pesadas no son de Cloudinary y no se pueden optimizar automáticamente desde acá.", "error");
        return;
      }
      catalog.productos.forEach((producto) => {
        (producto.imagenes || []).forEach((imagen) => {
          if (cambios.has(imagen.src)) { imagen.src = cambios.get(imagen.src); optimizadas += 1; }
        });
      });
      catalog.categorias.forEach((categoria) => {
        if (cambios.has(categoria.portada)) { categoria.portada = cambios.get(categoria.portada); optimizadas += 1; }
      });
      dirty = true;
      const guardado = await guardarBorrador(null, { silencioso: true });
      if (guardado) {
        els.heavyImagesResult.innerHTML = `<p class="cloud-tool-empty">${optimizadas} imagen(es) optimizada(s). Guardá y publicá cuando quieras.</p>`;
        setStatus(els.heavyImagesStatus, `${optimizadas} imagen(es) actualizadas a versiones optimizadas de Cloudinary.`, "success");
      } else {
        setStatus(els.heavyImagesStatus, "Las imágenes se actualizaron en memoria, pero no se pudo guardar el borrador.", "error");
      }
    } catch (error) {
      setStatus(els.heavyImagesStatus, `No se pudieron optimizar: ${error.message}`, "error");
    }
  };

  const validarCopiaCatalogo = (archivo) => {
    const datos = archivo?.catalogo || archivo?.borrador || archivo;
    if (!datos || typeof datos !== "object") throw new Error("El archivo no contiene un catálogo válido.");
    if (!Array.isArray(datos.productos) || !Array.isArray(datos.categorias)) {
      throw new Error("Faltan las listas de productos o categorías.");
    }
    if (datos.productos.length > 5000 || datos.categorias.length > 2000) throw new Error("El archivo es demasiado grande.");
    const idsCategorias = new Set();
    datos.categorias.forEach((categoria) => {
      if (!categoria || typeof categoria.id !== "string" || !categoria.id.trim()) throw new Error("Hay una categoría sin ID válido.");
      if (idsCategorias.has(categoria.id)) throw new Error(`ID de categoría duplicado: ${categoria.id}`);
      if (typeof categoria.nombre !== "string" || !categoria.nombre.trim()) throw new Error(`La categoría ${categoria.id} no tiene nombre.`);
      idsCategorias.add(categoria.id);
    });
    datos.categorias.forEach((categoria) => {
      if (categoria.padre && !idsCategorias.has(categoria.padre)) throw new Error(`La categoría ${categoria.nombre} apunta a una categoría padre inexistente.`);
      let actual = categoria.padre;
      let guard = 0;
      const visitadas = new Set();
      while (actual && guard < 100) {
        if (visitadas.has(actual) || actual === categoria.id) throw new Error("Las categorías contienen una jerarquía circular.");
        visitadas.add(actual);
        actual = datos.categorias.find((item) => item.id === actual)?.padre;
        guard += 1;
      }
    });
    const idsProductos = new Set();
    datos.productos.forEach((producto) => {
      if (!producto || typeof producto.id !== "string" || !producto.id.trim()) throw new Error("Hay un producto sin ID válido.");
      if (idsProductos.has(producto.id)) throw new Error(`ID de producto duplicado: ${producto.id}`);
      idsProductos.add(producto.id);
      const categorias = Array.isArray(producto.categorias) && producto.categorias.length ? producto.categorias : [producto.categoria].filter(Boolean);
      categorias.forEach((id) => {
        if (id && !idsCategorias.has(id)) throw new Error(`El producto ${producto.nombre || producto.id} usa una categoría inexistente.`);
      });
    });
    const normalizado = normalizarCatalogo(clone(datos));
    migrarIdsProductos(normalizado);
    if (JSON.stringify(normalizado).length > 900000) throw new Error("El catálogo supera el tamaño permitido por Firestore.");
    return normalizado;
  };

  const cancelarImportacion = () => {
    importacionPendiente = null;
    if (els.importCatalogPreview) els.importCatalogPreview.hidden = true;
    if (els.importCatalogFile) els.importCatalogFile.value = "";
    if (els.importCatalogStatus) els.importCatalogStatus.textContent = "";
  };

  const prepararImportacion = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setStatus(els.importCatalogStatus, "El archivo supera los 5 MB.", "error");
      return;
    }
    setStatus(els.importCatalogStatus, "Leyendo y validando la copia…");
    try {
      const texto = await file.text();
      let archivo;
      try { archivo = JSON.parse(texto); } catch (error) { throw new Error("El archivo no es un JSON válido."); }
      const catalogoImportado = validarCopiaCatalogo(archivo);
      importacionPendiente = { catalogo: catalogoImportado, archivo, file };
      const fecha = archivo?.exportadoEn ? new Date(archivo.exportadoEn).toLocaleString("es-AR") : "sin fecha";
      if (els.importCatalogName) els.importCatalogName.textContent = file.name;
      if (els.importCatalogMeta) {
        els.importCatalogMeta.textContent = `${catalogoImportado.productos.length} productos · ${catalogoImportado.categorias.length} categorías · ${catalogoImportado.sucursales.length} sucursales · Exportado: ${fecha}`;
      }
      if (els.importCatalogPreview) els.importCatalogPreview.hidden = false;
      setStatus(els.importCatalogStatus, "Copia validada. Confirmá la restauración para reemplazar el borrador.", "success");
    } catch (error) {
      cancelarImportacion();
      setStatus(els.importCatalogStatus, `No se puede importar: ${error.message}`, "error");
    }
  };

  const confirmarImportacion = async () => {
    if (!importacionPendiente) return;
    const importado = importacionPendiente.catalogo;
    try {
      try {
        localStorage.setItem("agresti:catalogo-import-safety", JSON.stringify(construirCopiaCatalogo()));
      } catch (error) {}
      descargarJSON(nombreArchivoCopia("antes-de-importar"), construirCopiaCatalogo());
      catalog = importado;
      selectedId = null;
      creating = false;
      query = "";
      filterCategory = "";
      categoriasAbiertas.clear();
      categoriasAbiertasInicializadas = false;
      if (els.searchProducts) els.searchProducts.value = "";
      if (els.categoryFilter) els.categoryFilter.value = "";
      mostrarFormulario(false);
      renderCategorias();
      renderSucursales();
      renderProductos();
      actualizarMetaExportacion();
      dirty = true;
      importacionPendiente = null;
      if (els.importCatalogPreview) els.importCatalogPreview.hidden = true;
      if (els.importCatalogFile) els.importCatalogFile.value = "";
      const guardado = await guardarBorrador(null, { silencioso: true });
      setStatus(
        els.importCatalogStatus,
        guardado
          ? "Copia restaurada y guardada en el borrador. Revisá el catálogo y publicá cuando estés listo."
          : "Copia cargada en memoria, pero no se pudo guardar automáticamente. Guardá el borrador manualmente.",
        guardado ? "success" : "error"
      );
      toast(guardado ? "Copia restaurada en el borrador." : "Restaurada, pero falta guardar el borrador.", guardado ? "success" : "error");
    } catch (error) {
      setStatus(els.importCatalogStatus, `No se pudo restaurar: ${error.message}`, "error");
    }
  };

  const activarCloudTab = (nombre) => {
    if (!tabPermitida(nombre)) {
      const primera = primerTabPermitida();
      if (!primera) return;
      nombre = primera;
    }
    document.querySelectorAll("[data-cloud-tab]").forEach((tab) => {
      const activo = tab.dataset.cloudTab === nombre;
      tab.setAttribute("aria-selected", String(activo));
      tab.tabIndex = activo ? 0 : -1;
    });
    const paneles = {
      productos: $("#panelProductos"),
      categorias: $("#panelCategorias"),
      sucursales: $("#panelSucursales"),
      pedidos: $("#panelPedidos"),
      instagram: $("#panelInstagram"),
      etiquetas: $("#panelEtiquetas"),
      herramientas: $("#panelHerramientas"),
    };
    Object.entries(paneles).forEach(([clave, panel]) => {
      if (panel) panel.hidden = clave !== nombre;
    });
    if (nombre === "categorias") renderCategorias();
    if (nombre === "sucursales") renderSucursales();
    if (nombre === "pedidos") cargarPedidos();
    if (nombre === "herramientas") {
      actualizarMetaExportacion();
      cargarHistorialVersiones();
      cargarPublicacionAnterior();
      if (currentAccess?.principal) cargarEditores();
      if (!els.compareCatalogResult?.innerHTML) els.compareCatalogResult.innerHTML = "";
      if (!els.auditCatalogResult?.innerHTML) els.auditCatalogResult.innerHTML = "";
    }
    const panelActivo = paneles[nombre];
    const iframe = panelActivo?.querySelector("iframe[data-src]");
    if (iframe && !iframe.getAttribute("src")) {
      panelActivo.classList.remove("is-ready");
      iframe.addEventListener(
        "load",
        () => panelActivo.classList.add("is-ready"),
        { once: true }
      );
      iframe.src = iframe.dataset.src;
    } else if (iframe) {
      panelActivo.classList.add("is-ready");
    }
    if (nombre === "productos" && selectedId) {
      const producto = catalog?.productos?.find((item) => item.id === selectedId);
      if (producto) renderBranches(producto);
    }
  };

  const activarFormTab = (nombre) => {
    if (nombre === "resenas") cargarResenasPendientes();
    document.querySelectorAll("[data-form-tab]").forEach((tab) => {
      const activo = tab.dataset.formTab === nombre;
      tab.setAttribute("aria-selected", String(activo));
      tab.tabIndex = activo ? 0 : -1;
    });
    document.querySelectorAll("[data-form-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.formPanel !== nombre;
    });
  };

  const duplicarProducto = () => {
    if (!catalog || !selectedId) return;
    const base = catalog.productos.find((producto) => producto.id === selectedId);
    if (!base) return;
    const baseId = `${base.id}-copia`;
    let id = baseId;
    let sufijo = 2;
    while (catalog.productos.some((producto) => producto.id === id)) {
      id = `${baseId}-${sufijo++}`;
    }
    const copia = {
      ...JSON.parse(JSON.stringify(base)),
      id,
      nombre: `${base.nombre} (copia)`,
    };
    catalog.productos.unshift(copia);
    selectedId = id;
    creating = false;
    dirty = true;
    editarProducto(id);
    programarAutoguardado();
    toast("Producto duplicado. Guardá el borrador para confirmarlo.");
  };


  const ESTADOS_PEDIDO = [
    ["pendiente", "Pedido recibido"],
    ["confirmado", "Confirmado"],
    ["en_produccion", "En producción"],
    ["listo", "Listo"],
    ["enviado", "Enviado"],
    ["entregado", "Entregado"],
    ["cancelado", "Cancelado"],
  ];

  const cargarPedidos = async () => {
    if (!db || !els.pedidosList) return;
    try {
      setStatus(els.pedidosStatus, "Cargando pedidos…");
      const snap = await db.collection("pedidos").orderBy("creado", "desc").limit(50).get();
      if (snap.empty) {
        els.pedidosList.innerHTML = '<p class="cloud-muted">Todavía no hay pedidos con seguimiento.</p>';
        setStatus(els.pedidosStatus, "");
        return;
      }
      els.pedidosList.innerHTML = snap.docs
        .map((doc) => {
          const pedido = doc.data();
          const items = Array.isArray(pedido.items) ? pedido.items : [];
          const fecha = pedido.creado?.toDate ? pedido.creado.toDate().toLocaleString("es-AR") : "";
          const opciones = ESTADOS_PEDIDO.map(
            ([valor, label]) => `<option value="${valor}" ${pedido.estado === valor ? "selected" : ""}>${label}</option>`
          ).join("");
          return `<article class="cloud-order" data-order="${escapeHTML(doc.id)}">
            <div class="cloud-order__head">
              <strong>${escapeHTML(pedido.codigo || doc.id)}</strong>
              <small>${escapeHTML(fecha)}</small>
            </div>
            <ul>${items.map((item) => `<li>${escapeHTML(item.nombre || "Producto")} ×${item.cantidad || 1}</li>`).join("")}</ul>
            <div class="cloud-order__foot">
              <span>Total: $${Number(pedido.total || 0).toLocaleString("es-AR")}</span>
              <label>Estado <select data-order-status>${opciones}</select></label>
              <button class="btn btn--primary" type="button" data-save-order>Guardar estado</button>
            </div>
          </article>`;
        })
        .join("");
      setStatus(els.pedidosStatus, `${snap.size} pedido(s).`, "success");
    } catch (error) {
      setStatus(els.pedidosStatus, `No se pudieron cargar: ${firebaseErrorMessage(error)}`, "error");
    }
  };

  const guardarEstadoPedido = async (boton) => {
    const fila = boton.closest("[data-order]");
    const codigo = fila?.dataset.order;
    const estado = fila?.querySelector("[data-order-status]")?.value;
    if (!codigo || !estado) return;
    boton.disabled = true;
    try {
      await db.collection("pedidos").doc(codigo).update({
        estado,
        actualizado: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setStatus(els.pedidosStatus, "Estado actualizado. El cliente ya puede verlo.", "success");
    } catch (error) {
      setStatus(els.pedidosStatus, `No se actualizó: ${firebaseErrorMessage(error)}`, "error");
    } finally {
      boton.disabled = false;
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
    if (els.newProductMobile) els.newProductMobile.addEventListener("click", nuevoProducto);
    if (els.backToProducts) els.backToProducts.addEventListener("click", volverListaProductos);
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
        const detectar = event.target.closest("[data-branch-detect]");
        if (detectar) {
          detectarUbicacionSucursal(Number(detectar.dataset.branchDetect));
          return;
        }
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
        const fotoBoton = event.target.closest("[data-variant-photo]");
        if (fotoBoton) {
          abrirSelectorFotoVariante(Number(fotoBoton.dataset.variantPhoto));
          return;
        }
        const quitarFoto = event.target.closest("[data-remove-variant-photo]");
        if (quitarFoto) {
          const indice = Number(quitarFoto.dataset.removeVariantPhoto);
          const filas = [...els.variantList.querySelectorAll("[data-variant-row]")];
          const valores = filas.map((fila, i) => {
            const imagen = fila.dataset.variantImage || "";
            const stockTexto = fila.querySelector(`[data-variant-stock="${i}"]`)?.value.trim() || "";
            const stock = Number.parseInt(stockTexto, 10);
            return {
              nombre: fila.querySelector(`[data-variant-name="${i}"]`)?.value.trim() || "",
              precio: fila.querySelector(`[data-variant-price="${i}"]`)?.value.trim() || "",
              ...(imagen ? { imagen } : {}),
              ...(Number.isInteger(stock) && stock >= 0 ? { stock } : {}),
            };
          });
          if (valores[indice]) delete valores[indice].imagen;
          const producto = catalog?.productos?.find((item) => item.id === selectedId);
          if (producto) {
            producto.variantes = valores;
            dirty = true;
            renderVariantes(producto);
            programarAutoguardado();
          }
          return;
        }
        const boton = event.target.closest("[data-remove-variant]");
        if (!boton) return;
        const filas = [...els.variantList.querySelectorAll("[data-variant-row]")];
        const valores = filas.map((fila, indice) => {
          const imagen = fila.dataset.variantImage || "";
          const stockTexto = fila.querySelector(`[data-variant-stock="${indice}"]`)?.value.trim() || "";
          const stock = Number.parseInt(stockTexto, 10);
          return {
            nombre: fila.querySelector(`[data-variant-name="${indice}"]`)?.value.trim() || "",
            precio: fila.querySelector(`[data-variant-price="${indice}"]`)?.value.trim() || "",
            ...(imagen ? { imagen } : {}),
            ...(Number.isInteger(stock) && stock >= 0 ? { stock } : {}),
          };
        });
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
    if (els.variantImageChoices) {
      els.variantImageChoices.addEventListener("click", (event) => {
        const boton = event.target.closest("[data-variant-image-choice]");
        if (boton) asignarImagenVariante(boton.dataset.variantImageChoice);
      });
    }
    if (els.variantImageUpload) {
      els.variantImageUpload.addEventListener("click", () => {
        varianteFotoPendiente = varianteImagenIndice;
        cerrarSelectorFotoVariante();
        if (els.variantPhotoFile) {
          els.variantPhotoFile.value = "";
          els.variantPhotoFile.click();
        }
      });
    }
    if (els.variantImageRemove) els.variantImageRemove.addEventListener("click", quitarImagenVariante);
    if (els.variantImageClose) els.variantImageClose.addEventListener("click", cerrarSelectorFotoVariante);
    if (els.variantImageCancel) els.variantImageCancel.addEventListener("click", cerrarSelectorFotoVariante);
    els.variantImageDialog?.addEventListener("click", (event) => {
      if (event.target === els.variantImageDialog) cerrarSelectorFotoVariante();
    });
    if (els.variantPhotoFile) {
      els.variantPhotoFile.addEventListener("change", () => {
        const file = els.variantPhotoFile.files?.[0];
        const indice = varianteFotoPendiente;
        varianteFotoPendiente = null;
        if (file && Number.isInteger(indice)) procesarFotoVariante(file, indice);
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
    const seleccionarHerramientaRecorte = (modo) => {
      if (!editorRecorteState) return;
      editorRecorteState.brushMode = modo;
      editorRecorteState.panMode = false;
      els.imageEditorPanToggle?.classList.remove("is-active");
      if (els.imageEditorCanvas) els.imageEditorCanvas.style.cursor = "none";
      if (els.imageBrushCursor) els.imageBrushCursor.dataset.mode = modo;
      els.imageEditorTools?.querySelectorAll("[data-brush]").forEach((boton) => boton.classList.toggle("is-active", boton.dataset.brush === modo));
      ocultarCursorBrocha();
    };
    const deshacerRecorte = () => {
      const estado = editorRecorteState;
      if (!estado) return;
      const anterior = estado.undo.pop();
      if (!anterior) return;
      estado.data.data.set(anterior.data);
      estado.ctx.putImageData(estado.data, 0, 0);
    };
    const alternarMoverRecorte = () => {
      if (!editorRecorteState) return;
      editorRecorteState.panMode = !editorRecorteState.panMode;
      els.imageEditorPanToggle?.classList.toggle("is-active", editorRecorteState.panMode);
      if (els.imageEditorCanvas) els.imageEditorCanvas.style.cursor = editorRecorteState.panMode ? "grab" : "none";
      ocultarCursorBrocha();
    };
    const centrarVistaRecorte = () => {
      if (!editorRecorteState) return;
      editorRecorteState.panX = 0;
      editorRecorteState.panY = 0;
      aplicarVistaRecorte();
    };

    if (els.imageEditorCanvas) {
      const canvas = els.imageEditorCanvas;
      canvas.addEventListener("pointerenter", (event) => mostrarCursorBrocha(event));
      canvas.addEventListener("pointerdown", (event) => {
        if (!editorRecorteState) return;
        event.preventDefault();
        canvas.setPointerCapture?.(event.pointerId);
        if (editorRecorteState.panMode) {
          editorRecorteState.panning = true;
          editorRecorteState.panStart = { x: event.clientX, y: event.clientY, panX: editorRecorteState.panX, panY: editorRecorteState.panY };
          canvas.style.cursor = "grabbing";
          ocultarCursorBrocha();
          return;
        }
        editorRecorteState.drawing = true;
        editorRecorteState.undo.push(new ImageData(new Uint8ClampedArray(editorRecorteState.data.data), canvas.width, canvas.height));
        if (editorRecorteState.undo.length > 12) editorRecorteState.undo.shift();
        mostrarCursorBrocha(event);
        pintarRecorte(event.clientX, event.clientY);
      });
      canvas.addEventListener("pointermove", (event) => {
        const estado = editorRecorteState;
        if (estado?.panning && estado.panStart) {
          estado.panX = estado.panStart.panX + (event.clientX - estado.panStart.x);
          estado.panY = estado.panStart.panY + (event.clientY - estado.panStart.y);
          aplicarVistaRecorte();
          return;
        }
        mostrarCursorBrocha(event);
        if (estado?.drawing) pintarRecorte(event.clientX, event.clientY);
      });
      const terminarTrazo = () => {
        if (!editorRecorteState) return;
        editorRecorteState.drawing = false;
        editorRecorteState.panning = false;
        editorRecorteState.panStart = null;
        canvas.style.cursor = editorRecorteState.panMode ? "grab" : "none";
      };
      canvas.addEventListener("pointerup", terminarTrazo);
      canvas.addEventListener("pointercancel", terminarTrazo);
      canvas.addEventListener("pointerleave", () => { terminarTrazo(); ocultarCursorBrocha(); });
    }
    if (els.imageEditorTools) {
      els.imageEditorTools.addEventListener("click", (event) => {
        const boton = event.target.closest("[data-brush]");
        if (!boton || !editorRecorteState) return;
        seleccionarHerramientaRecorte(boton.dataset.brush === "erase" ? "erase" : "restore");
      });
    }
    if (els.imageBrushSize) els.imageBrushSize.addEventListener("input", actualizarCursorBrocha);
    if (els.imageBrushZoom) {
      els.imageBrushZoom.addEventListener("input", () => {
        if (!editorRecorteState) return;
        editorRecorteState.zoom = Math.max(0.5, Math.min(4, Number(els.imageBrushZoom.value) / 100));
        aplicarVistaRecorte();
      });
    }
    if (els.imageEditorPanToggle) {
      els.imageEditorPanToggle.addEventListener("click", () => {
        if (!editorRecorteState) return;
        alternarMoverRecorte();
      });
    }
    if (els.imageEditorViewReset) {
      els.imageEditorViewReset.addEventListener("click", () => {
        if (!editorRecorteState) return;
        centrarVistaRecorte();
      });
    }
    if (els.imageEditorUndo) {
      els.imageEditorUndo.addEventListener("click", () => {
        deshacerRecorte();
      });
    }
    document.addEventListener("keydown", (event) => {
      if (!editorRecorteState || !els.imageEditorDialog?.open) return;
      if (els.imageLightbox?.open || els.imageFrameDialog?.open) return;
      const etiqueta = event.target?.tagName;
      if (etiqueta === "INPUT" || etiqueta === "TEXTAREA" || etiqueta === "SELECT" || event.target?.isContentEditable) return;
      const acciones = {
        r: () => seleccionarHerramientaRecorte("restore"),
        b: () => seleccionarHerramientaRecorte("erase"),
        d: deshacerRecorte,
        m: alternarMoverRecorte,
        c: centrarVistaRecorte,
      };
      const accion = acciones[event.key.toLowerCase()];
      if (!accion) return;
      event.preventDefault();
      accion();
    });
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
        editorEncuadreState.zoom = Math.max(0.5, Math.min(3, Number(els.imageFrameZoom.value) / 100));
        if (els.imageFrameZoomValue) els.imageFrameZoomValue.textContent = `${els.imageFrameZoom.value}%`;
        renderizarEncuadre();
      });
    }
    if (els.imageFrameRotate) {
      els.imageFrameRotate.addEventListener("input", () => {
        if (!editorEncuadreState) return;
        editorEncuadreState.rotation = Number(els.imageFrameRotate.value) || 0;
        if (els.imageFrameRotateValue) els.imageFrameRotateValue.textContent = `${editorEncuadreState.rotation}°`;
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
      editorEncuadreState.rotation = 0;
      editorEncuadreState.offsetX = 0;
      editorEncuadreState.offsetY = 0;
      if (els.imageFrameZoom) els.imageFrameZoom.value = "100";
      if (els.imageFrameZoomValue) els.imageFrameZoomValue.textContent = "100%";
      if (els.imageFrameRotate) els.imageFrameRotate.value = "0";
      if (els.imageFrameRotateValue) els.imageFrameRotateValue.textContent = "0°";
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
    els.imageFrameBack?.addEventListener("click", () => finalizarEditorEncuadre("volver"));
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
