// ==========================================================================
// Agresti.3D — collage y campañas del inicio
// ==========================================================================

(() => {
  "use strict";

  const DAY = 24 * 60 * 60 * 1000;
  const PRODUCTOS_GENERALES = [
    "mate-azul-oro",
    "despertando-oso",
    "posavasos-vinilo",
  ];

  const campaniaGeneral = {
    id: "general",
    texto: "Ideas para usar, regalar y disfrutar.",
    productos: PRODUCTOS_GENERALES,
  };

  const dia = (fecha) => Math.floor(fecha.getTime() / DAY);
  const fecha = (anio, mes, diaDelMes) =>
    new Date(Date.UTC(anio, mes - 1, diaDelMes));
  const sumarDias = (fechaBase, cantidad) =>
    new Date(fechaBase.getTime() + cantidad * DAY);

  const tercerDomingo = (anio, mes) => {
    const primerDia = fecha(anio, mes, 1);
    const diasHastaDomingo = (7 - primerDia.getUTCDay()) % 7;
    return fecha(anio, mes, 1 + diasHastaDomingo + 14);
  };

  const pascua = (anio) => {
    const a = anio % 19;
    const b = Math.floor(anio / 100);
    const c = anio % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mes = Math.floor((h + l - 7 * m + 114) / 31);
    const diaDelMes = ((h + l - 7 * m + 114) % 31) + 1;
    return fecha(anio, mes, diaDelMes);
  };

  const hoyEnArgentina = () => {
    const partes = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Argentina/Buenos_Aires",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const valor = (tipo) => Number(partes.find((parte) => parte.type === tipo)?.value);
    const hoy = { anio: valor("year"), mes: valor("month"), dia: valor("day") };

    if (!Object.values(hoy).every(Number.isFinite)) {
      throw new Error("No se pudo determinar la fecha de la campaña del inicio.");
    }

    return hoy;
  };

  const buscarCampania = ({ anio, mes, dia: diaDelMes }) => {
    const hoy = fecha(anio, mes, diaDelMes);
    const hoyNumero = dia(hoy);
    const candidatas = [];

    const agregar = (id, texto, productos, evento, desde, hasta, prioridad) => {
      const inicio = dia(desde);
      const fin = dia(hasta);
      if (hoyNumero < inicio || hoyNumero > fin) return;

      candidatas.push({
        id,
        texto,
        productos,
        evento: dia(evento),
        prioridad,
      });
    };

    const eventoFijo = (id, texto, productos, evento, anticipacion, prioridad) =>
      agregar(
        id,
        texto,
        productos,
        evento,
        sumarDias(evento, -anticipacion),
        evento,
        prioridad
      );

    eventoFijo(
      "pascuas",
      "Pascuas: una sorpresa para compartir.",
      ["despertando-rana", "despertando-oso", "despertando-perro-caniche"],
      pascua(anio),
      21,
      1
    );
    eventoFijo(
      "animales",
      "Día del Animal: figuras con personalidad.",
      [
        "despertando-perro-caniche",
        "despertando-perro-golden",
        "despertando-perro-samoyed",
      ],
      fecha(anio, 4, 29),
      14,
      2
    );
    eventoFijo(
      "padre",
      "Día del Padre: un detalle con estilo.",
      ["mate-azul-oro", "mate-rueda", "mate-azul-banda-dorada"],
      tercerDomingo(anio, 6),
      21,
      3
    );
    eventoFijo(
      "infancias",
      "Día de las Infancias: ideas para jugar.",
      ["despertando-perro-caniche", "despertando-oso", "despertando-dragon"],
      tercerDomingo(anio, 8),
      21,
      4
    );
    eventoFijo(
      "maestro",
      "Día del Maestro: un detalle para agradecer.",
      ["mate-celeste", "posavasos-vinilo", "soporte-posavasos-taza"],
      fecha(anio, 9, 11),
      14,
      5
    );

    const diaDeLaMadre = tercerDomingo(anio, 10);
    eventoFijo(
      "madre",
      "Día de la Madre: un detalle para mamá.",
      ["mate-rosa-banda-dorada", "milkshake-personaje-rosa", "mate-celeste"],
      diaDeLaMadre,
      21,
      6
    );

    const inicioHalloween = new Date(
      Math.max(fecha(anio, 10, 15).getTime(), sumarDias(diaDeLaMadre, 1).getTime())
    );
    agregar(
      "halloween",
      "Halloween: un toque distinto para sorprender.",
      ["despertando-calabaza", "despertando-bruja", "despertando-murcielago"],
      fecha(anio, 10, 31),
      inicioHalloween,
      fecha(anio, 11, 2),
      7
    );

    const fechaNavidad = fecha(anio, 12, 25);
    agregar(
      "navidad",
      "Navidad: ideas para regalar en estas fiestas.",
      ["despertando-oso", "mate-azul-oro", "posavasos-vinilo"],
      fechaNavidad,
      fecha(anio, 11, 15),
      fecha(anio + 1, 1, 6),
      8
    );

    if (mes === 1 && diaDelMes <= 6) {
      const navidadAnterior = fecha(anio - 1, 12, 25);
      agregar(
        "navidad",
        "Navidad: ideas para regalar en estas fiestas.",
        ["despertando-oso", "mate-azul-oro", "posavasos-vinilo"],
        navidadAnterior,
        fecha(anio - 1, 11, 15),
        fecha(anio, 1, 6),
        8
      );
    }

    candidatas.sort((a, b) => {
      const distanciaA = a.evento - hoyNumero;
      const distanciaB = b.evento - hoyNumero;
      const futuroA = distanciaA >= 0;
      const futuroB = distanciaB >= 0;
      if (futuroA !== futuroB) return futuroA ? -1 : 1;
      return Math.abs(distanciaA) - Math.abs(distanciaB) || a.prioridad - b.prioridad;
    });

    return candidatas[0] || campaniaGeneral;
  };

  const campania = buscarCampania(hoyEnArgentina());
  window.AGRESTI_HERO_CAMPAIGN = campania.id;

  const marco = document.getElementById("heroCampaign");
  const collage = document.getElementById("heroCollage");
  const texto = document.getElementById("heroCampaignCopy");
  if (!marco || !collage || !texto) return;

  marco.dataset.campaign = campania.id;
  texto.textContent = campania.texto;

  const dibujarProductos = () => {
    const datos = window.AGRESTI_CATALOG_DATA;
    if (!datos || !Array.isArray(datos.productos)) return;

    const porId = new Map(datos.productos.map((producto) => [producto.id, producto]));
    const elegidos = campania.productos
      .map((id) => porId.get(id))
      .filter((producto) => producto && producto.imagenes?.some((imagen) => imagen?.src));

    datos.productos.forEach((producto) => {
      if (elegidos.length >= 3) return;
      if (
        producto &&
        !elegidos.includes(producto) &&
        producto.imagenes?.some((imagen) => imagen?.src)
      ) {
        elegidos.push(producto);
      }
    });

    if (elegidos.length === 0) return;

    const posiciones = ["left", "lead", "right"];
    const nodos = elegidos.slice(0, 3).map((producto, indice) => {
      const imagen = producto.imagenes.find((foto) => foto?.src);
      const enlace = document.createElement("a");
      enlace.className = `hero__product hero__product--${posiciones[indice]}`;
      enlace.href = `#p=${encodeURIComponent(producto.id)}`;
      enlace.setAttribute("aria-label", `Ver producto: ${producto.nombre}`);

      const foto = document.createElement("img");
      foto.src = imagen.src;
      foto.alt = "";
      foto.width = 600;
      foto.height = 600;
      foto.loading = "eager";
      foto.decoding = "async";
      if (indice === 1) foto.fetchPriority = "high";
      foto.addEventListener(
        "error",
        () => {
          console.error(`[inicio] no se pudo cargar la foto de ${producto.nombre}: ${imagen.src}`);
          enlace.remove();
        },
        { once: true }
      );

      enlace.append(foto);
      return enlace;
    });

    collage.replaceChildren(...nodos);
  };

  if (window.AGRESTI_CATALOG_DATA) {
    dibujarProductos();
  } else {
    window.addEventListener("agresti:catalog-loaded", dibujarProductos, { once: true });
  }
})();
