// Lääkitys-sivun toiminnallisuudet
import { checkAuth, showToast, formatDate, formatDateForInput } from './main.js';
import { 
  getMedications, 
  getMedicationById, 
  addMedication, 
  updateMedication, 
  deleteMedication, 
  getActiveMedications 
} from './api-medications.js';

// Varmistetaan, että käyttäjä on kirjautunut
if (!checkAuth()) {
  // Jos ei kirjautunut, main.js ohjaa kirjautumissivulle
  throw new Error('Ei kirjautunut sisään');
}

// Globaalit muuttujat
let allMedications = [];
let currentMedicationId = null;

// DOM-elementit
const medicationsList = document.getElementById('medications-list');
const activeMedicationsList = document.getElementById('active-medications-list');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const addMedicationBtn = document.getElementById('add-medication-btn');
const medicationModal = document.getElementById('medication-modal');
const medicationForm = document.getElementById('medication-form');
const modalTitle = document.getElementById('modal-title');
const closeModalBtn = document.getElementById('close-modal');
const deleteMedicationBtn = document.getElementById('delete-medication');

// Hae kaikki lääkitykset
async function fetchAllMedications() {
  try {
    if (medicationsList) {
      medicationsList.innerHTML = '<p class="loading">Ladataan lääkityksiä...</p>';
    }
    
    const medications = await getMedications();
    allMedications = medications;
    
    // Järjestä lääkitykset päivämäärän mukaan (uusimmat ensin)
    allMedications.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    
    // Näytä kaikki lääkitykset
    displayMedications();
    
    // Näytä aktiiviset lääkitykset
    displayActiveMedications();
  } catch (error) {
    console.error('Virhe lääkitysten hakemisessa:', error);
    showToast('Lääkitysten hakeminen epäonnistui', 'error');
    
    if (medicationsList) {
      medicationsList.innerHTML = '<p>Lääkitysten hakeminen epäonnistui.</p>';
    }
  }
}

// Näytä kaikki lääkitykset
function displayMedications() {
  if (!medicationsList) return;
  
  if (allMedications.length === 0) {
    medicationsList.innerHTML = '<p>Ei lääkityksiä.</p>';
    return;
  }
  
  medicationsList.innerHTML = allMedications.map(medication => {
    const isActive = !medication.end_date || new Date(medication.end_date) >= new Date();
    
    return `
      <div class="medication-card ${isActive ? 'active-medication' : 'inactive-medication'}">
        <div class="medication-header">
          <h3 class="medication-name">${medication.name}</h3>
          <span class="medication-status">${isActive ? 'Aktiivinen' : 'Päättynyt'}</span>
        </div>
        <div class="medication-info">
          <p><i class="fas fa-pills"></i> <strong>Annostus:</strong> ${medication.dosage || '-'}</p>
          <p><i class="fas fa-clock"></i> <strong>Käyttötiheys:</strong> ${medication.frequency || '-'}</p>
          <p><i class="fas fa-calendar-alt"></i> <strong>Aloitettu:</strong> ${formatDate(medication.start_date)}</p>
          ${medication.end_date ? `<p><i class="fas fa-calendar-times"></i> <strong>Päättyy:</strong> ${formatDate(medication.end_date)}</p>` : ''}
          ${medication.notes ? `<p><i class="fas fa-sticky-note"></i> <strong>Huomiot:</strong> ${medication.notes}</p>` : ''}
        </div>
        <div class="medication-actions">
          <button class="btn edit-medication-btn" data-id="${medication.id}">
            <i class="fas fa-edit"></i> Muokkaa
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  // Lisää click-tapahtuma muokkausnapeille
  document.querySelectorAll('.edit-medication-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const medicationId = button.dataset.id;
      openMedicationModal(medicationId);
    });
  });
}

// Näytä aktiiviset lääkitykset
async function displayActiveMedications() {
  if (!activeMedicationsList) return;
  
  try {
    const activeMedications = await getActiveMedications();
    
    if (activeMedications.length === 0) {
      activeMedicationsList.innerHTML = '<p>Ei aktiivisia lääkityksiä.</p>';
      return;
    }
    
    activeMedicationsList.innerHTML = activeMedications.map(medication => `
      <div class="active-medication-item">
        <div class="medication-name">${medication.name}</div>
        <div class="medication-dosage">${medication.dosage || '-'}</div>
        <div class="medication-frequency">${medication.frequency || '-'}</div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Virhe aktiivisten lääkitysten hakemisessa:', error);
    activeMedicationsList.innerHTML = '<p>Aktiivisten lääkitysten hakeminen epäonnistui.</p>';
  }
}

// Suodata lääkitykset
function filterMedications() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  
  if (!searchTerm) {
    displayMedications();
    return;
  }
  
  const filteredMedications = allMedications.filter(medication => {
    return (
      medication.name.toLowerCase().includes(searchTerm) ||
      (medication.notes && medication.notes.toLowerCase().includes(searchTerm)) ||
      (medication.dosage && medication.dosage.toLowerCase().includes(searchTerm)) ||
      (medication.frequency && medication.frequency.toLowerCase().includes(searchTerm))
    );
  });
  
  if (filteredMedications.length === 0) {
    medicationsList.innerHTML = '<p>Ei hakutuloksia.</p>';
    return;
  }
  
  medicationsList.innerHTML = filteredMedications.map(medication => {
    const isActive = !medication.end_date || new Date(medication.end_date) >= new Date();
    
    return `
      <div class="medication-card ${isActive ? 'active-medication' : 'inactive-medication'}">
        <div class="medication-header">
          <h3 class="medication-name">${medication.name}</h3>
          <span class="medication-status">${isActive ? 'Aktiivinen' : 'Päättynyt'}</span>
        </div>
        <div class="medication-info">
          <p><i class="fas fa-pills"></i> <strong>Annostus:</strong> ${medication.dosage || '-'}</p>
          <p><i class="fas fa-clock"></i> <strong>Käyttötiheys:</strong> ${medication.frequency || '-'}</p>
          <p><i class="fas fa-calendar-alt"></i> <strong>Aloitettu:</strong> ${formatDate(medication.start_date)}</p>
          ${medication.end_date ? `<p><i class="fas fa-calendar-times"></i> <strong>Päättyy:</strong> ${formatDate(medication.end_date)}</p>` : ''}
          ${medication.notes ? `<p><i class="fas fa-sticky-note"></i> <strong>Huomiot:</strong> ${medication.notes}</p>` : ''}
        </div>
        <div class="medication-actions">
          <button class="btn edit-medication-btn" data-id="${medication.id}">
            <i class="fas fa-edit"></i> Muokkaa
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  // Lisää click-tapahtuma muokkausnapeille
  document.querySelectorAll('.edit-medication-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const medicationId = button.dataset.id;
      openMedicationModal(medicationId);
    });
  });
}

// Avaa uuden lääkityksen lisäysmodaali
function openNewMedicationModal() {
  modalTitle.textContent = 'Lisää uusi lääkitys';
  document.getElementById('medication-id').value = '';
  document.getElementById('medication-name').value = '';
  document.getElementById('medication-dosage').value = '';
  document.getElementById('medication-frequency').value = '';
  document.getElementById('medication-start-date').value = formatDateForInput(new Date());
  document.getElementById('medication-end-date').value = '';
  document.getElementById('medication-notes').value = '';
  
  deleteMedicationBtn.style.display = 'none';
  currentMedicationId = null;
  
  medicationModal.classList.add('show');
}

// Avaa lääkityksen muokkausmodaali
async function openMedicationModal(medicationId) {
  try {
    modalTitle.textContent = 'Muokkaa lääkitystä';
    
    const medication = await getMedicationById(medicationId);
    
    document.getElementById('medication-id').value = medication.id;
    document.getElementById('medication-name').value = medication.name || '';
    document.getElementById('medication-dosage').value = medication.dosage || '';
    document.getElementById('medication-frequency').value = medication.frequency || '';
    document.getElementById('medication-start-date').value = formatDateForInput(medication.start_date);
    document.getElementById('medication-end-date').value = medication.end_date ? formatDateForInput(medication.end_date) : '';
    document.getElementById('medication-notes').value = medication.notes || '';
    
    deleteMedicationBtn.style.display = 'block';
    currentMedicationId = medication.id;
    
    medicationModal.classList.add('show');
  } catch (error) {
    console.error('Virhe lääkityksen hakemisessa:', error);
    showToast('Lääkityksen hakeminen epäonnistui', 'error');
  }
}

// Sulje modaali
function closeModal() {
  medicationModal.classList.remove('show');
}

// Tallenna lääkitys
async function saveMedication(formData) {
  try {
    const medicationData = {
      name: formData.get('name'),
      dosage: formData.get('dosage'),
      frequency: formData.get('frequency'),
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date') || null,
      notes: formData.get('notes')
    };
    
    const medicationId = formData.get('medication-id');
    
    if (medicationId) {
      // Päivitä olemassa oleva lääkitys
      await updateMedication(medicationId, medicationData);
      showToast('Lääkitys päivitetty', 'success');
    } else {
      // Lisää uusi lääkitys
      await addMedication(medicationData);
      showToast('Lääkitys lisätty', 'success');
    }
    
    // Hae päivitetyt lääkitykset
    await fetchAllMedications();
    
    // Sulje modaali
    closeModal();
  } catch (error) {
    console.error('Virhe lääkityksen tallentamisessa:', error);
    showToast('Lääkityksen tallentaminen epäonnistui', 'error');
  }
}

// Poista lääkitys
async function removeMedication(medicationId) {
  if (!confirm('Haluatko varmasti poistaa tämän lääkityksen?')) {
    return;
  }
  
  try {
    await deleteMedication(medicationId);
    showToast('Lääkitys poistettu', 'success');
    
    // Hae päivitetyt lääkitykset
    await fetchAllMedications();
    
    // Sulje modaali
    closeModal();
  } catch (error) {
    console.error('Virhe lääkityksen poistamisessa:', error);
    showToast('Lääkityksen poistaminen epäonnistui', 'error');
  }
}

// Tapahtumankäsittelijät
document.addEventListener('DOMContentLoaded', () => {
  // Hae lääkitykset
  fetchAllMedications();
  
  // Lisää tapahtumankäsittelijät
  if (searchBtn) {
    searchBtn.addEventListener('click', filterMedications);
  }
  
  if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        filterMedications();
      }
    });
  }
  
  if (addMedicationBtn) {
    addMedicationBtn.addEventListener('click', openNewMedicationModal);
  }
  
  if (medicationForm) {
    medicationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(medicationForm);
      await saveMedication(formData);
    });
  }
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }
  
  if (deleteMedicationBtn) {
    deleteMedicationBtn.addEventListener('click', () => {
      if (currentMedicationId) {
        removeMedication(currentMedicationId);
      }
    });
  }
  
  // Sulje modaali, kun klikataan taustaa
  window.addEventListener('click', (e) => {
    if (e.target === medicationModal) {
      closeModal();
    }
  });
});