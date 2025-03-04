// API-toiminnot lääkityksille

// Koska backend-API ei vielä tue lääkitystoimintoja,
// käytämme väliaikaisesti localStorage-tallennusta

// Apufunktiot localStorage käsittelyyn
const MEDICATIONS_STORAGE_KEY = 'health_diary_medications';

// Lue kaikki lääkitykset localStoragesta
function getMedicationsFromStorage() {
  const medicationsJson = localStorage.getItem(MEDICATIONS_STORAGE_KEY);
  return medicationsJson ? JSON.parse(medicationsJson) : [];
}

// Tallenna lääkitykset localStorageen
function saveMedicationsToStorage(medications) {
  localStorage.setItem(MEDICATIONS_STORAGE_KEY, JSON.stringify(medications));
}

// Generoi uniikki ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Hae kaikki lääkitykset
export async function getMedications() {
  try {
    // Tässä haettaisiin lääkitykset API:sta kun sellainen on olemassa
    // Väliaikaisesti käytämme localStoragea
    return getMedicationsFromStorage();
  } catch (error) {
    console.error('Virhe lääkitysten hakemisessa:', error);
    throw error;
  }
}

// Hae lääkitys ID:n perusteella
export async function getMedicationById(medicationId) {
  try {
    const medications = getMedicationsFromStorage();
    return medications.find(med => med.id === medicationId);
  } catch (error) {
    console.error('Virhe lääkityksen hakemisessa:', error);
    throw error;
  }
}

// Lisää uusi lääkitys
export async function addMedication(medicationData) {
  try {
    const medications = getMedicationsFromStorage();
    
    // Lisää ID ja käyttäjä-ID
    const newMedication = {
      ...medicationData,
      id: generateId(),
      user_id: JSON.parse(localStorage.getItem('user')).user_id,
      created_at: new Date().toISOString()
    };
    
    medications.push(newMedication);
    saveMedicationsToStorage(medications);
    
    return newMedication;
  } catch (error) {
    console.error('Virhe lääkityksen lisäämisessä:', error);
    throw error;
  }
}

// Päivitä lääkitys
export async function updateMedication(medicationId, medicationData) {
  try {
    const medications = getMedicationsFromStorage();
    const index = medications.findIndex(med => med.id === medicationId);
    
    if (index === -1) {
      throw new Error('Lääkitystä ei löydy');
    }
    
    // Päivitä vain muokatut kentät
    medications[index] = {
      ...medications[index],
      ...medicationData,
      updated_at: new Date().toISOString()
    };
    
    saveMedicationsToStorage(medications);
    return medications[index];
  } catch (error) {
    console.error('Virhe lääkityksen päivittämisessä:', error);
    throw error;
  }
}

// Poista lääkitys
export async function deleteMedication(medicationId) {
  try {
    const medications = getMedicationsFromStorage();
    const newMedications = medications.filter(med => med.id !== medicationId);
    
    if (medications.length === newMedications.length) {
      throw new Error('Lääkitystä ei löydy');
    }
    
    saveMedicationsToStorage(newMedications);
    return { success: true };
  } catch (error) {
    console.error('Virhe lääkityksen poistamisessa:', error);
    throw error;
  }
}

// Hae aktiiviset lääkitykset (joilla ei ole loppupäivää tai loppupäivä on tulevaisuudessa)
export async function getActiveMedications() {
  try {
    const medications = getMedicationsFromStorage();
    const now = new Date();
    
    return medications.filter(med => {
      // Jos loppupäivää ei ole, lääkitys on aktiivinen
      if (!med.end_date) return true;
      
      // Jos loppupäivä on tulevaisuudessa, lääkitys on aktiivinen
      const endDate = new Date(med.end_date);
      return endDate >= now;
    });
  } catch (error) {
    console.error('Virhe aktiivisten lääkitysten hakemisessa:', error);
    throw error;
  }
}