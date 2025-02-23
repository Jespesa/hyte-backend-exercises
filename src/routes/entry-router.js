import express from 'express';
import {
  postEntry,
  getEntries,
  getEntryById,
  editEntry,
  deleteDiaryEntry
} from '../controllers/entry-controller.js';
import {authenticateToken} from '../middlewares/authentication.js';

const entryRouter = express.Router();

// post to /api/entries
entryRouter
  .route('/')
  .post(authenticateToken, postEntry)
  .get(authenticateToken, getEntries);

// routes for /api/entries/:id
entryRouter
  .route('/:id')
  .get(authenticateToken, getEntryById)
  .put(authenticateToken, editEntry)
  .delete(authenticateToken, deleteDiaryEntry);

export default entryRouter;