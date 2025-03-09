import promisePool from '../utils/database.js';

/**
 * Fetch all userdata except passwords from database
 * @returns
 */
const selectAllUsers = async () => {
  const [rows] = await promisePool.query(
    'SELECT user_id, username, email, created_at, user_level FROM Users',
  );
  console.log('selectAllUsers result', rows);
  return rows;
};

/**
 * Fetch user by id
 * using prepared statement (recommended way)
 * example of error handling
 * @param {number} userId id of the user
 * @returns {object} user found or undefined if not
 */
const selectUserById = async (userId) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT user_id, username, email, created_at, user_level FROM Users WHERE user_id=?',
      [userId],
    );
    console.log(rows);
    // return only first item of the result array
    return rows[0];
  } catch (error) {
    console.error(error);
    throw new Error('database error');
  }
};

/**
 * User registration
 * @param {*} user
 * @returns
 */
const insertUser = async (user) => {
  try {
    const [result] = await promisePool.query(
      'INSERT INTO Users (username, password, email) VALUES (?, ?, ?)',
      [user.username, user.password, user.email],
    );
    console.log('insertUser', result);
    // return only first item of the result array
    return result.insertId;
  } catch (error) {
    console.error(error);
    throw new Error('database error');
  }
};

/**
 * 
 * @param {*} username
 * @param {*} password
 * @returns
 */
const selectUserByNameAndPassword = async (username, password) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT user_id, username, email, created_at, user_level FROM Users WHERE username=? AND password=?',
      [username, password],
    );
    console.log(rows);
    // return only first item of the result array
    return rows[0];
  } catch (error) {
    console.error(error);
    throw new Error('database error');
  }
};

const selectUserByUsername = async (username) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT user_id, username, password, email, created_at, user_level FROM Users WHERE username=?',
      [username],
    );
    console.log(rows);
    // return only first item of the result array
    return rows[0];
  } catch (error) {
    console.error(error);
    throw new Error('database error');
  }
};

const updateUserById = async (userId, userData) => {
  try {
    const updates = [];
    const values = [];
    
    if (userData.username) {
      updates.push('username = ?');
      values.push(userData.username);
    }
    
    if (userData.email) {
      updates.push('email = ?');
      values.push(userData.email);
    }
    
    if (userData.password) {
      updates.push('password = ?');
      values.push(userData.password);
    }
    
    values.push(userId);
    
    const query = `
      UPDATE Users 
      SET ${updates.join(', ')} 
      WHERE user_id = ?
    `;
    
    const [result] = await promisePool.query(query, values);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error in updateUser:', error);
    throw new Error('Database error while updating user');
  }
};

const deleteUserById = async (userId) => {
  try {
    const [result] = await promisePool.query(
      'DELETE FROM Users WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error in deleteUser:', error);
    throw new Error('Database error while deleting user');
  }
};


export {deleteUserById, updateUserById, selectUserByUsername, selectAllUsers, selectUserById, insertUser, selectUserByNameAndPassword};