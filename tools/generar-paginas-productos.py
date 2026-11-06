#!/usr/bin/env python3
"""Genera páginas SEO por producto y sitemap desde el catálogo publicado."""
import html, json, re, urllib.request
from pathlib import Path
from datetime import date

ROOT = Path(__file__).resolve().parents[1]
API = "AIzaSyCjBR_K_Wk4Kiy7HBMnt0_bfFup45R8na0"
SITE = "https://agresti3d.web.app"
DOC = f"https://firestore.googleapis.com/v1/projects/agresti-3d/databases/(default)/documents/catalogo/publicado?key={API}"

def catalogo():
    try:
        with urllib.request.urlopen(DOC, timeout=20) as r:
            d = json.load(r)
        j = d.get("fields", {}).get("json", {}).get("stringValue")
        if j:
            return json.loads(j)
    except Exception as e:
        print("Firestore no disponible, uso data/catalog.json:", e)
    return json.loads((ROOT / "data" / "catalog.json").read_text(encoding="utf-8"))

def absoluta(src):
    if not src:
        return ""
    if src.startswith(("http://", "https://")):
        return src
    return f"{SITE}/{src.split('?')[0].lstrip('/')}"

def ruta_categoria(cats, cid):
    partes, actual, guard = [], cid, 0
    while actual and guard < 20:
        c = next((x for x in cats if x.get("id") == actual), None)
        if not c: break
        partes.insert(0, c.get("nombre", ""))
        actual = c.get("padre"); guard += 1
    return " / ".join(p for p in partes if p)

def precio_num(precio):
    if not isinstance(precio, str): return None
    digits = re.sub(r"[^\d]", "", precio)
    return int(digits) if digits else None

def disponibilidad(producto):
    stock = producto.get("stockPorSucursal") or {}
    cantidades = [v for v in stock.values() if isinstance(v, int)]
    if cantidades and all(v == 0 for v in cantidades):
        return "https://schema.org/OutOfStock"
    return "https://schema.org/InStock"

def main():
    c = catalogo()
    cats = c.get("categorias", [])
    template = (ROOT / "index.html").read_text(encoding="utf-8")
    base = 'https://agresti3d.web.app'
    generadas = 0
    for p in c.get("productos", []):
        pid = p.get("id", "").strip()
        nombre = p.get("nombre", "").strip()
        if not pid or not nombre: continue
        url = f"{base}/productos/{pid}/"
        imagenes = [absoluta(i.get("src")) for i in p.get("imagenes", []) if i.get("src")]
        imagen = imagenes[0] if imagenes else f"{base}/assets/og-disenos.jpg"
        descripcion = re.sub(r"\s+", " ", p.get("descripcion") or p.get("descripcionLarga") or f"{nombre} impreso en 3D, hecho a pedido.").strip()
        desc_meta = descripcion[:160]
        categoria = ruta_categoria(cats, p.get("categoria"))
        precio = precio_num(p.get("precio"))
        producto_ld = {
            "@context": "https://schema.org", "@type": "Product",
            "name": nombre, "description": descripcion, "sku": pid,
            "image": imagenes[:5], "category": categoria,
            "brand": {"@type": "Brand", "name": "Agresti.3D"},
            "url": url,
        }
        if precio:
            producto_ld["offers"] = {
                "@type": "Offer", "url": url, "priceCurrency": "ARS",
                "price": str(precio), "availability": disponibilidad(p),
                "itemCondition": "https://schema.org/NewCondition",
                "seller": {"@type": "Organization", "name": "Agresti.3D"},
            }
        resenas = p.get("resenas") if isinstance(p.get("resenas"), list) else []
        if resenas:
            ratings = [r.get("rating") for r in resenas if isinstance(r.get("rating"), (int,float))]
            if ratings:
                producto_ld["aggregateRating"] = {
                    "@type": "AggregateRating", "ratingValue": str(round(sum(ratings)/len(ratings),1)),
                    "reviewCount": str(len(ratings)),
                }
        ld = json.dumps(producto_ld, ensure_ascii=False)
        migas = json.dumps({
            "@context":"https://schema.org","@type":"BreadcrumbList",
            "itemListElement":[
                {"@type":"ListItem","position":1,"name":"Inicio","item":f"{base}/"},
                {"@type":"ListItem","position":2,"name":"Productos","item":f"{base}/#productos"},
                {"@type":"ListItem","position":3,"name":nombre,"item":url},
            ],
        }, ensure_ascii=False)
        page = template
        page = page.replace("<head>", '<head>\n  <base href="/">', 1)
        page = re.sub(r"<title>.*?</title>", f"<title>{html.escape(nombre)} — Agresti.3D</title>", page, count=1, flags=re.S)
        page = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{html.escape(desc_meta)}">', page, count=1)
        page = re.sub(r'\s*<meta property="og:[^"]+" content="[^"]*">', "", page)
        page = re.sub(r'\s*<link rel="canonical"[^>]*>', "", page)
        meta = f'''
  <link rel="canonical" href="{url}">
  <meta property="og:type" content="product">
  <meta property="og:title" content="{html.escape(nombre)} — Agresti.3D">
  <meta property="og:description" content="{html.escape(desc_meta)}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{html.escape(imagen)}">
  <meta property="og:image:alt" content="{html.escape(nombre)}">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">{ld}</script>
  <script type="application/ld+json">{migas}</script>
</head>'''
        page = page.replace("</head>", meta, 1)
        
        page = re.sub(
            r'<script src="js/catalog\.js\?v=\d+"></script>',
            f'<script>window.__AGRESTI_PRODUCTO_INICIAL__ = {json.dumps(pid)};</script>\n<script src="js/catalog.js?v=32"></script>',
            page,
            count=1,
        )
        noscript = f'''<noscript><article style="max-width:760px;margin:2rem auto;padding:1rem;font-family:Arial,sans-serif"><h1>{html.escape(nombre)}</h1><img src="{html.escape(imagen)}" alt="{html.escape(nombre)}" style="max-width:320px"><p>{html.escape(descripcion)}</p><p><strong>Precio:</strong> {html.escape(p.get('precio') or 'A consultar')}</p><p><a href="https://wa.me/5491169957575">Consultar por WhatsApp</a></p></article></noscript>'''
        page = page.replace("<body>", "<body>\n" + noscript, 1)
        destino = ROOT / "productos" / pid / "index.html"
        destino.parent.mkdir(parents=True, exist_ok=True)
        destino.write_text(page, encoding="utf-8")
        generadas += 1
    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    hoy = date.today().isoformat()
    sitemap.append(f"  <url><loc>{base}/</loc><lastmod>{hoy}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>")
    for p in c.get("productos", []):
        if p.get("id"):
            sitemap.append(f"  <url><loc>{base}/productos/{p['id']}/</loc><lastmod>{hoy}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>")
    sitemap.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(sitemap) + "\n", encoding="utf-8")
    (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {base}/sitemap.xml\n", encoding="utf-8")
    print(f"Generadas {generadas} páginas, sitemap y robots")

if __name__ == "__main__":
    main()
