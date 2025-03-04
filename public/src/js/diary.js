// Päiväkirjamerkintöjen hallinta
import { getEntries, getEntryById, addEntry, updateEntry, deleteEntry } from './api.js';
import { checkAuth, showToast, formatDate, formatDateForInput } from './main.js';

// Varmistetaan, että käyttäjä on kirjautunut
if (!checkAuth()) {
    // Jos ei kirjautunut, main.js ohjaa kirjautumissivulle
    throw new Error('Ei kirjautunut sisään');
}

// Globaalit muuttujat
let allEntries = [];
let filteredEntries = [];
let currentEntryId = null;
let currentPage = 1;
const entriesPerPage = 6;

// DOM-elementit
const entriesList = document.getElementById('entries-list');
const entriesCount = document.getElementById('entries-count');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const dateFrom = document.getElementById('date-from');
const dateTo = document.getElementById('date-to');
const filterBtn = document.getElementById('filter-btn');
const clearFilterBtn = document.getElementById('clear-filter-btn');
const pagination = document.getElementById('pagination');
const addEntryBtn = document.getElementById('add-entry-btn');
const entryModal = document.getElementById('entry-modal');
const entryForm = document.getElementById('entry-form');
const modalTitle = document.getElementById('modal-title');
const closeModalBtn = document.getElementById('close-modal');
const deleteEntryBtn = document.getElementById('delete-entry');

// Hae kaikki merkinnät
async function fetchAllEntries() {
    try {
        entriesList.innerHTML = '<p class="loading">Ladataan merkintöjä...</p>';
        
        const entries = await getEntries();
        allEntries = entries;
        filteredEntries = [...entries];
        
        // Järjestä merkinnät päivämäärän mukaan (uusimmat ensin)
        sortEntries();
        
        // Näytä merkinnät
        displayEntries();
    } catch (error) {
        console.error('Virhe merkintöjen hakemisessa:', error);
        showToast('Merkintöjen hakeminen epäonnistui', 'error');
        entriesList.innerHTML = '<p>Merkintöjen hakeminen epäonnistui.</p>';
    }
}

// Järjestä merkinnät
function sortEntries() {
    filteredEntries.sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));
}

// Näytä merkinnät
function displayEntries() {
    if (!entriesList) return;

    // Päivitä merkintöjen kokonaismäärä
    if (entriesCount) {
        entriesCount.textContent = `(${filteredEntries.length})`;
    }

    if (filteredEntries.length === 0) {
        entriesList.innerHTML = '<p>Ei merkintöjä.</p>';
        if (pagination) pagination.innerHTML = '';
        return;
    }

    // Laske sivutus
    const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    // Hae sivun merkinnät
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    const pageEntries = filteredEntries.slice(startIndex, endIndex);

    // Renderöi merkinnät
    entriesList.innerHTML = pageEntries.map(entry => `
        <div class="entry-card" data-id="${entry.entry_id}">
            <div class="entry-date">${formatDate(entry.entry_date)}</div>
            <div class="entry-mood">${entry.mood}</div>
            <div class="entry-meta">
                ${entry.weight ? `
                <div class="entry-meta-item">
                    <span class="entry-meta-icon">⚖️</span>
                    <span>${entry.weight} kg</span>
                </div>` : ''}
                ${entry.sleep_hours ? `
                <div class="entry-meta-item">
                    <span class="entry-meta-icon">💤</span>
                    <span>${entry.sleep_hours} h</span>
                </div>` : ''}
            </div>
            <div class="entry-notes">${entry.notes || 'Ei muistiinpanoja'}</div>
            <div class="entry-actions">
                <button class="btn edit-entry-btn" data-id="${entry.entry_id}">Muokkaa</button>
            </div>
        </div>
    `).join('');

    // Lisää click-tapahtuma merkinnöille
    document.querySelectorAll('.edit-entry-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const entryId = button.dataset.id;
            openEntryModal(entryId);
        });
    });

    // Päivitä sivutus
    updatePagination(totalPages);
}

// Päivitä sivutus
function updatePagination(totalPages) {
    if (!pagination) return;

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // Edellinen-nappi
    paginationHTML += `
        <button class="pagination-btn prev-btn" ${currentPage === 1 ? 'disabled' : ''}>
            &lt;
        </button>
    `;

    // Sivunumerot
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 || 
            i === totalPages || 
            (i >= currentPage - 1 && i <= currentPage + 1)
        ) {
            paginationHTML += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `;
        } else if (
            i === currentPage - 2 || 
            i === currentPage + 2
        ) {
            paginationHTML += '<span class="pagination-ellipsis">...</span>';
        }
    }

    // Seuraava-nappi
    paginationHTML += `
        <button class="pagination-btn next-btn" ${currentPage === totalPages ? 'disabled' : ''}>
            &gt;
        </button>
    `;

    pagination.innerHTML = paginationHTML;

    // Lisää click-tapahtumat sivutusnapeille
    document.querySelectorAll('.pagination-btn').forEach(button => {
        if (button.classList.contains('prev-btn')) {
            button.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    displayEntries();
                }
            });
        } else if (button.classList.contains('next-btn')) {
            button.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    displayEntries();
                }
            });
        } else {
            button.addEventListener('click', () => {
                currentPage = parseInt(button.dataset.page);
                displayEntries();
            });
        }
    });
}

// Suodata merkinnät
function filterEntries() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const fromDate = dateFrom.value ? new Date(dateFrom.value) : null;
    const toDate = dateTo.value ? new Date(dateTo.value) : null;

    // Jos kaikki suodattimet ovat tyhjiä, näytä kaikki merkinnät
    if (!searchTerm && !fromDate && !toDate) {
        filteredEntries = [...allEntries];
        currentPage = 1;
        sortEntries();
        displayEntries();
        return;
    }

    // Suodata merkinnät
    filteredEntries = allEntries.filter(entry => {
        const entryDate = new Date(entry.entry_date);
        
        // Tarkista päivämääräväli
        if (fromDate && entryDate < fromDate) return false;
        if (toDate) {
            const nextDay = new Date(toDate);
            nextDay.setDate(nextDay.getDate() + 1);
            if (entryDate >= nextDay) return false;
        }
        
        // Tarkista hakusana
        if (searchTerm) {
            const matchesMood = entry.mood && entry.mood.toLowerCase().includes(searchTerm);
            const matchesNotes = entry.notes && entry.notes.toLowerCase().includes(searchTerm);
            
            if (!matchesMood && !matchesNotes) return false;
        }
        
        return true;
    });
    
    // Järjestä ja näytä suodatetut merkinnät
    currentPage = 1;
    sortEntries();
    displayEntries();
}

// Tyhjennä suodattimet
function clearFilters() {
    searchInput.value = '';
    dateFrom.value = '';
    dateTo.value = '';
    
    filteredEntries = [...allEntries];
    currentPage = 1;
    sortEntries();
    displayEntries();
}

// Avaa uuden merkinnän lisäysmodaali
function openNewEntryModal() {
    modalTitle.textContent = 'Lisää uusi merkintä';
    document.getElementById('entry-id').value = '';
    document.getElementById('modal-entry-date').value = formatDateForInput(new Date());
    document.getElementById('modal-entry-mood').value = '';
    document.getElementById('modal-entry-weight').value = '';
    document.getElementById('modal-entry-sleep').value = '';
    document.getElementById('modal-entry-notes').value = '';

    modalMoodSlider.value = 5;
    modalMoodValue.textContent = 5;
    modalMoodInput.value = 5;
    updateMoodColor(5, modalMoodValue);
    
    deleteEntryBtn.style.display = 'none';
    currentEntryId = null;
    
    entryModal.classList.add('show');
}

// Avaa merkinnän muokkausmodaali
async function openEntryModal(entryId) {
    try {
        modalTitle.textContent = 'Muokkaa merkintää';
        
        const entry = await getEntryById(entryId);

        const moodValue = entry.mood || 5;
        modalMoodSlider.value = moodValue;
        modalMoodValue.textContent = moodValue;
        modalMoodInput.value = moodValue;
        updateMoodColor(moodValue, modalMoodValue);
        
        document.getElementById('entry-id').value = entry.entry_id;
        document.getElementById('modal-entry-date').value = formatDateForInput(entry.entry_date);
        document.getElementById('modal-entry-mood').value = entry.mood || '';
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
    // Hae merkinnät
    fetchAllEntries();
    
    // Lisää tapahtumankäsittelijät
    if (searchBtn) {
        searchBtn.addEventListener('click', filterEntries);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                filterEntries();
            }
        });
    }
    
    if (filterBtn) {
        filterBtn.addEventListener('click', filterEntries);
    }
    
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', clearFilters);
    }
    
    if (addEntryBtn) {
        addEntryBtn.addEventListener('click', openNewEntryModal);
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

// Mieliala sliderin toiminnallisuus
const modalMoodSlider = document.getElementById('modal-entry-mood-slider');
const modalMoodValue = document.getElementById('modal-mood-value');
const modalMoodInput = document.getElementById('modal-entry-mood');

if (modalMoodSlider && modalMoodValue && modalMoodInput) {
    modalMoodSlider.addEventListener('input', function() {
        const value = this.value;
        modalMoodValue.textContent = value;
        modalMoodInput.value = value;
        
        // Päivitä väri
        updateMoodColor(value, modalMoodValue);
    });
    
    // Aseta alkuarvo
    updateMoodColor(modalMoodSlider.value, modalMoodValue);
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