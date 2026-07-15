// Verifica el token de Cloudflare Turnstile contra la API de Cloudflare.
// Si TURNSTILE_SECRET_KEY no está configurada, no bloquea (permite seguir
// desarrollando/probando sin la clave todavía cargada).
export async function verifyTurnstile(token, ip) {
  if (!process.env.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
        ...(ip ? { remoteip: ip } : {}),
      }),
    });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error("Error verificando Turnstile:", err);
    // Si falla la conexión con Cloudflare (no el token en sí), no bloqueamos
    // a usuarios legítimos por un problema de infraestructura ajeno.
    return true;
  }
}
