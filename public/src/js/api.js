// API-toiminnallisuudet

// API:n perus-URL
const API_URL = 'http://localhost:3000/api';

// Apufunktio fetch-kutsujen tekemiseen
async function fetchData(endpoint, options = {}) {
    try {
        console.log(`Tehdään API-kutsu: ${API_URL}${endpoint}`);
        
        // Lisätään authorization header, jos token on olemassa
        const token = localStorage.getItem('token');
        if (token) {
            options.headers = {
                ...options.headers,
                'Authorization': `Bearer ${token}`
            };
        }

        // Lisätään content-type header, jos ei ole määritelty ja body on olemassa
        if (options.body && !options.headers?.['Content-Type']) {
            options.headers = {
                ...options.headers,
                'Content-Type': 'application/json'
            };
        }

        console.log('Fetch options:', options);
        const response = await fetch(`${API_URL}${endpoint}`, options);
        
        // Jos vastaus ei ole OK (200-299), heitetään virhe
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                message: `HTTP virhe! status: ${response.status}`
            }));
            console.error('API-vastaus ei ole OK:', response.status, errorData);
            throw new Error(errorData.message || `HTTP virhe! status: ${response.status}`);
        }

        // Palautetaan vastaus JSON-muodossa
        const data = await response.json();
        console.log('API vastasi onnistuneesti:', data);
        return data;
    } catch (error) {
        console.error('Fetch-virhe:', error.message);
        
        // Tarkista, onko virhe CORS-ongelma tai palvelin ei ole käynnissä
        if (error.message.includes('Failed to fetch') || 
            error.message.includes('NetworkError') || 
            error.message.includes('Network request failed')) {
            throw new Error('Palvelimeen ei saada yhteyttä. Varmista, että backend-palvelin on käynnissä osoitteessa ' + API_URL);
        }
        
        throw error;
    }
}

// Kirjautuminen
async function login(username, password) {
    try {
        console.log('Yritetään kirjautua sisään käyttäjänä:', username);
        const data = await fetchData('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        // Tallennetaan token ja käyttäjätiedot localStorageen
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        return data;
    } catch (error) {
        console.error('Kirjautumisvirhe:', error.message);
        throw error;
    }
}

// Rekisteröityminen
async function register(username, email, password) {
    try {
        console.log('Yritetään rekisteröidä käyttäjä:', username);
        return await fetchData('/users', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
    } catch (error) {
        console.error('Rekisteröitymisvirhe:', error.message);
        throw error;
    }
}

// Hae käyttäjän tiedot
async function getUserInfo() {
    return await fetchData('/auth/me');
}

// Päivitä käyttäjän tiedot
async function updateUserInfo(userId, userData) {
    return await fetchData(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
    });
}

// Poista käyttäjätili
async function deleteAccount(userId) {
    return await fetchData(`/users/${userId}`, {
        method: 'DELETE'
    });
}

// Hae merkinnät
async function getEntries() {
    return await fetchData('/entries');
}

// Hae merkintä ID:n perusteella
async function getEntryById(entryId) {
    return await fetchData(`/entries/${entryId}`);
}

// Lisää uusi merkintä
async function addEntry(entryData) {
    return await fetchData('/entries', {
        method: 'POST',
        body: JSON.stringify(entryData)
    });
}

// Päivitä merkintä
async function updateEntry(entryId, entryData) {
    return await fetchData(`/entries/${entryId}`, {
        method: 'PUT',
        body: JSON.stringify(entryData)
    });
}

// Poista merkintä
async function deleteEntry(entryId) {
    return await fetchData(`/entries/${entryId}`, {
        method: 'DELETE'
    });
}

// **Lisätty apigoal-funktiot**

// Hae kaikki tavoitteet
async function getGoals() {
    return await fetchData('/goals');
}

// Hae tavoite ID:n perusteella
async function getGoalById(goalId) {
    return await fetchData(`/goals/${goalId}`);
}

// Lisää uusi tavoite
async function addGoal(goalData) {
    return await fetchData('/goals', {
        method: 'POST',
        body: JSON.stringify(goalData)
    });
}

// Päivitä tavoite
async function updateGoal(goalId, goalData) {
    return await fetchData(`/goals/${goalId}`, {
        method: 'PUT',
        body: JSON.stringify(goalData)
    });
}

// Poista tavoite
async function deleteGoal(goalId) {
    return await fetchData(`/goals/${goalId}`, {
        method: 'DELETE'
    });
}

// Merkitse tavoite valmiiksi
async function completeGoal(goalId, completedDate) {
    return await fetchData(`/goals/${goalId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ completed_date: completedDate })
    });
}

// Vie kaikki funktiot moduuleina
export {
    login,
    register,
    getUserInfo,
    updateUserInfo,
    deleteAccount,
    getEntries,
    getEntryById,
    addEntry,
    updateEntry,
    deleteEntry,
    getGoals,
    getGoalById,
    addGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    fetchData
};
