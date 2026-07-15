import { getReferrals, saveReferrals } from "../../../lib/referrals";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const referrals = await getReferrals();
  return Response.json({ referrals });
}

export async function POST(req) {
  try {
    const { key, referrals } = await req.json();

    if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!Array.isArray(referrals)) {
      return Response.json({ error: "Formato inválido." }, { status: 400 });
    }

    const ok = await saveReferrals(referrals);
    if (!ok) {
      return Response.json({ error: "No se pudo guardar." }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Error interno." }, { status: 500 });
  }
}
