import { insertEntry, selectEntryById, updateEntry, deleteEntry, selectEntriesByUserId } from '../models/entry-model.js';

/**
 * Get all entries of the logged-in user
 */
const getEntries = async (req, res, next) => {
  try {
    const entries = await selectEntriesByUserId(req.user.user_id);
    res.json(entries);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a diary entry by ID
 */
const getEntryById = async (req, res, next) => {
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
    next(error);
  }
};

/**
 * Edit a diary entry by ID
 */
const editEntry = async (req, res, next) => {
  console.log('editEntry request body', req.body);

  const { entry_date, mood, weight, sleep_hours, notes } = req.body;
  const entryId = req.params.id;

  if (!entry_date && !mood && !weight && !sleep_hours && !notes) {
    return res.status(400).json({ message: 'At least one field is required to update the entry.' });
  }

  try {
    const entry = await selectEntryById(entryId);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    if (entry.user_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedEntry = {
      entry_date: entry_date ?? entry.entry_date,
      mood: mood ?? entry.mood,
      weight: weight ?? entry.weight,
      sleep_hours: sleep_hours ?? entry.sleep_hours,
      notes: notes ?? entry.notes,
    };

    const result = await updateEntry(entryId, updatedEntry);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'No changes made to the entry.' });
    }

    res.status(200).json({ message: 'Entry updated successfully.', updatedEntry });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a diary entry by ID
 */
const deleteDiaryEntry = async (req, res, next) => {
  console.log('deleteDiaryEntry', req.params.id);

  try {
    const entry = await selectEntryById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    if (parseInt(entry.user_id) !== parseInt(req.user.user_id)) {
      console.log('Access denied - user is not the entry owner');
      return res.status(403).json({ message: 'Access denied - can only delete own entries' });
    }

    await deleteEntry(req.params.id);
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new diary entry
 */
const postEntry = async (req, res, next) => {
  try {
    console.log("Request body:", req.body);

    const newEntry = {
      user_id: req.user.user_id,
      entry_date: req.body.entry_date,
      mood: req.body.mood,
      weight: req.body.weight,
      sleep_hours: req.body.sleep_hours,
      notes: req.body.notes,
    };

    if (!newEntry.entry_date) {
      return res.status(400).json({ message: 'entry_date is required' });
    }

    const result = await insertEntry(newEntry);

    res.status(201).json({
      message: "Entry added.",
      entry_id: result,
    });
  } catch (error) {
    next(error);
  }
};

export { postEntry, getEntries, getEntryById, editEntry, deleteDiaryEntry };
