// Limita cuántos pedidos puede hacer una misma IP en una ventana de tiempo,
// usando la misma base Upstash Redis que ya tenemos para métricas/datos.
// No agrega infraestructura nueva ni costo extra.

async function callRedis(path) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null; // si no está configurado, no bloquea (fail-open)
  const res = await fetch(`${url}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.result;
}

export function getClientIp(req) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/**
 * Devuelve { allowed: true } o { allowed: false, retryAfterSeconds }.
 * Ventana fija simple: cuenta pedidos por IP+bucket en una clave que expira sola.
 * Si Redis no está disponible, deja pasar (fail-open) para no tumbar la app entera
 * por un problema de infraestructura ajeno al usuario.
 */
export async function checkRateLimit({ req, bucket, limit, windowSeconds }) {
  try {
    const ip = getClientIp(req);
    const key = `ratelimit:${bucket}:${ip}`;
    const count = await callRedis(`incr/${key}`);
    if (count === null) return { allowed: true };
    if (count === 1) {
      // solo la primera vez de la ventana: le ponemos vencimiento a la clave
      await callRedis(`expire/${key}/${windowSeconds}`);
    }
    if (count > limit) {
      const ttl = await callRedis(`ttl/${key}`);
      return { allowed: false, retryAfterSeconds: typeof ttl === "number" && ttl > 0 ? ttl : windowSeconds };
    }
    return { allowed: true };
  } catch (err) {
    console.error("Error en rate limit:", err);
    return { allowed: true }; // fail-open
  }
}
