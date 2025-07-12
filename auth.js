// This script will be included in all pages to manage the user's authentication state.

// 1. Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBfuVxOgengj2b1JBdt9V3u5WAnyYWsd78",
    authDomain: "khadamatukdigital.firebaseapp.com",
    projectId: "khadamatukdigital",
    storageBucket: "khadamatukdigital.appspot.com",
    messagingSenderId: "690661888019",
    appId: "1:690661888019:web:8770076b69beda7d2d6fe6",
};

// 2. Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
// const db = firebase.firestore(); // لا نحتاج قاعدة البيانات في هذا الملف

// 3. ✅ [مُصحح] Function to update the header based on user status
function updateHeaderUI(user) {
    const navbarActions = document.getElementById('navbar-actions');
    const mobileNavbarActions = document.getElementById('mobile-navbar-actions');
    
    if (!navbarActions) return;

    let desktopNavHtml = '';
    let mobileNavHtml = '';

    if (user) { // تم تبسيط الشرط ليعمل بمجرد تسجيل الدخول
        // --- حالة المستخدم مسجل دخوله ---
        const userName = user.displayName || 'مستخدم';
        const userAvatar = user.photoURL || 'https://placehold.co/40x40/0056b3/ffffff?text=U';
        
        // أزرار سطح المكتب
        desktopNavHtml = `
            <a href="dashboard.html" class="user-nav-link">
                <img src="${userAvatar}" alt="${userName}" class="user-avatar">
                <span>${userName}</span>
            </a>
            <a href="#" onclick="logoutUser()" class="btn btn-light" style="padding: 8px 15px;">تسجيل الخروج</a>
        `;
        
        // روابط القائمة في الجوال
        mobileNavHtml = `
            <li><a href="dashboard.html">لوحة التحكم</a></li>
            <li><a href="#" onclick="logoutUser()">تسجيل الخروج</a></li>
        `;
    } else {
        // --- حالة المستخدم زائر (غير مسجل دخوله) ---
        
        // أزرار سطح المكتب
        desktopNavHtml = `
            <a href="login.html" class="btn btn-light">تسجيل الدخول</a>
            <a href="register.html" class="btn btn-primary">إنشاء حساب</a>
        `;
        
        // روابط القائمة في الجوال
        mobileNavHtml = `
            <li><a href="login.html">تسجيل الدخول</a></li>
            <li><a href="register.html">إنشاء حساب</a></li>
        `;
    }

    navbarActions.innerHTML = desktopNavHtml;
    if (mobileNavbarActions) {
        mobileNavbarActions.innerHTML = mobileNavHtml;
    }
}

// 4. Listen for authentication state changes
auth.onAuthStateChanged(user => {
    updateHeaderUI(user);
});

// 5. Global Logout Function
function logoutUser() {
    if (confirm("هل أنت متأكد من أنك تريد تسجيل الخروج؟")) {
        auth.signOut().then(() => {
            window.location.href = "index.html";
        }).catch((error) => {
            console.error("Logout Error:", error);
        });
    }
}

// 6. Global Hamburger Menu Logic
document.addEventListener('DOMContentLoaded', () => {
    // --- هذا الجزء مخصص للهيدر الذي يحتوي على قائمة الهامبرغر ---
    const mainHeader = document.querySelector('.main-header');
    if(mainHeader) {
        const hamburger = mainHeader.querySelector('.hamburger-menu');
        const navMenu = mainHeader.querySelector('.navbar-menu');
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('mobile-active');
                const icon = hamburger.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-bars');
                    icon.classList.toggle('fa-times');
                }
            });
        }
    }
});