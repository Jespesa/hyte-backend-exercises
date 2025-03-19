// Käyttäjäprofiilin hallinta
import { getUserInfo, updateUserInfo, deleteAccount, getEntries } from './api.js';
import { checkAuth, showToast, formatDate } from './main.js';

// Varmistetaan, että käyttäjä on kirjautunut
if (!checkAuth()) {
    // Jos ei kirjautunut, main.js ohjaa kirjautumissivulle
    throw new Error('Ei kirjautunut sisään');
}

// DOM-elementit
const profileForm = document.getElementById('profile-form');
const passwordForm = document.getElementById('password-form');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const accountUsername = document.getElementById('account-username');
const accountEmail = document.getElementById('account-email');
const accountLevel = document.getElementById('account-level');
const accountCreated = document.getElementById('account-created');
const entriesCountEl = document.getElementById('entries-count');
const deleteAccountBtn = document.getElementById('delete-account-btn');
const deleteModal = document.getElementById('delete-modal');
const closeDeleteModalBtn = document.getElementById('close-delete-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const deleteAccountForm = document.getElementById('delete-account-form');

// Hae käyttäjätiedot
async function fetchUserInfo() {
    try {
        const user = await getUserInfo();
        
        // Täytä lomake käyttäjätiedoilla
        if (usernameInput) usernameInput.value = user.username;
        if (emailInput) emailInput.value = user.email;
        
        // Täytä tilin tiedot
        if (accountUsername) accountUsername.textContent = user.username;
        if (accountEmail) accountEmail.textContent = user.email;
        if (accountLevel) accountLevel.textContent = user.user_level || 'regular';
        if (accountCreated) accountCreated.textContent = formatDate(user.created_at);
        
        // Tallennetaan käyttäjä lokaaliin muistiin
        localStorage.setItem('user', JSON.stringify(user));
        
        // Hae merkintöjen määrä
        fetchEntriesCount();
        
        return user;
    } catch (error) {
        console.error('Virhe käyttäjätietojen hakemisessa:', error);
        showToast('Käyttäjätietojen hakeminen epäonnistui', 'error');
    }
}

// Hae merkintöjen määrä
async function fetchEntriesCount() {
    try {
        const entries = await getEntries();
        
        if (entriesCountEl) {
            entriesCountEl.textContent = entries.length;
        }
    } catch (error) {
        console.error('Virhe merkintöjen hakemisessa:', error);
        if (entriesCountEl) {
            entriesCountEl.textContent = '-';
        }
    }
}

// Päivitä käyttäjätiedot
async function updateProfile(formData) {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        
        // Käyttäjän päivitystiedot
        const userData = {
            email: formData.get('email')
        };
        
        // Päivitä käyttäjätiedot
        await updateUserInfo(user.user_id, userData);
        
        // Päivitä käyttäjätiedot lokaalissa muistissa
        user.email = userData.email;
        localStorage.setItem('user', JSON.stringify(user));
        
        // Päivitä näkymä
        await fetchUserInfo();
        
        showToast('Käyttäjätiedot päivitetty', 'success');
    } catch (error) {
        console.error('Virhe käyttäjätietojen päivittämisessä:', error);
        showToast('Käyttäjätietojen päivittäminen epäonnistui', 'error');
    }
}

// Vaihda salasana
async function changePassword(formData) {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const currentPassword = formData.get('current-password');
        const newPassword = formData.get('new-password');
        const confirmPassword = formData.get('confirm-password');
        
        // Tarkista, että uudet salasanat täsmäävät
        if (newPassword !== confirmPassword) {
            showToast('Uudet salasanat eivät täsmää', 'error');
            return;
        }
        
        // Tarkista, että uusi salasana on tarpeeksi pitkä
        if (newPassword.length < 8) {
            showToast('Uuden salasanan on oltava vähintään 8 merkkiä pitkä', 'error');
            return;
        }
        
        // Päivitä salasana
        await updateUserInfo(user.user_id, {
            password: newPassword
        });
        
        // Tyhjennä lomake
        passwordForm.reset();
        
        showToast('Salasana vaihdettu', 'success');
    } catch (error) {
        console.error('Virhe salasanan vaihtamisessa:', error);
        showToast('Salasanan vaihtaminen epäonnistui', 'error');
    }
}

// Näytä tilinpoisto-dialogi
function showDeleteAccountModal() {
    deleteModal.classList.add('show');
}

// Piilota tilinpoisto-dialogi
function hideDeleteAccountModal() {
    deleteModal.classList.remove('show');
}

// Poista käyttäjätili
async function removeAccount(formData) {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        
        // Poista käyttäjätili
        await deleteAccount(user.user_id);
        
        // Poista token ja käyttäjätiedot lokaalista muistista
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        showToast('Käyttäjätili poistettu', 'success');
        
        // Ohjaa käyttäjä kirjautumissivulle
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
    } catch (error) {
        console.error('Virhe käyttäjätilin poistamisessa:', error);
        showToast('Käyttäjätilin poistaminen epäonnistui', 'error');
    }
}

// Tapahtumankäsittelijät
document.addEventListener('DOMContentLoaded', () => {
    // Hae käyttäjätiedot
    fetchUserInfo();
    
    // Profiilitietojen päivitys
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(profileForm);
            await updateProfile(formData);
        });
    }
    
    // Salasanan vaihto
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(passwordForm);
            await changePassword(formData);
        });
    }
    
    // Tilin poisto
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', showDeleteAccountModal);
    }
    
    if (closeDeleteModalBtn) {
        closeDeleteModalBtn.addEventListener('click', hideDeleteAccountModal);
    }
    
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', hideDeleteAccountModal);
    }
    
    if (deleteAccountForm) {
        deleteAccountForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(deleteAccountForm);
            await removeAccount(formData);
        });
    }
    
    // Sulje modaali, kun klikataan taustaa
    window.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            hideDeleteAccountModal();
        }
    });
});