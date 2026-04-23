const chatsService = require('../services/chatsService');
const { getIo } = require('../socket');

const enviarMensaje = async (req, res) => {
  try {
    const { autorId, texto } = req.body;
    if (!autorId || !texto) {
      return res.status(400).json({ success: false, error: 'autorId y texto son requeridos' });
    }
    const data = await chatsService.enviarMensaje(req.params.proyectoId, { autorId, texto });
    const io = getIo();
    if (io) io.to(req.params.proyectoId).emit('new_message', data);
    res.status(201).json({ success: true, data });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ success: false, error: e.mensaje || e.message });
  }
};

const obtenerMensajes = async (req, res) => {
  try {
    const data = await chatsService.obtenerMensajes(req.params.proyectoId);
    res.json({ success: true, data });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ success: false, error: e.mensaje || e.message });
  }
};

module.exports = { enviarMensaje, obtenerMensajes };
