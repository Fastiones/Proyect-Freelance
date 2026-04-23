const express = require('express');
const router = express.Router();
const {
  calificar,
  calificarEmpleador,
  getCalificacionesEmpleado,
  getCalificacionesEmpleador
} = require('../controllers/calificacionesController');

router.post('/', calificar);
router.post('/empleador', calificarEmpleador);
router.get('/empleado/:uid', getCalificacionesEmpleado);
router.get('/empleador/:uid', getCalificacionesEmpleador);

module.exports = router;
