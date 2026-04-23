const express = require('express');
const router = express.Router();
const { register, login, diagnostico, verificarCodigo, recuperarPassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/verificar-codigo', verificarCodigo);
router.post('/recuperar-password', recuperarPassword);
router.post('/login', login);
router.post('/diagnostico', diagnostico);

module.exports = router;
