// Debugging helpers
window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
});

function debugElement(id, name) {
    const element = document.getElementById(id);
    console.log(`Element ${name} (${id}): ${element ? 'FOUND' : 'NOT FOUND'}`);
    return element;
}

// Test API connection
async function testApiConnection() {
    try {
        console.log('Testing API connection...');
        const goals = await getGoals();
        console.log('API connection successful, got', goals.length, 'goals');
        return true;
    } catch (error) {
        console.error('API connection test failed:', error);
        return false;
    }
}

// Tavoitesivun toiminnallisuudet
import { checkAuth, showToast, formatDate, formatDateForInput } from './main.js';
import { getEntries } from './api.js';
import { getGoals, getGoalById, addGoal, updateGoal, deleteGoal, completeGoal } from './api-goals.js';

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

// Tavoitteiden lataus API:n kautta
async function loadGoals() {
    try {
        const goals = await getGoals();
        allGoals = goals;
        renderGoals();
    } catch (error) {
        console.error('Virhe tavoitteiden haussa:', error);
        showToast('Tavoitteiden hakeminen epäonnistui', 'error');
    }
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
            <div><i class="fas fa-calendar-alt"></i> ${formatDate(goal.start_date)} - ${formatDate(goal.end_date)}</div>
            <div><i class="fas fa-check"></i> Saavutettu ${formatDate(goal.completed_date || new Date())}</div>
        `;
    } else {
        // Tarkista, onko tavoite myöhässä
        const now = new Date();
        const endDate = new Date(goal.end_date);
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
            <div><i class="fas fa-calendar-alt"></i> ${formatDate(goal.start_date)} - ${formatDate(goal.end_date)}</div>
            <div><i class="fas fa-clock"></i> ${daysLeft} päivää jäljellä</div>
        `;
    }
    
    // Määritä tavoitearvo ja edistymisteksti
    const targetValueHtml = getTargetValueHtml(goal, progress);
    
    return `
        <li class="goal-item" data-id="${goal.goal_id}">
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
                    <button class="goal-action-btn edit" data-id="${goal.goal_id}"><i class="fas fa-edit"></i></button>
                    <button class="goal-action-btn delete" data-id="${goal.goal_id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </li>
    `;
}

// Rest of your functions remain mostly the same, with updates to use the backend API

// Hae tavoitteen edistymisteksti tavoitetyypin mukaan
function getTargetValueHtml(goal, progress) {
    switch (goal.type) {
        case 'weight':
            const currentWeight = getLatestValue('weight') || goal.start_value;
            return `${Math.round(progress || 0)}% (${goal.start_value} kg → ${currentWeight} kg / ${goal.target_value} kg)`;
        
        case 'sleep':
            // Laske, montako kertaa tavoite on saavutettu
            const sleepTarget = goal.target_value || 7;
            const sleepEntries = getEntriesBetweenDates(goal.start_date, goal.end_date)
                .filter(entry => entry.sleep_hours != null);
            
            const successfulDays = sleepEntries.filter(entry => entry.sleep_hours >= sleepTarget).length;
            const totalDays = sleepEntries.length;
            
            if (totalDays === 0) {
                return 'Ei riittävästi tietoja';
            }
            
            return `${Math.round(progress || 0)}% (${successfulDays}/${totalDays} päivää tavoitteessa)`;
        
        case 'mood':
            // Laske mielialan keskiarvo
            const moodEntries = getEntriesBetweenDates(goal.start_date, goal.end_date)
                .filter(entry => entry.mood != null);
            
            if (moodEntries.length === 0) {
                return 'Ei riittävästi tietoja';
            }
            
            const avgMood = moodEntries.reduce((sum, entry) => sum + parseFloat(entry.mood), 0) / moodEntries.length;
            return `${avgMood.toFixed(1)}/10 (tavoite: ${goal.target_value}/10)`;
        
        default:
            return `${Math.round(progress || 0)}%`;
    }
}

// Laske tavoitteen edistyminen prosentteina
function calculateGoalProgress(goal) {
    if (goal.completed) return 100;
    
    switch (goal.type) {
        case 'weight':
            const currentWeight = getLatestValue('weight') || goal.start_value;
            const totalChange = goal.start_value - goal.target_value;
            const currentChange = goal.start_value - currentWeight;
            
            // Jos tavoite on saavutettu (paino on tavoitteessa)
            if ((goal.target_direction === 'decrease' && currentWeight <= goal.target_value) ||
                (goal.target_direction === 'increase' && currentWeight >= goal.target_value)) {
                return 100;
            }
            
            // Jos totalChange on 0 tai lähellä nollaa, vältetään jakaminen nollalla
            if (Math.abs(totalChange) < 0.1) return 0;
            
            // Laske edistyminen prosentteina
            return (currentChange / Math.abs(totalChange)) * 100;
        
        case 'sleep':
            // Laske, montako kertaa tavoite on saavutettu
            const sleepTarget = goal.target_value || 7;
            const sleepEntries = getEntriesBetweenDates(goal.start_date, goal.end_date)
                .filter(entry => entry.sleep_hours != null);
            
            const successfulDays = sleepEntries.filter(entry => entry.sleep_hours >= sleepTarget).length;
            const totalDays = sleepEntries.length;
            
            if (totalDays === 0) return 0;
            
            return (successfulDays / totalDays) * 100;
        
        case 'mood':
            // Laske mielialan keskiarvo
            const moodEntries = getEntriesBetweenDates(goal.start_date, goal.end_date)
                .filter(entry => entry.mood != null);
            
            if (moodEntries.length === 0) return 0;
            
            const avgMood = moodEntries.reduce((sum, entry) => sum + parseFloat(entry.mood), 0) / moodEntries.length;
            const targetMood = goal.target_value || 7;
            
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

function openNewGoalModal() {
    console.log('Opening new goal modal');
    
    if (!goalModal) {
        console.error('Goal modal not found');
        return;
    }
    
    goalModalTitle.textContent = 'Lisää uusi tavoite';
    
    // Clear form
    if (goalForm) goalForm.reset();
    if (goalId) goalId.value = '';
    if (goalTitle) goalTitle.value = '';
    if (goalDescription) goalDescription.value = '';
    
    // Aseta oletusarvoiset päivämäärät
    const today = new Date();
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(today.getMonth() + 1);
    
    if (goalStartDate) goalStartDate.value = formatDateForInput(today);
    if (goalEndDate) goalEndDate.value = formatDateForInput(oneMonthLater);
    
    // Nollaa tavoitetyyppi ja valitse viimeksi käytetty tyyppi
    selectGoalType(lastSelectedGoalType || 'weight');
    
    // This is critical - make the modal visible
    console.log('Adding show class to modal');
    goalModal.style.display = 'block'; // Add this direct style
    goalModal.classList.add('show');
    
    // Debug whether the show class worked
    console.log('Modal classes after:', goalModal.className);
    console.log('Modal display style:', goalModal.style.display);
}

// Avaa tavoitteen muokkausmodaali
function openEditGoalModal(id) {
    console.log('Opening edit goal modal for ID:', id);
    
    if (!goalModal) {
        console.error('Goal modal not found');
        return;
    }
    
    try {
        goalModalTitle.textContent = 'Muokkaa tavoitetta';
        
        // Hae tavoitteen tiedot API:sta
        console.log('Fetching goal data from API...');
        getGoalById(id).then(goal => {
            console.log('Goal data received:', goal);
            
            if (goalId) goalId.value = goal.goal_id;
            if (goalTitle) goalTitle.value = goal.title || '';
            if (goalDescription) goalDescription.value = goal.description || '';
            if (goalStartDate) goalStartDate.value = formatDateForInput(goal.start_date || new Date());
            if (goalEndDate) goalEndDate.value = formatDateForInput(goal.end_date || new Date());
            
            // Valitse tavoitetyyppi
            selectGoalType(goal.type || 'weight');
            
            // Täytä tavoitearvot
            setTimeout(() => {
                const targetInput = document.getElementById('goal-target-value');
                if (targetInput) targetInput.value = goal.target_value || '';
                
                const startValueInput = document.getElementById('goal-start-value');
                if (startValueInput) startValueInput.value = goal.start_value || '';
                
                const directionSelect = document.getElementById('goal-target-direction');
                if (directionSelect) directionSelect.value = goal.target_direction || 'decrease';
            }, 100);
            
            // Make the modal visible
            goalModal.style.display = 'block'; // Direct style
            goalModal.classList.add('show');
        }).catch(error => {
            console.error('Error fetching goal:', error);
            showToast('Tavoitteen tietojen hakeminen epäonnistui', 'error');
        });
    } catch (error) {
        console.error('Error in openEditGoalModal:', error);
        showToast('Tavoitteen tietojen hakeminen epäonnistui', 'error');
    }
}



// Avaa tavoitteen poistomodaali
function openDeleteGoalModal(id) {
    console.log('Opening delete goal modal for ID:', id);
    
    if (!deleteGoalModal) {
        console.error('Delete goal modal not found');
        return;
    }
    
    const goal = allGoals.find(g => g.goal_id == id);
    if (!goal) {
        console.error('Goal not found in allGoals');
        return;
    }
    
    if (deleteGoalTitle) deleteGoalTitle.textContent = goal.title;
    currentGoalId = goal.goal_id;
    
    // Make the modal visible
    deleteGoalModal.style.display = 'block'; // Direct style
    deleteGoalModal.classList.add('show');
}

// Sulje tavoitemodaali
function closeGoalModalHandler() {
    console.log('Closing goal modal');
    
    if (!goalModal) {
        console.error('Goal modal not found');
        return;
    }
    
    goalModal.classList.remove('show');
    // Additional way to hide the modal
    setTimeout(() => {
        goalModal.style.display = 'none';
    }, 300); // Short delay to allow for animation
}

// Sulje poistomodaali
function closeDeleteGoalModalHandler() {
    console.log('Closing delete goal modal');
    
    if (!deleteGoalModal) {
        console.error('Delete goal modal not found');
        return;
    }
    
    deleteGoalModal.classList.remove('show');
    // Additional way to hide the modal
    setTimeout(() => {
        deleteGoalModal.style.display = 'none';
    }, 300); // Short delay to allow for animation
}

// Tallenna tavoite
async function saveGoal(formData) {
    try {
        // Määritä id:t uudelle tai muokattavalle tavoitteelle
        const id = formData.get('goal-id');
        
        // Kerää tavoitteen perustiedot
        const goalData = {
            title: formData.get('title'),
            type: formData.get('type'),
            description: formData.get('description'),
            start_date: formData.get('start_date'),
            end_date: formData.get('end_date')
        };
        
        // Lisää tyyppikohtaiset tiedot
        switch (goalData.type) {
            case 'weight':
                goalData.start_value = parseFloat(formData.get('start_value')) || getLatestValue('weight') || 70;
                goalData.target_value = parseFloat(formData.get('target_value')) || 65;
                goalData.target_direction = formData.get('target_direction') || 'decrease';
                goalData.unit = 'kg';
                break;
            
            case 'sleep':
                goalData.target_value = parseFloat(formData.get('target_value')) || 7;
                goalData.unit = 'h';
                break;
            
            case 'mood':
                goalData.target_value = parseFloat(formData.get('target_value')) || 7;
                break;
            
            case 'custom':
                goalData.start_value = parseFloat(formData.get('start_value')) || 0;
                goalData.target_value = parseFloat(formData.get('target_value')) || 100;
                goalData.target_direction = formData.get('target_direction') || 'increase';
                goalData.unit = formData.get('unit') || '%';
                break;
        }
        
        if (id) {
            // Päivitä olemassa oleva tavoite
            await updateGoal(id, goalData);
            showToast('Tavoite päivitetty', 'success');
        } else {
            // Lisää uusi tavoite
            await addGoal(goalData);
            showToast('Uusi tavoite lisätty', 'success');
        }
        
        // Tallenna viimeisin tavoitetyyppi
        lastSelectedGoalType = goalData.type;
        
        // Päivitä tavoitteet
        await loadGoals();
        
        // Sulje modaali
        closeGoalModalHandler();
    } catch (error) {
        console.error('Virhe tavoitteen tallentamisessa:', error);
        showToast('Tavoitteen tallentaminen epäonnistui: ' + error.message, 'error');
    }
}

// Poista tavoite
async function deleteGoalFromAPI(id) {
    try {
        // Poista tavoite
        await deleteGoal(id);
        
        // Päivitä tavoitteet
        await loadGoals();
        
        // Näytä ilmoitus
        showToast('Tavoite poistettu', 'success');
    } catch (error) {
        console.error('Virhe tavoitteen poistamisessa:', error);
        showToast('Tavoitteen poistaminen epäonnistui: ' + error.message, 'error');
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
    // Test API connection
    testApiConnection();

    // Ensure modals have the right base styles in case CSS is missing
    if (goalModal) {
        goalModal.style.position = 'fixed';
        goalModal.style.zIndex = '100';
        goalModal.style.left = '0';
        goalModal.style.top = '0';
        goalModal.style.width = '100%';
        goalModal.style.height = '100%';
        goalModal.style.overflow = 'auto';
        goalModal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        goalModal.style.display = 'none'; // Hidden by default
    }

    if (deleteGoalModal) {
        deleteGoalModal.style.position = 'fixed';
        deleteGoalModal.style.zIndex = '100';
        deleteGoalModal.style.left = '0';
        deleteGoalModal.style.top = '0';
        deleteGoalModal.style.width = '100%';
        deleteGoalModal.style.height = '100%';
        deleteGoalModal.style.overflow = 'auto';
        deleteGoalModal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        deleteGoalModal.style.display = 'none'; // Hidden by default
    }

    // After 1 second, inspect modal structure
    setTimeout(() => {
        if (goalModal) {
            console.log('Modal HTML structure:');
            console.log(goalModal.outerHTML);
        }
    }, 1000);

    // Alusta mobiilinavigaatio
    initializeMobileNav();

    // Hae merkinnät ja tavoitteet
    fetchAllEntries();
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
                deleteGoalFromAPI(currentGoalId);
            }
        });
    }
});

    
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