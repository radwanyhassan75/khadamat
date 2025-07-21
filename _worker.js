export default {
  async fetch(request, env, ctx) {
    const { method, url } = request;
    const { pathname } = new URL(url);

    if (method === 'OPTIONS') {
      return handleOptions(request);
    }

    if (pathname === '/orders' && method === 'GET') {
      try {
        const { results } = await env.DB.prepare("SELECT * FROM orders").all();
        return jsonResponse(results);
      } catch (err) {
        return errorResponse("فشل في جلب الطلبات", err);
      }
    }

    if (pathname.startsWith('/orders/') && method === 'PUT') {
      const id = pathname.split('/')[2];
      const body = await readRequestBody(request);
      const { status } = body;

      if (!status) return errorResponse("يجب إرسال الحالة الجديدة");

      try {
        await env.DB.prepare("UPDATE orders SET status = ? WHERE id = ?")
                    .bind(status, id).run();
        return jsonResponse({ success: true, message: 'تم تحديث حالة الطلب' });
      } catch (err) {
        return errorResponse("فشل في تحديث الطلب", err);
      }
    }

    if (pathname.startsWith('/orders/') && method === 'DELETE') {
      const id = pathname.split('/')[2];
      try {
        await env.DB.prepare("DELETE FROM orders WHERE id = ?")
                    .bind(id).run();
        return jsonResponse({ success: true, message: 'تم حذف الطلب' });
      } catch (err) {
        return errorResponse("فشل في حذف الطلب", err);
      }
    }

    return errorResponse("المسار غير مدعوم", null, 404);
  }
};

// أدوات مساعدة

function handleOptions(request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(),
    },
  });
}

function errorResponse(message, err = null, status = 500) {
  return jsonResponse({
    error: message,
    details: err?.message || null,
  }, status);
}

async function readRequestBody(request) {
  try {
    const body = await request.json();
    return body;
  } catch {
    return {};
  }
}
