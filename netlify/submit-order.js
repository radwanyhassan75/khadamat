// هذا الكود يتطلب تثبيت مكتبة supabase، ستفعل ذلك في الخطوة التالية
const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
    // استلام البيانات من الطلب
    const { service, price, notes } = JSON.parse(event.body);
    const orderId = 'KH-' + Date.now().toString().slice(-6);

    // الربط مع قاعدة بيانات Supabase باستخدام المفاتيح السرية
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

    // إدراج الطلب الجديد في جدول orders
    const { data, error } = await supabase
        .from('orders')
        .insert([{ 
            service_name: service,
            price: price,
            notes: notes,
            order_id: orderId,
            payment_status: 'لم يتم الدفع',
            order_status: 'قيد المعالجة'
        }])
        .select();

    if (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }

    // إرسال رقم الطلب مرة أخرى إلى الواجهة
    return {
        statusCode: 200,
        body: JSON.stringify({ orderId: orderId })
    };
};