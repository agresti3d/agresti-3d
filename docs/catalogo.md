# Cómo cargar productos, fotos y videos

Todo el catálogo vive en **un solo archivo**: `data/catalog.json`.
El editor local lo modifica por vos; no hace falta tocar el JSON a mano.

## Abrir el editor

1. Doble clic en `tools/catalogo/Agresti.3D — Editor.app` y confirmá **Iniciar editor**.
2. Se abre el navegador en `http://localhost:8766/tools/catalogo/`.
3. Para apagarlo, volvé a hacer doble clic en la app y elegí **Apagar editor**.

Alternativa por terminal:

```bash
python3 tools/catalogo/servidor.py     # servidor en http://localhost:8766
python3 tools/catalogo/control-editor.py status|start|stop
```

Si abrís `tools/catalogo/index.html` con doble clic (sin servidor), el editor
carga una copia del catálogo desde `data/catalog.js` y muestra un aviso: en ese
modo se puede mirar y descargar, pero **para guardar en el proyecto hay que
usarlo desde la app o el servidor**. Si el servidor está corriendo, la página
pasa sola a `http://localhost:8766/tools/catalogo/`.

`data/catalog.js` es una copia embebida de `catalog.json` que se regenera sola
cada vez que guardás desde el editor. No se publica en Firebase.

## Flujo de trabajo

1. Elegí un producto de la lista o creá uno nuevo.
2. Completá la ficha y guardala como **borrador**.
3. Agregá fotos y videos (se guardan en `img/productos/`).
4. Guardá el catálogo en esta computadora (**Catálogo guardado**).
5. Si querés publicar, confirmá **Publicar en la web** (Firebase Hosting).

El editor crea un respaldo del catálogo en `tools/catalogo/backups/` antes de
cada guardado.

## Campos del producto

| Campo | Regla |
|-------|-------|
| `id` | minúsculas, números y guiones (`mate-boca-juniors`) |
| `nombre` | el nombre visible en la ficha |
| `categoria` | ID de una categoría existente (árbol `Hogar → Cocina → Mates`) |
| `descripcion` | máximo 300 caracteres, texto real del producto |
| `descripcionLarga` | máximo 2000 caracteres, se muestra en la ficha individual |
| `precio` / `notaPrecio` | si no está confirmado, dejalo vacío (se muestra “A consultar”) |
| `sucursalesDisponibles` | IDs de las sucursales donde se ofrece |
| `stockPorSucursal` | opcional: unidades enteras por ID de sucursal (0 = sin stock) |
| `detalles` | altura, ancho, largo, peso, material, colores, capacidad, etc. |
| `imagenes` | lista de `{ "src", "alt" }` |
| `videos` | lista de `{ "src", "title" }` (opcional) |
| `variantes` | opciones de tamaño/modelo con su precio |

No inventar medidas, materiales, colores ni precios: si falta un dato, se deja
vacío y se anota el pendiente en `docs/plan.md`.

## Fotos

- Formatos de entrada: JPG, PNG, WEBP, HEIC o TIFF (hasta 25 MB).
- macOS quita el fondo y el editor guarda un **WEBP 1200 × 1200 con
  transparencia** (máximo 300 KB).
- La primera foto es la portada. Podés reordenarlas con las flechas.
- Escribí siempre el **texto alternativo** real: “Mate con escudo Boca Juniors
  impreso en 3D”, no “imagen de la foto”.

## Videos

- Formatos: **MP4 (recomendado)**, WEBM o MOV, hasta **50 MB**.
- Se guardan en `img/productos/` con el nombre
  `<id-del-producto>-video-<hash>.mp4`.
- Se muestran en la ficha como **última diapositiva de la galería**, después de
  todas las fotos, con controles nativos (`controls`, `playsinline`,
  `preload="metadata"`).
- En la tarjeta del catálogo aparece una etiqueta **▶ Video**.
- El título del video es opcional; si lo dejás vacío se usa el nombre del
  producto. Ejemplo: “Fabricación capa por capa”.

```json
"videos": [
  {
    "src": "img/productos/mate-boca-juniors-video-3f2a.mp4",
    "title": "Fabricación capa por capa"
  }
]
```

Después de cambiar un video o una foto, el editor guarda la ruta con `?v=`
nuevo para que Firebase y el navegador no muestren la versión vieja.

## Categorías

- Las raíces no tienen `padre` (`null`); las subcategorías apuntan al ID de su
  madre.
- La navegación por ramas usa la URL: `#cat=hogar/cocina/mates`.
- Para agregar una categoría: **Administrar categorías → Crear categoría**.

### Reordenar y mover categorías

En **Administrar categorías → Categorías existentes**, cada fila tiene:

- **↑ / ↓**: mueve la categoría entre sus hermanas (mismo nivel).
- **Mover a**: cambia la categoría principal. “Nivel principal” la convierte en
  raíz; una categoría existente la mete dentro de esa rama.
- No se puede mover una categoría dentro de una de sus propias subcategorías
  (el editor lo bloquea para evitar ciclos).
- Al guardar el catálogo, el orden se escribe en `data/catalog.json` y la
  tienda lo respeta.

### Atajos del editor

- **Cmd/Ctrl + S**: guarda el catálogo en esta computadora.
- **Cmd/Ctrl + Enter**: guarda la ficha del producto como borrador.
- El badge de arriba muestra **Cambios sin guardar** y el título de la pestaña
  se marca con un punto hasta que guardás.

## Publicar en Instagram (fase 1)

En la pestaña **Instagram** del editor:

1. Elegí el producto.
2. Elegí el **formato**: feed 1:1, story 9:16 o carrusel de 3.
3. En carrusel podés elegir **Portada**, **Detalle** o **CTA**; el CTA incluye
   un QR que lleva a `https://agresti3d.web.app/` y con **Descargar las 3** se
   bajan las tres imágenes.
4. Revisá o editá el **texto del post** y los **hashtags**.
5. **Descargar imagen/story**: genera un JPG en la medida elegida.
6. **Copiar caption y hashtags**: deja el texto listo para pegar en Instagram.

La imagen se genera en esta computadora y no se publica sola. Se usa la última
versión guardada del producto; si acabás de cambiarle la foto o el precio,
guardá la ficha y el catálogo antes de generar el post.

Si el producto usa nombres o personajes de terceros, revisá la licencia antes
de publicarlo.

## Calendario e historial de Instagram

Debajo del generador hay un calendario mensual con los productos planificados
o publicados. Se guarda en esta computadora (`localStorage`).

- **Planificar**: guarda el producto en la fecha elegida.
- **Marcar como publicado**: lo registra con la fecha de hoy.
- **Quitar registro**: lo saca del calendario.
- **Descargar CSV**: exporta fecha, producto, estado y formato.

El registro también aparece como etiqueta **IG** en la lista de productos.

## Etiquetas para bolsas

La pestaña **Etiquetas** del editor genera etiquetas para las bolsitas de
polipropileno.

- **Ancho**: de 7 a 20 cm, con atajos de 8, 10 y 15 cm.
- **Alto**: 3 cm por defecto, configurable entre 2 y 6 cm.
- **Copias**: hasta 30.
- **Contenido**: logo, AGRESTI.3D, el slogan “Diseños que cobran vida.”, QR al
  catálogo, `@agresti.3d` e “Impreso en 3D · PLA”. Se pueden apagar.
- **Datos opcionales**: producto/detalle y lote o fecha. Se muestran en
  etiquetas de 12,5 cm de ancho o más.
- **Cuidado**: se puede agregar “Evitá el calor directo”.

### Impresión

- **Etiqueta individual**: genera un PDF del tamaño exacto (por ejemplo
  150 × 30 mm), una página por copia.
- **Hoja A4**: acomoda varias etiquetas con guías punteadas para recortar.
- **Máximo en A4**: calcula cuántas etiquetas entran en una hoja según el
  tamaño elegido y ajusta las copias a ese número (por ejemplo, 16 etiquetas
  de 8 × 3 cm u 8 de 15 × 3 cm).
- **Descargar PDF sin encabezados**: genera un PDF limpio, con el tamaño
  exacto o una hoja A4, sin la URL, la fecha ni el número de página del
  navegador. Se abre con Vista Previa y se imprime desde ahí.

Imprimí al **100 %**, sin “ajustar a la página”. Si la impresora no imprime
sin márgenes, usá Hoja A4 y recortá por las guías. La configuración queda
guardada en esta computadora.

Para que no salgan la URL ni el número de página, en el diálogo de impresión
abrí **Más ajustes** y desactivá **Encabezados y pies de página**. Eso lo
controla el navegador, no la etiqueta.

## Stock por sucursal

En **Sucursales donde está disponible**, cada sucursal tiene un campo de
unidades (`u.`). Se guarda así:

```json
"stockPorSucursal": {
  "buenos-aires-buenos-aires": 3,
  "la-rioja-la-rioja": 0
}
```

- Si el campo queda vacío, la ficha solo dice que está disponible, sin
  cantidad.
- `0` se muestra como **sin stock** en la ficha.
- Solo se guardan cantidades de sucursales marcadas como disponibles.

## Sucursales y WhatsApp

- Cada sucursal tiene `id`, `nombre`, `localidad` y `telefono` (solo dígitos,
  con código de país).
- Todos los pedidos abren el selector de sucursal; no hardcodear teléfonos en
  los enlaces.
- Si un producto no está en una sucursal, no la marques en
  `sucursalesDisponibles`.

## Validaciones antes de publicar

```bash
node tools/catalogo/validar.js
```

Revisa estructura del catálogo, categorías y sucursales, fotos y ALT,
videos, disponibilidad y que los tokens de espaciado sean múltiplos de 4 px.
Sale con código 1 si hay errores.

Checklist rápido:

- [ ] Cada producto tiene al menos una foto WEBP con ALT real.
- [ ] Los videos son MP4 livianos y tienen título descriptivo.
- [ ] No hay precios, teléfonos ni medidas inventadas.
- [ ] Las sucursales disponibles coinciden con la realidad.
- [ ] Guardaste el catálogo y, si corresponde, publicaste.
