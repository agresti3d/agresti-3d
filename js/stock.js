(() => {
  const API_KEY = "AIzaSyCjBR_K_Wk4Kiy7HBMnt0_bfFup45R8na0";
  const URL = `https://firestore.googleapis.com/v1/projects/agresti-3d/databases/(default)/documents/avisosStock?key=${API_KEY}`;

  document.addEventListener("submit", async (evento) => {
    const form = evento.target.closest("[data-stock-form]");
    if (!form) return;
    evento.preventDefault();
    const contacto = form.elements.contacto.value.trim();
    const status = form.querySelector("[data-stock-status]");
    if (!contacto) {
      if (status) {
        status.textContent = "Dejanos un email o WhatsApp.";
        status.dataset.state = "error";
      }
      form.elements.contacto.focus();
      return;
    }
    const boton = form.querySelector('button[type="submit"]');
    const texto = boton?.textContent;
    try {
      if (boton) {
        boton.disabled = true;
        boton.textContent = "Guardando…";
      }
      const respuesta = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            productoId: { stringValue: form.dataset.productoId || "" },
            contacto: { stringValue: contacto },
            estado: { stringValue: "pendiente" },
            fecha: { timestampValue: new Date().toISOString() },
          },
        }),
      });
      if (!respuesta.ok) throw new Error("No se pudo guardar.");
      form.reset();
      if (status) {
        status.textContent = "Listo. Te avisamos cuando esté disponible.";
        status.dataset.state = "success";
      }
      window.agrestiTrack?.("stock_alert", { productoId: form.dataset.productoId || "" });
    } catch (error) {
      if (status) {
        status.textContent = "No se pudo guardar. Probá de nuevo.";
        status.dataset.state = "error";
      }
    } finally {
      if (boton) {
        boton.disabled = false;
        boton.textContent = texto;
      }
    }
  });
})();
