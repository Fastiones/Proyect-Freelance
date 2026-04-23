const { admin, db } = require('../firebase');
const { getIo } = require('../socket');

const crear = async (uid, tipo, texto, datos = {}) => {
  const ref = db.collection('notificaciones').doc();
  const notif = { uid, tipo, texto, datos, leida: false, fecha: admin.firestore.FieldValue.serverTimestamp() };
  await ref.set(notif);
  const io = getIo();
  if (io) io.to(uid).emit('nueva_notificacion', { id: ref.id, uid, tipo, texto, datos, leida: false, fecha: new Date().toISOString() });
  return { id: ref.id };
};

const listar = async (uid) => {
  const snapshot = await db.collection('notificaciones')
    .where('uid', '==', uid)
    .orderBy('fecha', 'desc')
    .limit(50)
    .get();
  return snapshot.docs.map(doc => {
    const d = doc.data();
    return { id: doc.id, ...d, fecha: d.fecha?.toDate?.()?.toISOString() || null };
  });
};

const marcarLeida = async (id) => {
  await db.collection('notificaciones').doc(id).update({ leida: true });
  return { id, leida: true };
};

module.exports = { crear, listar, marcarLeida };
