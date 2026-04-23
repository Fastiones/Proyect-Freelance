const { admin, db } = require('../firebase');

const listarPorUsuario = async (uid) => {
  const [comoEmpleador, comoEmpleado] = await Promise.all([
    db.collection('proyectos').where('empleadorId', '==', uid).get(),
    db.collection('proyectos').where('empleadoId', '==', uid).get()
  ]);
  const ids = new Set();
  const todos = [];
  for (const doc of [...comoEmpleador.docs, ...comoEmpleado.docs]) {
    if (!ids.has(doc.id)) { ids.add(doc.id); todos.push({ id: doc.id, ...doc.data() }); }
  }
  return todos;
};

const getProyecto = async (id) => {
  const doc = await db.collection('proyectos').doc(id).get();
  if (!doc.exists) throw { status: 404, mensaje: 'Proyecto no encontrado' };
  return { id: doc.id, ...doc.data() };
};

const pagar = async (id) => {
  const ref = db.collection('proyectos').doc(id);
  const doc = await ref.get();
  if (!doc.exists) throw { status: 404, mensaje: 'Proyecto no encontrado' };

  const proyecto = doc.data();
  if (proyecto.estado !== 'activo') throw { status: 400, mensaje: 'El proyecto debe estar activo para simular el pago' };

  const userRef = db.collection('users').doc(proyecto.empleadorId);
  const userDoc = await userRef.get();
  const saldo = userDoc.data()?.saldo ?? 0;

  if (saldo < proyecto.monto) {
    throw { status: 400, mensaje: `Saldo insuficiente. Tienes $${saldo.toFixed(2)} y el proyecto cuesta $${proyecto.monto}. Recarga tu saldo en el Dashboard.` };
  }

  const batch = db.batch();
  batch.update(ref, { estado: 'en_escrow' });
  batch.update(userRef, { saldo: admin.firestore.FieldValue.increment(-proyecto.monto) });
  await batch.commit();

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

module.exports = { listarPorUsuario, getProyecto, pagar, finalizar, validarCodigo, subirFotos };
