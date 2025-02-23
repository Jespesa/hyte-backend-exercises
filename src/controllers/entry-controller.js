import { insertEntry, selectEntryById, updateEntry, deleteEntry, selectEntriesByUserId } from '../models/entry-model.js';

/**
 * Get all entries of the logged in user
 * @param {*} req
 * @param {*} res
 */
const getEntries = async (req, res) => {
  const entries = await selectEntriesByUserId(req.user.user_id);
  res.json(entries);
};


// Päiväkirjamerkinnän haku id:n perusteella
const getEntryById = async (req, res) => {
  console.log('getEntryById', req.params.id);

  try {
    const entry = await selectEntryById(req.params.id);
    console.log('Entry found:', entry);
    if (entry) {
      res.json(entry);
    } else {
      res.status(404).json({ message: 'Entry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Päiväkirjamerkinnän muokkaus id:n perusteella
const editEntry = async (req, res) => {
  console.log('editEntry request body', req.body);
  
  const { entry_date, mood, weight, sleep_hours, notes } = req.body;
  const entryId = req.params.id;

  // Varmista, että vähintään yksi kenttä on annettu päivitettäväksi
  if (!entry_date && !mood && !weight && !sleep_hours && !notes) {
    return res.status(400).json({ message: 'At least one field is required to update the entry.' });
  }

  try {
    const entry = await selectEntryById(entryId);

    // Tarkista, että merkintä on olemassa
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    // Tarkista, että käyttäjällä on oikeus muokata merkintää
    if (entry.user_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Luo uusi päivitysobjekti vain annetuista kentistä
    const updatedEntry = {
      entry_date: entry_date ?? entry.entry_date,
      mood: mood ?? entry.mood,
      weight: weight ?? entry.weight,
      sleep_hours: sleep_hours ?? entry.sleep_hours,
      notes: notes ?? entry.notes,
    };

    // Suorita päivitys
    const result = await updateEntry(entryId, updatedEntry);

    // Tarkista, vaikuttiko päivitys tietokantaan
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'No changes made to the entry.' });
    }

    res.status(200).json({ message: 'Entry updated successfully.', updatedEntry });

  } catch (error) {
    console.error('editEntry error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



// Päiväkirjamerkinnän poisto id:n perusteella
const deleteDiaryEntry = async (req, res) => {
  console.log('deleteDiaryEntry', req.params.id);

  try {
    const entry = await selectEntryById(req.params.id);
    
    // Check if entry exists
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    
    // Check if the logged-in user is the owner of the entry
    if (parseInt(entry.user_id) !== parseInt(req.user.user_id)) {
      console.log('Access denied - user is not the entry owner');
      return res.status(403).json({ message: 'Access denied - can only delete own entries' });
    }

    // If checks pass, delete the entry
    await deleteEntry(req.params.id);
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error in deleteDiaryEntry:', error);
    res.status(500).json({ message: error.message });
  }
};

const postEntry = async (req, res) => {
  try {
    console.log("Request body:", req.body); // DEBUG
    
    const newEntry = {
      user_id: req.user.user_id,
      entry_date: req.body.entry_date,
      mood: req.body.mood,
      weight: req.body.weight,
      sleep_hours: req.body.sleep_hours,
      notes: req.body.notes
    };

    if (!newEntry.entry_date) {
      return res.status(400).json({ message: 'entry_date is required' });
    }

    const result = await insertEntry(newEntry);
    
    res.status(201).json({
      message: "Entry added.",
      entry_id: result
    });
  } catch (error) {
    console.error('Error in postEntry:', error);
    res.status(500).json({ message: error.message });
  }
};

 
export {postEntry, getEntries, getEntryById, editEntry, deleteDiaryEntry };
