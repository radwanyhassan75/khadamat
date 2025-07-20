export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // دالة للتعامل مع CORS
    function handleOptions() {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // التعامل مع طلبات OPTIONS أولاً
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // توجيه الطلبات إلى /api/orders
    if (url.pathname === '/api/orders') {
      // جلب كل الطلبات
      if (request.method === 'GET') {
        const { results } = await env.DB
          .prepare(`SELECT * FROM orders ORDER BY createdAt DESC`)
          .all();
        return new Response(JSON.stringify(results), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      // إضافة طلب جديد بكل الحقول
      if (request.method === 'POST') {
        try {
          const newOrder = await request.json();
          
          // إنشاء قيم جديدة للطلب
          const id = crypto.randomUUID();
          const createdAt = new Date().toISOString();
          const status = 'جاري المعالجة'; // حالة افتراضية

          // ** تم تحديث استعلام SQL ليشمل كل الحقول **
          await env.DB
            .prepare(`
              INSERT INTO orders (id, userId, customerName, email, phone, serviceName, price, serviceDetails, serviceLink, paymentMethod, receiptUrl, status, createdAt) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(
              id,
              newOrder.userId || null,
              newOrder.customerName,
              newOrder.email,
              newOrder.phone,
              newOrder.serviceName,
              newOrder.price,
              newOrder.serviceDetails || '',
              newOrder.serviceLink || '',
              newOrder.paymentMethod,
              newOrder.receiptUrl || '',
              status,
              createdAt
            )
            .run();

          return new Response(JSON.stringify({ status: 'success', orderId: id }), {
            status: 201,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        } catch (e) {
          console.error(e); // لطباعة الخطأ في لوحة التحكم
          return new Response(JSON.stringify({ error: 'فشل في إدخال الطلب', details: e.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }
      }

      return new Response('Method not allowed', { status: 405 });
    }

    // إذا لم يتم العثور على المسار
    return new Response('Not Found', { status: 404 });
  },
};