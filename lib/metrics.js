// Guarda contadores simples en Upstash Redis vía su API REST.
// No lanza error si falla: las métricas nunca deben romper la respuesta al usuario.

async function callRedis(command) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;

  const res = await fetch(`${url}/${command}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.result;
}

export async function incrMetric(key) {
  try {
    await callRedis(`incr/${key}`);
  } catch (err) {
    console.error("No se pudo incrementar la métrica:", key, err);
  }
}

export async function getMetric(key) {
  try {
    const result = await callRedis(`get/${key}`);
    return Number(result || 0);
  } catch (err) {
    console.error("No se pudo leer la métrica:", key, err);
    return 0;
  }
}
