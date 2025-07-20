export default {
  async fetch(request, env) {
    // استجابة OPTIONS لدعم CORS
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

    const url = new URL(request.url);

    if (url.pathname === '/api/orders') {
      if (request.method === 'OPTIONS') {
        return handleOptions();
      }

      if (request.method === 'GET') {
        // جلب البيانات من KV
        const data = await env.KV.get('orders_list');
        const orders = data ? JSON.parse(data) : [];

        return new Response(JSON.stringify(orders), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      if (request.method === 'POST') {
        try {
          // قراءة بيانات الطلب من الجسم (JSON)
          const newOrder = await request.json();

          if (!newOrder || typeof newOrder !== 'object') {
            return new Response(
              JSON.stringify({ error: 'بيانات الطلب غير صحيحة' }),
              {
                status: 400,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
              }
            );
          }

          // جلب الطلبات الحالية من KV
          const data = await env.KV.get('orders_list');
          const orders = data ? JSON.parse(data) : [];

          // توليد معرف فريد باستخدام crypto.randomUUID()
          newOrder.id = crypto.randomUUID();
          newOrder.date = new Date().toISOString();

          orders.push(newOrder);

          // حفظ القائمة المحدثة في KV
          await env.KV.put('orders_list', JSON.stringify(orders));

          return new Response(
            JSON.stringify({ status: 'success', orderId: newOrder.id }),
            {
              status: 201,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({ error: 'خطأ في قراءة البيانات' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            }
          );
        }
      }

      return new Response('Method not allowed', { status: 405 });
    }

    return new Response('Not Found', { status: 404 });
  },
};
