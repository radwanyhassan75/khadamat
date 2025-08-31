// =================================================================
// ملف المصادقة المركزي auth.js - النسخة النهائية (معالجة حلقة التوجيه)
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

// --- 4. تحديث واجهة المستخدم (الهيدر) ---
function updateHeaderUI(user) {
    const navbarActions = document.getElementById('navbar-actions');
    if (!navbarActions) return;

    if (user) {
        navbarActions.innerHTML = `
            <a href="dashboard.html" class="btn btn-primary">لوحة التحكم</a>
            <button id="logout-button" class="btn btn-secondary">تسجيل الخروج</button>
        `;
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            // استبدال الزر بنسخة منه لإزالة أي مستمعين قدامى ومنع تكرارهم
            logoutButton.replaceWith(logoutButton.cloneNode(true));
            document.getElementById('logout-button').addEventListener('click', () => {
                supabase.auth.signOut().then(() => {
                    window.location.href = "/index.html";
                });
            });
        }
    } else {
        navbarActions.innerHTML = `
            <a href="login.html" class="btn btn-secondary">تسجيل الدخول</a>
            <a href="register.html" class="btn btn-primary">إنشاء حساب</a>
        `;
    }
}

// --- 5. دالة تسجيل الدخول عبر مزود خدمة ---
export async function signInWithProvider(provider) {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: { redirectTo: `${window.location.origin}/dashboard.html` }
    });
    if (error) alert("فشل تسجيل الدخول: " + error.message);
}

// --- 6. المستمع الرئيسي لحالة المصادقة (✅ تم إصلاحه بالكامل) ---
supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user || null;
    updateHeaderUI(user);

    const currentPage = window.location.pathname.split('/').pop();
    const isProtectedPage = ['dashboard.html', 'my-orders.html', 'complete-profile.html'].includes(currentPage);
    const isAuthPage = ['login.html', 'register.html'].includes(currentPage);

    // الحالة الأولى: المستخدم مسجل دخوله وهو في صفحة تسجيل الدخول أو إنشاء حساب
    // الحل: وجهه إلى لوحة التحكم
    if (user && isAuthPage) {
        window.location.href = '/dashboard.html';
        return;
    }

    // الحالة الثانية: المستخدم غير مسجل ويحاول الوصول لصفحة محمية
    // الحل: وجهه إلى صفحة تسجيل الدخول
    if (!user && isProtectedPage) {
        window.location.href = '/login.html';
        return;
    }

    // في جميع الحالات الأخرى، لا تفعل شيئًا لمنع حلقة التوجيه
});