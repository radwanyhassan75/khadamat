document.addEventListener('DOMContentLoaded', () => {

    const header = document.querySelector('.main-header');
    const hamburger = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.navbar-menu');

    // Make header background solid on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
            header.classList.remove('transparent');
        } else {
            header.classList.remove('scrolled');
            header.classList.add('transparent');
        }
    });

    // Toggle mobile menu
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('mobile-active');
        const icon = hamburger.querySelector('i');
        if (icon.classList.contains('fa-bars')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

});