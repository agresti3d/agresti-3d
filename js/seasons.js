// ==========================================================================
// Agresti.3D — fotos por temporada
// ==========================================================================
//
// CÓMO FUNCIONA
// -------------
// Cada temporada tiene una carpeta dentro de /img. Si esa carpeta tiene fotos,
// reemplazan a las ilustraciones del catálogo. Si está vacía, no pasa nada:
// el sitio sigue mostrando las ilustraciones de siempre.
//
// NOMBRE DE LOS ARCHIVOS (importante)
// -----------------------------------
//   01.jpg … 06.jpg  → reemplazan las fotos de las fichas del catálogo.
//
// Se aceptan .webp, .jpg, .jpeg y .png. No hay que saltear números: si falta
// el 03, el 04 tampoco se usa.
//
// PARA AGREGAR UNA TEMPORADA
// --------------------------
// 1. Crear la carpeta en /img (minúsculas, sin acentos, sin espacios).
// 2. Sumar un objeto al array SEASONS con su rango de fechas.
// 3. Poner las fotos adentro con los nombres de arriba.
//
// Los rangos son [mes, día]. Si `from` es mayor que `to`, el rango cruza el
// cambio de año (como Navidad).

const SEASONS = [
  {
    id: "halloween",
    label: "Halloween",
    folder: "halloween",
    from: [9, 15], // 15 de septiembre
    to: [11, 14], // 14 de noviembre
  },
  {
    id: "navidad",
    label: "Navidad",
    folder: "navidad",
    from: [11, 15], // 15 de noviembre
    to: [1, 6], // 6 de enero
  },
  {
    id: "resto",
    label: "",
    folder: "resto-del-ano",
    from: [1, 7], // 7 de enero
    to: [9, 14], // 14 de septiembre
  },
];

// Si cambiás una foto y el navegador sigue mostrando la anterior,
// subí este número y recargá.
const PHOTO_CACHE = 1;

const PHOTO_EXTS = ["jpg", "webp", "jpeg", "png"];
const PHOTO_SLOTS = 6;

// --------------------------------------------------------------------------

const today = new Date();
const monthDay = [today.getMonth() + 1, today.getDate()];

const inRange = ([m, d], [fm, fd], [tm, td]) => {
  const value = m * 100 + d;
  const start = fm * 100 + fd;
  const end = tm * 100 + td;
  return start <= end
    ? value >= start && value <= end
    : value >= start || value <= end;
};

const season =
  SEASONS.find((s) => inRange(monthDay, s.from, s.to)) ??
  SEASONS[SEASONS.length - 1];

// Deja la temporada disponible para CSS o para depurar.
document.documentElement.dataset.season = season.id;

// Prueba si existe una foto con ese nombre, sin romper nada si no está.
const findPhoto = (folder, name) =>
  new Promise((resolve) => {
    let index = 0;

    const tryNext = () => {
      if (index >= PHOTO_EXTS.length) {
        resolve(null);
        return;
      }

      const url = `img/${folder}/${name}.${PHOTO_EXTS[index++]}?v=${PHOTO_CACHE}`;
      const probe = new Image();
      probe.onload = () => resolve(url);
      probe.onerror = tryNext;
      probe.src = url;
    };

    tryNext();
  });

const collectPhotos = async (folder) => {
  // Manifiesto opcional: evita sondear 4 extensiones por cada slot cuando la
  // temporada está vacía. Si existe photos.json, manda ese listado.
  try {
    const respuesta = await fetch(`img/${folder}/photos.json?v=${PHOTO_CACHE}`, { cache: "no-cache" });
    if (respuesta.ok) {
      const data = await respuesta.json();
      if (Array.isArray(data?.photos)) {
        return data.photos
          .filter((foto) => typeof foto === "string" && foto.trim())
          .map((foto) => `img/${folder}/${foto.trim()}?v=${PHOTO_CACHE}`);
      }
    }
  } catch (error) {
    // Sin manifiesto: se mantiene el sondeo anterior.
  }

  const photos = [];
  for (let i = 1; i <= PHOTO_SLOTS; i += 1) {
    const photo = await findPhoto(folder, String(i).padStart(2, "0"));
    if (!photo) break;
    photos.push(photo);
  }
  return photos;
};

// Las fotos encontradas quedan a disposición de js/catalog.js.
const seasonPhotos = collectPhotos(season.folder).then((photos) => {
  if (photos.length > 0) {
    console.info(
      `[temporada] ${season.id}: ${photos.length} foto(s) para el catálogo`
    );
  }

  return photos;
});

window.AGRESTI_SEASON_PHOTOS = seasonPhotos;
