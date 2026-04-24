const express = require('express');
const router = express.Router();
const { listar, marcarLeida } = require('../controllers/notificacionesController');

router.get('/:uid', listar);
router.patch('/:id/leer', marcarLeida);

module.exports = router;
