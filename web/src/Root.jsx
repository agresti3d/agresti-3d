import App from "./App";
import Store from "./Store";

export default function Root() {
  const isStore = /\/tienda(?:\.html)?\/?$/.test(window.location.pathname);
  return isStore ? <Store /> : <App />;
}
