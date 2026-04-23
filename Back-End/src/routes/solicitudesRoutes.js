const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { crearSolicitud, listarActivas, getDetalle, actualizarEstado } = require('../controllers/solicitudesController');

router.post('/', upload.array('fotos', 5), crearSolicitud);
router.get('/', listarActivas);
router.get('/:id', getDetalle);
router.put('/:id', actualizarEstado);

module.exports = router;
