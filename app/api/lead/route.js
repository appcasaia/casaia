import { Resend } from "resend";
import { incrMetric } from "../../../lib/metrics";
import { getReferrals, findReferralForZone } from "../../../lib/referrals";
import { getTechnicians, findTechniciansForZone } from "../../../lib/technicians";
import { findAgencyBySlug } from "../../../lib/agencies";
import { checkRateLimit, getClientIp } from "../../../lib/rateLimit";
import { verifyTurnstile } from "../../../lib/turnstile";

export async function POST(req) {
  try {
    const rl = await checkRateLimit({ req, bucket: "lead", limit: 10, windowSeconds: 3600 });
    if (!rl.allowed) {
      return Response.json(
        { error: "Demasiados intentos. Esperá un momento y probá de nuevo." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
      );
    }

    const { name, phone, zone, summary, agencySlug, propertyName, priority, emergency, turnstileToken } = await req.json();

    const humanOk = await verifyTurnstile(turnstileToken, getClientIp(req));
    if (!humanOk) {
      return Response.json({ error: "No se pudo verificar que sos una persona real. Probá de nuevo." }, { status: 400 });
    }

    if (!name || !phone) {
      return Response.json({ error: "Faltan datos obligatorios." }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("Falta RESEND_API_KEY en las variables de entorno.");
      return Response.json(
        { error: "El envío de leads no está configurado todavía." },
        { status: 500 }
      );
    }

    const adminEmail = process.env.LEAD_EMAIL_TO || "casaia24h@gmail.com";
    let matches = []; // formato uniforme: { nombre, telefono, email, direccion }
    let sourceLabel = "";
    let agency = null;

    if (agencySlug) {
      // Consulta llegada por el link exclusivo de una inmobiliaria:
      // se deriva ÚNICAMENTE a los técnicos de confianza de esa inmobiliaria.
      agency = await findAgencyBySlug(agencySlug);
      if (agency && agency.tecnicos?.length) {
        matches = agency.tecnicos.map((t) => ({
          nombre: t.nombre,
          telefono: t.telefono,
          email: t.email || null,
          direccion: null,
        }));
        sourceLabel = `inmobiliaria ${agency.nombre}`;
      }
    } else {
      // Consulta normal: primero técnicos auto-registrados de la zona,
      // y si no hay, comercios cargados manualmente por el admin.
      const technicians = await getTechnicians();
      const techMatches = findTechniciansForZone(zone, technicians);
      if (techMatches.length) {
        matches = techMatches.map((t) => ({
          nombre: t.empresa ? `${t.nombre} — ${t.empresa}` : t.nombre,
          telefono: t.telefono,
          email: t.email || null,
          direccion: null,
        }));
        sourceLabel = "técnico de zona";
      } else {
        const referrals = await getReferrals();
        const referral = findReferralForZone(zone, referrals);
        if (referral) {
          matches = [
            {
              nombre: referral.nombre,
              telefono: referral.telefono,
              email: referral.email || null,
              direccion: referral.direccion || null,
            },
          ];
          sourceLabel = "comercio referido";
        }
      }
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const priorityLine = priority ? `Prioridad: ${priority}${emergency ? " (activado por botón de emergencia)" : ""}\n` : "";
    const propertyLine = propertyName ? `Propiedad: ${propertyName}\n` : "";
    const emailBody = `Nombre: ${name}\nTeléfono/WhatsApp: ${phone}\nZona: ${zone || "no especificada"}\n${propertyLine}${priorityLine}\nResumen del diagnóstico:\n${summary || "(sin resumen)"}`;
    const isUrgent = priority === "ALTA";
    const urgentPrefix = isUrgent ? "🚨 URGENTE — " : "";

    // Siempre se le avisa al administrador.
    await resend.emails.send({
      from: process.env.LEAD_EMAIL_FROM || "notificaciones@casaia.net",
      to: adminEmail,
      subject: matches.length
        ? `${urgentPrefix}Nuevo lead - CasaIA (derivado vía ${sourceLabel}): ${name}`
        : `${urgentPrefix}Nuevo lead - CasaIA: ${name}`,
      text: emailBody,
    });

    // Avisar por email a cada contacto derivado que tenga email cargado.
    for (const m of matches) {
      if (m.email) {
        await resend.emails.send({
          from: process.env.LEAD_EMAIL_FROM || "notificaciones@casaia.net",
          to: m.email,
          subject: `${urgentPrefix}Nueva consulta derivada por CasaIA: ${name}`,
          text: emailBody,
        });
      }
    }

    // Si es urgente y la consulta vino por el link de una inmobiliaria,
    // avisarle también directamente a ella (además de a sus técnicos y al admin).
    if (isUrgent && agency && agency.email) {
      await resend.emails.send({
        from: process.env.LEAD_EMAIL_FROM || "notificaciones@casaia.net",
        to: agency.email,
        subject: `🚨 URGENTE en tu propiedad — CasaIA: ${name}`,
        text: `Se registró un caso URGENTE en una de tus propiedades gestionadas por CasaIA.\n\n${emailBody}`,
      });
    }

    await incrMetric("metrics:leads");

    return Response.json({ ok: true, referrals: matches });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "No se pudo enviar el lead." }, { status: 500 });
  }
}
