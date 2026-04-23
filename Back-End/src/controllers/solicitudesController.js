const solicitudesService = require('../services/solicitudesService');

const crearSolicitud = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fotos = req.files ? req.files.map(f => `${baseUrl}/uploads/${f.filename}`) : [];
    const data = await solicitudesService.crearSolicitud(req.body, fotos);
    res.status(201).json({ success: true, data });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ success: false, error: e.mensaje || e.message });
  }
};

const listarActivas = async (req, res) => {
  try {
    const data = await solicitudesService.listarActivas();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

const getDetalle = async (req, res) => {
  try {
    const data = await solicitudesService.getDetalle(req.params.id);
    res.json({ success: true, data });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ success: false, error: e.mensaje || e.message });
  }
};

const actualizarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    if (!estado) return res.status(400).json({ success: false, error: 'El campo estado es requerido' });
    const data = await solicitudesService.actualizarEstado(req.params.id, estado);
    res.json({ success: true, data });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ success: false, error: e.mensaje || e.message });
  }
};

module.exports = { crearSolicitud, listarActivas, getDetalle, actualizarEstado };
