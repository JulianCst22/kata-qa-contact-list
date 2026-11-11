import { expect } from '@playwright/test';
import { newUser } from './data.js';

// Lee el cuerpo de una respuesta. Algunas respuestas son JSON y otras
// texto plano o vacías (por ejemplo el login fallido), así que se cubren ambos casos.
export async function readBody(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Crea un usuario nuevo por API y guarda sus datos y su token en el contexto
// del escenario. Se usa como precondición rápida en muchos casos.
export async function createUserByApi(api, ctx) {
  const user = newUser();
  const response = await api.createUser(user);
  expect(response.status(), 'No se pudo crear el usuario de prueba (precondición)').toBe(201);
  const body = await response.json();
  ctx.user = user;
  ctx.token = body.token;
  return body;
}
