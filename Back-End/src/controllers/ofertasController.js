const ofertasService = require('../services/ofertasService');

const crearOferta = async (req, res) => {
  try {
    const data = await ofertasService.crearOferta(req.body);
    res.status(201).json({ success: true, data });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ success: false, error: e.mensaje || e.message });
  }
};

const listarPorSolicitud = async (req, res) => {
  try {
    const data = await ofertasService.listarPorSolicitud(req.params.solicitudId);
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

const aceptarOferta = async (req, res) => {
  try {
    const data = await ofertasService.aceptarOferta(req.params.id);
    res.json({ success: true, mensaje: 'Oferta aceptada. Proyecto creado.', data });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ success: false, error: e.mensaje || e.message });
  }
};

module.exports = { crearOferta, listarPorSolicitud, aceptarOferta };
