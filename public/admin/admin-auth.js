// =================================================================
//          ملف المصادقة للوحة التحكم (النسخة الديناميكية)
//          هذا الملف يدير جلسة الدخول ويتحقق من كلمة المرور من الخادم
// =================================================================

const API_URL = "https://orders-worker.radwanyhassan75.workers.dev";

async function handleLogin(e) {
    e.preventDefault();
    const passwordInput = document.getElementById('password-input');
    const passwordError = document.getElementById('password-error');
    
    try {
        // 1. جلب الإعدادات (بما في ذلك كلمة المرور) من الخادم
        const response = await fetch(`${API_URL}/settings`);
        if (!response.ok) throw new Error('فشل في الاتصال بالخادم.');
        
        const settings = await response.json();
        const correctPassword = settings.admin_password || '12345678'; // Use default if not set

        // 2. مقارنة كلمة المرور المدخلة مع الكلمة الصحيحة
        if (passwordInput.value === correctPassword) {
            sessionStorage.setItem('isAdminAuthenticated', 'true');
            passwordError.classList.add('hidden');
            
            document.getElementById('password-gate').style.display = 'none';
            document.getElementById('dashboard-content').style.display = 'flex';
            
            initializePage(); 
        } else {
            passwordError.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Login Error:", error);
        passwordError.textContent = 'حدث خطأ في الشبكة. يرجى المحاولة مرة أخرى.';
        passwordError.classList.remove('hidden');
    }
}

function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('isAdminAuthenticated') === 'true';
    const passwordGate = document.getElementById('password-gate');
    const dashboardContent = document.getElementById('dashboard-content');

    if (isAuthenticated) {
        passwordGate.style.display = 'none';
        dashboardContent.style.display = 'flex';
        initializePage();
    } else {
        passwordGate.style.display = 'flex';
        dashboardContent.style.display = 'none';
        document.getElementById('password-form').addEventListener('submit', handleLogin);
    }
}

document.addEventListener('DOMContentLoaded', checkAuth);
function initializePage() {
    // هنا يمكنك إضافة أي كود لتحديث الصفحة بعد تسجيل الدخول
    console.log("تم تسجيل الدخول بنجاح!");
    // على سبيل المثال، يمكنك تحميل البيانات أو تحديث الواجهة
}
// =================================================================
//          نهاية ملف المصادقة للوحة التحكم
// =================================================================