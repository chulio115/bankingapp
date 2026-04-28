exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // Verify caller is authenticated
  const authHeader = event.headers.authorization || event.headers.Authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return { statusCode: 401, body: JSON.stringify({ error: "Nicht autorisiert" }) };
  }
  const callerToken = authHeader.slice(7);

  const siteUrl = process.env.URL || "https://chuliobanking.netlify.app";
  try {
    const callerRes = await fetch(`${siteUrl}/.netlify/identity/user`, {
      headers: { Authorization: `Bearer ${callerToken}` },
    });
    if (!callerRes.ok) {
      return { statusCode: 401, body: JSON.stringify({ error: "Ungültiger Token" }) };
    }
  } catch (e) {
    return { statusCode: 401, body: JSON.stringify({ error: "Token-Prüfung fehlgeschlagen" }) };
  }

  // Parse request
  let email;
  try {
    const body = JSON.parse(event.body || "{}");
    email = body.email;
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Ungültiger Request Body" }) };
  }

  if (!email || typeof email !== "string") {
    return { statusCode: 400, body: JSON.stringify({ error: "Email ist erforderlich" }) };
  }

  // Use Netlify API to invite user
  const NETLIFY_PAT = process.env.NETLIFY_PAT;
  const SITE_ID = process.env.MY_SITE_ID;

  if (!NETLIFY_PAT || !SITE_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "NETLIFY_PAT und MY_SITE_ID müssen als Environment Variables gesetzt sein." }),
    };
  }

  try {
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
      const msg = err.msg || err.message || "Einladung fehlgeschlagen";
      return { statusCode: inviteRes.status, body: JSON.stringify({ error: msg }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: `Einladung an ${email} gesendet` }),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: "Einladung fehlgeschlagen: " + e.message }) };
  }
};
