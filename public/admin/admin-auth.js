// File: admin-auth.js
// This script acts as a security guard for all admin pages.

(async function() {
    // These must be defined before this script is included
    if (typeof supabase === 'undefined' || typeof supabase.createClient === 'undefined') {
        console.error("Supabase client is not initialized. Make sure to include the Supabase library first.");
        return;
    }

    const SUPABASE_URL = 'https://dlzmyxsycjzedhuqzvpg.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsem15eHN5Y2p6ZWRodXF6dnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNTI5ODAsImV4cCI6MjA3MTcyODk4MH0.d8Mk0_azr9S4kOZFA6ZvA';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // ✅ تحديث: التحقق أولاً مما إذا كان هذا رابط لإعادة تعيين كلمة المرور
    const hash = window.location.hash;
    const isPasswordRecovery = hash.includes('access_token=') && hash.includes('type=recovery');

    if (isPasswordRecovery) {
        // هذا رابط إعادة تعيين كلمة مرور.
        // يجب أن تحتوي الصفحة الحالية (مثل admin-login.html) على نموذج لتحديث كلمة المرور.
        // سنتوقف هنا لمنع إعادة التوجيه.
        console.log("Password recovery link detected. Auth script will not redirect.");
        
        // استدعاء دالة خاصة لإعادة التعيين إذا كانت موجودة
        if (typeof handlePasswordRecovery === 'function') {
            handlePasswordRecovery(supabaseClient);
        }
        return; 
    }

    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session) {
        // إذا لم يكن المستخدم مسجلاً للدخول، ولم يكن رابط إعادة تعيين، قم بإعادة التوجيه.
        window.location.href = 'admin-login.html';
        return;
    }
    
    // إذا كان المستخدم مسجلاً، نفترض أنه المدير.
    // الحماية الحقيقية تتم عبر قوانين RLS في قاعدة البيانات.
    
    // إذا كانت الصفحة تحتوي على دالة تهيئة، قم باستدعائها.
    if (typeof initializePage === 'function') {
        initializePage(supabaseClient);
    }
})();
