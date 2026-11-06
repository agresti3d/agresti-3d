# Automatizar publicación y SEO con GitHub Actions

El sitio se publica con dos mecanismos:

- **Firestore:** el catálogo se actualiza al instante desde el editor cloud.
- **GitHub Actions:** regenera las páginas estáticas de producto, el sitemap y
  publica Hosting. Corre al hacer push, manualmente y cada 6 horas.

## 1. Crear el repositorio

1. En GitHub, creá un repositorio **privado** (sin README).
2. En esta carpeta:

```bash
git remote add origin https://github.com/TU_USUARIO/agresti-3d.git
git branch -M main
git push -u origin main
```

## 2. Crear la cuenta de servicio de Firebase

1. Firebase Console → ⚙️ **Configuración del proyecto** → **Cuentas de servicio**.
2. **Generar nueva clave privada**.
3. Se descarga un JSON. No lo subas al repositorio.
4. En Google Cloud IAM, la cuenta debe tener el rol **Firebase Hosting Admin**
   (`roles/firebasehosting.admin`).

## 3. Guardar el secreto en GitHub

1. Repositorio → **Settings** → **Secrets and variables** → **Actions**.
2. **New repository secret**.
3. Nombre: `FIREBASE_SERVICE_ACCOUNT`.
4. Valor: el JSON completo de la cuenta de servicio.

## 4. Probar

1. Repositorio → **Actions** → **Publicar sitio y regenerar SEO**.
2. **Run workflow** → **Run workflow**.
3. Debe generar `productos/`, `sitemap.xml`, `robots.txt` y publicar en
   `https://agresti3d.web.app`.

## Frecuencia

- Push a `main`: publica y regenera.
- Cada 6 horas: vuelve a leer el catálogo publicado en Firestore y regenera las
  páginas de producto.
- Manual: después de una importación grande, ejecutá el workflow a mano.

El catálogo visible se actualiza al instante desde Firestore. Al publicar desde
el editor cloud se dispara el workflow automáticamente; el cron de 6 horas queda
como respaldo. Ver `docs/seo-automatico.md`.

## Notas

- `productos/`, `sitemap.xml` y `robots.txt` se generan en el runner y no se
  commitean (están en `.gitignore`).
- El workflow no toca Firestore ni las reglas; solo Hosting.
- El secreto nunca se imprime en los logs.
