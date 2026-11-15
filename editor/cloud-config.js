// Configuración pública del editor cloud.
// La API key de Firebase es pública; no hay secretos en este archivo.
window.AGRESTI_CLOUD = {
  firebase: {
    apiKey: "AIzaSyCjBR_K_Wk4Kiy7HBMnt0_bfFup45R8na0",
    authDomain: "agresti-3d.firebaseapp.com",
    projectId: "agresti-3d",
  },
  adminEmail: "agresti.3d@gmail.com",
  // Acceso heredado mientras el administrador principal configura sus permisos.
  // Una vez que existe el documento en "editores", ese documento manda.
  legacyEditors: {
    "leoagresti9@gmail.com": {
      nombre: "Leo",
      activo: true,
      permisos: {
        productos: true,
        categorias: false,
        sucursales: false,
        pedidos: false,
        instagram: false,
        etiquetas: false,
        herramientas: false,
      },
      puedePublicar: false,
    },
  },
  cloudinary: {
    cloudName: "ejl0yvoo",
    uploadPreset: "agresti3d_unsigned",
    folder: "agresti3d",
  },
};
