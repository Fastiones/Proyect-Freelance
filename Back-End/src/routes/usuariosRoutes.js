const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { getPerfil, editarPerfil, subirFoto } = require('../controllers/usuariosController');

router.get('/:id', getPerfil);
router.put('/:id', editarPerfil);
router.post('/:id/foto', upload.single('foto'), subirFoto);

module.exports = router;
