type ContactEnv = {
  RESEND_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
};

type ContactContext = {
  request: Request;
  env: ContactEnv;
};

const DEFAULT_TO_EMAIL = "contact@quanlycongtrinh.com";
const DEFAULT_FROM_EMAIL = "no-reply@quanlycongtrinh.com";
const CONTACT_SUBJECT = "[QuanLyCongTrinh] Đăng ký dùng thử / Liên hệ";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const ipRequestLog = new Map<string, number[]>();

const jsonResponse = (
  status: number,
  body: Record<string, unknown>,
  extraHeaders?: HeadersInit,
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });

const asTrimmedString = (value: unknown) => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
};

const pickFirstString = (payload: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = asTrimmedString(payload[key]);
    if (value) {
      return value;
    }
  }
  return "";
};

const getClientIp = (request: Request) => {
  const cfIp = asTrimmedString(request.headers.get("cf-connecting-ip"));
  if (cfIp) {
    return cfIp;
  }

  const xff = asTrimmedString(request.headers.get("x-forwarded-for"));
  if (!xff) {
    return "unknown";
  }

  const firstIp = xff.split(",")[0]?.trim();
  return firstIp || "unknown";
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isValidPhone = (value: string) => /^\+?[0-9\s().-]{7,20}$/.test(value);

const isRateLimited = (ip: string, now: number) => {
  for (const [key, timestamps] of ipRequestLog.entries()) {
    const recent = timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
    if (recent.length > 0) {
      ipRequestLog.set(key, recent);
    } else {
      ipRequestLog.delete(key);
    }
  }

  const timestamps = ipRequestLog.get(ip) ?? [];
  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  timestamps.push(now);
  ipRequestLog.set(ip, timestamps);
  return false;
};

export const onRequest = async ({ request, env }: ContactContext) => {
  if (request.method !== "POST") {
    return jsonResponse(
      405,
      { ok: false, error: "Method not allowed" },
      { Allow: "POST" },
    );
  }

  if (!env.RESEND_API_KEY) {
    return jsonResponse(500, {
      ok: false,
      error: "Missing RESEND_API_KEY",
    });
  }

  let payload: Record<string, unknown>;
  try {
    const rawPayload = await request.json();
    if (!rawPayload || typeof rawPayload !== "object" || Array.isArray(rawPayload)) {
      return jsonResponse(400, { ok: false, error: "Invalid request payload" });
    }
    payload = rawPayload as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { ok: false, error: "Invalid JSON body" });
  }

  const website = asTrimmedString(payload.website);
  if (website) {
    return jsonResponse(400, { ok: false, error: "Invalid request" });
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip, Date.now())) {
    return jsonResponse(
      429,
      { ok: false, error: "Too many requests. Please try again later." },
      { "Retry-After": "600" },
    );
  }

  const fullName = pickFirstString(payload, ["full_name", "fullName", "name"]);
  const companyName = pickFirstString(payload, ["company_name", "companyName", "company"]);
  const phone = pickFirstString(payload, ["phone", "phoneNumber", "phone_number"]);
  const email = pickFirstString(payload, ["email", "emailAddress", "email_address"]);
  const message = pickFirstString(payload, ["message", "note", "needs"]);
  const planInterest = pickFirstString(payload, [
    "plan_interest",
    "planInterest",
    "plan",
    "company_size",
    "companySize",
  ]);

  const fieldErrors: Record<string, string> = {};

  if (!fullName) {
    fieldErrors.full_name = "Vui lòng nhập họ tên.";
  }

  if (!email && !phone) {
    fieldErrors.contact = "Vui lòng nhập email hoặc số điện thoại.";
  }

  if (fullName.length > 200) {
    fieldErrors.full_name = "Họ tên tối đa 200 ký tự.";
  }

  if (companyName.length > 200) {
    fieldErrors.company_name = "Tên công ty tối đa 200 ký tự.";
  }

  if (email.length > 320) {
    fieldErrors.email = "Email quá dài.";
  } else if (email && !isValidEmail(email)) {
    fieldErrors.email = "Email không hợp lệ.";
  }

  if (phone.length > 50) {
    fieldErrors.phone = "Số điện thoại quá dài.";
  } else if (phone && !isValidPhone(phone)) {
    fieldErrors.phone = "Số điện thoại không hợp lệ.";
  }

  if (planInterest.length > 200) {
    fieldErrors.plan_interest = "Nhu cầu gói dịch vụ tối đa 200 ký tự.";
  }

  if (message.length > 2000) {
    fieldErrors.message = "Nội dung tối đa 2000 ký tự.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return jsonResponse(400, {
      ok: false,
      error: "Dữ liệu không hợp lệ.",
      fields: fieldErrors,
    });
  }

  const toEmail = asTrimmedString(env.CONTACT_TO_EMAIL) || DEFAULT_TO_EMAIL;
  const fromEmail = asTrimmedString(env.CONTACT_FROM_EMAIL) || DEFAULT_FROM_EMAIL;
  const submittedAt = new Date().toISOString();
  const userAgent = request.headers.get("user-agent") ?? "";

  const textBody = [
    "Yêu cầu đăng ký dùng thử / liên hệ mới",
    "",
    `Họ và tên: ${fullName}`,
    `Tên công ty: ${companyName || "(không cung cấp)"}`,
    `Số điện thoại: ${phone || "(không cung cấp)"}`,
    `Email: ${email || "(không cung cấp)"}`,
    `Nhu cầu gói dịch vụ: ${planInterest || "(không cung cấp)"}`,
    `Tin nhắn: ${message || "(không cung cấp)"}`,
    "",
    `Thời gian gửi: ${submittedAt}`,
    `IP: ${ip}`,
    `User-Agent: ${userAgent || "(không có)"}`,
  ].join("\n");

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: toEmail,
        subject: CONTACT_SUBJECT,
        text: textBody,
      }),
    });

    if (!resendResponse.ok) {
      const resendError = await resendResponse.text();
      console.error("Contact email send failed:", resendResponse.status, resendError);
      return jsonResponse(502, {
        ok: false,
        error: "Không thể gửi email lúc này. Vui lòng thử lại sau.",
      });
    }
  } catch (error) {
    console.error("Contact email send failed:", error);
    return jsonResponse(500, {
      ok: false,
      error: "Lỗi hệ thống. Vui lòng thử lại sau.",
    });
  }

  return jsonResponse(200, { ok: true });
};
