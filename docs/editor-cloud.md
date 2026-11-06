# Editor cloud — estado y puesta en marcha

El editor cloud vive en `editor/` y se publica en:

**https://agresti3d.web.app/editor/**

No depende de la Mac. Usa Firebase Authentication, Firestore y Hosting; las
fotos y los videos se alojan en Cloudinary (plan gratuito).

## Arquitectura

- **Login:** Firebase Auth, email/contraseña. Solo el email configurado en
  `editor/cloud-config.js` (`agresti.3d@gmail.com`) puede entrar.
- **Catálogo:** un documento JSON en Firestore.
  - `catalogo/borrador`: lo que se está editando.
  - `catalogo/publicado`: lo que lee el sitio.
- **Fotos y videos:** Cloudinary, subida directa desde el navegador con un
  upload preset unsigned.
- **Sitio público:** `js/catalog.js` intenta leer `catalogo/publicado` desde
  Firestore y, si no existe o falla, usa `data/catalog.json`.
- **Imágenes nuevas:** se les quita el fondo en el navegador con
  `@imgly/background-removal`; después se recortan a 1200 × 1200 y se suben a
  Cloudinary.

## Estado actual (06/11/2026)

- Authentication con Email/Password habilitado.
- Firestore creado en edición Standard y reglas desplegadas.
- Cloudinary configurado: cloud `ejl0yvoo`, preset `agresti3d_unsigned`.
- Editor desplegado en `/editor/` y visible online.
- Verificado: subida de imagen PNG/WebP y video a Cloudinary; reglas públicas de Firestore; el sitio sigue funcionando con el catálogo estático como respaldo.
- **Pendiente:** iniciar sesión con el usuario admin y ejecutar **Importar catálogo actual**.

## Configuración aplicada

1. **Firebase Authentication**
   - Consola → Authentication → Comenzar.
   - Sign-in method → Email/Password → Habilitar.
   - Users → agregar `agresti.3d@gmail.com` con una contraseña.

2. **Firestore**
   - Consola → Firestore Database → Crear base de datos.
   - Modo producción, región `southamerica-east1` o `nam5`.

3. **Cloudinary**
   - Crear cuenta gratis.
   - Settings → Upload → Upload presets → Add upload preset.
   - Nombre: `agresti3d_unsigned`; Signing mode: **Unsigned**.
   - Copiar el **Cloud name** y completarlo en `editor/cloud-config.js`:

   ```js
   cloudinary: {
     cloudName: "TU_CLOUD_NAME",
     uploadPreset: "agresti3d_unsigned",
     folder: "agresti3d",
   },
   ```

4. **Reglas de Firestore**

   ```bash
   firebase deploy --only firestore:rules --project agresti-3d
   ```

5. **Publicar el editor y el sitio**

   ```bash
   firebase deploy --only hosting --project agresti-3d
   ```

## Herramientas online

- **Instagram:** feed 1:1, story 9:16, carrusel, logo, QR, calendario e historial.
- **Etiquetas:** medidas, logo, QR, copias, máximo en A4 e impresión desde el navegador.
- URL: `/editor/herramientas/`.
- El catálogo que usan es el publicado en Firestore; no dependen de la Mac.

## Migración del catálogo actual

Con el login funcionando y Cloudinary configurado:

1. Entrar a `/editor/`.
2. Tocar **Importar catálogo actual**.
3. El editor lee `data/catalog.json`, sube las 193 imágenes y los videos a
   Cloudinary, reemplaza las rutas y guarda el catálogo como borrador y
   publicado.

Al terminar, el sitio deja de usar `data/catalog.json` y pasa a leer
`catalogo/publicado`. El archivo estático queda como respaldo.

## Seguridad

- `firestore.rules` permite lectura pública solo de `catalogo/publicado`.
- El borrador y las escrituras requieren el email admin.
- El token de Cloudinary no existe: se usa un preset unsigned, que solo permite
  subir archivos, no administrar la cuenta.
- No hay contraseñas ni secretos en el repositorio.

## Limitaciones actuales

- El editor cloud cubre productos, categorías, precios, stock por sucursal,
  variantes, descripciones, fotos y videos.
- El sitio muestra el stock y las opciones/variantes en la ficha.
- **Instagram y Etiquetas online:** están en `/editor/herramientas/`, enlazadas desde la pestaña **Instagram y etiquetas** del editor cloud. Usan el catálogo publicado en Firestore.
- El **PDF sin encabezados** de las etiquetas dependía del servidor local; en la versión online se imprime desde el navegador. Si se necesita el PDF limpio, falta implementarlo en la nube.
- El recorte de fondo en el navegador la primera vez descarga un modelo grande;
  en el celular puede tardar.

## Rollback

El sitio mantiene `data/catalog.json` como respaldo. Si Firestore falla, el
catálogo estático sigue funcionando. Para volver atrás, se puede borrar
`catalogo/publicado` y el sitio usará el JSON estático.
