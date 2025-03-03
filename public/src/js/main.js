// Yleiset toiminnallisuudet

// Tarkistetaan, onko käyttäjä kirjautunut sisään
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Ohjataan käyttäjä kirjautumissivulle, jos ei ole kirjautunut
function checkAuth() {
    if (!isLoggedIn()) {
        // Suhteellinen polku riippuu siitä, millä sivulla ollaan
        const isIndexPage = window.location.pathname.endsWith('index.html') || 
                           window.location.pathname.endsWith('/');
        
        if (!isIndexPage) {
            window.location.href = '../index.html';
        }
        return false;
    }
    return true;
}

// Uloskirjautuminen
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../index.html';
}

// Näytä toast-ilmoitus
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast';
    toast.classList.add(type);
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Päivämäärän formatointi
function formatDate(dateString) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fi-FI', options);
}

// Päivämäärän formatointi syötekenttään
function formatDateForInput(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Käyttäjänimen näyttäminen sivuilla
function displayUsername() {
    const userElement = document.getElementById('user-greeting');
    if (userElement) {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            userElement.textContent = `Hei, ${userData.username}!`;
        } catch (error) {
            console.error('Virhe käyttäjätietoja näytettäessä:', error);
            userElement.textContent = 'Tervetuloa!';
        }
    }
}

// Aseta uloskirjautumisen click-tapahtuma
function setupLogoutButton() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}

// Odota DOM:n latautumista
document.addEventListener('DOMContentLoaded', () => {
    // Tarkista, että kirjautuminen on voimassa (paitsi kirjautumissivulla)
    const isIndexPage = window.location.pathname.endsWith('index.html') || 
                        window.location.pathname.endsWith('/');
    
    if (!isIndexPage) {
        if (!checkAuth()) {
            return;
        }
        
        // Näytä käyttäjänimi
        displayUsername();
        
        // Aseta uloskirjautumisen click-tapahtuma
        setupLogoutButton();
    }
});

// Vie funktiot moduuleina
export {
    isLoggedIn,
    checkAuth,
    logout,
    showToast,
    formatDate,
    formatDateForInput,
    displayUsername
};