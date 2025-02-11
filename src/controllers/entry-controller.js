import { insertEntry, selectAllEntries, selectEntryById, updateEntry, deleteEntry } from '../models/entry-model.js';

// kaikkien päiväkirjamerkintöjen haku
const getEntries = async (req, res) => {
  try {
    const entries = await selectAllEntries();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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
      if (entry) {
        const updatedEntry = {
          title: title || entry.title,
          content: content || entry.content,
          date: date || entry.date,
        };
        await updateEntry(req.params.id, updatedEntry);
        res.json({ message: 'Entry updated.' });
      } else {
        res.status(404).json({ message: 'Entry not found' });
      }
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
    if (entry) {
      await deleteEntry(req.params.id);  // correctly calling the imported deleteEntry model function
      res.json({ message: 'Entry deleted.' });
    } else {
      res.status(404).json({ message: 'Entry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getEntries, getEntryById, addEntry, editEntry, deleteDiaryEntry };
