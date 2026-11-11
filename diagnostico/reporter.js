// Reporter de diagnóstico: al final de la ejecución imprime un resumen que separa
// las fallas del ambiente (servidor caído o lento) de las que hay que revisar.
import { AMBIENTE, REVISAR } from './diagnostico.js';

export default class DiagnosticoReporter {
  constructor() {
    this.finalResults = new Map();
  }

  onTestEnd(test, result) {
    // Con reintentos, un caso tiene varios resultados: vale el último
    this.finalResults.set(test.id, { test, result });
  }

  onEnd() {
    const ambiente = [];
    const revisar = [];
    const flaky = [];

    for (const { test, result } of this.finalResults.values()) {
      const id = test.tags.find((t) => /^@(UI|API)-\d+$/.test(t))?.slice(1);
      const title = id ? `${id} ${test.title}` : test.title;
      const ok = result.status === test.expectedStatus;
      if (ok && result.retry > 0) flaky.push(title);
      if (ok) continue;
      const note = test.annotations.find((a) => a.type === AMBIENTE || a.type === REVISAR)
        ?? result.annotations?.find((a) => a.type === AMBIENTE || a.type === REVISAR);
      if (note?.type === AMBIENTE) ambiente.push({ title, why: note.description });
      else revisar.push({ title });
    }

    if (!ambiente.length && !revisar.length && !flaky.length) return;

    const line = '─'.repeat(70);
    console.log(`\n${line}\n🩺 DIAGNÓSTICO DE FALLAS\n${line}`);
    if (ambiente.length) {
      console.log(`\n⚠️  Falla del ambiente (${ambiente.length}) — NO son bugs, el servidor falló:`);
      for (const { title, why } of ambiente) console.log(`   • ${title}\n     ${why.split('. ')[0]}.`);
    }
    if (revisar.length) {
      console.log(`\n🔎 Revisar (${revisar.length}) — el servidor respondió normal, puede ser un bug:`);
      for (const { title } of revisar) console.log(`   • ${title}`);
    }
    if (flaky.length) {
      console.log(`\n🔁 Pasaron al reintentar (${flaky.length}) — inestabilidad momentánea:`);
      for (const title of flaky) console.log(`   • ${title}`);
    }
    console.log(`\nEl detalle está en el reporte HTML (npm run report), en el adjunto "🩺 Diagnóstico" de cada caso.\n${line}\n`);
  }
}
