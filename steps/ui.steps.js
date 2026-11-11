// Pasos de las pruebas de interfaz (UI).
// Cada paso usa los Page Objects, nunca selectores sueltos (salvo el mensaje de error común).
import { expect } from '@playwright/test';
import { Given, When, Then } from '../support/fixtures.js';
import { newUser, fullContact } from '../utils/data.js';
import { createUserByApi } from '../utils/helpers.js';

// ======================= Navegación y sesión =======================

Given('que estoy en la página de login', async ({ loginPage }) => {
  await loginPage.open();
  await expect(loginPage.submitButton).toBeVisible();
});

Given('voy a la página de registro', async ({ loginPage, signupPage }) => {
  await loginPage.goToSignup();
  await expect(signupPage.submitButton).toBeVisible();
});

// Precondición para los casos de contactos: usuario creado por API + login por la UI
Given('que inicié sesión en la app', async ({ api, ctx, loginPage, contactListPage }) => {
  await createUserByApi(api, ctx);
  await loginPage.open();
  await loginPage.login(ctx.user.email, ctx.user.password);
  await expect(contactListPage.addContactButton).toBeVisible();
});

// ======================= Registro =======================

When('me registro con datos válidos', async ({ signupPage, ctx }) => {
  ctx.user = newUser();
  await signupPage.register(ctx.user);
});

When('me registro con el email de ese usuario', async ({ signupPage, ctx }) => {
  await signupPage.register({ ...newUser(), email: ctx.user.email });
});

When('envío el formulario de registro vacío', async ({ signupPage }) => {
  await signupPage.submit();
});

// ======================= Login / logout =======================

When('inicio sesión con mis credenciales', async ({ loginPage, ctx }) => {
  await loginPage.login(ctx.user.email, ctx.user.password);
});

When('inicio sesión con la contraseña {string}', async ({ loginPage, ctx }, password) => {
  await loginPage.login(ctx.user.email, password);
});

When('inicio sesión con los campos vacíos', async ({ loginPage }) => {
  await loginPage.login('', '');
});

When('cierro sesión', async ({ contactListPage }) => {
  await expect(contactListPage.logoutButton).toBeVisible();
  await contactListPage.logout();
});

When('intento entrar directamente a la lista de contactos', async ({ contactListPage }) => {
  await contactListPage.open();
});

Then('vuelvo a la página de login', async ({ page, loginPage, evidence }) => {
  await expect(loginPage.signupButton).toBeVisible();
  await expect(page).not.toHaveURL(/contactList/);
  await evidence.screenshot(page, 'Página de login');
});

// ======================= Verificaciones comunes de UI =======================

Then('veo la lista de contactos', async ({ page, contactListPage, evidence }) => {
  await expect(page).toHaveURL(/contactList/);
  await expect(contactListPage.addContactButton).toBeVisible();
  await evidence.screenshot(page, 'Lista de contactos');
});

Then('veo un mensaje de error que contiene {string}', async ({ page, evidence }, text) => {
  const error = page.locator('#error');
  await expect(error).toBeVisible();
  await expect(error).toContainText(text);
  await evidence.screenshot(page, 'Mensaje de error');
});

// ======================= Contactos =======================

Given('que tengo un contacto creado', async ({ api, ctx, page, contactListPage }) => {
  // Se crea por API para no repetir el formulario en cada caso, y se recarga la lista
  ctx.contact = fullContact();
  const response = await api.createContact(ctx.token, ctx.contact);
  expect(response.status(), 'No se pudo crear el contacto de prueba (precondición)').toBe(201);
  await page.reload();
  await expect(contactListPage.rowFor(ctx.contact)).toBeVisible();
});

When('creo un contacto con todos los campos', async ({ ctx, contactListPage, contactFormPage }) => {
  ctx.contact = fullContact();
  await contactListPage.goToAddContact();
  await contactFormPage.fillForm(ctx.contact);
  await contactFormPage.submit();
});

When('creo un contacto con nombre {string} y apellido {string}',
  async ({ ctx, contactListPage, contactFormPage }, firstName, lastName) => {
    ctx.contact = { firstName, lastName };
    await contactListPage.goToAddContact();
    await contactFormPage.fillForm(ctx.contact);
    await contactFormPage.submit();
  });

When('intento crear un contacto con estos datos:',
  async ({ ctx, contactListPage, contactFormPage }, dataTable) => {
    ctx.contact = dataTable.rowsHash();
    await contactListPage.goToAddContact();
    await contactFormPage.fillForm(ctx.contact);
    await contactFormPage.submit();
  });

Then('el contacto aparece en la lista', async ({ page, ctx, contactListPage, evidence }) => {
  await expect(page).toHaveURL(/contactList/);
  await expect(contactListPage.rowFor(ctx.contact)).toBeVisible();
  await evidence.screenshot(page, 'Contacto en la lista');
});

When('abro el detalle del contacto', async ({ ctx, contactListPage }) => {
  await contactListPage.openContact(ctx.contact);
});

Then('veo los datos del contacto', async ({ page, ctx, contactDetailsPage, evidence }) => {
  for (const field of ['firstName', 'lastName', 'email', 'phone', 'city', 'country']) {
    await expect(contactDetailsPage.field(field)).toHaveText(ctx.contact[field]);
  }
  await evidence.screenshot(page, 'Detalle del contacto');
});

When('edito el apellido del contacto a {string}',
  async ({ ctx, contactListPage, contactDetailsPage, contactFormPage }, lastName) => {
    await contactListPage.openContact(ctx.contact);
    await contactDetailsPage.edit();
    await contactFormPage.waitUntilLoaded();
    await contactFormPage.changeLastName(lastName);
    await contactFormPage.submit();
    ctx.contact = { ...ctx.contact, lastName };
  });

Then('el detalle muestra el apellido {string}', async ({ page, contactDetailsPage, evidence }, lastName) => {
  await expect(page).toHaveURL(/contactDetails/);
  await expect(contactDetailsPage.field('lastName')).toHaveText(lastName);
  await evidence.screenshot(page, 'Detalle actualizado');
});

Then('al regresar a la lista el contacto aparece actualizado',
  async ({ page, ctx, contactDetailsPage, contactListPage, evidence }) => {
    await contactDetailsPage.backToList();
    await expect(contactListPage.rowFor(ctx.contact)).toBeVisible();
    await evidence.screenshot(page, 'Lista con el contacto actualizado');
  });

When('elimino el contacto', async ({ ctx, contactListPage, contactDetailsPage }) => {
  await contactListPage.openContact(ctx.contact);
  await contactDetailsPage.delete();
});

Then('el contacto ya no aparece en la lista', async ({ page, ctx, contactListPage, evidence }) => {
  await expect(page).toHaveURL(/contactList/);
  await contactListPage.waitUntilLoaded();
  await expect(contactListPage.rowFor(ctx.contact)).toHaveCount(0);
  await evidence.screenshot(page, 'Lista sin el contacto eliminado');
});

When('empiezo a crear un contacto con nombre {string} y cancelo',
  async ({ contactListPage, contactFormPage }, firstName) => {
    await contactListPage.goToAddContact();
    await contactFormPage.fillForm({ firstName });
    await contactFormPage.cancel();
  });

Then('vuelvo a la lista de contactos', async ({ page, contactListPage }) => {
  await expect(page).toHaveURL(/contactList/);
  await expect(contactListPage.addContactButton).toBeVisible();
});

Then('no aparece ningún contacto con nombre {string}', async ({ page, contactListPage, evidence }, firstName) => {
  await contactListPage.waitUntilLoaded();
  await expect(contactListPage.rows.filter({ hasText: firstName })).toHaveCount(0);
  await evidence.screenshot(page, 'Lista sin el contacto cancelado');
});
