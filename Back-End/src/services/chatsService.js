const { admin, db } = require('../firebase');
const { getIo } = require('../socket');

const enviarMensaje = async (proyectoId, { autorId, texto }) => {
  const proyectoDoc = await db.collection('proyectos').doc(proyectoId).get();
  if (!proyectoDoc.exists) throw { status: 404, mensaje: 'Proyecto no encontrado' };

  const proyecto = proyectoDoc.data();
  const participantes = [proyecto.empleadorId, proyecto.empleadoId];
  if (!participantes.includes(autorId)) {
    throw { status: 403, mensaje: 'No eres participante de este proyecto' };
  }

  const mensajeRef = db.collection('chats').doc(proyectoId).collection('mensajes').doc();
  const mensaje = { autorId, texto, timestamp: admin.firestore.FieldValue.serverTimestamp() };
  await mensajeRef.set(mensaje);

  const autorDoc = await db.collection('users').doc(autorId).get();
  const autorNombre = autorDoc.exists ? autorDoc.data().nombre : 'Usuario';
  const proyectoTitulo = proyecto.titulo || proyecto.categoria || 'Proyecto';

  // Notificar al otro participante en la campanita (sin guardar en Firestore)
  const otroId = proyecto.empleadorId === autorId ? proyecto.empleadoId : proyecto.empleadorId;
  const io = getIo();
  if (io) {
    io.to(otroId).emit('nueva_notificacion', {
      id: `chat_${mensajeRef.id}`,
      tipo: 'nuevo_mensaje',
      texto: `💬 ${autorNombre}: "${texto.length > 40 ? texto.substring(0, 40) + '…' : texto}"`,
      datos: { proyectoId, proyectoTitulo },
      leida: false,
      fecha: new Date().toISOString()
    });
  }

  return { id: mensajeRef.id, ...mensaje, autorNombre, proyectoTitulo, proyectoId };
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
