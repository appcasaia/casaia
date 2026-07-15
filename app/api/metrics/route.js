import { getMetric } from "../../../lib/metrics";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const [messages, leads] = await Promise.all([
    getMetric("metrics:messages"),
    getMetric("metrics:leads"),
  ]);

  const conversion = messages > 0 ? ((leads / messages) * 100).toFixed(1) : "0.0";

  return Response.json({ messages, leads, conversion });
}
