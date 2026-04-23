const express = require('express');
const router = express.Router();
const { crearOferta, listarPorSolicitud, aceptarOferta } = require('../controllers/ofertasController');

router.post('/', crearOferta);
router.get('/:solicitudId', listarPorSolicitud);
router.put('/:id/aceptar', aceptarOferta);

module.exports = router;
