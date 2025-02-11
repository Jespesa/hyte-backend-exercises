import express from 'express';
import {
  addEntry,
  deleteDiaryEntry,
  editEntry,
  getEntryById,
  getEntries,
} from '../controllers/entry-controller.js';

const entryRouter = express.Router();

// all routes to /api/entries
entryRouter.route('/')
  .get(getEntries)        // Get all diary entries
  .post(addEntry);        // Add a new diary entry

// all routes to /api/entries/:id
entryRouter.route('/:id')
  .get(getEntryById)      // Get a specific diary entry by ID
  .put(editEntry)         // Edit an existing diary entry
  .delete(deleteDiaryEntry);  // Delete a specific diary entry

export default entryRouter;
