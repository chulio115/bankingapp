import { compressImageToBase64 } from "./imageCompress";

/**
 * Sends a fuel-receipt image to the Netlify OCR proxy (OCR.space backend).
 * Returns the recognized text or throws on failure.
 */
export async function cloudOcrFuel(file: File): Promise<string> {
  const base64 = await compressImageToBase64(file);

  const res = await fetch("/.netlify/functions/ocr-fuel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64: base64 }),
  });

  if (!res.ok) {
    let msg = `OCR request failed (${res.status})`;
    try {
      const err = await res.json();
      if (err?.error) msg = err.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  const data = (await res.json()) as { text?: string };
  return data.text || "";
}
