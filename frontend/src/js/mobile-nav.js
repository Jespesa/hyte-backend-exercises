// Mobiilinavigaation toiminnallisuus
document.addEventListener('DOMContentLoaded', () => {
    // DOM-elementit
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavClose = document.getElementById('mobile-nav-close');
    const mobileNavBackdrop = document.getElementById('mobile-nav-backdrop');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

    // Avaa mobiilivalikko
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            mobileNav.classList.add('active');
            mobileNavBackdrop.classList.add('active');
            document.body.style.overflow = 'hidden'; // Estä sivun vieritys
        });
    }
    
    // Sulje mobiilivalikko
    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', closeMobileNav);
    }
    
    // Sulje mobiilivalikko taustaa klikattaessa
    if (mobileNavBackdrop) {
        mobileNavBackdrop.addEventListener('click', closeMobileNav);
    }
    
    // Uloskirjautuminen mobiilivalikosta
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '../index.html';
        });
    }
    
    // Sulje mobiilivalikko
    function closeMobileNav() {
        if (mobileNav) mobileNav.classList.remove('active');
        if (mobileNavBackdrop) mobileNavBackdrop.classList.remove('active');
        document.body.style.overflow = ''; // Palauta vieritys
    }
});