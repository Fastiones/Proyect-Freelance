const calificacionesService = require('../services/calificacionesService');

const calificar = async (req, res) => {
  try {
    const { proyectoId, estrellas, comentario } = req.body;
    if (!proyectoId || estrellas === undefined) {
      return res.status(400).json({ success: false, error: 'proyectoId y estrellas son requeridos' });
    }
    if (Number(estrellas) < 1 || Number(estrellas) > 5) {
      return res.status(400).json({ success: false, error: 'Las estrellas deben ser un valor entre 1 y 5' });
    }
    const data = await calificacionesService.calificar({
      proyectoId,
      estrellas: Number(estrellas),
      comentario
    });
    res.status(201).json({ success: true, data });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ success: false, error: e.mensaje || e.message });
  }
};

module.exports = { calificar };
