import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://dlzmyxsycjzedhuqzvpg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsem15eHN5Y2p6ZWRodXF6dnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNTI5ODAsImV4cCI6MjA3MTcyODk4MH0.d8Mk01dOUWyOV3wLWM2NIYFzZhN_azr9S4kOZFA6ZvA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        detectSessionInUrl: true,
        autoRefreshToken: true,
        persistSession: true
    }
});

window.supabase = supabase;

// --- دالة تسجيل الدخول عبر المزودين ---
window.signInWithProvider = async function(provider) {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: `${window.location.origin}/dashboard.html`,
            queryParams: provider === 'google' ? { prompt: 'select_account' } : {}
        }
    });
    if (error) {
        alert("فشل تسجيل الدخول: " + error.message);
    }
};

// --- المستمع الرئيسي لحالة المصادقة (المسؤول عن كل شيء) ---
supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user;
    const navbarActions = document.getElementById('navbar-actions');
    if (!navbarActions) return;

    // 1. تحديث أزرار الهيدر
    if (user) {
        navbarActions.innerHTML = `<a href="dashboard.html" class="btn btn-primary">لوحة التحكم</a> <button id="logout-button" class="btn btn-secondary">تسجيل الخروج</button>`;
        const logoutButton = document.getElementById('logout-button');
        if(logoutButton) {
            logoutButton.addEventListener('click', () => supabase.auth.signOut().then(() => window.location.href = "/index.html"));
        }
    } else {
        navbarActions.innerHTML = `<a href="login.html" class="btn btn-secondary">تسجيل الدخول</a><a href="register.html" class="btn btn-primary">إنشاء حساب</a>`;
    }

    // 2. منطق إعادة التوجيه المركزي (هذا هو الحل لمشكلة الحلقة اللانهائية)
    const currentPage = window.location.pathname.split('/').pop();
    const isAuthPage = ['login.html', 'register.html', 'forgot-password.html'].includes(currentPage);
    const isProtectedPage = ['dashboard.html'].includes(currentPage);

    // إذا كان المستخدم مسجلاً وهو في صفحة تسجيل دخول، وجهه للوحة التحكم
    if (user && isAuthPage) {
        // استخدام replace يمنع المستخدم من العودة للصفحة السابقة بالضغط على زر "الخلف"
        window.location.replace('/dashboard.html');
    }
    // إذا كان المستخدم غير مسجل ويحاول دخول صفحة محمية، وجهه لصفحة تسجيل الدخول
    else if (!user && isProtectedPage) {
        window.location.replace('/login.html');
    }
});