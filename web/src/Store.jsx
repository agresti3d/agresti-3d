import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { loadCatalog } from "./catalog";
import BackToTop from "./BackToTop";
import {
  ArrowLeft, ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, Home, LayoutGrid, Layers,
  Menu, MessageCircle, Minus, PackageSearch, Plus, Search, ShoppingBag, Trash2, X,
} from "lucide-react";

const WA_PHONE = "5491169957575";
const WA_URL = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent("Hola Agresti.3D, quiero hacer un pedido.")}`;
const CART_KEY = "agresti:carrito";
const money = (value) => value || "A consultar";
const numberPrice = (value) => {
  const digits = String(value || "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
};
const imageUrl = (src) => (!src ? "" : src.startsWith("http") ? src : `/${src.replace(/^\/+/, "")}`);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function readCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((i) => i && i.id) : [];
  } catch { return []; }
}

function useCatalog() {
  const [catalog, setCatalog] = useState(null);
  useEffect(() => {
    loadCatalog()
      .then(setCatalog)
      .catch(() => setCatalog({ productos: [], categorias: [], sucursales: [] }));
  }, []);
  return catalog;
}

function Rail() {
  const items = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/tienda.html#productos", label: "Catálogo", icon: LayoutGrid, active: true },
    { href: "/#productos", label: "Colección", icon: Layers },
    { href: "/#contacto", label: "Soporte", icon: MessageCircle },
    { href: "/seguimiento.html", label: "Seguir pedido", icon: PackageSearch },
  ];
  return (
    <aside className="fixed left-6 top-32 z-50 hidden w-16 flex-col items-center gap-1 rounded-[24px] border border-white/10 bg-surface/80 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl lg:flex">
      <a href="/" className="grid h-11 w-11 place-items-center" aria-label="Agresti.3D">
        <img src="/assets/logo/agresti-a-claro.svg" alt="" width="28" height="28" />
      </a>
      <nav className="grid gap-1" aria-label="Accesos rápidos">
        {items.map(({ href, label, icon: Icon, active }) => (
          <a key={label} href={href} aria-label={label} className={`group relative grid h-11 w-11 place-items-center rounded-[14px] transition ${active ? "bg-accent text-white" : "text-muted hover:bg-accent/15 hover:text-ink"}`}>
            <Icon size={20} strokeWidth={1.7} />
            <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 translate-x-[-4px] whitespace-nowrap rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100">{label}</span>
          </a>
        ))}
      </nav>
      <a href={WA_URL} aria-label="WhatsApp" className="mt-2 grid h-11 w-11 place-items-center rounded-[14px] text-accent transition hover:bg-accent/10">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 2a8 8 0 1 1-4.2 14.8l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 0 1 12 4Zm-3.1 4c-.2 0-.5 0-.7.3-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.7 4.2 3.7 2 .8 2.5.7 2.9.6.5 0 1.4-.6 1.6-1.1.2-.6.2-1 .2-1.1 0-.1-.2-.2-.4-.3l-1.5-.7c-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-1.9-1.2 7.3 7.3 0 0 1-1.3-1.7c-.1-.2 0-.3.1-.4l.4-.5.2-.4c0-.1 0-.3 0-.4L9.6 8.5c-.2-.4-.4-.4-.7-.4Z" /></svg>
      </a>
    </aside>
  );
}

function Header({ cartCount, onCart }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="relative z-40 mx-auto flex min-h-[88px] w-full max-w-[1240px] items-center justify-between gap-5 px-6">
      <a href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight" aria-label="Agresti.3D, inicio">
        <img src="/assets/logo/agresti-a-claro.svg" alt="" width="38" height="38" />
        <span>AGRESTI<span className="text-accent">.3D</span></span>
      </a>
      <nav className="hidden items-center gap-6 md:flex" aria-label="Navegación principal">
        <a href="/tienda.html#productos" className="flex min-h-11 items-center text-sm text-accent">Productos</a>
        <a href="/#materiales" className="flex min-h-11 items-center text-sm text-muted transition hover:text-ink">Materiales</a>
        <a href="/#contacto" className="flex min-h-11 items-center text-sm text-muted transition hover:text-ink">Contacto</a>
        <a href="/seguimiento.html" className="flex min-h-11 items-center text-sm text-muted transition hover:text-ink">Seguir pedido</a>
      </nav>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onCart} className="relative grid h-11 w-11 place-items-center rounded-full border border-line text-ink transition hover:border-accent" aria-label="Abrir carrito">
          <ShoppingBag size={18} />
          {cartCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#b8320f] px-1 text-[10px] font-bold text-white">{cartCount}</span>}
        </button>
        <a href={WA_URL} className="hidden min-h-11 items-center gap-2 rounded-full border border-line-strong px-4 text-xs font-semibold transition hover:border-accent hover:bg-accent/10 sm:flex">Hacer un pedido <ArrowRight size={14} /></a>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Abrir menú" className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink md:hidden">{open ? <X size={18} /> : <Menu size={18} />}</button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute left-4 right-4 top-[78px] z-50 grid overflow-hidden rounded-2xl border border-line bg-surface p-2 shadow-2xl md:hidden">
            {[["Productos", "/tienda.html#productos"], ["Materiales", "/#materiales"], ["Contacto", "/#contacto"], ["Seguir pedido", "/seguimiento.html"], ["Hacer un pedido", WA_URL]].map(([label, href]) => (
              <a key={label} href={href} onClick={() => setOpen(false)} className="flex min-h-12 items-center border-b border-line px-4 text-sm text-ink last:border-0">{label}</a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function ProductCard({ product, onOpen, onAdd, onCategory, categoryName }) {
  const [foto, setFoto] = useState(0);
  const touchStart = useRef(null);
  const swipeConsumed = useRef(false);
  const imagenes = Array.isArray(product.imagenes) ? product.imagenes.filter((imagen) => imagen?.src) : [];
  const actual = imagenes[foto] || imagenes[0];
  const cambiarFoto = (direccion) => {
    if (imagenes.length < 2) return;
    setFoto((indice) => (indice + direccion + imagenes.length) % imagenes.length);
  };
  const iniciarSwipe = (event) => {
    touchStart.current = event.touches[0]?.clientX ?? null;
    swipeConsumed.current = false;
  };
  const terminarSwipe = (event) => {
    if (touchStart.current === null) return;
    const dx = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
    touchStart.current = null;
    if (Math.abs(dx) < 42) return;
    swipeConsumed.current = true;
    cambiarFoto(dx < 0 ? 1 : -1);
  };
  const abrir = () => {
    if (swipeConsumed.current) { swipeConsumed.current = false; return; }
    onOpen(product);
  };
  return (
    <motion.article whileHover={{ y: -3 }} className="group flex flex-col overflow-hidden rounded-[20px] border border-line bg-surface p-3 transition hover:border-line-strong">
      <div className="flex justify-end pb-2">
        <button type="button" onClick={(event) => { event.stopPropagation(); onCategory(product.categoria); }} className="max-w-[80%] truncate rounded-full border border-line bg-surface2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.08em] text-muted transition hover:border-accent hover:text-accent" aria-label={`Ver productos de ${categoryName || product.categoria}`}>{categoryName || product.categoria}</button>
      </div>
      <button type="button" onClick={abrir} onTouchStart={iniciarSwipe} onTouchEnd={terminarSwipe} className="relative grid aspect-square touch-pan-y place-items-center overflow-hidden rounded-[14px] bg-surface2" aria-label={`Ver ${product.nombre}`}>
        {actual?.src ? <img src={imageUrl(actual.src)} alt={actual.alt || product.nombre} loading="lazy" width="500" height="500" className="h-[88%] w-[88%] object-contain transition duration-500 group-hover:scale-[1.04]" /> : <span className="text-xs text-muted">Sin foto</span>}
        {imagenes.length > 1 && <span className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1" aria-hidden="true">{imagenes.map((_, i) => <i key={i} className={`h-1.5 rounded-full transition-all ${i === foto ? "w-4 bg-accent" : "w-1.5 bg-white/40"}`} />)}</span>}
      </button>
      <div className="flex flex-1 flex-col pt-3">
        <div className="flex items-center gap-1.5 pb-1.5">
          <img src="/assets/logo/agresti-a-claro.svg" alt="" width="14" height="14" className="h-3.5 w-3.5" />
          <span className="font-display text-[10px] font-semibold tracking-[.08em] text-ink/80">AGRESTI<span className="text-accent">.3D</span></span>
        </div>
        <button type="button" onClick={() => onOpen(product)} className="text-left"><h3 className="line-clamp-2 min-h-[2.4rem] text-base font-semibold leading-snug">{product.nombre}</h3></button>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <span className="text-base font-semibold text-accent">{money(product.precio)}</span>
          <button type="button" onClick={() => onAdd(product, 1)} className="grid h-10 w-10 place-items-center rounded-full bg-accent text-white transition hover:bg-accentDeep" aria-label={`Agregar ${product.nombre} al carrito`}><Plus size={17} /></button>
        </div>
      </div>
    </motion.article>
  );
}

function CategoryCard({ category, onClick }) {
  return (
    <button type="button" onClick={onClick} className="group overflow-hidden rounded-[20px] border border-line bg-surface p-3 text-left transition hover:-translate-y-1 hover:border-line-strong">
      <div className="grid aspect-[1.35] place-items-center overflow-hidden rounded-[14px] bg-surface2">
        {category.imagen ? <img src={imageUrl(category.imagen)} alt="" loading="lazy" width="400" height="300" className="h-[85%] w-[85%] object-contain transition duration-500 group-hover:scale-105" /> : <LayoutGrid size={32} className="text-muted" />}
      </div>
      <div className="flex items-end justify-between gap-2 pt-3">
        <div><h3 className="text-sm font-semibold">{category.nombre}</h3><p className="mt-1 text-xs text-muted">{category.count} productos</p></div>
        <span className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted transition group-hover:border-accent group-hover:text-accent"><ArrowRight size={14} /></span>
      </div>
    </button>
  );
}

function Detail({ product, onClose, onAdd, onCategory, categoryName }) {
  const [qty, setQty] = useState(1);
  const [slide, setSlide] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  useEffect(() => { setQty(1); setSlide(0); setLightbox(false); }, [product?.id]);
  if (!product) return null;
  const media = [
    ...(product.imagenes || []).map((img) => ({ ...img, type: "image" })),
    ...(product.videos || []).map((video) => ({ ...video, type: "video" })),
  ];
  const actual = media[slide] || null;
  const mover = (dir) => setSlide((prev) => (prev + dir + media.length) % media.length);
  const touchStart = useRef(null);
  const swipeConsumed = useRef(false);
  const iniciarSwipe = (event) => {
    touchStart.current = event.touches[0]?.clientX ?? null;
    swipeConsumed.current = false;
  };
  const terminarSwipe = (event) => {
    if (touchStart.current === null) return;
    const dx = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
    touchStart.current = null;
    if (Math.abs(dx) < 42 || media.length < 2) return;
    swipeConsumed.current = true;
    mover(dx < 0 ? 1 : -1);
  };
  const abrirVisor = () => {
    if (swipeConsumed.current) { swipeConsumed.current = false; return; }
    if (actual?.type === "image") setLightbox(true);
  };
  const detalles = product.detalles || {};
  const medidas = detalles.medidas || [detalles.altura, detalles.ancho, detalles.largo].filter(Boolean).join(" × ");
  const beneficios = [
    detalles.material && ["Material", detalles.material],
    medidas && ["Medidas", medidas],
    detalles.capacidad && ["Capacidad", detalles.capacidad],
    detalles.peso && ["Peso", detalles.peso],
    ["Producción", "A pedido"],
    ["Envío", "Todo el país"],
  ].filter(Boolean);
  const incluye = String(detalles.contenido || "").replace(/^incluye\s+/i, "").trim();
  const variantes = Array.isArray(product.variantes) ? product.variantes.filter((v) => v?.nombre) : [];
  const extras = [
    detalles.colores && ["Colores", detalles.colores],
    incluye && ["Incluye", incluye],
    detalles.personalizacion && ["Personalización", detalles.personalizacion],
    detalles.cuidados && ["Cuidados", detalles.cuidados],
  ].filter(Boolean);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-paper/80 p-3 backdrop-blur-md sm:p-6">
      <div className="flex w-full items-center justify-center">
        <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={(e) => e.stopPropagation()} className="relative mx-auto grid max-h-[calc(100dvh-1.5rem)] w-full max-w-[1000px] overflow-y-auto rounded-[24px] border border-line bg-surface shadow-2xl sm:max-h-[calc(100dvh-3rem)] lg:grid-cols-2">
          <div className="relative flex flex-col bg-surface2 p-4">
            <button type="button" onClick={onClose} className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-line bg-paper/80 text-ink" aria-label="Cerrar ficha"><X size={18} /></button>
            <div className="relative flex h-[310px] items-center justify-center sm:h-[390px] lg:h-[460px]">
              {actual?.type === "video" ? (
                <video src={imageUrl(actual.src)} controls muted playsInline preload="metadata" onPlay={(e) => { e.currentTarget.muted = true; }} className="max-h-full w-full rounded-xl bg-black">Tu navegador no reproduce este video.</video>
              ) : (
                <button type="button" onClick={abrirVisor} onTouchStart={iniciarSwipe} onTouchEnd={terminarSwipe} className="group grid h-full w-full touch-pan-y place-items-center" aria-label="Ver foto en pantalla completa">
                  {actual?.src ? <img src={imageUrl(actual.src)} alt={actual.alt || product.nombre} className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-[1.02]" /> : <span className="text-sm text-muted">Sin foto</span>}
                </button>
              )}
              {media.length > 1 && (
                <>
                  <button type="button" onClick={(e) => { e.stopPropagation(); mover(-1); }} className="absolute left-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-paper/80 text-ink backdrop-blur transition hover:border-accent" aria-label="Foto anterior"><ChevronLeft size={20} /></button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); mover(1); }} className="absolute right-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-paper/80 text-ink backdrop-blur transition hover:border-accent" aria-label="Foto siguiente"><ChevronRight size={20} /></button>
                </>
              )}
            </div>
            {media.length > 1 && <div className="relative z-10 flex justify-center gap-2 py-3">{media.map((m, i) => <button key={i} type="button" onClick={() => setSlide(i)} className={`h-2.5 rounded-full transition-all ${i === slide ? "w-6 bg-accent" : "w-2.5 bg-[#64748b]"}`} aria-label={`${m.type === "video" ? "Video" : "Foto"} ${i + 1}`} />)}</div>}
          </div>
          <div className="p-5 pb-7 sm:p-7">
            <div className="flex justify-end">
              <button type="button" onClick={() => onCategory(product.categoria)} className="max-w-[85%] truncate rounded-full border border-line bg-surface2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.1em] text-accent transition hover:border-accent" aria-label={`Ver productos de ${categoryName || product.categoria}`}>{categoryName || product.categoria}</button>
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">{product.nombre}</h2>
            <p className="mt-2 text-xl font-semibold text-accent">{money(product.precio)}</p>
            {product.notaPrecio && <p className="mt-1 text-[11px] text-muted">{product.notaPrecio}</p>}
            <div className="mt-4 grid grid-cols-2 gap-2">{beneficios.map(([label, value]) => <div key={label} className="rounded-xl border border-line p-2"><strong className="block text-xs">{value}</strong><span className="text-[10px] text-muted">{label}</span></div>)}</div>
            <div className="mt-4 max-h-[30vh] overflow-y-auto pr-1 sm:max-h-[34vh]">
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted">{product.descripcionLarga || product.descripcion}</p>
            </div>
            {extras.length > 0 && (
              <dl className="mt-4 grid grid-cols-[88px_1fr] items-start gap-x-3 gap-y-2 border-t border-line pt-3 text-xs">
                {extras.map(([label, value]) => <div key={label} className="contents"><dt className="text-left text-muted">{label}</dt><dd className="text-left leading-relaxed text-ink">{value}</dd></div>)}
              </dl>
            )}
            {variantes.length > 0 && (
              <div className="mt-3 border-t border-line pt-3 text-xs">
                <p className="text-muted">Opciones</p>
                <ul className="mt-1 grid gap-1.5 text-ink">{variantes.map((v) => <li key={v.nombre} className="flex items-start justify-between gap-3"><span>{v.nombre}</span>{v.precio && <span className="flex-none text-accent">{v.precio}</span>}</li>)}</ul>
              </div>
            )}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center rounded-full border border-line"><button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center" aria-label="Menos"><Minus size={15} /></button><span className="w-8 text-center text-sm">{qty}</span><button type="button" onClick={() => setQty((q) => q + 1)} className="grid h-11 w-11 place-items-center" aria-label="Más"><Plus size={15} /></button></div>
              <button type="button" onClick={() => { onAdd(product, qty); onClose(); }} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-white">Agregar al carrito <ShoppingBag size={15} /></button>
            </div>
            <a href={`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(`Hola, quiero consultar por ${product.nombre}.`)}`} target="_blank" rel="noopener" className="mt-2 flex min-h-11 items-center justify-center rounded-full border border-line text-xs font-semibold text-ink transition hover:border-accent">Consultar por WhatsApp</a>
          </div>
        </motion.div>
      </div>
      <AnimatePresence>
        {lightbox && actual?.type === "image" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(false)} className="fixed inset-0 z-[110] flex items-center justify-center bg-[#02060d]/95 p-4 sm:p-8">
            <button type="button" onClick={() => setLightbox(false)} className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-ink" aria-label="Cerrar foto"><X size={20} /></button>
            {media.length > 1 && <button type="button" onClick={(e) => { e.stopPropagation(); mover(-1); }} className="absolute left-3 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface/90 text-ink" aria-label="Foto anterior"><ChevronLeft size={24} /></button>}
            <img src={imageUrl(actual.src)} alt={actual.alt || product.nombre} onClick={(e) => e.stopPropagation()} className="max-h-[92vh] max-w-[94vw] object-contain" />
            {media.length > 1 && <button type="button" onClick={(e) => { e.stopPropagation(); mover(1); }} className="absolute right-3 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface/90 text-ink" aria-label="Foto siguiente"><ChevronRight size={24} /></button>}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Cart({ items, products, onClose, onChange, onRemove }) {
  const rows = items.map((item) => ({ ...item, product: products.find((p) => p.id === item.id) })).filter((i) => i.product);
  const total = rows.reduce((sum, i) => sum + numberPrice(i.product.precio) * i.cantidad, 0);
  const message = `Hola Agresti.3D, quiero pedir:\n${rows.map((i) => `• ${i.cantidad} × ${i.product.nombre}${i.product.precio ? ` — ${i.product.precio}` : " — a consultar"}`).join("\n")}\n\nTotal estimado: $${total.toLocaleString("es-AR")}`;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[95] bg-paper/70 backdrop-blur-sm" onClick={onClose}>
      <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }} onClick={(e) => e.stopPropagation()} className="ml-auto flex h-full w-full max-w-[430px] flex-col border-l border-line bg-surface p-5">
        <div className="flex items-center justify-between border-b border-line pb-4"><h2 className="font-display text-xl">Tu carrito</h2><button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full border border-line" aria-label="Cerrar carrito"><X size={18} /></button></div>
        <div className="flex-1 overflow-y-auto py-4">
          {!rows.length && <p className="text-sm text-muted">Todavía no agregaste nada.</p>}
          {rows.map(({ product, cantidad }) => (
            <div key={product.id} className="flex gap-3 border-b border-line py-3">
              <div className="grid h-16 w-16 flex-none place-items-center rounded-xl bg-surface2"><img src={imageUrl(product.imagenes?.[0]?.src)} alt="" className="h-[85%] w-[85%] object-contain" /></div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{product.nombre}</p><p className="mt-1 text-xs text-accent">{money(product.precio)}</p><div className="mt-2 flex items-center gap-2"><button type="button" onClick={() => onChange(product.id, cantidad - 1)} className="grid h-8 w-8 place-items-center rounded-full border border-line" aria-label="Menos"><Minus size={12} /></button><span className="w-5 text-center text-xs">{cantidad}</span><button type="button" onClick={() => onChange(product.id, cantidad + 1)} className="grid h-8 w-8 place-items-center rounded-full border border-line" aria-label="Más"><Plus size={12} /></button></div></div>
              <button type="button" onClick={() => onRemove(product.id)} className="self-start text-muted hover:text-accent" aria-label="Quitar"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <div className="border-t border-line pt-4"><div className="flex justify-between text-sm"><span className="text-muted">Total estimado</span><strong>${total.toLocaleString("es-AR")}</strong></div><p className="mt-1 text-[10px] text-muted">Los productos “A consultar” se confirman por WhatsApp.</p><a href={`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener" className="mt-4 flex min-h-12 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">Cerrar pedido por WhatsApp</a></div>
      </motion.aside>
    </motion.div>
  );
}

export default function Store() {
  const catalog = useCatalog();
  const products = catalog?.productos || [];
  const categories = catalog?.categorias || [];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(() => new URLSearchParams(location.hash.replace(/^#/, "")).get("cat") || "todos");
  const [price, setPrice] = useState("todos");
  const [sort, setSort] = useState("relevancia");
  const [visible, setVisible] = useState(12);
  const [detailId, setDetailId] = useState(() => new URLSearchParams(location.hash.replace(/^#/, "")).get("p"));
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState(readCart);

  useEffect(() => {
    document.title = "Catálogo — Agresti.3D";
    const onHash = () => setDetailId(new URLSearchParams(location.hash.replace(/^#/, "")).get("p"));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart]);
  useEffect(() => { document.body.style.overflow = detailId || cartOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [detailId, cartOpen]);

  useEffect(() => {
    const onPop = () => {
      const params = new URLSearchParams(location.hash.replace(/^#/, ""));
      const cat = params.get("cat");
      if (cat) setCategory(cat);
      else if (!params.get("p")) setCategory("todos");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const pathOf = (id) => { const path = []; let c = catMap.get(id); while (c) { path.unshift(c); c = catMap.get(c.padre); } return path; };
  const rootOf = (id) => pathOf(id)[0]?.id || "";
  const roots = useMemo(() => categories.filter((c) => !c.padre).map((c) => {
    const list = products.filter((p) => pathOf(p.categoria).some((x) => x.id === c.id));
    const conFoto = list.filter((p) => p.imagenes?.[0]?.src);
    const ultimo = [...conFoto].sort((a, b) => String(b.creado || "").localeCompare(String(a.creado || "")))[0] || conFoto[0];
    const portada = c.portada && c.portada !== "auto" ? c.portada : ultimo?.imagenes?.[0]?.src;
    return { ...c, count: list.length, imagen: portada };
  }).filter((c) => c.count > 0), [categories, products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      const inCategory = category === "todos" || pathOf(p.categoria).some((c) => c.id === category);
      const inPrice = price === "todos" || (price === "consultar" ? !p.precio : Boolean(p.precio));
      const text = `${p.nombre} ${p.descripcion || ""} ${p.categoria}`.toLowerCase();
      return inCategory && inPrice && (!q || text.includes(q));
    });
    if (sort === "precio-asc") list = [...list].sort((a, b) => (numberPrice(a.precio) || 99999999) - (numberPrice(b.precio) || 99999999));
    if (sort === "precio-desc") list = [...list].sort((a, b) => (numberPrice(b.precio) || 0) - (numberPrice(a.precio) || 0));
    if (sort === "nombre") list = [...list].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    return list;
  }, [products, query, category, price, sort, catMap]);

  useEffect(() => { setVisible(12); }, [query, category, price, sort]);

  const detail = products.find((p) => p.id === detailId);
  const cartCount = cart.reduce((n, i) => n + i.cantidad, 0);
  const add = (product, cantidad = 1) => setCart((prev) => {
    const exists = prev.find((i) => i.id === product.id);
    return exists ? prev.map((i) => i.id === product.id ? { ...i, cantidad: i.cantidad + cantidad } : i) : [...prev, { id: product.id, cantidad }];
  });
  const change = (id, cantidad) => setCart((prev) => cantidad <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => i.id === id ? { ...i, cantidad } : i));
  const remove = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const openDetail = (product) => { history.replaceState(null, "", `#p=${encodeURIComponent(product.id)}`); setDetailId(product.id); };
  const closeDetail = () => { history.replaceState(null, "", "#productos"); setDetailId(null); };
  const irACategoria = (id) => {
    setCategory(id);
    history.pushState(null, "", id === "todos" ? "#productos" : `#cat=${encodeURIComponent(id)}`);
    requestAnimationFrame(() => document.getElementById("productos")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-paper font-sans text-ink">
      <Rail />
      <div className="lg:pl-28">
        <Header cartCount={cartCount} onCart={() => setCartOpen(true)} />
        <main id="productos" className="mx-auto w-full max-w-[1240px] px-6 pb-16">
          <section className="pb-8 pt-8">
            <p className="font-display text-[11px] font-semibold uppercase tracking-[.15em] text-accent">Catálogo</p>
            <h1 className="mt-2 max-w-[15ch] font-display text-[clamp(2.2rem,5vw,4.6rem)] font-semibold leading-[.98] tracking-[-.05em]">Lo que está saliendo de la impresora.</h1>
            <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-muted">Una selección de objetos listos para imprimir. Elegís color y te lo mandamos. Si algo no está en la lista, también se puede hacer.</p>
          </section>

          <div className="flex items-center gap-2 rounded-full border border-line bg-surface px-4">
            <Search size={17} className="flex-none text-muted" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre, categoría o descripción…" aria-label="Buscar productos" className="min-h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted" />
            {query && <button type="button" onClick={() => setQuery("")} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:text-ink" aria-label="Limpiar búsqueda"><X size={15} /></button>}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => irACategoria("todos")} className={`min-h-10 rounded-full px-4 text-xs font-semibold ${category === "todos" ? "bg-ink text-paper" : "border border-line text-muted hover:text-ink"}`}>Todos</button>
            {roots.map((c) => <button key={c.id} type="button" onClick={() => irACategoria(c.id)} className={`min-h-10 rounded-full px-4 text-xs font-semibold ${category === c.id ? "bg-ink text-paper" : "border border-line text-muted hover:text-ink"}`}>{c.nombre}</button>)}
            <span className="hidden h-6 w-px bg-line sm:block" />
            <label className="relative ml-auto"><span className="sr-only">Precio</span><select value={price} onChange={(e) => setPrice(e.target.value)} className="h-10 appearance-none rounded-full border border-line bg-surface pl-4 pr-9 text-xs text-ink outline-none"><option value="todos">Precio: todos</option><option value="con-precio">Con precio</option><option value="consultar">A consultar</option></select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" /></label>
            <label className="relative"><span className="sr-only">Ordenar</span><select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 appearance-none rounded-full border border-line bg-surface pl-4 pr-9 text-xs text-ink outline-none"><option value="relevancia">Relevancia</option><option value="precio-asc">Menor precio</option><option value="precio-desc">Mayor precio</option><option value="nombre">Nombre</option></select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" /></label>
          </div>

          {category === "todos" && (
            <section className="mt-12">
              <h2 className="text-lg font-semibold">Elegí por dónde empezar</h2>
              <p className="mt-1 text-xs text-muted">Seleccioná una categoría para explorar sus productos.</p>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">{roots.map((c) => <CategoryCard key={c.id} category={c} onClick={() => irACategoria(c.id)} />)}</div>
            </section>
          )}

          <section className={category === "todos" ? "mt-12" : "mt-7"}>
            {category !== "todos" && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                <button type="button" onClick={() => irACategoria("todos")} className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-accent">← Todas las categorías</button>
                <span className="text-xs text-muted">{filtered.length} productos en esta categoría</span>
              </div>
            )}
            <div className="flex items-end justify-between gap-3"><h2 className="text-lg font-semibold">{category === "todos" ? "Todos los productos" : roots.find((c) => c.id === category)?.nombre || catMap.get(category)?.nombre || "Productos"}</h2><span className="text-xs text-muted">{filtered.length} resultados</span></div>
            {filtered.length ? <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{filtered.slice(0, visible).map((p) => <ProductCard key={p.id} product={p} onOpen={openDetail} onAdd={add} onCategory={irACategoria} categoryName={catMap.get(p.categoria)?.nombre || p.categoria} />)}</div> : <p className="mt-6 rounded-2xl border border-line p-6 text-sm text-muted">No encontramos productos con esos filtros.</p>}
            {visible < filtered.length && <div className="mt-6 flex justify-center"><button type="button" onClick={() => setVisible((v) => v + 12)} className="min-h-11 rounded-full border border-line px-5 text-xs font-semibold text-ink hover:border-accent">Cargar más productos</button></div>}
          </section>
          <p className="mt-10 text-center text-xs text-muted">Los precios dependen del tamaño, el color y el material. <a href={WA_URL} className="text-accent underline underline-offset-2">Escribime</a> y te paso el valor exacto en el día.</p>
        </main>
        <footer className="mx-auto flex w-full max-w-[1240px] flex-col items-start justify-between gap-3 border-t border-line px-6 py-8 text-xs text-muted sm:flex-row sm:items-center">
          <a href="/" className="flex items-center gap-2 font-display text-sm font-bold text-ink"><img src="/assets/logo/agresti-a-claro.svg" alt="" width="28" height="28" /> AGRESTI<span className="text-accent">.3D</span></a>
          <p>Hecho a pedido en Buenos Aires. <a href="/" className="text-accent">Volver al inicio</a></p>
        </footer>
      </div>
      <AnimatePresence>{detail && <Detail product={detail} onClose={closeDetail} onAdd={add} onCategory={(id) => { closeDetail(); irACategoria(id); }} categoryName={catMap.get(detail.categoria)?.nombre || detail.categoria} />}</AnimatePresence>
      <AnimatePresence>{cartOpen && <Cart items={cart} products={products} onClose={() => setCartOpen(false)} onChange={change} onRemove={remove} />}</AnimatePresence>
      <BackToTop />
    </div>
  );
}
