// Pasos de las pruebas de API (sin navegador).
// Cada respuesta se guarda en el contexto (ctx) para verificarla después,
// y se adjunta al reporte HTML como evidencia.
import { expect } from '@playwright/test';
import { Given, When, Then } from '../support/fixtures.js';
import { newUser, fullContact } from '../utils/data.js';
import { readBody } from '../utils/helpers.js';

async function saveResponse(ctx, evidence, name, response) {
  ctx.response = response;
  ctx.body = await readBody(response);
  await evidence.response(name, response, ctx.body);
}

// ======================= Usuarios =======================

When('creo un usuario nuevo por API', async ({ api, ctx, evidence }) => {
  ctx.user = newUser();
  await saveResponse(ctx, evidence, 'POST /users', await api.createUser(ctx.user));
});

When('creo otro usuario con el mismo email por API', async ({ api, ctx, evidence }) => {
  const duplicated = { ...newUser(), email: ctx.user.email };
  await saveResponse(ctx, evidence, 'POST /users (email duplicado)', await api.createUser(duplicated));
});

When('creo un usuario sin datos por API', async ({ api, ctx, evidence }) => {
  await saveResponse(ctx, evidence, 'POST /users (sin datos)', await api.createUser({}));
});

When('consulto mi perfil por API', async ({ api, ctx, evidence }) => {
  await saveResponse(ctx, evidence, 'GET /users/me', await api.getProfile(ctx.token));
});

When('consulto mi perfil por API sin token', async ({ api, ctx, evidence }) => {
  await saveResponse(ctx, evidence, 'GET /users/me (sin token)', await api.getProfile(null));
});

When('actualizo mi nombre a {string} por API', async ({ api, ctx, evidence }, firstName) => {
  await saveResponse(ctx, evidence, 'PATCH /users/me', await api.updateProfile(ctx.token, { firstName }));
});

When('elimino mi usuario por API', async ({ api, ctx, evidence }) => {
  await saveResponse(ctx, evidence, 'DELETE /users/me', await api.deleteUser(ctx.token));
});

Then('la respuesta incluye un token', async ({ ctx }) => {
  expect(ctx.body.token).toBeTruthy();
});

Then('la respuesta incluye el email del usuario', async ({ ctx }) => {
  // Al crear o hacer login el usuario viene en body.user; en el perfil viene directo en body
  const email = ctx.body.user?.email ?? ctx.body.email;
  expect(email).toBe(ctx.user.email.toLowerCase());
});

Then('la respuesta no incluye la contraseña', async ({ ctx }) => {
  expect(ctx.body).not.toHaveProperty('password');
});

Then('ya no puedo iniciar sesión con ese usuario', async ({ api, ctx, evidence }) => {
  const response = await api.login(ctx.user.email, ctx.user.password);
  await evidence.response('POST /users/login (usuario eliminado)', response, await readBody(response));
  expect(response.status()).toBe(401);
});

// ======================= Login / logout =======================

When('inicio sesión por API con mis credenciales', async ({ api, ctx, evidence }) => {
  await saveResponse(ctx, evidence, 'POST /users/login', await api.login(ctx.user.email, ctx.user.password));
});

When('inicio sesión por API con la contraseña {string}', async ({ api, ctx, evidence }, password) => {
  await saveResponse(ctx, evidence, 'POST /users/login (clave incorrecta)', await api.login(ctx.user.email, password));
});

When('cierro sesión por API', async ({ api, ctx, evidence }) => {
  await saveResponse(ctx, evidence, 'POST /users/logout', await api.logout(ctx.token));
});

Then('mi token ya no sirve', async ({ api, ctx, evidence }) => {
  const response = await api.getProfile(ctx.token);
  await evidence.response('GET /users/me (después del logout)', response, await readBody(response));
  expect(response.status()).toBe(401);
});

// ======================= Contactos =======================

Given('que tengo un contacto creado por API', async ({ api, ctx }) => {
  ctx.contact = fullContact();
  const response = await api.createContact(ctx.token, ctx.contact);
  expect(response.status(), 'No se pudo crear el contacto de prueba (precondición)').toBe(201);
  ctx.contactId = (await response.json())._id;
});

When('creo un contacto válido por API', async ({ api, ctx, evidence }) => {
  ctx.contact = fullContact();
  await saveResponse(ctx, evidence, 'POST /contacts', await api.createContact(ctx.token, ctx.contact));
  ctx.contactId = ctx.body?._id;
});

When('creo un contacto válido por API sin token', async ({ api, ctx, evidence }) => {
  await saveResponse(ctx, evidence, 'POST /contacts (sin token)', await api.createContact(null, fullContact()));
});

When('creo un contacto por API con estos datos:', async ({ api, ctx, evidence }, dataTable) => {
  const contact = dataTable.rowsHash();
  await saveResponse(ctx, evidence, 'POST /contacts (datos inválidos)', await api.createContact(ctx.token, contact));
});

Then('la respuesta incluye el id del contacto', async ({ ctx }) => {
  expect(ctx.body._id).toBeTruthy();
});

When('consulto la lista de contactos por API', async ({ api, ctx, evidence }) => {
  await saveResponse(ctx, evidence, 'GET /contacts', await api.listContacts(ctx.token));
});

Then('la lista incluye el contacto creado', async ({ ctx }) => {
  const ids = ctx.body.map((contact) => contact._id);
  expect(ids).toContain(ctx.contactId);
});

When('consulto el contacto por API', async ({ api, ctx, evidence }) => {
  await saveResponse(ctx, evidence, 'GET /contacts/{id}', await api.getContact(ctx.token, ctx.contactId));
});

Then('la respuesta tiene los datos del contacto creado', async ({ ctx }) => {
  for (const field of ['firstName', 'lastName', 'email', 'phone', 'city', 'country']) {
    expect(ctx.body[field], `Campo ${field}`).toBe(ctx.contact[field]);
  }
});

When('reemplazo el contacto por API con nombre {string} y apellido {string}',
  async ({ api, ctx, evidence }, firstName, lastName) => {
    // PUT reemplaza el contacto completo, por eso se envían todos los campos
    const newData = { ...fullContact(), firstName, lastName };
    await saveResponse(ctx, evidence, 'PUT /contacts/{id}', await api.replaceContact(ctx.token, ctx.contactId, newData));
  });

When('actualizo solo el nombre del contacto a {string} por API', async ({ api, ctx, evidence }, firstName) => {
  // PATCH cambia solo los campos que se envían
  await saveResponse(ctx, evidence, 'PATCH /contacts/{id}', await api.updateContact(ctx.token, ctx.contactId, { firstName }));
});

Then('los demás datos del contacto no cambiaron', async ({ ctx }) => {
  for (const field of ['lastName', 'email', 'phone', 'city', 'country']) {
    expect(ctx.body[field], `Campo ${field}`).toBe(ctx.contact[field]);
  }
});

When('elimino el contacto por API', async ({ api, ctx, evidence }) => {
  await saveResponse(ctx, evidence, 'DELETE /contacts/{id}', await api.deleteContact(ctx.token, ctx.contactId));
});

Then('el contacto ya no existe', async ({ api, ctx, evidence }) => {
  const response = await api.getContact(ctx.token, ctx.contactId);
  await evidence.response('GET /contacts/{id} (después de eliminar)', response, await readBody(response));
  expect(response.status()).toBe(404);
});
