# Panel de métricas de CasaIA — Cómo activarlo

CasaIA ahora cuenta automáticamente cuántas consultas recibe y cuántos leads
genera, y te muestra esos números en una página privada: `/panel`.

Para que funcione necesitás una base de datos gratis (Upstash Redis) donde
se guardan esos contadores.

---

## Paso 1 — Crear la base de datos en Upstash

1. Andá a **upstash.com** → "Sign up" (podés entrar con GitHub para ir más
   rápido, ya que tenés cuenta).
2. Una vez adentro, hacé clic en **"Create Database"**.
3. Ponele un nombre, por ejemplo `casaia-metrics`.
4. Tipo: **Redis**. Región: elegí una cercana (ej. `us-east-1` o similar,
   no es crítico para este uso).
5. Plan: dejá el **Free** (alcanza de sobra para esto).
6. Click en "Create".

## Paso 2 — Copiar las credenciales

1. Dentro de tu base de datos recién creada, buscá la sección **"REST API"**.
2. Vas a ver dos valores: **`UPSTASH_REDIS_REST_URL`** y
   **`UPSTASH_REDIS_REST_TOKEN`** — copiá los dos.

## Paso 3 — Cargar las variables en Vercel

1. Andá a tu proyecto en **vercel.com** → `casaia` → **Settings** →
   **Environment Variables**.
2. Agregá estas 3 variables nuevas:

   | Nombre | Valor |
   |---|---|
   | `KV_REST_API_URL` | el valor de `UPSTASH_REDIS_REST_URL` que copiaste |
   | `KV_REST_API_TOKEN` | el valor de `UPSTASH_REDIS_REST_TOKEN` que copiaste |
   | `ADMIN_SECRET` | una clave que vos inventes, larga, tipo contraseña (ej. `casaia-panel-2026-xyz789`) |

3. Guardá cada una.
4. Andá a **Deployments** → en el último deploy, los 3 puntitos → **Redeploy**
   (las variables de entorno solo se cargan al hacer un nuevo deploy).

## Paso 4 — Ver tus métricas

1. Andá a `https://casaia.vercel.app/panel` (o tu dominio si conectaste uno propio).
2. Ingresá la clave que pusiste en `ADMIN_SECRET`.
3. Vas a ver:
   - **Consultas totales**: cuántos mensajes procesó la IA en total.
   - **Leads generados**: cuántas personas dejaron sus datos para visita técnica.
   - **Tasa de conversión**: qué % de consultas terminó en un lead — el número
     más útil para mostrarle a un fabricante.

## Si querés probarlo primero en tu compu

Agregá las mismas 3 variables a tu archivo `.env.local` (mirá `.env.example`
actualizado) y corré `npm run dev` como siempre. Andá a
`http://localhost:3000/panel` para probarlo antes de tocar Vercel.

## Nota de seguridad

`/panel` no tiene un login "de verdad" — cualquiera que sepa la URL puede
intentar entrar, pero sin la clave correcta no ve nada (el servidor rechaza
el pedido). Para lo que es hoy (mirar tus propios números) alcanza. Si más
adelante lo vas a mostrar a fabricantes con acceso propio, se puede armar
un login más robusto — avisame cuando llegue ese momento.
