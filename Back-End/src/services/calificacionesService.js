const { db } = require('../firebase');

const calificar = async ({ proyectoId, estrellas, comentario }) => {
  const ref = db.collection('proyectos').doc(proyectoId);
  const doc = await ref.get();
  if (!doc.exists) throw { status: 404, mensaje: 'Proyecto no encontrado' };

  const data = doc.data();
  if (data.estado !== 'completado') throw { status: 400, mensaje: 'El proyecto debe estar completado para calificar' };
  if (data.calificacion) throw { status: 409, mensaje: 'Este proyecto ya fue calificado' };

  await ref.update({ calificacion: { estrellas, comentario: comentario || '' } });

  // Recalcular promedio del empleado con todos sus proyectos calificados
  const snapshot = await db.collection('proyectos')
    .where('empleadoId', '==', data.empleadoId)
    .where('estado', '==', 'completado')
    .get();

  const calificados = snapshot.docs.filter(d => d.data().calificacion !== null);
  const suma = calificados.reduce((acc, d) => acc + d.data().calificacion.estrellas, 0);
  const promedio = calificados.length > 0 ? Number((suma / calificados.length).toFixed(1)) : estrellas;

  await db.collection('users').doc(data.empleadoId).update({ calificacionPromedio: promedio });

  return { proyectoId, calificacion: { estrellas, comentario }, nuevoPromedio: promedio };
};

module.exports = { calificar };
