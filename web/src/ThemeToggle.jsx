import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_KEY = "agresti:tema";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains("theme-claro") ? "claro" : "oscuro"
  );

  useEffect(() => {
    const root = document.documentElement;
    const claro = theme === "claro";
    root.classList.toggle("theme-claro", claro);
    root.dataset.theme = theme;
    root.style.colorScheme = claro ? "light" : "dark";
    try { localStorage.setItem(THEME_KEY, theme); } catch (error) {}
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", claro ? "#dbc7b3" : "#070f1f");
  }, [theme]);

  // Mantiene sincronizadas otras pestañas del mismo navegador.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== THEME_KEY) return;
      setTheme(event.newValue === "claro" ? "claro" : "oscuro");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const cambiar = () => setTheme((actual) => (actual === "claro" ? "oscuro" : "claro"));
  const claro = theme === "claro";

  return (
    <button
      type="button"
      onClick={cambiar}
      className="grid h-10 w-10 flex-none place-items-center rounded-full border border-line text-ink transition hover:border-accent hover:text-accent"
      aria-label={claro ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
      title={claro ? "Modo oscuro" : "Modo claro"}
    >
      {claro ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  );
}
