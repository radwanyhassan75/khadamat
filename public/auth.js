import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// استبدل هذه القيم بالقيم الخاصة بمشروعك في Supabase
const SUPABASE_URL = 'https://dlzmyxsycjzedhuqzvpg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsem15eHN5Y2p6ZWRodXF6dnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNTI5ODAsImV4cCI6MjA3MTcyODk4MH0.d8Mk01dOUWyOV3wLWM2NIYFzZhN_azr9S4kOZFA6ZvA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        detectSessionInUrl: true,
        autoRefreshToken: true,
        persistSession: true
    }
});

// --- دالة تسجيل الدخول عبر المزودين ---
window.signInWithProvider = async function(provider) {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: `${window.location.origin}/dashboard.html`, // صفحة التوجيه بعد النجاح
        }
    });
    if (error) {
        alert("فشل تسجيل الدخول: " + error.message);
    }
};

// --- المستمع الرئيسي لحالة المصادقة (المسؤول عن التوجيه) ---
supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user;
    
    const currentPage = window.location.pathname.split('/').pop();
    const isAuthPage = ['login.html', 'register.html', 'forgot-password.html'].includes(currentPage);
    const isProtectedPage = ['dashboard.html'].includes(currentPage); // أضف صفحاتك المحمية هنا

    // إذا كان المستخدم مسجلاً وهو في صفحة تسجيل دخول/إنشاء حساب، وجهه للوحة التحكم
    if (user && isAuthPage) {
        window.location.replace('/dashboard.html');
    }
    // إذا كان المستخدم غير مسجل ويحاول دخول صفحة محمية، وجهه لصفحة تسجيل الدخول
    else if (!user && isProtectedPage) {
        window.location.replace('/login.html');
    }
});