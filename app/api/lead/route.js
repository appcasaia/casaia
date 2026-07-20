import { Resend } from "resend";
import { incrMetric } from "../../../lib/metrics";
import { getReferrals, findReferralForZone } from "../../../lib/referrals";
import { getTechnicians, findTechniciansForZone } from "../../../lib/technicians";
import { findAgencyBySlug } from "../../../lib/agencies";
import { checkRateLimit, getClientIp } from "../../../lib/rateLimit";
import { verifyTurnstile } from "../../../lib/turnstile";
import { TECHNICIAN_PLAN_LIMITS } from "../../../lib/subscriptions";
import { labelCategoria } from "../../../lib/categorias";
import { sendWhatsAppTemplate } from "../../../lib/whatsapp";

export async function POST(req) {
  try {
    const rl = await checkRateLimit({ req, bucket: "lead", limit: 10, windowSeconds: 3600 });
    if (!rl.allowed) {
      return Response.json(
        { error: "Demasiados intentos. Esperá un momento y probá de nuevo." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
      );
    }

    const { name, phone, zone, summary, agencySlug, propertyName, priority, categoria, emergency, turnstileToken } = await req.json();

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
      // Consulta llegada por el link exclusivo de una inmobiliaria.
      agency = await findAgencyBySlug(agencySlug);
      if (agency) {
        const catKey = categoria && categoria !== "general" ? categoria : null;
        const propiedad = propertyName
          ? agency.propiedades?.find((p) => p.nombre === propertyName)
          : agency.propiedades?.length === 1
          ? agency.propiedades[0]
          : null;

        // 1) Técnico específico de ESTA propiedad para la categoría del problema.
        const tecPropiedad = catKey ? propiedad?.tecnicosPropiedad?.[catKey] : null;
        if (tecPropiedad?.nombre && tecPropiedad?.telefono) {
          matches = [
            {
              nombre: tecPropiedad.nombre,
              telefono: tecPropiedad.telefono,
              email: null,
              direccion: null,
              deLaPropiedad: true,
            },
          ];
          sourceLabel = `técnico de la propiedad (${labelCategoria(catKey)})`;
        } else if (agency.tecnicos?.length) {
          // 2) Técnicos generales de la inmobiliaria: priorizamos los que coinciden
          // con la categoría del problema; si ninguno coincide, van todos.
          const porCategoria = catKey ? agency.tecnicos.filter((t) => t.categoria === catKey) : [];
          const listaFinal = porCategoria.length ? porCategoria : agency.tecnicos;
          matches = listaFinal.map((t) => ({
            nombre: t.nombre,
            telefono: t.telefono,
            email: t.email || null,
            direccion: null,
          }));
          sourceLabel = porCategoria.length ? `técnico de confianza (${labelCategoria(catKey)})` : `inmobiliaria ${agency.nombre}`;
        }
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
          // Prestación de plan: badge visible para profesional/premium,
          // "destacado" adicional solo para premium.
          verificado: TECHNICIAN_PLAN_LIMITS[t.plan]?.badge || false,
          destacado: t.plan === "premium",
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

    // Avisos por WhatsApp (Meta Cloud API). No hace nada mientras no esté
    // configurado (ver lib/whatsapp.js) — el email sigue siendo el respaldo.
    const resumenCorto = (summary || "").slice(0, 300);
    for (const m of matches) {
      if (m.telefono) {
        await sendWhatsAppTemplate({
          to: m.telefono,
          templateName: "nuevo_lead_casaia",
          languageCode: "es",
          variables: [priority || "MEDIA", name, phone, propertyName || zone || "-", resumenCorto],
        });
      }
    }
    if (isUrgent && agency && agency.telefono) {
      await sendWhatsAppTemplate({
        to: agency.telefono,
        templateName: "nuevo_lead_casaia",
        languageCode: "es",
        variables: ["ALTA", name, phone, propertyName || zone || "-", resumenCorto],
      });
    }

    await incrMetric("metrics:leads");

    return Response.json({ ok: true, referrals: matches });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "No se pudo enviar el lead." }, { status: 500 });
  }
}
