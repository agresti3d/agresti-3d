# Publicar el sitio en Firebase Hosting

El sitio es estático (HTML, CSS y JS sin compilar), así que Firebase Hosting
alcanza y sobra: sirve los archivos desde su CDN, da HTTPS y dominio propio sin
costo. No hace falta build ni backend.

La configuración vive en `firebase.json` y ya está probada.

---

## Estado actual

El sitio está publicado en dos direcciones:

- **Principal (sin guion): https://agresti3d.web.app**
- Anterior: https://agresti-3d.web.app

Las dos sirven el mismo contenido y se actualizan juntas. La anterior se mantiene
para no romper links viejos ni el QR de las etiquetas.

- Proyecto: `agresti-3d` (nombre "Agresti 3D"), queda fijado en `.firebaserc`.
- Sitios de Hosting: `agresti3d` (target `principal`) y `agresti-3d` (target
  `anterior`), configurados en `firebase.json` y `.firebaserc`.
- Cuenta de Firebase: **agresti.3d@gmail.com**.
- La terminal tiene autorizadas dos cuentas: `agresti.3d@gmail.com` (la de este
  proyecto) e `infodecasino@gmail.com` (de otro proyecto). La cuenta por
  defecto **para esta carpeta** es la de Agresti.
- Si un deploy responde `403 The caller does not have permission`, casi seguro
  la terminal quedó apuntando a la otra cuenta. Se arregla con:
  `firebase login:use agresti.3d@gmail.com`

## 1. Publicar

### Con doble clic en macOS

Abrí `tools/publicar/Publicar.app` con doble clic y confirmá **Publicar**.
Se abre Terminal para mostrar el avance y el resultado. La aplicación publica
Firebase Hosting del proyecto `agresti-3d`: actualiza los dos sitios.

### Desde Terminal

```bash
firebase deploy --only hosting --project agresti-3d
```

La publicación tarda menos de un minuto y muestra las dos direcciones públicas
y el link a la consola.

## 2. Actualizar el sitio

Cada vez que se agregan productos o se toca el diseño:

```bash
firebase deploy --only hosting --project agresti-3d
```

También se puede repetir el doble clic en `tools/publicar/Publicar.app`.

Firebase guarda las versiones anteriores. Si una publicación sale mal, en la
consola de Firebase (Hosting → historial de versiones) se puede volver a la
anterior con un click.

---

## Qué se publica y qué no

`firebase.json` tiene una lista de exclusiones. Hoy se publican **71 archivos,
3,5 MB**:

| Se publica | No se publica |
|---|---|
| `index.html`, `css/`, `js/`, `data/`, `assets/` | `img/productos/_originales/` (36 MB) |
| `img/productos/*.webp` | `.preview/`, `docs/`, `tools/`, `.agents/`, `.opencode/` |
| | archivos `*.md`, `firebase.json`, `.DS_Store`, carpetas con punto |

`_originales` es lo más importante de esa lista: son las fotos crudas, pesan
36 MB y no tienen por qué viajar a internet (además se verían si alguien
adivina la ruta). Si algún día se agrega una carpeta nueva que no debe
publicarse, se suma a `ignore` en `firebase.json`.

## Caché

El sitio ya usa `?v=N` en las imágenes, el CSS y el JS para forzar la
actualización. La configuración aprovecha eso:

- `index.html` y `data/catalog.json`: sin caché, siempre se piden de nuevo;
- `img/productos/**`: caché de un año (por eso es clave subir el `?v=` al
  reemplazar una foto);
- `css/` y `js/`: caché de un día.

Si se cambia el CSS o el JS, hay que subir su `?v=` en `index.html` (por
ejemplo `js/catalog.js?v=2` → `?v=3`) para que los navegadores tomen el nuevo.

---

## Dominio propio

Al conectar el dominio hay que actualizar dos cosas en `index.html`: las URLs
absolutas de `og:url` y `og:image` (hoy apuntan a `agresti3d.web.app`), porque
la vista previa del link en WhatsApp las lee como dirección completa.

En la consola de Firebase: **Hosting → Agregar dominio personalizado**, se
escribe el dominio (por ejemplo `agresti3d.com.ar`) y Firebase devuelve uno o
dos registros para cargar en el panel donde se compró el dominio (A y TXT).
El certificado HTTPS se genera solo y puede tardar hasta 24 horas.

## Cuánto aguanta el plan gratis

El plan Spark (sin tarjeta) incluye 10 GB de archivos y 360 MB de descarga por
día. Una visita que recorre el catálogo completo son unos 3,5 MB, así que
entran del orden de 100 visitas completas por día; el navegador guarda las
imágenes, por lo que las visitas repetidas gastan mucho menos. Si algún día se
supera el tope, el sitio se pausa hasta el día siguiente: no genera cobro.

Si el negocio crece, el plan Blaze cobra por uso: la descarga adicional sale
USD 0,15 por GB.

## Probar sin publicar

Para mostrarle el sitio a alguien sin mover el sitio oficial:

```bash
firebase hosting:channel:deploy prueba
```

Devuelve una URL temporal que vence en 7 días.

---

## Aclaración sobre las cuentas

Publicar en Firebase **no** agrega usuarios ni carrito con cobro: el sitio
sigue siendo estático y la venta se cierra por WhatsApp. Los favoritos que
marca cada visitante se guardan en su propio navegador (`localStorage`), no en
un servidor.
