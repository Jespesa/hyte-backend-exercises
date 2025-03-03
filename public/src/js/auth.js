// Kirjautumis- ja rekisteröintitoiminnallisuudet
import { login, register } from './api.js';
import { showToast, isLoggedIn } from './main.js';

// DOM-elementit
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginMessage = document.getElementById('login-message');
const registerMessage = document.getElementById('register-message');

// Tarkistetaan onko käyttäjä jo kirjautunut
function checkLoggedInStatus() {
    if (isLoggedIn()) {
        window.location.href = 'src/pages/dashboard.html';
    }
}

// Tab-toiminnallisuus
function setupTabs() {
    if (!loginTab || !registerTab) return;

    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    });

    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });
}

// Kirjautumislomakkeen käsittely
function setupLoginForm() {
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginMessage.textContent = '';
        loginMessage.classList.remove('error-message');

        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        if (!username || !password) {
            loginMessage.textContent = 'Täytä kaikki kentät';
            loginMessage.classList.add('error-message');
            return;
        }

        try {
            loginMessage.textContent = 'Kirjaudutaan...';
            const data = await login(username, password);
            
            loginMessage.textContent = 'Kirjautuminen onnistui!';
            loginMessage.classList.add('success-message');
            
            // Ohjataan käyttäjä dashboardille
            setTimeout(() => {
                window.location.href = 'src/pages/dashboard.html';
            }, 1000);
        } catch (error) {
            loginMessage.textContent = error.message || 'Kirjautuminen epäonnistui';
            loginMessage.classList.add('error-message');
        }
    });
}

// Rekisteröitymislomakkeen käsittely
function setupRegisterForm() {
    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        registerMessage.textContent = '';
        registerMessage.classList.remove('error-message');

        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;

        // Validointi
        if (!username || !email || !password || !passwordConfirm) {
            registerMessage.textContent = 'Täytä kaikki kentät';
            registerMessage.classList.add('error-message');
            return;
        }

        if (password !== passwordConfirm) {
            registerMessage.textContent = 'Salasanat eivät täsmää';
            registerMessage.classList.add('error-message');
            return;
        }

        if (password.length < 8) {
            registerMessage.textContent = 'Salasanan on oltava vähintään 8 merkkiä pitkä';
            registerMessage.classList.add('error-message');
            return;
        }

        if (username.length < 3) {
            registerMessage.textContent = 'Käyttäjätunnuksen on oltava vähintään 3 merkkiä pitkä';
            registerMessage.classList.add('error-message');
            return;
        }

        try {
            registerMessage.textContent = 'Rekisteröidään...';
            const data = await register(username, email, password);
            
            registerMessage.textContent = 'Rekisteröityminen onnistui! Voit nyt kirjautua sisään.';
            registerMessage.classList.add('success-message');
            
            // Tyhjennetään lomake
            registerForm.reset();
            
            // Siirrytään kirjautumistabiin
            setTimeout(() => {
                loginTab.click();
            }, 1500);
        } catch (error) {
            registerMessage.textContent = error.message || 'Rekisteröityminen epäonnistui';
            registerMessage.classList.add('error-message');
        }
    });
}

// Alustetaan toiminnallisuudet kun DOM on valmis
document.addEventListener('DOMContentLoaded', () => {
    checkLoggedInStatus();
    setupTabs();
    setupLoginForm();
    setupRegisterForm();
});