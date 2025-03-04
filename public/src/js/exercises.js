// Liikunta-sivun toiminnallisuudet
import { checkAuth, showToast, formatDate, formatDateForInput } from './main.js';
import { 
  getExercises, 
  getExerciseById, 
  addExercise, 
  updateExercise, 
  deleteExercise
} from './api-exercises.js';

// Varmistetaan, että käyttäjä on kirjautunut
if (!checkAuth()) {
  // Jos ei kirjautunut, main.js ohjaa kirjautumissivulle
  throw new Error('Ei kirjautunut sisään');
}

// Globaalit muuttujat
let allExercises = [];
let currentExerciseId = null;

// DOM-elementit
const exercisesList = document.getElementById('recent-exercises-list');
const exerciseSummaryEl = document.getElementById('exercise-summary');
const addExerciseBtn = document.getElementById('add-exercise-btn');
const exerciseModal = document.getElementById('exercise-modal');
const exerciseForm = document.getElementById('exercise-form');
const modalTitle = document.getElementById('exercise-modal-title');
const closeModalBtn = document.getElementById('close-exercise-modal');
const deleteExerciseBtn = document.getElementById('delete-exercise');
const exerciseTypeSelect = document.getElementById('exercise-type');
const otherExerciseContainer = document.getElementById('other-exercise-type-container');
const otherExerciseInput = document.getElementById('other-exercise-type');

// Kalenteri-elementit
const exerciseCalendar = document.getElementById('exercise-calendar-grid');
const currentMonthEl = document.getElementById('current-month');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

// Tilastoelementit
const weeklyExerciseTime = document.getElementById('weekly-exercise-time');
const monthlyExerciseTime = document.getElementById('monthly-exercise-time');
const favoriteExercise = document.getElementById('favorite-exercise');
const avgExerciseTime = document.getElementById('avg-exercise-time');
const exerciseTypesGrid = document.getElementById('exercise-types-grid');

// Hae kaikki liikuntamerkinnät
async function fetchAllExercises() {
  try {
    if (exercisesList) {
      exercisesList.innerHTML = '<li class="loading">Ladataan liikuntasuorituksia...</li>';
    }
    
    const exercises = await getExercises();
    allExercises = exercises;
    
    // Järjestä liikuntamerkinnät päivämäärän mukaan (uusimmat ensin)
    allExercises.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Näytä liikuntamerkinnät
    displayExercises();
    
    // Päivitä liikuntayhteenveto
    updateExerciseStats();
    
    // Päivitä liikuntatyypit
    updateExerciseTypes();
    
    // Päivitä kalenteri
    if (exerciseCalendar) {
      renderExerciseCalendar();
    }
    
    return exercises;
  } catch (error) {
    console.error('Virhe liikuntamerkintöjen hakemisessa:', error);
    showToast('Liikuntamerkintöjen hakeminen epäonnistui', 'error');
    
    if (exercisesList) {
      exercisesList.innerHTML = '<li>Liikuntamerkintöjen hakeminen epäonnistui.</li>';
    }
  }
}

// Näytä liikuntamerkinnät listassa
function displayExercises() {
  if (!exercisesList) return;
  
  if (allExercises.length === 0) {
    exercisesList.innerHTML = '<li>Ei liikuntasuorituksia.</li>';
    return;
  }
  
  // Näytä vain viimeisimmät 5 suoritusta
  const recentExercises = allExercises.slice(0, 5);
  
  exercisesList.innerHTML = recentExercises.map(exercise => {
    // Määritä väri intensiteetin mukaan
    let intensityColor, intensityIcon;
    
    switch(exercise.intensity && exercise.intensity.toLowerCase()) {
      case 'raskas':
        intensityColor = '#e74c3c';
        intensityIcon = 'fa-fire';
        break;
      case 'keskitaso':
        intensityColor = '#f39c12';
        intensityIcon = 'fa-fire-alt';
        break;
      case 'kevyt':
      default:
        intensityColor = '#2ecc71';
        intensityIcon = 'fa-feather';
    }
    
    return `
      <li class="exercise-item">
        <div class="exercise-item-header">
          <div class="exercise-date">${formatDate(exercise.date)}</div>
          <div class="exercise-type">${exercise.type}</div>
        </div>
        <div class="exercise-details">
          <div class="exercise-duration">
            <i class="fas fa-stopwatch"></i> ${exercise.duration} min
          </div>
          <div class="exercise-intensity" style="color: ${intensityColor}">
            <i class="fas ${intensityIcon}"></i> ${exercise.intensity || 'Ei määritelty'}
          </div>
        </div>
        ${exercise.notes ? `
          <div class="exercise-notes">
            <i class="fas fa-sticky-note"></i> ${exercise.notes}
          </div>
        ` : ''}
        <div class="exercise-actions">
          <button class="btn edit-exercise-btn" data-id="${exercise.id || ''}">
            <i class="fas fa-edit"></i> Muokkaa
          </button>
        </div>
      </li>
    `;
  }).join('');
  
  // Lisää click-tapahtuma muokkausnapeille
  document.querySelectorAll('.edit-exercise-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const exerciseId = button.dataset.id;
      openEditExerciseModal(exerciseId);
    });
  });
}

// Päivitä liikuntayhteenveto
function updateExerciseStats() {
  if (!weeklyExerciseTime || !monthlyExerciseTime || !favoriteExercise || !avgExerciseTime) return;
  
  if (allExercises.length === 0) {
    weeklyExerciseTime.textContent = '0 min';
    monthlyExerciseTime.textContent = '0 min';
    favoriteExercise.textContent = '-';
    avgExerciseTime.textContent = '0 min/vko';
    return;
  }
  
  // Laske liikunta-aika tällä viikolla
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); // Maanantai
  startOfWeek.setHours(0, 0, 0, 0);
  
  const weeklyExercises = allExercises.filter(exercise => 
    new Date(exercise.date) >= startOfWeek
  );
  
  const weeklyTime = weeklyExercises.reduce((sum, exercise) => sum + (exercise.duration || 0), 0);
  weeklyExerciseTime.textContent = `${weeklyTime} min`;
  
  // Laske liikunta-aika tässä kuussa
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthlyExercises = allExercises.filter(exercise => 
    new Date(exercise.date) >= startOfMonth
  );
  
  const monthlyTime = monthlyExercises.reduce((sum, exercise) => sum + (exercise.duration || 0), 0);
  monthlyExerciseTime.textContent = `${monthlyTime} min`;
  
  // Suosituin liikuntalaji
  const exerciseTypes = {};
  allExercises.forEach(exercise => {
    if (!exercise.type) return;
    
    if (!exerciseTypes[exercise.type]) {
      exerciseTypes[exercise.type] = 0;
    }
    
    exerciseTypes[exercise.type]++;
  });
  
  let maxCount = 0;
  let favoriteType = '-';
  
  for (const [type, count] of Object.entries(exerciseTypes)) {
    if (count > maxCount) {
      maxCount = count;
      favoriteType = type;
    }
  }
  
  favoriteExercise.textContent = favoriteType;
  
  // Keskimääräinen liikunta-aika viikossa
  // Laske ensimmäisen ja viimeisen liikuntasuorituksen välinen aika viikkoina
  if (allExercises.length > 1) {
    const firstExercise = allExercises[allExercises.length - 1];
    const lastExercise = allExercises[0];
    
    const firstDate = new Date(firstExercise.date);
    const lastDate = new Date(lastExercise.date);
    
    const weeksDiff = Math.max(1, Math.ceil((lastDate - firstDate) / (7 * 24 * 60 * 60 * 1000)));
    
    const totalDuration = allExercises.reduce((sum, exercise) => sum + (exercise.duration || 0), 0);
    const avgDuration = totalDuration / weeksDiff;
    
    avgExerciseTime.textContent = `${Math.round(avgDuration)} min/vko`;
  } else if (allExercises.length === 1) {
    avgExerciseTime.textContent = `${allExercises[0].duration || 0} min/vko`;
  }
}

// Päivitä liikuntatyypit
function updateExerciseTypes() {
  if (!exerciseTypesGrid) return;
  
  if (allExercises.length === 0) {
    exerciseTypesGrid.innerHTML = '<p>Ei liikuntasuorituksia.</p>';
    return;
  }
  
  // Kerää kaikki liikuntatyypit ja niiden esiintymät
  const exerciseTypes = {};
  
  allExercises.forEach(exercise => {
    if (!exercise.type) return;
    
    if (!exerciseTypes[exercise.type]) {
      exerciseTypes[exercise.type] = {
        count: 0,
        totalDuration: 0
      };
    }
    
    exerciseTypes[exercise.type].count++;
    exerciseTypes[exercise.type].totalDuration += (exercise.duration || 0);
  });
  
  // Järjestä liikuntatyypit suosion mukaan
  const sortedTypes = Object.entries(exerciseTypes).sort((a, b) => b[1].count - a[1].count);
  
  // Näytä enintään 6 suosituinta tyyppiä
  const topTypes = sortedTypes.slice(0, 6);
  
  exerciseTypesGrid.innerHTML = topTypes.map(([type, data]) => {
    return `
      <div class="exercise-type-card">
        <div class="exercise-type-icon">
          <i class="fas fa-${getExerciseTypeIcon(type)}"></i>
        </div>
        <div class="exercise-type-name">${type}</div>
        <div class="exercise-type-stats">
          <div>${data.count} kertaa</div>
          <div>${data.totalDuration} min</div>
        </div>
      </div>
    `;
  }).join('');
}

// Hae liikuntatyypille ikoni
function getExerciseTypeIcon(type) {
  const typeLower = type.toLowerCase();
  
  if (typeLower.includes('juoksu') || typeLower.includes('lenkki')) return 'running';
  if (typeLower.includes('kävely')) return 'walking';
  if (typeLower.includes('pyöräily')) return 'biking';
  if (typeLower.includes('uinti')) return 'swimming-pool';
  if (typeLower.includes('kuntosali')) return 'dumbbell';
  if (typeLower.includes('jooga')) return 'om';
  if (typeLower.includes('pilates')) return 'spa';
  if (typeLower.includes('tanssi')) return 'music';
  if (typeLower.includes('hiihto')) return 'skiing';
  if (typeLower.includes('pallo')) return 'futbol';
  
  return 'running'; // Oletus
}

// Avaa uuden liikuntasuorituksen lisäysmodaali
function openNewExerciseModal() {
  if (!exerciseModal) return;
  
  modalTitle.textContent = 'Lisää uusi liikuntasuoritus';
  
  document.getElementById('exercise-id').value = '';
  document.getElementById('exercise-date').value = formatDateForInput(new Date());
  document.getElementById('exercise-type').value = '';
  document.getElementById('exercise-duration').value = '';
  document.getElementById('exercise-intensity').value = 'Keskitaso';
  document.getElementById('exercise-notes').value = '';
  
  if (otherExerciseContainer) {
    otherExerciseContainer.classList.add('hidden');
  }
  
  if (deleteExerciseBtn) {
    deleteExerciseBtn.style.display = 'none';
  }
  
  currentExerciseId = null;
  
  exerciseModal.classList.add('show');
}

// Avaa liikuntasuorituksen muokkausmodaali
async function openEditExerciseModal(exerciseId) {
  if (!exerciseModal) return;
  
  try {
    modalTitle.textContent = 'Muokkaa liikuntasuoritusta';
    
    const exercise = await getExerciseById(exerciseId);
    
    document.getElementById('exercise-id').value = exercise.id;
    document.getElementById('exercise-date').value = formatDateForInput(exercise.date);
    document.getElementById('exercise-duration').value = exercise.duration || '';
    document.getElementById('exercise-intensity').value = exercise.intensity || 'Keskitaso';
    document.getElementById('exercise-notes').value = exercise.notes || '';
    
    // Aseta liikuntatyyppi tai "Muu" jos tyyppiä ei löydy listasta
    const typeExists = Array.from(exerciseTypeSelect.options).some(
      option => option.value === exercise.type
    );
    
    if (typeExists) {
      exerciseTypeSelect.value = exercise.type;
      if (otherExerciseContainer) {
        otherExerciseContainer.classList.add('hidden');
      }
    } else {
      exerciseTypeSelect.value = 'Muu';
      if (otherExerciseContainer && otherExerciseInput) {
        otherExerciseContainer.classList.remove('hidden');
        otherExerciseInput.value = exercise.type;
      }
    }
    
    if (deleteExerciseBtn) {
      deleteExerciseBtn.style.display = 'block';
    }
    
    currentExerciseId = exercise.id;
    
    exerciseModal.classList.add('show');
  } catch (error) {
    console.error('Virhe liikuntasuorituksen hakemisessa:', error);
    showToast('Liikuntasuorituksen hakeminen epäonnistui', 'error');
  }
}

// Sulje modaali
function closeModal() {
  if (exerciseModal) {
    exerciseModal.classList.remove('show');
  }
}

// Tallenna liikuntasuoritus
async function saveExercise(formData) {
  try {
    // Määritä liikuntatyyppi
    let exerciseType = formData.get('type');
    
    if (exerciseType === 'Muu' && formData.get('other_type')) {
      exerciseType = formData.get('other_type');
    }
    
    const exerciseData = {
      type: exerciseType,
      duration: parseInt(formData.get('duration'), 10) || 0,
      intensity: formData.get('intensity') || 'Keskitaso',
      date: formData.get('date'),
      notes: formData.get('notes')
    };
    
    const exerciseId = formData.get('exercise_id');
    
    if (exerciseId) {
      // Päivitä olemassa oleva liikuntasuoritus
      await updateExercise(exerciseId, exerciseData);
      showToast('Liikuntasuoritus päivitetty', 'success');
    } else {
      // Lisää uusi liikuntasuoritus
      await addExercise(exerciseData);
      showToast('Liikuntasuoritus lisätty', 'success');
    }
    
    // Hae päivitetyt liikuntasuoritukset
    await fetchAllExercises();
    
    // Sulje modaali
    closeModal();
  } catch (error) {
    console.error('Virhe liikuntasuorituksen tallentamisessa:', error);
    showToast('Liikuntasuorituksen tallentaminen epäonnistui', 'error');
  }
}

// Poista liikuntasuoritus
async function removeExercise(exerciseId) {
  if (!confirm('Haluatko varmasti poistaa tämän liikuntasuorituksen?')) {
    return;
  }
  
  try {
    await deleteExercise(exerciseId);
    showToast('Liikuntasuoritus poistettu', 'success');
    
    // Hae päivitetyt liikuntasuoritukset
    await fetchAllExercises();
    
    // Sulje modaali
    closeModal();
  } catch (error) {
    console.error('Virhe liikuntasuorituksen poistamisessa:', error);
    showToast('Liikuntasuorituksen poistaminen epäonnistui', 'error');
  }
}

// Kalenteri-toiminnallisuus
let currentDate = new Date();

// Renderöi liikuntakalenteri
function renderExerciseCalendar() {
  if (!exerciseCalendar || !currentMonthEl) return;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Aseta kuukauden nimi
  const monthName = new Date(year, month, 1).toLocaleDateString('fi-FI', { month: 'long', year: 'numeric' });
  currentMonthEl.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  
  // Hae kuukauden ensimmäinen ja viimeinen päivä
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // Hae ensimmäisen päivän viikonpäivä (0 = sunnuntai, 1 = maanantai, jne.)
  // Suomen kalenterissa viikko alkaa maanantaista (1), joten tehdään korjaus
  let firstDayIndex = firstDayOfMonth.getDay();
  if (firstDayIndex === 0) firstDayIndex = 7; // Sunnuntai on 7, ei 0
  firstDayIndex--; // Maanantai on 0, tiistai on 1, jne.
  
  // Hae päivien lukumäärä kuukaudessa
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Luo kalenterin päät ja rivi päiville
  let calendarHTML = `
    <div class="calendar-day-header">Ma</div>
    <div class="calendar-day-header">Ti</div>
    <div class="calendar-day-header">Ke</div>
    <div class="calendar-day-header">To</div>
    <div class="calendar-day-header">Pe</div>
    <div class="calendar-day-header">La</div>
    <div class="calendar-day-header">Su</div>
  `;
  
  // Lisää edellisen kuukauden päivät
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNumber = prevMonthLastDay - i;
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    calendarHTML += `
      <div class="calendar-day other-month" data-date="${dateString}">
        <div class="calendar-day-number">${dayNumber}</div>
        <div class="calendar-day-entries"></div>
      </div>
    `;
  }
  
  // Lisää tämän kuukauden päivät
  const today = new Date();
  
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    
    // Tarkista, onko päivä tänään
    const isToday = date.getDate() === today.getDate() && 
                    date.getMonth() === today.getMonth() && 
                    date.getFullYear() === today.getFullYear();
    
    // Tarkista, onko päivälle liikuntasuorituksia
    const dayExercises = allExercises.filter(exercise => {
      const exerciseDate = new Date(exercise.date);
      return exerciseDate.getDate() === i && 
            exerciseDate.getMonth() === month && 
            exerciseDate.getFullYear() === year;
    });
    
    // Koosta päivän HTML
    calendarHTML += `
      <div class="calendar-day${isToday ? ' today' : ''}${dayExercises.length > 0 ? ' has-entry' : ''}" data-date="${dateString}">
        <div class="calendar-day-number">${i}</div>
        <div class="calendar-day-entries">
          ${dayExercises.map(exercise => {
            // Määritä väri intensiteetin mukaan
            let color = '#3498db'; // Oletus
            switch(exercise.intensity && exercise.intensity.toLowerCase()) {
              case 'raskas':
                color = '#e74c3c';
                break;
              case 'keskitaso':
                color = '#f39c12';
                break;
              case 'kevyt':
                color = '#2ecc71';
                break;
            }
            
            return `<div class="calendar-entry-indicator" style="background-color: ${color};" title="${exercise.type}: ${exercise.duration} min"></div>`;
          }).join('')}
        </div>
      </div>
    `;
  }
  
  // Lisää seuraavan kuukauden päiviä tarvittava määrä
  const daysToAdd = 42 - (firstDayIndex + daysInMonth);
  
  for (let i = 1; i <= daysToAdd; i++) {
    const dateString = `${year}-${String(month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarHTML += `
      <div class="calendar-day other-month" data-date="${dateString}">
        <div class="calendar-day-number">${i}</div>
        <div class="calendar-day-entries"></div>
      </div>
    `;
  }
  
  // Aseta HTML kalenteriin
  exerciseCalendar.innerHTML = calendarHTML;
  
  // Lisää click-tapahtuma päiville
  document.querySelectorAll('.calendar-day').forEach(day => {
    day.addEventListener('click', () => {
      const dateString = day.dataset.date;
      openNewExerciseWithDate(dateString);
    });
  });
}

// Vaihda kuukautta eteen- tai taaksepäin
function changeMonth(amount) {
  currentDate.setMonth(currentDate.getMonth() + amount);
  renderExerciseCalendar();
}

// Avaa uusi liikuntasuoritus valitulla päivämäärällä
function openNewExerciseWithDate(dateString) {
  if (!exerciseModal) return;
  
  modalTitle.textContent = 'Lisää uusi liikuntasuoritus';
  
  document.getElementById('exercise-id').value = '';
  document.getElementById('exercise-date').value = dateString || formatDateForInput(new Date());
  document.getElementById('exercise-type').value = '';
  document.getElementById('exercise-duration').value = '';
  document.getElementById('exercise-intensity').value = 'Keskitaso';
  document.getElementById('exercise-notes').value = '';
  
  if (otherExerciseContainer) {
    otherExerciseContainer.classList.add('hidden');
  }
  
  if (deleteExerciseBtn) {
    deleteExerciseBtn.style.display = 'none';
  }
  
  currentExerciseId = null;
  
  exerciseModal.classList.add('show');
}

// Tapahtumankäsittelijät
document.addEventListener('DOMContentLoaded', () => {
  // Hae liikuntasuoritukset
  fetchAllExercises().then(() => {
    // Renderöi kalenteri kun data on haettu
    renderExerciseCalendar();
  });
  
  // Kalenterin kuukauden vaihto
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => changeMonth(-1));
  }
  
  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => changeMonth(1));
  }
  
  // Muu liikuntalaji -kenttä
  if (exerciseTypeSelect) {
    exerciseTypeSelect.addEventListener('change', function() {
      if (this.value === 'Muu' && otherExerciseContainer) {
        otherExerciseContainer.classList.remove('hidden');
      } else if (otherExerciseContainer) {
        otherExerciseContainer.classList.add('hidden');
      }
    });
  }
  
  // Lisää liikuntasuoritus -nappi
  if (addExerciseBtn) {
    addExerciseBtn.addEventListener('click', openNewExerciseModal);
  }
  
  // Liikuntasuorituksen tallennus
  if (exerciseForm) {
    exerciseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(exerciseForm);
      await saveExercise(formData);
    });
  }
  
  // Sulje modaali -nappi
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }
  
  // Poista liikuntasuoritus -nappi
  if (deleteExerciseBtn) {
    deleteExerciseBtn.addEventListener('click', () => {
      if (currentExerciseId) {
        removeExercise(currentExerciseId);
      }
    });
  }
  
  // Sulje modaali, kun klikataan taustaa
  window.addEventListener('click', (e) => {
    if (e.target === exerciseModal) {
      closeModal();
    }
  });
});