import { TECHNICIAN_PLAN_LIMITS } from "./subscriptions.js";

const TECHNICIANS_KEY = "casaia:technicians";

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

export async function getTechnicians() {
  try {
    const raw = await callRedis(`get/${TECHNICIANS_KEY}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("No se pudo leer la lista de técnicos:", err);
    return [];
  }
}

export async function saveTechnicians(list) {
  try {
    const encoded = encodeURIComponent(JSON.stringify(list));
    await callRedis(`set/${TECHNICIANS_KEY}/${encoded}`);
    return true;
  } catch (err) {
    console.error("No se pudo guardar la lista de técnicos:", err);
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

// Devuelve los técnicos activos cuya zona de cobertura coincide con el texto
// de zona escrito por el cliente. Prioriza plan "profesional"/"premium" sobre "gratis".
export function findTechniciansForZone(zoneText, technicians) {
  if (!zoneText || !technicians || technicians.length === 0) return [];
  const target = normalize(zoneText);

  const matches = technicians.filter((tech) => {
    if (tech.activo === false) return false;
    const zonas = tech.zonas || [];
    return zonas.some((z) => target.includes(normalize(z)) || normalize(z).includes(target));
  });

  const priority = {
    gratis: TECHNICIAN_PLAN_LIMITS.gratis.priority,
    profesional: TECHNICIAN_PLAN_LIMITS.profesional.priority,
    premium: TECHNICIAN_PLAN_LIMITS.premium.priority,
  };
  matches.sort((a, b) => (priority[b.plan] || 1) - (priority[a.plan] || 1));

  return matches.slice(0, 3);
}
