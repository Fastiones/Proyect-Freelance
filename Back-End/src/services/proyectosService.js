const { admin, db } = require('../firebase');

const getProyecto = async (id) => {
  const doc = await db.collection('proyectos').doc(id).get();
  if (!doc.exists) throw { status: 404, mensaje: 'Proyecto no encontrado' };
  return { id: doc.id, ...doc.data() };
};

const pagar = async (id) => {
  const ref = db.collection('proyectos').doc(id);
  const doc = await ref.get();
  if (!doc.exists) throw { status: 404, mensaje: 'Proyecto no encontrado' };
  if (doc.data().estado !== 'activo') throw { status: 400, mensaje: 'El proyecto debe estar activo para simular el pago' };
  await ref.update({ estado: 'en_escrow' });
  return { id, estado: 'en_escrow' };
};

const finalizar = async (id) => {
  const ref = db.collection('proyectos').doc(id);
  const doc = await ref.get();
  if (!doc.exists) throw { status: 404, mensaje: 'Proyecto no encontrado' };
  if (doc.data().estado !== 'en_escrow') throw { status: 400, mensaje: 'El pago debe estar en escrow para finalizar' };

  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  await ref.update({ estado: 'pendiente_codigo', codigoLiberacion: codigo });
  return { id, estado: 'pendiente_codigo', codigoLiberacion: codigo };
};

const validarCodigo = async (id, codigo) => {
  const ref = db.collection('proyectos').doc(id);
  const doc = await ref.get();
  if (!doc.exists) throw { status: 404, mensaje: 'Proyecto no encontrado' };

  const data = doc.data();
  if (data.estado !== 'pendiente_codigo') throw { status: 400, mensaje: 'El proyecto no está esperando código' };
  if (data.codigoLiberacion !== codigo) throw { status: 400, mensaje: 'Código incorrecto' };

  const gananciaEmpleado = data.monto * 0.90;

  const batch = db.batch();
  batch.update(ref, {
    estado: 'completado',
    fechaFinalizacion: admin.firestore.FieldValue.serverTimestamp()
  });
  batch.update(db.collection('solicitudes').doc(data.solicitudId), { estado: 'completada' });
  batch.update(db.collection('users').doc(data.empleadoId), {
    gananciasTotales: admin.firestore.FieldValue.increment(gananciaEmpleado)
  });
  await batch.commit();

  return { id, estado: 'completado', gananciaEmpleado };
};

const subirFotos = async (id, fotos) => {
  const ref = db.collection('proyectos').doc(id);
  const doc = await ref.get();
  if (!doc.exists) throw { status: 404, mensaje: 'Proyecto no encontrado' };
  await ref.update({ fotosFinales: admin.firestore.FieldValue.arrayUnion(...fotos) });
  return { id, fotosAgregadas: fotos };
};

module.exports = { getProyecto, pagar, finalizar, validarCodigo, subirFotos };
