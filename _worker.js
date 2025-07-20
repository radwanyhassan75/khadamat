export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

    // إعداد رؤوس CORS
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // معالجة طلبات OPTIONS (CORS Preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    // المسار الأساسي
    const basePath = '/api/orders';

    try {
      // GET - جلب كل الطلبات
      if (request.method === 'GET' && pathname === basePath) {
        const { results } = await env.main_database.prepare('SELECT * FROM orders').all();
        return new Response(JSON.stringify(results), { status: 200, headers });
      }

      // POST - إنشاء طلب جديد
      if (request.method === 'POST' && pathname === basePath) {
        const data = await request.json();
        const { name, email, phone, description, method, order_id, status } = data;

        await env.main_database.prepare(`
          INSERT INTO orders (name, email, phone, description, method, order_id, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(name, email, phone, description, method, order_id, status).run();

        return new Response(JSON.stringify({ message: 'تم إنشاء الطلب بنجاح' }), { status: 201, headers });
      }

      // PUT - تحديث حالة الطلب
      if (request.method === 'PUT' && pathname.startsWith(`${basePath}/`)) {
        const id = pathname.split('/').pop();
        const { status } = await request.json();

        await env.main_database.prepare(`
          UPDATE orders SET status = ? WHERE id = ?
        `).bind(status, id).run();

        return new Response(JSON.stringify({ message: 'تم تحديث الحالة بنجاح' }), { status: 200, headers });
      }

      // DELETE - حذف طلب
      if (request.method === 'DELETE' && pathname.startsWith(`${basePath}/`)) {
        const id = pathname.split('/').pop();

        await env.main_database.prepare(`DELETE FROM orders WHERE id = ?`).bind(id).run();

        return new Response(JSON.stringify({ message: 'تم حذف الطلب بنجاح' }), { status: 200, headers });
      }

      return new Response(JSON.stringify({ error: 'المسار غير صالح' }), { status: 404, headers });

    } catch (error) {
      return new Response(JSON.stringify({ error: 'خطأ داخلي في الخادم', details: error.message }), {
        status: 500,
        headers,
      });
    }
  },
};
