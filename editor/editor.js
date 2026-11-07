(() => {
  "use strict";

  const CONFIG = window.AGRESTI_CLOUD || {};
  const FIREBASE_CONFIG = CONFIG.firebase || {};
  const ADMIN_EMAIL = String(CONFIG.adminEmail || "").toLowerCase();
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
    imageList: $("#imageList"),
    imageStatus: $("#imageStatus"),
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
    toast: $("#toast"),
    importCatalog: $("#importCatalog"),
    importStatus: $("#importStatus"),
  };

  let auth = null;
  let db = null;
  let currentUser = null;
  let catalog = null;
  let selectedId = null;
  let creating = false;
  let query = "";
  let filterCategory = "";
  let dirty = false;
  let saving = false;
  let removeBackgroundPromise = null;
  let toastTimer = null;
  let loginNotice = "";
  let importing = false;
  let autosaveTimer = null;

  const programarAutoguardado = () => {
    window.clearTimeout(autosaveTimer);
    if (!auth?.currentUser || saving || importing) return;
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

  const verificarAdmin = (user) => {
    const email = String(user?.email || "").toLowerCase();
    return Boolean(ADMIN_EMAIL) && email === ADMIN_EMAIL;
  };

  const manejarSesion = async (user) => {
    currentUser = user;
    if (!user) {
      mostrarLogin(loginNotice, Boolean(loginNotice));
      loginNotice = "";
      return;
    }
    if (!verificarAdmin(user)) {
      loginNotice = "Esta cuenta no es administradora del catálogo.";
      await auth.signOut();
      mostrarLogin(loginNotice, true);
      return;
    }
    if (els.userEmail) els.userEmail.textContent = user.email;
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
    selectedId = null;
    creating = false;
    query = "";
    if (els.searchProducts) els.searchProducts.value = "";
    renderCategorias();
    renderSucursales();
    renderProductos();
    mostrarFormulario(false);
    activarFormTab("medios");
    activarCloudTab("productos");
    setStatus(els.saveStatus, `Catálogo cargado desde ${origen}.`);
    dirty = false;
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
    if (els.categoryList) {
      const esDescendiente = (id, posiblePadre) => {
        let actual = posiblePadre;
        let guard = 0;
        while (actual && guard < 30) {
          if (actual === id) return true;
          actual = catalog.categorias.find((categoria) => categoria.id === actual)?.padre;
          guard += 1;
        }
        return false;
      };
      els.categoryList.innerHTML = opciones.length
        ? opciones
            .map((categoria) => {
              const productos = catalog.productos.filter((producto) => categoriasProducto(producto).includes(categoria.id)).length;
              const padres = opciones.filter(
                (opcion) => opcion.id !== categoria.id && !esDescendiente(categoria.id, opcion.id)
              );
              return `
                <div class="cloud-category">
                  <input class="cloud-category__name" type="text" data-category-name="${escapeHTML(categoria.id)}" value="${escapeHTML(categoria.nombre)}" maxlength="60" aria-label="Nombre de la categoría">
                  <label class="cloud-category__parent">
                    <span class="sr-only">Categoría padre de ${escapeHTML(categoria.nombre)}</span>
                    <select data-parent-category="${escapeHTML(categoria.id)}">
                      <option value="">Nivel principal</option>
                      ${padres
                        .map(
                          (opcion) =>
                            `<option value="${escapeHTML(opcion.id)}" ${opcion.id === categoria.padre ? "selected" : ""}>${escapeHTML(opcion.ruta)}</option>`
                        )
                        .join("")}
                    </select>
                  </label>
                  <label class="cloud-category__cover">
                    <span class="sr-only">Portada de ${escapeHTML(categoria.nombre)}</span>
                    <select data-category-cover="${escapeHTML(categoria.id)}">
                      <option value="auto" ${!categoria.portada || categoria.portada === "auto" ? "selected" : ""}>Último artículo subido</option>
                      ${opcionesPortada(categoria)
                        .map(
                          (opcion) =>
                            `<option value="${escapeHTML(opcion.valor)}" ${opcion.valor === categoria.portada ? "selected" : ""}>${escapeHTML(opcion.etiqueta)}</option>`
                        )
                        .join("")}
                      ${categoria.portada && categoria.portada !== "auto" && !opcionesPortada(categoria).some((opcion) => opcion.valor === categoria.portada)
                        ? `<option value="${escapeHTML(categoria.portada)}" selected>Portada guardada</option>`
                        : ""}
                    </select>
                  </label>
                  <button type="button" data-delete-category="${escapeHTML(categoria.id)}" aria-label="Eliminar ${escapeHTML(categoria.nombre)}" ${productos ? "disabled title='Tiene productos'" : ""}>×</button>
                </div>`;
            })
            .join("")
        : '<p class="cloud-muted">Todavía no hay categorías.</p>';
    }
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
      .map((fila, indice) => ({
        nombre: fila.querySelector(`[data-variant-name="${indice}"]`)?.value.trim() || "",
        precio: fila.querySelector(`[data-variant-price="${indice}"]`)?.value.trim() || "",
      }))
      .filter((variante) => variante.nombre);
    const id = selectedId || (() => {
      const baseId = slugify(nombre) || "producto";
      let candidato = baseId;
      let sufijo = 2;
      while (catalog.productos.some((producto) => producto.id === candidato)) {
        candidato = `${baseId}-${sufijo++}`;
      }
      return candidato;
    })();
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

  const renderVariantes = (producto) => {
    if (!els.variantList) return;
    const variantes = producto?.variantes || [];
    els.variantList.innerHTML = variantes.length
      ? variantes
          .map(
            (variante, indice) => `
            <div class="cloud-variant" data-variant-row="${indice}">
              <label class="field">
                <span>Opción</span>
                <input type="text" data-variant-name="${indice}" value="${escapeHTML(variante.nombre || "")}" placeholder="Ej.: 10 cm" maxlength="80">
              </label>
              <label class="field">
                <span>Precio</span>
                <input type="text" data-variant-price="${indice}" value="${escapeHTML(variante.precio || "")}" placeholder="Ej.: $15.000" maxlength="40">
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
              <img src="${escapeHTML(imageURL(imagen.src))}" alt="${escapeHTML(imagen.alt || "")}" loading="lazy">
              <label class="field">
                <span class="sr-only">Texto alternativo</span>
                <input type="text" data-alt="${indice}" value="${escapeHTML(imagen.alt || "")}" placeholder="Texto alternativo" maxlength="160">
              </label>
              <div class="cloud-image__tools">
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

  const recortarSujeto = async (blob) => {
    const imagen = await cargarImagen(blob);
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
    if (!encontrado) throw new Error("La imagen quedó vacía después de quitar el fondo.");

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
    const recorte = await modulo.removeBackground(file, {
      output: { format: "image/png" },
    });
    return recorte;
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
      activarFormTab("datos");
      els.productName.focus();
      els.productName.select();
      setStatus(
        els.saveStatus,
        "Archivo preparado. Cambiá «Producto sin título» por el nombre real y elegí la categoría.",
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
        const recorte = await quitarFondo(file);
        const procesada = await recortarSujeto(recorte);
        setStatus(els.imageStatus, `Subiendo «${file.name}»…`);
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
      }
    }
    els.imageFiles.value = "";
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
    dirty = true;
    renderCategorias();
    programarAutoguardado();
    setStatus(els.saveStatus, "Categoría eliminada. Guardá el borrador para confirmarlo.");
  };

  const manejarClickImagenes = (event) => {
    const producto = catalog?.productos?.find((item) => item.id === selectedId);
    if (!producto) return;
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

  const activarCloudTab = (nombre) => {
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
    };
    Object.entries(paneles).forEach(([clave, panel]) => {
      if (panel) panel.hidden = clave !== nombre;
    });
    if (nombre === "categorias") renderCategorias();
    if (nombre === "sucursales") renderSucursales();
    if (nombre === "pedidos") cargarPedidos();
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
    if (els.deleteProduct) els.deleteProduct.addEventListener("click", eliminarProducto);
    if (els.categoryForm) els.categoryForm.addEventListener("submit", agregarCategoria);
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
        const boton = event.target.closest("[data-delete-category]");
        if (boton) eliminarCategoria(boton.dataset.deleteCategory);
      });
      els.categoryList.addEventListener("change", (event) => {
        const portadaSelect = event.target.closest("[data-category-cover]");
        if (portadaSelect) {
          const categoria = catalog.categorias.find((item) => item.id === portadaSelect.dataset.categoryCover);
          if (!categoria) return;
          categoria.portada = portadaSelect.value || "auto";
          dirty = true;
          programarAutoguardado();
          setStatus(els.saveStatus, "Portada de categoría actualizada. Guardá el borrador para confirmarla.");
          return;
        }
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
    if (els.imageFiles) {
      els.imageFiles.addEventListener("change", () => procesarImagenes(els.imageFiles.files));
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
