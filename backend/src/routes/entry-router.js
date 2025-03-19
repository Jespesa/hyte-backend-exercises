import express from 'express';
import { body } from 'express-validator';
import {
  postEntry,
  getEntries,
  getEntryById,
  editEntry,
  deleteDiaryEntry
} from '../controllers/entry-controller.js';
import { authenticateToken } from '../middlewares/authentication.js';
import { validationErrorHandler } from '../middlewares/error-handler.js';

const entryRouter = express.Router();

// POST and GET /api/entries
entryRouter
  .route('/')
  .post(
    authenticateToken,
    body('mood').notEmpty().withMessage('Mood is required'),
    body('entry_date').notEmpty().withMessage('Entry date is required'),
    body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
    body('sleep_hours').optional().isFloat({ min: 0, max: 24 }).withMessage('Sleep hours must be between 0 and 24'),
    body('notes').optional().isString().isLength({ max: 500 }).withMessage('Notes must be a maximum of 500 characters'),
    validationErrorHandler,
    postEntry
  )
  .get(authenticateToken, getEntries);

// PUT, GET, DELETE /api/entries/:id
entryRouter
  .route('/:id')
  .get(authenticateToken, getEntryById)
  .put(
    authenticateToken,
    body('mood').optional().notEmpty().withMessage('Mood cannot be empty'),
    body('entry_date').optional().notEmpty().withMessage('Entry date cannot be empty'),
    body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
    body('sleep_hours').optional().isFloat({ min: 0, max: 24 }).withMessage('Sleep hours must be between 0 and 24'),
    body('notes').optional().isString().isLength({ max: 500 }).withMessage('Notes must be a maximum of 500 characters'),
    validationErrorHandler,
    editEntry
  )
  .delete(authenticateToken, deleteDiaryEntry);

export default entryRouter;
