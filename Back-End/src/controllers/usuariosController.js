const usuariosService = require('../services/usuariosService');

const getPerfil = async (req, res) => {
  try {
    const data = await usuariosService.getPerfil(req.params.id);
    res.json({ success: true, data });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ success: false, error: e.mensaje || e.message });
  }
};

const editarPerfil = async (req, res) => {
  try {
    const data = await usuariosService.editarPerfil(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ success: false, error: e.mensaje || e.message });
  }
};

const subirFoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No se recibió ninguna imagen' });
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fotoUrl = `${baseUrl}/uploads/${req.file.filename}`;
    const data = await usuariosService.subirFoto(req.params.id, fotoUrl);
    res.json({ success: true, data });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ success: false, error: e.mensaje || e.message });
  }
};

module.exports = { getPerfil, editarPerfil, subirFoto };
