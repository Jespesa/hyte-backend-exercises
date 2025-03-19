// API-toiminnot liikuntamerkinnöille

// Koska backend-API ei vielä tue liikuntatoimintoja,
// käytämme väliaikaisesti localStorage-tallennusta

// Apufunktiot localStorage käsittelyyn
const EXERCISES_STORAGE_KEY = 'health_diary_exercises';

// Lue kaikki liikuntamerkinnät localStoragesta
function getExercisesFromStorage() {
  const exercisesJson = localStorage.getItem(EXERCISES_STORAGE_KEY);
  return exercisesJson ? JSON.parse(exercisesJson) : [];
}

// Tallenna liikuntamerkinnät localStorageen
function saveExercisesToStorage(exercises) {
  localStorage.setItem(EXERCISES_STORAGE_KEY, JSON.stringify(exercises));
}

// Generoi uniikki ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Hae kaikki liikuntamerkinnät
export async function getExercises() {
  try {
    // Tässä haettaisiin liikuntamerkinnät API:sta kun sellainen on olemassa
    // Väliaikaisesti käytämme localStoragea
    return getExercisesFromStorage();
  } catch (error) {
    console.error('Virhe liikuntamerkintöjen hakemisessa:', error);
    throw error;
  }
}

// Hae liikuntamerkintä ID:n perusteella
export async function getExerciseById(exerciseId) {
  try {
    const exercises = getExercisesFromStorage();
    return exercises.find(ex => ex.id === exerciseId);
  } catch (error) {
    console.error('Virhe liikuntamerkinnän hakemisessa:', error);
    throw error;
  }
}

// Lisää uusi liikuntamerkintä
export async function addExercise(exerciseData) {
  try {
    const exercises = getExercisesFromStorage();
    
    // Lisää ID ja käyttäjä-ID
    const newExercise = {
      ...exerciseData,
      id: generateId(),
      user_id: JSON.parse(localStorage.getItem('user')).user_id,
      created_at: new Date().toISOString()
    };
    
    exercises.push(newExercise);
    saveExercisesToStorage(exercises);
    
    return newExercise;
  } catch (error) {
    console.error('Virhe liikuntamerkinnän lisäämisessä:', error);
    throw error;
  }
}

// Päivitä liikuntamerkintä
export async function updateExercise(exerciseId, exerciseData) {
  try {
    const exercises = getExercisesFromStorage();
    const index = exercises.findIndex(ex => ex.id === exerciseId);
    
    if (index === -1) {
      throw new Error('Liikuntamerkintää ei löydy');
    }
    
    // Päivitä vain muokatut kentät
    exercises[index] = {
      ...exercises[index],
      ...exerciseData,
      updated_at: new Date().toISOString()
    };
    
    saveExercisesToStorage(exercises);
    return exercises[index];
  } catch (error) {
    console.error('Virhe liikuntamerkinnän päivittämisessä:', error);
    throw error;
  }
}

// Poista liikuntamerkintä
export async function deleteExercise(exerciseId) {
  try {
    const exercises = getExercisesFromStorage();
    const newExercises = exercises.filter(ex => ex.id !== exerciseId);
    
    if (exercises.length === newExercises.length) {
      throw new Error('Liikuntamerkintää ei löydy');
    }
    
    saveExercisesToStorage(newExercises);
    return { success: true };
  } catch (error) {
    console.error('Virhe liikuntamerkinnän poistamisessa:', error);
    throw error;
  }
}

// Hae liikuntamerkinnät tietyltä aikaväliltä
export async function getExercisesByDateRange(startDate, endDate) {
  try {
    const exercises = getExercisesFromStorage();
    
    return exercises.filter(ex => {
      const exerciseDate = new Date(ex.date);
      return (!startDate || exerciseDate >= new Date(startDate)) &&
             (!endDate || exerciseDate <= new Date(endDate));
    });
  } catch (error) {
    console.error('Virhe liikuntamerkintöjen hakemisessa aikavälin perusteella:', error);
    throw error;
  }
}

// Hae liikuntamerkintöjen yhteenveto
export async function getExerciseSummary() {
  try {
    const exercises = getExercisesFromStorage();
    
    // Jos ei ole merkintöjä, palauta tyhjä yhteenveto
    if (exercises.length === 0) {
      return {
        totalExercises: 0,
        totalDuration: 0,
        exercisesByType: {},
        exercisesByIntensity: {}
      };
    }
    
    // Laske yhteenvetotiedot
    const totalExercises = exercises.length;
    const totalDuration = exercises.reduce((sum, ex) => sum + (ex.duration || 0), 0);
    
    // Ryhmittele liikunnat tyypin mukaan
    const exercisesByType = exercises.reduce((acc, ex) => {
      const type = ex.type || 'Muu';
      if (!acc[type]) acc[type] = 0;
      acc[type]++;
      return acc;
    }, {});
    
    // Ryhmittele liikunnat intensiteetin mukaan
    const exercisesByIntensity = exercises.reduce((acc, ex) => {
      const intensity = ex.intensity || 'Ei määritelty';
      if (!acc[intensity]) acc[intensity] = 0;
      acc[intensity]++;
      return acc;
    }, {});
    
    return {
      totalExercises,
      totalDuration,
      exercisesByType,
      exercisesByIntensity
    };
  } catch (error) {
    console.error('Virhe liikuntamerkintöjen yhteenvedon hakemisessa:', error);
    throw error;
  }
}