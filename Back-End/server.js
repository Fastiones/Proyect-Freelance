require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs   = require('fs');
const { Server } = require('socket.io');

const socketModule = require('./src/socket');
const authRoutes = require('./src/routes/authRoutes');
const usuariosRoutes = require('./src/routes/usuariosRoutes');
const solicitudesRoutes = require('./src/routes/solicitudesRoutes');
const ofertasRoutes = require('./src/routes/ofertasRoutes');
const proyectosRoutes = require('./src/routes/proyectosRoutes');
const calificacionesRoutes = require('./src/routes/calificacionesRoutes');
const chatsRoutes = require('./src/routes/chatsRoutes');
const notificacionesRoutes = require('./src/routes/notificacionesRoutes');

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
app.use('/api/chats', chatsRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
socketModule.init(io);

io.on('connection', (socket) => {
  socket.on('join_user', ({ uid }) => {
    socket.join(uid);
  });

  socket.on('join_room', ({ proyectoId }) => {
    socket.join(proyectoId);
  });

  socket.on('typing', ({ proyectoId, nombre }) => {
    socket.to(proyectoId).emit('typing', { nombre });
  });

  socket.on('stop_typing', ({ proyectoId }) => {
    socket.to(proyectoId).emit('stop_typing');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend operativo en el puerto ${PORT}`);
});
