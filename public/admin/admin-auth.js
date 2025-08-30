// File: admin-auth.js
// ✅ النسخة النهائية والمصححة بالكامل

// --- ⚠️ 1. معلومات Firebase الخاصة بك ---
const firebaseConfig = {
    apiKey: "AIzaSyBfuVxOgengj2b1JBdt9V3u5WAnyYWsd78",
    authDomain: "khadamatukdigital.firebaseapp.com",
    projectId: "khadamatukdigital",
    storageBucket: "khadamatukdigital.appspot.com",
    messagingSenderId: "690661888019",
    appId: "1:690661888019:web:8770076b69beda7d2d6fe6"
};

// --- ✅ 2. معلومات Supabase الصحيحة ---
const SUPABASE_URL = 'https://dlzmyxsycjzedhuqzvpg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsem15eHN5Y2p6ZWRodXF6dnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNTI5ODAsImV4cCI6MjA3MTcyODk4MH0.d8Mk01dOUWyOV3wLWM2NIYFzZhN_azr9S4kOZFA6ZvA';

// --- 3. الكود الخاص بالحماية ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// تهيئة الخدمات مرة واحدة
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// إخفاء محتوى الصفحة مؤقتًا حتى يتم التحقق
document.body.style.display = 'none';

onAuthStateChanged(auth, (user) => {
    if (user) {
        // المستخدم مسجل دخوله...
        
        // ربط هوية Firebase مع Supabase
        user.getIdToken().then((token) => {
            // نسلم "الهوية" إلى Supabase ليعرف من هو المستخدم
            supabaseClient.auth.setSession({ access_token: token });

            // الآن، بعد أن عرف Supabase هوية المدير، نقوم بإظهار الصفحة
            document.body.style.display = 'flex';
            
            // ✅ الأهم: نعطي الأمر للصفحة لتبدأ عملها وتحميل البيانات
            if (typeof initializePage === 'function') {
                initializePage(supabaseClient); 
            }
        });
    
    } else {
        // المستخدم ليس مسجلاً للدخول، قم بإعادة التوجيه فورًا
        window.location.href = 'admin-login.html';
    }
});