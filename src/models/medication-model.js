import promisePool from '../utils/database.js';

/**
 * Format date values for SQL queries
 * @param {string|Date} dateValue - The date to format
 * @returns {string|null} Formatted date or null
 */
const formatDateForSQL = (dateValue) => {
  if (!dateValue) return null;
  
  // If it's already a Date object, format it
  if (dateValue instanceof Date) {
    return dateValue.toISOString().split('T')[0];
  }
  
  // If it's a string but not in ISO format, convert it
  if (typeof dateValue === 'string' && !dateValue.includes('T')) {
    // Simple date validation regex (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(dateValue)) {
      return dateValue;
    }
    
    // Try to parse the date and format it
    try {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      console.error('Error parsing date:', e);
    }
  }
  
  // If it's already in ISO format, extract just the date part
  if (typeof dateValue === 'string' && dateValue.includes('T')) {
    return dateValue.split('T')[0];
  }
  
  // Return original value if no formatting needed
  return dateValue;
};

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
    console.log(`Fetching medication with ID: ${medicationId}`);
    const [rows] = await promisePool.query(
      'SELECT * FROM Medications WHERE medication_id = ?',
      [medicationId]
    );
    console.log('Medication query result:', rows.length > 0 ? 'Found' : 'Not found');
    return rows[0] || null; // Return one medication or null if not found
  } catch (error) {
    console.error(`Error fetching medication ${medicationId}:`, error);
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
    console.log(`Fetching medications for user ID: ${userId}`);
    const [rows] = await promisePool.query(
      'SELECT * FROM Medications WHERE user_id = ? ORDER BY start_date DESC',
      [userId]
    );
    console.log(`Found ${rows.length} medications for user ${userId}`);
    return rows;
  } catch (error) {
    console.error(`Error fetching medications for user ${userId}:`, error);
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
    console.log('Inserting new medication:', medication);
    
    // Format dates
    const formattedStartDate = formatDateForSQL(medication.start_date);
    const formattedEndDate = formatDateForSQL(medication.end_date);
    
    console.log('Formatted dates:', {
      start_date: formattedStartDate,
      end_date: formattedEndDate
    });
    
    const [result] = await promisePool.query(
      `INSERT INTO Medications (
        user_id, name, dosage, frequency, 
        start_date, end_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        medication.user_id, 
        medication.name, 
        medication.dosage, 
        medication.frequency,
        formattedStartDate, 
        formattedEndDate, 
        medication.notes
      ]
    );
    console.log('insertMedication result:', result);
    return result.insertId;
  } catch (error) {
    console.error('Error inserting medication:', error);
    throw new Error(`Database error: ${error.message}`);
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
    console.log(`Updating medication ${medicationId}:`, updatedMedication);
    
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
      values.push(formatDateForSQL(updatedMedication.start_date));
    }
    if (updatedMedication.end_date !== undefined) {
      fields.push('end_date = ?');
      values.push(formatDateForSQL(updatedMedication.end_date));
    } else if ('end_date' in updatedMedication && updatedMedication.end_date === null) {
      // Handle explicit null value for end_date
      fields.push('end_date = NULL');
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
    console.log('Update query:', query);
    console.log('Update values:', values);

    const [result] = await promisePool.query(query, values);

    if (result.affectedRows === 0) {
      throw new Error('No medication found with the given ID');
    }

    console.log('updateMedication result:', result);
    return result;
  } catch (error) {
    console.error(`Error updating medication ${medicationId}:`, error);
    throw new Error(`Database error: ${error.message}`);
  }
};

/**
 * Delete a medication from the database
 * @param {number} medicationId The id of the medication to delete
 * @returns {Promise<Object>} The result of the delete operation
 */
const deleteMedication = async (medicationId) => {
  try {
    console.log(`Deleting medication with ID: ${medicationId}`);
    const [result] = await promisePool.query(
      'DELETE FROM Medications WHERE medication_id = ?',
      [medicationId]
    );

    if (result.affectedRows === 0) {
      throw new Error('No medication found with the given ID');
    }

    console.log('deleteMedication result:', result);
    return result;
  } catch (error) {
    console.error(`Error deleting medication ${medicationId}:`, error);
    throw new Error(`Database error: ${error.message}`);
  }
};

/**
 * Get active medications (no end date or end date is in the future)
 * @param {number} userId The id of the user
 * @returns {Promise<Object[]>} The list of active medications
 */
const selectActiveMedications = async (userId) => {
  try {
    console.log(`Fetching active medications for user ID: ${userId}`);
    const [rows] = await promisePool.query(
      `SELECT * FROM Medications 
       WHERE user_id = ? 
       AND (end_date IS NULL OR end_date >= CURDATE())
       ORDER BY name ASC`,
      [userId]
    );
    console.log(`Found ${rows.length} active medications for user ${userId}`);
    return rows;
  } catch (error) {
    console.error(`Error fetching active medications for user ${userId}:`, error);
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