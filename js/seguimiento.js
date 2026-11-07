(() => {
  const API_KEY = "AIzaSyCjBR_K_Wk4Kiy7HBMnt0_bfFup45R8na0";
  const BASE = "https://firestore.googleapis.com/v1/projects/agresti-3d/databases/(default)/documents/pedidos";
  const form = document.getElementById("trackingForm");
  const input = document.getElementById("trackingCode");
  const status = document.getElementById("trackingStatus");
  const result = document.getElementById("trackingResult");
  const ESTADOS = [
    ["pendiente", "Pedido recibido"],
    ["confirmado", "Confirmado"],
    ["en_produccion", "En producción"],
    ["listo", "Listo"],
    ["enviado", "Enviado"],
    ["entregado", "Entregado"],
  ];
  const LABELS = Object.fromEntries(ESTADOS);

  const setStatus = (texto, error = false) => {
    if (!status) return;
    status.textContent = texto;
    status.dataset.state = error ? "error" : "";
  };

  const esc = (valor) =>
    String(valor ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[char]));

  const fecha = (valor) => {
    try {
      return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(valor));
    } catch {
      return "";
    }
  };

  const precio = (numero) => `$${Number(numero || 0).toLocaleString("es-AR")}`;

  const pintar = (pedido) => {
    if (!result) return;
    const estado = pedido.estado || "pendiente";
    const pasos = ESTADOS.map(([id, label], indice) => {
      const actual = ESTADOS.findIndex(([clave]) => clave === estado);
      const hecho = estado !== "cancelado" && indice <= actual;
      return `<li class="${hecho ? "is-done" : ""}"><span>${indice + 1}</span>${label}</li>`;
    }).join("");
    const items = (pedido.items || [])
      .map((item) => `<li><span>${esc(item.nombre)} ×${item.cantidad}</span><strong>${item.precio ? precio(item.precio * item.cantidad) : "A consultar"}</strong></li>`)
      .join("");
    result.innerHTML = `
      <div class="tracking-card">
        <div class="tracking-card__head">
          <div>
            <span class="tracking-card__code">${esc(pedido.codigo)}</span>
            <h2>${esc(estado === "cancelado" ? "Pedido cancelado" : LABELS[estado] || estado)}</h2>
            <p>Creado el ${esc(fecha(pedido.creado))}</p>
          </div>
          <span class="tracking-card__badge">${esc(estado === "cancelado" ? "Cancelado" : LABELS[estado] || estado)}</span>
        </div>
        ${estado === "cancelado" ? "" : `<ol class="tracking-steps">${pasos}</ol>`}
        <div class="tracking-card__body">
          <h3>Productos</h3>
          <ul class="tracking-items">${items || "<li>Sin detalle de productos.</li>"}</ul>
          <div class="tracking-total"><span>Total estimado</span><strong>${precio(pedido.total)}</strong></div>
          <p class="tracking-help">¿Tenés alguna duda? Escribinos por WhatsApp y mencioná el código <strong>${esc(pedido.codigo)}</strong>.</p>
        </div>
      </div>`;
    result.hidden = false;
  };

  const buscar = async (codigo) => {
    const limpio = String(codigo || "").trim().toUpperCase();
    if (!/^AG-[A-Z0-9]{6}$/.test(limpio)) {
      setStatus("El código tiene que tener el formato AG-XXXXXX.", true);
      return;
    }
    setStatus("Buscando pedido…");
    if (result) result.hidden = true;
    try {
      const respuesta = await fetch(`${BASE}/${encodeURIComponent(limpio)}?key=${API_KEY}`);
      if (respuesta.status === 404) {
        setStatus("No encontramos un pedido con ese código. Revisalo o escribinos por WhatsApp.", true);
        return;
      }
      if (!respuesta.ok) throw new Error("No se pudo consultar.");
      const datos = await respuesta.json();
      const campos = datos.fields || {};
      const pedido = {
        codigo: campos.codigo?.stringValue || limpio,
        estado: campos.estado?.stringValue || "pendiente",
        total: Number(campos.total?.integerValue || 0),
        creado: campos.creado?.timestampValue || "",
        items: (campos.items?.arrayValue?.values || []).map((valor) => {
          const f = valor.mapValue?.fields || {};
          return {
            nombre: f.nombre?.stringValue || "Producto",
            cantidad: Number(f.cantidad?.integerValue || 1),
            precio: Number(f.precio?.integerValue || 0),
          };
        }),
      };
      setStatus("");
      pintar(pedido);
    } catch (error) {
      setStatus("No pudimos consultar el pedido. Revisá tu conexión e intentá de nuevo.", true);
    }
  };

  form?.addEventListener("submit", (evento) => {
    evento.preventDefault();
    buscar(input.value);
  });

  const inicial = new URLSearchParams(location.search).get("codigo");
  if (inicial) {
    input.value = inicial.toUpperCase();
    buscar(inicial);
  }
})();
