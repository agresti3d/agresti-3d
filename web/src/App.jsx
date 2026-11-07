import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, Boxes, Gem, Home, LayoutGrid, Layers,
  Menu, MessageCircle, PackageSearch, Printer, Truck, X,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import GiftFinder from "./GiftFinder";
import { loadCatalog } from "./catalog";
import BackToTop from "./BackToTop";
import "swiper/css";

const money = (value) => value || "A consultar";
const WA_URL = "https://wa.me/5491169957575?text=Hola%20Agresti.3D%2C%20quiero%20hacer%20un%20pedido.";
const imageUrl = (src) => (!src ? "" : src.startsWith("http") ? src : `/${src.replace(/^\/+/, "")}`);

const features = [
  { icon: Boxes, title: "Diseño original", text: "Piezas pensadas para regalar, usar y coleccionar." },
  { icon: Gem, title: "Materiales nobles", text: "PLA, PETG o TPU según el uso que le quieras dar." },
  { icon: Printer, title: "Hecho a pedido", text: "Imprimimos tu pieza después de elegir color y tamaño." },
  { icon: Truck, title: "Envíos a todo el país", text: "Despachamos por correo o coordinamos retiro." },
];

const railItems = [
  { href: "/", label: "Inicio", icon: Home, active: true },
  { href: "/tienda.html#productos", label: "Catálogo", icon: LayoutGrid },
  { href: "/tienda.html#productos", label: "Colección", icon: Layers },
  { href: "/tienda.html#preguntas", label: "Soporte", icon: HeadphonesIcon },
  { href: "/seguimiento.html", label: "Seguir pedido", icon: PackageSearch },
];

function HeadphonesIcon(props) {
  return <MessageCircle {...props} />;
}

function Rail() {
  return (
    <aside className="fixed left-6 top-32 z-50 hidden w-16 flex-col items-center gap-1 rounded-[24px] border border-white/10 bg-surface/80 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl lg:flex">
      <a href="/" className="grid h-11 w-11 place-items-center" aria-label="Agresti.3D">
        <img src="/assets/logo/agresti-a-claro.svg" alt="" width="28" height="28" />
      </a>
      <nav className="grid gap-1" aria-label="Accesos rápidos">
        {railItems.map(({ href, label, icon: Icon, active }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            className={`group relative grid h-11 w-11 place-items-center rounded-[14px] transition ${
              active ? "bg-accent text-white" : "text-muted hover:bg-accent/15 hover:text-ink"
            }`}
          >
            <Icon size={20} strokeWidth={1.7} />
            <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 translate-x-[-4px] whitespace-nowrap rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100">
              {label}
            </span>
          </a>
        ))}
      </nav>
      <a href={WA_URL} aria-label="WhatsApp" className="mt-2 grid h-11 w-11 place-items-center rounded-[14px] text-accent transition hover:bg-accent/10">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 2a8 8 0 1 1-4.2 14.8l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 0 1 12 4Zm-3.1 4c-.2 0-.5 0-.7.3-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.7 4.2 3.7 2 .8 2.5.7 2.9.6.5 0 1.4-.6 1.6-1.1.2-.6.2-1 .2-1.1 0-.1-.2-.2-.4-.3l-1.5-.7c-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-1.9-1.2 7.3 7.3 0 0 1-1.3-1.7c-.1-.2 0-.3.1-.4l.4-.5.2-.4c0-.1 0-.3 0-.4L9.6 8.5c-.2-.4-.4-.4-.7-.4Z" /></svg>
      </a>
    </aside>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="relative z-40 mx-auto flex min-h-[88px] w-full max-w-[1240px] items-center justify-between gap-5 px-6">
      <a href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight" aria-label="Agresti.3D, inicio">
        <img src="/assets/logo/agresti-a-claro.svg" alt="" width="38" height="38" />
        <span>AGRESTI<span className="text-accent">.3D</span></span>
      </a>
      <nav className="hidden items-center gap-6 md:flex" aria-label="Navegación principal">
        {[
          ["Productos", "/tienda.html#productos"],
          ["Materiales", "/#materiales"],
          ["Contacto", "/#contacto"],
          ["Seguir pedido", "/seguimiento.html"],
        ].map(([label, href]) => (
          <a key={label} href={href} className="flex min-h-11 items-center text-sm text-muted transition hover:text-ink">{label}</a>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <a href={WA_URL} className="hidden min-h-11 items-center gap-2 rounded-full border border-line-strong px-4 text-xs font-semibold transition hover:border-accent hover:bg-accent/10 sm:flex">
          Hacer un pedido <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-white"><ArrowUpRight size={13} /></span>
        </a>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Abrir menú" className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink md:hidden">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute left-4 right-4 top-[78px] z-50 grid overflow-hidden rounded-2xl border border-line bg-surface p-2 shadow-2xl md:hidden"
          >
            {[
              ["Productos", "/tienda.html#productos"],
              ["Materiales", "/#materiales"],
              ["Contacto", "/#contacto"],
              ["Seguir pedido", "/seguimiento.html"],
              ["Hacer un pedido", WA_URL],
            ].map(([label, href]) => (
              <a key={label} href={href} onClick={() => setOpen(false)} className="flex min-h-12 items-center border-b border-line px-4 text-sm text-ink last:border-0">{label}</a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-8 lg:pb-24">
      <div className="mx-auto grid w-full max-w-[1240px] items-center gap-8 px-6 lg:grid-cols-[1.05fr_.95fr]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }}>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/35 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.12em] text-accent">
            <span aria-hidden="true">✦</span> Objetos impresos en 3D
          </p>
          <h1 className="font-display text-[clamp(3.4rem,7vw,6.8rem)] font-semibold leading-[.92] tracking-[-.055em]">
            Diseños que<br /><span className="text-accent">cobran vida</span>.
          </h1>
          <p className="mt-6 max-w-[43ch] text-base leading-relaxed text-muted sm:text-lg">
            Deco, organizadores, juguetes y regalos personalizados. Elegís el modelo y el color; lo imprimimos en PLA, PETG o TPU y te lo mandamos a casa.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <motion.a whileHover={{ y: -2 }} href="/tienda.html#productos" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-white shadow-[0_14px_30px_-16px_rgba(255,106,61,.9)]">
              Ver catálogo <span className="grid h-6 w-6 place-items-center rounded-full bg-black/20"><ArrowRight size={14} /></span>
            </motion.a>
            <motion.a whileHover={{ y: -2 }} href={WA_URL} className="inline-flex min-h-12 items-center justify-center rounded-full border border-line-strong px-5 text-sm font-semibold text-ink transition hover:border-accent hover:bg-accent/10">
              Pedir a medida
            </motion.a>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted"><span className="text-accent">✓</span> Hecho a pedido <span className="text-line">·</span> Envíos a todo el país</p>
        </motion.div>

        <div className="relative grid min-h-[420px] place-items-center lg:min-h-[560px]">
          <div className="absolute h-[70%] w-[70%] rounded-full bg-[radial-gradient(circle_at_45%_40%,rgba(255,106,61,.25),rgba(70,110,255,.06)_48%,transparent_70%)] blur-2xl" />
          <motion.img
            initial={{ opacity: 0, scale: .94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: .8, delay: .15 }}
            src="/img/productos/mate-azul-oro.webp?v=6"
            alt="Mate azul y oro impreso en 3D"
            width="600" height="600"
            className="relative z-10 w-[62%] max-w-[390px] drop-shadow-[0_30px_30px_rgba(0,0,0,.42)]"
          />
          <img src="/img/productos/despertando-oso.webp?v=6" alt="" width="300" height="300" className="absolute bottom-[12%] left-[2%] w-[27%] max-w-[150px] opacity-90 drop-shadow-2xl" />
          <img src="/img/productos/posavasos-vinilo.webp?v=7" alt="" width="300" height="300" className="absolute right-[2%] top-[10%] w-[27%] max-w-[150px] opacity-90 drop-shadow-2xl" />
          <div className="absolute bottom-[8%] right-[8%] grid h-20 w-20 rotate-[-8deg] place-items-center rounded-full border border-accent/40 bg-surface/80 text-center font-display text-[10px] font-semibold leading-tight text-accent backdrop-blur">
            Impreso<br />a pedido
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <motion.section id="materiales" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} className="mx-auto w-full max-w-[1240px] px-6">
      <div className="rounded-[28px] border border-white/10 bg-[#0a1324] p-6 shadow-[0_30px_70px_-45px_#000]">
        <p className="mb-4 font-display text-[11px] font-semibold uppercase tracking-[.15em] text-accent">Hecho para durar</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="border-b border-white/10 py-3 pr-4 last:border-0 sm:border-b-0 sm:border-r sm:py-0">
              <span className="mb-3 grid h-9 w-9 place-items-center rounded-[10px] border border-accent/40 text-accent"><Icon size={18} strokeWidth={1.6} /></span>
              <h3 className="font-display text-xs font-semibold uppercase tracking-[.04em]">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function Picks() {
  const [picks, setPicks] = useState([]);
  const swiperRef = useRef(null);
  useEffect(() => {
    loadCatalog()
      .then((data) => {
        const list = (data.productos || []).filter((p) => p?.nombre && p?.imagenes?.[0]?.src).slice(0, 8);
        setPicks(list);
      })
      .catch(() => setPicks([]));
  }, []);

  return (
    <section id="picks" className="mx-auto mt-16 w-full max-w-[1240px] px-6 lg:mt-24">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 font-display text-[11px] font-semibold uppercase tracking-[.15em] text-accent">Selección</p>
          <h2 className="font-display text-[clamp(1.8rem,3.5vw,3rem)] font-semibold tracking-[-.04em]">Nuestros destacados.</h2>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => swiperRef.current?.slidePrev()} aria-label="Productos anteriores" className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink transition hover:border-accent hover:bg-accent/10">←</button>
          <button type="button" onClick={() => swiperRef.current?.slideNext()} aria-label="Productos siguientes" className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink transition hover:border-accent hover:bg-accent/10">→</button>
        </div>
      </div>
      {picks.length ? (
        <Swiper
          onSwiper={(s) => { swiperRef.current = s; }}
          spaceBetween={16}
          slidesPerView={1.15}
          breakpoints={{ 640: { slidesPerView: 2.15 }, 1024: { slidesPerView: 3.15 }, 1240: { slidesPerView: 4 } }}
          className="!overflow-hidden"
        >
          {picks.map((p) => {
            const href = `/tienda.html#p=${encodeURIComponent(p.id)}`;
            return (
              <SwiperSlide key={p.id}>
                <a href={href} className="group flex min-h-[330px] flex-col rounded-[20px] border border-line bg-surface p-3 transition hover:-translate-y-1 hover:border-line-strong">
                  <div className="grid aspect-square place-items-center rounded-[14px] bg-surface2">
                    <img src={imageUrl(p.imagenes[0].src)} alt={p.imagenes[0].alt || p.nombre} loading="lazy" width="500" height="500" className="h-[88%] w-[88%] object-contain" />
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-ink">{p.nombre}</h3>
                      <small className="mt-1 block text-xs text-accent">{money(p.precio)}</small>
                    </div>
                    <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-accent text-white transition group-hover:bg-accentDeep" aria-hidden="true"><ArrowRight size={15} /></span>
                  </div>
                </a>
              </SwiperSlide>
            );
          })}
        </Swiper>
      ) : (
        <p className="rounded-2xl border border-line p-5 text-sm text-muted">Cargando selección…</p>
      )}
    </section>
  );
}

function Close() {
  return (
    <motion.section id="contacto" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} className="mx-auto mt-16 grid w-full max-w-[1240px] gap-4 px-6 lg:mt-24 lg:grid-cols-[1.05fr_.95fr]">
      <div className="relative min-h-[330px] overflow-hidden rounded-[26px] bg-surface2 p-6">
        <img src="/img/productos/mate-boca-jr-nueva-366c5d582218436ab99b1dcc2ac37e8c.webp?v=1" alt="Mate Boca Jr. impreso en 3D" width="600" height="600" className="absolute right-[3%] top-[8%] h-[68%] w-[48%] object-contain drop-shadow-2xl" />
        <blockquote className="absolute bottom-6 left-6 z-10 max-w-[62%] font-display text-[clamp(1.1rem,2.2vw,1.7rem)] leading-tight">
          “Cada pieza se imprime a pedido, con el color y el detalle que elegís.”
          <cite className="mt-3 block font-sans text-xs not-italic text-muted">— Agresti.3D</cite>
        </blockquote>
      </div>
      <div className="grid content-center rounded-[26px] border border-line bg-[#0a1324] p-6 lg:p-10">
        <p className="mb-1 font-display text-[11px] font-semibold uppercase tracking-[.15em] text-accent">Hablemos</p>
        <h2 className="font-display text-[clamp(1.8rem,3vw,2.6rem)] font-semibold tracking-[-.04em]">¿Hacemos algo para vos?</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">Contanos qué tenés en mente. Te respondemos por WhatsApp con opciones, colores y plazo.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <a href={WA_URL} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-4 text-xs font-semibold text-white">Escribinos <ArrowRight size={14} /></a>
          <a href="/seguimiento.html" className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-xs font-semibold text-ink transition hover:border-accent">Seguir pedido</a>
        </div>
      </div>
    </motion.section>
  );
}

export default function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-paper font-sans text-ink">
      <Rail />
      <div className="lg:pl-28">
        <Header />
        <main>
          <Hero />
          <Features />
          <GiftFinder />
          <Picks />
          <Close />
        </main>
        <footer className="mx-auto mt-8 flex w-full max-w-[1240px] flex-col items-start justify-between gap-3 border-t border-line px-6 py-8 text-xs text-muted sm:flex-row sm:items-center">
          <a href="/" className="flex items-center gap-2 font-display text-sm font-bold text-ink">
            <img src="/assets/logo/agresti-a-claro.svg" alt="" width="28" height="28" /> AGRESTI<span className="text-accent">.3D</span>
          </a>
          <p>Hecho a pedido en Buenos Aires. <a href="/tienda.html" className="text-accent">Volver al sitio</a></p>
        </footer>
      </div>
      <BackToTop />
    </div>
  );
}
