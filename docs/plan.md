# Agresti.3D — Plan del proyecto

## Rumbo (definido 24/10/2026)

Tienda de **objetos impresos en 3D para vender**, con una estética y una lógica
parecida a la de MakerWorld: productos lindos y útiles (deco, hogar, juguetes,
accesorios, regalos personalizados), no piezas técnicas.

- **Materiales: solo PLA, PETG y TPU.** Nada de ABS, resina, nylon ni fibra de carbono.
- **No se hacen repuestos técnicos ni trabajos industriales.**
- Venta inicial por **WhatsApp** (catálogo + pedido). Carrito y pago online, etapa 2.

## Estado

- [x] Estructura de carpetas
- [x] Logo definido: Opción A + naranja (`assets/logo/agresti-a.svg`)
- [x] Home maquetada (HTML/CSS/JS, responsive, accesible)
- [x] Home reorientada a catálogo de productos
- [x] Filtros por categoría y pedido por WhatsApp desde cada ficha
- [x] Sección de materiales (PLA / PETG / TPU) y FAQ adaptada
- [x] Ilustraciones provisorias de producto (6 fichas + composición del hero)
- [x] Auditoría de diseño aplicada (foco, contraste AA, targets táctiles, errores del formulario)
- [x] Verificado en navegador a 390 px y escritorio
- [x] Logo sin el subtítulo "Impresión 3D", nombre centrado con la marca
- [x] Email e Instagram reales
- [x] Fotos por temporada (`img/halloween`, `img/navidad`, `img/resto-del-ano`)
- [x] Legibilidad: cuerpo a 16 px, medida de línea acotada y escala tipográfica consolidada
- [x] Catálogo por datos: árbol de categorías y productos en `data/catalog.json`
- [x] Navegación por ramas con migas y URL compartible (`#cat=hogar/cocina`)
- [x] Favoritos sin cuenta (`localStorage`) y pedido de la lista por WhatsApp
- [x] Primer lote de catálogo: 29 productos con foto (30/10/2026)
- [x] WhatsApp de Buenos Aires: +54 9 11 6995-7575; contactos administrables en el catálogo
- [x] Tema oscuro "noche" inspirado en Spark de macOS, variante 1 (30/10/2026)
- [x] Fotos reales de las 25 figuras + 3 mates de personaje: recorte con margen amplio y fondo crema parejo (30/10/2026)
- [x] Catálogo en 38 productos con foto, sin recortes de placa de Instagram (30/10/2026)
- [x] Recortes rehechos sin comerse bordes: caja sobre la máscara cruda + 6 % de aire, alfa sin erosión, color estirado hacia el borde. 14 fotos revisadas una por una contra el original (30/10/2026)
- [ ] Reemplazar la foto del Terrier por una de mayor resolución (la única que hay es 397×600)
- [ ] Precios de mates y figuras de acción (solo tienen los de las placas)
- [x] Licencias: decisión del 30/10/2026 — se publica sin nombres de marca y con el riesgo asumido por el cliente
- [x] Fase 1 y 2 del catálogo: árbol de categorías editable por JSON + favoritos sin cuenta (30/10/2026)
- [x] Publicado en Firebase Hosting: https://agresti3d.web.app (`firebase deploy`) (30/10/2026)
- [x] Dirección sin guion: https://agresti3d.web.app como principal y https://agresti-3d.web.app como alias, publicadas juntas (06/11/2026)
- [x] Marca del sitio en cada ficha, dibujada por CSS sobre la foto y no dentro del archivo (30/10/2026)
- [x] Categoría Milkshakes y etiqueta de categoría como filtro (30/10/2026)
- [x] Vista previa del link con marca: `assets/og.jpg` 1200×630 + etiquetas `og:image` (30/10/2026)
- [x] Editor local del catálogo: productos, categorías anidadas y publicación confirmada en Firebase Hosting; fotos con recorte local mediante Vision y respaldo antes de guardar, también desde Safari (01/11/2026)
- [x] Catálogo organizado por categorías principales y páginas de nueve productos para mantener filas de tres en escritorio (01/11/2026)
- [x] Aplicación macOS `tools/publicar/Publicar.app` para publicar Firebase Hosting con doble clic y confirmación (01/11/2026)
- [x] Catálogo reorganizado publicado en Firebase Hosting (01/11/2026)
- [x] Hero con collage de productos del catálogo y campañas automáticas del calendario argentino (01/11/2026)
- [x] Fichas individuales con descripción corta/larga y características editables; altura, ancho y largo se cargan por separado (01/11/2026)
- [x] Al volver de una ficha, se recuperan la página y la posición del producto; al actualizar el inicio, vuelve arriba (01/11/2026)
- [x] Selector de sucursal en todos los pedidos por WhatsApp y administración de contactos desde el editor
- [x] Primera etiqueta general de marca: vectorial, 15 × 4 cm, con QR al catálogo (01/11/2026)
- [x] Disponibilidad de productos por sucursal, editable y visible en cada ficha (01/11/2026)
- [x] Videos de producto (MP4/WEBM/MOV): carga desde el editor local, guardado en `img/productos/` y reproducción en la ficha con controles nativos; etiqueta ▶ Video en la tarjeta (06/11/2026)
- [x] Videos como última diapositiva de la galería de la ficha, después de las fotos (06/11/2026)
- [x] Visor de fotos a pantalla completa en la ficha, con flechas, teclado, deslizamiento y contador (06/11/2026)
- [x] Sin zoom accidental: viewport sin escala, `touch-action` y bloqueo de gestos de pellizco; decisión del cliente con la salvedad de accesibilidad (06/11/2026)
- [ ] Dominio propio (el hosting ya está resuelto)
- [x] Carrito sin cuentas: agregar varios productos, cantidades, total estimado y pedido por WhatsApp (06/11/2026)
- [x] Slogan del hero: “Diseños que cobran vida” (06/11/2026)
- [x] Editor en pestañas (Productos, Categorías, Sucursales, Instagram) y ficha dividida en secciones (06/11/2026)
- [x] Instagram fase 1: post 1080 × 1080 + caption + hashtags editables, con descarga y copiado (06/11/2026)
- [x] Instagram fase 2: story 9:16 y carrusel de 3 (portada, detalle y CTA), con descarga individual o de las tres (06/11/2026)
- [x] Instagram fase 3: calendario mensual, historial por producto, estados planificado/publicado y exportación CSV (06/11/2026)
- [x] Etiquetas para bolsas: ancho/alto configurables, logo, slogan, QR, datos opcionales e impresión individual o A4 (06/11/2026)
- [x] Etiquetas: botón de máximo en A4 y PDF limpio sin encabezados/pies del navegador (06/11/2026)
- [ ] Etapa 2: cobro online (el carrito ya está resuelto sin cuentas)
- [ ] Definir variantes de etiquetas por producto y necesidades de packaging

## Tratamiento de las fotos de producto (definido 30/10/2026)

- Se recorta el sujeto con Vision (`VNGenerateForegroundInstanceMaskRequest`) y se
  recompone sobre un lienzo cuadrado de 1200×1200 **con transparencia** (WEBP con alfa,
  calidad 86, ~100 KB por ficha).
- **Sin fondo propio.** El producto flota sobre la superficie de la tarjeta: no hay
  rectángulo de foto ni borde, y funciona tanto en el tema oscuro como en uno claro.
  Primero se probó con fondo crema: sobre el tema noche quedaba una isla clara por ficha.
- El sujeto se limita a 880 px de alto (o 760 de ancho si es horizontal) para que
  **nunca quede cortado** y respire dentro de la ficha. Antes se recortaba a 1040 px
  y las figuras se veían apretadas contra el borde.
- La sombra es de contacto y va en el canal alfa (negro al 34 %, desenfocado): se oscurece
  sola sobre cualquier fondo, sin halo.
- La caja del recorte se calcula sobre la **máscara cruda** con **6 % de aire**, y el alfa
  **no se erosiona**. El 30/10/2026 la versión anterior (2 % de aire + erosión) se comía
  un pedazo de cada figura: pies, bases y laterales. El alfa se suaviza, y el color del
  producto se estira hacia el borde para que no quede halo claro sobre el tema oscuro.
- Pipeline reproducible: `tools/recortar-fotos.py` (+ `tools/mask.swift`). Deja una
  comparación original/recorte por producto para revisar antes de publicar.
- Nada de marcos ni badges dentro de la imagen: el precio y la categoría los dibuja el
  catálogo, no la foto.
- Los originales viven en `img/productos/_originales/` y **no se publican**.

## Estructura de carpetas

```
Pagina Web/
├─ index.html          → home y estructura de la página
├─ data/catalog.json   → categorías en árbol + productos
├─ css/styles.css      → estilos
├─ js/
│  ├─ config.js        → número heredado para catálogos anteriores
│  ├─ catalog.js       → catálogo, ramas y favoritos
│  ├─ main.js          → menú, formulario y pedidos
│  └─ seasons.js       → fotos por temporada
├─ tools/catalogo/     → editor visual local; excluido de Firebase Hosting
├─ img/productos/      → fotos reales de productos
├─ assets/
│  ├─ logo/            → logo actual y versiones finales (SVG/PNG)
│  ├─ img/             → ilustraciones provisorias
│  └─ icons/           → íconos y favicons
└─ docs/               → notas del proyecto
```

## Stack

Sitio estático: HTML + CSS + JavaScript puro.
Sin build, sin dependencias. Se puede abrir con doble clic y publicar en
Netlify / Vercel / GitHub Pages / hosting propio.

## Secciones del sitio

1. **Hero** — qué se vende y a quién.
2. **Catálogo** — productos con navegación por ramas (Hogar → Cocina → Mates) y favoritos.
3. **Materiales** — PLA, PETG y TPU explicados en lenguaje simple.
4. **Cómo comprar** — elegir, confirmar, recibir.
5. **Pedido** — formulario que arma el mensaje de WhatsApp.
6. **Preguntas** — materiales, colores, plazos, envíos, licencias, uso real.

## Pendientes del cliente

- **Precios** de mates y figuras de acción (sobre todo los 3 mates de personaje nuevos).
- **Foto del Terrier** en mejor resolución: la que subió es de 397×600 y se nota blanda.
- **Colores disponibles** (foto o lista de la carta de colores).
- **Zona de entrega, envíos y medios de pago.**
- **Fotos nuevas** a medida que sume modelos: mismo encuadre (producto centrado,
  fondo liso, sin texto ni precio encima) y el pipeline las deja parejas.
- **Licencias:** definido que se publica sin nombres de marca y con el riesgo
  asumido por el cliente. No se vuelve a plantear.

## Ilustraciones provisorias (histórico)

Ya no se usan en el catálogo: las fichas tienen fotos propias. Los SVG planos
con la paleta de la marca se conservan como material histórico y para las fichas
de temporada cuando la carpeta está vacía:

| Archivo | Producto |
| --- | --- |
| `hero-products.svg` | Composición anterior del hero; ya no se muestra |
| `piece-01.svg` | Jarrón Onda |
| `piece-02.svg` | Maceta Geoda |
| `piece-03.svg` | Organizador Grid |
| `piece-04.svg` | Llavero a medida |
| `piece-05.svg` | Figura Bloop |
| `piece-06.svg` | Set de posavasos |

Regla: al reemplazar una imagen, subir el `?v=` en `index.html` para evitar caché.

## Etapas

- **Etapa 1 — Catálogo + pedidos por WhatsApp.** Es lo que está armado ahora:
  falta cargar fotos, productos, precios y datos reales. Publicable en días.
- **Etapa 2 — Cuentas y carrito.** Decidido el 30/10/2026: **no** se guardan
  cuentas de usuario ni se cobra online. Los favoritos viven en el navegador y el
  pedido se cierra por WhatsApp. Si algún día se retoma, el camino natural es
  Supabase (base + login) y MercadoPago, y hay que asumir el mantenimiento.
- **Etapa 3 — Contenido y redes.** Fotos de proceso, reels de impresión,
  historias destacadas y catálogo actualizado.
