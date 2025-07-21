// هذا الملف مسؤول عن التحقق من كلمة المرور وإدارة جلسة الدخول

function handleLogin(e) {
    e.preventDefault();
    const passwordInput = document.getElementById('password-input');
    const passwordError = document.getElementById('password-error');
    
    // كلمة المرور الصحيحة
    if (passwordInput.value === '12345678') {
        // عند نجاح الدخول، نقوم بتخزين حالة المصادقة في "جلسة المتصفح"
        // هذه المعلومة ستبقى طالما أن نافذة المتصفح مفتوحة
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        passwordError.classList.add('hidden');
        
        // إخفاء شاشة الدخول وإظهار محتوى الصفحة
        document.getElementById('password-gate').style.display = 'none';
        document.getElementById('dashboard-content').style.display = 'flex';
        
        // استدعاء الدالة الخاصة بتهيئة هذه الصفحة (سيتم تعريفها في كل صفحة)
        initializePage(); 
    } else {
        passwordError.classList.remove('hidden');
    }
}

function checkAuth() {
    // عند تحميل أي صفحة، نتحقق أولاً من وجود جلسة دخول نشطة
    const isAuthenticated = sessionStorage.getItem('isAdminAuthenticated') === 'true';
    const passwordGate = document.getElementById('password-gate');
    const dashboardContent = document.getElementById('dashboard-content');

    if (isAuthenticated) {
        // إذا كان المستخدم قد سجل دخوله بالفعل، نظهر محتوى الصفحة مباشرة
        passwordGate.style.display = 'none';
        dashboardContent.style.display = 'flex';
        initializePage();
    } else {
        // إذا لم يكن هناك جلسة، نظهر شاشة الدخول وننتظر إدخال كلمة المرور
        passwordGate.style.display = 'flex';
        dashboardContent.style.display = 'none';
        document.getElementById('password-form').addEventListener('submit', handleLogin);
    }
}

// تشغيل دالة التحقق بمجرد أن تكون الصفحة جاهزة
document.addEventListener('DOMContentLoaded', checkAuth);
