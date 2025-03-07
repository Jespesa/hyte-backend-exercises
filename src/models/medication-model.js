import promisePool from '../utils/database.js';

/**
 * Fetch all medications from the database
 * @returns {Promise<Object[]>} The list of medications
 */
const selectAllMedications = async () => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM Medications'
    );
    console.log('selectAllMedications result', rows);
    return rows;
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  }
};

/**
 * Fetch a medication by medication_id
 * @param {number} medicationId The id of the medication
 * @returns {Object} The medication
 */
const selectMedicationById = async (medicationId) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM Medications WHERE medication_id = ?',
      [medicationId]
    );
    return rows[0] || null; // Return one medication or null if not found
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  }
};

/**
 * Fetch all medications by user_id
 * @param {number} userId The id of the user
 * @returns {Object[]} The medications for the user
 */
const selectMedicationsByUserId = async (userId) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM Medications WHERE user_id = ? ORDER BY start_date DESC',
      [userId]
    );
    console.log('selectMedicationsByUserId result', rows);
    return rows;
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  }
};

/**
 * Insert a new medication into the database
 * @param {Object} medication The medication data
 * @returns {number} The id of the inserted medication
 */
const insertMedication = async (medication) => {
  try {
    const [result] = await promisePool.query(
      `INSERT INTO Medications (
        user_id, name, dosage, frequency, 
        start_date, end_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        medication.user_id, medication.name, medication.dosage, medication.frequency,
        medication.start_date, medication.end_date, medication.notes
      ]
    );
    console.log('insertMedication result', result);
    return result.insertId;
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  }
};

/**
 * Update an existing medication in the database
 * @param {number} medicationId The id of the medication to update
 * @param {Object} updatedMedication The updated medication data
 * @returns {Promise<Object>} The result of the update operation
 */
const updateMedication = async (medicationId, updatedMedication) => {
  try {
    // Build the query dynamically based on provided fields
    const fields = [];
    const values = [];

    // Add each provided field to the query
    if (updatedMedication.name !== undefined) {
      fields.push('name = ?');
      values.push(updatedMedication.name);
    }
    if (updatedMedication.dosage !== undefined) {
      fields.push('dosage = ?');
      values.push(updatedMedication.dosage);
    }
    if (updatedMedication.frequency !== undefined) {
      fields.push('frequency = ?');
      values.push(updatedMedication.frequency);
    }
    if (updatedMedication.start_date !== undefined) {
      fields.push('start_date = ?');
      values.push(updatedMedication.start_date);
    }
    if (updatedMedication.end_date !== undefined) {
      fields.push('end_date = ?');
      values.push(updatedMedication.end_date);
    }
    if (updatedMedication.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updatedMedication.notes);
    }

    // If no fields were provided, return error
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    // Add the medication ID at the end of the values array for the WHERE clause
    values.push(medicationId);

    // Build the final query
    const query = `UPDATE Medications SET ${fields.join(', ')} WHERE medication_id = ?`;

    const [result] = await promisePool.query(query, values);

    if (result.affectedRows === 0) {
      throw new Error('No medication found with the given ID');
    }

    console.log('updateMedication result', result);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  }
};

/**
 * Delete a medication from the database
 * @param {number} medicationId The id of the medication to delete
 * @returns {Promise<Object>} The result of the delete operation
 */
const deleteMedication = async (medicationId) => {
  try {
    const [result] = await promisePool.query(
      'DELETE FROM Medications WHERE medication_id = ?',
      [medicationId]
    );

    if (result.affectedRows === 0) {
      throw new Error('No medication found with the given ID');
    }

    console.log('deleteMedication result', result);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  }
};

/**
 * Get active medications (no end date or end date is in the future)
 * @param {number} userId The id of the user
 * @returns {Promise<Object[]>} The list of active medications
 */
const selectActiveMedications = async (userId) => {
  try {
    const [rows] = await promisePool.query(
      `SELECT * FROM Medications 
       WHERE user_id = ? 
       AND (end_date IS NULL OR end_date >= CURDATE())
       ORDER BY name ASC`,
      [userId]
    );
    console.log('selectActiveMedications result', rows);
    return rows;
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  }
};

export {
  selectAllMedications,
  selectMedicationById,
  selectMedicationsByUserId,
  insertMedication,
  updateMedication,
  deleteMedication,
  selectActiveMedications
};