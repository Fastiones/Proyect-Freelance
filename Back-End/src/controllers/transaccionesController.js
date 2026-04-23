const { aceptarOferta, liberarFondos } = require('../services/transaccionesService');

const postAceptarOferta = async (req, res) => {
  try {
    const data = await aceptarOferta(req.body);
    res.status(200).json({ success: true, mensaje: 'Oferta aceptada. Fondos retenidos en Escrow.', data });
  } catch (error) {
    res.status(400).json({ success: false, error: { codigo: 'ERROR_ACEPTAR_OFERTA', mensaje: error.message } });
  }
};

const postLiberarFondos = async (req, res) => {
  try {
    const data = await liberarFondos(req.body);
    res.status(200).json({ success: true, mensaje: 'PIN validado. Pago liberado y perfil de empleado actualizado.', data });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, error: { codigo: error.codigo || 'ERROR_SERVIDOR', mensaje: error.mensaje || error.message } });
  }
};

module.exports = { postAceptarOferta, postLiberarFondos };
