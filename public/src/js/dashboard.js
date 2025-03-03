// Dashboard-toiminnallisuudet
import { getEntries, addEntry, getEntryById, updateEntry, deleteEntry } from './api.js';
import { checkAuth, showToast, formatDate, formatDateForInput } from './main.js';

// Varmistetaan, että käyttäjä on kirjautunut
if (!checkAuth()) {
    // Jos ei kirjautunut, main.js ohjaa kirjautumissivulle
    throw new Error('Ei kirjautunut sisään');
}

// Globaalit muuttujat
let currentDate = new Date();
let allEntries = [];
let currentEntryId = null;

// DOM-elementit
const calendarContainer = document.getElementById('calendar-container');
const currentMonthEl = document.getElementById('current-month');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const recentEntriesEl = document.getElementById('recent-entries');
const quickEntryForm = document.getElementById('quick-entry-form');
const entryDateInput = document.getElementById('entry-date');
const entryModal = document.getElementById('entry-modal');
const entryForm = document.getElementById('entry-form');
const modalTitle = document.getElementById('modal-title');
const closeModalBtn = document.getElementById('close-modal');
const deleteEntryBtn = document.getElementById('delete-entry');
const avgMoodEl = document.getElementById('avg-mood');
const avgSleepEl = document.getElementById('avg-sleep');
const latestWeightEl = document.getElementById('latest-weight');

// Uudet sliderin elementit
const moodSlider = document.getElementById('entry-mood-slider');
const moodValue = document.getElementById('mood-value');
const moodInput = document.getElementById('entry-mood');
const modalMoodSlider = document.getElementById('modal-entry-mood-slider');
const modalMoodValue = document.getElementById('modal-mood-value');
const modalMoodInput = document.getElementById('modal-entry-mood');

// Alusta päivämäärä lomakkeeseen
function initializeDate() {
    const today = new Date();
    entryDateInput.value = formatDateForInput(today);
}

// Hae kaikki merkinnät
async function fetchAllEntries() {
    try {
        const entries = await getEntries();
        allEntries = entries;
        displayRecentEntries();
        updateStats();
        renderCalendar();
    } catch (error) {
        console.error('Virhe merkintöjen hakemisessa:', error);
        showToast('Merkintöjen hakeminen epäonnistui', 'error');
    }
}

// Näytä viimeisimmät merkinnät
function displayRecentEntries() {
    if (!recentEntriesEl) return;

    if (allEntries.length === 0) {
        recentEntriesEl.innerHTML = '<p>Ei merkintöjä.</p>';
        return;
    }

    // Järjestä merkinnät päivämäärän mukaan (uusimmat ensin)
    const sortedEntries = [...allEntries].sort((a, b) => 
        new Date(b.entry_date) - new Date(a.entry_date)
    );

    // Näytä 5 viimeisintä merkintää
    const recentEntries = sortedEntries.slice(0, 5);

    recentEntriesEl.innerHTML = recentEntries.map(entry => {
        // Määritä mielialan ikoni ja väri arvon perusteella
        let moodIcon, moodColor;
        const moodValue = parseInt(entry.mood);
        
        if (moodValue <= 2) {
            moodIcon = 'fa-face-frown';
            moodColor = '#e74c3c';
        } else if (moodValue <= 4) {
            moodIcon = 'fa-face-meh';
            moodColor = '#e67e22';
        } else if (moodValue <= 6) {
            moodIcon = 'fa-face-smile';
            moodColor = '#f1c40f';
        } else if (moodValue <= 8) {
            moodIcon = 'fa-face-smile-beam';
            moodColor = '#2ecc71';
        } else {
            moodIcon = 'fa-face-grin-stars';
            moodColor = '#27ae60';
        }
        
        return `
            <div class="recent-entry" data-id="${entry.entry_id}">
                <div class="recent-entry-header">
                    <div class="recent-entry-date">
                        <i class="fas fa-calendar-day"></i> ${formatDate(entry.entry_date)}
                    </div>
                    <div class="recent-entry-mood" style="color: ${moodColor};">
                        <i class="fas ${moodIcon}"></i> ${entry.mood}/10
                    </div>
                </div>
                <div class="recent-entry-notes">
                    ${entry.notes ? entry.notes : 'Ei muistiinpanoja'}
                </div>
            </div>
        `;
    }).join('');

    // Lisää click-tapahtuma merkinnöille
    document.querySelectorAll('.recent-entry').forEach(item => {
        item.addEventListener('click', () => {
            const entryId = item.dataset.id;
            openEntryModal(entryId);
        });
    });
}

// Päivitä tilastot
function updateStats() {
    if (!avgMoodEl || !avgSleepEl || !latestWeightEl) return;

    if (allEntries.length === 0) {
        avgMoodEl.textContent = '-';
        avgSleepEl.textContent = '-';
        latestWeightEl.textContent = '-';
        return;
    }

    // Keskimääräinen mieliala
    const moodEntries = allEntries.filter(entry => entry.mood != null);
    if (moodEntries.length > 0) {
        const avgMood = moodEntries.reduce((sum, entry) => sum + parseFloat(entry.mood), 0) / moodEntries.length;
        avgMoodEl.textContent = `${avgMood.toFixed(1)}/10`;
    } else {
        avgMoodEl.textContent = '-';
    }

    // Keskimääräinen uni
    const sleepEntries = allEntries.filter(entry => entry.sleep_hours != null);
    if (sleepEntries.length > 0) {
        const avgSleep = sleepEntries.reduce((sum, entry) => sum + entry.sleep_hours, 0) / sleepEntries.length;
        avgSleepEl.textContent = `${avgSleep.toFixed(1)} h`;
    } else {
        avgSleepEl.textContent = '-';
    }

    // Viimeisin paino
    const weightEntries = allEntries
        .filter(entry => entry.weight != null)
        .sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));
    
    if (weightEntries.length > 0) {
        latestWeightEl.textContent = `${weightEntries[0].weight} kg`;
    } else {
        latestWeightEl.textContent = '-';
    }
}

// Renderöi kalenteri
function renderCalendar() {
    if (!calendarContainer || !currentMonthEl) return;

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
        
        // Tarkista, onko päivälle merkintöjä
        const dayEntries = allEntries.filter(entry => {
            const entryDate = new Date(entry.entry_date);
            return entryDate.getDate() === i && 
                   entryDate.getMonth() === month && 
                   entryDate.getFullYear() === year;
        });
        
        // Koosta päivän HTML
        calendarHTML += `
            <div class="calendar-day${isToday ? ' today' : ''}${dayEntries.length > 0 ? ' has-entry' : ''}" data-date="${dateString}">
                <div class="calendar-day-number">${i}</div>
                <div class="calendar-day-entries">
                    ${dayEntries.map(entry => {
                        // Määritä väri mielialan mukaan
                        let color = '#3498db'; // Oletus
                        const moodValue = parseInt(entry.mood);
                        
                        if (moodValue <= 2) {
                            color = '#e74c3c';
                        } else if (moodValue <= 4) {
                            color = '#e67e22';
                        } else if (moodValue <= 6) {
                            color = '#f1c40f';
                        } else if (moodValue <= 8) {
                            color = '#2ecc71';
                        } else {
                            color = '#27ae60';
                        }
                        
                        return `<div class="calendar-entry-indicator" style="background-color: ${color};" title="Mieliala: ${entry.mood}/10"></div>`;
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
    calendarContainer.innerHTML = calendarHTML;
    
    // Lisää click-tapahtuma päiville
    document.querySelectorAll('.calendar-day').forEach(day => {
        day.addEventListener('click', () => {
            const dateString = day.dataset.date;
            openNewEntryModal(dateString);
        });
    });
}

// Vaihda kuukautta eteen- tai taaksepäin
function changeMonth(amount) {
    currentDate.setMonth(currentDate.getMonth() + amount);
    renderCalendar();
}

// Avaa uuden merkinnän lisäysmodaali
function openNewEntryModal(dateString) {
    modalTitle.textContent = 'Lisää uusi merkintä';
    document.getElementById('entry-id').value = '';
    document.getElementById('modal-entry-date').value = dateString || formatDateForInput(new Date());
    
    // Alusta slider keskiarvoon (5)
    modalMoodSlider.value = 5;
    modalMoodValue.textContent = 5;
    modalMoodInput.value = 5;
    updateMoodColor(5, modalMoodValue);
    
    document.getElementById('modal-entry-weight').value = '';
    document.getElementById('modal-entry-sleep').value = '';
    document.getElementById('modal-entry-notes').value = '';
    
    deleteEntryBtn.style.display = 'none';
    currentEntryId = null;
    
    entryModal.classList.add('show');
}

// Avaa merkinnän muokkausmodaali
async function openEntryModal(entryId) {
    try {
        modalTitle.textContent = 'Muokkaa merkintää';
        
        const entry = await getEntryById(entryId);
        
        document.getElementById('entry-id').value = entry.entry_id;
        document.getElementById('modal-entry-date').value = formatDateForInput(entry.entry_date);
        
        // Aseta mieliala-sliderin arvo
        const moodValue = entry.mood || 5;
        modalMoodSlider.value = moodValue;
        modalMoodValue.textContent = moodValue;
        modalMoodInput.value = moodValue;
        updateMoodColor(moodValue, modalMoodValue);
        
        document.getElementById('modal-entry-weight').value = entry.weight || '';
        document.getElementById('modal-entry-sleep').value = entry.sleep_hours || '';
        document.getElementById('modal-entry-notes').value = entry.notes || '';
        
        deleteEntryBtn.style.display = 'block';
        currentEntryId = entry.entry_id;
        
        entryModal.classList.add('show');
    } catch (error) {
        console.error('Virhe merkinnän hakemisessa:', error);
        showToast('Merkinnän hakeminen epäonnistui', 'error');
    }
}

// Päivitä mieliala-arvon väri
function updateMoodColor(value, element) {
    value = parseInt(value);
    let color;
    
    if (value <= 2) {
        color = '#e74c3c'; // Punainen huonolle mielialalle
    } else if (value <= 4) {
        color = '#e67e22'; // Oranssi kohtalaisen huonolle mielialalle
    } else if (value <= 6) {
        color = '#f1c40f'; // Keltainen neutraalille mielialalle
    } else if (value <= 8) {
        color = '#2ecc71'; // Vihreä hyvälle mielialalle
    } else {
        color = '#27ae60'; // Tummanvihreä erinomaiselle mielialalle
    }
    
    element.style.backgroundColor = color;
    element.style.color = 'white';
}

// Sulje modaali
function closeModal() {
    entryModal.classList.remove('show');
}

// Tallenna merkintä
async function saveEntry(formData) {
    try {
        const entryData = {
            entry_date: formData.get('entry_date'),
            mood: formData.get('mood'),
            weight: formData.get('weight') ? parseFloat(formData.get('weight')) : null,
            sleep_hours: formData.get('sleep_hours') ? parseFloat(formData.get('sleep_hours')) : null,
            notes: formData.get('notes')
        };
        
        const entryId = formData.get('entry-id');
        
        if (entryId) {
            // Päivitä olemassa oleva merkintä
            await updateEntry(entryId, entryData);
            showToast('Merkintä päivitetty', 'success');
        } else {
            // Lisää uusi merkintä
            await addEntry(entryData);
            showToast('Merkintä lisätty', 'success');
        }
        
        // Hae päivitetyt merkinnät
        await fetchAllEntries();
        
        // Sulje modaali
        closeModal();
    } catch (error) {
        console.error('Virhe merkinnän tallentamisessa:', error);
        showToast('Merkinnän tallentaminen epäonnistui', 'error');
    }
}

// Poista merkintä
async function removeEntry(entryId) {
    if (!confirm('Haluatko varmasti poistaa tämän merkinnän?')) {
        return;
    }
    
    try {
        await deleteEntry(entryId);
        showToast('Merkintä poistettu', 'success');
        
        // Hae päivitetyt merkinnät
        await fetchAllEntries();
        
        // Sulje modaali
        closeModal();
    } catch (error) {
        console.error('Virhe merkinnän poistamisessa:', error);
        showToast('Merkinnän poistaminen epäonnistui', 'error');
    }
}

// Tapahtumankäsittelijät
document.addEventListener('DOMContentLoaded', () => {
    // Alusta päivämäärä lomakkeeseen
    initializeDate();
    
    // Hae merkinnät
    fetchAllEntries();
    
    // Mieliala sliderin toiminnallisuus
    if (moodSlider && moodValue && moodInput) {
        moodSlider.addEventListener('input', function() {
            const value = this.value;
            moodValue.textContent = value;
            moodInput.value = value;
            
            // Päivitä väri
            updateMoodColor(value, moodValue);
        });
        
        // Aseta alkuarvo
        updateMoodColor(moodSlider.value, moodValue);
    }
    
    // Lisää tapahtumankäsittelijät
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    }
    
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => changeMonth(1));
    }
    
    if (quickEntryForm) {
        quickEntryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(quickEntryForm);
            await saveEntry(formData);
            
            // Palauta mieliala-slider keskiarvoon
            if (moodSlider && moodValue) {
                moodSlider.value = 5;
                moodValue.textContent = 5;
                moodInput.value = 5;
                updateMoodColor(5, moodValue);
            }
            
            // Tyhjennä muut kentät, mutta säilytä päivämäärä
            document.getElementById('entry-weight').value = '';
            document.getElementById('entry-sleep').value = '';
            document.getElementById('entry-notes').value = '';
        });
    }
    
    if (entryForm) {
        entryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(entryForm);
            await saveEntry(formData);
        });
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    if (deleteEntryBtn) {
        deleteEntryBtn.addEventListener('click', () => {
            if (currentEntryId) {
                removeEntry(currentEntryId);
            }
        });
    }
    
    // Sulje modaali, kun klikataan taustaa
    window.addEventListener('click', (e) => {
        if (e.target === entryModal) {
            closeModal();
        }
    });
});