// =================================================================
// ملف المصادقة والإعدادات المركزي - auth.js (النسخة النهائية)
// =================================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// --- 1. إعدادات الاتصال ---
const SUPABASE_URL = 'https://dlzmyxsycjzedhuqzvpg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsem15eHN5Y2p6ZWRodXF6dnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNTI5ODAsImV4cCI6MjA3MTcyODk4MH0.d8Mk01dOUWyOV3wLWM2NIYFzZhN_azr9S4kOZFA6ZvA';

// --- 2. تهيئة العميل ---
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        detectSessionInUrl: true,
        autoRefreshToken: true,
        persistSession: true
    }
});

// --- 3. جعل الدوال متاحة عالميًا ---
window.supabase = supabase;
window.currentUser = null;

// --- 4. تحديث واجهة المستخدم (الهيدر) ---
function updateHeaderUI(user) {
    const navbarActions = document.getElementById('navbar-actions');
    if (!navbarActions) return;

    if (user) {
        navbarActions.innerHTML = `
            <a href="dashboard.html" class="btn btn-primary">لوحة التحكم</a>
            <button id="logout-button" class="btn btn-secondary">تسجيل الخروج</button>
        `;
        // ربط زر تسجيل الخروج بالدالة الخاصة به
        document.getElementById('logout-button').addEventListener('click', () => {
            supabase.auth.signOut().then(() => {
                window.location.href = "/index.html";
            });
        });
    } else {
        navbarActions.innerHTML = `
            <a href="login.html" class="btn btn-secondary">تسجيل الدخول</a>
            <a href="register.html" class="btn btn-primary">إنشاء حساب</a>
        `;
    }
}

// --- 5. دالة تسجيل الدخول عبر مزود خدمة (مثل جوجل) ---
export async function signInWithProvider(provider) {
    await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: `${window.location.origin}/dashboard.html`
        }
    });
}

// --- 6. المستمع الرئيسي لحالة المصادقة ---
supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user || null;
    window.currentUser = user; 
    updateHeaderUI(user);
    
    // إرسال إشارة بأن المصادقة جاهزة لتستخدمها الصفحات الأخرى
    window.dispatchEvent(new Event('auth-ready'));

    const currentPage = window.location.pathname.split('/').pop();

    // التوجيه إلى لوحة التحكم فقط إذا كان المستخدم مسجل دخوله وليس في الصفحات المحمية أو صفحة التأكيد
    if (user && !['dashboard.html', 'confirmation.html'].includes(currentPage)) {
         // التحقق من أننا لسنا بالفعل في طور التوجيه لتجنب الحلقات اللانهائية
        if (window.location.pathname !== '/dashboard.html') {
             window.location.href = '/dashboard.html';
        }
    }
});

