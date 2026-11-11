import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { BASE_URL } from './utils/ApiClient.js';

// playwright-bdd convierte los archivos .feature (Gherkin) en pruebas de Playwright.
const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['steps/**/*.js', 'support/fixtures.js'],
  language: 'es', // Los .feature están escritos en español (Dado / Cuando / Entonces)
});

export default defineConfig({
  testDir,

  // Antes de empezar, revisa que la app responda. Si está caída, no corre nada y lo avisa.
  globalSetup: './diagnostico/verificar-ambiente.js',

  timeout: 60_000, // La app está en un servidor gratuito y a veces responde lento
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 2,
  retries: 1, // Si un caso falla por la inestabilidad del servidor, se reintenta una vez. El reporte lo marca como "flaky"

  // Resultados: en la terminal (list), en un reporte web (html) y un diagnóstico de fallas
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['./diagnostico/reporter.js'], // Resumen final: fallas del ambiente vs. posibles bugs
  ],

  use: {
    baseURL: BASE_URL,
    actionTimeout: 30_000, // El servidor gratuito a veces tarda varios segundos en responder

    // EVIDENCIA DE TODOS LOS CASOS (pasen o fallen):
    screenshot: 'on', // captura de pantalla al final de cada caso
    video: 'on',      // video completo de cada caso de UI
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
