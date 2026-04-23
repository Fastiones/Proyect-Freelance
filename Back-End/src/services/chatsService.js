const { admin, db } = require('../firebase');

const enviarMensaje = async (proyectoId, { autorId, texto }) => {
  const proyectoDoc = await db.collection('proyectos').doc(proyectoId).get();
  if (!proyectoDoc.exists) throw { status: 404, mensaje: 'Proyecto no encontrado' };

  const proyecto = proyectoDoc.data();
  const participantes = [proyecto.empleadorId, proyecto.empleadoId];
  if (!participantes.includes(autorId)) {
    throw { status: 403, mensaje: 'No eres participante de este proyecto' };
  }

  const mensajeRef = db
    .collection('chats').doc(proyectoId)
    .collection('mensajes').doc();

  const mensaje = {
    autorId,
    texto,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  };

  await mensajeRef.set(mensaje);
  return { id: mensajeRef.id, ...mensaje };
};

const obtenerMensajes = async (proyectoId) => {
  const proyectoDoc = await db.collection('proyectos').doc(proyectoId).get();
  if (!proyectoDoc.exists) throw { status: 404, mensaje: 'Proyecto no encontrado' };

  const snapshot = await db
    .collection('chats').doc(proyectoId)
    .collection('mensajes')
    .orderBy('timestamp', 'asc')
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

module.exports = { enviarMensaje, obtenerMensajes };
