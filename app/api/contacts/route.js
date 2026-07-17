import { getTechnicians } from "../../../lib/technicians";
import { getAgencies } from "../../../lib/agencies";
import { daysSince } from "../../../lib/subscriptions";

// Listado unificado de técnicos + inmobiliarias para el panel de contactos.
// Solo lectura — el alta/edición sigue pasando por /api/technicians y /api/agencies.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const [technicians, agencies] = await Promise.all([getTechnicians(), getAgencies()]);

  const tecnicosContactos = technicians.map((t) => ({
    tipo: "tecnico",
    id: t.id,
    nombre: t.nombre,
    contacto: t.telefono || "",
    email: t.email || "",
    zona: (t.zonas || []).join(", "),
    createdAt: t.createdAt || null,
    diasDeAlta: daysSince(t.createdAt),
    plan: t.plan || "gratis",
    precio: t.subscription?.price ?? 0,
    estadoSuscripcion: t.subscription?.status || "activo",
    avisado: t.subscription?.notifiedPriceChange ?? false,
    activo: t.activo !== false,
  }));

  const inmobiliariasContactos = agencies.map((a) => ({
    tipo: "inmobiliaria",
    id: a.id,
    nombre: a.nombre,
    contacto: a.telefono || a.contacto || "",
    email: a.email || "",
    zona: a.localidades || "",
    createdAt: a.createdAt || null,
    diasDeAlta: daysSince(a.createdAt),
    plan: a.plan || "gratis",
    precio: a.subscription?.price ?? 0,
    estadoSuscripcion: a.subscription?.status || "activo",
    avisado: a.subscription?.notifiedPriceChange ?? false,
    activo: a.activo !== false,
  }));

  const contacts = [...tecnicosContactos, ...inmobiliariasContactos].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  return Response.json({
    contacts,
    totals: { tecnicos: tecnicosContactos.length, inmobiliarias: inmobiliariasContactos.length },
  });
}
