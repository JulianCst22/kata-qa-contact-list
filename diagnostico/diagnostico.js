// Diagnóstico de fallas: ¿fue el ambiente (servidor) o puede ser un bug?
//
// Durante cada caso se anota qué respondió el servidor (peticiones de la API
// y de la página web). Si el caso falla, se revisa ese registro:
//   - Respuestas 5xx (500, 502, 503...)      → servidor caído o con error interno
//   - Peticiones sin respuesta (timeout, red)  → servidor lento o inalcanzable
//   - Login rechazado justo después de crear   → la base de datos se vació
//     el usuario con éxito                        en plena ejecución
// Si no aparece nada de eso, el servidor respondió normal: la falla puede ser
// un bug de la app o un error de la prueba, y hay que revisarla.

export const AMBIENTE = '⚠️ Falla del ambiente';
export const REVISAR = '🔎 Revisar: posible bug';

export class ServerLog {
  constructor() {
    this.entries = [];
  }

  record(label, status) {
    this.entries.push({ label, status });
  }

  recordError(label, error) {
    const message = String(error?.message || error).split('\n')[0];
    this.entries.push({ label, error: message });
  }

  diagnose(testError) {
    const reasons = [];

    const serverErrors = this.entries.filter((e) => e.status >= 500);
    if (serverErrors.length) {
      const sample = serverErrors.slice(0, 3).map((e) => `${e.label} → ${e.status}`).join(', ');
      reasons.push(`El servidor respondió con error ${serverErrors[0].status} en ${serverErrors.length} petición(es): ${sample}.`);
    }

    const networkErrors = this.entries.filter((e) => e.error);
    if (networkErrors.length) {
      reasons.push(`El servidor no respondió a tiempo en ${networkErrors.length} petición(es): ${networkErrors[0].label} (${networkErrors[0].error}).`);
    }

    const message = String(testError?.message || '');
    if (!networkErrors.length && /apiRequestContext.*Timeout|ETIMEDOUT|ECONNRESET|ECONNREFUSED|ENOTFOUND|socket hang up/i.test(message)) {
      reasons.push('Una petición a la API se quedó sin respuesta (timeout o error de red).');
    }

    const userCreatedAt = this.entries.findIndex((e) => e.label === 'POST /users' && e.status === 201);
    const loginRejected = userCreatedAt >= 0
      && this.entries.slice(userCreatedAt + 1).some((e) => e.label === 'POST /users/login' && e.status === 401);
    if (loginRejected && !serverErrors.length) {
      reasons.push('El usuario se creó bien (201) pero luego el login lo rechazó (401): probablemente la base de datos se vació en plena ejecución.');
    }

    if (reasons.length) {
      return {
        type: AMBIENTE,
        description: `${reasons.join(' ')} No es un bug de la app: espera a que el servidor se estabilice y vuelve a ejecutar.`,
      };
    }
    return {
      type: REVISAR,
      description: 'El servidor respondió normal durante el caso, así que la falla no es del ambiente. Puede ser un bug de la app o un error en la prueba: revisa el error, la captura y el video.',
    };
  }
}
