// =================================================================
// ملف المصادقة للوحة التحكم (النسخة الاحترافية والآمنة)
// This version uses a secure, server-side check to determine if a
// user is an admin, instead of an insecure hardcoded list.
// =================================================================

// The URL of your deployed worker
const WORKER_URL = 'https://orders-worker.radwanyhassan75.workers.dev';

function denyAccess() {
    console.error("Access Denied: User is not an admin.");
    document.body.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #dc3545; font-family: 'Cairo', sans-serif;">
            <h1 style="font-size: 2rem; margin-top: 20px;">الوصول مرفوض</h1>
            <p style="font-size: 1.1rem;">أنت غير مصرح لك بالوصول إلى هذه الصفحة.</p>
        </div>
    `;
    setTimeout(() => { window.location.href = '/index.html'; }, 4000);
}

function grantAccess(callback) {
    console.log("Access Granted: Welcome Admin!");
    const dashboardContent = document.getElementById('dashboard-content');
    if (dashboardContent) {
        // Use 'flex' or 'block' depending on your layout
        dashboardContent.style.display = 'flex'; 
    }
    // If the page has an initialization function, call it
    if (typeof callback === 'function') {
        callback();
    }
}

async function checkAdminRole(user) {
    try {
        // This securely asks our worker if the user is an admin
        const response = await fetch(`${WORKER_URL}/api/users/${user.uid}/status`);
        if (!response.ok) {
            console.error("Server responded with an error when checking admin status.");
            return false;
        }
        const data = await response.json();
        return data.isAdmin === true;
    } catch (error) {
        console.error("Error connecting to the server to check admin status:", error);
        return false;
    }
}

function checkAdminAuth(pageInitializationFunction) {
    console.log("Starting professional authentication check...");

    if (typeof firebase === 'undefined' || typeof firebase.auth === 'undefined') {
        console.error("Fatal Error: Firebase library not loaded.");
        denyAccess();
        return;
    }

    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            console.log("User is signed in. Verifying admin role with server...");
            const isAdmin = await checkAdminRole(user);
            
            if (isAdmin) {
                console.log("Server confirmed: User is an admin.");
                grantAccess(pageInitializationFunction);
            } else {
                console.error("Server confirmed: User is NOT an admin.");
                denyAccess();
            }
        } else {
            console.log("User is not signed in. Redirecting to login...");
            const redirectUrl = `/login.html?redirect=${window.location.pathname}${window.location.search}`;
            window.location.href = redirectUrl;
        }
    });
}

// This line allows pages to call the checkAdminAuth function
// For example, in your admin pages, you should have a script that calls:
// document.addEventListener('DOMContentLoaded', () => {
//     checkAdminAuth(initializePage); // where initializePage is your page's main function
// });
