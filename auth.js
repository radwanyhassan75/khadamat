// Firebase App configuration
const firebaseConfig = {
    apiKey: "AIzaSyBfuVxOgengj2b1JBdt9V3u5WAnyYWsd78",
    authDomain: "khadamatukdigital.firebaseapp.com",
    projectId: "khadamatukdigital",
    storageBucket: "khadamatukdigital.appspot.com",
    messagingSenderId: "690661888019",
    appId: "1:690661888019:web:8770076b69beda7d2d6fe6",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// دالة لتحديث واجهة المستخدم في الشريط العلوي
function updateHeaderUI(user) {
    const navbarActions = document.getElementById('navbar-actions');
    if (!navbarActions) return;

    let navHtml = '';
    if (user) {
        // حالة المستخدم مسجل دخوله
        const userName = user.displayName || 'مستخدم';
        const userAvatar = user.photoURL || 'https://placehold.co/40x40/0056b3/ffffff?text=U';
        navHtml = `
            <a href="dashboard.html" style="display: flex; align-items: center; gap: 10px; text-decoration: none; color: #2c3e50; font-weight: 700;">
                <img src="${userAvatar}" alt="${userName}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                <span>${userName}</span>
            </a>
            <a href="#" onclick="logoutUser()" style="padding: 8px 15px; background-color: #f0f0f0; color: #333; border-radius: 8px; text-decoration: none; font-weight: 700;">تسجيل الخروج</a>
        `;
    } else {
        // حالة المستخدم زائر
        navHtml = `
            <a href="login.html" style="padding: 8px 15px; background-color: #e7f1ff; color: #0056b3; border-radius: 8px; text-decoration: none; font-weight: 700;">تسجيل الدخول</a>
            <a href="register.html" style="padding: 8px 15px; background-color: #0056b3; color: white; border-radius: 8px; text-decoration: none; font-weight: 700;">إنشاء حساب</a>
        `;
    }
    navbarActions.innerHTML = navHtml;
}

// دالة تسجيل الخروج
function logoutUser() {
    auth.signOut().then(() => {
        window.location.href = "index.html";
    });
}

// الاستماع لتغير حالة تسجيل الدخول وتحديث الهيدر
auth.onAuthStateChanged(user => {
    updateHeaderUI(user);
});