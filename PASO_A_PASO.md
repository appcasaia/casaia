# CasaIA — Paso a paso para poner la app a funcionar

Esto asume que arrancás de cero (sin Git instalado, sin cuentas creadas).
Seguí los pasos en orden, no te saltees ninguno.

---

## Paso 0 — Instalar lo necesario en tu computadora

1. **Node.js**: entrá a nodejs.org, descargá la versión LTS (la recomendada)
   e instalala como cualquier programa. Esto te instala también `npm`, que
   lo vas a necesitar.
2. **Git**: entrá a git-scm.com/downloads, descargá para tu sistema operativo
   e instalalo con las opciones por defecto (dale "Next" a todo).
3. Para confirmar que quedó bien instalado, abrí una terminal (en Windows:
   "Símbolo del sistema" o PowerShell; en Mac: "Terminal") y escribí:
   ```
   node -v
   git --version
   ```
   Si te devuelve un número de versión en los dos casos, estás listo.

---

## Paso 1 — Descomprimir el proyecto

Descomprimí el archivo `casaia.zip` que te dejo en una carpeta que sea
fácil de encontrar, por ejemplo `Documentos/casaia`.

---

## Paso 2 — Crear las cuentas que vas a necesitar (todas gratis)

1. **GitHub** → github.com → "Sign up". Elegí un nombre de usuario que
   pueda ser público (va a quedar asociado al proyecto).
2. **Vercel** → vercel.com → "Sign up" → elegí "Continue with GitHub" para
   que quede todo conectado.
3. **Anthropic** (la IA) → console.anthropic.com → creá tu cuenta → andá a
   "API Keys" → "Create Key" → copiá esa clave y guardala en un lugar
   seguro por ahora (la vas a pegar en Vercel más adelante). Esto tiene
   costo por uso, muy bajo (centavos de dólar por conversación).
4. **Resend** (para que te lleguen los leads por email) → resend.com →
   "Sign up" → andá a "API Keys" → "Create API Key" → copiala también.

---

## Paso 3 — Probarla en tu computadora antes de publicar (opcional pero recomendado)

1. Abrí la terminal, y navegá hasta la carpeta del proyecto:
   ```
   cd Documentos/casaia
   ```
2. Instalá las dependencias:
   ```
   npm install
   ```
3. Copiá el archivo de ejemplo de variables de entorno:
   - En Mac/Linux: `cp .env.example .env.local`
   - En Windows: `copy .env.example .env.local`
4. Abrí `.env.local` con cualquier editor de texto y pegá tus claves reales
   de Anthropic y Resend, reemplazando los valores de ejemplo.
5. Corré el proyecto:
   ```
   npm run dev
   ```
6. Abrí el navegador en `http://localhost:3000` y probá el chat. Si
   funciona ahí, ya sabés que en producción también va a andar.

---

## Paso 4 — Subir el código a GitHub

Desde la misma terminal, dentro de la carpeta del proyecto:

```
git init
git add .
git commit -m "primera version de CasaIA"
git branch -M main
```

Ahora andá a github.com → botón "+" arriba a la derecha → "New repository"
→ nombralo `casaia` → dejalo público o privado (como prefieras) → **no**
tildes "Add a README" → "Create repository".

GitHub te va a mostrar unos comandos, usá estos (reemplazando TU-USUARIO):

```
git remote add origin https://github.com/TU-USUARIO/casaia.git
git push -u origin main
```

Te va a pedir que inicies sesión la primera vez — seguí las instrucciones
en pantalla (usualmente abre el navegador para autenticarte).

---

## Paso 5 — Publicar en Vercel

1. Entrá a vercel.com (ya logueado con GitHub) → "Add New" → "Project".
2. Elegí el repositorio `casaia` de la lista → "Import".
3. Vercel detecta que es Next.js solo, no cambies nada de esa sección.
4. Abrí **Environment Variables** y cargá estas 4, una por una:

   | Nombre | Valor |
   |---|---|
   | `ANTHROPIC_API_KEY` | tu clave de console.anthropic.com |
   | `RESEND_API_KEY` | tu clave de resend.com |
   | `LEAD_EMAIL_TO` | el email donde querés recibir los leads |
   | `LEAD_EMAIL_FROM` | `onboarding@resend.dev` (para arrancar) |

5. Click en **Deploy**. Esperá 1-2 minutos.
6. Te da una URL tipo `casaia.vercel.app` — ya está pública y funcionando.

---

## Paso 6 — Probarla en producción

Entrá a la URL desde tu celular:
- Escribí un problema o mandá una foto → confirmá que responde bien.
- Si el caso amerita visita técnica, tiene que aparecer el formulario de
  contacto.
- Completalo y confirmá que te llega el email a `LEAD_EMAIL_TO`.

---

## Paso 7 — Dominio propio (opcional)

Vercel → tu proyecto → **Settings** → **Domains** → agregá tu dominio
(ej. `casaia.com` o `app.casaia.com`) y seguí las instrucciones para
apuntar el DNS desde donde compraste el dominio. El certificado SSL lo
genera Vercel solo, gratis.

---

## Cada vez que quieras cambiar algo del código

```
git add .
git commit -m "descripción del cambio"
git push
```

Vercel detecta el push y republica automáticamente en un par de minutos,
sin que tengas que hacer nada más.

---

## Si algo falla

- **La app no responde nada / da error al mandar mensaje**: revisá que
  `ANTHROPIC_API_KEY` esté bien pegada en Vercel (sin espacios de más) y
  que tengas saldo/facturación activa en console.anthropic.com.
- **No llegan los emails de leads**: revisá `RESEND_API_KEY` y que
  `LEAD_EMAIL_TO` esté bien escrito. Con `LEAD_EMAIL_FROM` en
  `onboarding@resend.dev` no hace falta verificar dominio propio para
  probar.
- **Cambié una variable de entorno en Vercel y no pasa nada**: después de
  cambiar env vars tenés que ir a "Deployments" → los 3 puntitos del
  último deploy → "Redeploy", porque las variables solo se cargan al
  momento del build.
