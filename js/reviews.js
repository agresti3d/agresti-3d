(() => {
  const API_KEY = "AIzaSyCjBR_K_Wk4Kiy7HBMnt0_bfFup45R8na0";
  const PROJECT = "agresti-3d";
  const URL = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/resenas?key=${API_KEY}`;
  const CLOUD = { cloud: "ejl0yvoo", preset: "agresti3d_unsigned", folder: "agresti3d/resenas" };

  const estado = (form, mensaje, tipo = "") => {
    const nodo = form.querySelector("[data-review-status]");
    if (!nodo) return;
    nodo.textContent = mensaje;
    nodo.dataset.state = tipo;
  };

  const subirFoto = async (archivo) => {
    const datos = new FormData();
    datos.append("file", archivo);
    datos.append("upload_preset", CLOUD.preset);
    datos.append("folder", CLOUD.folder);
    const respuesta = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD.cloud}/image/upload`, {
      method: "POST",
      body: datos,
    });
    if (!respuesta.ok) throw new Error("No se pudo subir la foto.");
    return (await respuesta.json()).secure_url;
  };

  document.addEventListener("submit", async (evento) => {
    const form = evento.target.closest("[data-review-form]");
    if (!form) return;
    evento.preventDefault();

    const productoId = form.dataset.productoId;
    const nombre = form.elements.nombre.value.trim();
    const texto = form.elements.texto.value.trim();
    const rating = Number(form.elements.rating.value) || 5;
    const archivo = form.elements.foto.files?.[0];
    const boton = form.querySelector('button[type="submit"]');

    if (!nombre || !texto) {
      estado(form, "Completá tu nombre y tu experiencia.", "error");
      form.elements[nombre ? "texto" : "nombre"].focus();
      return;
    }
    if (archivo && (!archivo.type.startsWith("image/") || archivo.size > 10 * 1024 * 1024)) {
      estado(form, "La foto tiene que ser una imagen de hasta 10 MB.", "error");
      return;
    }

    const textoBoton = boton?.textContent;
    try {
      if (boton) {
        boton.disabled = true;
        boton.textContent = archivo ? "Subiendo foto…" : "Enviando…";
      }
      estado(form, "Enviando reseña…");
      let foto = "";
      if (archivo) foto = await subirFoto(archivo);

      const respuesta = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            productoId: { stringValue: productoId },
            nombre: { stringValue: nombre },
            rating: { integerValue: String(rating) },
            texto: { stringValue: texto },
            foto: { stringValue: foto },
            estado: { stringValue: "pendiente" },
            fecha: { timestampValue: new Date().toISOString() },
          },
        }),
      });
      if (!respuesta.ok) throw new Error("No se pudo enviar la reseña.");
      form.reset();
      estado(form, "¡Gracias! La publicamos después de revisarla.", "success");
    } catch (error) {
      estado(form, "No se pudo enviar. Probá de nuevo en un rato.", "error");
    } finally {
      if (boton) {
        boton.disabled = false;
        boton.textContent = textoBoton;
      }
    }
  });
})();
