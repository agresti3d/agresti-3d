import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, Boxes, Gem, Home, LayoutGrid, Layers,
  MapPin, Menu, MessageCircle, PackageSearch, Printer, Truck, X,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import GiftFinder from "./GiftFinder";
import { loadCatalog } from "./catalog";
import BackToTop from "./BackToTop";
import ThemeLogo from "./ThemeLogo";
import ThemeToggle from "./ThemeToggle";
import "swiper/css";

const money = (value) => value || "A consultar";
const WA_URL = "https://wa.me/5491169957575?text=Hola%20Agresti.3D%2C%20quiero%20hacer%20un%20pedido.";
const imageUrl = (src) => (!src ? "" : src.startsWith("http") ? src : `/${src.replace(/^\/+/, "")}`);

const normalizar = (texto) => String(texto || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase();

const fechaArgentina = () => {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date()).reduce((acc, parte) => {
    acc[parte.type] = parte.value;
    return acc;
  }, {});
  return { year: Number(partes.year), month: Number(partes.month), day: Number(partes.day) };
};

const enRango = (fecha, desde, hasta) => {
  const valor = fecha.month * 100 + fecha.day;
  const inicio = desde[0] * 100 + desde[1];
  const fin = hasta[0] * 100 + hasta[1];
  return inicio <= fin ? valor >= inicio && valor <= fin : valor >= inicio || valor <= fin;
};

const domingoDelMes = (year, month, numero) => {
  const primero = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  return 1 + ((7 - primero) % 7) + (numero - 1) * 7;
};

const pascuaDelAno = (year) => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
};

const campanasEstacionales = (year) => {
  const pascua = pascuaDelAno(year);
  const pascuaDesde = { month: pascua.month, day: Math.max(1, pascua.day - 7) };
  return [
    {
      id: "navidad", label: "Navidad", desde: [11, 15], hasta: [1, 6],
      claves: ["navidad", "navideno", "noel", "santa", "pesebre", "arbol", "reno", "invierno", "muneco de nieve", "adorno navideno"],
    },
    {
      id: "halloween", label: "Halloween", desde: [10, 1], hasta: [11, 2],
      claves: ["halloween", "terror", "calabaza", "bruja", "fantasma", "mascara", "gotico", "plague", "oscuro"],
    },
    {
      id: "dia-madre", label: "Día de la Madre", desde: [10, 1], hasta: [10, domingoDelMes(year, 10, 3)],
      claves: ["madre", "flor", "florero", "maceta", "deco", "adorno"],
    },
    {
      id: "dia-padre", label: "Día del Padre", desde: [6, 1], hasta: [6, domingoDelMes(year, 6, 3)],
      claves: ["padre", "papa", "mate", "porta latas", "escritorio", "auto"],
    },
    {
      id: "dia-nino", label: "Día del Niño", desde: [8, 1], hasta: [8, domingoDelMes(year, 8, 2)],
      claves: ["nino", "juguete", "figura", "muneco", "funko", "peluche", "juego"],
    },
    {
      id: "dia-amigo", label: "Día del Amigo", desde: [7, 13], hasta: [7, 27],
      claves: ["amigo", "mate", "set", "juego", "regalo"],
    },
    {
      id: "san-valentin", label: "San Valentín", desde: [2, 1], hasta: [2, 14],
      claves: ["amor", "corazon", "flor", "pareja", "valentin"],
    },
    {
      id: "primavera", label: "Primavera", desde: [9, 15], hasta: [9, 30],
      claves: ["primavera", "flor", "florero", "maceta"],
    },
    {
      id: "pascuas", label: "Pascuas", desde: [pascuaDesde.month, pascuaDesde.day], hasta: [pascua.month, pascua.day],
      claves: ["pascua", "conejo", "huevo"],
    },
  ];
};

const campanaDeFecha = (fecha) =>
  campanasEstacionales(fecha.year).find((campana) => enRango(fecha, campana.desde, campana.hasta)) || null;

const HERO_FALLBACK = [
  { id: "mate-azul-oro", nombre: "Mate azul y oro", href: "/tienda.html#productos", src: "/img/productos/mate-azul-oro.webp?v=6" },
  { id: "despertando-oso", nombre: "Figura de oso", href: "/tienda.html#productos", src: "/img/productos/despertando-oso.webp?v=6" },
  { id: "posavasos-vinilo", nombre: "Set de posavasos", href: "/tienda.html#productos", src: "/img/productos/posavasos-vinilo.webp?v=7" },
];

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
    <aside className="fixed left-6 top-32 z-50 hidden w-16 flex-col items-center gap-1 rounded-[24px] border border-line bg-surface/80 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl lg:flex">
      <a href="/" className="grid h-11 w-11 place-items-center" aria-label="Agresti.3D">
        <ThemeLogo width={28} height={28} />
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

function Header({ onContact }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/70 shadow-[0_18px_45px_-32px_rgba(0,0,0,.9)] backdrop-blur-2xl backdrop-saturate-150">
      <div className="mx-auto flex min-h-[75px] w-full max-w-[1240px] items-center justify-between gap-5 px-6">
      <a href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight" aria-label="Agresti.3D, inicio">
        <ThemeLogo width={38} height={38} />
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
        <ThemeToggle />
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
              ["Hacer un pedido", "contacto"],
            ].map(([label, href]) => href === "contacto" ? (
              <button key={label} type="button" onClick={() => { setOpen(false); onContact(); }} className="flex min-h-12 items-center border-b border-line px-4 text-left text-sm text-ink last:border-0">{label}</button>
            ) : (
              <a key={label} href={href} onClick={() => setOpen(false)} className="flex min-h-12 items-center border-b border-line px-4 text-sm text-ink last:border-0">{label}</a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
      </div>
    </header>
  );
}

function Hero({ onContact }) {
  const [catalogo, setCatalogo] = useState(null);
  const reduced = useReducedMotion();
  const fecha = fechaArgentina();
  const campana = campanaDeFecha(fecha);

  useEffect(() => {
    let activo = true;
    loadCatalog()
      .then((datos) => { if (activo) setCatalogo(datos); })
      .catch(() => { if (activo) setCatalogo({ productos: [], categorias: [] }); });
    return () => { activo = false; };
  }, []);

  const seleccion = useMemo(() => {
    const productos = catalogo?.productos || [];
    const categorias = catalogo?.categorias || [];
    if (!productos.length) return [];
    const mapaCategorias = new Map(categorias.map((categoria) => [categoria.id, categoria]));
    const camino = (id) => {
      const ids = [];
      let actual = mapaCategorias.get(id);
      let guard = 0;
      while (actual && guard < 20) {
        ids.unshift(actual.id);
        actual = mapaCategorias.get(actual.padre);
        guard += 1;
      }
      return ids.length ? ids : [id];
    };
    const nombresCategoria = (producto) => {
      const ids = Array.isArray(producto.categorias) && producto.categorias.length ? producto.categorias : [producto.categoria];
      return ids.map((id) => mapaCategorias.get(id)?.nombre || id).filter(Boolean).join(" ");
    };
    const orden = productos
      .map((producto, indice) => ({ producto, indice }))
      .filter(({ producto }) => producto?.imagenes?.[0]?.src)
      .sort((a, b) => {
        const ca = String(a.producto.creado || "");
        const cb = String(b.producto.creado || "");
        if (ca && cb && ca !== cb) return cb.localeCompare(ca);
        if (ca && !cb) return -1;
        if (!ca && cb) return 1;
        return a.indice - b.indice;
      });
    const elegidos = [];
    const vistos = new Set();
    const agregar = ({ producto }) => {
      if (!producto || vistos.has(producto.id) || elegidos.length >= 10) return;
      const foto = producto.imagenes?.[0];
      if (!foto?.src) return;
      vistos.add(producto.id);
      elegidos.push({
        id: producto.id,
        nombre: producto.nombre,
        src: imageUrl(foto.src),
        alt: foto.alt || producto.nombre,
        href: `/tienda.html#p=${encodeURIComponent(producto.id)}`,
      });
    };

    const claves = (campana?.claves || []).map(normalizar);
    const coincideCampana = (producto) => {
      if (!claves.length) return false;
      const texto = normalizar(`${producto.nombre} ${producto.descripcion || ""} ${nombresCategoria(producto)} ${(producto.publico || []).join(" ")} ${(producto.ocasiones || []).join(" ")}`);
      return claves.some((clave) => texto.includes(clave));
    };

    // Primero garantizamos una pieza de cada categoría principal.
    const raices = categorias.filter((categoria) => !categoria.padre);
    raices.forEach((raiz) => {
      const deLaRama = orden.filter(({ producto }) => camino(producto.categoria).some((id) => id === raiz.id));
      const elegido = (claves.length ? deLaRama.find(({ producto }) => coincideCampana(producto)) : null) || deLaRama[0];
      if (elegido) agregar(elegido);
    });

    // Después se prioriza la campaña estacional y se completa con los últimos.
    if (claves.length) orden.filter(({ producto }) => coincideCampana(producto)).forEach(agregar);
    orden.forEach(agregar);
    return elegidos;
  }, [catalogo, campana?.id]);

  const visual = seleccion.length ? seleccion : HERO_FALLBACK;
  const tamanos = ["w-48 sm:w-56 lg:w-64", "w-40 sm:w-48 lg:w-56", "w-52 sm:w-64 lg:w-72"];

  return (
    <section className="relative overflow-hidden pb-16 pt-8 lg:pb-24">
      <div className="mx-auto grid w-full max-w-[1240px] items-center gap-8 px-6 lg:grid-cols-[1.05fr_.95fr]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }}>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/35 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.12em] text-accent">
            <span aria-hidden="true">✦</span> Objetos impresos en 3D{campana ? ` · ${campana.label}` : ""}
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
            <motion.button type="button" whileHover={{ y: -2 }} onClick={onContact} className="inline-flex min-h-12 items-center justify-center rounded-full border border-line-strong px-5 text-sm font-semibold text-ink transition hover:border-accent hover:bg-accent/10">
              Pedir a medida
            </motion.button>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted"><span className="text-accent">✓</span> Hecho a pedido <span className="text-line">·</span> Envíos a todo el país</p>
        </motion.div>

        <div className="relative min-h-[420px] overflow-hidden lg:min-h-[560px]">
          <div className="hero-glow absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl" />
          <div className="hero-flow absolute inset-0 z-[1] flex items-center">
            <motion.div
              className="flex w-max shrink-0 items-center gap-5 px-5 will-change-transform sm:gap-6 lg:gap-8"
              style={{ width: "max-content" }}
              animate={reduced ? undefined : { x: ["-50%", "0%"] }}
              transition={reduced ? undefined : { duration: 11.4, repeat: Infinity, ease: "linear" }}
            >
              {[...visual, ...visual].map((item, indice) => {
                const duplicado = indice >= visual.length;
                const tamano = tamanos[indice % tamanos.length];
                return (
                  <motion.a
                    key={`${item.id}-${indice}`}
                    href={item.href}
                    aria-label={`Ver ${item.nombre}`}
                    aria-hidden={duplicado || undefined}
                    tabIndex={duplicado ? -1 : 0}
                    className="group block flex-none"
                    animate={reduced ? undefined : { y: [0, indice % 2 === 0 ? -8 : 7, 0], rotate: [0, indice % 2 === 0 ? -1.2 : 1.2, 0] }}
                    transition={reduced ? undefined : { duration: 4.2 + (indice % 3) * 0.35, repeat: Infinity, ease: "easeInOut", delay: indice * 0.08 }}
                  >
                    <img src={item.src} alt={item.alt} width="400" height="400" loading={indice < 2 ? "eager" : "lazy"} className={`${tamano} h-auto object-contain drop-shadow-[0_26px_24px_rgba(0,0,0,.34)] transition duration-500 group-hover:scale-105`} />
                  </motion.a>
                );
              })}
            </motion.div>
          </div>
          <div className="absolute bottom-[5%] right-[5%] z-10 grid h-20 w-20 rotate-[-8deg] place-items-center rounded-full border border-accent/40 bg-surface/80 text-center font-display text-[10px] font-semibold leading-tight text-accent backdrop-blur">
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
      <div className="rounded-[28px] border border-line bg-surface p-6 shadow-[0_30px_70px_-45px_#000]">
        <p className="mb-4 font-display text-[11px] font-semibold uppercase tracking-[.15em] text-accent">Hecho para durar</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="border-b border-line py-3 pr-4 last:border-0 sm:border-b-0 sm:border-r sm:py-0">
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

function Close({ onContact }) {
  const [destacado, setDestacado] = useState(null);
  const campana = campanaDeFecha(fechaArgentina());

  useEffect(() => {
    let activo = true;
    loadCatalog()
      .then((datos) => {
        if (!activo) return;
        const productos = (datos?.productos || [])
          .map((producto, indice) => ({ producto, indice }))
          .filter(({ producto }) => producto?.imagenes?.[0]?.src)
          .sort((a, b) => {
            const ca = String(a.producto.creado || "");
            const cb = String(b.producto.creado || "");
            if (ca && cb && ca !== cb) return cb.localeCompare(ca);
            if (ca && !cb) return -1;
            if (!ca && cb) return 1;
            return a.indice - b.indice;
          });
        const claves = (campana?.claves || []).map(normalizar);
        const estacional = claves.length
          ? productos.find(({ producto }) => {
              const texto = normalizar(`${producto.nombre} ${producto.descripcion || ""} ${producto.categoria}`);
              return claves.some((clave) => texto.includes(clave));
            })
          : null;
        const elegido = (estacional || productos[0])?.producto;
        if (elegido) {
          const foto = elegido.imagenes[0];
          setDestacado({
            src: imageUrl(foto.src),
            alt: foto.alt || elegido.nombre,
            nombre: elegido.nombre,
            href: `/tienda.html#p=${encodeURIComponent(elegido.id)}`,
          });
        }
      })
      .catch(() => {});
    return () => { activo = false; };
  }, [campana?.id]);

  const producto = destacado || {
    src: "/img/productos/mate-boca-jr-nueva-366c5d582218436ab99b1dcc2ac37e8c.webp?v=1",
    alt: "Mate Boca Jr. impreso en 3D",
    nombre: "Mate Boca Jr.",
    href: "/tienda.html#p=mate-boca-jr",
  };

  return (
    <motion.section id="contacto" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} className="mx-auto mt-16 grid w-full max-w-[1240px] gap-4 px-6 lg:mt-24 lg:grid-cols-[1.05fr_.95fr]">
      <div className="relative min-h-[330px] overflow-hidden rounded-[26px] bg-surface2 p-6">
        <a href={producto.href} className="absolute right-[3%] top-[8%] h-[68%] w-[48%]" aria-label={`Ver ${producto.nombre}`}>
          <img src={producto.src} alt={producto.alt} width="600" height="600" className="h-full w-full object-contain drop-shadow-2xl" />
        </a>
        {campana && <span className="absolute right-5 top-5 z-10 rounded-full border border-accent/40 bg-paper/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.1em] text-accent backdrop-blur">{campana.label}</span>}
        <blockquote className="absolute bottom-6 left-6 z-10 max-w-[62%] font-display text-[clamp(1.1rem,2.2vw,1.7rem)] leading-tight">
          “Cada pieza se imprime a pedido, con el color y el detalle que elegís.”
          <cite className="mt-3 block font-sans text-xs not-italic text-muted">— Agresti.3D</cite>
        </blockquote>
      </div>
      <div className="grid content-center rounded-[26px] border border-line bg-surface p-6 lg:p-10">
        <p className="mb-1 font-display text-[11px] font-semibold uppercase tracking-[.15em] text-accent">Hablemos</p>
        <h2 className="font-display text-[clamp(1.8rem,3vw,2.6rem)] font-semibold tracking-[-.04em]">¿Hacemos algo para vos?</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">Contanos qué tenés en mente. Te respondemos por WhatsApp con opciones, colores y plazo.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={onContact} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-4 text-xs font-semibold text-white">Escribinos <ArrowRight size={14} /></button>
          <a href="/seguimiento.html" className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-xs font-semibold text-ink transition hover:border-accent">Seguir pedido</a>
        </div>
      </div>
    </motion.section>
  );
}

function ContactDialog({ open, onClose }) {
  const [branches, setBranches] = useState([
    { id: "buenos-aires-buenos-aires", nombre: "Agresti.3D", localidad: "Buenos Aires, Wilde", telefono: "5491169957575" },
    { id: "la-rioja-la-rioja", nombre: "USS 3D", localidad: "La Rioja, Capital", telefono: "5493804449624" },
  ]);

  useEffect(() => {
    if (!open) return undefined;
    let activo = true;
    loadCatalog()
      .then((datos) => {
        if (activo && datos?.sucursales?.length) setBranches(datos.sucursales);
      })
      .catch(() => {});
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      activo = false;
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[110] flex items-center justify-center bg-paper/80 p-4 backdrop-blur-md">
          <motion.div initial={{ y: 20, opacity: 0, scale: .98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 12, opacity: 0, scale: .98 }} onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="contactDialogTitle" className="w-full max-w-[520px] overflow-hidden rounded-[26px] border border-line bg-surface shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-line p-5">
              <div>
                <p className="font-display text-[11px] font-semibold uppercase tracking-[.15em] text-accent">Pedido a medida</p>
                <h2 id="contactDialogTitle" className="mt-1 font-display text-2xl font-semibold tracking-tight">¿Con qué sucursal querés hablar?</h2>
                <p className="mt-1 text-xs leading-relaxed text-muted">Elegí la sucursal más cercana y te respondemos por WhatsApp.</p>
              </div>
              <button type="button" onClick={onClose} className="grid h-10 w-10 flex-none place-items-center rounded-full border border-line text-ink" aria-label="Cerrar"><X size={18} /></button>
            </div>
            <div className="grid gap-2 p-5">
              {branches.map((sucursal) => {
                const telefono = String(sucursal.telefono || "").replace(/\D/g, "");
                const mensaje = encodeURIComponent(`Hola ${sucursal.nombre}, quiero hacer un pedido a medida.`);
                const contenido = (
                  <>
                    <span className="grid h-10 w-10 flex-none place-items-center rounded-full border border-accent/40 bg-accent/10 text-accent"><MapPin size={17} /></span>
                    <span className="min-w-0 flex-1"><strong className="block truncate text-sm">{sucursal.nombre}</strong><span className="mt-0.5 block text-xs text-muted">{sucursal.localidad}</span></span>
                    {telefono ? <span className="inline-flex flex-none items-center gap-1 text-[11px] font-semibold text-accent">WhatsApp <ArrowUpRight size={13} /></span> : <span className="text-[11px] text-muted">Sin teléfono</span>}
                  </>
                );
                return telefono ? (
                  <a key={sucursal.id || sucursal.nombre} href={`https://wa.me/${telefono}?text=${mensaje}`} target="_blank" rel="noopener" onClick={onClose} className="flex min-h-[64px] items-center gap-3 rounded-2xl border border-line bg-paper/40 p-3 transition hover:border-accent hover:bg-accent/5">{contenido}</a>
                ) : (
                  <div key={sucursal.id || sucursal.nombre} className="flex min-h-[64px] items-center gap-3 rounded-2xl border border-line bg-paper/40 p-3">{contenido}</div>
                );
              })}
            </div>
            <p className="border-t border-line px-5 py-3 text-[11px] text-muted">También podés escribirnos desde el pie de la página.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [contactOpen, setContactOpen] = useState(false);
  return (
    <div className="app-shell min-h-screen overflow-x-clip font-sans text-ink">
      <Rail />
      <div className="lg:pl-28">
        <Header onContact={() => setContactOpen(true)} />
        <main>
          <Hero onContact={() => setContactOpen(true)} />
          <Features />
          <GiftFinder onContact={() => setContactOpen(true)} />
          <Picks />
          <Close onContact={() => setContactOpen(true)} />
        </main>
        <footer className="mx-auto mt-8 flex w-full max-w-[1240px] flex-col items-start justify-between gap-3 border-t border-line px-6 py-8 text-xs text-muted sm:flex-row sm:items-center">
          <a href="/" className="flex items-center gap-2 font-display text-sm font-bold text-ink">
            <ThemeLogo width={28} height={28} /> AGRESTI<span className="text-accent">.3D</span>
          </a>
          <p>Hecho a pedido en Buenos Aires. <a href="/tienda.html" className="text-accent">Volver al sitio</a></p>
        </footer>
      </div>
      <BackToTop />
      <ContactDialog open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
