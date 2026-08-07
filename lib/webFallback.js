// lib/webFallback.js
//
// Último recurso: cuando no hay NINGÚN técnico registrado en CasaIA (ni de
// la propiedad, ni de la inmobiliaria, ni de la zona, ni un comercio
// referido) para la categoría del problema, este helper busca en la web
// 1-2 profesionales reales cerca de la zona, para no dejar al huésped sin
// ninguna opción. SIEMPRE se marca como `viaWeb: true` para que el resto
// del sistema (UI, notificaciones) lo trate distinto de la red verificada:
// - Nunca se le manda un WhatsApp/email automático en nombre de CasaIA
//   (no tenemos relación con ese negocio, no correspondería).
// - En la pantalla del huésped se muestra con una aclaración explícita de
//   que es un resultado de internet, no parte de la red de confianza.

const CATEGORIA_LABELS = {
  plomeria: "plomero / gasista",
  electricidad: "electricista",
  cerrajeria: "cerrajero",
  aire_acondicionado: "técnico de aire acondicionado / climatización",
  general: "técnico de mantenimiento general para el hogar",
};

/**
 * Busca hasta 2 profesionales reales cerca de `zone` para la `categoria`
 * dada, usando la API de Claude con búsqueda web habilitada.
 *
 * Nunca inventa un teléfono: solo lo incluye si la búsqueda lo confirmó
 * explícitamente. Si no hay certeza, devuelve `telefono: null` y el
 * llamador debe ofrecer un link de búsqueda en Google Maps en su lugar
 * (que sí es siempre exacto, a diferencia de un número transcrito por la IA).
 *
 * Devuelve [] si falla cualquier cosa (sin API key, error de red, etc.) —
 * nunca lanza, para no romper el flujo de un lead por esto.
 */
export async function findTechnicianViaWeb({ categoria, zone }) {
  if (!process.env.ANTHROPIC_API_KEY || !zone) return [];

  const rubro = CATEGORIA_LABELS[categoria] || CATEGORIA_LABELS.general;

  const prompt = `Buscá hasta 2 opciones reales de "${rubro}" que trabajen cerca de "${zone}" (asumí Florianópolis, Brasil, salvo que el texto de la zona indique otro lugar).

Respondé ÚNICAMENTE con un JSON válido, sin ningún texto antes ni después, con este formato exacto:
[{"nombre": "...", "telefono": "..." o null}]

Reglas estrictas:
- Máximo 2 resultados.
- En "telefono" poné el número SOLO si lo confirmaste explícitamente en los resultados de la búsqueda web, tal cual aparece ahí. Si no estás seguro, poné null — es preferible null a un número posiblemente incorrecto.
- No inventes nombres ni datos que no hayas encontrado. Si la búsqueda no trae nada confiable, devolvé un array vacío [].`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }],
      }),
    });

    if (!response.ok) {
      console.error("[webFallback] Anthropic API error:", await response.text());
      return [];
    }

    const data = await response.json();
    const textBlocks = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const match = textBlocks.match(/\[[\s\S]*\]/);
    if (!match) return [];

    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((r) => r && r.nombre)
      .slice(0, 2)
      .map((r) => ({
        nombre: r.nombre,
        telefono: r.telefono || null,
        mapsQuery: `${r.nombre} ${zone}`,
        viaWeb: true,
      }));
  } catch (err) {
    console.error("[webFallback] Error buscando técnico vía web:", err);
    return [];
  }
}
