// =================================================================
//          ملف المصادقة للوحة التحكم (النسخة الآمنة)
// =================================================================

const API_URL = "https://orders-worker.radwanyhassan75.workers.dev";

/**
 * This function is called when the user submits the password form.
 */
async function handleLogin(e) {
    e.preventDefault();
    const passwordInput = document.getElementById('password-input');
    const passwordError = document.getElementById('password-error');
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    submitButton.disabled = true;
    passwordError.classList.add('hidden');

    try {
        // 1. Fetch settings (including the password) from the server
        const response = await fetch(`${API_URL}/settings`);
        if (!response.ok) throw new Error('فشل في الاتصال بالخادم.');
        
        const settings = await response.json();
        const correctPassword = settings.admin_password || '12345678'; // Fallback for safety

        // 2. Compare the entered password with the correct one
        if (passwordInput.value === correctPassword) {
            sessionStorage.setItem('isAdminAuthenticated', 'true');
            showContent();
        } else {
            passwordError.textContent = 'كلمة المرور غير صحيحة.';
            passwordError.classList.remove('hidden');
            submitButton.disabled = false;
        }
    } catch (error) {
        console.error("Login Error:", error);
        passwordError.textContent = 'حدث خطأ في الشبكة. يرجى المحاولة مرة أخرى.';
        passwordError.classList.remove('hidden');
        submitButton.disabled = false;
    }
}

/**
 * This function shows the main dashboard content and hides the password gate.
 */
function showContent() {
    document.getElementById('password-gate').style.display = 'none';
    document.getElementById('dashboard-content').style.display = 'flex';
    
    // Check if the page-specific initialization function exists before calling it.
    if (typeof initializePage === 'function') {
        initializePage();
    } else {
        console.warn('initializePage function is not defined for this page.');
    }
}

/**
 * This is the main function that runs on every page load to check authentication.
 */
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('isAdminAuthenticated') === 'true';

    if (isAuthenticated) {
        showContent();
    } else {
        // If not authenticated, ensure the password gate is visible and content is hidden.
        document.getElementById('password-gate').style.display = 'flex';
        document.getElementById('dashboard-content').style.display = 'none';
        
        const passwordForm = document.getElementById('password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', handleLogin);
        }
    }
}

// Run the authentication check as soon as the DOM is ready.
document.addEventListener('DOMContentLoaded', checkAuth);
