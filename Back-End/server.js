require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./src/routes/authRoutes');
const usuariosRoutes = require('./src/routes/usuariosRoutes');
const solicitudesRoutes = require('./src/routes/solicitudesRoutes');
const ofertasRoutes = require('./src/routes/ofertasRoutes');
const proyectosRoutes = require('./src/routes/proyectosRoutes');
const calificacionesRoutes = require('./src/routes/calificacionesRoutes');

fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/ofertas', ofertasRoutes);
app.use('/api/proyectos', proyectosRoutes);
app.use('/api/calificaciones', calificacionesRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend operativo en el puerto ${PORT}`);
});
