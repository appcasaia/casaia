// lib/whatsapp.js
//
// Envío de notificaciones por WhatsApp usando la API de Meta (WhatsApp Business
// Cloud API), NO Twilio — según lo acordado.
//
// IMPORTANTE: mientras no estén cargadas las variables de entorno de abajo,
// esta función no hace nada (solo deja un log) y no rompe el resto del flujo.
// Así el código queda enganchado y lista para activarse el día que
// completes la configuración de Meta, sin tener que tocar nada más.
//
// Variables de entorno que necesita (se cargan en Vercel cuando estén listas):
//   WHATSAPP_ACCESS_TOKEN     -> token permanente del System User de Meta
//   WHATSAPP_PHONE_NUMBER_ID  -> ID del número de WhatsApp Business (no el número en sí)
//
// Requiere una PLANTILLA aprobada por Meta para poder mandar mensajes que el
// destinatario no inició (que es el caso de estos avisos). Ver abajo el
// texto exacto de la plantilla a dar de alta en Meta Business Manager.

const GRAPH_API_VERSION = "v19.0";

function isConfigured() {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

// Envía un mensaje de plantilla (obligatorio para mensajes iniciados por el negocio).
// `variables` es un array de strings, en el mismo orden que los {{1}}, {{2}}, etc.
// de la plantilla aprobada.
export async function sendWhatsAppTemplate({ to, templateName, languageCode = "es", variables = [] }) {
  if (!isConfigured()) {
    console.warn(
      `[whatsapp] No configurado todavía (falta WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID). ` +
        `Se omitió el envío de "${templateName}" a ${to}.`
    );
    return { skipped: true };
  }

  const cleanTo = String(to).replace(/[^\d]/g, ""); // solo dígitos, con código de país, sin "+"
  if (!cleanTo) return { skipped: true, reason: "Teléfono inválido" };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: cleanTo,
          type: "template",
          template: {
            name: templateName,
            language: { code: languageCode },
            components: variables.length
              ? [
                  {
                    type: "body",
                    parameters: variables.map((v) => ({ type: "text", text: String(v ?? "-") })),
                  },
                ]
              : [],
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[whatsapp] Error al enviar a ${cleanTo}:`, errText);
      return { skipped: false, ok: false, error: errText };
    }

    return { skipped: false, ok: true };
  } catch (err) {
    console.error("[whatsapp] Error de red:", err);
    return { skipped: false, ok: false, error: String(err) };
  }
}

export { isConfigured as whatsappConfigured };
