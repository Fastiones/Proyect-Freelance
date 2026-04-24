const notifService = require('../services/notificacionesService');

const listar = async (req, res) => {
  try {
    const data = await notifService.listar(req.params.uid);
    res.json({ success: true, data });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, error: e.mensaje || e.message });
  }
};

const marcarLeida = async (req, res) => {
  try {
    const data = await notifService.marcarLeida(req.params.id);
    res.json({ success: true, data });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, error: e.mensaje || e.message });
  }
};

module.exports = { listar, marcarLeida };
