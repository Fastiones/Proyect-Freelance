const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { listarPorUsuario, getProyecto, pagar, finalizar, validarCodigo, subirFotos, cancelar } = require('../controllers/proyectosController');

// /usuario/:uid debe ir ANTES de /:id para que Express no lo capture como ID
router.get('/usuario/:uid', listarPorUsuario);
router.get('/:id', getProyecto);
router.put('/:id/pagar', pagar);
router.put('/:id/finalizar', finalizar);
router.post('/:id/codigo', validarCodigo);
router.put('/:id/cancelar', cancelar);
router.post('/:id/fotos', upload.array('fotos', 10), subirFotos);

module.exports = router;
