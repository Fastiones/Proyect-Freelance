const { db } = require('../firebase');

const getPerfil = async (id) => {
  const doc = await db.collection('users').doc(id).get();
  if (!doc.exists) throw { status: 404, mensaje: 'Usuario no encontrado' };
  return { id: doc.id, ...doc.data() };
};

const editarPerfil = async (id, datos) => {
  const camposPermitidos = ['nombre', 'telefono', 'habilidades'];
  const actualizacion = {};
  camposPermitidos.forEach(campo => {
    if (datos[campo] !== undefined) actualizacion[campo] = datos[campo];
  });
  if (Object.keys(actualizacion).length === 0) throw { status: 400, mensaje: 'No hay campos válidos para actualizar' };
  await db.collection('users').doc(id).update(actualizacion);
  return actualizacion;
};

const subirFoto = async (id, fotoUrl) => {
  await db.collection('users').doc(id).update({ foto: fotoUrl });
  return { foto: fotoUrl };
};

module.exports = { getPerfil, editarPerfil, subirFoto };
