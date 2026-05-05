// Netlify Function: Proxies image OCR requests to OCR.space.
// Keeps the API key server-side and out of the client bundle.
//
// Required env var (set in Netlify dashboard):
//   OCR_SPACE_API_KEY  — get a free key at https://ocr.space/ocrapi/freekey

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.OCR_SPACE_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "OCR_SPACE_API_KEY not configured" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { imageBase64 } = body;
  if (!imageBase64 || typeof imageBase64 !== "string") {
    return { statusCode: 400, body: JSON.stringify({ error: "imageBase64 is required" }) };
  }

  // OCR.space free tier limits payload to ~1 MB. Reject upfront if oversized.
  // base64 is ~33% larger than binary, so 1 MB binary ≈ 1.4 MB base64.
  if (imageBase64.length > 1_400_000) {
    return {
      statusCode: 413,
      body: JSON.stringify({ error: "Image too large (max ~1MB after compression)" }),
    };
  }

  try {
    const params = new URLSearchParams();
    params.append("base64Image", imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`);
    params.append("language", "ger");
    params.append("OCREngine", "2"); // Engine 2: better on receipts/digital displays
    params.append("scale", "true");
    params.append("isTable", "true");
    params.append("detectOrientation", "true");

    const res = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: { apikey: apiKey, "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await res.json();

    if (data.IsErroredOnProcessing) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: data.ErrorMessage || "OCR processing error" }),
      };
    }

    const text = (data.ParsedResults || [])
      .map((r) => r.ParsedText || "")
      .join("\n")
      .trim();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    };
  } catch (e) {
    console.error("[ocr-fuel] error:", e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message || "OCR request failed" }) };
  }
};
