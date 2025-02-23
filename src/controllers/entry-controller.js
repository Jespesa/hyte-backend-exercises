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

// Päiväkirjamerkinnän lisäys
const addEntry = async (req, res) => {
  console.log('addEntry request body', req.body);
  const { title, content, date, userId } = req.body;

  if (title && content && date && userId) {
    const newEntry = { title, content, date, userId };
    try {
      const result = await insertEntry(newEntry);
      res.status(201).json({ message: 'Entry added. id: ' + result });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(400).json({
      message: 'Request should have title, content, date, and userId properties.',
    });
  }
};

// Päiväkirjamerkinnän muokkaus id:n perusteella
const editEntry = async (req, res) => {
  console.log('editEntry request body', req.body);
  const { title, content, date } = req.body;

  if (title || content || date) {
    try {
      const entry = await selectEntryById(req.params.id);
      // Tarkista että merkintä on olemassa ja kuuluu kirjautuneelle käyttäjälle
      if (!entry) {
        return res.status(404).json({ message: 'Entry not found' });
      }
      if (entry.user_id !== req.user.user_id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updatedEntry = {
        title: title || entry.title,
        content: content || entry.content,
        date: date || entry.date,
      };
      await updateEntry(req.params.id, updatedEntry);
      res.json({ message: 'Entry updated.' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(400).json({ message: 'At least one field is required to update the entry.' });
  }
};

// Päiväkirjamerkinnän poisto id:n perusteella
const deleteDiaryEntry = async (req, res) => {
  console.log('deleteDiaryEntry', req.params.id);

  try {
    const entry = await selectEntryById(req.params.id);
    // Tarkista että merkintä on olemassa ja kuuluu kirjautuneelle käyttäjälle
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    if (entry.user_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await deleteEntry(req.params.id);
    res.json({ message: 'Entry deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const postEntry = async (req, res) => {
  // user_id, entry_date, mood, weight, sleep_hours, notes
  // TODO: add try-catch
  const newEntry = req.body;
  newEntry.user_id = req.user.user_id;
  insertEntry(newEntry);
  res.status(201).json({message: "Entry added."});
};

 
export {postEntry, getEntries, getEntryById, addEntry, editEntry, deleteDiaryEntry };
