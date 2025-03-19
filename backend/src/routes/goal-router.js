import express from 'express';
import { body } from 'express-validator';
import {
  getGoals,
  getGoalById,
  createGoal,
  updateGoalById,
  deleteGoalById,
  completeGoalById
} from '../controllers/goal-controller.js';
import { authenticateToken } from '../middlewares/authentication.js';
import { validationErrorHandler } from '../middlewares/error-handler.js';

const goalRouter = express.Router();

// GET /api/goals - Get all goals for the logged-in user
// POST /api/goals - Create a new goal
goalRouter
  .route('/')
  .get(authenticateToken, getGoals)
  .post(
    authenticateToken,
    [
      // Validation rules
      body('title').notEmpty().withMessage('Title is required'),
      body('type').notEmpty().withMessage('Type is required'),
      body('start_date').notEmpty().withMessage('Start date is required'),
      body('end_date').notEmpty().withMessage('End date is required'),
      body('target_value').optional().isNumeric().withMessage('Target value must be a number'),
      body('start_value').optional().isNumeric().withMessage('Start value must be a number')
    ],
    validationErrorHandler,
    createGoal
  );

// GET /api/goals/:id - Get a goal by ID
// PUT /api/goals/:id - Update a goal
// DELETE /api/goals/:id - Delete a goal
goalRouter
  .route('/:id')
  .get(authenticateToken, getGoalById)
  .put(
    authenticateToken,
    [
      // Validation rules for updating
      body('title').optional().notEmpty().withMessage('Title cannot be empty'),
      body('type').optional().notEmpty().withMessage('Type cannot be empty'),
      body('start_date').optional().notEmpty().withMessage('Start date cannot be empty'),
      body('end_date').optional().notEmpty().withMessage('End date cannot be empty'),
      body('target_value').optional().isNumeric().withMessage('Target value must be a number'),
      body('start_value').optional().isNumeric().withMessage('Start value must be a number'),
      body('completed').optional().isBoolean().withMessage('Completed must be a boolean')
    ],
    validationErrorHandler,
    updateGoalById
  )
  .delete(authenticateToken, deleteGoalById);

// POST /api/goals/:id/complete - Mark a goal as completed
goalRouter
  .route('/:id/complete')
  .post(
    authenticateToken,
    [
      body('completed_date').optional().isString().withMessage('Completed date must be a valid date string')
    ],
    validationErrorHandler,
    completeGoalById
  );

export default goalRouter;