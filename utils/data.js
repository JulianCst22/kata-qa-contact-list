// Datos de prueba.
// La base de datos de la app se reinicia seguido, así que cada prueba
// crea sus propios datos con un email único (fecha/hora + número aleatorio).

export function uniqueEmail(prefix = 'qa') {
  const unique = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  return `${prefix}.${unique}@test.com`;
}

export function newUser() {
  return {
    firstName: 'Julian',
    lastName: 'QA',
    email: uniqueEmail('julian'),
    password: 'Clave12345',
  };
}

export function fullContact() {
  return {
    firstName: 'Juan',
    lastName: 'Perez',
    birthdate: '1990-05-20',
    email: uniqueEmail('juan'),
    phone: '3001234567',
    street1: 'Calle 10 20-30',
    street2: 'Apto 401',
    city: 'Bogota',
    stateProvince: 'Cundinamarca',
    postalCode: '110111',
    country: 'Colombia',
  };
}
