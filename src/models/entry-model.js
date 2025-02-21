import promisePool from '../utils/database.js';

/**
 * Fetch all diary entries from the database
 * @returns {Promise<Object[]>} The list of diary entries
 */
const selectAllEntries = async () => {
  try {
    const [rows] = await promisePool.query(
      'SELECT entry_id, user_id, entry_date, mood, weight, sleep_hours, notes, created_at FROM DiaryEntries'
    );
    console.log('selectAllEntries result', rows);
    return rows;
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  }
};

/**
 * Fetch a diary entry by id
 * @param {number} entryId The id of the entry
 * @returns {Object} The diary entry
 */
const selectEntriesByUserId = async (userId) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM DiaryEntries WHERE user_id=?',
      [userId],
    );
    console.log(rows);
    return rows;
  } catch (error) {
    console.error(error);
    throw new Error('database error');
  }
};

/**
 * Insert a new diary entry into the database
 * @param {Object} entry The diary entry data
 * @returns {number} The id of the inserted entry
 */
const insertEntry = async (entry) => {
  try {
    const [result] = await promisePool.query(
      'INSERT INTO DiaryEntries (user_id, entry_date, mood, weight, sleep_hours, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [entry.user_id, entry.entry_date, entry.mood, entry.weight, entry.sleep_hours, entry.notes]
    );
    console.log('insertEntry result', result);
    return result.insertId;
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  }
};

/**
 * Update an existing diary entry in the database
 * @param {number} entryId The id of the entry to update
 * @param {Object} updatedEntry The updated diary entry data
 * @returns {Promise<void>}
 */
const updateEntry = async (entryId, updatedEntry) => {
  try {
    await promisePool.query(
      'UPDATE DiaryEntries SET entry_date = ?, mood = ?, weight = ?, sleep_hours = ?, notes = ? WHERE entry_id = ?',
      [
        updatedEntry.entry_date,
        updatedEntry.mood,
        updatedEntry.weight,
        updatedEntry.sleep_hours,
        updatedEntry.notes,
        entryId,
      ]
    );
    console.log('updateEntry result', entryId);
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  }
};

/**
 * Delete a diary entry from the database
 * @param {number} entryId The id of the entry to delete
 * @returns {Promise<void>}
 */
const deleteEntry = async (entryId) => {
  try {
    await promisePool.query(
      'DELETE FROM DiaryEntries WHERE entry_id = ?',
      [entryId]
    );
    console.log('deleteEntry result', entryId);
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  }
};


export {selectAllEntries, selectEntriesByUserId, insertEntry, updateEntry, deleteEntry };
