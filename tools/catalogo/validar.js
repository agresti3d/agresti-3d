#!/usr/bin/env node
// Agresti.3D — Validador del catálogo y del sistema de diseño.
// Uso: node tools/catalogo/validar.js
// Sale con código 1 si encuentra errores.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const CATALOG = path.join(ROOT, "data", "catalog.json");
const STYLES = path.join(ROOT, "css", "styles.css");

const problemas = [];
const avisos = [];

const error = (mensaje) => problemas.push(mensaje);
const aviso = (mensaje) => avisos.push(mensaje);

const esObjeto = (valor) => valor && typeof valor === "object" && !Array.isArray(valor);
const texto = (valor) => typeof valor === "string" && valor.trim().length > 0;

// ALT genéricos que no describen la imagen (taste-skill).
const altGenerico = /^(imagen|foto|video|una imagen|un video|imagen de|foto de|foto del)\b/i;

function validarCatalogo() {
  if (!fs.existsSync(CATALOG)) {
    error("No existe data/catalog.json.");
    return null;
  }

  let catalogo;
  try {
    catalogo = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
  } catch (err) {
    error(`data/catalog.json no es JSON válido: ${err.message}`);
    return null;
  }

  if (!Array.isArray(catalogo.categorias)) error("Falta la lista «categorias».");
  if (!Array.isArray(catalogo.productos)) error("Falta la lista «productos».");
  if (!Array.isArray(catalogo.sucursales)) error("Falta la lista «sucursales».");
  if (problemas.length) return catalogo;

  const sucursales = new Set(catalogo.sucursales.map((s) => s && s.id).filter(Boolean));
  const categorias = new Set(catalogo.categorias.map((c) => c && c.id).filter(Boolean));
  const productos = new Set();

  catalogo.categorias.forEach((categoria, indice) => {
    if (!esObjeto(categoria)) return error(`La categoría ${indice + 1} no es un objeto.`);
    if (!texto(categoria.id)) error(`La categoría ${indice + 1} necesita un «id».`);
    if (!texto(categoria.nombre)) error(`La categoría ${indice + 1} necesita un «nombre».`);
    if (categoria.padre && !categorias.has(categoria.padre)) {
      error(`La categoría «${categoria.id}» apunta a un padre inexistente.`);
    }
  });

  catalogo.sucursales.forEach((sucursal, indice) => {
    if (!esObjeto(sucursal)) return error(`La sucursal ${indice + 1} no es un objeto.`);
    if (!texto(sucursal.nombre)) error(`La sucursal ${indice + 1} necesita «nombre».`);
    if (!texto(sucursal.localidad)) error(`La sucursal ${indice + 1} necesita «localidad».`);
    if (!/^\d{8,15}$/.test(String(sucursal.telefono || "").replace(/\D/g, ""))) {
      error(`La sucursal «${sucursal.nombre || indice + 1}» necesita un teléfono de 8 a 15 cifras.`);
    }
  });

  catalogo.productos.forEach((producto, indice) => {
    const nombre = producto && producto.nombre ? `«${producto.nombre}»` : `#${indice + 1}`;

    if (!esObjeto(producto)) return error(`El producto ${indice + 1} no es un objeto.`);
    if (!texto(producto.id)) error(`El producto ${nombre} necesita un «id».`);
    else if (productos.has(producto.id)) error(`El id de producto «${producto.id}» está repetido.`);
    else productos.add(producto.id);

    if (!texto(producto.nombre)) error(`El producto ${nombre} necesita un «nombre».`);
    if (!categorias.has(producto.categoria)) {
      error(`El producto ${nombre} tiene una categoría inexistente («${producto.categoria}»).`);
    }

    if (producto.descripcion && producto.descripcion.length > 300) {
      error(`La descripción corta de ${nombre} supera 300 caracteres.`);
    }
    if (producto.descripcionLarga && producto.descripcionLarga.length > 2000) {
      error(`La descripción larga de ${nombre} supera 2000 caracteres.`);
    }

    if (!Array.isArray(producto.imagenes) || producto.imagenes.length === 0) {
      error(`El producto ${nombre} no tiene fotos.`);
    } else {
      producto.imagenes.forEach((imagen, imagenIndice) => {
        if (!esObjeto(imagen) || !texto(imagen.src)) {
          error(`La foto ${imagenIndice + 1} de ${nombre} no tiene «src».`);
          return;
        }
        if (!texto(imagen.alt)) {
          error(`La foto ${imagenIndice + 1} de ${nombre} no tiene texto alternativo.`);
        } else if (altGenerico.test(imagen.alt.trim())) {
          error(`El ALT de ${nombre} es genérico («${imagen.alt}»). Describí lo que se ve.`);
        }
        if (!/\.(webp|jpe?g|png)(\?|$)/i.test(imagen.src)) {
          aviso(`La foto de ${nombre} no es WEBP/JPG/PNG: ${imagen.src}`);
        }
      });
    }

    if (producto.videos !== undefined) {
      if (!Array.isArray(producto.videos)) {
        error(`«videos» de ${nombre} debe ser una lista.`);
      } else {
        producto.videos.forEach((video, videoIndice) => {
          if (!esObjeto(video) || !texto(video.src)) {
            error(`El video ${videoIndice + 1} de ${nombre} no tiene «src».`);
            return;
          }
          if (!/\.(mp4|webm|mov)(\?|$)/i.test(video.src)) {
            error(`El video ${videoIndice + 1} de ${nombre} debe ser MP4, WEBM o MOV.`);
          }
          if (video.title !== undefined && typeof video.title !== "string") {
            error(`El título del video ${videoIndice + 1} de ${nombre} debe ser texto.`);
          }
        });
      }
    }

    if (producto.sucursalesDisponibles !== undefined) {
      if (!Array.isArray(producto.sucursalesDisponibles)) {
        error(`«sucursalesDisponibles» de ${nombre} debe ser una lista.`);
      } else {
        if (producto.sucursalesDisponibles.length === 0) {
          aviso(`${nombre} no está disponible en ninguna sucursal.`);
        }
        producto.sucursalesDisponibles.forEach((id) => {
          if (!sucursales.has(id)) error(`${nombre} menciona una sucursal inexistente («${id}»).`);
        });
      }
    } else {
      aviso(`${nombre} no declara sucursales disponibles.`);
    }

    if (producto.stockPorSucursal !== undefined) {
      if (!esObjeto(producto.stockPorSucursal)) {
        error(`«stockPorSucursal» de ${nombre} debe ser un objeto por sucursal.`);
      } else {
        Object.entries(producto.stockPorSucursal).forEach(([id, cantidad]) => {
          if (!sucursales.has(id)) {
            error(`${nombre} declara stock para una sucursal inexistente («${id}»).`);
          } else if (
            Array.isArray(producto.sucursalesDisponibles) &&
            !producto.sucursalesDisponibles.includes(id)
          ) {
            aviso(`${nombre} declara stock en «${id}», pero no la marca como disponible.`);
          }
          if (!Number.isInteger(cantidad) || cantidad < 0) {
            error(`El stock de ${nombre} en «${id}» debe ser un entero mayor o igual a 0.`);
          }
        });
      }
    }
  });

  if (!problemas.length) {
    console.log(`✅ Catálogo válido: ${catalogo.productos.length} productos, ${catalogo.categorias.length} categorías, ${catalogo.sucursales.length} sucursales.`);
  }

  return catalogo;
}

function validarSpacing() {
  if (!fs.existsSync(STYLES)) {
    error("No existe css/styles.css.");
    return;
  }

  const css = fs.readFileSync(STYLES, "utf8");
  const bloqueTokens = css.match(/:root\s*\{([\s\S]*?)\}/);
  if (!bloqueTokens) {
    aviso("No se encontró el bloque :root de tokens.");
    return;
  }

  const tokens = [...bloqueTokens[1].matchAll(/(--s-\d+)\s*:\s*([\d.]+)(rem|px)/g)];
  tokens.forEach(([, nombre, valor, unidad]) => {
    const px = Number(valor) * (unidad === "rem" ? 16 : 1);
    if (px % 4 !== 0) error(`El token ${nombre} (${valor}${unidad}) no es múltiplo de 4 px.`);
  });

  // Valores históricamente problemáticos que no son parte de la escala.
  const prohibidos = ["13px", "37px", "60px", "77px"];
  prohibidos.forEach((valor) => {
    if (css.includes(`: ${valor}`)) error(`Aparece el valor no modular ${valor} en styles.css.`);
  });
}

console.log("Agresti.3D — validación de catálogo y sistema de diseño\n");
validarCatalogo();
validarSpacing();

if (avisos.length) {
  console.log(`\nAvisos (${avisos.length}):`);
  avisos.forEach((mensaje) => console.log(`  • ${mensaje}`));
}
if (problemas.length) {
  console.log(`\nErrores (${problemas.length}):`);
  problemas.forEach((mensaje) => console.log(`  ✗ ${mensaje}`));
  process.exit(1);
}
console.log("\n✅ Sin errores.");
