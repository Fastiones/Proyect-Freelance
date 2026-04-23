const express = require('express');
const router = express.Router();
const { postAceptarOferta, postLiberarFondos } = require('../controllers/transaccionesController');

router.post('/aceptar', postAceptarOferta);
router.post('/liberar', postLiberarFondos);

module.exports = router;
