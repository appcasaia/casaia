// lib/lock.js
//
// Bloqueo distribuido simple sobre Redis (SET ... NX EX), para evitar que
// dos escrituras simultáneas a la misma lista (inmobiliarias, técnicos,
// comercios) se pisen entre sí.
//
// El problema que resuelve: hoy cada registro hace "leer toda la lista ->
// agregar uno nuevo -> guardar toda la lista de vuelta". Si dos personas
// se registran casi al mismo tiempo, las dos leen la MISMA lista inicial,
// cada una agrega la suya, y la que guarda último pisa por completo el
// cambio de la otra — el primer registro desaparece sin ningún error
// visible para nadie.
//
// withLock() serializa esas operaciones: solo un pedido a la vez puede
// estar en la sección "leer + modificar + guardar" para una misma lista.

async function callRedis(path) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  const res = await fetch(`${url}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.result;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Ejecuta fn() protegido por un lock con nombre `lockKey`.
 * - Si Redis no está configurado, ejecuta fn() directamente (fail-open,
 *   mismo criterio que el resto de la app).
 * - Si no se puede conseguir el lock dentro de maxWaitMs, igual ejecuta
 *   fn() sin bloquear (mejor una colisión rara que una app que no responde).
 * - Libera el lock solo si seguimos siendo los dueños (evita borrar el
 *   lock de otro proceso si el nuestro ya expiró).
 */
export async function withLock(lockKey, fn, opts = {}) {
  const { ttlSeconds = 10, maxWaitMs = 4000, retryDelayMs = 150 } = opts;

  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return fn();
  }

  const key = `lock:${lockKey}`;
  const ownerToken = Date.now().toString(36) + Math.random().toString(36).slice(2);
  const start = Date.now();
  let acquired = false;

  try {
    while (Date.now() - start < maxWaitMs) {
      const result = await callRedis(
        `set/${encodeURIComponent(key)}/${encodeURIComponent(ownerToken)}/NX/EX/${ttlSeconds}`
      );
      if (result === "OK") {
        acquired = true;
        break;
      }
      await sleep(retryDelayMs);
    }

    return await fn();
  } finally {
    if (acquired) {
      const current = await callRedis(`get/${encodeURIComponent(key)}`);
      if (current === ownerToken) {
        await callRedis(`del/${encodeURIComponent(key)}`);
      }
    }
  }
}
