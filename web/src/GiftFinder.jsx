import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Gift, RefreshCw, Sparkles, X } from "lucide-react";
import { loadCatalog } from "./catalog";

const WA_URL = "https://wa.me/5491169957575?text=Hola%20Agresti.3D%2C%20quiero%20un%20regalo%20a%20medida.";
const imageUrl = (src) => (!src ? "" : src.startsWith("http") ? src : `/${src.replace(/^\/+/, "")}`);
const numberPrice = (value) => {
  const digits = String(value || "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
};

const persona = {
  el: ["figuras", "escritorio", "mates", "juguetes", "funko-pop", "accesorios", "llaveros", "cosplay-disfraces"],
  ella: ["deco", "floreros", "macetas", "cocina", "mates", "accesorios", "estilo-crochet", "adornos"],
  chicos: ["juguetes", "figuras", "funko-pop", "llaveros", "juegos-de-mesa", "accesorios"],
  hogar: ["hogar", "deco", "cocina", "adornos", "floreros", "macetas", "portalatas", "utensilios"],
};
const ocasion = {
  cumple: ["figuras", "juguetes", "funko-pop", "deco", "accesorios"],
  aniversario: ["deco", "floreros", "mates", "adornos"],
  laboral: ["escritorio", "utensilios", "portalatas", "organizadores"],
  especial: ["figuras", "deco", "floreros", "adornos"],
};

export default function GiftFinder() {
  const [open, setOpen] = useState(false);
  const [catalog, setCatalog] = useState(null);
  const [who, setWho] = useState("cualquiera");
  const [moment, setMoment] = useState("cualquiera");
  const [budget, setBudget] = useState("cualquiera");

  useEffect(() => {
    if (!open || catalog) return;
    loadCatalog()
      .then((data) => setCatalog({ ...data, productos: data.productos || [], categorias: data.categorias || [] }))
      .catch(() => setCatalog({ productos: [], categorias: [] }));
  }, [open, catalog]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open]);

  const results = useMemo(() => {
    const products = catalog?.productos || [];
    const categories = catalog?.categorias || [];
    const map = new Map(categories.map((c) => [c.id, c]));
    const path = (id) => {
      const ids = [];
      let c = map.get(id);
      let guard = 0;
      while (c && guard < 20) { ids.unshift(c.id); c = map.get(c.padre); guard += 1; }
      return ids.length ? ids : [id];
    };
    const [from, to] = budget === "cualquiera" ? [null, null] : budget.split("-").map(Number);
    const scored = products.map((p) => {
      const ids = Array.isArray(p.categorias) && p.categorias.length ? p.categorias : [p.categoria];
      const publico = Array.isArray(p.publico) ? p.publico : [];
      const ocasiones = Array.isArray(p.ocasiones) ? p.ocasiones : [];
      const publicoOk = who === "cualquiera" || !publico.length || publico.includes(who) || publico.includes("cualquiera");
      const ocasionOk = moment === "cualquiera" || !ocasiones.length || ocasiones.includes(moment);
      if (!publicoOk || !ocasionOk) return { p, score: -99 };
      let score = 0;
      if (who !== "cualquiera") score += publico.includes(who) ? 3 : ids.some((id) => path(id).some((x) => persona[who]?.includes(x))) ? 2 : 0;
      if (moment !== "cualquiera") score += ocasiones.includes(moment) ? 2 : ids.some((id) => path(id).some((x) => ocasion[moment]?.includes(x))) ? 1 : 0;
      const price = numberPrice(p.precio);
      if (budget === "cualquiera") score += 1;
      else if (price >= from && price <= to) score += 3;
      else if (price) score -= 2;
      return { p, score };
    });
    const matches = scored.filter((x) => x.score > 0).sort((a, b) => b.score - a.score).map((x) => x.p);
    return matches.length ? matches : scored.filter((x) => x.p.precio).sort((a, b) => numberPrice(a.p.precio) - numberPrice(b.p.precio)).map((x) => x.p);
  }, [catalog, who, moment, budget]);

  const [ideas, setIdeas] = useState([]);
  const [pagina, setPagina] = useState(0);

  useEffect(() => {
    setIdeas(results.slice(0, 6));
    setPagina(0);
  }, [results]);

  const renovarIdeas = () => {
    if (!results.length) return;
    if (results.length <= 6) {
      setIdeas([...results].sort(() => Math.random() - 0.5));
      return;
    }
    const siguiente = (pagina + 1) % Math.ceil(results.length / 6);
    const desde = siguiente * 6;
    const tanda = results.slice(desde, desde + 6);
    setIdeas(tanda.length ? tanda : results.slice(0, 6));
    setPagina(siguiente);
  };

  return (
    <>
      <section id="regalos" className="mx-auto mt-16 w-full max-w-[1240px] px-6 lg:mt-24">
        <div className="flex flex-col justify-between gap-5 rounded-[26px] border border-line bg-surface2 p-5 sm:p-7 lg:flex-row lg:items-center">
          <div>
            <p className="font-display text-[11px] font-semibold uppercase tracking-[.15em] text-accent">Ideas para regalar</p>
            <h2 className="mt-1 font-display text-[clamp(1.6rem,3vw,2.4rem)] font-semibold tracking-[-.04em]">No sabés qué regalar.</h2>
            <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-muted">Tres preguntas y te proponemos opciones reales del catálogo. Si ninguna encaja, lo hacemos a medida.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-4 text-xs font-semibold text-white transition hover:bg-accentDeep"><Sparkles size={15} /> Encontrá tu regalo</button>
            <a href={WA_URL} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-xs font-semibold text-ink transition hover:border-accent">Pedir a medida</a>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-paper/80 p-3 backdrop-blur-md sm:p-6">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="my-auto w-full max-w-[880px] rounded-[24px] border border-line bg-surface shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-line p-5 sm:p-7">
                <div><p className="font-display text-[11px] font-semibold uppercase tracking-[.15em] text-accent">Buscador de regalos</p><h2 className="mt-1 font-display text-2xl font-semibold">Encontrá algo para regalar.</h2><p className="mt-1 text-xs text-muted">Elegí para quién, la ocasión y el presupuesto.</p></div>
                <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 flex-none place-items-center rounded-full border border-line text-ink" aria-label="Cerrar buscador de regalos"><X size={18} /></button>
              </div>
              <div className="grid gap-3 border-b border-line p-5 sm:grid-cols-3 sm:p-7">
                <label className="grid gap-1 text-[11px] font-semibold text-muted">Para quién
                  <select value={who} onChange={(e) => setWho(e.target.value)} className="h-11 rounded-xl border border-line bg-surface2 px-3 text-xs text-ink outline-none"><option value="cualquiera">Cualquiera</option><option value="el">Para él</option><option value="ella">Para ella</option><option value="chicos">Para chicos</option><option value="hogar">Para la casa</option></select>
                </label>
                <label className="grid gap-1 text-[11px] font-semibold text-muted">Ocasión
                  <select value={moment} onChange={(e) => setMoment(e.target.value)} className="h-11 rounded-xl border border-line bg-surface2 px-3 text-xs text-ink outline-none"><option value="cualquiera">Cualquiera</option><option value="cumple">Cumpleaños</option><option value="aniversario">Aniversario</option><option value="laboral">Laboral</option><option value="especial">Fecha especial</option></select>
                </label>
                <label className="grid gap-1 text-[11px] font-semibold text-muted">Presupuesto
                  <select value={budget} onChange={(e) => setBudget(e.target.value)} className="h-11 rounded-xl border border-line bg-surface2 px-3 text-xs text-ink outline-none"><option value="cualquiera">Cualquiera</option><option value="0-10000">Hasta $10.000</option><option value="10000-20000">$10.000 a $20.000</option><option value="20000-999999">Más de $20.000</option></select>
                </label>
              </div>
              <div className="p-5 sm:p-7">
                <div className="mb-3 flex items-center justify-between gap-3"><p className="text-xs text-muted">{results.length ? "Ideas reales del catálogo" : "Cargando ideas…"}</p><a href="/tienda.html#productos" className="inline-flex items-center gap-1 text-xs font-semibold text-accent">Ver todo <ArrowRight size={13} /></a></div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {ideas.map((p) => {
                    const href = `/tienda.html#p=${encodeURIComponent(p.id)}`;
                    return <a key={p.id} href={href} className="group rounded-2xl border border-line bg-surface2 p-2 transition hover:border-line-strong"><div className="grid aspect-square place-items-center rounded-xl bg-surface"><img src={imageUrl(p.imagenes?.[0]?.src)} alt={p.imagenes?.[0]?.alt || p.nombre} loading="lazy" className="h-[88%] w-[88%] object-contain" /></div><h3 className="mt-2 line-clamp-2 text-xs font-semibold leading-tight">{p.nombre}</h3><p className="mt-1 text-[11px] text-accent">{p.precio || "A consultar"}</p></a>;
                  })}
                </div>
                {!results.length && <div className="flex items-start gap-2 rounded-xl border border-line p-4 text-xs text-muted"><Gift size={18} className="flex-none text-accent" /> Probá con otro presupuesto o escribinos para hacerlo a medida.</div>}
                {results.length > 0 && (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <button type="button" onClick={renovarIdeas} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-accent/50 bg-accent/10 px-5 text-xs font-semibold text-accent transition hover:bg-accent hover:text-white">
                      <RefreshCw size={15} /> Sorpréndeme otra vez
                    </button>
                    <span className="text-[10px] text-muted">Cada clic renueva la selección de regalos.</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
