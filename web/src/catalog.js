let catalogoPromise = null;
const CACHE_KEY = "agresti:catalogo-cache-v1";

const conTiempo = async (url, opciones = {}, ms = 4000) => {
  const control = new AbortController();
  const timer = setTimeout(() => control.abort(), ms);
  try {
    return await fetch(url, { ...opciones, signal: control.signal });
  } finally {
    clearTimeout(timer);
  }
};

export function leerCatalogoCache() {
  try {
    const crudo = localStorage.getItem(CACHE_KEY);
    if (!crudo) return null;
    const datos = JSON.parse(crudo);
    return Array.isArray(datos?.productos) ? datos : null;
  } catch (error) {
    return null;
  }
}

function recordarCatalogo(datos) {
  try {
    if (Array.isArray(datos?.productos)) localStorage.setItem(CACHE_KEY, JSON.stringify(datos));
  } catch (error) {}
  return datos;
}

async function catalogoPublicado() {
  const config = await conTiempo("/__/firebase/init.json", { cache: "no-cache" }, 2500)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
  if (!config?.apiKey || !config?.projectId) return null;
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(config.projectId)}/databases/(default)/documents/catalogo/publicado?key=${encodeURIComponent(config.apiKey)}`;
  const respuesta = await conTiempo(url, { cache: "no-cache" });
  if (!respuesta.ok) return null;
  const documento = await respuesta.json();
  const json = documento?.fields?.json?.stringValue;
  if (!json) return null;
  const datos = JSON.parse(json);
  return Array.isArray(datos?.productos) ? datos : null;
}

async function catalogoEstatico() {
  const respuesta = await fetch("/data/catalog.json", { cache: "no-cache" });
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
  return respuesta.json();
}

export function loadCatalog() {
  if (!catalogoPromise) {
    catalogoPromise = catalogoPublicado()
      .then((nube) => nube || catalogoEstatico())
      .catch(() => catalogoEstatico())
      .catch(() => ({ productos: [], categorias: [], sucursales: [] }))
      .then(recordarCatalogo);
  }
  return catalogoPromise;
}
