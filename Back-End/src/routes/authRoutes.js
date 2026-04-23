const express = require('express');
const router = express.Router();
const { register, login, diagnostico } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/diagnostico', diagnostico);

module.exports = router;
