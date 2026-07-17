import { Resend } from "resend";
import { getAgencies, saveAgencies, slugify, generateEditToken, ensurePropertySlugs } from "../../../lib/agencies";
import { checkRateLimit, getClientIp } from "../../../lib/rateLimit";
import { verifyTurnstile } from "../../../lib/turnstile";

// Registro público de inmobiliarias/administradores de propiedades.
export async function POST(req) {
  try {
    const rl = await checkRateLimit({ req, bucket: "agency-registro", limit: 5, windowSeconds: 3600 });
    if (!rl.allowed) {
      return Response.json(
        { error: "Demasiados intentos. Esperá un momento y probá de nuevo." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
      );
    }

    const body = await req.json();
    const { nombre, contacto, email, telefono, localidades, tecnicos, propiedades, turnstileToken } = body;

    const humanOk = await verifyTurnstile(turnstileToken, getClientIp(req));
    if (!humanOk) {
      return Response.json({ error: "No se pudo verificar que sos una persona real. Probá de nuevo." }, { status: 400 });
    }

    if (!nombre || !contacto || !email) {
      return Response.json({ error: "Faltan datos obligatorios." }, { status: 400 });
    }

    const agencies = await getAgencies();
    const slug = slugify(nombre);
    const editToken = generateEditToken();

    const cleanTecnicos = Array.isArray(tecnicos)
      ? tecnicos.filter((t) => t.nombre && t.telefono)
      : [];

    const cleanPropiedades = ensurePropertySlugs(
      Array.isArray(propiedades) ? propiedades.filter((p) => p.nombre) : []
    );

    const newAgency = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      slug,
      editToken,
      nombre,
      contacto,
      email,
      telefono: telefono || "",
      localidades: localidades || "",
      tecnicos: cleanTecnicos,
      propiedades: cleanPropiedades,
      activo: true,
      createdAt: new Date().toISOString(),
      lastReminderAt: null,
    };

    agencies.push(newAgency);
    await saveAgencies(agencies);

    const clientLink = `https://casaia.net/i/${slug}`;
    const editLink = `https://casaia.net/inmobiliarias/editar/${slug}?token=${editToken}`;
    const propertyLinks = cleanPropiedades.map((p) => ({
      nombre: p.nombre,
      slug: p.slug,
      link: `https://casaia.net/i/${slug}/${p.slug}`,
    }));

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const adminEmail = process.env.LEAD_EMAIL_TO || "casaia24h@gmail.com";
      await resend.emails.send({
        from: process.env.LEAD_EMAIL_FROM || "onboarding@resend.dev",
        to: adminEmail,
        subject: `Nueva inmobiliaria registrada en CasaIA: ${nombre}`,
        text: `Nombre: ${nombre}\nContacto: ${contacto}\nEmail: ${email}\nTeléfono: ${telefono || "-"}\nLocalidades: ${localidades || "-"}\nTécnicos declarados: ${cleanTecnicos.length}\nPropiedades declaradas: ${cleanPropiedades.length}\nLink exclusivo: ${clientLink}`,
      });

      const propertyLinksText = propertyLinks.length
        ? `\n\nLINKS POR PROPIEDAD (para pegar el QR en la puerta de cada una):\n${propertyLinks.map((p) => `- ${p.nombre}: ${p.link}`).join("\n")}`
        : "";

      // Confirmación a la inmobiliaria con su link exclusivo y su link privado de edición.
      await resend.emails.send({
        from: process.env.LEAD_EMAIL_FROM || "onboarding@resend.dev",
        to: email,
        subject: "Tus links de CasaIA están listos",
        text: `Hola ${contacto},\n\nTu registro en CasaIA fue exitoso. Guardá estos links:\n\n1) LINK GENERAL PARA TUS CLIENTES (compartilo con huéspedes/inquilinos):\n${clientLink}\n\n2) LINK PRIVADO PARA EDITAR TUS DATOS (guardalo solo para vos, te permite modificar tus técnicos y propiedades cuando quieras, sin necesidad de contraseña):\n${editLink}${propertyLinksText}\n\nCuando un cliente entre desde el link general, va a ser atendido por la IA y derivado únicamente a los técnicos de confianza que vos cargaste. Si entra desde el link de una propiedad específica, la IA ya sabe en qué unidad está y responde directo (WiFi, claves, etc), sin preguntar nada de más — ideal para imprimir como QR y pegar en la puerta.\n\nSaludos,\nEquipo CasaIA`,
      });
    }

    return Response.json({ ok: true, slug, link: clientLink, editLink, properties: propertyLinks });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "No se pudo completar el registro." }, { status: 500 });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const agencies = await getAgencies();
  return Response.json({ agencies });
}

export async function PATCH(req) {
  try {
    const { key, id, updates } = await req.json();
    if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }
    const agencies = await getAgencies();
    const idx = agencies.findIndex((a) => a.id === id);
    if (idx === -1) return Response.json({ error: "No encontrado" }, { status: 404 });
    agencies[idx] = { ...agencies[idx], ...updates };
    await saveAgencies(agencies);
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}

// Eliminar una inmobiliaria desde el panel admin.
export async function DELETE(req) {
  try {
    const { key, id } = await req.json();
    if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }
    const agencies = await getAgencies();
    const filtered = agencies.filter((a) => a.id !== id);
    if (filtered.length === agencies.length) {
      return Response.json({ error: "No encontrado" }, { status: 404 });
    }
    await saveAgencies(filtered);
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
