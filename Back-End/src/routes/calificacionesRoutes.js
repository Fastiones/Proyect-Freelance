const express = require('express');
const router = express.Router();
const { calificar } = require('../controllers/calificacionesController');

router.post('/', calificar);

module.exports = router;
