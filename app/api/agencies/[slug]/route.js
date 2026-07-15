import { findAgencyBySlug, saveAgencies, getAgencies, ensurePropertySlugs } from "../../../../lib/agencies";

// Sin token: solo expone lo necesario para renderizar la landing del huésped
// (nombre, técnicos, y la info práctica de las propiedades para que la IA
// pueda responder consultas como el WiFi).
// Con ?token=: devuelve el registro completo, solo si coincide con el
// editToken de esa inmobiliaria — así puede volver a editar sus datos.
export async function GET(req, { params }) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  const agency = await findAgencyBySlug(params.slug);
  if (!agency || agency.activo === false) {
    return Response.json({ error: "No encontrado" }, { status: 404 });
  }

  if (token) {
    if (token !== agency.editToken) {
      return Response.json({ error: "Token inválido" }, { status: 401 });
    }
    return Response.json({ agency });
  }

  return Response.json({
    nombre: agency.nombre,
    slug: agency.slug,
    tecnicos: (agency.tecnicos || []).map((t) => ({
      nombre: t.nombre,
      telefono: t.telefono,
      especialidad: t.especialidad || "",
    })),
    propiedades: agency.propiedades || [],
  });
}

// Edición self-service: la inmobiliaria actualiza sus propios datos con su
// token privado, sin necesidad de la clave de administrador.
export async function PUT(req, { params }) {
  try {
    const { token, updates } = await req.json();
    const agencies = await getAgencies();
    const idx = agencies.findIndex((a) => a.slug === params.slug);
    if (idx === -1) return Response.json({ error: "No encontrado" }, { status: 404 });
    if (!token || token !== agencies[idx].editToken) {
      return Response.json({ error: "Token inválido" }, { status: 401 });
    }

    const allowedFields = ["contacto", "telefono", "localidades", "tecnicos", "propiedades"];
    const safeUpdates = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) safeUpdates[field] = updates[field];
    }
    if (safeUpdates.propiedades) {
      safeUpdates.propiedades = ensurePropertySlugs(safeUpdates.propiedades);
    }

    agencies[idx] = { ...agencies[idx], ...safeUpdates };
    await saveAgencies(agencies);
    return Response.json({ ok: true, agency: agencies[idx] });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
