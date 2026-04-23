const authService = require('../services/authService');

const verificarCodigo = async (req, res) => {
  const { email, codigo } = req.body;
  if (!email || !codigo) return res.status(400).json({ success: false, error: 'email y codigo son requeridos' });
  try {
    const data = await authService.verificarCodigo(email, codigo);
    res.json({ success: true, data });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ success: false, error: e.mensaje || e.message });
  }
};

const register = async (req, res) => {
  try {
    const data = await authService.registrar(req.body);
    res.status(201).json({ success: true, data });
  } catch (e) {
    const esEmailDuplicado = e.errorInfo?.code === 'auth/email-already-exists';
    const status = e.status || (esEmailDuplicado ? 409 : 500);
    res.status(status).json({ success: false, error: e.mensaje || e.message });
  }
};

const login = async (req, res) => {
  try {
    const data = await authService.login(req.body);
    res.status(200).json({ success: true, data });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ success: false, error: e.mensaje || e.message });
  }
};

const diagnostico = async (req, res) => {
  const { uid, habilidades } = req.body;
  try {
    if (!uid || !Array.isArray(habilidades)) {
      return res.status(400).json({ success: false, error: 'uid y habilidades (array) son requeridos' });
    }
    const data = await authService.guardarDiagnostico(uid, habilidades);
    res.status(200).json({ success: true, data });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ success: false, error: e.mensaje || e.message });
  }
};

const recuperarPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'El correo es requerido' });
  try {
    const data = await authService.recuperarPassword(email);
    res.json({ success: true, data });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ success: false, error: e.mensaje || e.message });
  }
};

module.exports = { register, login, diagnostico, verificarCodigo, recuperarPassword };
