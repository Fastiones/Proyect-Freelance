const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { getProyecto, pagar, finalizar, validarCodigo, subirFotos } = require('../controllers/proyectosController');

router.get('/:id', getProyecto);
router.put('/:id/pagar', pagar);
router.put('/:id/finalizar', finalizar);
router.post('/:id/codigo', validarCodigo);
router.post('/:id/fotos', upload.array('fotos', 10), subirFotos);

module.exports = router;
