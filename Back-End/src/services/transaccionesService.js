const { admin, db } = require('../firebase');

const aceptarOferta = async ({ solicitudId, ofertaId }) => {
  const pinGenerado = Math.floor(1000 + Math.random() * 9000).toString();

  await db.runTransaction(async (t) => {
    const solicitudRef = db.collection('solicitudes').doc(solicitudId);
    const ofertaRef = db.collection('subastas').doc(ofertaId);

    const solicitudDoc = await t.get(solicitudRef);
    if (!solicitudDoc.exists) throw new Error('La solicitud no existe.');
    if (solicitudDoc.data().estado !== 'abierta') throw new Error('La solicitud ya fue asignada a otro empleado.');

    t.update(solicitudRef, {
      estado: 'en_progreso',
      ofertaAceptadaId: ofertaId,
      pinSeguridad: pinGenerado
    });

    t.update(ofertaRef, { estado: 'aceptada' });
  });

  return { nuevoEstadoSolicitud: 'en_progreso', pinSeguridad: pinGenerado };
};

const liberarFondos = async ({ solicitudId, empleadoId, pinIngresado, rating }) => {
  const solicitudRef = db.collection('solicitudes').doc(solicitudId);
  const solicitudDoc = await solicitudRef.get();

  if (!solicitudDoc.exists) throw { status: 404, codigo: 'NO_ENCONTRADO', mensaje: 'Solicitud no existe' };

  const data = solicitudDoc.data();

  if (data.pinSeguridad !== pinIngresado) throw { status: 400, codigo: 'PIN_INVALIDO', mensaje: 'El PIN ingresado es incorrecto.' };
  if (data.estado === 'completada') throw { status: 400, codigo: 'YA_COMPLETADO', mensaje: 'Este trabajo ya fue pagado.' };

  const montoFinal = data.presupuestoBase * 0.90;

  await solicitudRef.update({
    estado: 'completada',
    fechaFinalizacion: admin.firestore.FieldValue.serverTimestamp(),
    calificacionOtorgada: rating || 5
  });

  const empleadoRef = db.collection('usuarios').doc(empleadoId);
  const empleadoDoc = await empleadoRef.get();

  if (empleadoDoc.exists && rating) {
    const datosEmpleado = empleadoDoc.data();
    const totalTrabajosAntiguo = datosEmpleado.totalTrabajos || 0;
    const calificacionAntigua = datosEmpleado.calificacion || 5.0;
    const nuevoPromedio = ((calificacionAntigua * totalTrabajosAntiguo) + Number(rating)) / (totalTrabajosAntiguo + 1);

    await empleadoRef.update({
      totalTrabajos: admin.firestore.FieldValue.increment(1),
      gananciasAcumuladas: admin.firestore.FieldValue.increment(montoFinal),
      calificacion: Number(nuevoPromedio.toFixed(1))
    });
  }

  return { nuevoEstadoSolicitud: 'completada', gananciaEmpleado: montoFinal };
};

module.exports = { aceptarOferta, liberarFondos };
