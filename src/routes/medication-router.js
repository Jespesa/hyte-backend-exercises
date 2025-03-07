import express from 'express';
import { body } from 'express-validator';
import {
  getMedications,
  getMedicationById,
  createMedication,
  updateMedicationById,
  deleteMedicationById,
  getActiveMedications
} from '../controllers/medication-controller.js';
import { authenticateToken } from '../middlewares/authentication.js';
import { validationErrorHandler } from '../middlewares/error-handler.js';

const medicationRouter = express.Router();

// GET /api/medications - Get all medications for the logged-in user
// POST /api/medications - Create a new medication
medicationRouter
  .route('/')
  .get(authenticateToken, getMedications)
  .post(
    authenticateToken,
    [
      // Validation rules
      body('name').notEmpty().withMessage('Name is required'),
      body('start_date').notEmpty().withMessage('Start date is required'),
      body('dosage').optional().isString().withMessage('Dosage must be a string'),
      body('frequency').optional().isString().withMessage('Frequency must be a string')
    ],
    validationErrorHandler,
    createMedication
  );

// GET /api/medications/active - Get active medications for the logged-in user
medicationRouter
  .route('/active')
  .get(authenticateToken, getActiveMedications);

// GET /api/medications/:id - Get a medication by ID
// PUT /api/medications/:id - Update a medication
// DELETE /api/medications/:id - Delete a medication
medicationRouter
  .route('/:id')
  .get(authenticateToken, getMedicationById)
  .put(
    authenticateToken,
    [
      // Validation rules for updating
      body('name').optional().notEmpty().withMessage('Name cannot be empty'),
      body('start_date').optional().notEmpty().withMessage('Start date cannot be empty'),
      body('dosage').optional().isString().withMessage('Dosage must be a string'),
      body('frequency').optional().isString().withMessage('Frequency must be a string')
    ],
    validationErrorHandler,
    updateMedicationById
  )
  .delete(authenticateToken, deleteMedicationById);

export default medicationRouter;