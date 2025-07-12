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
const db = firebase.firestore();

// 3. Function to update the header based on user status
function updateHeaderUI(user) {
    const navbarActions = document.getElementById('navbar-actions');
    const mobileNavbarActions = document.getElementById('mobile-navbar-actions'); // For mobile menu
    
    if (!navbarActions) return; // Exit if the header elements don't exist on the page

    let desktopNavHtml = '';
    let mobileNavHtml = '';

    if (user && user.emailVerified) {
        // User is logged in
        const userName = user.displayName || 'مستخدم';
        const userAvatar = user.photoURL || 'https://placehold.co/40x40/e0e0e0/555?text=U';
        
        desktopNavHtml = `
            <a href="dashboard.html" class="user-nav-link">
                <img src="${userAvatar}" alt="${userName}" class="user-avatar">
                <span>${userName}</span>
            </a>
            <a href="#" onclick="logoutUser()" class="btn btn-primary">تسجيل الخروج</a>
      
        `;
    } else {
        // User is not logged in
        
        
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
    const hamburger = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.navbar-menu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('mobile-active');
            const icon = hamburger.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }
});
