import promisePool from '../utils/database.js';

/**
 * Fetch all goals from the database
 * @returns {Promise<Object[]>} The list of goals
 */
const selectAllGoals = async () => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM Goals'
    );
    console.log('selectAllGoals result', rows);
    return rows;
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  }
};

/**
 * Fetch a goal by goal_id
 * @param {number} goalId The id of the goal
 * @returns {Object} The goal
 */
const selectGoalById = async (goalId) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM Goals WHERE goal_id = ?',
      [goalId]
    );
    return rows[0] || null; // Return one goal or null if not found
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  }
};

/**
 * Fetch all goals by user_id
 * @param {number} userId The id of the user
 * @returns {Object[]} The goals for the user
 */
const selectGoalsByUserId = async (userId) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM Goals WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    console.log('selectGoalsByUserId result', rows);
    return rows;
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  }
};

/**
 * Insert a new goal into the database
 * @param {Object} goal The goal data
 * @returns {number} The id of the inserted goal
 */
const insertGoal = async (goal) => {
  try {
    const [result] = await promisePool.query(
      `INSERT INTO Goals (
        user_id, title, type, description, 
        start_date, end_date, target_value, start_value,
        target_direction, unit, completed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        goal.user_id, goal.title, goal.type, goal.description,
        goal.start_date, goal.end_date, goal.target_value, goal.start_value,
        goal.target_direction, goal.unit, goal.completed || false
      ]
    );
    console.log('insertGoal result', result);
    return result.insertId;
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  }
};

/**
 * Update an existing goal in the database
 * @param {number} goalId The id of the goal to update
 * @param {Object} updatedGoal The updated goal data
 * @returns {Promise<Object>} The result of the update operation
 */
const updateGoal = async (goalId, updatedGoal) => {
  try {
    // Build the query dynamically based on provided fields
    const fields = [];
    const values = [];

    // Add each provided field to the query
    if (updatedGoal.title !== undefined) {
      fields.push('title = ?');
      values.push(updatedGoal.title);
    }
    if (updatedGoal.type !== undefined) {
      fields.push('type = ?');
      values.push(updatedGoal.type);
    }
    if (updatedGoal.description !== undefined) {
      fields.push('description = ?');
      values.push(updatedGoal.description);
    }
    if (updatedGoal.start_date !== undefined) {
      fields.push('start_date = ?');
      values.push(updatedGoal.start_date);
    }
    if (updatedGoal.end_date !== undefined) {
      fields.push('end_date = ?');
      values.push(updatedGoal.end_date);
    }
    if (updatedGoal.target_value !== undefined) {
      fields.push('target_value = ?');
      values.push(updatedGoal.target_value);
    }
    if (updatedGoal.start_value !== undefined) {
      fields.push('start_value = ?');
      values.push(updatedGoal.start_value);
    }
    if (updatedGoal.target_direction !== undefined) {
      fields.push('target_direction = ?');
      values.push(updatedGoal.target_direction);
    }
    if (updatedGoal.unit !== undefined) {
      fields.push('unit = ?');
      values.push(updatedGoal.unit);
    }
    if (updatedGoal.completed !== undefined) {
      fields.push('completed = ?');
      values.push(updatedGoal.completed);
    }
    if (updatedGoal.completed_date !== undefined) {
      fields.push('completed_date = ?');
      values.push(updatedGoal.completed_date);
    }

    // If no fields were provided, return error
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    // Add the goal ID at the end of the values array for the WHERE clause
    values.push(goalId);

    // Build the final query
    const query = `UPDATE Goals SET ${fields.join(', ')} WHERE goal_id = ?`;

    const [result] = await promisePool.query(query, values);

    if (result.affectedRows === 0) {
      throw new Error('No goal found with the given ID');
    }

    console.log('updateGoal result', result);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  }
};

/**
 * Delete a goal from the database
 * @param {number} goalId The id of the goal to delete
 * @returns {Promise<Object>} The result of the delete operation
 */
const deleteGoal = async (goalId) => {
  try {
    const [result] = await promisePool.query(
      'DELETE FROM Goals WHERE goal_id = ?',
      [goalId]
    );

    if (result.affectedRows === 0) {
      throw new Error('No goal found with the given ID');
    }

    console.log('deleteGoal result', result);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  }
};

/**
 * Mark a goal as completed
 * @param {number} goalId The id of the goal to mark as completed
 * @param {Date} completedDate The date when the goal was completed
 * @returns {Promise<Object>} The result of the update operation
 */
const completeGoal = async (goalId, completedDate = new Date()) => {
  try {
    const [result] = await promisePool.query(
      'UPDATE Goals SET completed = TRUE, completed_date = ? WHERE goal_id = ?',
      [completedDate, goalId]
    );

    if (result.affectedRows === 0) {
      throw new Error('No goal found with the given ID');
    }

    console.log('completeGoal result', result);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  }
};

export {
  selectAllGoals,
  selectGoalById,
  selectGoalsByUserId,
  insertGoal,
  updateGoal,
  deleteGoal,
  completeGoal
};