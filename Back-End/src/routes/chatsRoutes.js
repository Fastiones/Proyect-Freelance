const express = require('express');
const router = express.Router();
const { enviarMensaje, obtenerMensajes } = require('../controllers/chatsController');

router.post('/:proyectoId/mensajes', enviarMensaje);
router.get('/:proyectoId/mensajes', obtenerMensajes);

module.exports = router;
