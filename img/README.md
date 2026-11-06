# Fotos del sitio

Acá van las fotos reales por temporada para las fichas del catálogo. El collage
del inicio se arma automáticamente con fotos de `img/productos/`.

## Carpetas

| Carpeta | Se usa desde | Hasta |
| --- | --- | --- |
| `halloween` | 15 de septiembre | 14 de noviembre |
| `navidad` | 15 de noviembre | 6 de enero |
| `predeterminado` | 7 de enero | 14 de septiembre |

Si una carpeta está vacía, el sitio muestra las ilustraciones. Nunca queda un
hueco.

## Nombre de los archivos

```
img/halloween/01.jpg   → ficha 1 del catálogo (Jarrón Onda)
img/halloween/02.jpg   → ficha 2 (Maceta Geoda)
img/halloween/03.jpg   → ficha 3 (Organizador Grid)
img/halloween/04.jpg   → ficha 4 (Llavero a medida)
img/halloween/05.jpg   → ficha 5 (Figura Bloop)
img/halloween/06.jpg   → ficha 6 (Set de posavasos)
```

- Formatos aceptados: `.jpg`, `.jpeg`, `.png`, `.webp`.
- **No saltear números.** Si falta el `03`, el `04` tampoco se usa.
- Los nombres van en minúscula y sin espacios.
- Ideal: fotos cuadradas (1:1) de 1200 × 1200 px, fondo claro y parejo.

## Reglas

- Las carpetas van en minúscula, sin acentos y sin espacios. Ej: `dia-de-la-madre`.
- Si agregás una carpeta nueva, hay que sumarla en `js/seasons.js` con su rango
  de fechas. Si no, el sitio no la va a mirar.
- No hace falta agregar `hero.jpg`: el inicio elige productos y texto según el
  calendario argentino.
- Si cambiás una foto y seguís viendo la vieja, subí `PHOTO_CACHE` en
  `js/seasons.js`.

## Ojo

El texto de las 6 fichas (nombre, descripción, precio) es fijo. Si las fotos de
una temporada son de **otros productos**, hay que cambiar también los textos.
