// This code requires you to install some packages.
// Make sure your package.json file exists and has the dependencies.
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
// We need to handle multipart/form-data which includes file uploads
const Busboy = require('busboy');

// A helper function to parse multipart form data
function parseMultipartForm(event) {
    return new Promise((resolve) => {
        const busboy = Busboy({ headers: event.headers });
        const fields = {};
        const uploads = {};

        busboy.on('file', (fieldname, file,
            {filename, encoding, mimeType}
        ) => {
            const chunks = [];
            file.on('data', (chunk) => chunks.push(chunk));
            file.on('end', () => {
                uploads[fieldname] = {
                    filename,
                    content: Buffer.concat(chunks),
                    contentType: mimeType,
                };
            });
        });

        busboy.on('field', (fieldname, val) => {
            fields[fieldname] = val;
        });

        busboy.on('finish', () => {
            resolve({ fields, uploads });
        });

        busboy.end(Buffer.from(event.body, 'base64'));
    });
}


exports.handler = async function(event) {
    
    try {
        const { fields, uploads } = await parseMultipartForm(event);
        const receiptFile = uploads['receipt_file'];

        const orderId = 'KH-' + Date.now().toString().slice(-6);

        // 1. Save to Supabase
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
        await supabase.from('orders').insert([{ 
            order_id: orderId,
            //... insert other fields from the `fields` object
        }]);

        // 2. Send emails via Resend
        const resend = new Resend(process.env.RESEND_API_KEY);
        const adminEmail = "your-email@gmail.com"; // 👈 Your email here

        // Email to Admin
        await resend.emails.send({
            from: 'Khadamatuk <onboarding@resend.dev>',
            to: adminEmail,
            subject: `طلب جديد #${orderId}`,
            html: `<h1>تفاصيل الطلب الجديد</h1>...`, // Add all details
            attachments: receiptFile ? [{ filename: receiptFile.filename, content: receiptFile.content }] : []
        });

        // Email to Customer
        // ... (The customer email code from the previous step)

        return {
            statusCode: 200,
            body: JSON.stringify({ orderId: orderId })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};