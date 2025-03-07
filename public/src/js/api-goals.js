// API functions for Goals 

import { fetchData } from './api.js';

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

// Vie funktiot moduuleina
export {
  getGoals,
  getGoalById,
  addGoal,
  updateGoal,
  deleteGoal,
  completeGoal
};