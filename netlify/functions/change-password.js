const { getUser, admin } = require("@netlify/identity");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

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

  const { newPassword } = body;
  if (!newPassword || newPassword.length < 6) {
    return { statusCode: 400, body: JSON.stringify({ error: "Neues Passwort muss mind. 6 Zeichen haben" }) };
  }

  try {
    await admin.updateUser(caller.id, { password: newPassword });
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Passwort geändert" }),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message || "Passwort konnte nicht geändert werden" }) };
  }
};
