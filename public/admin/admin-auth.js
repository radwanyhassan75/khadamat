// =================================================================
//      ملف المصادقة للوحة التحكم (نسخة التشخيص لمعرفة سبب المشكلة)
// =================================================================

// 🔑 تأكد من أن معرّف المستخدم (UID) الخاص بك موجود هنا بشكل صحيح
const ADMIN_UIDS = [
    "mxNwy7nqQBRP5K582gi21TrIBW73" 
];

function denyAccess() {
    console.error("القرار النهائي: رفض الوصول.");
    document.body.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #dc3545;">
            <h1 style="font-size: 2rem; margin-top: 20px;">الوصول مرفوض</h1>
            <p style="font-size: 1.1rem;">أنت غير مصرح لك بالوصول إلى هذه الصفحة. سيتم إعادة توجيهك الآن.</p>
        </div>
    `;
    setTimeout(() => { window.location.href = '/index.html'; }, 5000);
}

function grantAccess() {
    console.log("القرار النهائي: تم منح الوصول. مرحبًا أيها المدير!");
    const dashboardContent = document.getElementById('dashboard-content');
    if (dashboardContent) {
        dashboardContent.style.display = 'flex'; // أو 'block'
    }
    if (typeof initializePage === 'function') {
        initializePage();
    }
}

function checkAdminAuth() {
    console.log("1. بدء عملية التحقق من هوية المدير...");

    if (typeof firebase === 'undefined' || typeof firebase.auth === 'undefined') {
        console.error("خطأ فادح: مكتبة Firebase لم يتم تحميلها.");
        denyAccess();
        return;
    }

    firebase.auth().onAuthStateChanged(user => {
        console.log("2. Firebase أعطى تحديثًا لحالة المستخدم...");

        if (user) {
            // المستخدم قام بتسجيل الدخول
            console.log("3. تم العثور على مستخدم مسجل دخوله.");
            console.log("   - الـ UID الذي يراه الموقع هو:", user.uid);
            console.log("   - قائمة المدراء المسموح لهم هي:", ADMIN_UIDS);

            if (ADMIN_UIDS.includes(user.uid)) {
                // نعم، هذا المستخدم هو مدير.
                console.log("4. نتيجة التحقق: UID متطابق. هذا المستخدم هو مدير.");
                grantAccess();
            } else {
                // قام بتسجيل الدخول، لكنه ليس مديرًا.
                console.error("4. نتيجة التحقق: UID غير متطابق. هذا المستخدم ليس مديرًا.");
                denyAccess();
            }
        } else {
            // المستخدم لم يقم بتسجيل الدخول.
            console.error("3. لم يتم العثور على أي مستخدم مسجل دخوله. إعادة التوجيه لصفحة الدخول...");
            window.location.href = `/login.html?redirect=${window.location.pathname}`;
        }
    });
}

document.addEventListener('DOMContentLoaded', checkAdminAuth);