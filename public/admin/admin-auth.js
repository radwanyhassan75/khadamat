// =================================================================
//          ملف المصادقة للوحة التحكم (النسخة الآمنة باستخدام Firebase)
// =================================================================

// 🔑 الخطوة 1: أضف معرّف المستخدم (UID) الخاص بك هنا
// يمكنك العثور على الـ UID الخاص بك في لوحة تحكم Firebase > قسم Authentication
// يمكن إضافة أكثر من مدير بفصلهم بفاصلة
const ADMIN_UIDS = [
    "mxNwy7nqQBRP5K582gi21TrIBW73", // <--- استبدل هذا بمعرّف حسابك!
    // "يمكنك-إضافة-معرف-مدير-آخر-هنا" 
];

/**
 * يخفي لوحة التحكم ويعيد التوجيه إلى الصفحة الرئيسية بعد 5 ثوانٍ.
 */
function denyAccess() {
    console.error("Access Denied. User is not an admin.");
    // إخفاء المحتوى فورًا
    const dashboardContent = document.getElementById('dashboard-content');
    if (dashboardContent) {
        dashboardContent.style.display = 'none';
    }

    // عرض رسالة الرفض
    const accessDeniedMessage = `
        <div style="text-align: center; padding: 40px; color: #dc3545;">
            <i class="fas fa-exclamation-triangle fa-3x"></i>
            <h1 style="font-size: 2rem; margin-top: 20px;">الوصول مرفوض</h1>
            <p style="font-size: 1.1rem;">أنت غير مصرح لك بالوصول إلى هذه الصفحة. سيتم إعادة توجيهك الآن.</p>
        </div>
    `;
    document.body.innerHTML = accessDeniedMessage;

    // إعادة التوجيه بعد 5 ثوانٍ
    setTimeout(() => {
        window.location.href = '/index.html'; // توجيه إلى الصفحة الرئيسية
    }, 5000);
}

/**
 * يعرض محتوى لوحة التحكم المخفي.
 */
function grantAccess() {
    console.log("Access Granted. Welcome Admin!");
    const passwordGate = document.getElementById('password-gate'); // قد لا يكون موجودًا، لكن نحذفه احتياطًا
    const dashboardContent = document.getElementById('dashboard-content');

    if (passwordGate) {
        passwordGate.style.display = 'none';
    }
    if (dashboardContent) {
        dashboardContent.style.display = 'block'; // أو 'flex' حسب تصميمك
    }
    
    // تشغيل أي دوال خاصة بالصفحة بعد التحقق من المصادقة
    if (typeof initializePage === 'function') {
        initializePage();
    }
}

/**
 * الوظيفة الرئيسية التي تتحقق من حالة مصادقة المستخدم عند تحميل الصفحة.
 */
function checkAdminAuth() {
    // التأكد من أن مكتبة Firebase قد تم تحميلها
    if (typeof firebase === 'undefined' || typeof firebase.auth === 'undefined') {
        console.error("Firebase is not loaded. Make sure Firebase scripts are included before this script.");
        denyAccess();
        return;
    }

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            // المستخدم قام بتسجيل الدخول
            // الآن، تحقق مما إذا كان UID الخاص به ضمن قائمة المدراء
            if (ADMIN_UIDS.includes(user.uid)) {
                // نعم، هذا المستخدم هو مدير. امنحه الوصول.
                grantAccess();
            } else {
                // قام بتسجيل الدخول، لكنه ليس مديرًا. ارفض الوصول.
                denyAccess();
            }
        } else {
            // المستخدم لم يقم بتسجيل الدخول. ارفض الوصول واطلب منه تسجيل الدخول.
            console.log("User is not logged in. Redirecting to login page.");
            // بدلاً من الرفض مباشرة، يمكنك توجيهه إلى صفحة تسجيل الدخول
            window.location.href = `/login.html?redirect=${window.location.pathname}`;
        }
    });
}

// ابدأ عملية التحقق بمجرد أن يصبح محتوى الصفحة جاهزًا.
document.addEventListener('DOMContentLoaded', checkAdminAuth);