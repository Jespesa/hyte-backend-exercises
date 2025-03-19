import {
    selectGoalsByUserId,
    selectGoalById,
    insertGoal,
    updateGoal,
    deleteGoal,
    completeGoal
  } from '../models/goal-model.js';
  
  /**
   * Get all goals for the logged-in user
   */
  const getGoals = async (req, res, next) => {
    try {
      const goals = await selectGoalsByUserId(req.user.user_id);
      res.json(goals);
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get a goal by ID
   */
  const getGoalById = async (req, res, next) => {
    try {
      const goal = await selectGoalById(req.params.id);
      
      if (!goal) {
        return res.status(404).json({ message: 'Goal not found' });
      }
      
      // Check if the goal belongs to the logged-in user
      if (goal.user_id !== req.user.user_id) {
        return res.status(403).json({ message: 'Access denied - can only view own goals' });
      }
      
      res.json(goal);
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Create a new goal
   */
  const createGoal = async (req, res, next) => {
    try {
      // Prepare the goal data
      const goalData = {
        user_id: req.user.user_id,
        title: req.body.title,
        type: req.body.type,
        description: req.body.description || null,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        target_value: req.body.target_value || null,
        start_value: req.body.start_value || null,
        target_direction: req.body.target_direction || null,
        unit: req.body.unit || null,
        completed: req.body.completed || false
      };
      
      // Insert the goal
      const goalId = await insertGoal(goalData);
      
      res.status(201).json({
        message: 'Goal created successfully',
        goal_id: goalId
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Update a goal
   */
  const updateGoalById = async (req, res, next) => {
    try {
      const goalId = req.params.id;
      
      // First check if the goal exists and belongs to the user
      const goal = await selectGoalById(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: 'Goal not found' });
      }
      
      if (goal.user_id !== req.user.user_id) {
        return res.status(403).json({ message: 'Access denied - can only update own goals' });
      }
      
      // Prepare the goal data for update
      const updatedGoalData = {
        title: req.body.title,
        type: req.body.type,
        description: req.body.description,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        target_value: req.body.target_value,
        start_value: req.body.start_value,
        target_direction: req.body.target_direction,
        unit: req.body.unit,
        completed: req.body.completed,
        completed_date: req.body.completed_date
      };
      
      // Remove undefined fields
      Object.keys(updatedGoalData).forEach(key => 
        updatedGoalData[key] === undefined && delete updatedGoalData[key]
      );
      
      // Update the goal
      await updateGoal(goalId, updatedGoalData);
      
      res.json({
        message: 'Goal updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Delete a goal
   */
  const deleteGoalById = async (req, res, next) => {
    try {
      const goalId = req.params.id;
      
      // First check if the goal exists and belongs to the user
      const goal = await selectGoalById(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: 'Goal not found' });
      }
      
      if (goal.user_id !== req.user.user_id) {
        return res.status(403).json({ message: 'Access denied - can only delete own goals' });
      }
      
      // Delete the goal
      await deleteGoal(goalId);
      
      res.json({
        message: 'Goal deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Mark a goal as completed
   */
  const completeGoalById = async (req, res, next) => {
    try {
      const goalId = req.params.id;
      
      // First check if the goal exists and belongs to the user
      const goal = await selectGoalById(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: 'Goal not found' });
      }
      
      if (goal.user_id !== req.user.user_id) {
        return res.status(403).json({ message: 'Access denied - can only complete own goals' });
      }
      
      // Mark the goal as completed
      await completeGoal(goalId, req.body.completed_date || new Date());
      
      res.json({
        message: 'Goal marked as completed'
      });
    } catch (error) {
      next(error);
    }
  };
  
  export {
    getGoals,
    getGoalById,
    createGoal,
    updateGoalById,
    deleteGoalById,
    completeGoalById
  };