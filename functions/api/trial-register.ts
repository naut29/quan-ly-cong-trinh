const jsonResponse = (status: number, body: Record<string, unknown>) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
};

const isValidEmail = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const isValidPhone = (value: string) => {
  return /^\+?\d{8,15}$/.test(value);
};

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export const onRequestPost = async (context: any) => {
  try {
    if (!context?.env?.RESEND_API_KEY) {
      return jsonResponse(500, { error: 'Missing RESEND_API_KEY' });
    }

    let payload: any;
    try {
      payload = await context.request.json();
    } catch {
      return jsonResponse(400, { error: 'Invalid JSON body' });
    }

    const name = String(payload?.name ?? '').trim();
    const email = String(payload?.email ?? '').trim();
    const company = String(payload?.company ?? '').trim();
    const phone = String(payload?.phone ?? '').trim();
    const note = String(payload?.note ?? '').trim();
    const website = String(payload?.website ?? '').trim();
    const ts = Number(payload?.ts);
    const nonce = String(payload?.nonce ?? '').trim();

    if (website) {
      return jsonResponse(200, { success: true });
    }

    const fields: Record<string, string> = {};

    if (name.length < 2) {
      fields.name = 'Vui lòng nhập họ tên (tối thiểu 2 ký tự).';
    }
    if (!isValidEmail(email)) {
      fields.email = 'Email không hợp lệ.';
    }
    if (company.length < 2) {
      fields.company = 'Vui lòng nhập tên công ty (tối thiểu 2 ký tự).';
    }
    if (phone && !isValidPhone(phone)) {
      fields.phone = 'Số điện thoại không hợp lệ.';
    }
    if (note.length > 1000) {
      fields.note = 'Ghi chú tối đa 1000 ký tự.';
    }

    const now = Date.now();
    if (!Number.isFinite(ts) || now - ts > 10 * 60 * 1000) {
      fields.ts = 'Phiên gửi không hợp lệ.';
    }
    if (nonce.length < 12) {
      fields.nonce = 'Phiên gửi không hợp lệ.';
    }

    if (Object.keys(fields).length > 0) {
      return jsonResponse(400, { error: 'Validation error', fields });
    }

    const submittedAt = new Date().toISOString();
    const userAgent = context.request.headers.get('user-agent') || '';
    const shortUa = userAgent.slice(0, 160);

    const html = `
      <h2>Đăng ký dùng thử SaaS</h2>
      <p><strong>Họ tên:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Công ty:</strong> ${escapeHtml(company)}</p>
      <p><strong>Điện thoại:</strong> ${phone ? escapeHtml(phone) : 'Không cung cấp'}</p>
      <p><strong>Ghi chú:</strong> ${note ? escapeHtml(note) : 'Không có'}</p>
      <hr />
      <p><strong>Thời gian gửi:</strong> ${escapeHtml(submittedAt)}</p>
      <p><strong>User agent:</strong> ${escapeHtml(shortUa || 'Không có')}</p>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${context.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Trial <onboarding@resend.dev>',
        to: 'contact@quanlycongtrinh.com',
        subject: 'Đăng ký dùng thử SaaS',
        html,
      }),
    });

    if (!resendResponse.ok) {
      console.error('Trial register error: Resend API failed with status', resendResponse.status);
      return jsonResponse(500, { error: 'Email service error' });
    }

    return jsonResponse(200, { success: true });
  } catch (error: any) {
    console.error('Trial register error:', error?.message || error);
    return jsonResponse(500, { error: 'Server error' });
  }
};
