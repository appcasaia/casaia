const AGENCIES_KEY = "casaia:agencies";

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

export async function getAgencies() {
  try {
    const raw = await callRedis(`get/${AGENCIES_KEY}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("No se pudo leer la lista de inmobiliarias:", err);
    return [];
  }
}

export async function saveAgencies(list) {
  try {
    const encoded = encodeURIComponent(JSON.stringify(list));
    await callRedis(`set/${AGENCIES_KEY}/${encoded}`);
    return true;
  } catch (err) {
    console.error("No se pudo guardar la lista de inmobiliarias:", err);
    return false;
  }
}

export function slugify(name) {
  const base = (name || "inmobiliaria")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "inmobiliaria"}-${suffix}`;
}

export function generateEditToken() {
  return (
    Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10)
  );
}

// Le asigna un slug único a cada propiedad que todavía no tenga uno
// (las que ya tenían, lo conservan — así no se rompen links ya impresos/compartidos).
export function ensurePropertySlugs(propiedades) {
  return (propiedades || []).map((p) => {
    if (p.slug) return p;
    const base = (p.nombre || "unidad")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const suffix = Math.random().toString(36).slice(2, 6);
    return { ...p, slug: `${base || "unidad"}-${suffix}` };
  });
}

export async function findAgencyBySlug(slug) {
  const agencies = await getAgencies();
  return agencies.find((a) => a.slug === slug) || null;
}
