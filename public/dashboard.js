// public/dashboard.js - All logic for the user dashboard page

// Import the Supabase client from our central auth.js file
import { supabase } from './auth.js';

// This is the most important part: Wait for the entire page to be ready before running any code.
document.addEventListener('DOMContentLoaded', () => {

    let currentUser = null;

    // --- Tab switching logic ---
    const navLinks = document.querySelectorAll('.sidebar-nav a[data-target]');
    const contentPanes = document.querySelectorAll('.main-content .content-pane');
    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            navLinks.forEach(item => item.classList.remove('active'));
            contentPanes.forEach(pane => pane.classList.remove('active'));
            link.classList.add('active');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // --- Form submission logic ---
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageDiv = document.getElementById('profile-message');
        const submitButton = e.target.querySelector('button[type="submit"]');
        
        messageDiv.textContent = 'جارٍ الحفظ...';
        messageDiv.style.color = 'gray';
        submitButton.disabled = true;

        const newName = document.getElementById('edit-name').value;
        const newPhone = document.getElementById('edit-phone').value;

        // 1. Update data in the public.users table
        const { error: profileError } = await supabase.from('users').update({ full_name: newName, phone_number: newPhone }).eq('id', currentUser.id);
        // 2. Update data in auth metadata
        const { data: { user: updatedUser }, error: authError } = await supabase.auth.updateUser({ data: { full_name: newName } });

        if (profileError || authError) {
            messageDiv.textContent = 'حدث خطأ أثناء تحديث البيانات.';
            messageDiv.style.color = 'red';
            console.error(profileError || authError);
        } else {
            messageDiv.textContent = 'تم تحديث بياناتك بنجاح!';
            messageDiv.style.color = 'green';
            currentUser = updatedUser;
            await initializeDashboard(); // Reload all data to show changes
        }
        submitButton.disabled = false;
    });

    // --- Data loading and display logic ---
    function updateSidebar(user) {
        const userName = user.user_metadata.full_name || user.email;
        document.getElementById('sidebar-user-name').textContent = userName;
        document.getElementById('sidebar-user-avatar').src = user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0056b3&color=fff`;
    }

    async function loadProfileData(user) {
        document.getElementById('view-email').textContent = user.email;
        document.getElementById('edit-email').value = user.email;
        
        const { data: profile, error } = await supabase.from('users').select('full_name, phone_number').eq('id', user.id).single();
        if (error && error.code !== 'PGRST116') { // Ignore 'No rows found' error
            console.error("Error fetching profile:", error);
        }
        
        const fullName = profile?.full_name || user.user_metadata.full_name || '';
        const phone = profile?.phone_number || '';

        document.getElementById('view-name').textContent = fullName || 'لا يوجد';
        document.getElementById('view-phone').textContent = phone || 'لم يتم إضافته';
        document.getElementById('edit-name').value = fullName;
        document.getElementById('edit-phone').value = phone;
    }

    async function initializeDashboard() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
            window.location.replace('/login.html');
            return;
        }
        currentUser = session.user;
        updateSidebar(currentUser);
        await loadProfileData(currentUser);
    }

    // Initialize everything
    initializeDashboard();
});