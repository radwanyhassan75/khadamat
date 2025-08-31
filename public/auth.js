// =================================================================
// ملف المصادقة والإعدادات المركزي - auth.js (النسخة النهائية والمصححة)
// =================================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// --- 1. إعدادات الاتصال ---
const SUPABASE_URL = 'https://dlzmyxsycjzedhuqzvpg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsem15eHN5Y2p6ZWRodXF6dnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNTI5ODAsImV4cCI6MjA3MTcyODk4MH0.d8Mk01dOUWyOV3wLWM2NIYFzZhN_azr9S4kOZFA6ZvA';

// --- 2. تهيئة العميل مع الخيارات الصحيحة ---
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        detectSessionInUrl: true 
    }
});

// --- 3. جعل العميل والدوال متاحة عالميًا ---
window.supabase = supabase;
window.currentUser = null;

/**
 * ✅ EXPORTED: تسجيل الدخول باستخدام منصة خارجية (Google, Facebook, etc.)
 * الآن يمكن استيراد هذه الدالة في الصفحات الأخرى
 */
export async function signInWithProvider(provider) {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: window.location.origin
        }
    });
    if (error) {
        console.error(`Error with ${provider} sign in:`, error.message);
        alert(`حدث خطأ أثناء محاولة تسجيل الدخول عبر ${provider}.`);
    }
};

/**
 * تسجيل الخروج من الحساب
 */
window.logoutUser = async function() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("خطأ أثناء تسجيل الخروج:", error.message);
    } else {
        window.location.href = "/index.html";
    }
};

/**
 * دالة تحديث واجهة المستخدم (القائمة العلوية)
 */
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

// --- 4. المستمع الرئيسي لحالة المصادقة ---
supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user || null;
    window.currentUser = user;
    updateHeaderUI(user);

    if (event === 'SIGNED_IN' && !window.location.pathname.includes('dashboard.html')) {
        window.location.href = '/dashboard.html';
    }
});

