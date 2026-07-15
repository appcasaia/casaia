const REFERRALS_KEY = "casaia:referrals";

async function callRedis(path, options = {}) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;

  const res = await fetch(`${url}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    ...options,
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.result;
}

export async function getReferrals() {
  try {
    const raw = await callRedis(`get/${REFERRALS_KEY}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("No se pudo leer la lista de referidos:", err);
    return [];
  }
}

export async function saveReferrals(list) {
  try {
    const encoded = encodeURIComponent(JSON.stringify(list));
    await callRedis(`set/${REFERRALS_KEY}/${encoded}`);
    return true;
  } catch (err) {
    console.error("No se pudo guardar la lista de referidos:", err);
    return false;
  }
}

// Busca el primer comercio cuya "zona" configurada aparezca contenida en el
// texto de zona que escribió el cliente (comparación simple, insensible a
// mayúsculas/acentos básicos).
export function findReferralForZone(zoneText, referrals) {
  if (!zoneText || !referrals || referrals.length === 0) return null;
  const normalize = (s) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const target = normalize(zoneText);
  return (
    referrals.find((r) => r.zona && target.includes(normalize(r.zona))) || null
  );
}
