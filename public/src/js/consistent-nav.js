// Johdonmukainen navigaatio kaikille sivuille
document.addEventListener('DOMContentLoaded', () => {
    // Hae nykyisen sivun polku
    const currentPath = window.location.pathname;
    
    // Määritä aktiivinen sivu URLin perusteella
    let activePage = 'dashboard';
    
    if (currentPath.includes('diary.html')) {
        activePage = 'diary';
    } else if (currentPath.includes('stats.html')) {
        activePage = 'stats';
    } else if (currentPath.includes('goals.html')) {
        activePage = 'goals';
    } else if (currentPath.includes('medications.html')) {
        activePage = 'medications';
    } else if (currentPath.includes('exercises.html')) {
        activePage = 'exercises';
    } else if (currentPath.includes('nutrition.html')) {
        activePage = 'nutrition';
    } else if (currentPath.includes('profile.html')) {
        activePage = 'profile';
    }
    
    // Navigaatiolinkit sekä desktop- että mobiilinavigaatioon
    const navItems = [
        { id: 'dashboard', label: 'Etusivu', icon: 'fa-home', url: 'dashboard.html' },
        { id: 'diary', label: 'Merkinnät', icon: 'fa-book', url: 'diary.html' },
        { id: 'stats', label: 'Tilastot', icon: 'fa-chart-line', url: 'stats.html' },
        { id: 'goals', label: 'Tavoitteet', icon: 'fa-bullseye', url: 'goals.html' },
        { id: 'medications', label: 'Lääkitys', icon: 'fa-pills', url: 'medications.html' },
        { id: 'exercises', label: 'Liikunta', icon: 'fa-running', url: 'exercises.html' },
        { id: 'nutrition', label: 'Ravinto', icon: 'fa-utensils', url: 'nutrition.html' },
        { id: 'profile', label: 'Profiili', icon: 'fa-user', url: 'profile.html' },
        { id: 'logout', label: 'Kirjaudu ulos', icon: 'fa-sign-out-alt', url: '#', isAction: true }
    ];
    
    // Luo navigaatiolinkit desktopiin
    const desktopNav = document.querySelector('.main-nav ul');
    if (desktopNav) {
        desktopNav.innerHTML = '';
        
        navItems.forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            
            a.href = item.url;
            a.innerHTML = `<i class="fas ${item.icon}"></i> ${item.label}`;
            
            if (item.id === activePage) {
                a.classList.add('active');
            }
            
            if (item.id === 'logout') {
                a.id = 'logout-btn';
            }
            
            li.appendChild(a);
            desktopNav.appendChild(li);
        });
    }
    
    // Luo navigaatiolinkit mobiilinavigaatioon
    const mobileNav = document.querySelector('.mobile-nav ul');
    if (mobileNav) {
        mobileNav.innerHTML = '';
        
        navItems.forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            
            a.href = item.url;
            a.innerHTML = `<i class="fas ${item.icon}"></i> ${item.label}`;
            
            if (item.id === activePage) {
                a.classList.add('active');
            }
            
            if (item.id === 'logout') {
                a.id = 'mobile-logout-btn';
            }
            
            li.appendChild(a);
            mobileNav.appendChild(li);
        });
    }
    
    // Uloskirjautumistoiminnallisuus
    const logoutBtn = document.getElementById('logout-btn');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    // Uloskirjautumisfunktio
    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../index.html';
    }
});