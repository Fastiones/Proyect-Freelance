components/  ← piezas reutilizables (Navbar, Card, ChatBox, etc.)
public/ ← Landing, Login, Register
empleador/    ← Dashboard, NuevaSolicitud, Ofertas, Proyecto
empleado/     ← Dashboard, Mapa, Portafolio, Proyecto
store/            ← Zustand (authStore.js, proyectoStore.js)
services/         ← llamadas HTTP al backend (un archivo por módulo)
firebase/         ← config.js (inicialización Firebase SDK)
utils/            ← funciones auxiliares pequeñas

BACKEND
routes/           ← URLs de la API
controllers/      ← lógica de cada endpoint
middleware/       ← auth, upload (Multer)
services/         ← email.service.js, codigo.service.js
firebase/         ← admin.js (Firebase Admin SDK)