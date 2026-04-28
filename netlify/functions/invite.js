const { admin, getUser } = require("@netlify/identity");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // Verify caller is authenticated
  const caller = await getUser();
  if (!caller) {
    return { statusCode: 401, body: JSON.stringify({ error: "Nicht autorisiert" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Ungültiger Request Body" }) };
  }

  const { email, password } = body;
  if (!email || typeof email !== "string") {
    return { statusCode: 400, body: JSON.stringify({ error: "Email ist erforderlich" }) };
  }
  if (!password || password.length < 6) {
    return { statusCode: 400, body: JSON.stringify({ error: "Passwort muss mind. 6 Zeichen haben" }) };
  }

  try {
    const user = await admin.createUser({ email, password, confirm: true });
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: `Benutzer ${email} erstellt`, id: user.id }),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message || "Benutzer konnte nicht erstellt werden" }) };
  }
};
