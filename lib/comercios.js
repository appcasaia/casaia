import { COMERCIO_PLAN_LIMITS } from "./subscriptions.js";

const COMERCIOS_KEY = "casaia:comercios";

async function callRedis(path) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  const res = await fetch(`${url}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.result;
}

export async function getComercios() {
  try {
    const raw = await callRedis(`get/${COMERCIOS_KEY}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("No se pudo leer la lista de comercios:", err);
    return [];
  }
}

export async function saveComercios(list) {
  try {
    const encoded = encodeURIComponent(JSON.stringify(list));
    await callRedis(`set/${COMERCIOS_KEY}/${encoded}`);
    return true;
  } catch (err) {
    console.error("No se pudo guardar la lista de comercios:", err);
    return false;
  }
}

function normalize(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Devuelve los comercios activos cuya zona de cobertura coincide con el texto
// de zona pasado (típicamente las localidades de la inmobiliaria/propiedad).
// Si se pasa categoria, prioriza los que matchean esa categoría; si ninguno
// matchea, devuelve igual los de la zona (sin filtrar por categoría) como
// respaldo, para no dejar al huésped sin ninguna recomendación.
export function findComerciosForZone(zoneText, comercios, categoria = null) {
  if (!zoneText || !comercios || comercios.length === 0) return [];
  const target = normalize(zoneText);

  const enZona = comercios.filter((c) => {
    if (c.activo === false) return false;
    const zonas = c.zonas || [];
    return zonas.some((z) => target.includes(normalize(z)) || normalize(z).includes(target));
  });

  const priority = {
    gratis: COMERCIO_PLAN_LIMITS.gratis.priority,
    premium: COMERCIO_PLAN_LIMITS.premium.priority,
  };
  const byPriority = (a, b) => (priority[b.plan] || 1) - (priority[a.plan] || 1);

  if (categoria) {
    const porCategoria = enZona.filter((c) => c.categoria === categoria).sort(byPriority);
    if (porCategoria.length) return porCategoria.slice(0, 8);
  }

  return enZona.sort(byPriority).slice(0, 8);
}
