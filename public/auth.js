// =================================================================
//      ملف المصادقة والإعدادات المركزي - auth.js (إصدار Supabase)
//      يقوم بإدارة جلسات المستخدم، تحديث الواجهة، والتوجيه
// =================================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// --- 1. إعدادات الاتصال ---
const SUPABASE_URL = 'https://dlzmyxsycjzedhuqzvpg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsem15eHN5Y2p6ZWRodXF6dnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNTI5ODAsImV4cCI6MjA3MTcyODk4MH0.d8Mk01dOUWyOV3wLWM2NIYFzZhN_azr9S4kOZFA6ZvA';

// --- 2. تهيئة الخدمات والمتغيرات العامة ---
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabase = supabase; // جعل العميل متاحاً لجميع الصفحات
window.currentUser = null;
window.authReady = false; // إشارة بأن التحقق من المستخدم قد تم

// --- 3. دالة تحديث واجهة المستخدم (القائمة العلوية) ---
function updateHeaderUI(user) {
    const navbarActions = document.getElementById('navbar-actions');
    if (!navbarActions) return;

    if (user) {
        // المستخدم مسجل دخوله
        navbarActions.innerHTML = `
            <a href="dashboard.html" class="btn btn-primary">لوحة التحكم</a>
            <button onclick="window.logoutUser()" class="btn btn-secondary">تسجيل الخروج</button>
        `;
    } else {
        // المستخدم زائر
        navbarActions.innerHTML = `
            <a href="login.html" class="btn btn-secondary">تسجيل الدخول</a>
            <a href="register.html" class="btn btn-primary">إنشاء حساب</a>
        `;
    }
}

// --- 4. دوال المصادقة العامة ---

/**
 * تسجيل الدخول باستخدام منصة خارجية (Google, Facebook, etc.)
 * @param {string} provider - اسم المنصة (e.g., 'google')
 */
window.signInWithProvider = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: window.location.origin // يعود إلى الصفحة الرئيسية بعد المصادقة
        }
    });
    if (error) {
        console.error(`Error signing in with ${provider}:`, error);
        // يمكنك عرض رسالة خطأ للمستخدم هنا إذا لزم الأمر
    }
};

/**
 * تسجيل الخروج من الحساب
 */
window.logoutUser = async function() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("خطأ أثناء تسجيل الخروج:", error);
    } else {
        // التوجيه إلى الصفحة الرئيسية بعد تسجيل الخروج بنجاح
        window.location.href = "index.html";
    }
};

// --- 5. المستمع الرئيسي لحالة المصادقة (أهم جزء) ---
supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user || null;
    window.currentUser = user;
    updateHeaderUI(user);

    // إرسال إشارة بأن المصادقة جاهزة بعد أول تحقق
    if (!window.authReady) {
        window.authReady = true;
        // هذا الحدث المخصص يسمح للصفحات الأخرى بالانتظار حتى اكتمال التحقق
        window.dispatchEvent(new Event('auth-ready'));
    }

    // منطق التوجيه بعد تسجيل الدخول بنجاح
    if (event === 'SIGNED_IN') {
        const currentPage = window.location.pathname.split('/').pop();
        // إذا كان المستخدم في صفحة تسجيل الدخول أو إنشاء حساب، قم بتوجيهه
        if (['login.html', 'register.html'].includes(currentPage)) {
            window.location.href = 'dashboard.html';
        }
    }
});

