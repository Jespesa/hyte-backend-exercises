// API-toiminnot lääkityksille
import { fetchData } from './api.js';

// Hae kaikki lääkitykset
export async function getMedications() {
  try {
    console.log('Fetching all medications');
    const data = await fetchData('/medications');
    console.log(`Received ${data.length} medications`);
    return data;
  } catch (error) {
    console.error('Error fetching medications:', error);
    // Fallback to empty array if server fails
    return [];
  }
}

// Hae lääkitys ID:n perusteella
export async function getMedicationById(medicationId) {
  try {
    console.log(`Fetching medication with ID: ${medicationId}`);
    const data = await fetchData(`/medications/${medicationId}`);
    console.log('Medication data received:', data);
    return data;
  } catch (error) {
    console.error(`Error fetching medication ${medicationId}:`, error);
    throw new Error(`Failed to fetch medication: ${error.message}`);
  }
}

// Lisää uusi lääkitys
export async function addMedication(medicationData) {
  try {
    console.log('Adding new medication:', medicationData);
    const data = await fetchData('/medications', {
      method: 'POST',
      body: JSON.stringify(medicationData)
    });
    console.log('Medication added successfully:', data);
    return data;
  } catch (error) {
    console.error('Error adding medication:', error);
    throw new Error(`Failed to add medication: ${error.message}`);
  }
}

// Päivitä lääkitys
export async function updateMedication(medicationId, medicationData) {
  try {
    console.log(`Updating medication ${medicationId}:`, medicationData);
    
    // Ensure dates are in the correct format
    if (medicationData.start_date && !(medicationData.start_date instanceof Date) && !medicationData.start_date.includes('T')) {
      medicationData.start_date = medicationData.start_date + 'T00:00:00.000Z';
    }
    
    if (medicationData.end_date && !(medicationData.end_date instanceof Date) && !medicationData.end_date.includes('T')) {
      medicationData.end_date = medicationData.end_date + 'T00:00:00.000Z';
    }
    
    const data = await fetchData(`/medications/${medicationId}`, {
      method: 'PUT',
      body: JSON.stringify(medicationData)
    });
    console.log('Medication updated successfully:', data);
    return data;
  } catch (error) {
    console.error(`Error updating medication ${medicationId}:`, error);
    throw new Error(`Failed to update medication: ${error.message}`);
  }
}

// Poista lääkitys
export async function deleteMedication(medicationId) {
  try {
    console.log(`Deleting medication: ${medicationId}`);
    const data = await fetchData(`/medications/${medicationId}`, {
      method: 'DELETE'
    });
    console.log('Medication deleted successfully:', data);
    return data;
  } catch (error) {
    console.error(`Error deleting medication ${medicationId}:`, error);
    throw new Error(`Failed to delete medication: ${error.message}`);
  }
}

// Hae aktiiviset lääkitykset
export async function getActiveMedications() {
  try {
    console.log('Fetching active medications');
    const data = await fetchData('/medications/active');
    console.log(`Received ${data.length} active medications`);
    return data;
  } catch (error) {
    console.error('Error fetching active medications:', error);
    // Fallback to empty array if server fails
    return [];
  }
}