const { admin, db } = require('../firebase');

const crearOferta = async ({ solicitudId, empleadoId, precioOfertado }) => {
  const existente = await db.collection('ofertas')
    .where('solicitudId', '==', solicitudId)
    .where('empleadoId', '==', empleadoId)
    .get();

  if (!existente.empty) throw { status: 409, mensaje: 'Ya enviaste una oferta para esta solicitud' };

  const nueva = {
    solicitudId,
    empleadoId,
    precioOfertado: Number(precioOfertado),
    estado: 'pendiente',
    fecha: admin.firestore.FieldValue.serverTimestamp()
  };

  const docRef = await db.collection('ofertas').add(nueva);
  return { id: docRef.id, ...nueva };
};

const listarPorSolicitud = async (solicitudId) => {
  const snapshot = await db.collection('ofertas')
    .where('solicitudId', '==', solicitudId)
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const aceptarOferta = async (ofertaId) => {
  const ofertaRef = db.collection('ofertas').doc(ofertaId);
  const ofertaDoc = await ofertaRef.get();
  if (!ofertaDoc.exists) throw { status: 404, mensaje: 'Oferta no encontrada' };

  const oferta = ofertaDoc.data();
  if (oferta.estado !== 'pendiente') throw { status: 400, mensaje: 'Esta oferta ya fue procesada' };

  const solicitudRef = db.collection('solicitudes').doc(oferta.solicitudId);
  const solicitudDoc = await solicitudRef.get();
  if (!solicitudDoc.exists) throw { status: 404, mensaje: 'Solicitud no encontrada' };

  const solicitud = solicitudDoc.data();
  const proyectoRef = db.collection('proyectos').doc();

  const proyecto = {
    solicitudId: oferta.solicitudId,
    empleadorId: solicitud.empleadorId,
    empleadoId: oferta.empleadoId,
    monto: oferta.precioOfertado,
    estado: 'activo',
    codigoLiberacion: '',
    fotosFinales: [],
    calificacion: null,
    fechaCreacion: admin.firestore.FieldValue.serverTimestamp()
  };

  // Batch: crear proyecto + actualizar oferta + actualizar solicitud + rechazar otras ofertas
  const otrasOfertas = await db.collection('ofertas')
    .where('solicitudId', '==', oferta.solicitudId)
    .where('estado', '==', 'pendiente')
    .get();

  const batch = db.batch();
  batch.set(proyectoRef, proyecto);
  batch.update(ofertaRef, { estado: 'aceptada' });
  batch.update(solicitudRef, { estado: 'en_proceso' });
  otrasOfertas.docs.forEach(doc => {
    if (doc.id !== ofertaId) batch.update(doc.ref, { estado: 'rechazada' });
  });

  await batch.commit();
  return { proyectoId: proyectoRef.id, ...proyecto };
};

module.exports = { crearOferta, listarPorSolicitud, aceptarOferta };
