// Fixtures: los "ingredientes" que reciben los steps.
// Playwright crea cada uno solo si el step lo pide, y uno nuevo por escenario.
import { test as base, createBdd } from 'playwright-bdd';
import { LoginPage } from '../pages/LoginPage.js';
import { SignupPage } from '../pages/SignupPage.js';
import { ContactListPage } from '../pages/ContactListPage.js';
import { ContactFormPage } from '../pages/ContactFormPage.js';
import { ContactDetailsPage } from '../pages/ContactDetailsPage.js';
import { ApiClient, BASE_URL } from '../utils/ApiClient.js';
import { ServerLog } from '../diagnostico/diagnostico.js';

export const test = base.extend({
  // Registro de lo que responde el servidor en cada caso (se activa solo en todos los casos).
  // Si el caso falla, decide si fue el ambiente o un posible bug y lo anota en el reporte.
  serverLog: [async ({}, use, testInfo) => {
    const log = new ServerLog();
    await use(log);
    if (testInfo.status !== testInfo.expectedStatus) {
      const diagnosis = log.diagnose(testInfo.error);
      testInfo.annotations.push(diagnosis);
      const history = log.entries
        .map((e) => `${e.label} → ${e.status ?? `SIN RESPUESTA (${e.error})`}`)
        .join('\n');
      await testInfo.attach('🩺 Diagnóstico', {
        body: `${diagnosis.type}\n\n${diagnosis.description}\n\nRespuestas del servidor durante el caso:\n${history || '(ninguna petición registrada)'}`,
        contentType: 'text/plain',
      });
    }
  }, { auto: true }],

  // La página del navegador, con un "oído" que anota cada respuesta del servidor de la app
  page: async ({ page, serverLog }, use) => {
    const host = new URL(BASE_URL).host;
    page.on('response', (response) => {
      const url = new URL(response.url());
      if (url.host === host) {
        serverLog.record(`${response.request().method()} ${url.pathname}`, response.status());
      }
    });
    page.on('requestfailed', (request) => {
      const url = new URL(request.url());
      if (url.host === host) {
        serverLog.recordError(`${request.method()} ${url.pathname}`, request.failure()?.errorText);
      }
    });
    await use(page);
  },

  // Memoria del escenario: aquí se guardan usuario, token, contacto, última respuesta...
  ctx: async ({}, use) => {
    await use({});
  },

  // Page Objects (UI)
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  signupPage: async ({ page }, use) => use(new SignupPage(page)),
  contactListPage: async ({ page }, use) => use(new ContactListPage(page)),
  contactFormPage: async ({ page }, use) => use(new ContactFormPage(page)),
  contactDetailsPage: async ({ page }, use) => use(new ContactDetailsPage(page)),

  // Cliente de la API (anota cada respuesta en el registro del servidor)
  api: async ({ request, serverLog }, use) => use(new ApiClient(request, serverLog)),

  // Evidencia: adjunta capturas y respuestas de la API al reporte HTML
  evidence: async ({}, use, testInfo) => {
    await use({
      async screenshot(page, name) {
        await testInfo.attach(`📸 ${name}`, {
          body: await page.screenshot({ fullPage: true }),
          contentType: 'image/png',
        });
      },
      async response(name, response, body) {
        const detail = {
          url: response.url(),
          status: response.status(),
          body,
        };
        await testInfo.attach(`🌐 ${name}`, {
          body: JSON.stringify(detail, null, 2),
          contentType: 'application/json',
        });
      },
    });
  },
});

export const { Given, When, Then } = createBdd(test);
