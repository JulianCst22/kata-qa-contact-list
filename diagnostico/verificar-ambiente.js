// Se ejecuta UNA vez antes de todas las pruebas (globalSetup).
// Revisa que la app y su API respondan. Si el servidor está caído, detiene la
// ejecución de una vez con un mensaje claro, en vez de dejar fallar los 37 casos.
// Para saltarse esta revisión: definir la variable SKIP_HEALTHCHECK=1.
import { BASE_URL } from '../utils/ApiClient.js';

const TIMEOUT_MS = 30_000;

async function check(path, init = {}) {
  const started = Date.now();
  try {
    const response = await fetch(`${BASE_URL}${path}`, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
    return { status: response.status, ms: Date.now() - started };
  } catch (error) {
    return { error: error.name === 'TimeoutError' ? `sin respuesta en ${TIMEOUT_MS / 1000} s` : error.message, ms: Date.now() - started };
  }
}

export default async function verificarAmbiente() {
  if (process.env.SKIP_HEALTHCHECK) return;

  console.log(`\n🩺 Verificando que la app responda: ${BASE_URL}`);
  const web = await check('/');
  // Sin token, la API debe responder 401: así se sabe que está viva y procesando peticiones
  const api = await check('/users/me');

  const webOk = web.status === 200;
  const apiOk = api.status === 401;
  const describe = (r) => (r.status ? `${r.status} (${(r.ms / 1000).toFixed(1)} s)` : `error: ${r.error}`);

  if (webOk && apiOk) {
    const slow = Math.max(web.ms, api.ms) > 5000;
    console.log(`✅ Ambiente disponible — página: ${describe(web)}, API: ${describe(api)}`);
    if (slow) console.log('🐢 El servidor está respondiendo lento: algunos casos pueden tardar o necesitar reintento.');
    console.log('');
    return;
  }

  console.error(
    '\n⚠️  FALLA DEL AMBIENTE: la app no está disponible, así que no se ejecutó ninguna prueba.\n'
    + `   Página web (GET /): ${describe(web)} — se esperaba 200\n`
    + `   API (GET /users/me sin token): ${describe(api)} — se esperaba 401\n\n`
    + '   Esto NO es un bug de la app ni de las pruebas: el servidor está caído o saturado.\n'
    + '   Espera unos minutos y vuelve a ejecutar.\n'
    + '   (Para ejecutar de todas formas: $env:SKIP_HEALTHCHECK=1; npm test)\n',
  );
  process.exit(1); // Se detiene aquí, sin abrir navegadores ni correr casos
}
