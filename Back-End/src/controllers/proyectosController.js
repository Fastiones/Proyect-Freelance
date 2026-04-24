const proyectosService = require('../services/proyectosService');

const listarPorUsuario = async (req, res) => {
  try {
    const data = await proyectosService.listarPorUsuario(req.params.uid);
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.mensaje || e.message });
  }
};

const getProyecto = async (req, res) => {
  try {
    const data = await proyectosService.getProyecto(req.params.id);
    res.json({ success: true, data });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ success: false, error: e.mensaje || e.message });
  }
};

const pagar = async (req, res) => {
  try {
    const data = await proyectosService.pagar(req.params.id);
    res.json({ success: true, mensaje: 'Pago simulado. Fondos retenidos en escrow.', data });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ success: false, error: e.mensaje || e.message });
  }
};

const finalizar = async (req, res) => {
  try {
    const data = await proyectosService.finalizar(req.params.id);
    res.json({ success: true, mensaje: 'Trabajo marcado como finalizado. Código generado para el empleador.', data });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ success: false, error: e.mensaje || e.message });
  }
};

const validarCodigo = async (req, res) => {
  try {
    const { codigo } = req.body;
    if (!codigo) return res.status(400).json({ success: false, error: 'El código es requerido' });
    const data = await proyectosService.validarCodigo(req.params.id, codigo);
    res.json({ success: true, mensaje: 'Código válido. Pago liberado. Proyecto completado.', data });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ success: false, error: e.mensaje || e.message });
  }
};

const subirFotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No se recibieron imágenes' });
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fotos = req.files.map(f => `${baseUrl}/uploads/${f.filename}`);
    const data = await proyectosService.subirFotos(req.params.id, fotos);
    res.json({ success: true, data });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ success: false, error: e.mensaje || e.message });
  }
};

const cancelar = async (req, res) => {
  try {
    const data = await proyectosService.cancelar(req.params.id);
    const mensaje = data.montoDevuelto > 0
      ? `Proyecto cancelado. $${data.montoDevuelto.toFixed(2)} devueltos al saldo del empleador.`
      : 'Proyecto cancelado.';
    res.json({ success: true, mensaje, data });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ success: false, error: e.mensaje || e.message });
  }
};

module.exports = { listarPorUsuario, getProyecto, pagar, finalizar, validarCodigo, subirFotos, cancelar };
