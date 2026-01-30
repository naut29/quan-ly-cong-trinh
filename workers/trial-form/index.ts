export interface Env {
  RESEND_API_KEY: string;
  TO_EMAIL: string;
  FROM_EMAIL: string;
}

type TrialPayload = {
  fullName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  companySize?: string | null;
  needs?: string;
};

const jsonResponse = (data: unknown, status = 200, extraHeaders: HeadersInit = {}) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
};

const corsHeaders: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname !== "/api/trial") {
      return jsonResponse({ ok: false, error: "Not found" }, 404, corsHeaders);
    }

    if (request.method !== "POST") {
      return jsonResponse({ ok: false, error: "Method not allowed" }, 405, corsHeaders);
    }

    if (!env.RESEND_API_KEY || !env.TO_EMAIL || !env.FROM_EMAIL) {
      return jsonResponse({ ok: false, error: "Missing email configuration" }, 500, corsHeaders);
    }

    let payload: TrialPayload;
    try {
      payload = (await request.json()) as TrialPayload;
    } catch {
      return jsonResponse({ ok: false, error: "Invalid JSON" }, 400, corsHeaders);
    }

    const fullName = (payload.fullName || "").trim();
    const companyName = (payload.companyName || "").trim();
    const email = (payload.email || "").trim();
    const phone = (payload.phone || "").trim();
    const companySize = payload.companySize || "";
    const needs = (payload.needs || "").trim();

    if (!fullName || !companyName || !email) {
      return jsonResponse({ ok: false, error: "Missing required fields" }, 400, corsHeaders);
    }

    const subject = `Trial request - ${companyName}`;
    const text = [
      `Full name: ${fullName}`,
      `Company: ${companyName}`,
      `Email: ${email}`,
      `Phone: ${phone || '-'}`,
      `Company size: ${companySize || '-'}`,
      `Needs: ${needs || '-'}`,
    ].join("
");

    const html = `
      <h2>New trial request</h2>
      <ul>
        <li><strong>Full name:</strong> ${fullName}</li>
        <li><strong>Company:</strong> ${companyName}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Phone:</strong> ${phone || "-"}</li>
        <li><strong>Company size:</strong> ${companySize || "-"}</li>
        <li><strong>Needs:</strong> ${needs || "-"}</li>
      </ul>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL,
        to: [env.TO_EMAIL],
        subject,
        text,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      return jsonResponse({ ok: false, error: errorText || "Email send failed" }, 502, corsHeaders);
    }

    return jsonResponse({ ok: true }, 200, corsHeaders);
  },
};
