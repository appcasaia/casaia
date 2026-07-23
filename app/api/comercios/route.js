import { Resend } from "resend";
import { getComercios, saveComercios } from "../../../lib/comercios";
import { checkRateLimit, getClientIp } from "../../../lib/rateLimit";
import { verifyTurnstile } from "../../../lib/turnstile";
import {
  createSubscription,
  updateSubscriptionPlan,
  defaultPlanesHabilitadosComercio,
  puedeDesactivarsePlan,
} from "../../../lib/subscriptions";

// Registro público: cualquier comercio puede darse de alta.
export async function POST(req) {
  try {
    const rl = await checkRateLimit({ req, bucket: "comercio-registro", limit: 5, windowSeconds: 3600 });
    if (!rl.allowed) {
      return Response.json(
        { error: "Demasiados intentos. Esperá un momento y probá de nuevo." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
      );
    }

    const body = await req.json();
    const { nombre, categoria, telefono, email, direccion, zonas, horarios, descripcion, turnstileToken } = body;

    const humanOk = await verifyTurnstile(turnstileToken, getClientIp(req));
    if (!humanOk) {
      return Response.json({ error: "No se pudo verificar que sos una persona real. Probá de nuevo." }, { status: 400 });
    }

    if (!nombre || !telefono || !zonas || !categoria) {
      return Response.json({ error: "Faltan datos obligatorios." }, { status: 400 });
    }

    const comercios = await getComercios();

    const zonasDeclaradas = Array.isArray(zonas)
      ? zonas
      : String(zonas).split(",").map((z) => z.trim()).filter(Boolean);

    const newComercio = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      nombre,
      categoria,
      telefono,
      email: email || "",
      direccion: direccion || "",
      zonas: zonasDeclaradas,
      horarios: horarios || "",
      descripcion: descripcion || "",
      plan: "gratis",
      activo: true,
      createdAt: new Date().toISOString(),
      subscription: createSubscription("gratis"),
      planesHabilitados: defaultPlanesHabilitadosComercio(),
    };

    comercios.push(newComercio);
    await saveComercios(comercios);

    // Avisar al administrador por email de la nueva alta.
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const adminEmail = process.env.LEAD_EMAIL_TO || "casaia24h@gmail.com";
      await resend.emails.send({
        from: process.env.LEAD_EMAIL_FROM || "notificaciones@casaia.net",
        to: adminEmail,
        subject: `Nuevo comercio registrado en CasaIA: ${nombre}`,
        text: `Nombre: ${nombre}\nCategoría: ${categoria}\nTeléfono: ${telefono}\nEmail: ${email || "-"}\nDirección: ${direccion || "-"}\nZonas: ${newComercio.zonas.join(", ")}\nHorarios: ${horarios || "-"}\nPlan: gratis (por defecto)`,
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
  const comercios = await getComercios();
  return Response.json({ comercios });
}

// Actualizar (ej: cambiar plan, activar/desactivar, o habilitar/deshabilitar
// un plan puntual para ESTE comercio) desde el panel admin.
export async function PATCH(req) {
  try {
    const { key, id, updates } = await req.json();
    if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }
    const comercios = await getComercios();
    const idx = comercios.findIndex((c) => c.id === id);
    if (idx === -1) return Response.json({ error: "No encontrado" }, { status: 404 });

    const current = comercios[idx];
    const merged = { ...current, ...updates };

    // Habilitar/deshabilitar un plan puntual para este comercio (no afecta a nadie más).
    if (updates.planesHabilitados) {
      const nuevosHabilitados = {
        ...(current.planesHabilitados || defaultPlanesHabilitadosComercio()),
        ...updates.planesHabilitados,
      };
      // El plan gratis nunca se le puede quitar a un comercio (mismo criterio que técnicos).
      if (!puedeDesactivarsePlan("comercio", "gratis")) nuevosHabilitados.gratis = true;
      merged.planesHabilitados = nuevosHabilitados;

      // Si el plan que tenía asignado justo quedó deshabilitado, lo volvemos a gratis.
      if (nuevosHabilitados[current.plan] === false) {
        merged.plan = "gratis";
        merged.subscription = updateSubscriptionPlan(current.subscription, "gratis");
      }
    }

    // Cambiar el plan actual del comercio: solo si ese plan está habilitado para él.
    if (updates.plan && updates.plan !== current.plan) {
      const habilitados = merged.planesHabilitados || current.planesHabilitados || defaultPlanesHabilitadosComercio();
      if (habilitados[updates.plan] === false) {
        return Response.json(
          { error: `El plan "${updates.plan}" no está habilitado para este comercio. Habilitalo primero.` },
          { status: 400 }
        );
      }
      merged.subscription = updateSubscriptionPlan(current.subscription, updates.plan);
    }

    comercios[idx] = merged;
    await saveComercios(comercios);
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}

// Eliminar un comercio desde el panel admin.
export async function DELETE(req) {
  try {
    const { key, id } = await req.json();
    if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }
    const comercios = await getComercios();
    const filtered = comercios.filter((c) => c.id !== id);
    if (filtered.length === comercios.length) {
      return Response.json({ error: "No encontrado" }, { status: 404 });
    }
    await saveComercios(filtered);
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
