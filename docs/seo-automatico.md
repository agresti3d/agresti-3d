# SEO automático al publicar

Al tocar **Publicar en la web** en el editor cloud:

1. Se guarda el catálogo en Firestore.
2. El editor lee el token de GitHub en `config/github` (solo administrador).
3. Llama a GitHub Actions para ejecutar `deploy.yml`.
4. El workflow regenera las páginas de producto, el sitemap y publica Hosting.

## Token

- Es un token **fine-grained** de GitHub, limitado al repositorio
  `agresti3d/agresti-3d`.
- Permiso: **Actions: Read and write**.
- Vence el **4 de febrero de 2027**.
- Vive en Firestore: `config/github` → campo `token`.
- Las reglas permiten leerlo solo a `agresti.3d@gmail.com`; no se puede escribir
  desde la app.

## Si vence o se revoca

El catálogo se sigue publicando igual; el editor muestra un aviso y el SEO se
actualiza con el cron cada 6 horas o ejecutando el workflow a mano.

Para renovarlo:

1. GitHub → Settings → Developer settings → Fine-grained tokens.
2. Generar uno nuevo con acceso a `agresti-3d` y permiso **Actions: Read and write**.
3. Firebase Console → Firestore → `config/github` → editar `token`.
4. Probar publicando algo o ejecutando el workflow.

## Probar sin publicar

GitHub → Actions → **Publicar sitio y regenerar SEO** → **Run workflow**.

## Seguridad

- El token no está en el código ni en el repositorio.
- No tiene permiso para modificar archivos ni hacer push.
- Solo puede disparar workflows del repositorio.
