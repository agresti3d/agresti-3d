# Agresti.3D — Sitio estático (HTML/CSS/JS puro)

Tienda de objetos impresos en 3D para vender. Venta por WhatsApp (etapa 1), carrito en etapa 2.

## Comandos útiles

- Levantar servidor local: `python3 -m http.server 8766` desde `/Users/gastonagresti/Documents/Agresti 3D/Pagina Web`
- Editor del catálogo y recorte local de fotos: doble clic en `tools/catalogo/Agresti.3D — Editor.app`
- Publicar el sitio: doble clic en `tools/publicar/Publicar.app` y confirmar
- Alternativa técnica: `python3 tools/catalogo/servidor.py` (usa el puerto 8766)
- Ver: `http://localhost:8766/index.html`
- Direcciones publicadas: `https://agresti3d.web.app` (principal) y `https://agresti-3d.web.app` (alias). `firebase deploy --only hosting` actualiza las dos.
- Publicar: `firebase deploy` (config en `docs/publicar.md`)
- Desde el editor: guardar el catálogo en esta computadora y confirmar **Publicar en la web** (solo Hosting)
- Probar sin publicar: `firebase hosting:channel:deploy prueba`

## Stack

- `index.html` — home y estructura de la página
- `css/styles.css` — tokens de `:root`, componentes, responsive (390 / 768 / 1280)
- `css/theme.css` — tema oscuro activo (`.theme-noche`) y variantes de paleta
- `data/catalog.json` — **catálogo**: categorías en árbol, productos y sucursales de WhatsApp
- `data/catalog.js` — copia embebida del catálogo para abrir el editor como archivo local; se regenera al guardar y no se publica
- `js/catalog.js` — dibuja el catálogo, resuelve la navegación por ramas y los favoritos
- `js/main.js` — menú móvil, revelado al scroll, selector de sucursal para WhatsApp, sticky header
- `js/seasons.js` — detecta temporada por fecha y aplica fotos de `img/<temporada>/`
- `js/config.js` — compatibilidad con catálogos antiguos; los teléfonos actuales se editan en `data/catalog.json`
- **tools/catalogo/validar.js** — valida catálogo, ALT, videos y espaciado (`node tools/catalogo/validar.js`)
- Sitio estático: **no build, no dependencias, no frameworks**
- Guía para cargar productos: `docs/catalogo.md`

## Reglas de diseño (no romper)

- **Tema activo: noche (oscuro), inspirado en Spark de macOS.** El `<html>` lleva la clase `theme-noche`.
- Los colores del tema viven en `css/theme.css` (overrides por token bajo `html.theme-noche`). `css/styles.css` tiene los tokens claros de base; no se cambian ahí.
- Paleta: fondo azul profundo (`#070f1f`), superficies `#0d1a30`, texto claro, acento naranja de la marca (`#ff6a3d` para texto y detalles, `#d23c14` en el botón primario porque es el único que pasa AA con texto blanco).
- Contraste mínimo 4.5:1 verificado sobre el fondo oscuro. Si se toca un color, recalcular antes de commitear.
- Las fotos de producto son **WEBP con transparencia** (sin fondo propio): el producto flota sobre la misma superficie de la tarjeta y no aparece el rectángulo de la foto. Sirve igual si algún día vuelve el tema claro.
- Títulos: `font-display`, letra suelta, `line-height: .98` en el hero.
- **Targets táctiles: mínimo 44 px** (chips, botones, iconos sociales, flotante de WhatsApp). Aplicar spacing modular 4/8/16/24/32/48.
- Accesibilidad: foco visible `:focus-visible`, contraste AA, `aria-*`, `prefers-reduced-motion`. **No usar "AI Slop" ni descripciones genéricas de productos.** Use copy real desde Agresti y ALT text descriptivo real.
- **Sin zoom accidental:** el viewport usa `maximum-scale=1, user-scalable=no`; `html`/`body` llevan `touch-action: pan-x pan-y`; los controles usan `touch-action: manipulation` y se bloquean los gestos `gesturestart/change/end` de Safari. Decisión del cliente (06/11/2026): no se puede ampliar con pellizco; tenerlo en cuenta si se revisa accesibilidad.
- **Visor de fotos en la ficha:** al tocar la foto (el cursor cambia a lupa, sin botón aparte) se abre un `<dialog>` a pantalla completa con flechas, teclado (←/→), Escape, deslizamiento y contador. Cerrar devuelve el foco al disparador.
- **Carrito sin cuentas:** estado en `localStorage` (`agresti:carrito`, lista de `{ id, cantidad }`), sin backend ni datos personales. El total suma solo productos con precio; los que dicen “A consultar” se avisan aparte. El pedido se cierra por WhatsApp con el selector de sucursal y el link de cada producto. Controles de cantidad y quitar, mínimo 44 px.
- **Instagram (editor):** la pestaña Instagram genera imágenes en canvas con el logo de la marca, el producto, el nombre, la categoría y el precio, más un caption y hashtags editables. Formatos: **feed 1:1**, **story 9:16** y **carrusel de 3** (portada, detalle y CTA con QR al catálogo). Usa la última versión guardada del producto y el dominio público `https://agresti3d.web.app/#p=<id>`. No publica automáticamente: descarga las imágenes y copia el texto. Revisar licencias antes de publicar.
- **Etiquetas para bolsas (editor):** pestaña para imprimir etiquetas de 3 cm de alto (configurable) y ancho variable de 7 a 20 cm, con logo, nombre, slogan, QR al catálogo, Instagram y datos opcionales de producto/lote. Impresión a escala real o en hoja A4 con guías de corte, botón **Máximo en A4** y **Descargar PDF sin encabezados** (Chrome headless en el servidor local, `--no-pdf-header-footer`); el QR es `branding/etiquetas/catalogo-qr.png`.
- **Instagram: calendario e historial (editor):** los registros viven en `localStorage` (`agresti:instagram`) con estado `planificado`/`publicado`, fecha y formato. Hay calendario mensual, historial y exportación CSV; no hay backend.
- **Videos de producto (opcional):** `videos: [{ src, title }]` en `data/catalog.json`, guardados en `img/productos/` como MP4 (recomendado), WEBM o MOV de hasta 50 MB desde el editor (`/__local/save-video`). En la ficha se muestran como **última diapositiva de la galería**, después de todas las fotos (con controles nativos, `playsinline` y `preload="metadata"`); en la tarjeta aparece la etiqueta **▶ Video**. No usar autoplay con sonido.

## Herramientas activas (impeccable + ui-ux-pro-max + taste-skill)

```bash
# Herramientas de diseño instaladas:
✅ taste-skill     → Criterio anti-slop visual, evitar AI slop
✅ ui-ux-pro-max   → Paleta tema-noche Spark #070f1f / #d23c14
✅ referencias     → Inspiración desde Apple Store, Linear, MakerWorld
✅ impeccable      → Auditoría exhaustiva de cada pantalla

# Subagentes listos:
👷 builder-constructor   → Construye secciones con verificación browser 390/768/1280px
🔍 design-auditor         → Audita fallas (critical/high/medium)
```

## Fotos por temporada (importante)

Carpetas en `img/`:

| Carpeta | Desde | Hasta |
|---------|-------|--------|
| `halloween` | 15 sep | 14 nov |
| `navidad` | 15 nov | 6 ene |
| `resto-del-ano` | 7 ene | 14 sep |

Nombres de archivo obligatorios: `01.jpg` … `06.jpg` (fichas del catálogo en orden). El collage del inicio usa fotos del catálogo y cambia según el calendario argentino; no necesita `hero.jpg`. Si la carpeta está vacía, se mantienen las ilustraciones de `assets/img/piece-0*.svg` en las fichas.

Para agregar una temporada: crear carpeta en `img/` y sumar un objeto a `SEASONS` en `js/seasons.js`.
Las campañas y sus fechas están documentadas en `docs/catalogo.md`.

## Bloqueado (depende del cliente)

- **Precios de mates y figuras de acción** (hoy dicen "A consultar")
- **Foto del Terrier con más resolución**: la única disponible es de 397×600 y se ve blanda comparada con el resto
- **Dominio propio**: el sitio ya está online en `https://agresti3d.web.app` (Firebase Hosting, ver `docs/publicar.md`); falta elegir y conectar el dominio

## Skills del proyecto

En `.agents/skills/` viven tres skills que se activan solas en este proyecto:

| Skill | Para qué |
|-------|----------|
| `agresti-3d` | Contexto y reglas. Punto de entrada: este archivo y `docs/plan.md`. |
| `web-builder` | Construir o modificar secciones, con verificación en navegador obligatoria. |
| `impeccable` | Auditar sin editar. Devuelve hallazgos por severidad. |
| **taste-skill** | Criterio anti-slop visual, evitar AI slop (descripciones genéricas, colores arbitrarios). |
| **ui-ux-pro-max** | Paleta tema-noche (#070f1f / #d23c14), tokens, sistema design. |
| **referencias** | Inspiración desde Apple Store, Linear, MakerWorld. |

Este `AGENTS.md` sigue siendo la fuente de verdad de las reglas de diseño. Las skills operan sobre él, no lo reemplazan.

## Auditorías previas

`docs/plan.md` tiene el estado del proyecto. No editar `js/main.js` sin probar filtros y formulario en localhost.
