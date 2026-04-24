const { admin, db } = require('../firebase');
const notifService = require('./notificacionesService');

const generarIdCorto = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

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

  try {
    const [solicitudDoc, empleadoDoc] = await Promise.all([
      db.collection('solicitudes').doc(solicitudId).get(),
      db.collection('users').doc(empleadoId).get()
    ]);
    if (solicitudDoc.exists) {
      const { empleadorId, titulo, categoria } = solicitudDoc.data();
      const empleadoNombre = empleadoDoc.exists ? empleadoDoc.data().nombre : 'Un empleado';
      await notifService.crear(
        empleadorId,
        'nueva_oferta',
        `${empleadoNombre} ofertó $${Number(precioOfertado)} por "${titulo || categoria}"`,
        { solicitudId, empleadoId }
      );
    }
  } catch (e) { console.error('Error notificando empleador:', e.message); }

  return { id: docRef.id, ...nueva };
};

const listarPorSolicitud = async (solicitudId) => {
  const snapshot = await db.collection('ofertas')
    .where('solicitudId', '==', solicitudId)
    .get();

  const ofertas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const enriquecidas = await Promise.all(ofertas.map(async (o) => {
    const userDoc = await db.collection('users').doc(o.empleadoId).get();
    return {
      ...o,
      empleadoNombre: userDoc.exists ? userDoc.data().nombre : o.empleadoId,
      calificacionPromedio: userDoc.exists ? (userDoc.data().calificacionPromedio || 0) : 0
    };
  }));

  return enriquecidas;
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

  const [empleadorDocReal, empleadoDoc] = await Promise.all([
    db.collection('users').doc(solicitud.empleadorId).get(),
    db.collection('users').doc(oferta.empleadoId).get()
  ]);

  const proyectoRef = db.collection('proyectos').doc(generarIdCorto());

  const proyecto = {
    solicitudId: oferta.solicitudId,
    titulo: solicitud.titulo || solicitud.categoria || 'Sin título',
    empleadorId: solicitud.empleadorId,
    empleadorNombre: empleadorDocReal.exists ? empleadorDocReal.data().nombre : solicitud.empleadorId,
    empleadoId: oferta.empleadoId,
    empleadoNombre: empleadoDoc.exists ? empleadoDoc.data().nombre : oferta.empleadoId,
    monto: oferta.precioOfertado,
    estado: 'activo',
    codigoLiberacion: '',
    fotosFinales: [],
    calificacion: null,
    calificacionEmpleador: null,
    fechaCreacion: admin.firestore.FieldValue.serverTimestamp()
  };

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

  try {
    await notifService.crear(
      oferta.empleadoId,
      'oferta_aceptada',
      `✅ ¡Tu oferta para "${proyecto.titulo}" fue aceptada!`,
      { proyectoId: proyectoRef.id }
    );
  } catch (e) { console.error('Error notificando empleado:', e.message); }

  return { proyectoId: proyectoRef.id, ...proyecto };
};

module.exports = { crearOferta, listarPorSolicitud, aceptarOferta };
