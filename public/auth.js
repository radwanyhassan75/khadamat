// =================================================================
// ملف المصادقة المركزي auth.js - النسخة النهائية والمكتملة
// =================================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// --- 1. إعدادات الاتصال ---
const SUPABASE_URL = 'https://dlzmyxsycjzedhuqzvpg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsem15eHN5Y2p6ZWRodXF6dnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNTI5ODAsImV4cCI6MjA3MTcyODk4MH0.d8Mk01dOUWyOV3wLWM2NIYFzZhN_azr9S4kOZFA6ZvA';

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
        // التأكد من عدم إضافة المستمع أكثر من مرة
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.replaceWith(logoutButton.cloneNode(true)); // إزالة المستمعين القدامى
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

// --- 5. دالة تسجيل الدخول عبر مزود خدمة (✅ تم إصلاحها بالكامل) ---
export async function signInWithProvider(provider) {
    // هذا هو السطر الأهم الذي كان مفقودًا
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: `${window.location.origin}/dashboard.html` // التوجيه بعد النجاح
        }
    });

    // إظهار الخطأ للمستخدم إذا فشلت العملية
    if (error) {
        alert("فشل في بدء عملية تسجيل الدخول: " + error.message);
        console.error("Supabase OAuth Error:", error);
    }
}

// --- 6. المستمع الرئيسي لحالة المصادقة ---
supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user || null;
    window.currentUser = user;
    updateHeaderUI(user);

    // إرسال إشارة بأن المصادقة جاهزة
    window.dispatchEvent(new Event('auth-ready'));

    const currentPage = window.location.pathname.split('/').pop();
    const protectedPages = ['dashboard.html', 'my-orders.html', 'complete-profile.html'];
    const publicPages = ['login.html', 'register.html', 'forgot-password.html'];

    // إذا كان المستخدم غير مسجل ويحاول الوصول لصفحة محمية
    if (!user && protectedPages.includes(currentPage)) {
        window.location.href = '/login.html';
        return;
    }
    
    // إذا نجحت عملية تسجيل الدخول (event === 'SIGNED_IN') وكان المستخدم في صفحة عامة
    if (user && publicPages.includes(currentPage) && event === 'SIGNED_IN') {
        window.location.href = '/dashboard.html';
    }
});