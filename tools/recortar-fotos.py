#!/usr/bin/env python3
"""
Recorta una foto de producto y la deja lista para el catálogo:
WEBP 1200x1200 con transparencia, sujeto centrado y sombra al pie.

Uso:
    python3 tools/recortar-fotos.py despertando-bruja=IMG_3254.JPG mate-rojo=IMG_1234.jpg
    python3 tools/recortar-fotos.py --entrada foto.jpg --salida recorte.webp

Si el producto tiene partes claras o brillantes adentro (una etiqueta, un
reflejo), el aislador a veces las toma como fondo y deja un hueco. Para esos
casos se rellenan los huecos internos:
    python3 tools/recortar-fotos.py --huecos posavasos-vinilo=foto.tiff

El nombre de la izquierda es el id del producto en data/catalog.json; el de la
derecha es el archivo dentro de img/productos/_originales/.
Los originales NUNCA se modifican: solo se leen.

Para revisar, deja en /tmp/agresti-rectes/comparaciones/ la foto original al
lado del recorte final. Si algo quedó cortado, se ve ahí enseguida.
"""
import argparse
import os
import subprocess
import sys
import tempfile

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps

SITIO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(SITIO, "img", "productos")
ORIG = os.path.join(SRC, "_originales")
TMP = os.path.join(tempfile.gettempdir(), "agresti-rectes")
W = os.path.join(TMP, "work")
CHK = os.path.join(TMP, "comparaciones")

L = 1200                 # lienzo cuadrado
ALTO_MAX, ANCHO_MAX = 880, 760
BASE_Y = 1010            # dónde apoya el producto
MARGEN = 0.06            # aire alrededor del recorte (6 % del lado mayor)
# El recorte se calcula sobre la máscara cruda, sin erosionarla, para conservar
# pies, bases y bordes completos.
FONDO_TARJETA = (13, 24, 44)
RELLENAR_HUECOS = False   # --huecos: tapa los huecos internos del aislador


def binario_mask():
    """Compila el aislador de sujeto (Vision) si hace falta."""
    destino = os.path.join(tempfile.gettempdir(), "agresti-mask")
    if os.path.exists(destino):
        return destino
    fuente = os.path.join(SITIO, "tools", "mask.swift")
    print("Compilando el aislador de sujeto (una sola vez)…")
    subprocess.run(["swiftc", "-O", fuente, "-o", destino], check=True)
    return destino


def _alcanzado_desde_el_borde(binaria):
    """Devuelve el fondo que sí se alcanza desde el borde de la foto."""
    fuera = ImageOps.invert(binaria)          # fondo 255, sujeto 0
    for xy in ((0, 0), (fuera.width - 1, 0), (0, fuera.height - 1),
               (fuera.width - 1, fuera.height - 1)):
        if fuera.getpixel(xy) == 255:
            ImageDraw.floodfill(fuera, xy, 128)
    return fuera.point(lambda v: 255 if v == 128 else 0)


def rellenar_huecos(m):
    """Tapa los huecos internos de la máscara del aislador.

    El aislador de sujeto a veces descarta una parte clara del producto (la
    etiqueta azul de un disco sobre mesa blanca, por ejemplo) y deja un agujero
    en medio de la silueta. Acá se buscan los huecos que no tocan el borde de
    la foto y se rellenan: el contorno exterior no cambia, solo se cierran
    agujeros que están adentro del producto.

    El relleno se calcula sobre una copia de la máscara con un cierre
    morfológico chico. Sin eso, una grieta de 1-2 px que llega hasta el borde
    (el contorno dibujado de una oreja, por ejemplo) deja pasar el relleno y
    el hueco de adentro queda sin tapar: el borde suave termina partiendo esa
    grieta en varios puntitos transparentes dentro del producto.
    """
    binaria = m.point(lambda v: 255 if v > 40 else 0)
    # Cierre morfológico: dilatar y volver a erosionar. Sella dos cosas que
    # el aislador deja mal y que después se ven como una línea o un agujero
    # dentro del producto:
    #   - las costuras finas (el contorno dibujado de una oreja, por ejemplo,
    #     sale con alfa bajo aunque no es fondo),
    #   - las grietas de 1-2 px que llegan hasta el borde y dejaban pasar el
    #     relleno de huecos.
    # Solo actúa sobre concavidades más finas que el radio: el contorno de
    # afuera queda igual.
    sellada = binaria.filter(ImageFilter.MaxFilter(5)).filter(
        ImageFilter.MinFilter(5))
    exterior = _alcanzado_desde_el_borde(sellada)
    # Hueco = fondo encerrado, no alcanzado desde el borde de la foto.
    huecos = ImageChops.subtract(ImageOps.invert(sellada), exterior)
    return ImageChops.lighter(m, ImageChops.lighter(sellada, huecos))


def tapar_burbujas(a):
    """Segunda pasada: si después de suavizar el borde queda algún puntito
    transparente encerrado adentro del producto, se tapa igual.

    Es el mismo criterio que rellenar_huecos() pero sobre el alfa ya suavizado,
    porque el suavizado puede fragmentar una grieta fina en varias burbujas.
    Solo se usa con --huecos, y solo toca zonas encerradas: el contorno de
    afuera no se modifica.
    """
    binaria = a.point(lambda v: 255 if v > 128 else 0)
    exterior = _alcanzado_desde_el_borde(binaria)
    huecos = ImageChops.subtract(ImageOps.invert(binaria), exterior)
    return ImageChops.lighter(a, huecos)


def recortar(ruta, mask_bin):
    """Devuelve (objeto RGB, alfa L) recortados sin comerse nada."""
    im = ImageOps.exif_transpose(Image.open(ruta)).convert("RGB")
    if max(im.size) > 2000:
        e = 2000 / max(im.size)
        im = im.resize((int(im.width * e), int(im.height * e)), Image.LANCZOS)
    im.save(os.path.join(W, "in.jpg"), "JPEG", quality=96)
    subprocess.run([mask_bin, os.path.join(W, "in.jpg"),
                    os.path.join(W, "mask.png")], check=True, capture_output=True)
    m = Image.open(os.path.join(W, "mask.png")).convert("L")
    m = m.resize(im.size, Image.LANCZOS)
    if RELLENAR_HUECOS:
        m = rellenar_huecos(m)

    # La caja se calcula sobre la máscara CRUDA: si el aislador detectó una
    # parte (un pie, una base), la caja la incluye.
    caja = m.point(lambda v: 255 if v > 40 else 0).getbbox()
    if caja is None:
        caja = (0, 0, im.width, im.height)
    x0, y0, x1, y1 = caja
    pad = max(12, int(max(x1 - x0, y1 - y0) * MARGEN))
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(im.width, x1 + pad), min(im.height, y1 + pad)
    im = im.crop((x0, y0, x1, y1))
    m = m.crop((x0, y0, x1, y1))

    # El alfa NO se erosiona (eso era lo que comía los bordes): solo se
    # suaviza y se ajusta el escalón del contorno.
    a = m.filter(ImageFilter.GaussianBlur(0.7))
    a = a.point(lambda v: int(min(255, max(0, (v - 18) * 255 / 225))))
    return im, a


def decontaminar(rgb, a):
    """Estira el color del producto hacia afuera del borde: así el borde
    suave toma el color real y no queda un halo claro del fondo."""
    conocido = a.point(lambda v: 255 if v > 200 else 0)
    ext = rgb
    for _ in range(12):
        ext = Image.composite(rgb, ext.filter(ImageFilter.GaussianBlur(3)),
                              conocido)
    return ext


def componer(obj, a, destino):
    rgb = decontaminar(obj, a)
    esc = min(ANCHO_MAX / obj.width, ALTO_MAX / obj.height)
    nw, nh = max(1, int(obj.width * esc)), max(1, int(obj.height * esc))
    rgb = rgb.resize((nw, nh), Image.LANCZOS)
    a = a.resize((nw, nh), Image.LANCZOS)
    px, py = (L - nw) // 2, BASE_Y - nh

    lienzo = Image.new("RGBA", (L, L), (0, 0, 0, 0))
    sombra = Image.new("L", (L, L), 0)
    sombra.paste(a, (px, py + 18))
    sombra = sombra.filter(ImageFilter.GaussianBlur(26)).point(
        lambda v: int(v * 0.34))
    capa = Image.new("RGBA", (L, L), (0, 0, 0, 0))
    capa.putalpha(sombra)
    lienzo = Image.alpha_composite(lienzo, capa)

    o = rgb.convert("RGBA")
    o.putalpha(a)
    sub = Image.new("RGBA", (L, L), (0, 0, 0, 0))
    sub.paste(o, (px, py))
    lienzo = Image.alpha_composite(lienzo, sub)
    lienzo.save(destino, "WEBP", quality=88, method=6)
    return nw, nh


def comparacion(orig_path, final_path, salida):
    """Original al lado del recorte, para revisar que no falte ningún pedazo."""
    o = ImageOps.exif_transpose(Image.open(orig_path)).convert("RGB")
    o.thumbnail((520, 680), Image.LANCZOS)
    f = Image.open(final_path).convert("RGBA")
    fin = Image.new("RGB", f.size, FONDO_TARJETA)
    fin.paste(f, (0, 0), f)
    fin.thumbnail((520, 680), Image.LANCZOS)
    alto = max(o.height, fin.height)
    hoja = Image.new("RGB", (o.width + fin.width + 30, alto + 34), (24, 24, 28))
    hoja.paste(o, (0, 34))
    hoja.paste(fin, (o.width + 30, 34))
    d = ImageDraw.Draw(hoja)
    d.text((8, 10), "ORIGINAL", fill=(230, 230, 230))
    d.text((o.width + 38, 10), "RECORTE", fill=(230, 230, 230))
    hoja.save(salida, "JPEG", quality=88)


def procesar_archivo(ruta, destino, mask_bin, comparacion_path=None):
    obj, a = recortar(ruta, mask_bin)
    if RELLENAR_HUECOS:
        a = tapar_burbujas(a)
    os.makedirs(os.path.dirname(os.path.abspath(destino)), exist_ok=True)
    dimensiones = componer(obj, a, destino)
    if comparacion_path:
        comparacion(ruta, destino, comparacion_path)
    return dimensiones


def main(argv=None):
    global RELLENAR_HUECOS
    parser = argparse.ArgumentParser(description="Recorta fotos de productos con transparencia.")
    parser.add_argument("--huecos", action="store_true", help="Rellena huecos internos de la máscara.")
    parser.add_argument("--entrada", help="Procesa una imagen desde esta ruta.")
    parser.add_argument("--salida", help="Guarda el WEBP transparente en esta ruta.")
    parser.add_argument("pares", nargs="*", help="Procesamiento por lote: id=archivo en _originales.")
    args = parser.parse_args(argv)
    RELLENAR_HUECOS = args.huecos

    if args.entrada or args.salida:
        if not args.entrada or not args.salida or args.pares:
            parser.error("--entrada y --salida se usan juntas y no se combinan con id=archivo.")
        if not os.path.isfile(args.entrada):
            parser.error(f"no existe la imagen de entrada: {args.entrada}")
        os.makedirs(W, exist_ok=True)
        procesar_archivo(args.entrada, args.salida, binario_mask())
        return 0

    pares = args.pares
    if not pares:
        print(__doc__)
        return 1
    os.makedirs(W, exist_ok=True)
    os.makedirs(CHK, exist_ok=True)
    mask_bin = binario_mask()
    for par in pares:
        if "=" not in par:
            print("formato esperado: id=archivo.jpg —", par)
            continue
        pid, archivo = par.split("=", 1)
        ruta = os.path.join(ORIG, archivo)
        if not os.path.exists(ruta):
            print("no existe:", ruta)
            continue
        destino = os.path.join(SRC, pid + ".webp")
        nw, nh = procesar_archivo(
            ruta, destino, mask_bin, os.path.join(CHK, pid + ".jpg")
        )
        print(f"{pid:30s} -> {nw}x{nh}  (comparación: {CHK}/{pid}.jpg)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
