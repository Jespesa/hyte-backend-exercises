// Tavoitesivun toiminnallisuudet
import { checkAuth, showToast, formatDate } from './main.js';
import { getEntries } from './api.js';

// Varmistetaan, että käyttäjä on kirjautunut
if (!checkAuth()) {
    // Jos ei kirjautunut, main.js ohjaa kirjautumissivulle
    throw new Error('Ei kirjautunut sisään');
}

// Globaalit muuttujat
let allEntries = [];
let allGoals = [];
let currentGoalId = null;
let lastSelectedGoalType = 'weight';

// DOM-elementit - mobiilivalikko
const menuToggle = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
const mobileNavClose = document.getElementById('mobile-nav-close');
const mobileNavBackdrop = document.getElementById('mobile-nav-backdrop');
const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

// DOM-elementit - tavoitelistaukset
const activeGoalsList = document.getElementById('active-goals-list');
const completedGoalsList = document.getElementById('completed-goals-list');

// DOM-elementit - modaalit
const goalModal = document.getElementById('goal-modal');
const goalModalTitle = document.getElementById('goal-modal-title');
const closeGoalModal = document.getElementById('close-goal-modal');
const goalForm = document.getElementById('goal-form');
const goalId = document.getElementById('goal-id');
const goalTitle = document.getElementById('goal-title-input');
const goalType = document.getElementById('goal-type');
const goalDescription = document.getElementById('goal-description');
const goalStartDate = document.getElementById('goal-start-date');
const goalEndDate = document.getElementById('goal-end-date');
const goalTargetContainer = document.getElementById('goal-target-container');
const goalTypeOptions = document.querySelectorAll('.goal-type-option');

// DOM-elementit - poisto-modaali
const deleteGoalModal = document.getElementById('delete-goal-modal');
const closeDeleteGoalModal = document.getElementById('close-delete-goal-modal');
const deleteGoalTitle = document.getElementById('delete-goal-title');
const deleteGoalCancelBtn = document.getElementById('delete-goal-cancel-btn');
const deleteGoalConfirmBtn = document.getElementById('delete-goal-confirm-btn');

// DOM-elementit - muu
const addGoalBtn = document.getElementById('add-goal-btn');
const goalsContainer = document.getElementById('goals-container');

// Simuloidaan tavoitteiden tallennus ja lataus (todellisessa sovelluksessa käytettäisiin API:a)
function loadGoals() {
    const storedGoals = localStorage.getItem('healthDiaryGoals');
    if (storedGoals) {
        try {
            allGoals = JSON.parse(storedGoals);
        } catch (error) {
            console.error('Virhe tavoitteiden latauksessa:', error);
            allGoals = [];
        }
    }
    renderGoals();
}

function saveGoals() {
    localStorage.setItem('healthDiaryGoals', JSON.stringify(allGoals));
}

// Tavoitteiden renderöinti
function renderGoals() {
    if (!activeGoalsList || !completedGoalsList) return;

    const activeGoals = allGoals.filter(goal => !goal.completed);
    const completedGoals = allGoals.filter(goal => goal.completed);

    // Aktiiviset tavoitteet
    if (activeGoals.length === 0) {
        activeGoalsList.innerHTML = '<p>Ei aktiivisia tavoitteita.</p>';
    } else {
        activeGoalsList.innerHTML = activeGoals.map(goal => createGoalItemHTML(goal)).join('');
    }

    // Valmiit tavoitteet
    if (completedGoals.length === 0) {
        completedGoalsList.innerHTML = '<p>Ei saavutettuja tavoitteita.</p>';
    } else {
        completedGoalsList.innerHTML = completedGoals.map(goal => createGoalItemHTML(goal)).join('');
    }

    // Lisää tapahtumankäsittelijät
    addGoalItemEventListeners();
}

// Luo tavoite-elementin HTML
function createGoalItemHTML(goal) {
    // Laske edistyminen
    const progress = calculateGoalProgress(goal);
    const progressClass = getProgressClass(progress);
    
    // Määritä ikoni tavoitetyypin mukaan
    let icon;
    switch (goal.type) {
        case 'weight':
            icon = 'fas fa-weight';
            break;
        case 'sleep':
            icon = 'fas fa-bed';
            break;
        case 'mood':
            icon = 'fas fa-smile';
            break;
        default:
            icon = 'fas fa-bullseye';
    }
    
    // Määritä tavoitteen tila ja päivämäärätiedot
    let statusBadge, timeframeHtml;
    if (goal.completed) {
        statusBadge = '<span class="goal-badge completed">Saavutettu</span>';
        timeframeHtml = `
            <div><i class="fas fa-calendar-alt"></i> ${formatDate(goal.startDate)} - ${formatDate(goal.endDate)}</div>
            <div><i class="fas fa-check"></i> Saavutettu ${formatDate(goal.completedDate || new Date())}</div>
        `;
    } else {
        // Tarkista, onko tavoite myöhässä
        const now = new Date();
        const endDate = new Date(goal.endDate);
        const isOverdue = endDate < now;
        
        if (isOverdue) {
            statusBadge = '<span class="goal-badge active">Aktiivinen</span><span class="goal-badge overdue">Myöhässä</span>';
        } else {
            statusBadge = '<span class="goal-badge active">Aktiivinen</span>';
            if (progress) {
                statusBadge += `<span class="goal-badge progress">${Math.round(progress)}%</span>`;
            }
        }
        
        // Laske jäljellä olevat päivät
        const daysLeft = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
        
        timeframeHtml = `
            <div><i class="fas fa-calendar-alt"></i> ${formatDate(goal.startDate)} - ${formatDate(goal.endDate)}</div>
            <div><i class="fas fa-clock"></i> ${daysLeft} päivää jäljellä</div>
        `;
    }
    
    // Määritä tavoitearvo ja edistymisteksti
    const targetValueHtml = getTargetValueHtml(goal, progress);
    
    return `
        <li class="goal-item" data-id="${goal.id}">
            <div class="goal-item-header">
                <h4 class="goal-title"><i class="${icon}"></i> ${goal.title}</h4>
                <div class="goal-badges">
                    ${statusBadge}
                </div>
            </div>
            <div class="goal-description">
                ${goal.description || 'Ei kuvausta.'}
            </div>
            <div class="goal-target">
                <div class="goal-target-header">
                    <div class="goal-target-label">${goal.completed ? 'Tulos' : 'Edistyminen'}</div>
                    <div class="goal-target-value">${targetValueHtml}</div>
                </div>
                <div class="goal-progress-bar">
                    <div class="goal-progress-fill ${progressClass}" style="width: ${Math.min(100, Math.max(0, progress || 0))}%"></div>
                </div>
            </div>
            <div class="goal-footer">
                <div class="goal-timeframe">
                    ${timeframeHtml}
                </div>
                <div class="goal-actions">
                    <button class="goal-action-btn edit" data-id="${goal.id}"><i class="fas fa-edit"></i></button>
                    <button class="goal-action-btn delete" data-id="${goal.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </li>
    `;
}

// Hae tavoitteen edistymisteksti tavoitetyypin mukaan
function getTargetValueHtml(goal, progress) {
    switch (goal.type) {
        case 'weight':
            const currentWeight = getLatestValue('weight') || goal.startValue;
            return `${Math.round(progress || 0)}% (${goal.startValue} kg → ${currentWeight} kg / ${goal.targetValue} kg)`;
        
        case 'sleep':
            // Laske, montako kertaa tavoite on saavutettu
            const sleepTarget = goal.targetValue || 7;
            const sleepEntries = getEntriesBetweenDates(goal.startDate, goal.endDate)
                .filter(entry => entry.sleep_hours != null);
            
            const successfulDays = sleepEntries.filter(entry => entry.sleep_hours >= sleepTarget).length;
            const totalDays = sleepEntries.length;
            
            if (totalDays === 0) {
                return 'Ei riittävästi tietoja';
            }
            
            return `${Math.round(progress || 0)}% (${successfulDays}/${totalDays} päivää tavoitteessa)`;
        
        case 'mood':
            // Laske mielialan keskiarvo
            const moodEntries = getEntriesBetweenDates(goal.startDate, goal.endDate)
                .filter(entry => entry.mood != null);
            
            if (moodEntries.length === 0) {
                return 'Ei riittävästi tietoja';
            }
            
            const avgMood = moodEntries.reduce((sum, entry) => sum + parseFloat(entry.mood), 0) / moodEntries.length;
            return `${avgMood.toFixed(1)}/10 (tavoite: ${goal.targetValue}/10)`;
        
        default:
            return `${Math.round(progress || 0)}%`;
    }
}

// Laske tavoitteen edistyminen prosentteina
function calculateGoalProgress(goal) {
    if (goal.completed) return 100;
    
    switch (goal.type) {
        case 'weight':
            const currentWeight = getLatestValue('weight') || goal.startValue;
            const totalChange = goal.startValue - goal.targetValue;
            const currentChange = goal.startValue - currentWeight;
            
            // Jos tavoite on saavutettu (paino on tavoitteessa)
            if ((goal.targetDirection === 'decrease' && currentWeight <= goal.targetValue) ||
                (goal.targetDirection === 'increase' && currentWeight >= goal.targetValue)) {
                return 100;
            }
            
            
            // Jos totalChange on 0 tai lähellä nollaa, vältetään jakaminen nollalla
            if (Math.abs(totalChange) < 0.1) return 0;
            
            // Laske edistyminen prosentteina
            return (currentChange / Math.abs(totalChange)) * 100;
        
        case 'sleep':
            // Laske, montako kertaa tavoite on saavutettu
            const sleepTarget = goal.targetValue || 7;
            const sleepEntries = getEntriesBetweenDates(goal.startDate, goal.endDate)
                .filter(entry => entry.sleep_hours != null);
            
            const successfulDays = sleepEntries.filter(entry => entry.sleep_hours >= sleepTarget).length;
            const totalDays = sleepEntries.length;
            
            if (totalDays === 0) return 0;
            
            return (successfulDays / totalDays) * 100;
        
        case 'mood':
            // Laske mielialan keskiarvo
            const moodEntries = getEntriesBetweenDates(goal.startDate, goal.endDate)
                .filter(entry => entry.mood != null);
            
            if (moodEntries.length === 0) return 0;
            
            const avgMood = moodEntries.reduce((sum, entry) => sum + parseFloat(entry.mood), 0) / moodEntries.length;
            const targetMood = goal.targetValue || 7;
            
            // Jos tavoite on saavutettu
            if (avgMood >= targetMood) return 100;
            
            // Skaalaa 0-10 asteikolla
            return (avgMood / targetMood) * 100;
        
        default:
            return 0;
    }
}

// Hae edistymisluokka prosenttimäärän mukaan
function getProgressClass(progress) {
    if (progress >= 80) return 'good';
    if (progress >= 40) return ''; // default
    if (progress >= 20) return 'warning';
    return 'danger';
}

// Hae viimeisin arvo tietyn tyyppiselle merkinnälle
function getLatestValue(type) {
    if (!allEntries || allEntries.length === 0) return null;
    
    // Järjestä merkinnät päivämäärän mukaan (uusin ensin)
    const sortedEntries = [...allEntries].sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));
    
    // Etsi ensimmäinen merkintä, jossa on haluttu arvo
    switch (type) {
        case 'weight':
            const weightEntry = sortedEntries.find(entry => entry.weight != null);
            return weightEntry ? parseFloat(weightEntry.weight) : null;
        
        case 'sleep':
            const sleepEntry = sortedEntries.find(entry => entry.sleep_hours != null);
            return sleepEntry ? parseFloat(sleepEntry.sleep_hours) : null;
        
        case 'mood':
            const moodEntry = sortedEntries.find(entry => entry.mood != null);
            return moodEntry ? parseFloat(moodEntry.mood) : null;
        
        default:
            return null;
    }
}

// Hae merkinnät tietyltä aikaväliltä
function getEntriesBetweenDates(startDate, endDate) {
    if (!allEntries || allEntries.length === 0) return [];
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return allEntries.filter(entry => {
        const entryDate = new Date(entry.entry_date);
        return entryDate >= start && entryDate <= end;
    });
}

// Lisää tapahtumankäsittelijät tavoite-elementeille
function addGoalItemEventListeners() {
    // Muokkaa-napit
    document.querySelectorAll('.goal-action-btn.edit').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const goalId = button.getAttribute('data-id');
            openEditGoalModal(goalId);
        });
    });
    
    // Poista-napit
    document.querySelectorAll('.goal-action-btn.delete').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const goalId = button.getAttribute('data-id');
            openDeleteGoalModal(goalId);
        });
    });
}

// Avaa uuden tavoitteen lisäysmodaali
function openNewGoalModal() {
    goalModalTitle.textContent = 'Lisää uusi tavoite';
    goalId.value = '';
    goalTitle.value = '';
    goalDescription.value = '';
    
    // Aseta oletusarvoiset päivämäärät
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(today.getMonth() + 1);
    
    goalStartDate.value = formatDateForInput(today);
    goalEndDate.value = formatDateForInput(oneMonthLater);
    
    // Nollaa tavoitetyyppi ja valitse viimeksi käytetty tyyppi
    selectGoalType(lastSelectedGoalType);
    
    // Näytä modaali
    goalModal.classList.add('show');
}

// Avaa tavoitteen muokkausmodaali
function openEditGoalModal(id) {
    const goal = allGoals.find(g => g.id == id);
    if (!goal) return;
    
    goalModalTitle.textContent = 'Muokkaa tavoitetta';
    goalId.value = goal.id;
    goalTitle.value = goal.title || '';
    goalDescription.value = goal.description || '';
    goalStartDate.value = formatDateForInput(goal.startDate || new Date());
    goalEndDate.value = formatDateForInput(goal.endDate || new Date());
    
    // Valitse tavoitetyyppi
    selectGoalType(goal.type || 'weight');
    
    // Täytä tavoitearvot
    setTimeout(() => {
        const targetInput = document.getElementById('goal-target-value');
        if (targetInput) targetInput.value = goal.targetValue || '';
        
        const startValueInput = document.getElementById('goal-start-value');
        if (startValueInput) startValueInput.value = goal.startValue || '';
        
        const directionSelect = document.getElementById('goal-target-direction');
        if (directionSelect) directionSelect.value = goal.targetDirection || 'decrease';
    }, 100);
    
    // Näytä modaali
    goalModal.classList.add('show');
}

// Avaa tavoitteen poistomodaali
function openDeleteGoalModal(id) {
    const goal = allGoals.find(g => g.id == id);
    if (!goal) return;
    
    deleteGoalTitle.textContent = goal.title;
    currentGoalId = goal.id;
    
    // Näytä modaali
    deleteGoalModal.classList.add('show');
}

// Sulje tavoitemodaali
function closeGoalModalHandler() {
    goalModal.classList.remove('show');
}

// Sulje poistomodaali
function closeDeleteGoalModalHandler() {
    deleteGoalModal.classList.remove('show');
}

// Tallenna tavoite
function saveGoal(formData) {
    // Määritä id:t uudelle tai muokattavalle tavoitteelle
    const id = formData.get('goal-id') || Date.now().toString();
    
    // Löydä mahdollinen olemassa oleva tavoite
    const existingGoalIndex = allGoals.findIndex(g => g.id == id);
    
    // Kerää tavoitteen perustiedot
    const goal = {
        id,
        title: formData.get('title'),
        type: formData.get('type'),
        description: formData.get('description'),
        startDate: formData.get('start_date'),
        endDate: formData.get('end_date'),
        created: existingGoalIndex >= 0 ? allGoals[existingGoalIndex].created : new Date(),
        modified: new Date()
    };
    
    // Lisää tyyppikohtaiset tiedot
    switch (goal.type) {
        case 'weight':
            goal.startValue = parseFloat(formData.get('start_value')) || getLatestValue('weight') || 70;
            goal.targetValue = parseFloat(formData.get('target_value')) || 65;
            goal.targetDirection = formData.get('target_direction') || 'decrease';
            break;
        
        case 'sleep':
            goal.targetValue = parseFloat(formData.get('target_value')) || 7;
            break;
        
        case 'mood':
            goal.targetValue = parseFloat(formData.get('target_value')) || 7;
            break;
        
        case 'custom':
            goal.startValue = parseFloat(formData.get('start_value')) || 0;
            goal.targetValue = parseFloat(formData.get('target_value')) || 100;
            goal.targetDirection = formData.get('target_direction') || 'increase';
            goal.unit = formData.get('unit') || '%';
            break;
    }
    
    // Tarkista onko tavoite jo saavutettu
    const progress = calculateGoalProgress(goal);
    if (progress >= 100 && !goal.completed) {
        goal.completed = true;
        goal.completedDate = new Date();
    }
    
    // Tallenna tavoite
    if (existingGoalIndex >= 0) {
        // Säilytä completed ja completedDate arvot, jos ne olivat jo asetettu
        if (allGoals[existingGoalIndex].completed) {
            goal.completed = true;
            goal.completedDate = allGoals[existingGoalIndex].completedDate;
        }
        
        allGoals[existingGoalIndex] = goal;
    } else {
        allGoals.push(goal);
    }
    
    // Tallenna viimeisin tavoitetyyppi
    lastSelectedGoalType = goal.type;
    
    // Päivitä tavoitteet
    saveGoals();
    renderGoals();
    
    // Sulje modaali
    closeGoalModalHandler();
    
    // Näytä ilmoitus
    showToast(existingGoalIndex >= 0 ? 'Tavoite päivitetty' : 'Uusi tavoite lisätty', 'success');
}

// Poista tavoite
function deleteGoal(id) {
    // Etsi tavoitteen indeksi
    const goalIndex = allGoals.findIndex(g => g.id == id);
    
    if (goalIndex >= 0) {
        // Poista tavoite
        allGoals.splice(goalIndex, 1);
        
        // Päivitä tavoitteet
        saveGoals();
        renderGoals();
        
        // Näytä ilmoitus
        showToast('Tavoite poistettu', 'success');
    }
    
    // Sulje modaali
    closeDeleteGoalModalHandler();
}

// Valitse tavoitetyyppi
function selectGoalType(type) {
    // Nollaa aiempi valinta
    goalTypeOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    // Valitse uusi tavoitetyyppi
    const selectedOption = document.querySelector(`.goal-type-option[data-type="${type}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    // Aseta tavoitetyyppi lomakkeeseen
    if (goalType) {
        goalType.value = type;
    }
    
    // Päivitä tavoitearvot tyypin mukaan
    updateGoalTargetFields(type);
    
    // Tallenna viimeisin tavoitetyyppi
    lastSelectedGoalType = type;
}

// Päivitä tavoitearvot tyypin mukaan
function updateGoalTargetFields(type) {
    if (!goalTargetContainer) return;
    
    let html = '';
    
    switch (type) {
        case 'weight':
            const currentWeight = getLatestValue('weight') || 70;
            
            html = `
                <div class="form-row">
                    <div class="form-group">
                        <label for="goal-start-value">Lähtöpaino (kg)</label>
                        <input type="number" id="goal-start-value" name="start_value" step="0.1" value="${currentWeight}" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="goal-target-value">Tavoitepaino (kg)</label>
                        <input type="number" id="goal-target-value" name="target_value" step="0.1" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="goal-target-direction">Tavoitteen suunta</label>
                    <select id="goal-target-direction" name="target_direction">
                        <option value="decrease">Pudottaa painoa</option>
                        <option value="increase">Nostaa painoa</option>
                    </select>
                </div>
            `;
            break;
        
        case 'sleep':
            html = `
                <div class="form-group">
                    <label for="goal-target-value">Tavoiteuni (tuntia)</label>
                    <input type="number" id="goal-target-value" name="target_value" step="0.5" min="0" max="24" value="7" required>
                    <p class="form-help">Tavoite on nukkua vähintään tämä määrä unta öisin.</p>
                </div>
            `;
            break;
        
        case 'mood':
            html = `
                <div class="form-group">
                    <label for="goal-target-value">Tavoitemieliala (0-10)</label>
                    <input type="number" id="goal-target-value" name="target_value" min="0" max="10" step="0.5" value="7" required>
                    <p class="form-help">Tavoite on saavuttaa vähintään tämä mielialan keskiarvo.</p>
                </div>
            `;
            break;
        
        case 'custom':
            html = `
                <div class="form-row">
                    <div class="form-group">
                        <label for="goal-start-value">Lähtöarvo</label>
                        <input type="number" id="goal-start-value" name="start_value" step="0.1" value="0" required>
                    </div>
                    <div class="form-group">
                        <label for="goal-target-value">Tavoitearvo</label>
                        <input type="number" id="goal-target-value" name="target_value" step="0.1" value="100" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="goal-target-direction">Tavoitteen suunta</label>
                        <select id="goal-target-direction" name="target_direction">
                            <option value="increase">Kasvattaa arvoa</option>
                            <option value="decrease">Vähentää arvoa</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="goal-unit">Mittayksikkö</label>
                        <input type="text" id="goal-unit" name="unit" placeholder="esim. kg, m, kpl..." value="%">
                    </div>
                </div>
            `;
            break;
    }
    
    goalTargetContainer.innerHTML = html;
}

// Aputoiminto päivämäärän formatointiin lomaketta varten
function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Hae merkinnät
async function fetchAllEntries() {
    try {
        const entries = await getEntries();
        allEntries = entries;
        
        // Päivitä tavoitteet
        renderGoals();
        
        return entries;
    } catch (error) {
        console.error('Virhe merkintöjen hakemisessa:', error);
        showToast('Merkintöjen hakeminen epäonnistui', 'error');
    }
}

// Mobiilinavigaation toiminnallisuus
function initializeMobileNav() {
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            mobileNav.classList.add('active');
            mobileNavBackdrop.classList.add('active');
        });
    }
    
    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            mobileNavBackdrop.classList.remove('active');
        });
    }
    
    if (mobileNavBackdrop) {
        mobileNavBackdrop.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            mobileNavBackdrop.classList.remove('active');
        });
    }
    
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '../index.html';
        });
    }
}

// Tapahtumankäsittelijät
document.addEventListener('DOMContentLoaded', () => {
    // Alusta mobiilinavigaatio
    initializeMobileNav();
    
    // Hae merkinnät
    fetchAllEntries();
    
    // Lataa tavoitteet
    loadGoals();
    
    // Lisää tapahtumankäsittelijät
    if (addGoalBtn) {
        addGoalBtn.addEventListener('click', openNewGoalModal);
    }
    
    if (closeGoalModal) {
        closeGoalModal.addEventListener('click', closeGoalModalHandler);
    }
    
    if (closeDeleteGoalModal) {
        closeDeleteGoalModal.addEventListener('click', closeDeleteGoalModalHandler);
    }
    
    if (deleteGoalCancelBtn) {
        deleteGoalCancelBtn.addEventListener('click', closeDeleteGoalModalHandler);
    }
    
    if (deleteGoalConfirmBtn) {
        deleteGoalConfirmBtn.addEventListener('click', () => {
            if (currentGoalId) {
                deleteGoal(currentGoalId);
            }
        });
    }
    
    // Tavoitetyypin valinta
    goalTypeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const type = option.getAttribute('data-type');
            selectGoalType(type);
        });
    });
    
    // Tavoitteen tallennuslomake
    if (goalForm) {
        goalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(goalForm);
            saveGoal(formData);
        });
    }
    
    // Sulje modaali, kun klikataan taustaa
    window.addEventListener('click', (e) => {
        if (e.target === goalModal) {
            closeGoalModalHandler();
        }
        if (e.target === deleteGoalModal) {
            closeDeleteGoalModalHandler();
        }
    });
});