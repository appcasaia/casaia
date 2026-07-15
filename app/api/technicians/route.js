import { Resend } from "resend";
import { getTechnicians, saveTechnicians } from "../../../lib/technicians";
import { checkRateLimit, getClientIp } from "../../../lib/rateLimit";
import { verifyTurnstile } from "../../../lib/turnstile";

// Registro público: cualquier técnico/empresa puede darse de alta.
export async function POST(req) {
  try {
    const rl = await checkRateLimit({ req, bucket: "tech-registro", limit: 5, windowSeconds: 3600 });
    if (!rl.allowed) {
      return Response.json(
        { error: "Demasiados intentos. Esperá un momento y probá de nuevo." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
      );
    }

    const body = await req.json();
    const { nombre, empresa, telefono, email, localidad, zonas, especialidades, horarios, turnstileToken } = body;

    const humanOk = await verifyTurnstile(turnstileToken, getClientIp(req));
    if (!humanOk) {
      return Response.json({ error: "No se pudo verificar que sos una persona real. Probá de nuevo." }, { status: 400 });
    }

    if (!nombre || !telefono || !zonas) {
      return Response.json({ error: "Faltan datos obligatorios." }, { status: 400 });
    }

    const technicians = await getTechnicians();

    const newTech = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      nombre,
      empresa: empresa || "",
      telefono,
      email: email || "",
      localidad: localidad || "",
      zonas: Array.isArray(zonas) ? zonas : String(zonas).split(",").map((z) => z.trim()).filter(Boolean),
      especialidades: especialidades || "",
      horarios: horarios || "",
      plan: "gratis",
      activo: true,
      createdAt: new Date().toISOString(),
    };

    technicians.push(newTech);
    await saveTechnicians(technicians);

    // Avisar al administrador por email de la nueva alta.
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const adminEmail = process.env.LEAD_EMAIL_TO || "nlmaterialdigital@gmail.com";
      await resend.emails.send({
        from: process.env.LEAD_EMAIL_FROM || "onboarding@resend.dev",
        to: adminEmail,
        subject: `Nuevo técnico registrado en CasaIA: ${nombre}`,
        text: `Nombre: ${nombre}\nEmpresa: ${empresa || "-"}\nTeléfono: ${telefono}\nEmail: ${email || "-"}\nLocalidad: ${localidad || "-"}\nZonas: ${newTech.zonas.join(", ")}\nEspecialidades: ${especialidades || "-"}\nHorarios: ${horarios || "-"}\nPlan: gratis (por defecto)`,
      });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "No se pudo completar el registro." }, { status: 500 });
  }
}

// Listado para el panel de administración.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const technicians = await getTechnicians();
  return Response.json({ technicians });
}

// Actualizar (ej: cambiar plan o activar/desactivar) desde el panel admin.
export async function PATCH(req) {
  try {
    const { key, id, updates } = await req.json();
    if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }
    const technicians = await getTechnicians();
    const idx = technicians.findIndex((t) => t.id === id);
    if (idx === -1) return Response.json({ error: "No encontrado" }, { status: 404 });
    technicians[idx] = { ...technicians[idx], ...updates };
    await saveTechnicians(technicians);
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
