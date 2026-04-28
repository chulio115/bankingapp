export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  // Verify caller is authenticated
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Nicht autorisiert" }), { status: 401 });
  }
  const callerToken = authHeader.slice(7);

  const siteUrl = process.env.URL || `https://${req.headers.get("host")}`;
  const callerRes = await fetch(`${siteUrl}/.netlify/identity/user`, {
    headers: { Authorization: `Bearer ${callerToken}` },
  });
  if (!callerRes.ok) {
    return new Response(JSON.stringify({ error: "Ungültiger Token" }), { status: 401 });
  }

  // Parse request
  const body = await req.json();
  const { email } = body;
  if (!email || typeof email !== "string") {
    return new Response(JSON.stringify({ error: "Email ist erforderlich" }), { status: 400 });
  }

  // Use Netlify API (not GoTrue) to invite user — accepts Personal Access Token
  const NETLIFY_PAT = process.env.NETLIFY_PAT;
  const SITE_ID = process.env.MY_SITE_ID;

  if (!NETLIFY_PAT || !SITE_ID) {
    return new Response(
      JSON.stringify({ error: "NETLIFY_PAT und MY_SITE_ID müssen als Environment Variables gesetzt sein." }),
      { status: 500 }
    );
  }

  const inviteRes = await fetch(
    `https://api.netlify.com/api/v1/sites/${SITE_ID}/identity/users`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NETLIFY_PAT}`,
      },
      body: JSON.stringify({ email, send_invite: true }),
    }
  );

  if (!inviteRes.ok) {
    const err = await inviteRes.json().catch(() => ({}));
    const msg = (err as Record<string, string>).msg || (err as Record<string, string>).message || "Einladung fehlgeschlagen";
    return new Response(JSON.stringify({ error: msg }), { status: inviteRes.status });
  }

  return new Response(JSON.stringify({ success: true, message: `Einladung an ${email} gesendet` }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
