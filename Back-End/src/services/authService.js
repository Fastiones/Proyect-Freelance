const admin = require('firebase-admin');
const { db } = require('../firebase');

const registrar = async ({ nombre, email, password, rol, telefono }) => {
  const userRecord = await admin.auth().createUser({
    email,
    password,
    displayName: nombre
  });

  await db.collection('users').doc(userRecord.uid).set({
    nombre,
    email,
    rol,
    foto: '',
    telefono: telefono || '',
    habilidades: [],
    calificacionPromedio: 0,
    gananciasTotales: 0,
    fechaRegistro: admin.firestore.FieldValue.serverTimestamp()
  });

  return { uid: userRecord.uid, nombre, email, rol };
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

  return { uid: data.localId, email: data.email, token: data.idToken };
};

const guardarDiagnostico = async (uid, habilidades) => {
  await db.collection('users').doc(uid).update({ habilidades });
  return { uid, habilidades };
};

module.exports = { registrar, login, guardarDiagnostico };
