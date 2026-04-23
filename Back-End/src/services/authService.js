const admin = require('firebase-admin');
const { db } = require('../firebase');
const { transporter } = require('./emailService');

const generarCodigo = () => Math.floor(100000 + Math.random() * 900000).toString();

const registrar = async ({ nombre, email, password, rol, telefono }) => {
  const userRecord = await admin.auth().createUser({
    email,
    password,
    displayName: nombre
  });

  const codigo = generarCodigo();
  const expira = new Date(Date.now() + 15 * 60 * 1000);

  const docBase = {
    nombre,
    email,
    rol,
    foto: '',
    telefono: telefono || '',
    fechaRegistro: admin.firestore.FieldValue.serverTimestamp(),
    verificado: false,
    codigoVerificacion: codigo,
    codigoExpira: admin.firestore.Timestamp.fromDate(expira),
    ...(rol === 'empleador' && { saldo: 0, calificacionPromedioEmpleador: 0 })
  };

  const docEmpleado = {
    habilidades: [],
    calificacionPromedio: 0,
    gananciasTotales: 0
  };

  await db.collection('users').doc(userRecord.uid).set(
    rol === 'empleado' ? { ...docBase, ...docEmpleado } : docBase
  );

  try {
    await transporter.sendMail({
      from: `"ChambeX" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Tu código de verificación - ChambeX',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 30px;">
          <h2>¡Bienvenido a ChambeX, ${nombre}!</h2>
          <p>Ingresa este código en la app para activar tu cuenta:</p>
          <div style="font-size: 40px; font-weight: 900; letter-spacing: 10px; color: #28a745;
                      margin: 24px auto; background: #f0fff4; padding: 16px; border-radius: 10px;
                      display: inline-block;">
            ${codigo}
          </div>
          <p style="color: #777; font-size: 12px; margin-top: 12px;">Este código expira en 15 minutos.</p>
        </div>
      `
    });
  } catch (emailError) {
    console.error('Error al enviar código de verificación:', emailError.message);
  }

  return { uid: userRecord.uid, nombre, email, rol, mensaje: 'Registro exitoso. Ingresa el código que enviamos a tu correo.' };
};

const verificarCodigo = async (email, codigo) => {
  const userRecord = await admin.auth().getUserByEmail(email);
  const docRef = db.collection('users').doc(userRecord.uid);
  const doc = await docRef.get();

  if (!doc.exists) throw { status: 404, mensaje: 'Usuario no encontrado' };

  const data = doc.data();

  if (data.verificado) return { mensaje: 'Cuenta ya verificada. Puedes iniciar sesión.' };
  if (data.codigoVerificacion !== codigo) throw { status: 400, mensaje: 'Código incorrecto' };

  const ahora = admin.firestore.Timestamp.now();
  if (data.codigoExpira && data.codigoExpira.toMillis() < ahora.toMillis()) {
    throw { status: 400, mensaje: 'El código ha expirado. Regístrate de nuevo.' };
  }

  await Promise.all([
    docRef.update({
      verificado: true,
      codigoVerificacion: admin.firestore.FieldValue.delete(),
      codigoExpira: admin.firestore.FieldValue.delete()
    }),
    admin.auth().updateUser(userRecord.uid, { emailVerified: true })
  ]);

  return { mensaje: 'Cuenta verificada correctamente. Ya puedes iniciar sesión.' };
};

const login = async ({ email, password }) => {
  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    }
  );

  const data = await response.json();
  if (!response.ok) throw { status: 401, mensaje: 'Credenciales inválidas' };

  const doc = await db.collection('users').doc(data.localId).get();
  if (!doc.exists || !doc.data().verificado) {
    throw { status: 403, mensaje: 'Debes verificar tu cuenta antes de iniciar sesión. Revisa tu correo e ingresa el código.' };
  }

  return { uid: data.localId, email: data.email, token: data.idToken };
};

const guardarDiagnostico = async (uid, habilidades) => {
  await db.collection('users').doc(uid).update({ habilidades });
  return { uid, habilidades };
};

const recuperarPassword = async (email) => {
  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestType: 'PASSWORD_RESET', email })
    }
  );
  if (!response.ok) throw { status: 400, mensaje: 'No se encontró una cuenta con ese correo' };
  return { mensaje: 'Correo de recuperación enviado. Revisa tu bandeja de entrada.' };
};

module.exports = { registrar, login, guardarDiagnostico, verificarCodigo, recuperarPassword };
