// Ravintosivun alustava toiminnallisuus
import { checkAuth, showToast } from './main.js';

// Varmistetaan, että käyttäjä on kirjautunut
if (!checkAuth()) {
  // Jos ei kirjautunut, main.js ohjaa kirjautumissivulle
  throw new Error('Ei kirjautunut sisään');
}

// DOM-elementit
const addMealBtn = document.getElementById('add-meal-btn');
const mealModal = document.getElementById('meal-modal');
const closeMealModalBtn = document.getElementById('close-meal-modal');
const closeDemoBtn = document.getElementById('close-demo-btn');

// Avaa esimerkki-modaali
function openMealModal() {
  if (mealModal) {
    mealModal.classList.add('show');
  }
}

// Sulje modaali
function closeMealModal() {
  if (mealModal) {
    mealModal.classList.remove('show');
  }
}

// Tapahtumankäsittelijät
document.addEventListener('DOMContentLoaded', () => {
  // Ravintosivun viesti
  showToast('Ravintoseuranta on tulossa pian! Tämä on esikatseluversio.', 'info');
  
  // Lisää ateria -nappi
  if (addMealBtn) {
    addMealBtn.addEventListener('click', () => {
      openMealModal();
    });
  }
  
  // Sulje modaali -napit
  if (closeMealModalBtn) {
    closeMealModalBtn.addEventListener('click', closeMealModal);
  }
  
  if (closeDemoBtn) {
    closeDemoBtn.addEventListener('click', closeMealModal);
  }
  
  // Sulje modaali, kun klikataan taustaa
  window.addEventListener('click', (e) => {
    if (e.target === mealModal) {
      closeMealModal();
    }
  });
});