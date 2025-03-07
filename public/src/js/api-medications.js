// API-toiminnot lääkityksille
import { fetchData } from './api.js';

// Hae kaikki lääkitykset
export async function getMedications() {
  return await fetchData('/medications');
}

// Hae lääkitys ID:n perusteella
export async function getMedicationById(medicationId) {
  return await fetchData(`/medications/${medicationId}`);
}

// Lisää uusi lääkitys
export async function addMedication(medicationData) {
  return await fetchData('/medications', {
    method: 'POST',
    body: JSON.stringify(medicationData)
  });
}

// Päivitä lääkitys
export async function updateMedication(medicationId, medicationData) {
  return await fetchData(`/medications/${medicationId}`, {
    method: 'PUT',
    body: JSON.stringify(medicationData)
  });
}

// Poista lääkitys
export async function deleteMedication(medicationId) {
  return await fetchData(`/medications/${medicationId}`, {
    method: 'DELETE'
  });
}

// Hae aktiiviset lääkitykset (joilla ei ole loppupäivää tai loppupäivä on tulevaisuudessa)
export async function getActiveMedications() {
  return await fetchData('/medications/active');
}