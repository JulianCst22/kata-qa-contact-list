// Pasos que comparten las pruebas de UI y de API.
import { expect } from '@playwright/test';
import { Given, Then } from '../support/fixtures.js';
import { createUserByApi } from '../utils/helpers.js';

// Precondición: crea un usuario por API (es más rápido y estable que hacerlo por la UI).
Given('que existe un usuario registrado', async ({ api, ctx }) => {
  await createUserByApi(api, ctx);
});

// ---------- Verificaciones de respuestas de la API ----------

Then('la respuesta tiene código {int}', async ({ ctx }, expectedStatus) => {
  expect(ctx.response.status(), `Respuesta: ${JSON.stringify(ctx.body)}`).toBe(expectedStatus);
});

Then('el mensaje de la respuesta contiene {string}', async ({ ctx }, text) => {
  const message = typeof ctx.body === 'string'
    ? ctx.body
    : ctx.body?.message ?? JSON.stringify(ctx.body);
  expect(message).toContain(text);
});

Then('el campo {string} de la respuesta es {string}', async ({ ctx }, field, value) => {
  expect(ctx.body[field]).toBe(value);
});
