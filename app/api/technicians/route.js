import { Resend } from "resend";
import { getTechnicians, saveTechnicians } from "../../../lib/technicians";
import { checkRateLimit, getClientIp } from "../../../lib/rateLimit";
import { verifyTurnstile } from "../../../lib/turnstile";
import { createSubscription, updateSubscriptionPlan, TECHNICIAN_PLAN_LIMITS, defaultPlanesHabilitados, puedeDesactivarsePlan } from "../../../lib/subscriptions";

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

    const zonasDeclaradas = Array.isArray(zonas)
      ? zonas
      : String(zonas).split(",").map((z) => z.trim()).filter(Boolean);

    const newTech = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      nombre,
      empresa: empresa || "",
      telefono,
      email: email || "",
      localidad: localidad || "",
      // Todo alta nueva arranca en plan gratis, así que limitamos acá mismo
      // a la cantidad de zonas que permite ese plan.
      zonas: zonasDeclaradas.slice(0, TECHNICIAN_PLAN_LIMITS.gratis.maxZonas),
      especialidades: especialidades || "",
      horarios: horarios || "",
      plan: "gratis",
      activo: true,
      createdAt: new Date().toISOString(),
      subscription: createSubscription("gratis"),
      planesHabilitados: defaultPlanesHabilitados(),
    };

    technicians.push(newTech);
    await saveTechnicians(technicians);

    // Avisar al administrador por email de la nueva alta.
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const adminEmail = process.env.LEAD_EMAIL_TO || "casaia24h@gmail.com";
      await resend.emails.send({
        from: process.env.LEAD_EMAIL_FROM || "notificaciones@casaia.net",
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

// Actualizar (ej: cambiar plan, activar/desactivar, o habilitar/deshabilitar
// un plan puntual para ESTE técnico) desde el panel admin.
export async function PATCH(req) {
  try {
    const { key, id, updates } = await req.json();
    if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }
    const technicians = await getTechnicians();
    const idx = technicians.findIndex((t) => t.id === id);
    if (idx === -1) return Response.json({ error: "No encontrado" }, { status: 404 });

    const current = technicians[idx];
    const merged = { ...current, ...updates };

    // Habilitar/deshabilitar un plan puntual para este técnico (no afecta a nadie más).
    if (updates.planesHabilitados) {
      const nuevosHabilitados = { ...(current.planesHabilitados || defaultPlanesHabilitados()), ...updates.planesHabilitados };
      // El plan gratis nunca se le puede quitar a un técnico.
      if (!puedeDesactivarsePlan("tecnico", "gratis")) nuevosHabilitados.gratis = true;
      merged.planesHabilitados = nuevosHabilitados;

      // Si el plan que tenía asignado justo quedó deshabilitado, lo volvemos
      // a gratis automáticamente (siempre disponible para técnicos).
      if (nuevosHabilitados[current.plan] === false) {
        merged.plan = "gratis";
        merged.subscription = updateSubscriptionPlan(current.subscription, "gratis");
      }
    }

    // Cambiar el plan actual del técnico: solo si ese plan está habilitado para él.
    if (updates.plan && updates.plan !== current.plan) {
      const habilitados = merged.planesHabilitados || current.planesHabilitados || defaultPlanesHabilitados();
      if (habilitados[updates.plan] === false) {
        return Response.json(
          { error: `El plan "${updates.plan}" no está habilitado para este técnico. Habilitalo primero.` },
          { status: 400 }
        );
      }
      merged.subscription = updateSubscriptionPlan(current.subscription, updates.plan);
    }

    technicians[idx] = merged;
    await saveTechnicians(technicians);
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}

// Eliminar un técnico desde el panel admin.
export async function DELETE(req) {
  try {
    const { key, id } = await req.json();
    if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }
    const technicians = await getTechnicians();
    const filtered = technicians.filter((t) => t.id !== id);
    if (filtered.length === technicians.length) {
      return Response.json({ error: "No encontrado" }, { status: 404 });
    }
    await saveTechnicians(filtered);
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
