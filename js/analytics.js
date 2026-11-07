(() => {
  const API_KEY = "AIzaSyCjBR_K_Wk4Kiy7HBMnt0_bfFup45R8na0";
  const URL = `https://firestore.googleapis.com/v1/projects/agresti-3d/databases/(default)/documents/eventos?key=${API_KEY}`;
  let searchTimer = null;

  window.agrestiTrack = (evento, datos = {}) => {
    if (!evento) return;
    const campos = {
      evento: { stringValue: String(evento) },
      pagina: { stringValue: location.pathname + location.hash },
      fecha: { timestampValue: new Date().toISOString() },
    };
    Object.entries(datos).forEach(([clave, valor]) => {
      if (valor === undefined || valor === null || valor === "") return;
      campos[clave] = { stringValue: String(valor) };
    });
    fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: campos }),
      keepalive: true,
    }).catch(() => {
      /* la analítica nunca debe romper la compra */
    });
  };

  document.addEventListener("click", (evento) => {
    const agregar = evento.target.closest("[data-add-cart]");
    if (agregar) {
      window.agrestiTrack("add_to_cart", { productoId: agregar.dataset.addCart });
    }
    const whatsapp = evento.target.closest("[data-wa-message]");
    if (whatsapp) {
      const ficha = whatsapp.closest("[data-product-id]");
      window.agrestiTrack("whatsapp", { productoId: ficha?.dataset.productId || "" });
    }
    if (evento.target.closest("#cartOrderButton")) {
      window.agrestiTrack("whatsapp_cart");
    }
  });

  document.addEventListener("input", (evento) => {
    if (evento.target.id !== "catalogSearch") return;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      const termino = evento.target.value.trim();
      if (termino) window.agrestiTrack("search", { termino });
    }, 700);
  });

  document.addEventListener("change", (evento) => {
    if (evento.target.id === "catalogPriceFilter") {
      window.agrestiTrack("filter", { filtro: "precio", valor: evento.target.value });
    }
    if (evento.target.id === "catalogAvailabilityFilter") {
      window.agrestiTrack("filter", { filtro: "disponibilidad", valor: evento.target.value });
    }
  });

  document.addEventListener("submit", (evento) => {
    if (evento.target.id === "quoteForm") {
      window.agrestiTrack("custom_order");
    }
  }, true);
})();
