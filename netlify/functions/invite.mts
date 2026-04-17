export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Nicht autorisiert" }), { status: 401 });
  }
  const token = authHeader.slice(7);

  // Verify the calling user is authenticated by fetching their profile
  const siteUrl = process.env.URL || `https://${req.headers.get("host")}`;
  const identityUrl = `${siteUrl}/.netlify/identity`;

  const callerRes = await fetch(`${identityUrl}/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!callerRes.ok) {
    return new Response(JSON.stringify({ error: "Ungültiger Token" }), { status: 401 });
  }

  const body = await req.json();
  const { email } = body;
  if (!email || typeof email !== "string") {
    return new Response(JSON.stringify({ error: "Email ist erforderlich" }), { status: 400 });
  }

  // Use Netlify Identity Admin API to invite user
  const IDENTITY_TOKEN = process.env.IDENTITY_ADMIN_TOKEN;
  if (!IDENTITY_TOKEN) {
    return new Response(
      JSON.stringify({ error: "Admin Token nicht konfiguriert. Setze IDENTITY_ADMIN_TOKEN in Netlify Environment Variables." }),
      { status: 500 }
    );
  }

  const inviteRes = await fetch(`${identityUrl}/admin/invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${IDENTITY_TOKEN}`,
    },
    body: JSON.stringify({ email }),
  });

  if (!inviteRes.ok) {
    const err = await inviteRes.json().catch(() => ({}));
    const msg = (err as Record<string, string>).msg || (err as Record<string, string>).error_description || "Einladung fehlgeschlagen";
    return new Response(JSON.stringify({ error: msg }), { status: inviteRes.status });
  }

  return new Response(JSON.stringify({ success: true, message: `Einladung an ${email} gesendet` }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
