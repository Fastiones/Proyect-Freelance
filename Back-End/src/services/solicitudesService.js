const { admin, db } = require('../firebase');

const crearSolicitud = async (campos, fotos) => {
  const { empleadorId, titulo, categoria, descripcion, precioOfrecido } = campos;
  let ubicacion = campos.ubicacion;
  if (typeof ubicacion === 'string') {
    try { ubicacion = JSON.parse(ubicacion); } catch { ubicacion = {}; }
  }

  const nueva = {
    empleadorId,
    titulo: titulo || '',
    categoria,
    descripcion,
    precioOfrecido: Number(precioOfrecido),
    fotos: fotos || [],
    ubicacion: ubicacion || {},
    estado: 'activa',
    fechaCreacion: admin.firestore.FieldValue.serverTimestamp()
  };

  const docRef = await db.collection('solicitudes').add(nueva);
  return { id: docRef.id, ...nueva };
};

const listarActivas = async () => {
  const snapshot = await db.collection('solicitudes')
    .where('estado', '==', 'activa')
    .get();

  const solicitudes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const empleadorIds = [...new Set(solicitudes.map(s => s.empleadorId).filter(Boolean))];

  const perfiles = await Promise.all(empleadorIds.map(id => db.collection('users').doc(id).get()));
  const mapa = {};
  perfiles.forEach(doc => { if (doc.exists) mapa[doc.id] = doc.data(); });

  return solicitudes.map(s => ({
    ...s,
    empleadorNombre: mapa[s.empleadorId]?.nombre || s.empleadorId,
    calificacionEmpleador: mapa[s.empleadorId]?.calificacionPromedioEmpleador || 0
  }));
};

const getDetalle = async (id) => {
  const doc = await db.collection('solicitudes').doc(id).get();
  if (!doc.exists) throw { status: 404, mensaje: 'Solicitud no encontrada' };
  return { id: doc.id, ...doc.data() };
};

const actualizarEstado = async (id, estado) => {
  const validos = ['activa', 'en_proceso', 'completada'];
  if (!validos.includes(estado)) throw { status: 400, mensaje: 'Estado inválido. Debe ser: activa, en_proceso o completada' };
  await db.collection('solicitudes').doc(id).update({ estado });
  return { id, estado };
};

module.exports = { crearSolicitud, listarActivas, getDetalle, actualizarEstado };
