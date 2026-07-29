// app/api/whatsapp/webhook/route.js
//
// Webhook de WhatsApp Cloud API (Meta).
//
// Meta necesita esta URL pública para dos cosas:
//   1. GET  -> handshake de verificación, UNA sola vez, cuando cargás esta
//              URL en "Configuración de producción -> Configurar webhooks"
//              en developers.facebook.com.
//   2. POST -> notificaciones continuas: mensajes entrantes de huéspedes/
//              técnicos que responden por WhatsApp, y cambios de estado de
//              los mensajes que mandamos (enviado/entregado/leído/fallido).
//
// Variable de entorno que necesita (inventala vos, no la da Meta):
//   WHATSAPP_VERIFY_TOKEN  -> cualquier string largo y secreto. Tiene que
//                             coincidir EXACTO con el "Token de verificación"
//                             que cargues en el panel de Meta.
//
// Por ahora el POST solo loguea y guarda los últimos eventos en Redis para
// poder revisarlos (no dispara ninguna acción todavía). Cuando quieras que
// las respuestas de técnicos/huéspedes hagan algo puntual (guardar en un
// lead, reenviar por email, etc.), se agrega acá mismo.

async function callRedis(command) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;

  const res = await fetch(`${url}/${command}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.result;
}

// Guarda el evento crudo en una lista en Redis (últimos 50), sin romper
// nada si Redis no está disponible.
async function logWhatsAppEvent(payload) {
  try {
    const entry = JSON.stringify({
      receivedAt: new Date().toISOString(),
      payload,
    });
    // LPUSH agrega al principio de la lista "whatsapp:events"
    await callRedis(`lpush/whatsapp:events/${encodeURIComponent(entry)}`);
    // Recortamos la lista para no acumular para siempre (nos quedamos con 50)
    await callRedis(`ltrim/whatsapp:events/0/49`);
  } catch (err) {
    console.error("[whatsapp webhook] No se pudo loguear el evento en Redis:", err);
  }
}

// Paso 1: handshake de verificación (Meta lo llama una sola vez al guardar
// la config, y después cada vez que reintenta verificar).
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (!expectedToken) {
    console.error("[whatsapp webhook] Falta WHATSAPP_VERIFY_TOKEN en las variables de entorno.");
    return new Response("Server misconfigured", { status: 500 });
  }

  if (mode === "subscribe" && token === expectedToken) {
    // Meta espera el challenge devuelto tal cual, como texto plano.
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

// Paso 2: eventos reales (mensajes entrantes, cambios de estado).
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch (err) {
    // Si Meta manda algo no-JSON, igual respondemos 200 para que no reintente.
    console.error("[whatsapp webhook] Body no es JSON válido:", err);
    return new Response("OK", { status: 200 });
  }

  console.log("[whatsapp webhook] Evento recibido:", JSON.stringify(body));

  // No bloqueamos la respuesta esperando Redis: Meta requiere un 200 rápido
  // (si tarda o falla, reintenta y puede terminar suspendiendo el webhook).
  logWhatsAppEvent(body).catch(() => {});

  return new Response("OK", { status: 200 });
}
