# Kata Junior QA – Automatización UI + API (Contact List App)

Pruebas de regresión automatizadas para la aplicación
[Contact List App](https://thinking-tester-contact-list.herokuapp.com/) y su
[API](https://documenter.getpostman.com/view/4012288/TzK2bEa8).

| Qué | Con qué |
| --- | --- |
| Framework | Playwright (UI y API) |
| Lenguaje | JavaScript |
| Escenarios | Gherkin en español (playwright-bdd) |
| Patrón de diseño (UI) | Page Object Model |
| Evidencia | Reporte HTML con capturas y video de **todos** los casos |

**37 casos automatizados:** 17 de UI y 20 de API. Son los mismos casos del plan de
pruebas (Excel), y cada escenario tiene la etiqueta con su ID (`@UI-01`, `@API-05`...).

## Documentación (carpeta `docs/`)

| Archivo | Contenido |
| --- | --- |
| `Plan de pruebas y resultados Kata QA - Contact List.xlsx` | Resumen, resultados de los 37 casos, evidencias (capturas de UI y terminal de Postman), bug encontrado y fallas del ambiente |

**Resultado:** 36 de 37 casos pasan en Playwright y 20 de 20 en Postman. El caso que falla (UI-07)
encontró un bug real: **BUG-01**, tras cerrar sesión la lista de contactos se abre escribiendo la URL.

---

## 1. Requisitos

- [Node.js](https://nodejs.org/) 18 o superior (recomendado: la versión LTS)
- Conexión a internet (la app está publicada en Heroku)

## 2. Instalación (solo la primera vez)

```bash
npm install
npx playwright install chromium
```

## 3. Cómo correr las pruebas

| Comando | Qué hace |
| --- | --- |
| `npm run verificar` | Solo revisa si la app está disponible (no corre pruebas) |
| `npm test` | Corre los 37 casos |
| `npm run test:api` | Solo los casos de API |
| `npm run test:ui` | Solo los casos de UI |
| `npm run test:smoke` | Solo los casos críticos (etiqueta `@smoke`) |
| `npm run test:headed` | Casos de UI **viendo el navegador** |
| `npm run test:visual` | Abre la ventana de Playwright para elegir y ver cada caso paso a paso |
| `npm run report` | Abre el reporte HTML de la última ejecución |

Para correr un solo caso por su ID:

```bash
npx bddgen && npx playwright test --grep @UI-07
```

> `bddgen` traduce los archivos `.feature` a pruebas de Playwright. Los scripts de
> `npm` ya lo ejecutan solos.

## 4. Dónde quedan los resultados

| Dónde | Qué hay |
| --- | --- |
| La terminal | Resumen: cuántos casos pasaron y cuántos fallaron |
| `playwright-report/` | **Reporte HTML.** Se abre con `npm run report`. Cada caso en verde o rojo, con sus pasos de Gherkin, capturas, video, diagnóstico y el error si falló |
| `test-results/` | Los archivos sueltos de cada caso: capturas (`.png`) y videos (`.webm`) |

**Evidencia que se guarda en cada caso** (configurada en `playwright.config.js`):

- **Captura** al final de cada caso, pase o falle.
- **Video** completo de cada caso de UI.
- **Capturas intermedias:** los pasos de verificación de UI adjuntan su propia captura (📸).
- **Respuestas de la API:** cada petición adjunta método, URL, código y cuerpo de la
  respuesta (🌐). Las pruebas de API no tienen pantalla, así que esta es su evidencia.

## 5. Estructura del proyecto

```
kata-qa-contact-list/
├── features/                 Escenarios en Gherkin (QUÉ se prueba)
│   ├── ui/
│   │   ├── registro.feature    UI-01 a UI-03
│   │   ├── login.feature       UI-04 a UI-07
│   │   └── contactos.feature   UI-08 a UI-17
│   └── api/
│       ├── usuarios.feature    API-01, 02, 03, 06, 07, 08, 20
│       ├── login.feature       API-04, 05, 09
│       └── contactos.feature   API-10 a API-19
├── steps/                    Código de cada paso (CÓMO se prueba)
│   ├── common.steps.js         Pasos compartidos (usuario de prueba, códigos de respuesta)
│   ├── ui.steps.js             Pasos de interfaz
│   └── api.steps.js            Pasos de API
├── pages/                    Page Object Model: una clase por pantalla
│   ├── LoginPage.js
│   ├── SignupPage.js
│   ├── ContactListPage.js
│   ├── ContactFormPage.js      Formulario de crear y editar contacto
│   └── ContactDetailsPage.js
├── support/
│   └── fixtures.js           Arma los Page Objects, el cliente de API y la evidencia para cada escenario
├── diagnostico/              ¿Falla del ambiente o posible bug?
│   ├── verificar-ambiente.js   Revisa que la app responda antes de empezar
│   ├── diagnostico.js          Clasifica cada caso que falla
│   └── reporter.js             Resumen final en la terminal
├── utils/
│   ├── ApiClient.js          Todas las peticiones a la API en un solo lugar
│   ├── data.js               Generador de datos de prueba (emails únicos)
│   └── helpers.js            Funciones de apoyo (leer respuestas, crear usuario por API)
├── playwright.config.js      Configuración: URL, navegador, tiempos, reportes y evidencia
└── package.json              Dependencias y comandos
```

### Cómo funciona un caso, de principio a fin

1. **`features/`**: el escenario dice en español qué se prueba, por ejemplo
   `Cuando inicio sesión con la contraseña "clave-mala"`.
2. **`steps/`**: esa frase está conectada a una función de JavaScript.
3. **`pages/`** (UI) o **`utils/ApiClient.js`** (API): la función usa el Page Object o el
   cliente de API para actuar. Los selectores y las rutas viven solo ahí, así que si la
   app cambia se arregla en un solo archivo.
4. **Verificación**: el paso `Entonces` compara el resultado con lo esperado y guarda la
   evidencia en el reporte.

## 6. Decisiones de diseño

- **Datos independientes:** cada escenario crea su propio usuario con un email único,
  porque la base de datos de la app se reinicia periódicamente. Así ningún caso depende
  de otro ni de datos previos.
- **Precondiciones por API:** cuando un caso de UI necesita un usuario o un contacto
  existente, se crea por API. Es más rápido y estable, y la UI se prueba solo en lo que
  el caso evalúa.
- **Pirámide de pruebas:** más casos de API (rápidos y estables) que de UI.
- **Esperas explícitas:** se usan las esperas automáticas de Playwright (`expect`), nunca
  pausas fijas. La edición de contactos espera a que el formulario cargue antes de escribir.
- **Tiempos amplios:** la app está en un servidor gratuito que a veces tarda en
  responder, por eso el tiempo máximo por caso es de 60 segundos.
- **Un reintento por caso:** el servidor de pruebas a veces se reinicia o borra su base de
  datos en plena ejecución. Si un caso falla por eso y pasa al reintentar, el reporte lo
  marca como *flaky* (inestable). Un bug real, como el BUG-01, falla en los dos intentos.

## 7. Si un caso falla

1. Abre el reporte (`npm run report`) y revisa el error, la captura, el video y el adjunto *🩺 Diagnóstico*.
2. Decide si es un **bug de la app** o un **problema de la prueba** (un selector que
   cambió, un texto distinto, la app caída).
3. Si es un bug, regístralo en la hoja **Bugs** del plan de pruebas con la evidencia del
   reporte, y escribe su ID en la columna *Bug ID* del caso.
4. Anota siempre la **fecha y hora** de la ejecución: en la columna *Fecha y hora de
   ejecución* de cada caso, en *Fecha y hora* del bug o en la hoja *Incidencias ambiente*
   si fue un problema del servidor. El reporte de Playwright muestra la hora exacta arriba
   a la derecha.

## 8. Pruebas de API con Postman

Los mismos 20 casos de API también están como colección de Postman en
`postman/kata-qa-contact-list.postman_collection.json`. Cada petición tiene sus
validaciones (pestaña *Tests*) y guarda en variables lo que necesita la siguiente
(email, token e id del contacto), así que se ejecutan en orden.

**En la app de Postman:**
1. *Import* → selecciona el archivo de la colección.
2. Clic derecho en la colección → *Run collection* → *Run*.
3. Cada caso muestra sus validaciones en verde o rojo.

**Desde la terminal (Newman):**
```bash
npm run test:postman
```
Genera el reporte `postman/reporte-postman.html` (se abre con doble clic), con cada
petición, su respuesta y el resultado de cada validación.

**¿Por qué Postman además de Playwright?** Playwright con Gherkin es la automatización
principal (UI + API en un solo proyecto). Postman sirve para explorar la API a mano y
para mostrar los mismos casos con la herramienta estándar de pruebas de API, ejecutable
desde la app o desde la terminal.

## 9. Problemas del ambiente y cómo identificarlos

La app es un servicio gratuito en Heroku y a veces se cae, responde lento o borra su base
de datos. Cuando eso pasa, las pruebas fallan **sin que sea un defecto de la app**. Las
incidencias ocurridas están documentadas en la hoja *Incidencias ambiente* del plan de
pruebas.

**Diagnóstico automático.** El proyecto detecta solo si una falla fue del ambiente:

1. **Antes de empezar** (`diagnostico/verificar-ambiente.js`): revisa que la página y la
   API respondan. Si la app está caída, **no corre ninguna prueba** y muestra un mensaje
   claro. Para revisar solo el ambiente, sin correr pruebas: `npm run verificar`.
2. **En cada caso que falla** (`diagnostico/diagnostico.js`): durante el caso se anotan
   todas las respuestas del servidor (de la API y de la página). Si falla, se clasifica:
   - **⚠️ Falla del ambiente**: hubo respuestas 5xx, peticiones sin respuesta, o un usuario
     recién creado que el login ya no reconoce (base de datos vaciada).
   - **🔎 Revisar: posible bug**: el servidor respondió normal, así que hay que revisar.

   La clasificación aparece en el reporte HTML (arriba de cada caso y en el adjunto
   *🩺 Diagnóstico*, con la lista de respuestas del servidor).
3. **Al final** (`diagnostico/reporter.js`): la terminal muestra un resumen *🩺 DIAGNÓSTICO
   DE FALLAS* que separa las fallas del ambiente, las que hay que revisar y las que pasaron
   al reintentar.

**En Postman/Newman** pasa lo mismo: un script de la colección revisa cada respuesta. Si el
servidor responde 5xx o no responde, marca *⚠️ AMBIENTE: ... (no es un bug de la app)*,
salta las validaciones de datos y, si es un 503, detiene la ejecución.

Para ejecutar aunque la revisión inicial falle: `$env:SKIP_HEALTHCHECK=1; npm test`.

**Cómo distinguir un problema del ambiente de un bug:**

| Señal en el resultado | Qué significa | ¿Se registra como bug? |
| --- | --- | --- |
| `503 Service Unavailable` en muchas peticiones | Servidor caído | No: se espera y se re-ejecuta |
| `JSONError: Unexpected token '<'` | El servidor devolvió una página de error HTML en vez de datos | No |
| `Timeout` / `ESOCKETTIMEDOUT` en casos sueltos | Servidor lento | No, si pasa al reintentar |
| Usuario recién creado que "no existe" al iniciar sesión | La base de datos se vació en plena ejecución | No |
| Caso marcado como *flaky* en el reporte | Falló una vez y pasó al reintentar | No, pero se revisa |
| Falla siempre igual, con la app respondiendo normal | Comportamiento distinto al esperado | **Sí** (ej. BUG-01) |

**Medidas que ya tiene el proyecto:** datos nuevos en cada caso, un reintento por caso
(`retries: 1`), 30 s de espera por acción en Playwright y 60 s por petición en Newman.

**Consejo:** cuando una ejecución salga bien, guarda una copia de `playwright-report/` y de
`postman/reporte-postman.html` en otra carpeta, por si la app está caída el día que
necesites mostrarlos.
