// Liikunta-sivun toiminnallisuudet
import { checkAuth, showToast, formatDate, formatDateForInput } from './main.js';
import { 
  getExercises, 
  getExerciseById, 
  addExercise, 
  updateExercise, 
  deleteExercise, 
  getExercisesByDateRange, 
  getExerciseSummary 
} from './api-exercises.js';

// Varmistetaan, että käyttäjä on kirjautunut
if (!checkAuth()) {
  // Jos ei kirjautunut, main.js ohjaa kirjautumissivulle
  throw new Error('Ei kirjautunut sisään');
}

// Globaalit muuttujat
let allExercises = [];
let currentExerciseId = null;
let exerciseSummary = null;

// DOM-elementit
const exercisesList = document.getElementById('exercises-list');
const exerciseSummaryEl = document.getElementById('exercise-summary');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const addExerciseBtn = document.getElementById('add-exercise-btn');
const exerciseModal = document.getElementById('exercise-modal');
const exerciseForm = document.getElementById('exercise-form');
const modalTitle = document.getElementById('modal-title');
const closeModalBtn = document.getElementById('close-modal');
const deleteExerciseBtn = document.getElementById('delete-exercise');
const dateFromInput = document.getElementById('date-from');
const dateToInput = document.getElementById('date-to');
const filterDateBtn = document.getElementById('filter-date-btn');
const resetFilterBtn = document.getElementById('reset-filter-btn');

// Hae kaikki liikuntamerkinnät
async function fetchAllExercises() {
  try {
    if (exercisesList) {
      exercisesList.innerHTML = '<p class="loading">Ladataan liikuntamerkintöjä...</p>';
    }
    
    const exercises = await getExercises();
    allExercises = exercises;
    
    // Järjestä liikuntamerkinnät päivämäärän mukaan (uusimmat ensin)
    allExercises.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Näytä liikuntamerkinnät
    displayExercises(allExercises);
    
    // Hae ja näytä yhteenveto
    await fetchAndDisplaySummary();
  } catch (error) {
    console.error('Virhe liikuntamerkintöjen hakemisessa:', error);
    showToast('Liikuntamerkintöjen hakeminen epäonnistui', 'error');
    
    if (exercisesList) {
      exercisesList.innerHTML = '<p>Liikuntamerkintöjen hakeminen epäonnistui.</p>';
    }
  }
}

// Näytä liikuntamerkinnät
function displayExercises(exercises) {
  if (!exercisesList) return;
  
  if (exercises.length === 0) {
    exercisesList.innerHTML = '<p>Ei liikuntamerkintöjä.</p>';
    return;
  }
  
  exercisesList.innerHTML = exercises.map(exercise => {
    // Määritä väri intensiteetin mukaan
    let intensityColor;
    switch(exercise.intensity && exercise.intensity.toLowerCase()) {
      case 'high':
      case 'kova':
        intensityColor = '#e74c3c';
        break;
      case 'medium':
      case 'keskiraskas':
        intensityColor = '#f39c12';
        break;
      case 'low':
      case 'kevyt':
        intensityColor = '#2ecc71';
        break;
      default:
        intensityColor = '#3498db';
    }
    
    return `
      <div class="exercise-card">
        <div class="exercise-header">
          <div class="exercise-date">${formatDate(exercise.date)}</div>
          <div class="exercise-type">${exercise.type}</div>
        </div>
        <div class="exercise-details">
          <div class="exercise-duration">
            <i class="fas fa-stopwatch"></i>
            ${exercise.duration} min
          </div>
          <div class="exercise-intensity" style="color: ${intensityColor}">
            <i class="fas fa-tachometer-alt"></i>
            ${exercise.intensity || 'Ei määritelty'}
          </div>
        </div>
        ${exercise.notes ? `
          <div class="exercise-notes">
            <i class="fas fa-sticky-note"></i>
            ${exercise.notes}
          </div>
        ` : ''}
        <div class="exercise-actions">
          <button class="btn edit-exercise-btn" data-id="${exercise.id}">
            <i class="fas fa-edit"></i> Muokkaa
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  // Lisää click-tapahtuma muokkausnapeille
  document.querySelectorAll('.edit-exercise-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const exerciseId = button.dataset.id;
      openExerciseModal(exerciseId);
    });
  });
}

// Hae ja näytä yhteenveto
async function fetchAndDisplaySummary() {
  if (!exerciseSummaryEl) return;
  
  try {
    exerciseSummaryEl.innerHTML = '<p class="loading">Ladataan yhteenvetoa...</p>';
    
    exerciseSummary = await getExerciseSummary();
    
    if (!exerciseSummary || exerciseSummary.totalExercises === 0) {
      exerciseSummaryEl.innerHTML = '<p>Ei liikuntamerkintöjä yhteenvetoa varten.</p>';
      return;
    }
    
    // Suosituimmat liikuntatyypit
    const topExerciseTypes = Object.entries(exerciseSummary.exercisesByType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    const topExerciseTypesHtml = topExerciseTypes.map(([type, count], index) => `
      <div class="summary-item">
        <span class="summary-rank">${index + 1}.</span>
        <span class="summary-label">${type}</span>
        <span class="summary-value">${count} kertaa</span>
      </div>
    `).join('');
    
    // Luodaan diagrammi-data (yksinkertainen graafi)
    const intensityData = Object.entries(exerciseSummary.exercisesByIntensity);
    const intensityChartHtml = `
      <div class="intensity-chart">
        ${intensityData.map(([intensity, count]) => {
          const percentage = (count / exerciseSummary.totalExercises) * 100;
          let color;
          
          switch(intensity.toLowerCase()) {
            case 'high':
            case 'kova':
              color = '#e74c3c';
              break;
            case 'medium':
            case 'keskiraskas':
              color = '#f39c12';
              break;
            case 'low':
            case 'kevyt':
              color = '#2ecc71';
              break;
            default:
              color = '#3498db';
          }
          
          return `
            <div class="chart-item">
              <div class="chart-label">${intensity}</div>
              <div class="chart-bar-container">
                <div class="chart-bar" style="width: ${percentage}%; background-color: ${color}"></div>
              </div>
              <div class="chart-value">${count}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    
    exerciseSummaryEl.innerHTML = `
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-icon">
            <i class="fas fa-running"></i>
          </div>
          <div class="summary-content">
            <div class="summary-title">Liikuntakerrat</div>
            <div class="summary-value">${exerciseSummary.totalExercises}</div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon">
            <i class="fas fa-stopwatch"></i>
          </div>
          <div class="summary-content">
            <div class="summary-title">Kokonaiskesto</div>
            <div class="summary-value">${exerciseSummary.totalDuration} min</div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon">
            <i class="fas fa-fire-alt"></i>
          </div>
          <div class="summary-content">
            <div class="summary-title">Keskimääräinen kesto</div>
            <div class="summary-value">${Math.round(exerciseSummary.totalDuration / exerciseSummary.totalExercises)} min</div>
          </div>
        </div>
      </div>
      
      <div class="summary-section">
        <h4>Suosituimmat liikuntatyypit</h4>
        <div class="summary-list">
          ${topExerciseTypesHtml || '<p>Ei tarpeeksi tietoa.</p>'}
        </div>
      </div>
      
      <div class="summary-section">
        <h4>Intensiteetti</h4>
        ${intensityChartHtml}
      </div>
    `;
  } catch (error) {
    console.error('Virhe yhteenvedon hakemisessa:', error);
    exerciseSummaryEl.innerHTML = '<p>Yhteenvedon hakeminen epäonnistui.</p>';
  }
}

// Suodata liikuntamerkinnät
function filterExercises() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const fromDate = dateFromInput.value ? new Date(dateFromInput.value) : null;
  const toDate = dateToInput.value ? new Date(dateToInput.value) : null;
  
  let filteredExercises = [...allExercises];
  
  // Suodata hakusanan perusteella
  if (searchTerm) {
    filteredExercises = filteredExercises.filter(exercise => 
      (exercise.type && exercise.type.toLowerCase().includes(searchTerm)) ||
      (exercise.notes && exercise.notes.toLowerCase().includes(searchTerm)) ||
      (exercise.intensity && exercise.intensity.toLowerCase().includes(searchTerm))
    );
  }
  
  // Suodata päivämäärän perusteella
  if (fromDate || toDate) {
    filteredExercises = filteredExercises.filter(exercise => {
      const exerciseDate = new Date(exercise.date);
      return (!fromDate || exerciseDate >= fromDate) &&
             (!toDate || exerciseDate <= toDate);
    });
  }
  
  // Näytä suodatetut liikuntamerkinnät
  displayExercises(filteredExercises);
}

// Tyhjennä suodattimet
function resetFilters() {
  searchInput.value = '';
  dateFromInput.value = '';
  dateToInput.value = '';
  displayExercises(allExercises);
}

// Avaa uuden liikuntamerkinnän lisäysmodaali
function openNewExerciseModal() {
  modalTitle.textContent = 'Lisää uusi liikuntamerkintä';
  document.getElementById('exercise-id').value = '';
  document.getElementById('exercise-type').value = '';
  document.getElementById('exercise-duration').value = '';
  document.getElementById('exercise-intensity').value = 'medium';
  document.getElementById('exercise-date').value = formatDateForInput(new Date());
  document.getElementById('exercise-notes').value = '';
  
  deleteExerciseBtn.style.display = 'none';
  currentExerciseId = null;
  
  exerciseModal.classList.add('show');
}

// Avaa liikuntamerkinnän muokkausmodaali
async function openExerciseModal(exerciseId) {
  try {
    modalTitle.textContent = 'Muokkaa liikuntamerkintää';
    
    const exercise = await getExerciseById(exerciseId);
    
    document.getElementById('exercise-id').value = exercise.id;
    document.getElementById('exercise-type').value = exercise.type || '';
    document.getElementById('exercise-duration').value = exercise.duration || '';
    document.getElementById('exercise-intensity').value = exercise.intensity || 'medium';
    document.getElementById('exercise-date').value = formatDateForInput(exercise.date);
    document.getElementById('exercise-notes').value = exercise.notes || '';
    
    deleteExerciseBtn.style.display = 'block';
    currentExerciseId = exercise.id;
    
    exerciseModal.classList.add('show');
  } catch (error) {
    console.error('Virhe liikuntamerkinnän hakemisessa:', error);
    showToast('Liikuntamerkinnän hakeminen epäonnistui', 'error');
  }
}

// Sulje modaali
function closeModal() {
  exerciseModal.classList.remove('show');
}

// Tallenna liikuntamerkintä
async function saveExercise(formData) {
  try {
    const exerciseData = {
      type: formData.get('type'),
      duration: parseInt(formData.get('duration'), 10) || 0,
      intensity: formData.get('intensity'),
      date: formData.get('date'),
      notes: formData.get('notes')
    };
    
    const exerciseId = formData.get('exercise-id');
    
    if (exerciseId) {
      // Päivitä olemassa oleva liikuntamerkintä
      await updateExercise(exerciseId, exerciseData);
      showToast('Liikuntamerkintä päivitetty', 'success');
    } else {
      // Lisää uusi liikuntamerkintä
      await addExercise(exerciseData);
      showToast('Liikuntamerkintä lisätty', 'success');
    }
    
    // Hae päivitetyt liikuntamerkinnät
    await fetchAllExercises();
    
    // Sulje modaali
    closeModal();
  } catch (error) {
    console.error('Virhe liikuntamerkinnän tallentamisessa:', error);
    showToast('Liikuntamerkinnän tallentaminen epäonnistui', 'error');
  }
}

// Poista liikuntamerkintä
async function removeExercise(exerciseId) {
  if (!confirm('Haluatko varmasti poistaa tämän liikuntamerkinnän?')) {
    return;
  }
  
  try {
    await deleteExercise(exerciseId);
    showToast('Liikuntamerkintä poistettu', 'success');
    
    // Hae päivitetyt liikuntamerkinnät
    await fetchAllExercises();
    
    // Sulje modaali
    closeModal();
  } catch (error) {
    console.error('Virhe liikuntamerkinnän poistamisessa:', error);
    showToast('Liikuntamerkinnän poistaminen epäonnistui', 'error');
  }
}

document.addEventListener("DOMContentLoaded", function() {
  // Hae napit ja modalin elementit
  const addExerciseBtn = document.getElementById("add-exercise-btn");
  const modal = document.getElementById("exercise-modal");
  const modalTitle = document.getElementById("exercise-modal-title");
  const closeModalBtn = document.getElementById("close-exercise-modal");

  // Tarkista, että elementit löytyvät
  if (!addExerciseBtn || !modal || !modalTitle || !closeModalBtn) {
      console.error("Yksi tai useampi modalin elementti puuttuu!");
      return;
  }

  // Funktio modalin avaamiseen
  function openNewExerciseModal() {
      modalTitle.textContent = "Lisää uusi liikuntasuoritus"; // Varmistetaan, että elementti on käytettävissä
      modal.style.display = "block";
  }

  // Funktio modalin sulkemiseen
  function closeExerciseModal() {
      modal.style.display = "none";
  }

  // Lisää event listener napille
  addExerciseBtn.addEventListener("click", openNewExerciseModal);
  closeModalBtn.addEventListener("click", closeExerciseModal);

  // Sulje modal klikkaamalla taustaa
  window.addEventListener("click", function(event) {
      if (event.target === modal) {
          closeExerciseModal();
      }
  });
});
