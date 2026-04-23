const { db } = require('../firebase');

const calificar = async ({ proyectoId, estrellas, comentario }) => {
  const ref = db.collection('proyectos').doc(proyectoId);
  const doc = await ref.get();
  if (!doc.exists) throw { status: 404, mensaje: 'Proyecto no encontrado' };

  const data = doc.data();
  if (data.estado !== 'completado') throw { status: 400, mensaje: 'El proyecto debe estar completado para calificar' };
  if (data.calificacion) throw { status: 409, mensaje: 'Este proyecto ya fue calificado' };

  await ref.update({ calificacion: { estrellas, comentario: comentario || '' } });

  const snapshot = await db.collection('proyectos')
    .where('empleadoId', '==', data.empleadoId)
    .where('estado', '==', 'completado')
    .get();

  const calificados = snapshot.docs.filter(d => d.data().calificacion);
  const suma = calificados.reduce((acc, d) => acc + d.data().calificacion.estrellas, 0);
  const promedio = calificados.length > 0 ? Number((suma / calificados.length).toFixed(1)) : estrellas;

  await db.collection('users').doc(data.empleadoId).update({ calificacionPromedio: promedio });

  return { proyectoId, calificacion: { estrellas, comentario }, nuevoPromedio: promedio };
};

const calificarEmpleador = async ({ proyectoId, estrellas, comentario }) => {
  const ref = db.collection('proyectos').doc(proyectoId);
  const doc = await ref.get();
  if (!doc.exists) throw { status: 404, mensaje: 'Proyecto no encontrado' };

  const data = doc.data();
  if (data.estado !== 'completado') throw { status: 400, mensaje: 'El proyecto debe estar completado para calificar' };
  if (data.calificacionEmpleador) throw { status: 409, mensaje: 'Ya calificaste a este empleador' };

  await ref.update({ calificacionEmpleador: { estrellas, comentario: comentario || '' } });

  const snapshot = await db.collection('proyectos')
    .where('empleadorId', '==', data.empleadorId)
    .where('estado', '==', 'completado')
    .get();

  const calificados = snapshot.docs.filter(d => d.data().calificacionEmpleador);
  const suma = calificados.reduce((acc, d) => acc + d.data().calificacionEmpleador.estrellas, 0);
  const promedio = calificados.length > 0 ? Number((suma / calificados.length).toFixed(1)) : estrellas;

  await db.collection('users').doc(data.empleadorId).update({ calificacionPromedioEmpleador: promedio });

  return { proyectoId, calificacionEmpleador: { estrellas, comentario }, nuevoPromedio: promedio };
};

const getCalificacionesEmpleado = async (uid) => {
  const snapshot = await db.collection('proyectos')
    .where('empleadoId', '==', uid)
    .where('estado', '==', 'completado')
    .get();
  return snapshot.docs
    .filter(d => d.data().calificacion)
    .map(d => ({
      proyectoId: d.id,
      empleadorNombre: d.data().empleadorNombre || '—',
      ...d.data().calificacion
    }));
};

const getCalificacionesEmpleador = async (uid) => {
  const snapshot = await db.collection('proyectos')
    .where('empleadorId', '==', uid)
    .where('estado', '==', 'completado')
    .get();
  return snapshot.docs
    .filter(d => d.data().calificacionEmpleador)
    .map(d => ({
      proyectoId: d.id,
      empleadoNombre: d.data().empleadoNombre || '—',
      ...d.data().calificacionEmpleador
    }));
};

module.exports = { calificar, calificarEmpleador, getCalificacionesEmpleado, getCalificacionesEmpleador };
